import os
from datetime import datetime

from cryptography.fernet import Fernet
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import backref, relationship
from sqlalchemy.types import LargeBinary
from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db

# This should be set as an environment variable in a real application
_fernet_key = os.environ.get("FERNET_KEY")
if _fernet_key:
    SECRET_ENCRYPTION_KEY = _fernet_key.encode("utf-8")
else:
    # Generate a new key for development
    SECRET_ENCRYPTION_KEY = Fernet.generate_key()

f = Fernet(SECRET_ENCRYPTION_KEY)


class Friendship(db.Model):
    __tablename__ = "friendships"
    requester_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    addressee_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    # status can be: 'pending', 'accepted', 'declined'
    status = db.Column(db.String(20), nullable=False, default="pending")

    # Relationships to get User objects
    requester = db.relationship("User", foreign_keys=[requester_id])
    addressee = db.relationship("User", foreign_keys=[addressee_id])


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    bio = db.Column(db.Text, nullable=True)  # User's self-introduction
    refresh_token = db.Column(db.String(512), nullable=True)  # Refresh token for JWT
    refresh_token_expires = db.Column(db.DateTime, nullable=True)  # Refresh token expiration

    posts = db.relationship("Post", back_populates="author")
    comments = db.relationship("Comment", back_populates="author")
    stocks = relationship("UserStock", back_populates="user")

    # Friendships where this user is the requester
    sent_friend_requests = db.relationship(
        "Friendship", foreign_keys=[Friendship.requester_id], back_populates="requester"
    )
    # Friendships where this user is the addressee
    received_friend_requests = db.relationship(
        "Friendship", foreign_keys=[Friendship.addressee_id], back_populates="addressee"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class UserStock(db.Model):
    __tablename__ = "user_stocks"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    stock_id = db.Column(db.Integer, db.ForeignKey("stocks.id"), primary_key=True)

    user = relationship("User", back_populates="stocks")
    stock = relationship("Stock", back_populates="users")


class Stock(db.Model):
    __tablename__ = "stocks"
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(20), unique=True, nullable=False)  # 股票代號
    name = db.Column(db.String(100), nullable=False)  # 股票名稱
    exchange = db.Column(db.String(50))  # 交易所 (上市/上櫃)
    market_type = db.Column(db.String(20))  # 市場類型 (一般/創新板等)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    users = relationship("UserStock", back_populates="stock")
    prices = relationship("StockPrice", back_populates="stock", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "symbol": self.symbol,
            "name": self.name,
            "exchange": self.exchange,
            "market_type": self.market_type,
        }

    def get_latest_price(self):
        """獲取最新價格資訊"""
        latest = (
            StockPrice.query.filter_by(stock_id=self.id)
            .order_by(StockPrice.trade_date.desc())
            .first()
        )
        return latest


class StockPrice(db.Model):
    __tablename__ = "stock_prices"
    id = db.Column(db.Integer, primary_key=True)
    stock_id = db.Column(db.Integer, db.ForeignKey("stocks.id"), nullable=False)
    trade_date = db.Column(db.Date, nullable=False)  # 交易日期

    # 價格資訊
    open_price = db.Column(db.Numeric(10, 2))  # 開盤價
    high_price = db.Column(db.Numeric(10, 2))  # 最高價
    low_price = db.Column(db.Numeric(10, 2))  # 最低價
    close_price = db.Column(db.Numeric(10, 2))  # 收盤價
    change_amount = db.Column(db.Numeric(10, 2))  # 漲跌價差

    # 交易資訊
    volume = db.Column(db.BigInteger)  # 成交股數
    turnover = db.Column(db.BigInteger)  # 成交金額
    transaction_count = db.Column(db.Integer)  # 成交筆數

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # 關聯
    stock = relationship("Stock", back_populates="prices")

    # 唯一約束：每個股票每個交易日只能有一筆記錄
    __table_args__ = (db.UniqueConstraint("stock_id", "trade_date", name="uq_stock_date"),)

    def to_dict(self):
        return {
            "id": self.id,
            "stock_id": self.stock_id,
            "trade_date": self.trade_date.isoformat() if self.trade_date else None,
            "open_price": float(self.open_price) if self.open_price else None,
            "high_price": float(self.high_price) if self.high_price else None,
            "low_price": float(self.low_price) if self.low_price else None,
            "close_price": float(self.close_price) if self.close_price else None,
            "change_amount": float(self.change_amount) if self.change_amount else None,
            "volume": self.volume,
            "turnover": self.turnover,
            "transaction_count": self.transaction_count,
        }

    @property
    def change_percentage(self):
        """計算漲跌幅百分比"""
        if self.close_price and self.change_amount:
            prev_close = float(self.close_price) - float(self.change_amount)
            if prev_close != 0:
                return round((float(self.change_amount) / prev_close) * 100, 2)
        return 0


class News(db.Model):
    __tablename__ = "news"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    source = db.Column(db.String(100))
    url = db.Column(db.String(255), nullable=False, unique=True)
    summary = db.Column(db.Text)
    published_at = db.Column(db.DateTime, nullable=False)


class Post(db.Model):
    __tablename__ = "posts"
    __table_args__ = {"extend_existing": True}
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    author = db.relationship("User", back_populates="posts")
    comments = db.relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = db.relationship("Like", back_populates="post", cascade="all, delete-orphan")


class Comment(db.Model):
    __tablename__ = "comments"
    __table_args__ = {"extend_existing": True}
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    author = db.relationship("User", back_populates="comments")
    post = db.relationship("Post", back_populates="comments")


class Like(db.Model):
    __tablename__ = "likes"
    __table_args__ = (db.PrimaryKeyConstraint("user_id", "post_id"),)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)

    user = db.relationship("User")
    post = db.relationship("Post", back_populates="likes")


class Conversation(db.Model):
    __tablename__ = "conversations"
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Relationships
    user1 = db.relationship("User", foreign_keys=[user1_id])
    user2 = db.relationship("User", foreign_keys=[user2_id])
    messages = db.relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan"
    )

    def get_other_user(self, current_user_id):
        """Get the other user in this conversation"""
        return self.user2 if self.user1_id == current_user_id else self.user1


class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversations.id"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    is_read = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    conversation = db.relationship("Conversation", back_populates="messages")
    sender = db.relationship("User")
