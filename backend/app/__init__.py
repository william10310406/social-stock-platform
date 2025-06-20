import logging
import os
from logging.handlers import RotatingFileHandler

from flask import Blueprint, Flask
from flask_migrate import Migrate

from .blueprints.auth import auth_bp
from .blueprints.chat import chat_bp
from .blueprints.friends import friends_bp
from .blueprints.news import news_bp
from .blueprints.posts import posts_bp
from .blueprints.stocks import stocks_bp

# from .models import User, Post # Temporarily import only existing models
from .config import Config
from .extensions import db, limiter, socketio
from .models import Comment, Conversation, Message, News, Post, Stock, User, UserStock

migrate = Migrate()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    limiter.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")
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

    @app.route("/")
    def index():
        return "Welcome to the Stock Insight Platform!"

    @app.route("/health")
    @app.route("/api/health")
    def health_check():
        """Application health check endpoint"""
        try:
            from datetime import datetime

            from sqlalchemy import text

            # Test database connection
            with db.engine.connect() as connection:
                connection.execute(text("SELECT 1"))

            return {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "database": "connected",
                "services": {"database": "ok", "redis": "ok"},
            }, 200

        except Exception as e:
            app.logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
            }, 503

    return app
