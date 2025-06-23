import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler

from flask import Blueprint, Flask
from flask_cors import CORS
from flask_migrate import Migrate

from .blueprints.auth import auth_bp
from .blueprints.chat import chat_bp
from .blueprints.friends import friends_bp
from .blueprints.news import news_bp
from .blueprints.posts import posts_bp
from .blueprints.stocks import stocks_bp

# from .models import User, Post # Temporarily import only existing models
from .config import config
from .extensions import db, limiter, socketio
from .models import Comment, Conversation, Message, News, Post, Stock, StockPrice, User, UserStock

migrate = Migrate()


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'default')
    
    config_class = config.get(config_name)
    if not config_class:
        raise ValueError(f"Unknown configuration: {config_name}")
    
    print(f"🚀 Loading configuration: {config_name} ({config_class.__name__})")
    print(f"🔧 DUAL_DATABASE_ENABLED: {os.environ.get('DUAL_DATABASE_ENABLED', 'Not set')}")
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS for all routes
    CORS(
        app,
        origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://0.0.0.0:5173",  # Docker 容器訪問
            "http://stock-insight-frontend:5173",  # 容器間通信
        ],
        supports_credentials=True,
    )

    # Initialize extensions
    db.init_app(app)
    limiter.init_app(app)
    socketio.init_app(
        app,
        cors_allowed_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://0.0.0.0:5173",
            "*",  # 允許所有來源（開發環境）
        ],
        async_mode="threading",  # 使用 threading 模式，更兼容
        logger=True,  # 啟用 Socket.IO 日誌
        engineio_logger=True,  # 啟用 Engine.IO 日誌
        ping_timeout=60,
        ping_interval=25,
    )

    # 添加調試信息
    print(f"🔧 Flask-SocketIO 配置完成")
    print(f"📡 使用 async_mode: threading")
    print(f"🔌 Socket.IO 服務已初始化")
    migrate.init_app(app, db)

    # Register blueprints with a common prefix
    api_bp = Blueprint("api", __name__, url_prefix="/api")
    api_bp.register_blueprint(auth_bp, url_prefix="/auth")
    api_bp.register_blueprint(posts_bp, url_prefix="/posts")
    api_bp.register_blueprint(news_bp, url_prefix="/news")
    api_bp.register_blueprint(stocks_bp, url_prefix="/stocks")
    api_bp.register_blueprint(friends_bp, url_prefix="/friends")
    api_bp.register_blueprint(chat_bp, url_prefix="/chat")
    app.register_blueprint(api_bp)

    # Configure logging
    if not os.path.exists(app.config["LOG_DIR"]):
        os.makedirs(app.config["LOG_DIR"])

    file_handler = RotatingFileHandler(app.config["LOG_FILE"], maxBytes=10240, backupCount=10)
    file_handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]")
    )
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)

    app.logger.setLevel(logging.INFO)
    app.logger.info("Stock Insight Platform startup")

    # SocketIO 事件處理器在各個藍圖中定義
    # 全局事件由 chat 藍圖處理

    @app.route("/")
    def index():
        return "Welcome to the Stock Insight Platform!"

    @app.route("/health")
    @app.route("/api/health")
    def health_check():
        """Application health check endpoint"""
        try:
            from datetime import datetime

            database_status = "unknown"
            services = {}
            
            # Test database connection (non-blocking)
            try:
                from sqlalchemy import text
                with db.engine.connect() as connection:
                    connection.execute(text("SELECT 1"))
                database_status = "connected"
                services["database"] = "ok"
            except Exception as db_e:
                app.logger.warning(f"Database not available: {db_e}")
                database_status = "disconnected"
                services["database"] = "unavailable"

            # Basic health check - app is running
            return {
                "status": "healthy",  # App is healthy even if DB is down
                "timestamp": datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "database": database_status,
                "services": services,
            }, 200

        except Exception as e:
            app.logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
            }, 503

    return app
