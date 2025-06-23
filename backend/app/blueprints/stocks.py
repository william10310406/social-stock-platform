from datetime import datetime, timedelta

from app.decorators import token_required
from app.extensions import db
from app.models import Stock, StockPrice, UserStock
from flask import Blueprint, jsonify, request
from flask_cors import CORS
from sqlalchemy import desc, func

stocks_bp = Blueprint("stocks_bp", __name__)
CORS(stocks_bp)


@stocks_bp.route("", methods=["GET"])
@token_required
def get_stocks(current_user):
    """獲取股票列表，支援搜尋和分頁"""
    # 獲取查詢參數
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    search = request.args.get("search", "").strip()
    exchange = request.args.get("exchange", "").strip()
    market_type = request.args.get("market_type", "").strip()

    # 構建查詢
    query = Stock.query

    # 搜尋條件
    if search:
        query = query.filter(
            db.or_(Stock.symbol.like(f"%{search}%"), Stock.name.like(f"%{search}%"))
        )

    if exchange:
        query = query.filter(Stock.exchange == exchange)

    if market_type:
        query = query.filter(Stock.market_type == market_type)

    # 排序和分頁
    query = query.order_by(Stock.symbol)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    stocks = []
    for stock in pagination.items:
        stock_data = stock.to_dict()

        # 獲取最新價格
        latest_price = stock.get_latest_price()
        if latest_price:
            stock_data.update(
                {
                    "latest_price": latest_price.to_dict(),
                    "last_updated": latest_price.trade_date.isoformat(),
                }
            )

        stocks.append(stock_data)

    return jsonify(
        {
            "stocks": stocks,
            "pagination": {
                "page": page,
                "pages": pagination.pages,
                "per_page": per_page,
                "total": pagination.total,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev,
            },
        }
    )


@stocks_bp.route("/<symbol>", methods=["GET"])
@token_required
def get_stock_detail(current_user, symbol):
    """獲取單支股票詳細資訊"""
    try:
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            return jsonify({"error": "股票不存在"}), 404

        stock_data = stock.to_dict()

        # 獲取最新價格
        latest_price = stock.get_latest_price()
        if latest_price:
            stock_data["latest_price"] = latest_price.to_dict()
            stock_data["change_percentage"] = latest_price.change_percentage

        # 獲取價格統計
        price_stats = (
            db.session.query(
                func.count(StockPrice.id).label("total_records"),
                func.min(StockPrice.trade_date).label("first_date"),
                func.max(StockPrice.trade_date).label("last_date"),
                func.avg(StockPrice.close_price).label("avg_price"),
                func.max(StockPrice.high_price).label("max_high"),
                func.min(StockPrice.low_price).label("min_low"),
            )
            .filter_by(stock_id=stock.id)
            .first()
        )

        if price_stats and price_stats.total_records > 0:
            stock_data["statistics"] = {
                "total_records": price_stats.total_records,
                "first_date": (
                    price_stats.first_date.isoformat() if price_stats.first_date else None
                ),
                "last_date": price_stats.last_date.isoformat() if price_stats.last_date else None,
                "average_price": float(price_stats.avg_price) if price_stats.avg_price else None,
                "highest_price": float(price_stats.max_high) if price_stats.max_high else None,
                "lowest_price": float(price_stats.min_low) if price_stats.min_low else None,
            }

        return jsonify(stock_data)

    except Exception as e:
        return jsonify({"error": f"獲取股票詳情失敗: {str(e)}"}), 500


@stocks_bp.route("/<symbol>/history", methods=["GET"])
@token_required
def get_stock_history(current_user, symbol):
    """獲取股票歷史價格資料"""
    try:
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            return jsonify({"error": "股票不存在"}), 404

        # 獲取查詢參數
        days = request.args.get("days", 30, type=int)
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        # 構建查詢
        query = StockPrice.query.filter_by(stock_id=stock.id)

        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d").date()
                end = datetime.strptime(end_date, "%Y-%m-%d").date()
                query = query.filter(StockPrice.trade_date >= start, StockPrice.trade_date <= end)
            except ValueError:
                return jsonify({"error": "日期格式錯誤，請使用 YYYY-MM-DD 格式"}), 400
        else:
            # 使用天數限制
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days)
            query = query.filter(StockPrice.trade_date >= start_date)

        # 排序並獲取資料
        prices = query.order_by(StockPrice.trade_date.desc()).limit(500).all()

        history_data = [price.to_dict() for price in reversed(prices)]

        return jsonify(
            {
                "symbol": symbol,
                "name": stock.name,
                "history": history_data,
                "count": len(history_data),
            }
        )

    except Exception as e:
        return jsonify({"error": f"獲取歷史資料失敗: {str(e)}"}), 500


@stocks_bp.route("/<symbol>/realtime", methods=["GET"])
@token_required
def get_realtime_data(current_user, symbol):
    """獲取即時股票資料（使用最新的資料庫記錄）"""
    try:
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            return jsonify({"error": "股票不存在"}), 404

        latest_price = stock.get_latest_price()
        if not latest_price:
            return jsonify({"error": "暫無價格資料"}), 404

        realtime_data = {
            "symbol": symbol,
            "name": stock.name,
            "exchange": stock.exchange,
            "market_type": stock.market_type,
            "price": float(latest_price.close_price) if latest_price.close_price else 0,
            "change": float(latest_price.change_amount) if latest_price.change_amount else 0,
            "change_percent": latest_price.change_percentage,
            "volume": latest_price.volume,
            "high": float(latest_price.high_price) if latest_price.high_price else 0,
            "low": float(latest_price.low_price) if latest_price.low_price else 0,
            "open": float(latest_price.open_price) if latest_price.open_price else 0,
            "timestamp": latest_price.trade_date.isoformat(),
            "last_updated": (
                latest_price.created_at.isoformat() if latest_price.created_at else None
            ),
        }

        return jsonify(realtime_data)

    except Exception as e:
        return jsonify({"error": f"獲取即時資料失敗: {str(e)}"}), 500


@stocks_bp.route("/user", methods=["GET"])
@token_required
def get_user_stocks(current_user):
    """獲取用戶關注的股票"""
    try:
        # 先獲取用戶關注的股票
        user_stocks = (
            db.session.query(Stock)
            .join(UserStock, Stock.id == UserStock.stock_id)
            .filter(UserStock.user_id == current_user.id)
            .all()
        )

        stocks_data = []
        for stock in user_stocks:
            stock_data = stock.to_dict()

            # 獲取每支股票的最新價格
            latest_price = (
                StockPrice.query.filter_by(stock_id=stock.id)
                .order_by(StockPrice.trade_date.desc())
                .first()
            )

            if latest_price:
                stock_data.update(
                    {
                        "latest_price": latest_price.to_dict(),
                        "change_percentage": latest_price.change_percentage,
                    }
                )
            stocks_data.append(stock_data)

        return jsonify({"user_stocks": stocks_data, "count": len(stocks_data)})

    except Exception as e:
        return jsonify({"error": f"獲取用戶股票失敗: {str(e)}"}), 500


@stocks_bp.route("/<symbol>/follow", methods=["POST"])
@token_required
def follow_stock(current_user, symbol):
    """關注股票"""
    try:
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            return jsonify({"error": "股票不存在"}), 404

        # 檢查是否已關注
        existing = UserStock.query.filter_by(user_id=current_user.id, stock_id=stock.id).first()

        if existing:
            return jsonify({"message": "已經關注此股票"}), 200

        # 添加關注
        user_stock = UserStock(user_id=current_user.id, stock_id=stock.id)
        db.session.add(user_stock)
        db.session.commit()

        return jsonify({"message": f"成功關注 {stock.name} ({symbol})"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"關注股票失敗: {str(e)}"}), 500


@stocks_bp.route("/<symbol>/unfollow", methods=["DELETE"])
@token_required
def unfollow_stock(current_user, symbol):
    """取消關注股票"""
    try:
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            return jsonify({"error": "股票不存在"}), 404

        user_stock = UserStock.query.filter_by(user_id=current_user.id, stock_id=stock.id).first()

        if not user_stock:
            return jsonify({"error": "尚未關注此股票"}), 404

        db.session.delete(user_stock)
        db.session.commit()

        return jsonify({"message": f"成功取消關注 {stock.name} ({symbol})"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"取消關注失敗: {str(e)}"}), 500


@stocks_bp.route("/search", methods=["GET"])
@token_required
def search_stocks(current_user):
    """快速搜尋股票"""
    try:
        query = request.args.get("q", "").strip()
        limit = min(request.args.get("limit", 10, type=int), 50)

        if not query:
            return jsonify({"stocks": []})

        # 搜尋股票
        stocks = (
            Stock.query.filter(
                db.or_(Stock.symbol.like(f"%{query}%"), Stock.name.like(f"%{query}%"))
            )
            .limit(limit)
            .all()
        )

        results = []
        for stock in stocks:
            stock_data = stock.to_dict()

            # 獲取最新價格
            latest_price = stock.get_latest_price()
            if latest_price:
                stock_data["current_price"] = (
                    float(latest_price.close_price) if latest_price.close_price else None
                )
                stock_data["change_percent"] = latest_price.change_percentage

            results.append(stock_data)

        return jsonify({"stocks": results})

    except Exception as e:
        return jsonify({"error": f"搜尋失敗: {str(e)}"}), 500


@stocks_bp.route("/statistics", methods=["GET"])
@token_required
def get_market_statistics(current_user):
    """獲取市場統計資訊"""
    try:
        # 基本統計
        total_stocks = Stock.query.count()
        total_prices = StockPrice.query.count()

        # 交易所分布
        exchange_stats = (
            db.session.query(Stock.exchange, func.count(Stock.id).label("count"))
            .group_by(Stock.exchange)
            .all()
        )

        # 市場類型分布
        market_type_stats = (
            db.session.query(Stock.market_type, func.count(Stock.id).label("count"))
            .group_by(Stock.market_type)
            .all()
        )

        # 最新更新日期
        latest_update = db.session.query(func.max(StockPrice.trade_date)).scalar()

        return jsonify(
            {
                "total_stocks": total_stocks,
                "total_price_records": total_prices,
                "latest_update": latest_update.isoformat() if latest_update else None,
                "exchange_distribution": [
                    {"exchange": stat[0], "count": stat[1]} for stat in exchange_stats
                ],
                "market_type_distribution": [
                    {"market_type": stat[0] or "一般", "count": stat[1]}
                    for stat in market_type_stats
                ],
            }
        )

    except Exception as e:
        return jsonify({"error": f"獲取統計資料失敗: {str(e)}"}), 500
