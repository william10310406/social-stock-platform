import time

from app.decorators import token_required
from app.extensions import db
from app.models import News
from flask import Blueprint, Response, jsonify, request
from flask_cors import CORS

news_bp = Blueprint("news_bp", __name__)
CORS(news_bp)


# Note: Applying the decorator to a generator-based route is tricky.
# The decorator will run once at the start of the request, before the generator starts.
# For SSE, we might want a different auth mechanism (e.g., token in query param)
# but for now, we'll protect the initial connection.
@news_bp.route("/latest", methods=["GET"])
@token_required
def latest_news(current_user):
    def generate():
        count = 0
        while True:
            # In a real app, this would check for new news articles
            count += 1
            yield f"data: User {current_user} sees news item #{count}\n\n"
            time.sleep(5)

    return Response(generate(), mimetype="text/event-stream")


@news_bp.route("", methods=["GET"])
@token_required
def get_news(current_user):
    # This is a placeholder. In a real application, you would fetch news
    # from an external API or a database.
    dummy_news = [
        {
            "id": 1,
            "title": "Stock Market Hits All-Time High",
            "source": "Financial Times",
            "published_at": "2024-06-20T12:00:00Z",
            "url": "#",
        },
        {
            "id": 2,
            "title": "Tech Stocks Rally on AI Optimism",
            "source": "Reuters",
            "published_at": "2024-06-20T11:30:00Z",
            "url": "#",
        },
        {
            "id": 3,
            "title": "Federal Reserve Hints at Interest Rate Cuts",
            "source": "Bloomberg",
            "published_at": "2024-06-20T10:00:00Z",
            "url": "#",
        },
    ]
    return jsonify(dummy_news)

    # ... existing code ...
