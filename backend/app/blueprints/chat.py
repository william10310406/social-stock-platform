from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_cors import CORS
from flask_socketio import disconnect, emit, join_room, leave_room
from sqlalchemy import and_, desc, or_

from ..decorators import token_required
from ..extensions import socketio
from ..models import Conversation, Friendship, Message, User, db

chat_bp = Blueprint("chat_bp", __name__)
CORS(chat_bp)

# 存儲在線用戶
online_users = {}

# 時間工具函數
def get_utc_now():
    """獲取當前 UTC 時間"""
    return datetime.now(timezone.utc)

def format_datetime_for_response(dt):
    """格式化時間用於 API 回應"""
    if dt is None:
        return None
    if dt.tzinfo is None:
        # 如果沒有時區信息，假設是 UTC
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()

# WebSocket 事件處理
@socketio.on("connect")
def handle_connect(auth=None):
    """處理用戶連接"""
    print(f"用戶連接: {request.sid}")
    emit("connection_status", {"status": "connected", "message": "連接成功"})


@socketio.on("disconnect")
def handle_disconnect():
    """處理用戶斷開連接"""
    print(f"用戶斷開連接: {request.sid}")
    # 從在線用戶列表中移除
    user_id_to_remove = None
    for user_id, sid in online_users.items():
        if sid == request.sid:
            user_id_to_remove = user_id
            break

    if user_id_to_remove:
        del online_users[user_id_to_remove]
        # 通知其他用戶該用戶已離線
        emit("user_offline", {"user_id": user_id_to_remove}, broadcast=True)


@socketio.on("join_chat")
def handle_join_chat(data):
    """用戶加入聊天"""
    try:
        user_id = data.get("user_id")
        conversation_id = data.get("conversation_id")

        if not user_id or not conversation_id:
            emit("error", {"message": "缺少必要參數"})
            return

        # 將用戶加入到對應的聊天室
        room = f"conversation_{conversation_id}"
        join_room(room)

        # 記錄在線用戶
        online_users[user_id] = request.sid

        print(f"用戶 {user_id} 加入聊天室 {room}")
        emit("joined_chat", {"conversation_id": conversation_id, "message": "成功加入聊天室"})

        # 通知其他用戶該用戶已上線
        emit("user_online", {"user_id": user_id}, broadcast=True, include_self=False)

    except Exception as e:
        print(f"加入聊天室錯誤: {e}")
        emit("error", {"message": "加入聊天室失敗"})


@socketio.on("leave_chat")
def handle_leave_chat(data):
    """用戶離開聊天"""
    try:
        conversation_id = data.get("conversation_id")
        if conversation_id:
            room = f"conversation_{conversation_id}"
            leave_room(room)
            emit("left_chat", {"conversation_id": conversation_id})
            print(f"用戶離開聊天室 {room}")
    except Exception as e:
        print(f"離開聊天室錯誤: {e}")
        emit("error", {"message": "離開聊天室失敗"})


@socketio.on("send_message")
def handle_send_message(data):
    """處理發送消息"""
    try:
        conversation_id = data.get("conversation_id")
        sender_id = data.get("sender_id")
        content = data.get("content", "").strip()

        if not conversation_id or not sender_id or not content:
            emit("error", {"message": "消息內容不能為空"})
            return

        # 驗證會話是否存在
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            emit("error", {"message": "聊天會話不存在"})
            return

        # 驗證發送者
        sender = User.query.get(sender_id)
        if not sender:
            emit("error", {"message": "發送者不存在"})
            return

        # 檢查用戶是否屬於這個會話
        if sender_id not in [conversation.user1_id, conversation.user2_id]:
            emit("error", {"message": "無權訪問此聊天會話"})
            return

        # 創建新消息
        message = Message(conversation_id=conversation_id, sender_id=sender_id, content=content)

        # 更新會話的最後更新時間
        conversation.updated_at = get_utc_now()

        db.session.add(message)
        db.session.commit()

        # 準備消息數據
        message_data = {
            "id": message.id,
            "conversation_id": conversation_id,
            "content": message.content,
            "sender_id": message.sender_id,
            "sender_username": sender.username,
            "created_at": format_datetime_for_response(message.created_at),
            "is_read": message.is_read,
        }

        # 發送給聊天室中的所有用戶
        room = f"conversation_{conversation_id}"
        emit("new_message", message_data, room=room)

        print(f"消息已發送到聊天室 {room}: {content[:50]}...")

    except Exception as e:
        print(f"發送消息錯誤: {e}")
        emit("error", {"message": "發送消息失敗"})


@socketio.on("typing")
def handle_typing(data):
    """處理正在輸入狀態"""
    try:
        conversation_id = data.get("conversation_id")
        user_id = data.get("user_id")
        username = data.get("username")
        is_typing = data.get("is_typing", False)

        if conversation_id and user_id:
            room = f"conversation_{conversation_id}"
            emit(
                "user_typing",
                {"user_id": user_id, "username": username, "is_typing": is_typing},
                room=room,
                include_self=False,
            )

    except Exception as e:
        print(f"處理輸入狀態錯誤: {e}")


@socketio.on("ping")
def handle_ping(data):
    """處理心跳檢測"""
    emit("pong", {"message": "pong", "timestamp": format_datetime_for_response(get_utc_now()), "data": data})


@socketio.on("test_message")
def handle_test_message(data):
    """處理測試消息"""
    print(f"收到測試消息: {data}")
    emit(
        "test_response",
        {
            "message": "測試消息收到",
            "timestamp": format_datetime_for_response(get_utc_now()),
            "original_data": data,
        },
    )


@chat_bp.route("/conversations", methods=["GET"])
@token_required
def get_conversations(current_user):
    """獲取當前用戶的所有聊天會話列表"""
    conversations = (
        Conversation.query.filter(
            or_(Conversation.user1_id == current_user.id, Conversation.user2_id == current_user.id)
        )
        .order_by(desc(Conversation.updated_at))
        .all()
    )

    conversations_list = []
    for conv in conversations:
        other_user = conv.get_other_user(current_user.id)

        # 獲取最後一條消息
        last_message = (
            Message.query.filter_by(conversation_id=conv.id)
            .order_by(desc(Message.created_at))
            .first()
        )

        # 計算未讀消息數量
        unread_count = Message.query.filter(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user.id,
            Message.is_read == False,
        ).count()

        conversations_list.append(
            {
                "id": conv.id,
                "other_user": {"id": other_user.id, "username": other_user.username},
                "last_message": (
                    {
                        "content": last_message.content if last_message else "",
                        "created_at": format_datetime_for_response(last_message.created_at)
                        if last_message
                        else format_datetime_for_response(conv.created_at),
                        "sender_id": last_message.sender_id if last_message else None,
                    }
                    if last_message
                    else None
                ),
                "unread_count": unread_count,
                "updated_at": format_datetime_for_response(conv.updated_at),
            }
        )

    return jsonify(conversations_list), 200


@chat_bp.route("/conversations/<int:user_id>", methods=["GET"])
@token_required
def get_or_create_conversation(current_user, user_id):
    """獲取或創建與指定用戶的聊天會話"""
    if user_id == current_user.id:
        return jsonify({"message": "不能與自己聊天"}), 400

    # 檢查是否為好友
    friendship = Friendship.query.filter(
        or_(
            and_(Friendship.requester_id == current_user.id, Friendship.addressee_id == user_id),
            and_(Friendship.requester_id == user_id, Friendship.addressee_id == current_user.id),
        ),
        Friendship.status == "accepted",
    ).first()

    if not friendship:
        return jsonify({"message": "只能與好友聊天"}), 403

    # 尋找現有的會話
    conversation = Conversation.query.filter(
        or_(
            and_(Conversation.user1_id == current_user.id, Conversation.user2_id == user_id),
            and_(Conversation.user1_id == user_id, Conversation.user2_id == current_user.id),
        )
    ).first()

    # 如果沒有會話，創建新的
    if not conversation:
        conversation = Conversation(user1_id=current_user.id, user2_id=user_id)
        db.session.add(conversation)
        db.session.commit()

    return jsonify({"conversation_id": conversation.id}), 200


@chat_bp.route("/conversations/<int:conversation_id>/messages", methods=["GET"])
@token_required
def get_messages(current_user, conversation_id):
    """獲取指定聊天會話的消息"""
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({"message": "聊天會話不存在"}), 404

    # 檢查用戶是否屬於這個會話
    if current_user.id not in [conversation.user1_id, conversation.user2_id]:
        return jsonify({"message": "無權訪問此聊天會話"}), 403

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)

    messages = (
        Message.query.filter_by(conversation_id=conversation_id)
        .order_by(desc(Message.created_at))
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    messages_list = []
    for message in messages.items:
        messages_list.append(
            {
                "id": message.id,
                "content": message.content,
                "sender_id": message.sender_id,
                "sender_username": message.sender.username,
                "created_at": format_datetime_for_response(message.created_at),
                "is_read": message.is_read,
            }
        )

    # 將來自其他用戶的消息標記為已讀
    Message.query.filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False,
    ).update({"is_read": True})
    db.session.commit()

    # 反轉列表，讓最舊的消息在前面
    messages_list.reverse()

    return (
        jsonify(
            {
                "messages": messages_list,
                "has_next": messages.has_next,
                "has_prev": messages.has_prev,
                "page": page,
                "total_pages": messages.pages,
            }
        ),
        200,
    )


@chat_bp.route("/conversations/<int:conversation_id>/messages", methods=["POST"])
@token_required
def send_message(current_user, conversation_id):
    """發送消息到指定聊天會話"""
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({"message": "聊天會話不存在"}), 404

    # 檢查用戶是否屬於這個會話
    if current_user.id not in [conversation.user1_id, conversation.user2_id]:
        return jsonify({"message": "無權訪問此聊天會話"}), 403

    data = request.get_json()
    content = data.get("content", "").strip()

    if not content:
        return jsonify({"message": "消息內容不能為空"}), 400

    if len(content) > 1000:
        return jsonify({"message": "消息內容過長（最多1000字符）"}), 400

    # 創建新消息
    message = Message(conversation_id=conversation_id, sender_id=current_user.id, content=content)

    # 更新會話的最後更新時間
    conversation.updated_at = get_utc_now()

    db.session.add(message)
    db.session.commit()

    return (
        jsonify(
            {
                "id": message.id,
                "content": message.content,
                "sender_id": message.sender_id,
                "sender_username": current_user.username,
                "created_at": format_datetime_for_response(message.created_at),
                "is_read": message.is_read,
            }
        ),
        201,
    )


@chat_bp.route("/conversations/<int:conversation_id>", methods=["DELETE"])
@token_required
def delete_conversation(current_user, conversation_id):
    """刪除聊天會話（僅限會話參與者）"""
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({"message": "聊天會話不存在"}), 404

    # 檢查用戶是否屬於這個會話
    if current_user.id not in [conversation.user1_id, conversation.user2_id]:
        return jsonify({"message": "無權刪除此聊天會話"}), 403

    db.session.delete(conversation)
    db.session.commit()

    return jsonify({"message": "聊天會話已刪除"}), 200
