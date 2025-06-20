from flask import Blueprint, request, jsonify
from app.decorators import token_required
from app.models import Post, Comment, User, Like
from app.extensions import db
from flask_cors import CORS

posts_bp = Blueprint('posts_bp', __name__)
CORS(posts_bp)

@posts_bp.route('', methods=['GET'])
@token_required
def get_posts(current_user):
    posts = Post.query.order_by(Post.created_at.desc()).all()
    posts_list = []
    for post in posts:
        is_liked = Like.query.filter_by(user_id=current_user.id, post_id=post.id).first() is not None
        posts_list.append({
            'id': post.id,
            'title': post.title,
            'body': post.body,
            'created_at': post.created_at.isoformat(),
            'author': post.author.username,
            'likes_count': len(post.likes),
            'comments_count': len(post.comments),
            'current_user_liked': is_liked
        })
    return jsonify(posts_list)

@posts_bp.route('/myposts', methods=['GET'])
@token_required
def get_my_posts(current_user):
    """Fetches all posts by the currently logged-in user."""
    posts = current_user.posts
    sorted_posts = sorted(posts, key=lambda p: p.created_at, reverse=True)
    
    posts_list = []
    for post in sorted_posts:
        is_liked = Like.query.filter_by(user_id=current_user.id, post_id=post.id).first() is not None
        posts_list.append({
            'id': post.id,
            'title': post.title,
            'body': post.body,
            'created_at': post.created_at.isoformat(),
            'likes_count': len(post.likes),
            'comments_count': len(post.comments),
            'current_user_liked': is_liked
        })
    return jsonify(posts_list), 200

@posts_bp.route('', methods=['POST'])
@token_required
def create_post(current_user):
    data = request.get_json()
    if not data or not data.get('title') or not data.get('body'):
        return jsonify({'message': 'Title and body are required!'}), 400
    
    new_post = Post(title=data['title'], body=data['body'], author_id=current_user.id)
    db.session.add(new_post)
    db.session.commit()
    
    return jsonify({'message': 'Post created successfully!'}), 201

@posts_bp.route('/<int:post_id>/comments', methods=['GET'])
@token_required
def get_comments(current_user, post_id):
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    output = []
    for comment in comments:
        comment_data = {
            'id': comment.id,
            'body': comment.body,
            'created_at': comment.created_at,
            'author': comment.author.username
        }
        output.append(comment_data)
    return jsonify(output)

@posts_bp.route('/<int:post_id>/comments', methods=['POST'])
@token_required
def create_comment(current_user, post_id):
    data = request.get_json()
    if not data or not data.get('body'):
        return jsonify({'message': 'Comment body is required!'}), 400
        
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found!'}), 404

    new_comment = Comment(body=data['body'], author_id=current_user.id, post_id=post_id)
    db.session.add(new_comment)
    db.session.commit()

    return jsonify({'message': 'Comment created successfully!'}), 201

@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@token_required
def delete_post(current_user, post_id):
    """Deletes a post."""
    post = Post.query.get(post_id)

    if not post:
        return jsonify({'message': 'Post not found'}), 404

    if post.author_id != current_user.id:
        return jsonify({'message': 'Unauthorized to delete this post'}), 403

    db.session.delete(post)
    db.session.commit()

    return jsonify({'message': 'Post deleted successfully'}), 200

@posts_bp.route('/<int:post_id>', methods=['GET'])
@token_required
def get_post_detail(current_user, post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404

    is_liked = Like.query.filter_by(user_id=current_user.id, post_id=post.id).first() is not None
    
    comments = []
    for comment in post.comments:
        comments.append({
            'id': comment.id,
            'body': comment.body,
            'created_at': comment.created_at.isoformat(),
            'author': comment.author.username,
            'author_id': comment.author_id
        })

    post_data = {
        'id': post.id,
        'title': post.title,
        'body': post.body,
        'created_at': post.created_at.isoformat(),
        'author': post.author.username,
        'likes_count': len(post.likes),
        'comments_count': len(post.comments),
        'current_user_liked': is_liked,
        'comments': sorted(comments, key=lambda c: c['created_at'])
    }
    return jsonify(post_data)

@posts_bp.route('/<int:post_id>/like', methods=['POST'])
@token_required
def like_post(current_user, post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404

    like = Like.query.filter_by(user_id=current_user.id, post_id=post_id).first()
    if like:
        return jsonify({'message': 'You have already liked this post'}), 400

    new_like = Like(user_id=current_user.id, post_id=post_id)
    db.session.add(new_like)
    db.session.commit()
    return jsonify({'message': 'Post liked successfully'}), 201

@posts_bp.route('/<int:post_id>/like', methods=['DELETE'])
@token_required
def unlike_post(current_user, post_id):
    like = Like.query.filter_by(user_id=current_user.id, post_id=post_id).first()
    if not like:
        return jsonify({'message': 'You have not liked this post'}), 404
    
    db.session.delete(like)
    db.session.commit()
    return jsonify({'message': 'Post unliked successfully'}), 200

@posts_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'message': 'Comment not found'}), 404
    
    # Only the author of the comment can delete it
    if comment.author_id != current_user.id:
        return jsonify({'message': 'Unauthorized to delete this comment'}), 403
        
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted successfully'}), 200 