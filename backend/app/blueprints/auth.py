import jwt
import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_cors import CORS
from ..models import User
from ..extensions import db
from ..decorators import token_required

auth_bp = Blueprint('auth_bp', __name__)
CORS(auth_bp)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Username, email, and password are required"}), 400

    email = data['email']
    username = data['username']
    
    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409
    
    # Check if username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken"}), 409

    new_user = User(
        username=username,
        email=email,
        bio=None
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()

    # Generate token for the new user
    token = jwt.encode({
        'user_id': new_user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400

    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@token_required
def profile(current_user):
    """Gets the profile of the current logged-in user."""
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
        
    user_data = {
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'bio': current_user.bio
    }
    return jsonify(user_data), 200

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Updates the profile of the current logged-in user."""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Update username if provided
    new_username = data.get('username')
    if new_username:
        # Check if the new username is already taken by another user
        existing_user = User.query.filter(User.username == new_username, User.id != current_user.id).first()
        if existing_user:
            return jsonify({'message': 'Username already taken'}), 409
        current_user.username = new_username

    # Update bio if provided
    new_bio = data.get('bio')
    if new_bio is not None: # Allow setting bio to an empty string
        current_user.bio = new_bio
    
    db.session.commit()

    return jsonify({'message': 'Profile updated successfully'}), 200 