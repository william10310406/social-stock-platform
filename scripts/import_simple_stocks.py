#!/usr/bin/env python3
"""
簡單股票資料導入腳本
用於將 CSV 格式的股票基本資訊導入到資料庫中
"""

import csv
import sys
from pathlib import Path
from datetime import datetime

# 添加專案根目錄到路徑
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app import create_app
from app.extensions import db
from app.models import Stock

def import_stocks_from_csv(csv_file_path):
    """從 CSV 文件導入股票基本資訊"""
    app = create_app()
    
    with app.app_context():
        print(f"🚀 開始導入股票基本資料...")
        print(f"📁 資料檔案: {csv_file_path}")
        
        imported_count = 0
        updated_count = 0
        skipped_count = 0
        
        try:
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
                
                # 跳過第一行（資料庫回應訊息）
                data_lines = [line for line in lines if not line.startswith('Changed database')]
                
                for line in data_lines:
                    line = line.strip()
                    if not line or 'rows affected' in line:
                        continue
                        
                    try:
                        # 解析 CSV 格式: id,symbol,name,exchange,market_type,created_at,updated_at
                        parts = line.split(',')
                        if len(parts) < 5:
                            continue
                            
                        csv_id = parts[0].strip()
                        symbol = parts[1].strip()
                        name = parts[2].strip()
                        exchange = parts[3].strip()
                        market_type = parts[4].strip() if parts[4].strip() != 'NULL' else None
                        
                        # 檢查是否已存在
                        existing_stock = Stock.query.filter_by(symbol=symbol).first()
                        
                        if existing_stock:
                            # 更新現有股票資訊
                            existing_stock.name = name
                            existing_stock.exchange = exchange
                            existing_stock.market_type = market_type
                            updated_count += 1
                            print(f"🔄 更新股票: {symbol} - {name}")
                        else:
                            # 創建新股票記錄
                            new_stock = Stock(
                                symbol=symbol,
                                name=name,
                                exchange=exchange,
                                market_type=market_type,
                                created_at=datetime.utcnow(),
                                updated_at=datetime.utcnow()
                            )
                            db.session.add(new_stock)
                            imported_count += 1
                            print(f"✅ 新增股票: {symbol} - {name}")
                            
                    except Exception as e:
                        print(f"❌ 處理行失敗: {line[:50]}... 錯誤: {e}")
                        skipped_count += 1
                        continue
                
                # 提交所有變更
                try:
                    db.session.commit()
                    print(f"\n🎉 導入完成!")
                    print(f"✅ 新增: {imported_count} 支股票")
                    print(f"🔄 更新: {updated_count} 支股票") 
                    print(f"⚠️  跳過: {skipped_count} 筆記錄")
                    print(f"📊 總計處理: {imported_count + updated_count + skipped_count} 筆記錄")
                    
                    # 顯示資料庫中的股票總數
                    total_stocks = Stock.query.count()
                    print(f"💾 資料庫中共有: {total_stocks} 支股票")
                    
                except Exception as e:
                    db.session.rollback()
                    print(f"❌ 資料庫提交失敗: {e}")
                    return False
                    
        except Exception as e:
            print(f"❌ 讀取 CSV 文件失敗: {e}")
            return False
            
        return True

def main():
    """主函數"""
    if len(sys.argv) != 2:
        print("使用方法: python import_simple_stocks.py <csv_file_path>")
        print("範例: python import_simple_stocks.py ../../exports/stocks_20250622_214409/stocks_raw.csv")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    if not Path(csv_file).exists():
        print(f"❌ 檔案不存在: {csv_file}")
        sys.exit(1)
    
    success = import_stocks_from_csv(csv_file)
    
    if success:
        print("\n🚀 股票資料導入成功！")
        sys.exit(0)
    else:
        print("\n💥 股票資料導入失敗！")
        sys.exit(1)

if __name__ == "__main__":
    main() 