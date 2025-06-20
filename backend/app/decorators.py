from functools import wraps
import jwt
from flask import request, jsonify, current_app
from .models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Bypass token check for OPTIONS preflight requests
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)

        token = None
        
        # 1. Check for token in Authorization header
        if 'Authorization' in request.headers:
            # Expected format: "Bearer <token>"
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
        
        # 2. If not in header, check for token in query parameters (for SSE, WebSockets)
        if not token:
            token = request.args.get('token')

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Decode the token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            
            # Check if it's an access token
            if data.get('type') != 'access':
                return jsonify({'message': 'Invalid token type!'}), 401
                
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found!'}), 404
                
        except jwt.ExpiredSignatureError:
            return jsonify({
                'message': 'Access token has expired!',
                'error_code': 'TOKEN_EXPIRED'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'message': 'Token is invalid!',
                'error_code': 'TOKEN_INVALID'
            }), 401
        
        # Pass the current user to the decorated function
        return f(current_user, *args, **kwargs)

    return decorated 