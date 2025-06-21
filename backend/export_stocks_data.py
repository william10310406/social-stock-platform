#!/usr/bin/env python3
import csv
import json
import os
import sqlite3
from datetime import datetime


def export_stocks_data():
    """匯出股票資料為多種格式"""

    # 導入必要的模組
    from app import create_app
    from app.extensions import db
    from app.models import Stock, StockPrice, User, UserStock

    app = create_app()

    with app.app_context():
        print("🚀 開始匯出股票資料...")

        # 獲取所有股票資料
        stocks = Stock.query.all()
        print(f"📊 找到 {len(stocks)} 支股票")

        # 1. 匯出股票基本資料為 CSV
        print("📝 匯出股票基本資料 (stocks.csv)...")
        with open("stocks.csv", "w", newline="", encoding="utf-8") as csvfile:
            fieldnames = ["symbol", "name", "exchange", "market_type", "created_at"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            for stock in stocks:
                writer.writerow(
                    {
                        "symbol": stock.symbol,
                        "name": stock.name,
                        "exchange": stock.exchange,
                        "market_type": stock.market_type,
                        "created_at": stock.created_at.isoformat() if stock.created_at else "",
                    }
                )

        # 2. 匯出股票價格資料為 CSV
        print("💰 匯出股票價格資料 (stock_prices.csv)...")
        with open("stock_prices.csv", "w", newline="", encoding="utf-8") as csvfile:
            fieldnames = [
                "stock_symbol",
                "trade_date",
                "open_price",
                "high_price",
                "low_price",
                "close_price",
                "change_amount",
                "volume",
                "turnover",
                "transaction_count",
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            prices = StockPrice.query.join(Stock).all()
            print(f"💹 找到 {len(prices)} 筆價格記錄")

            for price in prices:
                writer.writerow(
                    {
                        "stock_symbol": price.stock.symbol,
                        "trade_date": price.trade_date.isoformat() if price.trade_date else "",
                        "open_price": float(price.open_price) if price.open_price else "",
                        "high_price": float(price.high_price) if price.high_price else "",
                        "low_price": float(price.low_price) if price.low_price else "",
                        "close_price": float(price.close_price) if price.close_price else "",
                        "change_amount": float(price.change_amount) if price.change_amount else "",
                        "volume": price.volume or "",
                        "turnover": price.turnover or "",
                        "transaction_count": price.transaction_count or "",
                    }
                )

        # 3. 匯出為 JSON 格式
        print("🔗 匯出為 JSON 格式 (stocks_data.json)...")
        export_data = {
            "export_time": datetime.now().isoformat(),
            "stocks_count": len(stocks),
            "prices_count": len(prices),
            "stocks": [],
        }

        for stock in stocks:
            stock_data = {
                "symbol": stock.symbol,
                "name": stock.name,
                "exchange": stock.exchange,
                "market_type": stock.market_type,
                "prices": [],
            }

            stock_prices = (
                StockPrice.query.filter_by(stock_id=stock.id).order_by(StockPrice.trade_date).all()
            )
            for price in stock_prices:
                price_data = {
                    "trade_date": price.trade_date.isoformat() if price.trade_date else None,
                    "open_price": float(price.open_price) if price.open_price else None,
                    "high_price": float(price.high_price) if price.high_price else None,
                    "low_price": float(price.low_price) if price.low_price else None,
                    "close_price": float(price.close_price) if price.close_price else None,
                    "change_amount": float(price.change_amount) if price.change_amount else None,
                    "volume": price.volume,
                    "turnover": price.turnover,
                    "transaction_count": price.transaction_count,
                }
                stock_data["prices"].append(price_data)

            export_data["stocks"].append(stock_data)

        with open("stocks_data.json", "w", encoding="utf-8") as jsonfile:
            json.dump(export_data, jsonfile, ensure_ascii=False, indent=2)

        # 4. 創建 SQLite 資料庫
        print("🗄️ 創建 SQLite 資料庫 (stocks_data.db)...")
        if os.path.exists("stocks_data.db"):
            os.remove("stocks_data.db")

        conn = sqlite3.connect("stocks_data.db")
        cursor = conn.cursor()

        # 創建表結構
        cursor.execute(
            """
            CREATE TABLE stocks (
                id INTEGER PRIMARY KEY,
                symbol TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                exchange TEXT,
                market_type TEXT,
                created_at TEXT
            )
        """
        )

        cursor.execute(
            """
            CREATE TABLE stock_prices (
                id INTEGER PRIMARY KEY,
                stock_id INTEGER,
                trade_date TEXT,
                open_price REAL,
                high_price REAL,
                low_price REAL,
                close_price REAL,
                change_amount REAL,
                volume INTEGER,
                turnover INTEGER,
                transaction_count INTEGER,
                FOREIGN KEY (stock_id) REFERENCES stocks (id)
            )
        """
        )

        # 插入股票資料
        for stock in stocks:
            cursor.execute(
                """
                INSERT INTO stocks (id, symbol, name, exchange, market_type, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """,
                (
                    stock.id,
                    stock.symbol,
                    stock.name,
                    stock.exchange,
                    stock.market_type,
                    stock.created_at.isoformat() if stock.created_at else None,
                ),
            )

        # 插入價格資料
        for price in prices:
            cursor.execute(
                """
                INSERT INTO stock_prices (
                    stock_id, trade_date, open_price, high_price, low_price,
                    close_price, change_amount, volume, turnover, transaction_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    price.stock_id,
                    price.trade_date.isoformat() if price.trade_date else None,
                    float(price.open_price) if price.open_price else None,
                    float(price.high_price) if price.high_price else None,
                    float(price.low_price) if price.low_price else None,
                    float(price.close_price) if price.close_price else None,
                    float(price.change_amount) if price.change_amount else None,
                    price.volume,
                    price.turnover,
                    price.transaction_count,
                ),
            )

        conn.commit()
        conn.close()

        print("\n✅ 匯出完成！")
        print("📁 產生的檔案：")
        print("   📄 stock_insight_backup.sql - 完整 PostgreSQL 備份")
        print("   📊 stocks.csv - 股票基本資料")
        print("   💰 stock_prices.csv - 股票價格資料")
        print("   🔗 stocks_data.json - JSON 格式完整資料")
        print("   🗄️ stocks_data.db - SQLite 資料庫檔案")


if __name__ == "__main__":
    export_stocks_data()
