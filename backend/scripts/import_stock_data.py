#!/usr/bin/env python3
"""
股票資料導入腳本
用於將個股日成交資訊 CSV 文件導入到資料庫中
"""

import csv
import os
import re
import sys
from datetime import datetime
from decimal import Decimal
from pathlib import Path

# 添加專案根目錄到路徑
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app import create_app
from app.extensions import db
from app.models import Stock, StockPrice

print(f"🔧 Stock Insight Platform - 股票資料導入工具")


def parse_stock_info_from_dirname(dirname):
    """
    從目錄名稱解析股票信息
    例如: "1101_台泥_上市" -> ("1101", "台泥", "上市", None)
         "6951_青新-創_上市" -> ("6951", "青新", "上市", "創新板")
    """
    pattern = r"^(\d+[A-Z]?)_(.+?)_(.+)$"
    match = re.match(pattern, dirname)

    if not match:
        return None, None, None, None

    symbol = match.group(1)
    name_exchange = match.group(2)
    exchange_type = match.group(3)

    # 檢查是否有特殊標記
    market_type = None
    if "-創" in name_exchange:
        market_type = "創新板"
        name = name_exchange.replace("-創", "")
    elif "-KY" in name_exchange:
        market_type = "KY"
        name = name_exchange.replace("-KY", "")
    elif "*" in name_exchange:
        market_type = "特殊"
        name = name_exchange.replace("*", "")
    else:
        name = name_exchange

    return symbol, name, exchange_type, market_type


def clean_number_string(value_str):
    """清理數字字符串，移除千分位逗號和引號"""
    if not value_str or value_str.strip() == "":
        return None

    # 移除引號和逗號
    cleaned = value_str.replace('"', "").replace(",", "").strip()

    # 處理漲跌價差的正負號
    if cleaned.startswith("+"):
        cleaned = cleaned[1:]

    try:
        return Decimal(cleaned)
    except:
        return None


def parse_date(date_str):
    """解析日期字符串 20250602 -> date 對象"""
    try:
        return datetime.strptime(date_str, "%Y%m%d").date()
    except:
        return None


def import_stock_from_csv(csv_file_path, stock):
    """從 CSV 文件導入單支股票的價格資料"""
    imported_count = 0
    skipped_count = 0

    try:
        with open(csv_file_path, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    # 解析資料
                    trade_date = parse_date(row["日期"])
                    if not trade_date:
                        print(f"❌ 無效日期: {row['日期']}")
                        skipped_count += 1
                        continue

                    # 檢查是否已存在
                    existing = StockPrice.query.filter_by(
                        stock_id=stock.id, trade_date=trade_date
                    ).first()

                    if existing:
                        skipped_count += 1
                        continue

                    # 創建新記錄
                    stock_price = StockPrice(
                        stock_id=stock.id,
                        trade_date=trade_date,
                        open_price=clean_number_string(row["開盤價"]),
                        high_price=clean_number_string(row["最高價"]),
                        low_price=clean_number_string(row["最低價"]),
                        close_price=clean_number_string(row["收盤價"]),
                        change_amount=clean_number_string(row["漲跌價差"]),
                        volume=int(row["成交股數"]) if row["成交股數"].isdigit() else None,
                        turnover=int(row["成交金額"]) if row["成交金額"].isdigit() else None,
                        transaction_count=int(clean_number_string(row["成交筆數"]) or 0),
                    )

                    db.session.add(stock_price)
                    imported_count += 1

                except Exception as e:
                    print(f"❌ 處理行失敗: {e}")
                    skipped_count += 1
                    continue

    except Exception as e:
        print(f"❌ 讀取 CSV 文件失敗: {e}")
        return 0, 0

    return imported_count, skipped_count


def import_stock_data(data_directory):
    """導入所有股票資料"""
    app = create_app()

    with app.app_context():
        print(f"🚀 開始導入股票資料...")
        print(f"📁 資料目錄: {data_directory}")

        total_stocks = 0
        total_prices = 0
        total_skipped = 0

        # 掃描所有股票目錄
        for stock_dir in os.listdir(data_directory):
            stock_path = os.path.join(data_directory, stock_dir)

            if not os.path.isdir(stock_path):
                continue

            # 解析股票信息
            symbol, name, exchange, market_type = parse_stock_info_from_dirname(stock_dir)

            if not symbol or not name:
                print(f"⚠️  無法解析目錄名稱: {stock_dir}")
                continue

            print(f"\n📊 處理股票: {symbol} - {name} ({exchange})")

            # 檢查或創建股票記錄
            stock = Stock.query.filter_by(symbol=symbol).first()

            if not stock:
                stock = Stock(symbol=symbol, name=name, exchange=exchange, market_type=market_type)
                db.session.add(stock)
                db.session.commit()
                print(f"✅ 新增股票: {symbol} - {name}")
            else:
                # 更新股票信息
                stock.name = name
                stock.exchange = exchange
                stock.market_type = market_type
                print(f"🔄 更新股票: {symbol} - {name}")

            total_stocks += 1

            # 導入價格資料
            csv_files = [f for f in os.listdir(stock_path) if f.endswith(".csv")]

            for csv_file in csv_files:
                csv_path = os.path.join(stock_path, csv_file)
                print(f"📈 導入文件: {csv_file}")

                imported, skipped = import_stock_from_csv(csv_path, stock)
                total_prices += imported
                total_skipped += skipped

                print(f"  ✅ 導入: {imported} 筆, 跳過: {skipped} 筆")

        # 提交所有變更
        try:
            db.session.commit()
            print(f"\n🎉 導入完成!")
            print(f"📊 統計:")
            print(f"  - 處理股票: {total_stocks} 支")
            print(f"  - 導入價格記錄: {total_prices} 筆")
            print(f"  - 跳過記錄: {total_skipped} 筆")

        except Exception as e:
            db.session.rollback()
            print(f"❌ 提交失敗: {e}")
            return False

    return True


def main():
    """主函數"""
    if len(sys.argv) != 2:
        print("使用方式: python import_stock_data.py <資料目錄路徑>")
        print("範例: python import_stock_data.py ../個股日成交資訊")
        sys.exit(1)

    data_dir = sys.argv[1]

    if not os.path.exists(data_dir):
        print(f"❌ 資料目錄不存在: {data_dir}")
        sys.exit(1)

    print("=" * 60)
    print("🚀 Stock Insight Platform - 股票資料導入工具")
    print("=" * 60)

    success = import_stock_data(data_dir)

    if success:
        print("\n✅ 資料導入成功完成!")
        sys.exit(0)
    else:
        print("\n❌ 資料導入失敗!")
        sys.exit(1)


if __name__ == "__main__":
    main()
