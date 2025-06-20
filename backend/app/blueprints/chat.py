from flask import Blueprint, request, jsonify
from sqlalchemy import or_, and_, desc
from datetime import datetime

from ..models import User, Conversation, Message, Friendship, db
from ..decorators import token_required
from flask_cors import CORS

chat_bp = Blueprint('chat_bp', __name__)
CORS(chat_bp)

@chat_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(current_user):
    """獲取當前用戶的所有聊天會話列表"""
    conversations = Conversation.query.filter(
        or_(Conversation.user1_id == current_user.id, Conversation.user2_id == current_user.id)
    ).order_by(desc(Conversation.updated_at)).all()
    
    conversations_list = []
    for conv in conversations:
        other_user = conv.get_other_user(current_user.id)
        
        # 獲取最後一條消息
        last_message = Message.query.filter_by(conversation_id=conv.id).order_by(desc(Message.created_at)).first()
        
        # 計算未讀消息數量
        unread_count = Message.query.filter(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user.id,
            Message.is_read == False
        ).count()
        
        conversations_list.append({
            'id': conv.id,
            'other_user': {
                'id': other_user.id,
                'username': other_user.username
            },
            'last_message': {
                'content': last_message.content if last_message else '',
                'created_at': last_message.created_at.isoformat() if last_message else conv.created_at.isoformat(),
                'sender_id': last_message.sender_id if last_message else None
            } if last_message else None,
            'unread_count': unread_count,
            'updated_at': conv.updated_at.isoformat()
        })
    
    return jsonify(conversations_list), 200

@chat_bp.route('/conversations/<int:user_id>', methods=['GET'])
@token_required
def get_or_create_conversation(current_user, user_id):
    """獲取或創建與指定用戶的聊天會話"""
    if user_id == current_user.id:
        return jsonify({'message': '不能與自己聊天'}), 400
    
    # 檢查是否為好友
    friendship = Friendship.query.filter(
        or_(
            and_(Friendship.requester_id == current_user.id, Friendship.addressee_id == user_id),
            and_(Friendship.requester_id == user_id, Friendship.addressee_id == current_user.id)
        ),
        Friendship.status == 'accepted'
    ).first()
    
    if not friendship:
        return jsonify({'message': '只能與好友聊天'}), 403
    
    # 尋找現有的會話
    conversation = Conversation.query.filter(
        or_(
            and_(Conversation.user1_id == current_user.id, Conversation.user2_id == user_id),
            and_(Conversation.user1_id == user_id, Conversation.user2_id == current_user.id)
        )
    ).first()
    
    # 如果沒有會話，創建新的
    if not conversation:
        conversation = Conversation(user1_id=current_user.id, user2_id=user_id)
        db.session.add(conversation)
        db.session.commit()
    
    return jsonify({'conversation_id': conversation.id}), 200

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['GET'])
@token_required
def get_messages(current_user, conversation_id):
    """獲取指定聊天會話的消息"""
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'message': '聊天會話不存在'}), 404
    
    # 檢查用戶是否屬於這個會話
    if current_user.id not in [conversation.user1_id, conversation.user2_id]:
        return jsonify({'message': '無權訪問此聊天會話'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    messages = Message.query.filter_by(conversation_id=conversation_id)\
        .order_by(desc(Message.created_at))\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    messages_list = []
    for message in messages.items:
        messages_list.append({
            'id': message.id,
            'content': message.content,
            'sender_id': message.sender_id,
            'sender_username': message.sender.username,
            'created_at': message.created_at.isoformat(),
            'is_read': message.is_read
        })
    
    # 將來自其他用戶的消息標記為已讀
    Message.query.filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).update({'is_read': True})
    db.session.commit()
    
    # 反轉列表，讓最舊的消息在前面
    messages_list.reverse()
    
    return jsonify({
        'messages': messages_list,
        'has_next': messages.has_next,
        'has_prev': messages.has_prev,
        'page': page,
        'total_pages': messages.pages
    }), 200

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST'])
@token_required
def send_message(current_user, conversation_id):
    """發送消息到指定聊天會話"""
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'message': '聊天會話不存在'}), 404
    
    # 檢查用戶是否屬於這個會話
    if current_user.id not in [conversation.user1_id, conversation.user2_id]:
        return jsonify({'message': '無權訪問此聊天會話'}), 403
    
    data = request.get_json()
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({'message': '消息內容不能為空'}), 400
    
    if len(content) > 1000:
        return jsonify({'message': '消息內容過長（最多1000字符）'}), 400
    
    # 創建新消息
    message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=content
    )
    
    # 更新會話的最後更新時間
    conversation.updated_at = datetime.utcnow()
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'id': message.id,
        'content': message.content,
        'sender_id': message.sender_id,
        'sender_username': current_user.username,
        'created_at': message.created_at.isoformat(),
        'is_read': message.is_read
    }), 201

@chat_bp.route('/conversations/<int:conversation_id>', methods=['DELETE'])
@token_required
def delete_conversation(current_user, conversation_id):
    """刪除聊天會話（僅限會話參與者）"""
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'message': '聊天會話不存在'}), 404
    
    # 檢查用戶是否屬於這個會話
    if current_user.id not in [conversation.user1_id, conversation.user2_id]:
        return jsonify({'message': '無權刪除此聊天會話'}), 403
    
    db.session.delete(conversation)
    db.session.commit()
    
    return jsonify({'message': '聊天會話已刪除'}), 200 