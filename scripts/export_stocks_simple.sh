#!/bin/bash

# 簡化的股票資料導出腳本 (MDF + JSON)
# 使用方法: ./scripts/export_stocks_simple.sh

set -e

echo "🚀 Stock Insight Platform - 簡化股票資料導出工具"
echo "================================================="

# 創建帶時間戳的導出目錄
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_DIR="exports/stocks_$TIMESTAMP"
mkdir -p "$EXPORT_DIR"

echo "📁 創建導出目錄: $EXPORT_DIR"

# 檢查資料庫容器是否運行
if ! docker-compose ps db | grep -q "Up"; then
    echo "❌ 資料庫容器未運行，請先執行: docker-compose up -d"
    exit 1
fi

# 第一步：導出 JSON 格式（使用 SQL 查詢）
echo ""
echo "📄 步驟 1/3: 導出 JSON 格式..."
echo "================================"

# 使用 SQL 查詢導出 CSV 格式，然後轉換為 JSON
docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${MSSQL_SA_PASSWORD:-StrongPassword123!}" \
    -Q "USE StockInsight; SELECT id, symbol, name, exchange, market_type, created_at, updated_at FROM Stocks ORDER BY symbol" \
    -C \
    -s "," \
    -W \
    -h -1 > "$EXPORT_DIR/stocks_raw.csv"

# 創建簡化的 JSON 文件
echo "📊 創建 JSON 文件..."
cat > "$EXPORT_DIR/stocks_simple.json" << 'EOF'
{
  "metadata": {
    "export_time": "
EOF

date -u +"%Y-%m-%dT%H:%M:%SZ" >> "$EXPORT_DIR/stocks_simple.json"
cat >> "$EXPORT_DIR/stocks_simple.json" << 'EOF'
",
    "source_database": "StockInsight",
    "format_version": "1.0"
  },
  "stocks": [
EOF

# 處理 CSV 並轉換為 JSON（處理所有股票）
line_count=0
while IFS=',' read -r id symbol name exchange market_type created_at updated_at; do
    # 跳過空行和標題行
    if [ -z "$id" ] || [ "$id" = "id" ]; then
        continue
    fi
    
    if [ $line_count -gt 0 ]; then
        echo "," >> "$EXPORT_DIR/stocks_simple.json"
    fi
    echo "    {" >> "$EXPORT_DIR/stocks_simple.json"
    echo "      \"id\": $id," >> "$EXPORT_DIR/stocks_simple.json"
    echo "      \"symbol\": \"$symbol\"," >> "$EXPORT_DIR/stocks_simple.json"
    echo "      \"name\": \"$name\"," >> "$EXPORT_DIR/stocks_simple.json"
    echo "      \"exchange\": \"$exchange\"," >> "$EXPORT_DIR/stocks_simple.json"
    echo "      \"market_type\": \"$market_type\"," >> "$EXPORT_DIR/stocks_simple.json"
    echo "      \"created_at\": \"$created_at\"," >> "$EXPORT_DIR/stocks_simple.json"
    echo "      \"updated_at\": \"$updated_at\"" >> "$EXPORT_DIR/stocks_simple.json"
    echo -n "    }" >> "$EXPORT_DIR/stocks_simple.json"
    line_count=$((line_count + 1))
done < "$EXPORT_DIR/stocks_raw.csv"

echo "" >> "$EXPORT_DIR/stocks_simple.json"
echo "  ]" >> "$EXPORT_DIR/stocks_simple.json"
echo "}" >> "$EXPORT_DIR/stocks_simple.json"

# 第二步：創建資料庫備份
echo ""
echo "💾 步驟 2/3: 創建資料庫備份..."
echo "================================"

# 創建備份目錄
docker-compose exec -T db mkdir -p /var/opt/mssql/backup

# 創建備份腳本
cat > "$EXPORT_DIR/backup_script.sql" << 'EOF'
USE StockInsight;
GO

-- 備份完整資料庫
BACKUP DATABASE StockInsight 
TO DISK = '/var/opt/mssql/backup/StockInsight_Export.bak'
WITH FORMAT, INIT, COMPRESSION;
GO

PRINT 'Database backup completed successfully!';
GO
EOF

# 執行備份
echo "🔄 執行備份..."
docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${MSSQL_SA_PASSWORD:-StrongPassword123!}" \
    -Q "USE StockInsight; BACKUP DATABASE StockInsight TO DISK = '/var/opt/mssql/backup/StockInsight_Export.bak' WITH FORMAT, INIT; PRINT 'Database backup completed successfully!';" \
    -C

# 複製備份文件
echo "📁 複製備份文件..."
docker cp "$(docker-compose ps -q db):/var/opt/mssql/backup/StockInsight_Export.bak" "./$EXPORT_DIR/"

# 第三步：創建獨立的 MDF 文件
echo ""
echo "🗄️  步驟 3/3: 創建獨立 MDF 文件..."
echo "================================"

# 創建 MDF 導出腳本
cat > "$EXPORT_DIR/export_mdf_script.sql" << 'EOF'
USE master;
GO

-- 檢查並刪除已存在的導出資料庫
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'StockExport')
BEGIN
    PRINT 'Dropping existing StockExport database...';
    ALTER DATABASE StockExport SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE StockExport;
END
GO

-- 創建新的導出資料庫
CREATE DATABASE StockExport;
GO

USE StockExport;
GO

-- 創建股票表格結構
CREATE TABLE Stocks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(20) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    exchange NVARCHAR(50),
    market_type NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- 從原始資料庫複製股票資料
INSERT INTO StockExport.dbo.Stocks (symbol, name, exchange, market_type, created_at, updated_at)
SELECT symbol, name, exchange, market_type, created_at, updated_at
FROM StockInsight.dbo.Stocks;
GO

-- 顯示複製的記錄數
DECLARE @count INT;
SELECT @count = COUNT(*) FROM Stocks;
PRINT 'Exported ' + CAST(@count AS VARCHAR(10)) + ' stocks to StockExport database';
GO

PRINT 'StockExport database created successfully!';
GO
EOF

# 執行 MDF 導出腳本
echo "🔄 創建導出資料庫..."
cat > temp_export_mdf.sql << 'EOF'
USE master;
GO
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'StockExport')
BEGIN
    ALTER DATABASE StockExport SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE StockExport;
END
GO
CREATE DATABASE StockExport;
GO
USE StockExport;
GO
CREATE TABLE Stocks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(20) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    exchange NVARCHAR(50),
    market_type NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO
INSERT INTO StockExport.dbo.Stocks (symbol, name, exchange, market_type, created_at, updated_at)
SELECT symbol, name, exchange, market_type, created_at, updated_at
FROM StockInsight.dbo.Stocks;
GO
DECLARE @count INT;
SELECT @count = COUNT(*) FROM Stocks;
PRINT 'Exported ' + CAST(@count AS VARCHAR(10)) + ' stocks to StockExport database';
GO
EOF

docker cp temp_export_mdf.sql "$(docker-compose ps -q db):/tmp/export_mdf.sql"
docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${MSSQL_SA_PASSWORD:-StrongPassword123!}" \
    -i "/tmp/export_mdf.sql" \
    -C
rm temp_export_mdf.sql

# 分離資料庫獲取 MDF 文件
cat > "$EXPORT_DIR/detach_script.sql" << 'EOF'
USE master;
GO

-- 分離資料庫
ALTER DATABASE StockExport SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

EXEC sp_detach_db 'StockExport';
GO

PRINT 'Database detached successfully!';
GO
EOF

echo "🔄 分離資料庫..."
cat > temp_detach.sql << 'EOF'
USE master;
GO
ALTER DATABASE StockExport SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO
EXEC sp_detach_db 'StockExport';
GO
PRINT 'Database detached successfully!';
GO
EOF

docker cp temp_detach.sql "$(docker-compose ps -q db):/tmp/detach.sql"
docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${MSSQL_SA_PASSWORD:-StrongPassword123!}" \
    -i "/tmp/detach.sql" \
    -C
rm temp_detach.sql

# 複製 MDF 和 LDF 文件
echo "📁 複製 MDF 和 LDF 文件..."
docker cp "$(docker-compose ps -q db):/var/opt/mssql/data/StockExport.mdf" "./$EXPORT_DIR/" 2>/dev/null || echo "⚠️  MDF 文件複製可能失敗"
docker cp "$(docker-compose ps -q db):/var/opt/mssql/data/StockExport_log.ldf" "./$EXPORT_DIR/" 2>/dev/null || echo "⚠️  LDF 文件複製可能失敗"

# 創建統計信息
echo ""
echo "📊 生成統計資料..."
docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${MSSQL_SA_PASSWORD:-StrongPassword123!}" \
    -Q "USE StockInsight; SELECT COUNT(*) as [總股票數], SUM(CASE WHEN exchange = N'上市' THEN 1 ELSE 0 END) as [上市], SUM(CASE WHEN exchange = N'上櫃' THEN 1 ELSE 0 END) as [上櫃], SUM(CASE WHEN market_type = N'創新板' THEN 1 ELSE 0 END) as [創新板], SUM(CASE WHEN market_type = N'KY' THEN 1 ELSE 0 END) as [KY股] FROM Stocks;" \
    -C > "$EXPORT_DIR/statistics.txt"

# 創建導出報告
cat > "$EXPORT_DIR/export_report.md" << EOF
# Stock Insight Platform - 資料導出報告

## 導出資訊
- **導出時間**: $(date)
- **導出目錄**: $EXPORT_DIR
- **資料來源**: StockInsight 資料庫

## 導出文件清單

### 📄 JSON 格式
- \`stocks_simple.json\` - 股票資料 JSON 格式
- \`stocks_raw.csv\` - 原始 CSV 資料

### 💾 資料庫格式
- \`StockInsight_Export.bak\` - 完整資料庫備份文件
- \`StockExport.mdf\` - 獨立 MDF 資料庫文件（如果成功）
- \`StockExport_log.ldf\` - 對應的日誌文件（如果成功）

### 📊 統計資料
- \`statistics.txt\` - 股票統計信息

### 🔧 腳本文件
- \`backup_script.sql\` - 資料庫備份腳本
- \`export_mdf_script.sql\` - MDF 導出腳本
- \`detach_script.sql\` - 資料庫分離腳本

## 使用方法

### 還原 BAK 文件
\`\`\`sql
RESTORE DATABASE StockInsight_Restored 
FROM DISK = 'StockInsight_Export.bak'
WITH REPLACE;
\`\`\`

### 讀取 JSON 文件
\`\`\`python
import json
with open('stocks_simple.json', 'r', encoding='utf-8') as f:
    stocks_data = json.load(f)
\`\`\`

---
Generated by Stock Insight Platform Simple Export Tool
EOF

# 顯示結果
echo ""
echo "📁 導出完成！文件清單："
echo "=========================="
ls -la "$EXPORT_DIR/"

# 計算文件大小
TOTAL_SIZE=$(du -sh "$EXPORT_DIR" | cut -f1)

echo ""
echo "🎉 導出成功完成！"
echo "=================="
echo "📁 導出目錄: $EXPORT_DIR"
echo "📊 總大小: $TOTAL_SIZE"
echo "📄 JSON 文件: ✅ 已生成"
echo "💾 BAK 文件: ✅ 已生成"
echo "📋 導出報告: ✅ 已生成"
echo ""
echo "💡 查看導出報告: cat $EXPORT_DIR/export_report.md"
echo "📊 查看統計資料: cat $EXPORT_DIR/statistics.txt"
echo "📄 查看 JSON 資料: head -20 $EXPORT_DIR/stocks_simple.json"
echo "" 