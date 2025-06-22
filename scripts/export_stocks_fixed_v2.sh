#!/bin/bash

# Stock Insight Platform - 修復版導出腳本 v2
# 解決 SQL 輸出混入、格式問題和 CSV 表頭問題

set -e

# 配置
TIMESTAMP=$(date -u +"%Y%m%d_%H%M%S")
EXPORT_DIR="exports/stocks_fixed_v2_${TIMESTAMP}"
DB_CONTAINER="stock-insight-db"
DATABASE="StockInsight"

echo "🔧 Stock Insight Platform - 修復版數據導出 v2"
echo "==============================================="
echo "導出時間: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo "導出目錄: ${EXPORT_DIR}"
echo ""

# 創建導出目錄
mkdir -p "${EXPORT_DIR}"
cd "${EXPORT_DIR}"

echo "📊 正在導出股票資料..."

# 1. 純數據 CSV 導出（去除表頭和分隔線）
echo "   → 導出 CSV 資料"
docker exec "${DB_CONTAINER}" /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "StrongPassword123!" \
    -d "${DATABASE}" -C \
    -Q "SET NOCOUNT ON; SELECT id,symbol,name,exchange,market_type,created_at,updated_at FROM stocks ORDER BY id;" \
    -s "," -W -h -1 > stocks_clean.csv

# 清理 CSV（移除空行、SQL 輸出和表頭分隔線）
grep -v "^$" stocks_clean.csv | grep -v "Changed database" | grep -v "rows affected" | grep -v "^--" | grep -v "^id,symbol" > stocks_data.csv

echo "   → 導出統計資料"
# 2. 統計資料導出
docker exec "${DB_CONTAINER}" /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "StrongPassword123!" \
    -d "${DATABASE}" -C \
    -Q "SET NOCOUNT ON; 
        SELECT '總股票數', COUNT(*) FROM stocks UNION ALL
        SELECT '上市股票', COUNT(*) FROM stocks WHERE exchange='上市' UNION ALL
        SELECT '上櫃股票', COUNT(*) FROM stocks WHERE exchange='上櫃' UNION ALL
        SELECT '創新板', COUNT(*) FROM stocks WHERE market_type='創新板' UNION ALL
        SELECT 'KY股', COUNT(*) FROM stocks WHERE market_type='KY';" \
    -s "," -W -h -1 > stats_raw.csv

# 清理統計資料
grep -v "^$" stats_raw.csv | grep -v "Changed database" | grep -v "rows affected" | grep -v "^--" > statistics.csv

echo "   → 生成 JSON 格式"
# 3. 生成標準 JSON 格式（改進版）
cat > generate_json.py << 'EOF'
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
                if len(row) >= 7 and row[0].isdigit():  # 確保是有效的數據行
                    stocks.append({
                        "id": int(row[0]),
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
                if len(row) >= 2 and row[1].isdigit():  # 確保是有效的統計行
                    stats[row[0].strip()] = int(row[1])
        
        # 創建 JSON 結構
        json_data = {
            "metadata": {
                "export_time": datetime.utcnow().isoformat() + "Z",
                "source_database": "StockInsight",
                "format_version": "2.0",
                "total_records": len(stocks)
            },
            "statistics": stats,
            "stocks": stocks
        }
        
        # 寫入 JSON 文件
        with open('stocks_complete.json', 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 成功生成 JSON，包含 {len(stocks)} 支股票")
        
        # 顯示統計資訊
        print("📊 統計資訊:")
        for key, value in stats.items():
            print(f"   • {key}: {value}")
        
    except Exception as e:
        print(f"❌ JSON 生成錯誤: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_json_export()
EOF

# 執行 JSON 生成
python3 generate_json.py

echo "   → 創建資料庫備份"
# 4. 數據庫備份
docker exec "${DB_CONTAINER}" /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "StrongPassword123!" -C \
    -Q "BACKUP DATABASE [${DATABASE}] TO DISK = '/var/opt/mssql/data/StockInsight_Fixed_v2_Export.bak' 
        WITH FORMAT, INIT, NAME = 'StockInsight Fixed v2 Export', SKIP, NOREWIND, NOUNLOAD;"

# 複製備份文件
docker cp "${DB_CONTAINER}:/var/opt/mssql/data/StockInsight_Fixed_v2_Export.bak" ./

echo ""
echo "📋 導出完成報告"
echo "==================="
echo "導出目錄: ${EXPORT_DIR}"
echo ""

# 檢查文件並顯示大小
if [ -f "stocks_data.csv" ]; then
    STOCK_COUNT=$(wc -l < stocks_data.csv)
    FILE_SIZE=$(du -h stocks_data.csv | cut -f1)
    echo "✅ stocks_data.csv - ${STOCK_COUNT} 支股票 (${FILE_SIZE})"
fi

if [ -f "stocks_complete.json" ]; then
    FILE_SIZE=$(du -h stocks_complete.json | cut -f1)
    echo "✅ stocks_complete.json - JSON 格式 (${FILE_SIZE})"
fi

if [ -f "StockInsight_Fixed_v2_Export.bak" ]; then
    FILE_SIZE=$(du -h StockInsight_Fixed_v2_Export.bak | cut -f1)
    echo "✅ StockInsight_Fixed_v2_Export.bak - 資料庫備份 (${FILE_SIZE})"
fi

echo ""
echo "🎯 修復完成！所有文件已清理並格式化正確。"
echo "📝 改進項目："
echo "  • 移除 CSV 表頭和分隔線"
echo "  • 智能數據驗證"
echo "  • 完整統計資訊"
echo "  • 標準 JSON 格式"
echo ""
echo "📁 文件說明："
echo "  - stocks_data.csv: 純淨的 CSV 數據，無表頭無分隔線"
echo "  - stocks_complete.json: 完整 JSON 格式，包含元數據和統計"
echo "  - StockInsight_Fixed_v2_Export.bak: 完整資料庫備份"

# 清理臨時文件
rm -f stocks_clean.csv stats_raw.csv generate_json.py

cd - > /dev/null
echo ""
echo "導出路徑: $(pwd)/${EXPORT_DIR}" 