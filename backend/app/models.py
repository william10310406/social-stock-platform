import os
from datetime import datetime
from sqlalchemy.ext.hybrid import hybrid_property
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet
from sqlalchemy.orm import relationship, backref

from .extensions import db
from sqlalchemy.types import LargeBinary

# This should be set as an environment variable in a real application
SECRET_ENCRYPTION_KEY = os.environ.get('FERNET_KEY', Fernet.generate_key().decode('utf-8')).encode('utf-8')
f = Fernet(SECRET_ENCRYPTION_KEY)

class Friendship(db.Model):
    __tablename__ = 'friendships'
    requester_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    addressee_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    # status can be: 'pending', 'accepted', 'declined'
    status = db.Column(db.String(20), nullable=False, default='pending')

    # Relationships to get User objects
    requester = db.relationship('User', foreign_keys=[requester_id])
    addressee = db.relationship('User', foreign_keys=[addressee_id])

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    bio = db.Column(db.Text, nullable=True) # User's self-introduction

    posts = db.relationship('Post', back_populates='author')
    comments = db.relationship('Comment', back_populates='author')
    stocks = relationship("UserStock", back_populates="user")

    # Friendships where this user is the requester
    sent_friend_requests = db.relationship('Friendship', foreign_keys=[Friendship.requester_id], back_populates='requester')
    # Friendships where this user is the addressee
    received_friend_requests = db.relationship('Friendship', foreign_keys=[Friendship.addressee_id], back_populates='addressee')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class UserStock(db.Model):
    __tablename__ = 'user_stocks'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), primary_key=True)
    
    user = relationship("User", back_populates="stocks")
    stock = relationship("Stock", back_populates="users")

class Stock(db.Model):
    __tablename__ = 'stocks'
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    exchange = db.Column(db.String(50))
    
    users = relationship("UserStock", back_populates="stock")

class News(db.Model):
    __tablename__ = 'news'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    source = db.Column(db.String(100))
    url = db.Column(db.String(255), nullable=False, unique=True)
    summary = db.Column(db.Text)
    published_at = db.Column(db.DateTime, nullable=False)

class Post(db.Model):
    __tablename__ = 'posts'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    author = db.relationship('User', back_populates='posts')
    comments = db.relationship('Comment', back_populates='post', cascade="all, delete-orphan")
    likes = db.relationship('Like', back_populates='post', cascade="all, delete-orphan")

class Comment(db.Model):
    __tablename__ = 'comments'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    author = db.relationship('User', back_populates='comments')
    post = db.relationship('Post', back_populates='comments')

class Like(db.Model):
    __tablename__ = 'likes'
    __table_args__ = (db.PrimaryKeyConstraint('user_id', 'post_id'),)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)

    user = db.relationship('User')
    post = db.relationship('Post', back_populates='likes')

class Conversation(db.Model):
    __tablename__ = 'conversations'
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Relationships
    user1 = db.relationship('User', foreign_keys=[user1_id])
    user2 = db.relationship('User', foreign_keys=[user2_id])
    messages = db.relationship('Message', back_populates='conversation', cascade="all, delete-orphan")

    def get_other_user(self, current_user_id):
        """Get the other user in this conversation"""
        return self.user2 if self.user1_id == current_user_id else self.user1

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    is_read = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    conversation = db.relationship('Conversation', back_populates='messages')
    sender = db.relationship('User') 