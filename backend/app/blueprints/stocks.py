from app.decorators import token_required
from flask import Blueprint, jsonify
from flask_cors import CORS

stocks_bp = Blueprint("stocks_bp", __name__)
CORS(stocks_bp)


@stocks_bp.route("/<symbol>/realtime", methods=["GET"])
@token_required
def get_realtime(current_user, symbol):
    # In a real app: fetch from external stock market feed
    return jsonify({"symbol": symbol, "price": 123.45, "ts": "2023-10-27T10:00:00Z"})


@stocks_bp.route("/<symbol>/history", methods=["GET"])
@token_required
def get_history(current_user, symbol):
    # In a real app: fetch from db
    return jsonify(
        {
            "symbol": symbol,
            "history": [
                {"date": "2023-10-26", "price": 120.50},
                {"date": "2023-10-25", "price": 118.20},
            ],
        }
    )


@stocks_bp.route("", methods=["GET"])
@token_required
def get_user_stocks(current_user):
    # Placeholder data
    dummy_stocks = [
        {"symbol": "AAPL", "name": "Apple Inc.", "price": 150.25, "change": "+1.50"},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 2750.80, "change": "-10.20"},
        {"symbol": "MSFT", "name": "Microsoft Corp.", "price": 305.40, "change": "+2.10"},
    ]
    return jsonify(dummy_stocks)
