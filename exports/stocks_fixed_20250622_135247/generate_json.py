import csv
import json
import sys
from datetime import datetime

def create_json_export():
    try:
        # 讀取股票數據
        stocks = []
        with open('stocks_data.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                if len(row) >= 7:  # 確保有足夠的列
                    stocks.append({
                        "id": int(row[0]) if row[0].isdigit() else 0,
                        "symbol": row[1].strip(),
                        "name": row[2].strip(),
                        "exchange": row[3].strip(),
                        "market_type": row[4].strip() if row[4].strip() != 'NULL' else None,
                        "created_at": row[5].strip(),
                        "updated_at": row[6].strip()
                    })
        
        # 讀取統計數據
        stats = {}
        with open('statistics.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                if len(row) >= 2:
                    stats[row[0].strip()] = int(row[1])
        
        # 創建 JSON 結構
        json_data = {
            "metadata": {
                "export_time": datetime.utcnow().isoformat() + "Z",
                "source_database": "StockInsight",
                "format_version": "1.0",
                "total_records": len(stocks)
            },
            "statistics": stats,
            "stocks": stocks
        }
        
        # 寫入 JSON 文件
        with open('stocks_complete.json', 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 成功生成 JSON，包含 {len(stocks)} 支股票")
        
    except Exception as e:
        print(f"❌ JSON 生成錯誤: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_json_export()
