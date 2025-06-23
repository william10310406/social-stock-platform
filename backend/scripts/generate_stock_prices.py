#!/usr/bin/env python3
"""
股票價格數據生成腳本
為現有股票生成模擬的價格數據
"""

import random
import sys
from datetime import datetime, date, timedelta
from decimal import Decimal
from pathlib import Path

# 添加專案根目錄到路徑
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app import create_app
from app.extensions import db
from app.models import Stock, StockPrice

def generate_price_data_for_stock(stock, days=30):
    """為單支股票生成指定天數的價格數據"""
    prices_added = 0
    
    # 設定基礎價格（根據股票代碼生成合理價格）
    base_price = 50.0 + (int(stock.symbol[:4]) % 100) * 2.0
    current_price = base_price
    
    # 生成過去30天的數據
    for i in range(days, 0, -1):
        trade_date = date.today() - timedelta(days=i)
        
        # 檢查是否已存在該日期的數據
        existing = StockPrice.query.filter_by(
            stock_id=stock.id, 
            trade_date=trade_date
        ).first()
        
        if existing:
            continue
            
        # 生成價格變動（-5% 到 +5%）
        change_percent = (random.random() - 0.5) * 0.1  # -5% 到 +5%
        daily_change = current_price * change_percent
        
        # 計算當日價格
        open_price = current_price
        close_price = current_price + daily_change
        
        # 計算當日高低價
        intraday_range = abs(daily_change) + (random.random() * current_price * 0.02)
        high_price = max(open_price, close_price) + (intraday_range * 0.3)
        low_price = min(open_price, close_price) - (intraday_range * 0.3)
        
        # 確保價格為正數
        high_price = max(high_price, 1.0)
        low_price = max(low_price, 1.0)
        open_price = max(open_price, 1.0)
        close_price = max(close_price, 1.0)
        
        # 生成成交量（隨機）
        volume = random.randint(100000, 10000000)
        turnover = int(volume * (high_price + low_price) / 2)
        transaction_count = random.randint(100, 5000)
        
        # 創建價格記錄
        stock_price = StockPrice(
            stock_id=stock.id,
            trade_date=trade_date,
            open_price=Decimal(str(round(open_price, 2))),
            high_price=Decimal(str(round(high_price, 2))),
            low_price=Decimal(str(round(low_price, 2))),
            close_price=Decimal(str(round(close_price, 2))),
            change_amount=Decimal(str(round(daily_change, 2))),
            volume=volume,
            turnover=turnover,
            transaction_count=transaction_count,
            created_at=datetime.utcnow()
        )
        
        db.session.add(stock_price)
        prices_added += 1
        
        # 更新當前價格為收盤價
        current_price = close_price
    
    return prices_added

def generate_all_stock_prices(days=30):
    """為所有股票生成價格數據"""
    app = create_app()
    
    with app.app_context():
        print(f"🚀 開始生成股票價格數據...")
        print(f"📅 生成天數: {days} 天")
        
        stocks = Stock.query.all()
        total_stocks = len(stocks)
        total_prices_added = 0
        
        print(f"📊 股票總數: {total_stocks}")
        
        for i, stock in enumerate(stocks, 1):
            print(f"[{i:3d}/{total_stocks}] 處理股票: {stock.symbol} - {stock.name}")
            
            prices_added = generate_price_data_for_stock(stock, days)
            total_prices_added += prices_added
            
            print(f"  ✅ 添加 {prices_added} 筆價格記錄")
            
            # 每10支股票提交一次
            if i % 10 == 0:
                try:
                    db.session.commit()
                    print(f"  💾 已提交前 {i} 支股票的數據")
                except Exception as e:
                    db.session.rollback()
                    print(f"  ❌ 提交失敗: {e}")
                    return False
        
        # 最終提交
        try:
            db.session.commit()
            print(f"\n🎉 價格數據生成完成!")
            print(f"✅ 處理股票: {total_stocks} 支")
            print(f"✅ 添加價格記錄: {total_prices_added} 筆")
            print(f"📊 平均每支股票: {total_prices_added/total_stocks:.1f} 筆記錄")
            
            # 驗證數據
            total_price_records = StockPrice.query.count()
            print(f"💾 資料庫中價格記錄總數: {total_price_records}")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ 最終提交失敗: {e}")
            return False
            
        return True

def main():
    """主函數"""
    days = 30
    if len(sys.argv) > 1:
        try:
            days = int(sys.argv[1])
        except ValueError:
            print("❌ 天數必須是整數")
            sys.exit(1)
    
    print(f"📈 Stock Insight Platform - 股票價格數據生成工具")
    print(f"🎯 將為每支股票生成 {days} 天的價格數據")
    
    success = generate_all_stock_prices(days)
    
    if success:
        print("\n🚀 股票價格數據生成成功！")
        print("💡 現在可以在前端看到股票價格數據了")
        sys.exit(0)
    else:
        print("\n💥 股票價格數據生成失敗！")
        sys.exit(1)

if __name__ == "__main__":
    main() 