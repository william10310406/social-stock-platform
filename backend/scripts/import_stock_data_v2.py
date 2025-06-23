#!/usr/bin/env python3
"""
Stock Insight Platform - 股票資料導入腳本 V2
專門處理個股日成交資訊格式的CSV檔案
"""

import os
import sys
import csv
import logging
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

# 添加上級目錄到路徑，以便導入應用模組
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import Stock, StockPrice


def setup_logging():
    """設置日誌記錄"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('/app/logs/stock_import_v2.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)


def parse_stock_code_and_name(directory_name):
    """從目錄名解析股票代碼和名稱"""
    # 格式: "1101_台泥_上市" 或 "1101B_台泥乙特_上市"
    parts = directory_name.split('_')
    if len(parts) >= 3:
        stock_code = parts[0]
        stock_name = parts[1]
        market_type = parts[2] if len(parts) > 2 else "未知"
        return stock_code, stock_name, market_type
    return None, None, None


def clean_price_value(value_str):
    """清理價格字符串，移除逗號並轉換為數值"""
    if not value_str or value_str.strip() == '' or value_str == '--':
        return None
    
    # 移除逗號和引號
    cleaned = value_str.replace(',', '').replace('"', '').strip()
    
    # 處理漲跌價差的正負號
    if cleaned.startswith('+'):
        cleaned = cleaned[1:]
    
    try:
        return float(cleaned)
    except (ValueError, InvalidOperation):
        return None


def clean_volume_value(value_str):
    """清理成交量字符串"""
    if not value_str or value_str.strip() == '':
        return None
    
    # 移除逗號和引號
    cleaned = value_str.replace(',', '').replace('"', '').strip()
    
    try:
        return int(cleaned)
    except ValueError:
        return None


def parse_date(date_str):
    """解析日期字符串"""
    try:
        # 格式: "20250602"
        return datetime.strptime(date_str, '%Y%m%d').date()
    except ValueError:
        return None


def import_stock_data(data_directory, app, logger):
    """導入股票資料"""
    data_path = Path(data_directory)
    
    if not data_path.exists():
        logger.error(f"資料目錄不存在: {data_directory}")
        return False
    
    with app.app_context():
        stock_count = 0
        price_count = 0
        error_count = 0
        
        # 遍歷所有股票目錄
        for stock_dir in data_path.iterdir():
            if not stock_dir.is_dir() or stock_dir.name.startswith('.'):
                continue
            
            stock_code, stock_name, market_type = parse_stock_code_and_name(stock_dir.name)
            if not stock_code or not stock_name:
                logger.warning(f"無法解析目錄名稱: {stock_dir.name}")
                continue
            
            logger.info(f"處理股票: {stock_code} - {stock_name} ({market_type})")
            
            # 檢查或創建股票記錄
            stock = Stock.query.filter_by(symbol=stock_code).first()
            if not stock:
                stock = Stock(
                    symbol=stock_code,
                    name=stock_name,
                    exchange="TWSE" if market_type == "上市" else "TPEx",
                    market_type=market_type
                )
                db.session.add(stock)
                db.session.flush()  # 確保獲得ID
                stock_count += 1
                logger.info(f"新增股票: {stock_code} - {stock_name}")
            
            # 處理該股票目錄下的所有CSV檔案
            for csv_file in stock_dir.glob('*.csv'):
                logger.info(f"  處理檔案: {csv_file.name}")
                
                try:
                    with open(csv_file, 'r', encoding='utf-8') as f:
                        reader = csv.DictReader(f)
                        
                        for row in reader:
                            # 解析日期
                            trade_date = parse_date(row.get('日期', ''))
                            if not trade_date:
                                continue
                            
                            # 檢查是否已存在該日期的價格記錄
                            existing_price = StockPrice.query.filter_by(
                                stock_id=stock.id,
                                trade_date=trade_date
                            ).first()
                            
                            if existing_price:
                                continue  # 跳過已存在的記錄
                            
                            # 解析價格資料
                            open_price = clean_price_value(row.get('開盤價'))
                            high_price = clean_price_value(row.get('最高價'))
                            low_price = clean_price_value(row.get('最低價'))
                            close_price = clean_price_value(row.get('收盤價'))
                            change_amount = clean_price_value(row.get('漲跌價差'))
                            
                            # 解析成交量資料
                            volume = clean_volume_value(row.get('成交股數'))
                            turnover = clean_volume_value(row.get('成交金額'))
                            transaction_count = clean_volume_value(row.get('成交筆數'))
                            
                            # 創建股票價格記錄
                            stock_price = StockPrice(
                                stock_id=stock.id,
                                trade_date=trade_date,
                                open_price=open_price,
                                high_price=high_price,
                                low_price=low_price,
                                close_price=close_price,
                                change_amount=change_amount,
                                volume=volume,
                                turnover=turnover,
                                transaction_count=transaction_count
                            )
                            
                            db.session.add(stock_price)
                            price_count += 1
                            
                            # 每1000筆記錄提交一次
                            if price_count % 1000 == 0:
                                db.session.commit()
                                logger.info(f"已處理 {price_count} 筆價格記錄")
                
                except Exception as e:
                    logger.error(f"處理檔案 {csv_file} 時發生錯誤: {e}")
                    error_count += 1
                    continue
        
        # 最終提交
        try:
            db.session.commit()
            logger.info(f"🎉 導入完成!")
            logger.info(f"  📊 新增股票: {stock_count}")
            logger.info(f"  💰 新增價格記錄: {price_count}")
            logger.info(f"  ❌ 錯誤數: {error_count}")
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"提交資料時發生錯誤: {e}")
            return False


def main():
    """主函數"""
    logger = setup_logging()
    
    # 確定資料目錄路徑
    if os.path.exists('/app/個股日成交資訊 2'):
        data_directory = '/app/個股日成交資訊 2'
    elif os.path.exists('./個股日成交資訊 2'):
        data_directory = './個股日成交資訊 2'
    else:
        logger.error("找不到股票資料目錄")
        return False
    
    logger.info("🚀 開始導入股票資料...")
    logger.info(f"📁 資料目錄: {data_directory}")
    
    # 創建應用實例
    app = create_app()
    
    # 導入資料
    success = import_stock_data(data_directory, app, logger)
    
    if success:
        logger.info("✅ 股票資料導入成功!")
    else:
        logger.error("❌ 股票資料導入失敗!")
    
    return success


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1) 