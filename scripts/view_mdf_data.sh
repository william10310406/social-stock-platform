#!/bin/bash

# 查看 MDF 文件資料的自動化腳本
# 使用方法: ./scripts/view_mdf_data.sh

set -e

echo "🔍 Stock Insight Platform - MDF 資料查看工具"
echo "=============================================="

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未運行，請先啟動 Docker"
    exit 1
fi

# 檢查 mssql_backup 目錄是否存在
if [ ! -d "mssql_backup" ]; then
    echo "❌ mssql_backup 目錄不存在"
    exit 1
fi

# 檢查 MDF 文件是否存在
if [ ! -f "mssql_backup/StockInsight.mdf" ]; then
    echo "❌ 找不到 StockInsight.mdf 文件"
    exit 1
fi

echo "✅ 找到 MDF 文件: $(ls -lh mssql_backup/StockInsight.mdf | awk '{print $5}')"

# 啟動 Docker 容器（如果還沒運行）
echo "📦 啟動 Docker 容器..."
docker-compose up -d db

# 等待資料庫啟動
echo "⏳ 等待 SQL Server 啟動..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${MSSQL_SA_PASSWORD:-StockInsight123!}" -Q "SELECT 1" -C > /dev/null 2>&1; then
        echo "✅ SQL Server 已準備就緒"
        break
    fi
    sleep 2
    counter=$((counter + 2))
    echo "⏳ 等待中... ($counter/$timeout 秒)"
done

if [ $counter -ge $timeout ]; then
    echo "❌ SQL Server 啟動超時"
    exit 1
fi

# 執行附加資料庫腳本
echo "📎 附加 MDF 文件到資料庫..."
docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${MSSQL_SA_PASSWORD:-StockInsight123!}" \
    -i /app/scripts/attach_mdf_database.sql \
    -C

# 查看資料庫資料
echo "📊 查看資料庫內容..."
docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${MSSQL_SA_PASSWORD:-StockInsight123!}" \
    -i /app/scripts/view_database_data.sql \
    -C

echo ""
echo "🎉 資料查看完成！"
echo ""
echo "💡 如需查看特定表格的詳細資料，可以執行："
echo "   docker-compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P '${MSSQL_SA_PASSWORD:-StockInsight123!}' -Q \"USE StockInsightFromMDF; SELECT * FROM [表格名稱];\" -C"
echo ""
echo "🔗 或者連接到容器執行互動式查詢："
echo "   docker-compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P '${MSSQL_SA_PASSWORD:-StockInsight123!}' -C" 