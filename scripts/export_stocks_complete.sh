#!/bin/bash

# 完整的股票資料導出腳本 (MDF + JSON)
# 使用方法: ./scripts/export_stocks_complete.sh

set -e

echo "🚀 Stock Insight Platform - 完整股票資料導出工具"
echo "=================================================="

# 創建帶時間戳的導出目錄
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_DIR="exports/stocks_$TIMESTAMP"
mkdir -p "$EXPORT_DIR"

echo "📁 創建導出目錄: $EXPORT_DIR"

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未運行，請先啟動 Docker"
    exit 1
fi

# 檢查資料庫容器是否運行
if ! docker-compose ps db | grep -q "Up"; then
    echo "📦 啟動資料庫容器..."
    docker-compose up -d db
    
    # 等待資料庫就緒
    echo "⏳ 等待資料庫啟動..."
    timeout=60
    counter=0
    while [ $counter -lt $timeout ]; do
        if docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${MSSQL_SA_PASSWORD:-StrongPassword123!}" -Q "SELECT 1" -C > /dev/null 2>&1; then
            echo "✅ 資料庫已就緒"
            break
        fi
        sleep 2
        counter=$((counter + 2))
    done
    
    if [ $counter -ge $timeout ]; then
        echo "❌ 資料庫啟動超時"
        exit 1
    fi
fi

# 第一步：導出為 JSON 格式
echo ""
echo "📄 步驟 1/3: 導出 JSON 格式..."
echo "================================"

# 在 Docker 容器中執行 Python 腳本
docker-compose exec -T backend python /app/scripts/export_stocks_to_json.py "/app/$EXPORT_DIR"

# 複製 JSON 文件到主機
docker cp "$(docker-compose ps -q backend):/app/$EXPORT_DIR/." "./$EXPORT_DIR/"

# 第二步：備份資料庫
echo ""
echo "💾 步驟 2/3: 創建資料庫備份..."
echo "================================"

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

# 確保備份目錄存在
docker-compose exec -T db mkdir -p /var/opt/mssql/backup

# 執行備份
docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${MSSQL_SA_PASSWORD:-StrongPassword123!}" \
    -i "/app/$EXPORT_DIR/backup_script.sql" \
    -C

# 複製備份文件
docker cp "$(docker-compose ps -q db):/var/opt/mssql/backup/StockInsight_Export.bak" "./$EXPORT_DIR/"

# 第三步：創建分離的 MDF 文件
echo ""
echo "🗄️  步驟 3/3: 創建獨立 MDF 文件..."
echo "================================"

# 修改 MDF 導出腳本以使用正確的路徑
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

-- 檢查點並強制寫入
CHECKPOINT;
GO

PRINT 'StockExport database created successfully with all stock data!';
GO
EOF

# 執行 MDF 導出腳本
docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${MSSQL_SA_PASSWORD:-StrongPassword123!}" \
    -i "/app/$EXPORT_DIR/export_mdf_script.sql" \
    -C

# 分離資料庫以獲取 MDF 文件
cat > "$EXPORT_DIR/detach_script.sql" << 'EOF'
USE master;
GO

-- 分離資料庫
ALTER DATABASE StockExport SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

EXEC sp_detach_db 'StockExport';
GO

PRINT 'Database detached successfully!';
PRINT 'MDF file: /var/opt/mssql/data/StockExport.mdf';
PRINT 'LDF file: /var/opt/mssql/data/StockExport_log.ldf';
GO
EOF

# 執行分離腳本
docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${MSSQL_SA_PASSWORD:-StrongPassword123!}" \
    -i "/app/$EXPORT_DIR/detach_script.sql" \
    -C

# 複製 MDF 和 LDF 文件
echo "📁 複製 MDF 和 LDF 文件..."
docker cp "$(docker-compose ps -q db):/var/opt/mssql/data/StockExport.mdf" "./$EXPORT_DIR/"
docker cp "$(docker-compose ps -q db):/var/opt/mssql/data/StockExport_log.ldf" "./$EXPORT_DIR/"

# 創建導出報告
echo ""
echo "📋 創建導出報告..."
cat > "$EXPORT_DIR/export_report.md" << EOF
# Stock Insight Platform - 資料導出報告

## 導出資訊
- **導出時間**: $(date)
- **導出目錄**: $EXPORT_DIR
- **資料來源**: StockInsight 資料庫

## 導出文件清單

### 📄 JSON 格式
- \`stocks_complete.json\` - 完整股票資料（包含元數據和統計）
- \`stocks_simple.json\` - 簡化股票列表
- \`stocks_statistics.json\` - 統計資料

### 💾 資料庫格式
- \`StockInsight_Export.bak\` - 完整資料庫備份文件
- \`StockExport.mdf\` - 獨立 MDF 資料庫文件
- \`StockExport_log.ldf\` - 對應的日誌文件

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

### 附加 MDF 文件
\`\`\`sql
CREATE DATABASE StockInsight_FromMDF ON
(FILENAME = 'path/to/StockExport.mdf'),
(FILENAME = 'path/to/StockExport_log.ldf')
FOR ATTACH;
\`\`\`

### 讀取 JSON 文件
\`\`\`python
import json
with open('stocks_complete.json', 'r', encoding='utf-8') as f:
    stocks_data = json.load(f)
\`\`\`

---
Generated by Stock Insight Platform Export Tool
EOF

# 顯示文件清單
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
echo "💾 MDF 文件: ✅ 已生成"
echo "📋 導出報告: ✅ 已生成"
echo ""
echo "💡 查看導出報告: cat $EXPORT_DIR/export_report.md"
echo "🔍 查看 JSON 統計: cat $EXPORT_DIR/stocks_statistics.json"
echo "" 