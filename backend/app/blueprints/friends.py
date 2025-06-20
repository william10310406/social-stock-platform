from flask import Blueprint, jsonify, request
from flask_cors import CORS
from sqlalchemy import or_

from ..decorators import token_required
from ..models import Friendship, User, db

friends_bp = Blueprint("friends_bp", __name__)
CORS(friends_bp)


@friends_bp.route("/search", methods=["GET"])
@token_required
def search_users(current_user):
    """Search for users by username, excluding the current user."""
    username_query = request.args.get("username", "")
    if not username_query:
        return jsonify([]), 200

    users = User.query.filter(
        User.username.ilike(f"%{username_query}%"), User.id != current_user.id
    ).all()

    users_list = [{"id": user.id, "username": user.username} for user in users]
    return jsonify(users_list), 200


@friends_bp.route("/requests", methods=["POST"])
@token_required
def send_friend_request(current_user):
    """Sends a friend request to another user."""
    data = request.get_json()
    addressee_id = data.get("addressee_id")

    if not addressee_id:
        return jsonify({"message": "User ID is required"}), 400

    if addressee_id == current_user.id:
        return jsonify({"message": "You cannot send a friend request to yourself"}), 400

    existing_request = Friendship.query.filter(
        ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == addressee_id))
        | ((Friendship.requester_id == addressee_id) & (Friendship.addressee_id == current_user.id))
    ).first()

    if existing_request:
        return jsonify({"message": "Friend request already sent or you are already friends"}), 409

    new_request = Friendship(
        requester_id=current_user.id, addressee_id=addressee_id, status="pending"
    )
    db.session.add(new_request)
    db.session.commit()

    return jsonify({"message": "Friend request sent successfully"}), 201


@friends_bp.route("/requests/pending", methods=["GET"])
@token_required
def get_pending_requests(current_user):
    """Gets all pending friend requests for the current user."""
    pending_requests = Friendship.query.filter_by(
        addressee_id=current_user.id, status="pending"
    ).all()

    requests_list = [
        {"requester_id": req.requester_id, "requester_username": req.requester.username}
        for req in pending_requests
    ]
    return jsonify(requests_list), 200


@friends_bp.route("/requests/<int:requester_id>", methods=["PUT"])
@token_required
def respond_to_friend_request(current_user, requester_id):
    """Accepts or declines a friend request."""
    data = request.get_json()
    new_status = data.get("status")  # 'accepted' or 'declined'

    if new_status not in ["accepted", "declined"]:
        return jsonify({"message": "Invalid status"}), 400

    friend_request = Friendship.query.filter_by(
        requester_id=requester_id, addressee_id=current_user.id, status="pending"
    ).first()

    if not friend_request:
        return jsonify({"message": "Friend request not found or already handled"}), 404

    friend_request.status = new_status
    db.session.commit()

    return jsonify({"message": f"Friend request {new_status}"}), 200


@friends_bp.route("", methods=["GET"])
@token_required
def get_friends_list(current_user):
    """Gets the list of accepted friends for the current user."""
    friends = Friendship.query.filter(
        or_(Friendship.requester_id == current_user.id, Friendship.addressee_id == current_user.id),
        Friendship.status == "accepted",
    ).all()

    friends_list = []
    for f in friends:
        if f.requester_id == current_user.id:
            friends_list.append({"id": f.addressee.id, "username": f.addressee.username})
        else:
            friends_list.append({"id": f.requester.id, "username": f.requester.username})

    return jsonify(friends_list), 200
