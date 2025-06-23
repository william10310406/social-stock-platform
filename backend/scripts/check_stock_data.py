#!/usr/bin/env python3
"""
檢查股票數據導入狀況
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from app.models import Stock, StockPrice
from app.database_adapter import DatabaseAdapter

def check_stock_data():
    """檢查股票數據狀況"""
    app = create_app()
    
    with app.app_context():
        # 使用 DatabaseAdapter 獲取統計數據
        adapter = DatabaseAdapter()
        
        # 檢查股票數量
        stocks_count = adapter.get_hot_db().session.query(Stock).count()
        print(f"📊 股票總數: {stocks_count}")
        
        # 檢查股票價格記錄數量
        prices_count = adapter.get_hot_db().session.query(StockPrice).count()
        print(f"📈 股票價格記錄數: {prices_count}")
        
        if stocks_count > 0:
            # 顯示前5個股票
            stocks = adapter.get_hot_db().session.query(Stock).limit(5).all()
            print(f"\n📋 前5個股票:")
            for stock in stocks:
                print(f"  - {stock.symbol}: {stock.name} ({stock.exchange})")
        
        if prices_count > 0:
            # 顯示最近5筆價格記錄
            prices = adapter.get_hot_db().session.query(StockPrice).order_by(StockPrice.date.desc()).limit(5).all()
            print(f"\n💰 最近5筆價格記錄:")
            for price in prices:
                print(f"  - {price.stock.symbol} ({price.date}): 收盤價 ${price.close_price}")
        
        # 檢查按交易所分組的股票數量
        if stocks_count > 0:
            from sqlalchemy import func
            exchange_stats = adapter.get_hot_db().session.query(
                Stock.exchange, 
                func.count(Stock.id).label('count')
            ).group_by(Stock.exchange).all()
            
            print(f"\n🏢 按交易所分組:")
            for exchange, count in exchange_stats:
                print(f"  - {exchange}: {count} 支股票")

if __name__ == "__main__":
    check_stock_data() 