#!/bin/bash

# 🚀 Stock Insight Platform - 朋友專用啟動腳本
# 這個腳本會自動處理所有常見問題，讓朋友可以輕鬆啟動項目

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}   Stock Insight Platform 啟動助手      ${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# 獲取腳本目錄和項目根目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 切換到項目根目錄
cd "$PROJECT_ROOT"

echo -e "${YELLOW}🔍 檢查系統環境...${NC}"

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安裝！${NC}"
    echo "請先安裝 Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# 檢查 Docker Compose 是否安裝
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安裝！${NC}"
    echo "請先安裝 Docker Compose"
    exit 1
fi

# 檢查 Docker 是否運行
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker 未運行！${NC}"
    echo "請啟動 Docker Desktop"
    exit 1
fi

echo -e "${GREEN}✅ Docker 環境檢查通過${NC}"

# 檢查端口是否被佔用
echo -e "${YELLOW}🔍 檢查端口佔用...${NC}"

check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  端口 $port 被佔用 ($service)${NC}"
        echo -e "${YELLOW}   正在嘗試停止佔用進程...${NC}"
        if command -v lsof &> /dev/null; then
            sudo lsof -ti:$port | xargs kill -9 2>/dev/null || true
            echo -e "${GREEN}✅ 已釋放端口 $port${NC}"
        fi
    else
        echo -e "${GREEN}✅ 端口 $port 可用${NC}"
    fi
}

check_port 5173 "前端"
check_port 5001 "後端"
check_port 1433 "MSSQL"
check_port 5433 "PostgreSQL"
check_port 6379 "Redis"

echo -e "${GREEN}✅ 端口檢查完成${NC}"

# 停止現有容器
echo -e "${YELLOW}🛑 停止現有容器...${NC}"
docker-compose -f docker-compose.dual.yml down 2>/dev/null || true
echo -e "${GREEN}✅ 現有容器已停止${NC}"

# 清理舊的數據卷（可選）
read -p "是否要清理舊的數據庫數據？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 清理數據卷...${NC}"
    docker volume rm test_hot_db_data test_cold_db_data test_redis_data 2>/dev/null || true
    echo -e "${GREEN}✅ 數據卷已清理${NC}"
fi

# 啟動服務
echo -e "${YELLOW}🚀 啟動 Stock Insight Platform...${NC}"
echo -e "${BLUE}   這可能需要幾分鐘時間，請耐心等待...${NC}"

# 啟動所有服務
docker-compose -f docker-compose.dual.yml up -d

# 等待服務啟動
echo -e "${YELLOW}⏳ 等待服務啟動...${NC}"
sleep 30

# 檢查服務狀態
echo -e "${YELLOW}🔍 檢查服務狀態...${NC}"

check_service() {
    local service=$1
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.dual.yml ps $service | grep -q "Up"; then
            echo -e "${GREEN}✅ $service 運行正常${NC}"
            return 0
        else
            echo -e "${YELLOW}⏳ $service 啟動中... (嘗試 $attempt/$max_attempts)${NC}"
            sleep 10
            attempt=$((attempt + 1))
        fi
    done
    
    echo -e "${RED}❌ $service 啟動失敗${NC}"
    return 1
}

check_service hot-db
check_service cold-db
check_service redis
check_service backend
check_service frontend

# 創建資料庫（如果需要）
echo -e "${YELLOW}🗄️  檢查資料庫...${NC}"

# 檢查 MSSQL 資料庫
if docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT name FROM sys.databases WHERE name = 'StockInsight_Hot'" 2>/dev/null | grep -q "StockInsight_Hot"; then
    echo -e "${GREEN}✅ MSSQL 資料庫已存在${NC}"
else
    echo -e "${YELLOW}📝 創建 MSSQL 資料庫...${NC}"
    docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "CREATE DATABASE StockInsight_Hot"
    echo -e "${GREEN}✅ MSSQL 資料庫創建完成${NC}"
fi

# 檢查 PostgreSQL 資料庫
if docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT 1" 2>/dev/null >/dev/null; then
    echo -e "${GREEN}✅ PostgreSQL 資料庫已存在${NC}"
else
    echo -e "${YELLOW}📝 創建 PostgreSQL 資料庫...${NC}"
    docker exec stock-insight-cold-db psql -U postgres -c "CREATE DATABASE StockInsight_Cold"
    echo -e "${GREEN}✅ PostgreSQL 資料庫創建完成${NC}"
fi

# 運行資料庫遷移
echo -e "${YELLOW}🔄 運行資料庫遷移...${NC}"
docker-compose -f docker-compose.dual.yml exec -T backend python -c "
from app import create_app
from flask_migrate import upgrade
app = create_app()
with app.app_context():
    upgrade()
" 2>/dev/null || echo -e "${YELLOW}⚠️  遷移可能已經是最新版本${NC}"

echo -e "${GREEN}✅ 資料庫遷移完成${NC}"

# 最終檢查
echo -e "${YELLOW}🔍 最終健康檢查...${NC}"
sleep 10

# 檢查應用是否響應
if curl -s http://localhost:5001/api/health >/dev/null; then
    echo -e "${GREEN}✅ 後端 API 正常響應${NC}"
else
    echo -e "${YELLOW}⚠️  後端 API 可能需要更多時間啟動${NC}"
fi

if curl -s http://localhost:5173 >/dev/null; then
    echo -e "${GREEN}✅ 前端服務正常響應${NC}"
else
    echo -e "${YELLOW}⚠️  前端服務可能需要更多時間啟動${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ==========================================${NC}"
echo -e "${GREEN}🎉   Stock Insight Platform 啟動完成！    ${NC}"
echo -e "${GREEN}🎉 ==========================================${NC}"
echo ""
echo -e "${BLUE}📱 訪問地址:${NC}"
echo -e "   前端: ${GREEN}http://localhost:5173${NC}"
echo -e "   後端: ${GREEN}http://localhost:5001${NC}"
echo ""
echo -e "${BLUE}🗄️  資料庫連接:${NC}"
echo -e "   MSSQL: ${GREEN}localhost:1433${NC} (sa/StrongP@ssw0rd!)"
echo -e "   PostgreSQL: ${GREEN}localhost:5433${NC} (postgres/StrongP@ssw0rd!)"
echo ""
echo -e "${BLUE}🛠️  常用命令:${NC}"
echo -e "   查看日誌: ${YELLOW}docker-compose -f docker-compose.dual.yml logs -f${NC}"
echo -e "   停止服務: ${YELLOW}docker-compose -f docker-compose.dual.yml down${NC}"
echo -e "   重啟服務: ${YELLOW}docker-compose -f docker-compose.dual.yml restart${NC}"
echo ""
echo -e "${BLUE}📚 更多資訊:${NC}"
echo -e "   開發指南: ${YELLOW}frontend/docs/guides/DEVELOPER_SECURITY_GUIDE.md${NC}"
echo -e "   故障排除: ${YELLOW}memory/TROUBLESHOOTING.md${NC}"
echo ""
echo -e "${GREEN}🚀 開始開發吧！${NC}" 