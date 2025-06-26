#!/bin/bash

# 🚀 Stock Insight Platform - 朋友專用啟動腳本
# 這個腳本會自動處理所有常見問題，讓朋友可以輕鬆啟動項目

# WSL2 偵測與提示
if grep -qi microsoft /proc/version 2>/dev/null; then
    echo -e "${YELLOW}⚠️ 偵測到 WSL2 環境${NC}"
    echo -e "${BLUE}💡 請確保 Windows 上的 Docker Desktop 已啟動，且已啟用 WSL2 整合${NC}"
    echo -e "${BLUE}   1. Windows 啟動 Docker Desktop"
    echo -e "${BLUE}   2. Docker Desktop 設定 > Resources > WSL Integration 勾選你的 Linux 發行版"
    echo -e "${BLUE}   3. WSL2 終端機執行 docker info 應該能看到資訊"
    echo -e "${YELLOW}⚠️  如果 docker info 失敗，請先在 Windows 啟動 Docker Desktop，再重試本腳本${NC}"
fi

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

# 函數：檢查並修復 Docker 映像問題
fix_docker_images() {
    echo -e "${YELLOW}🔍 檢查 Docker 映像...${NC}"
    
    # 檢查必要的映像是否存在
    local required_images=(
        "mcr.microsoft.com/mssql/server:2022-latest"
        "postgres:15"
        "redis:7-alpine"
        "python:3.11-slim"
        "node:18-alpine"
    )
    
    for image in "${required_images[@]}"; do
        if ! docker images | grep -q "$(echo $image | cut -d: -f1)"; then
            echo -e "${YELLOW}📥 下載映像: $image${NC}"
            docker pull "$image" 2>/dev/null || true
        fi
    done
    
    echo -e "${GREEN}✅ Docker 映像檢查完成${NC}"
}

# 函數：檢查並修復 Docker Compose 問題
fix_docker_compose() {
    echo -e "${YELLOW}🔍 檢查 Docker Compose...${NC}"
    
    # 檢查 docker-compose 是否安裝
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${YELLOW}📥 安裝 Docker Compose...${NC}"
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS 通常已經包含在 Docker Desktop 中
            echo -e "${BLUE}💡 請確保 Docker Desktop 已安裝${NC}"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux 安裝 Docker Compose
            sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
        fi
    fi
    
    echo -e "${GREEN}✅ Docker Compose 檢查完成${NC}"
}

# 函數：檢查並修復系統資源問題
fix_system_resources() {
    echo -e "${YELLOW}🔍 檢查系統資源...${NC}"
    
    # 檢查可用磁盤空間
    local available_space=$(df . | awk 'NR==2 {print $4}')
    if [[ "$available_space" -lt 5242880 ]]; then  # 5GB
        echo -e "${RED}❌ 磁盤空間不足（需要至少 5GB）${NC}"
        echo -e "${YELLOW}💡 請清理磁盤空間後重試${NC}"
        exit 1
    fi
    
    # 檢查可用內存
    if [[ "$OSTYPE" == "darwin"* ]]; then
        local available_memory=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        if [[ "$available_memory" -lt 1048576 ]]; then  # 4GB
            echo -e "${YELLOW}⚠️  可用內存較少，建議關閉其他應用${NC}"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        local available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        if [[ "$available_memory" -lt 4096 ]]; then  # 4GB
            echo -e "${YELLOW}⚠️  可用內存較少，建議關閉其他應用${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ 系統資源檢查完成${NC}"
}

# 函數：檢查並修復防火牆問題
fix_firewall_issues() {
    echo -e "${YELLOW}🔍 檢查防火牆設置...${NC}"
    
    # 檢查常用端口是否被防火牆阻擋
    local ports=(5173 5001 1433 5433 6379)
    
    for port in "${ports[@]}"; do
        if command -v nc &> /dev/null; then
            if ! nc -z localhost $port 2>/dev/null; then
                echo -e "${YELLOW}⚠️  端口 $port 可能被阻擋${NC}"
            fi
        fi
    done
    
    echo -e "${GREEN}✅ 防火牆檢查完成${NC}"
}

# 函數：檢查並修復 DNS 問題
fix_dns_issues() {
    echo -e "${YELLOW}🔍 檢查 DNS 設置...${NC}"
    
    # 檢查 DNS 解析
    if ! nslookup google.com &> /dev/null; then
        echo -e "${YELLOW}⚠️  DNS 解析可能有問題${NC}"
        echo -e "${BLUE}💡 嘗試使用 Google DNS: 8.8.8.8${NC}"
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo -e "${BLUE}💡 在系統偏好設定 > 網路 > 進階 > DNS 中添加 8.8.8.8${NC}"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo -e "${BLUE}💡 編輯 /etc/resolv.conf 添加 nameserver 8.8.8.8${NC}"
        fi
    else
        echo -e "${GREEN}✅ DNS 解析正常${NC}"
    fi
}

# 函數：檢查並修復 Git 問題
fix_git_issues() {
    echo -e "${YELLOW}🔍 檢查 Git 設置...${NC}"
    
    # 檢查 Git 是否安裝
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}📥 安裝 Git...${NC}"
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS 安裝 Git
            if command -v brew &> /dev/null; then
                brew install git
            else
                echo -e "${BLUE}💡 請從 https://git-scm.com 下載安裝 Git${NC}"
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux 安裝 Git
            sudo apt-get update && sudo apt-get install -y git 2>/dev/null || \
            sudo yum install -y git 2>/dev/null || \
            sudo dnf install -y git 2>/dev/null || true
        fi
    fi
    
    # 檢查 Git 配置
    if ! git config --global user.name &> /dev/null; then
        echo -e "${YELLOW}📝 設置 Git 用戶名...${NC}"
        git config --global user.name "Stock Insight User"
        git config --global user.email "user@stockinsight.local"
    fi
    
    echo -e "${GREEN}✅ Git 設置完成${NC}"
}

# 函數：檢查並修復 Python 問題
fix_python_issues() {
    echo -e "${YELLOW}🔍 檢查 Python 環境...${NC}"
    
    # 檢查 Python 是否安裝
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        echo -e "${YELLOW}📥 安裝 Python...${NC}"
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS 安裝 Python
            if command -v brew &> /dev/null; then
                brew install python
            else
                echo -e "${BLUE}💡 請從 https://python.org 下載安裝 Python${NC}"
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux 安裝 Python
            sudo apt-get update && sudo apt-get install -y python3 python3-pip 2>/dev/null || \
            sudo yum install -y python3 python3-pip 2>/dev/null || \
            sudo dnf install -y python3 python3-pip 2>/dev/null || true
        fi
    fi
    
    echo -e "${GREEN}✅ Python 環境檢查完成${NC}"
}

# 函數：檢查並修復 Node.js 問題
fix_nodejs_issues() {
    echo -e "${YELLOW}🔍 檢查 Node.js 環境...${NC}"
    
    # 檢查 Node.js 是否安裝
    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}📥 安裝 Node.js...${NC}"
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS 安裝 Node.js
            if command -v brew &> /dev/null; then
                brew install node
            else
                echo -e "${BLUE}💡 請從 https://nodejs.org 下載安裝 Node.js${NC}"
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux 安裝 Node.js
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - 2>/dev/null || true
            sudo apt-get install -y nodejs 2>/dev/null || true
        fi
    fi
    
    echo -e "${GREEN}✅ Node.js 環境檢查完成${NC}"
}

# 函數：檢查並修復項目文件問題
fix_project_files() {
    echo -e "${YELLOW}🔍 檢查項目文件...${NC}"
    
    # 檢查必要的文件是否存在
    local required_files=(
        "docker-compose.dual.yml"
        "backend/app/__init__.py"
        "frontend/package.json"
        "scripts/import_stock_data_v2.py"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            echo -e "${RED}❌ 缺少必要文件: $file${NC}"
            echo -e "${YELLOW}💡 請確保項目完整克隆${NC}"
            exit 1
        fi
    done
    
    # 檢查並修復文件權限
    chmod +x scripts/*.sh 2>/dev/null || true
    
    echo -e "${GREEN}✅ 項目文件檢查完成${NC}"
}

# 函數：檢查並修復環境變數問題
fix_environment_variables() {
    echo -e "${YELLOW}🔍 檢查環境變數...${NC}"
    
    # 檢查 .env 文件是否存在
    if [[ ! -f ".env" ]]; then
        echo -e "${YELLOW}📝 創建 .env 文件...${NC}"
        cat > .env << EOF
# Stock Insight Platform 環境變數
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-here
FERNET_KEY=your-fernet-key-here

# 資料庫配置
DUAL_DATABASE_ENABLED=true
HOT_DATABASE_URL=mssql+pyodbc://sa:StrongP@ssw0rd!@localhost:1433/StockInsight_Hot?driver=ODBC+Driver+18+for+SQL+Server
COLD_DATABASE_URL=postgresql://postgres:StrongP@ssw0rd!@localhost:5433/StockInsight_Cold

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# 前端配置
VITE_API_BASE_URL=http://localhost:5001
VITE_WS_URL=ws://localhost:5001
EOF
        echo -e "${GREEN}✅ .env 文件已創建${NC}"
    fi
    
    echo -e "${GREEN}✅ 環境變數檢查完成${NC}"
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
fix_docker_images
fix_docker_compose
fix_system_resources
fix_firewall_issues
fix_dns_issues
fix_git_issues
fix_python_issues
fix_nodejs_issues
fix_project_files
fix_environment_variables

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
    local max_attempts=8  # 減少到 8 次
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.dual.yml ps $service | grep -q "Up"; then
            echo -e "${GREEN}✅ $service 運行正常${NC}"
            return 0
        else
            echo -e "${YELLOW}⏳ $service 啟動中... (嘗試 $attempt/$max_attempts)${NC}"
            
            # 如果服務啟動失敗，嘗試重啟
            if [ $attempt -eq 3 ]; then
                echo -e "${BLUE}🔄 嘗試重啟 $service...${NC}"
                docker-compose -f docker-compose.dual.yml restart $service 2>/dev/null || true
            fi
            
            sleep 5  # 減少等待時間到 5 秒
            attempt=$((attempt + 1))
        fi
    done
    
    echo -e "${RED}❌ $service 啟動失敗${NC}"
    echo -e "${YELLOW}💡 查看 $service 日誌:${NC}"
    echo -e "${CYAN}   docker-compose -f docker-compose.dual.yml logs $service${NC}"
    echo -e "${YELLOW}💡 繼續執行其他步驟...${NC}"
    return 1
}

# 並行檢查服務狀態（更快速）
echo -e "${BLUE}🔍 快速檢查核心服務...${NC}"
check_service hot-db &
check_service cold-db &
check_service redis &
wait

echo -e "${BLUE}🔍 檢查應用服務...${NC}"
check_service backend &
check_service frontend &
wait

# 創建資料庫（如果需要）
echo -e "${YELLOW}🗄️  檢查資料庫...${NC}"

# 檢查 MSSQL 資料庫
echo -e "${BLUE}📝 檢查 MSSQL 資料庫...${NC}"
for i in {1..3}; do  # 減少到 3 次
    if docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT name FROM sys.databases WHERE name = 'StockInsight_Hot'" 2>/dev/null | grep -q "StockInsight_Hot"; then
        echo -e "${GREEN}✅ MSSQL 資料庫已存在${NC}"
        break
    else
        if [ $i -eq 1 ]; then
            echo -e "${YELLOW}📝 創建 MSSQL 資料庫...${NC}"
        fi
        docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "CREATE DATABASE StockInsight_Hot" 2>/dev/null || true
        sleep 3  # 減少等待時間
    fi
done

# 檢查 PostgreSQL 資料庫
echo -e "${BLUE}📝 檢查 PostgreSQL 資料庫...${NC}"
for i in {1..3}; do  # 減少到 3 次
    if docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT 1" 2>/dev/null >/dev/null; then
        echo -e "${GREEN}✅ PostgreSQL 資料庫已存在${NC}"
        break
    else
        if [ $i -eq 1 ]; then
            echo -e "${YELLOW}📝 創建 PostgreSQL 資料庫...${NC}"
        fi
        docker exec stock-insight-cold-db psql -U postgres -c "CREATE DATABASE StockInsight_Cold" 2>/dev/null || true
        sleep 3  # 減少等待時間
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
sleep 5  # 減少等待時間

# 檢查應用是否響應
echo -e "${BLUE}🔍 檢查後端 API...${NC}"
for i in {1..3}; do  # 減少到 3 次
    if curl -s http://localhost:5001/api/health >/dev/null; then
        echo -e "${GREEN}✅ 後端 API 正常響應${NC}"
        break
    else
        if [ $i -eq 1 ]; then
            echo -e "${YELLOW}⏳ 等待後端 API 啟動...${NC}"
        fi
        sleep 3  # 減少等待時間
    fi
done

echo -e "${BLUE}🔍 檢查前端服務...${NC}"
for i in {1..3}; do  # 減少到 3 次
    if curl -s http://localhost:5173 >/dev/null; then
        echo -e "${GREEN}✅ 前端服務正常響應${NC}"
        break
    else
        if [ $i -eq 1 ]; then
            echo -e "${YELLOW}⏳ 等待前端服務啟動...${NC}"
        fi
        sleep 3  # 減少等待時間
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

# 緊急修復函數
emergency_fix() {
    echo ""
    echo -e "${RED}🚨 緊急修復模式${NC}"
    echo -e "${YELLOW}💡 如果遇到問題，請嘗試以下步驟：${NC}"
    echo ""
    
    echo -e "${BLUE}1. 完全重置 Docker 環境：${NC}"
    echo "   docker-compose -f docker-compose.dual.yml down -v"
    echo "   docker system prune -f"
    echo "   docker volume prune -f"
    echo ""
    
    echo -e "${BLUE}2. 重新啟動 Docker Desktop：${NC}"
    echo "   # macOS: 完全退出並重新啟動 Docker Desktop"
    echo "   # Windows: 重新啟動 Docker Desktop"
    echo "   # Linux: sudo systemctl restart docker"
    echo ""
    
    echo -e "${BLUE}3. 檢查端口衝突：${NC}"
    echo "   lsof -i :5173 -i :5001 -i :1433 -i :5433"
    echo ""
    
    echo -e "${BLUE}4. 手動啟動服務：${NC}"
    echo "   docker-compose -f docker-compose.dual.yml up -d"
    echo ""
    
    echo -e "${BLUE}5. 查看詳細日誌：${NC}"
    echo "   docker-compose -f docker-compose.dual.yml logs -f"
    echo ""
    
    echo -e "${BLUE}6. 重新運行此腳本：${NC}"
    echo "   ./scripts/start-for-friends.sh"
    echo ""
    
    echo -e "${YELLOW}💡 如果問題持續，請參考故障排除指南：${NC}"
    echo "   frontend/docs/guides/FRIENDLY_TROUBLESHOOTING.md"
}

# 錯誤處理
trap 'echo -e "\n${RED}❌ 腳本執行被中斷${NC}"; emergency_fix; exit 1' INT TERM

# 檢查最終狀態
echo -e "${YELLOW}🔍 檢查最終狀態...${NC}"
sleep 3

# 檢查所有服務是否正常運行
services_status=0
for service in hot-db cold-db redis backend frontend; do
    if ! docker-compose -f docker-compose.dual.yml ps $service | grep -q "Up"; then
        echo -e "${RED}❌ $service 未正常運行${NC}"
        services_status=1
    fi
done

if [ $services_status -eq 0 ]; then
    echo -e "${GREEN}✅ 所有服務運行正常！${NC}"
else
    echo -e "${YELLOW}⚠️  部分服務可能未正常運行${NC}"
    emergency_fix
fi

echo ""
echo -e "${GREEN}🎉 腳本執行完成！${NC}"
echo -e "${BLUE}💡 如有問題，請查看上方日誌或運行緊急修復步驟${NC}" 