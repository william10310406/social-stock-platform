import jwt
import datetime
import secrets
from flask import current_app
from .models import User
from .extensions import db


class TokenManager:
    """Handles JWT token generation and validation"""
    
    @staticmethod
    def generate_access_token(user_id):
        """Generate a short-lived access token"""
        expiration = datetime.datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        payload = {
            'user_id': user_id,
            'type': 'access',
            'exp': expiration,
            'iat': datetime.datetime.utcnow()
        }
        return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")
    
    @staticmethod
    def generate_refresh_token(user_id):
        """Generate a long-lived refresh token and store it in database"""
        expiration = datetime.datetime.utcnow() + current_app.config['JWT_REFRESH_TOKEN_EXPIRES']
        
        # Generate a secure random refresh token
        refresh_token = secrets.token_urlsafe(64)
        
        # Store refresh token in database
        user = User.query.get(user_id)
        if user:
            user.refresh_token = refresh_token
            user.refresh_token_expires = expiration
            db.session.commit()
        
        return refresh_token
    
    @staticmethod
    def verify_access_token(token):
        """Verify access token and return user_id"""
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            if payload.get('type') != 'access':
                return None
            return payload.get('user_id')
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def verify_refresh_token(refresh_token):
        """Verify refresh token against database and return user"""
        user = User.query.filter_by(refresh_token=refresh_token).first()
        
        if not user:
            return None
            
        # Check if refresh token has expired
        if user.refresh_token_expires and user.refresh_token_expires < datetime.datetime.utcnow():
            # Token expired, clear it from database
            user.refresh_token = None
            user.refresh_token_expires = None
            db.session.commit()
            return None
            
        return user
    
    @staticmethod
    def revoke_refresh_token(user_id):
        """Revoke refresh token (logout)"""
        user = User.query.get(user_id)
        if user:
            user.refresh_token = None
            user.refresh_token_expires = None
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def generate_token_pair(user_id):
        """Generate both access and refresh tokens"""
        access_token = TokenManager.generate_access_token(user_id)
        refresh_token = TokenManager.generate_refresh_token(user_id)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': int(current_app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds())
        } 