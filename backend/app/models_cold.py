"""
冷資料庫模型定義 - PostgreSQL 專用
使用數據庫適配器處理與 MSSQL 的語法差異
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Date, BigInteger, Boolean, ForeignKey, UniqueConstraint, text
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import relationship

from .extensions import db
from .database_adapter import ModelFieldAdapter, create_cross_db_compatible_model


@create_cross_db_compatible_model()
class MessageArchive(db.Model):
    """聊天記錄歷史檔案 - 冷資料庫"""
    __bind_key__ = 'cold'
    __tablename__ = 'messages_archive'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    original_id = Column(Integer, nullable=False, index=True)  # 原始熱庫ID
    conversation_id = Column(Integer, nullable=False, index=True)
    sender_id = Column(Integer, nullable=False, index=True)
    
    # 使用 PostgreSQL 專用的文本類型
    content = Column(postgresql.TEXT(), nullable=False)
    
    # 使用適配器創建日期時間欄位
    created_at = ModelFieldAdapter.create_datetime_field('cold', nullable=False)
    archived_at = ModelFieldAdapter.create_datetime_field('cold', nullable=False)
    
    # 添加索引以提高查詢性能
    __table_args__ = (
        db.Index('idx_messages_archive_conversation_date', 'conversation_id', 'created_at'),
        db.Index('idx_messages_archive_sender_date', 'sender_id', 'created_at'),
    )
    
    def to_dict(self):
        return {
            'id': self.original_id,  # 返回原始ID保持一致性
            'conversation_id': self.conversation_id,
            'sender_id': self.sender_id,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'from_archive': True
        }


@create_cross_db_compatible_model()
class PostArchive(db.Model):
    """貼文歷史檔案 - 冷資料庫"""
    __bind_key__ = 'cold'
    __tablename__ = 'posts_archive'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    original_id = Column(Integer, nullable=False, index=True)
    author_id = Column(Integer, nullable=False, index=True)
    
    # PostgreSQL 專用字符串類型
    title = Column(postgresql.VARCHAR(200), nullable=False)
    body = Column(postgresql.TEXT(), nullable=False)
    
    created_at = ModelFieldAdapter.create_datetime_field('cold', nullable=False)
    archived_at = ModelFieldAdapter.create_datetime_field('cold', nullable=False)
    
    __table_args__ = (
        db.Index('idx_posts_archive_author_date', 'author_id', 'created_at'),
        db.Index('idx_posts_archive_date', 'created_at'),
    )
    
    def to_dict(self):
        return {
            'id': self.original_id,
            'author_id': self.author_id,
            'title': self.title,
            'body': self.body,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'from_archive': True
        }


@create_cross_db_compatible_model()
class StockPriceHistory(db.Model):
    """股價歷史數據 - 冷資料庫"""
    __bind_key__ = 'cold'
    __tablename__ = 'stock_prices_history'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    original_id = Column(Integer, nullable=False, index=True)
    stock_id = Column(Integer, nullable=False, index=True)
    trade_date = Column(Date, nullable=False, index=True)
    
    # PostgreSQL 專用數值類型
    open_price = Column(postgresql.NUMERIC(10, 2))
    high_price = Column(postgresql.NUMERIC(10, 2))
    low_price = Column(postgresql.NUMERIC(10, 2))
    close_price = Column(postgresql.NUMERIC(10, 2))
    change_amount = Column(postgresql.NUMERIC(10, 2))
    
    volume = Column(BigInteger)
    turnover = Column(BigInteger)
    transaction_count = Column(Integer)
    
    created_at = ModelFieldAdapter.create_datetime_field('cold', nullable=False)
    archived_at = ModelFieldAdapter.create_datetime_field('cold', nullable=False)
    
    # 唯一約束和索引
    __table_args__ = (
        UniqueConstraint('stock_id', 'trade_date', name='uq_stock_date_archive'),
        db.Index('idx_stock_prices_history_stock_date', 'stock_id', 'trade_date'),
        db.Index('idx_stock_prices_history_date', 'trade_date'),
        # 暫時移除函數索引，避免 IMMUTABLE 錯誤
    )
    
    def to_dict(self):
        return {
            'id': self.original_id,
            'stock_id': self.stock_id,
            'trade_date': self.trade_date.isoformat() if self.trade_date else None,
            'open_price': float(self.open_price) if self.open_price else None,
            'high_price': float(self.high_price) if self.high_price else None,
            'low_price': float(self.low_price) if self.low_price else None,
            'close_price': float(self.close_price) if self.close_price else None,
            'change_amount': float(self.change_amount) if self.change_amount else None,
            'volume': self.volume,
            'turnover': self.turnover,
            'transaction_count': self.transaction_count,
            'from_archive': True
        }
    
    @property
    def change_percentage(self):
        """計算漲跌幅百分比"""
        if self.close_price and self.change_amount:
            prev_close = float(self.close_price) - float(self.change_amount)
            if prev_close != 0:
                return round((float(self.change_amount) / prev_close) * 100, 2)
        return 0


@create_cross_db_compatible_model()
class UserBehaviorAnalytics(db.Model):
    """用戶行為分析數據 - 冷資料庫"""
    __bind_key__ = 'cold'
    __tablename__ = 'user_behavior_analytics'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    action_type = Column(postgresql.VARCHAR(50), nullable=False)  # login, post, chat, etc.
    action_count = Column(Integer, default=1)
    analysis_date = Column(Date, nullable=False, index=True)
    
    # PostgreSQL 專用 JSON 類型
    analysis_metadata = Column(postgresql.JSONB)  # 額外的分析數據
    
    created_at = ModelFieldAdapter.create_datetime_field('cold', nullable=False)
    
    __table_args__ = (
        db.Index('idx_user_behavior_user_date', 'user_id', 'analysis_date'),
        db.Index('idx_user_behavior_action_date', 'action_type', 'analysis_date'),
        # PostgreSQL 專用 GIN 索引用於 JSONB
        db.Index('idx_user_behavior_metadata', 'analysis_metadata', postgresql_using='gin'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action_type': self.action_type,
            'action_count': self.action_count,
            'analysis_date': self.analysis_date.isoformat() if self.analysis_date else None,
            'analysis_metadata': self.analysis_metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


@create_cross_db_compatible_model()
class MarketTrendAnalysis(db.Model):
    """市場趨勢分析 - 冷資料庫"""
    __bind_key__ = 'cold'
    __tablename__ = 'market_trend_analysis'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_date = Column(Date, nullable=False, index=True)
    market_type = Column(postgresql.VARCHAR(20))  # 上市/上櫃
    
    # 市場統計數據
    total_volume = Column(BigInteger)
    total_turnover = Column(BigInteger)
    avg_price_change = Column(postgresql.NUMERIC(10, 4))
    volatility_index = Column(postgresql.NUMERIC(10, 4))
    
    # 分析結果 (JSON 格式)
    trend_data = Column(postgresql.JSONB)
    technical_indicators = Column(postgresql.JSONB)
    
    created_at = ModelFieldAdapter.create_datetime_field('cold', nullable=False)
    
    __table_args__ = (
        db.Index('idx_market_trend_date_type', 'analysis_date', 'market_type'),
        db.Index('idx_market_trend_data', 'trend_data', postgresql_using='gin'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'analysis_date': self.analysis_date.isoformat() if self.analysis_date else None,
            'market_type': self.market_type,
            'total_volume': self.total_volume,
            'total_turnover': self.total_turnover,
            'avg_price_change': float(self.avg_price_change) if self.avg_price_change else None,
            'volatility_index': float(self.volatility_index) if self.volatility_index else None,
            'trend_data': self.trend_data,
            'technical_indicators': self.technical_indicators,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


@create_cross_db_compatible_model()
class SystemPerformanceLog(db.Model):
    """系統性能日誌 - 冷資料庫"""
    __bind_key__ = 'cold'
    __tablename__ = 'system_performance_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    log_date = Column(Date, nullable=False, index=True)
    component = Column(postgresql.VARCHAR(50), nullable=False)  # hot_db, cold_db, api, etc.
    
    # 性能指標
    avg_response_time = Column(postgresql.NUMERIC(10, 2))  # 毫秒
    max_response_time = Column(postgresql.NUMERIC(10, 2))
    request_count = Column(Integer)
    error_count = Column(Integer)
    cpu_usage = Column(postgresql.NUMERIC(5, 2))  # 百分比
    memory_usage = Column(postgresql.NUMERIC(5, 2))  # 百分比
    
    # 詳細性能數據
    performance_data = Column(postgresql.JSONB)
    
    created_at = ModelFieldAdapter.create_datetime_field('cold', nullable=False)
    
    __table_args__ = (
        db.Index('idx_system_performance_date_component', 'log_date', 'component'),
        db.Index('idx_system_performance_response_time', 'avg_response_time'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'log_date': self.log_date.isoformat() if self.log_date else None,
            'component': self.component,
            'avg_response_time': float(self.avg_response_time) if self.avg_response_time else None,
            'max_response_time': float(self.max_response_time) if self.max_response_time else None,
            'request_count': self.request_count,
            'error_count': self.error_count,
            'cpu_usage': float(self.cpu_usage) if self.cpu_usage else None,
            'memory_usage': float(self.memory_usage) if self.memory_usage else None,
            'performance_data': self.performance_data,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 