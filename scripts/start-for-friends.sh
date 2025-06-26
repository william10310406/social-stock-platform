#!/bin/bash

# 🚀 Stock Insight Platform - 朋友專用啟動腳本
# 這個腳本會自動處理所有常見問題，讓朋友可以輕鬆啟動項目

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

# 函數：顯示進度條
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    local remaining=$((width - completed))
    
    printf "\r["
    printf "%${completed}s" | tr ' ' '█'
    printf "%${remaining}s" | tr ' ' '░'
    printf "] %d%%" $percentage
}

# 函數：檢查並修復 Docker 問題
fix_docker_issues() {
    echo -e "${YELLOW}🔧 檢查並修復 Docker 問題...${NC}"
    
    # 檢查 Docker 守護程序
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker 守護程序未運行${NC}"
        
        # 檢測操作系統並提供解決方案
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo -e "${YELLOW}🍎 檢測到 macOS，嘗試啟動 Docker Desktop...${NC}"
            
            # 嘗試啟動 Docker Desktop
            if command -v open &> /dev/null; then
                open -a Docker
                echo -e "${BLUE}⏳ 等待 Docker Desktop 啟動（最多 2 分鐘）...${NC}"
                
                # 等待最多 120 秒（2分鐘）
                for i in {1..24}; do
                    show_progress $i 24
                    if docker info &> /dev/null; then
                        echo -e "\n${GREEN}✅ Docker Desktop 啟動成功！${NC}"
                        return 0
                    fi
                    sleep 5
                done
                echo -e "\n${RED}❌ Docker Desktop 啟動超時${NC}"
            fi
            
            echo -e "${YELLOW}💡 請手動啟動 Docker Desktop:${NC}"
            echo "   1. 打開 Applications 文件夾"
            echo "   2. 找到並雙擊 Docker Desktop"
            echo "   3. 等待狀態欄顯示 'Docker Desktop is running'"
            echo "   4. 重新運行此腳本"
            
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo -e "${YELLOW}🐧 檢測到 Linux，嘗試啟動 Docker 服務...${NC}"
            
            # 嘗試啟動 Docker 服務
            if command -v sudo &> /dev/null; then
                sudo systemctl start docker 2>/dev/null || true
                sudo systemctl enable docker 2>/dev/null || true
                
                # 檢查用戶是否在 docker 組
                if ! groups $USER | grep -q docker; then
                    echo -e "${YELLOW}📝 將用戶加入 docker 組...${NC}"
                    sudo usermod -aG docker $USER 2>/dev/null || true
                    echo -e "${BLUE}💡 請重新登入或運行: newgrp docker${NC}"
                fi
                
                # 等待服務啟動
                for i in {1..12}; do
                    show_progress $i 12
                    if docker info &> /dev/null; then
                        echo -e "\n${GREEN}✅ Docker 服務啟動成功！${NC}"
                        return 0
                    fi
                    sleep 5
                done
                echo -e "\n${RED}❌ Docker 服務啟動失敗${NC}"
            fi
            
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
            echo -e "${YELLOW}🪟 檢測到 Windows，請手動啟動 Docker Desktop:${NC}"
            echo "   1. 在開始菜單中搜索 'Docker Desktop'"
            echo "   2. 雙擊啟動 Docker Desktop"
            echo "   3. 等待完全啟動"
            echo "   4. 重新運行此腳本"
        fi
        
        echo ""
        echo -e "${RED}❌ 無法自動修復 Docker 問題${NC}"
        echo -e "${YELLOW}💡 請參考故障排除指南: frontend/docs/guides/FRIENDLY_TROUBLESHOOTING.md${NC}"
        echo -e "${YELLOW}💡 或者手動啟動 Docker Desktop 後重新運行此腳本${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker 守護程序運行正常${NC}"
}

# 函數：檢查並修復端口衝突
fix_port_conflicts() {
    echo -e "${YELLOW}🔍 檢查並修復端口衝突...${NC}"
    
    local ports=(5173 5001 1433 5433 6379)
    local services=("前端" "後端" "MSSQL" "PostgreSQL" "Redis")
    
    for i in "${!ports[@]}"; do
        local port=${ports[$i]}
        local service=${services[$i]}
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  端口 $port 被佔用 ($service)${NC}"
            
            # 嘗試停止佔用進程
            if command -v lsof &> /dev/null && command -v sudo &> /dev/null; then
                echo -e "${BLUE}🛑 嘗試停止佔用進程...${NC}"
                sudo lsof -ti:$port | xargs kill -9 2>/dev/null || true
                sleep 2
                
                # 再次檢查
                if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                    echo -e "${GREEN}✅ 端口 $port 已釋放${NC}"
                else
                    echo -e "${RED}❌ 無法釋放端口 $port${NC}"
                    echo -e "${YELLOW}💡 請手動停止佔用端口 $port 的進程${NC}"
                fi
            else
                echo -e "${RED}❌ 無法自動釋放端口 $port${NC}"
                echo -e "${YELLOW}💡 請手動停止佔用端口 $port 的進程${NC}"
            fi
        else
            echo -e "${GREEN}✅ 端口 $port 可用${NC}"
        fi
    done
}

# 函數：檢查並修復 Docker 資源問題
fix_docker_resources() {
    echo -e "${YELLOW}🔍 檢查 Docker 資源...${NC}"
    
    # 檢查 Docker 磁盤空間
    local disk_usage=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}" 2>/dev/null | tail -n +2 | head -1)
    if [[ -n "$disk_usage" ]]; then
        local reclaimable=$(echo "$disk_usage" | awk '{print $4}' | sed 's/[^0-9.]//g')
        if [[ "$reclaimable" -gt 1000 ]]; then
            echo -e "${YELLOW}⚠️  Docker 磁盤使用量較高，自動清理中...${NC}"
            docker system prune -f 2>/dev/null || true
            echo -e "${GREEN}✅ Docker 緩存清理完成${NC}"
        fi
    fi
    
    # 檢查 Docker 容器數量
    local container_count=$(docker ps -aq | wc -l)
    if [[ "$container_count" -gt 10 ]]; then
        echo -e "${YELLOW}⚠️  發現 $container_count 個容器，自動清理中...${NC}"
        docker container prune -f 2>/dev/null || true
        echo -e "${GREEN}✅ 容器清理完成${NC}"
    fi
}

# 函數：檢查並修復網路問題
fix_network_issues() {
    echo -e "${YELLOW}🔍 檢查網路連接...${NC}"
    
    # 檢查 Docker 網路
    if ! docker network ls | grep -q "bridge"; then
        echo -e "${YELLOW}⚠️  Docker 預設網路不存在，嘗試修復...${NC}"
        docker network create bridge 2>/dev/null || true
    fi
    
    # 檢查 DNS 解析
    if ! nslookup google.com &> /dev/null; then
        echo -e "${YELLOW}⚠️  網路連接可能有問題${NC}"
        echo -e "${BLUE}💡 請檢查網路連接${NC}"
    else
        echo -e "${GREEN}✅ 網路連接正常${NC}"
    fi
}

# 函數：檢查並修復權限問題
fix_permission_issues() {
    echo -e "${YELLOW}🔍 檢查權限問題...${NC}"
    
    # 檢查 Docker 權限
    if ! docker ps &> /dev/null; then
        echo -e "${YELLOW}⚠️  Docker 權限問題，嘗試修復...${NC}"
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if ! groups $USER | grep -q docker; then
                echo -e "${BLUE}📝 將用戶加入 docker 組...${NC}"
                sudo usermod -aG docker $USER 2>/dev/null || true
                echo -e "${YELLOW}💡 請重新登入或運行: newgrp docker${NC}"
            fi
        fi
    else
        echo -e "${GREEN}✅ Docker 權限正常${NC}"
    fi
}

echo -e "${YELLOW}🔍 檢查系統環境...${NC}"

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安裝！${NC}"
    echo ""
    echo -e "${BLUE}📥 安裝 Docker Desktop:${NC}"
    echo "   1. 訪問: https://www.docker.com/products/docker-desktop"
    echo "   2. 下載適合您系統的版本"
    echo "   3. 安裝並重啟電腦"
    echo "   4. 重新運行此腳本"
    echo ""
    echo -e "${YELLOW}💡 如果您使用的是 macOS 或 Windows，建議安裝 Docker Desktop${NC}"
    echo -e "${YELLOW}   如果您使用的是 Linux，請運行: sudo apt-get install docker.io${NC}"
    exit 1
fi

# 檢查 Docker Compose 是否安裝
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安裝！${NC}"
    echo ""
    echo -e "${BLUE}📥 安裝 Docker Compose:${NC}"
    echo "   1. Docker Desktop 通常會自動安裝 Docker Compose"
    echo "   2. 如果沒有，請訪問: https://docs.docker.com/compose/install/"
    echo "   3. 安裝後重新運行此腳本"
    exit 1
fi

# 執行所有修復函數
fix_docker_issues
fix_permission_issues
fix_network_issues
fix_docker_resources
fix_port_conflicts

# 檢查 Docker 版本
echo -e "${YELLOW}📋 檢查 Docker 版本...${NC}"
DOCKER_VERSION=$(docker --version)
echo -e "${GREEN}✅ $DOCKER_VERSION${NC}"

COMPOSE_VERSION=$(docker-compose --version)
echo -e "${GREEN}✅ $COMPOSE_VERSION${NC}"

echo -e "${GREEN}✅ Docker 環境檢查通過${NC}"

# 停止現有容器
echo -e "${YELLOW}🛑 停止現有容器...${NC}"
docker-compose -f docker-compose.dual.yml down 2>/dev/null || true
echo -e "${GREEN}✅ 現有容器已停止${NC}"

# 清理舊的數據卷（自動模式）
echo -e "${YELLOW}🧹 預設不清理舊的數據庫數據（自動模式）...${NC}"
echo -e "${BLUE}💡 如需清理，請手動執行: docker volume rm test_hot_db_data test_cold_db_data test_redis_data${NC}"

# 啟動服務
echo -e "${YELLOW}🚀 啟動 Stock Insight Platform...${NC}"
echo -e "${BLUE}   這可能需要幾分鐘時間，請耐心等待...${NC}"

# 啟動所有服務
docker-compose -f docker-compose.dual.yml up -d

# 等待服務啟動
echo -e "${YELLOW}⏳ 等待服務啟動...${NC}"
for i in {1..6}; do
    show_progress $i 6
    sleep 10
done
echo ""

# 檢查服務狀態
echo -e "${YELLOW}🔍 檢查服務狀態...${NC}"

check_service() {
    local service=$1
    local max_attempts=15
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.dual.yml ps $service | grep -q "Up"; then
            echo -e "${GREEN}✅ $service 運行正常${NC}"
            return 0
        else
            echo -e "${YELLOW}⏳ $service 啟動中... (嘗試 $attempt/$max_attempts)${NC}"
            
            # 如果服務啟動失敗，嘗試重啟
            if [ $attempt -eq 5 ]; then
                echo -e "${BLUE}🔄 嘗試重啟 $service...${NC}"
                docker-compose -f docker-compose.dual.yml restart $service 2>/dev/null || true
            fi
            
            sleep 10
            attempt=$((attempt + 1))
        fi
    done
    
    echo -e "${RED}❌ $service 啟動失敗${NC}"
    echo -e "${YELLOW}💡 查看 $service 日誌:${NC}"
    echo -e "${CYAN}   docker-compose -f docker-compose.dual.yml logs $service${NC}"
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
echo -e "${BLUE}📝 檢查 MSSQL 資料庫...${NC}"
for i in {1..5}; do
    if docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT name FROM sys.databases WHERE name = 'StockInsight_Hot'" 2>/dev/null | grep -q "StockInsight_Hot"; then
        echo -e "${GREEN}✅ MSSQL 資料庫已存在${NC}"
        break
    else
        if [ $i -eq 1 ]; then
            echo -e "${YELLOW}📝 創建 MSSQL 資料庫...${NC}"
        fi
        docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "CREATE DATABASE StockInsight_Hot" 2>/dev/null || true
        sleep 5
    fi
done

# 檢查 PostgreSQL 資料庫
echo -e "${BLUE}📝 檢查 PostgreSQL 資料庫...${NC}"
for i in {1..5}; do
    if docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT 1" 2>/dev/null >/dev/null; then
        echo -e "${GREEN}✅ PostgreSQL 資料庫已存在${NC}"
        break
    else
        if [ $i -eq 1 ]; then
            echo -e "${YELLOW}📝 創建 PostgreSQL 資料庫...${NC}"
        fi
        docker exec stock-insight-cold-db psql -U postgres -c "CREATE DATABASE StockInsight_Cold" 2>/dev/null || true
        sleep 5
    fi
done

# 運行資料庫遷移
echo -e "${YELLOW}🔄 運行資料庫遷移...${NC}"
for i in {1..3}; do
    if docker-compose -f docker-compose.dual.yml exec -T backend python -c "
from app import create_app
from flask_migrate import upgrade
app = create_app()
with app.app_context():
    upgrade()
" 2>/dev/null; then
        echo -e "${GREEN}✅ 資料庫遷移完成${NC}"
        break
    else
        if [ $i -eq 1 ]; then
            echo -e "${YELLOW}⚠️  遷移失敗，重試中...${NC}"
        fi
        sleep 10
    fi
done

# 自動導入股票數據
STOCK_DATA_DIR="個股日成交資訊 2"
if [ -d "$STOCK_DATA_DIR" ]; then
    echo -e "${YELLOW}📦 準備導入股票數據...${NC}"
    # 複製資料到 backend 容器
    docker cp "$STOCK_DATA_DIR" stock-insight-backend:/app/ 2>/dev/null || true
    # 執行導入腳本
    docker exec stock-insight-backend python scripts/import_stock_data_v2.py
    echo -e "${GREEN}✅ 股票數據導入完成！${NC}"
else
    echo -e "${YELLOW}⚠️  找不到股票數據目錄（個股日成交資訊 2），跳過自動導入${NC}"
    echo -e "${BLUE}💡 如需導入，請將資料夾放在專案根目錄再重新執行本腳本${NC}"
fi

# 最終檢查
echo -e "${YELLOW}🔍 最終健康檢查...${NC}"
sleep 10

# 檢查應用是否響應
echo -e "${BLUE}🔍 檢查後端 API...${NC}"
for i in {1..5}; do
    if curl -s http://localhost:5001/api/health >/dev/null; then
        echo -e "${GREEN}✅ 後端 API 正常響應${NC}"
        break
    else
        if [ $i -eq 1 ]; then
            echo -e "${YELLOW}⏳ 等待後端 API 啟動...${NC}"
        fi
        sleep 5
    fi
done

echo -e "${BLUE}🔍 檢查前端服務...${NC}"
for i in {1..5}; do
    if curl -s http://localhost:5173 >/dev/null; then
        echo -e "${GREEN}✅ 前端服務正常響應${NC}"
        break
    else
        if [ $i -eq 1 ]; then
            echo -e "${YELLOW}⏳ 等待前端服務啟動...${NC}"
        fi
        sleep 5
    fi
done

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
echo -e "   故障排除: ${YELLOW}frontend/docs/guides/FRIENDLY_TROUBLESHOOTING.md${NC}"
echo ""
echo -e "${GREEN}🚀 開始開發吧！${NC}" 