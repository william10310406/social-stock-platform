import os
from datetime import timedelta
from urllib.parse import quote_plus

from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
# Load .env file from project root
load_dotenv(os.path.join(basedir, "..", "..", ".env"))


class Config:
    # Security
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"
    FERNET_KEY = os.environ.get("FERNET_KEY")

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Redis
    REDIS_URL = os.environ.get("REDIS_URL") or "redis://localhost:6379/0"

    # JWT Configuration
    JWT_SECRET_KEY = SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 86400))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        seconds=int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRES", 2592000))
    )

    # Flask Environment
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")
    DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"

    # Logging
    LOG_DIR = os.path.join(basedir, "..", "logs")
    LOG_FILE = os.path.join(LOG_DIR, "app.log")

    # API Keys (for future use)
    STOCK_API_KEY = os.environ.get("STOCK_API_KEY")
    NEWS_API_KEY = os.environ.get("NEWS_API_KEY")

    # Email Configuration (for future use)
    MAIL_SERVER = os.environ.get("MAIL_SERVER")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "1") == "1"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")


class DevelopmentConfig(Config):
    DEBUG = True


class DevelopmentMSSQLConfig(Config):
    DEBUG = True
    # MSSQL specific configuration
    SQLALCHEMY_DATABASE_URI = (
        f"mssql+pyodbc://{os.environ.get('MSSQL_USER', 'sa')}:"
        f"{os.environ.get('MSSQL_SA_PASSWORD')}@"
        f"{os.environ.get('MSSQL_HOST', 'localhost')}:"
        f"{os.environ.get('MSSQL_PORT', '1433')}/"
        f"{os.environ.get('MSSQL_DATABASE', 'StockInsight')}"
        f"?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
    )


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class DualDatabaseConfig(Config):
    """雙資料庫配置 - 冷熱數據分離"""
    DEBUG = True
    
    # 主資料庫 (熱資料庫 - MSSQL)
    SQLALCHEMY_DATABASE_URI = (
        f"mssql+pyodbc://{os.environ.get('MSSQL_USER', 'sa')}:"
        f"{quote_plus(os.environ.get('MSSQL_SA_PASSWORD', ''))}@"
        f"{os.environ.get('MSSQL_HOST', 'localhost')}:"
        f"{os.environ.get('MSSQL_PORT', '1433')}/"
        f"{os.environ.get('MSSQL_HOT_DATABASE', 'StockInsight_Hot')}"
        f"?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
    )
    
    # 數據庫綁定配置
    SQLALCHEMY_BINDS = {
        'hot': SQLALCHEMY_DATABASE_URI,  # 熱資料庫
        'cold': (
            f"postgresql://{os.environ.get('POSTGRES_USER', 'postgres')}:"
            f"{quote_plus(os.environ.get('POSTGRES_PASSWORD', ''))}@"
            f"{os.environ.get('POSTGRES_HOST', 'localhost')}:"
            f"{os.environ.get('POSTGRES_PORT', '5432')}/"
            f"{os.environ.get('POSTGRES_COLD_DATABASE', 'StockInsight_Cold')}"
        )
    }
    
    # 連接池配置
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': int(os.environ.get('HOT_DB_POOL_SIZE', 20)),
        'max_overflow': int(os.environ.get('HOT_DB_MAX_OVERFLOW', 30)),
        'pool_timeout': 30,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'echo': os.environ.get('SQLALCHEMY_ECHO', 'false').lower() == 'true'
    }
    
    # 綁定特定配置
    SQLALCHEMY_BINDS_ENGINE_OPTIONS = {
        'cold': {
            'pool_size': int(os.environ.get('COLD_DB_POOL_SIZE', 10)),
            'max_overflow': int(os.environ.get('COLD_DB_MAX_OVERFLOW', 20)),
            'pool_timeout': 60,
            'pool_recycle': 7200,
            'pool_pre_ping': True,
            'echo': os.environ.get('SQLALCHEMY_ECHO', 'false').lower() == 'true'
        }
    }
    
    # 雙資料庫特有配置
    DUAL_DATABASE_ENABLED = os.environ.get('DUAL_DATABASE_ENABLED', 'true').lower() == 'true'
    ARCHIVAL_ENABLED = os.environ.get('ARCHIVAL_ENABLED', 'true').lower() == 'true'
    ARCHIVAL_CUTOFF_DAYS = int(os.environ.get('ARCHIVAL_CUTOFF_DAYS', 30))
    ARCHIVAL_BATCH_SIZE = int(os.environ.get('ARCHIVAL_BATCH_SIZE', 1000))
    
    # 性能監控配置
    MONITORING_ENABLED = os.environ.get('MONITORING_ENABLED', 'true').lower() == 'true'
    PERFORMANCE_THRESHOLD_MS = int(os.environ.get('PERFORMANCE_THRESHOLD_MS', 100))
    HOT_DB_PERFORMANCE_TARGET = int(os.environ.get('HOT_DB_PERFORMANCE_TARGET', 50))
    COLD_DB_QUERY_TIMEOUT = int(os.environ.get('COLD_DB_QUERY_TIMEOUT', 300))


config = {
    "development": DevelopmentConfig,
    "development_mssql": DevelopmentMSSQLConfig,
    "dual_database": DualDatabaseConfig,  # 新增雙資料庫配置
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
