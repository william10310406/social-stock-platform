from datetime import datetime, timedelta

import jwt
from flask import Blueprint, current_app, jsonify, request
from flask_cors import CORS

from ..decorators import token_required
from ..extensions import db
from ..models import User
from ..utils import TokenManager

auth_bp = Blueprint("auth_bp", __name__)
CORS(auth_bp)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Username, email, and password are required"}), 400

    email = data["email"]
    username = data["username"]

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409

    # Check if username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken"}), 409

    new_user = User(username=username, email=email, bio=None)
    new_user.set_password(data["password"])

    db.session.add(new_user)
    db.session.commit()

    # Generate token pair for the new user
    token_data = TokenManager.generate_token_pair(new_user.id)

    return (
        jsonify(
            {
                "message": "User registered successfully",
                "access_token": token_data["access_token"],
                "refresh_token": token_data["refresh_token"],
                "expires_in": token_data["expires_in"],
                "token": token_data["access_token"],  # Keep for backward compatibility
                "user": {"id": new_user.id, "username": new_user.username, "email": new_user.email},
            }
        ),
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password are required"}), 400

    email = data["email"]
    password = data["password"]

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    # Generate token pair for the user
    token_data = TokenManager.generate_token_pair(user.id)

    return (
        jsonify(
            {
                "message": "Login successful",
                "access_token": token_data["access_token"],
                "refresh_token": token_data["refresh_token"],
                "expires_in": token_data["expires_in"],
                "token": token_data["access_token"],  # Keep for backward compatibility
                "user": {"id": user.id, "username": user.username, "email": user.email},
            }
        ),
        200,
    )


@auth_bp.route("/profile", methods=["GET"])
@token_required
def profile(current_user):
    """Gets the profile of the current logged-in user."""
    if not current_user:
        return jsonify({"message": "User not found"}), 404

    user_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
    }
    return jsonify(user_data), 200


@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    """Updates the profile of the current logged-in user."""
    data = request.get_json()
    if not data:
        return jsonify({"message": "No input data provided"}), 400

    # Update username if provided
    new_username = data.get("username")
    if new_username:
        # Check if the new username is already taken by another user
        existing_user = User.query.filter(
            User.username == new_username, User.id != current_user.id
        ).first()
        if existing_user:
            return jsonify({"message": "Username already taken"}), 409
        current_user.username = new_username

    # Update bio if provided
    new_bio = data.get("bio")
    if new_bio is not None:  # Allow setting bio to an empty string
        current_user.bio = new_bio

    db.session.commit()

    return jsonify({"message": "Profile updated successfully"}), 200


@auth_bp.route("/refresh", methods=["POST"])
def refresh_token():
    """Refresh access token using refresh token"""
    data = request.get_json()
    if not data or not data.get("refresh_token"):
        return jsonify({"message": "Refresh token is required"}), 400

    refresh_token = data["refresh_token"]

    # Verify refresh token
    user = TokenManager.verify_refresh_token(refresh_token)
    if not user:
        return jsonify({"message": "Invalid or expired refresh token"}), 401

    # Generate new access token
    new_access_token = TokenManager.generate_access_token(user.id)

    return (
        jsonify(
            {
                "message": "Token refreshed successfully",
                "access_token": new_access_token,
                "token": new_access_token,  # Keep for backward compatibility
                "expires_in": int(current_app.config["JWT_ACCESS_TOKEN_EXPIRES"].total_seconds()),
                "user": {"id": user.id, "username": user.username, "email": user.email},
            }
        ),
        200,
    )


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout(current_user):
    """Logout user by revoking refresh token"""
    # Revoke refresh token
    TokenManager.revoke_refresh_token(current_user.id)

    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/logout-all", methods=["POST"])
@token_required
def logout_all(current_user):
    """Logout user from all devices by revoking refresh token"""
    # This is the same as logout since we only store one refresh token per user
    # In a more advanced system, you might store multiple refresh tokens per user
    TokenManager.revoke_refresh_token(current_user.id)

    return jsonify({"message": "Logged out from all devices successfully"}), 200



