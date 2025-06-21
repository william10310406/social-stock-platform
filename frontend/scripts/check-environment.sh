#!/bin/bash
# 統一環境檢查腳本
# 自動檢測環境類型並選擇適當的檢查方式

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# 腳本路徑
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUICK_CHECK_SCRIPT="$SCRIPT_DIR/quick-check.sh"
DOCKER_CHECK_SCRIPT="$SCRIPT_DIR/docker-check.sh"

echo -e "${BOLD}${BLUE}🔍 Stock Insight Platform 智能環境檢查${NC}"
echo "================================================="

# 環境檢測函數
detect_environment() {
    echo -e "\n${BOLD}${CYAN}🔍 檢測運行環境...${NC}"

    # 檢查是否在 Docker 容器內
    if [ -f /.dockerenv ]; then
        echo -e "  ${GREEN}✅ 檢測到 Docker 容器環境${NC}"
        return 0
    fi

    # 檢查是否有 Docker Compose 文件
    if [ -f "../docker-compose.yml" ] || [ -f "docker-compose.yml" ]; then
        echo -e "  ${CYAN}📦 檢測到 Docker Compose 配置${NC}"

        # 檢查 Docker 容器是否運行
        if docker-compose ps -q > /dev/null 2>&1; then
            local running_containers=$(docker-compose ps -q | wc -l)
            if [ "$running_containers" -gt 0 ]; then
                echo -e "  ${GREEN}✅ 檢測到 Docker 容器正在運行${NC}"
                return 0
            else
                echo -e "  ${YELLOW}⚠️  Docker Compose 配置存在但容器未運行${NC}"
                return 1
            fi
        else
            echo -e "  ${YELLOW}⚠️  Docker Compose 配置存在但未啟動${NC}"
            return 1
        fi
    fi

    # 檢查是否有本地開發服務運行
    if curl -s --max-time 2 "http://localhost:5173" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ 檢測到本地開發服務${NC}"
        return 2
    fi

    echo -e "  ${RED}❌ 未檢測到任何運行環境${NC}"
    return 3
}

# 顯示使用說明
show_usage() {
    echo -e "${BOLD}${BLUE}使用說明${NC}"
    echo "用法: $0 [選項]"
    echo ""
    echo "選項:"
    echo "  --help, -h        顯示此說明"
    echo "  --force-local     強制使用本地環境檢查"
    echo "  --force-docker    強制使用 Docker 環境檢查"
    echo "  --quick          快速檢查"
    echo "  --full           完整檢查 (預設)"
    echo "  --detect-only    僅檢測環境，不執行檢查"
    echo ""
    echo "範例:"
    echo "  $0                  # 自動檢測環境並執行檢查"
    echo "  $0 --quick          # 快速檢查"
    echo "  $0 --force-docker   # 強制使用 Docker 檢查"
    echo "  $0 --detect-only    # 僅檢測環境"
}

# 執行檢查
run_check() {
    local check_type="$1"
    local env_type="$2"

    if [ "$env_type" = "docker" ]; then
        echo -e "\n${BOLD}${BLUE}🐳 執行 Docker 環境檢查...${NC}"
        if [ "$check_type" = "quick" ]; then
            bash "$DOCKER_CHECK_SCRIPT" --quick
        else
            bash "$DOCKER_CHECK_SCRIPT" --full
        fi
    else
        echo -e "\n${BOLD}${BLUE}💻 執行本地環境檢查...${NC}"
        if [ "$check_type" = "quick" ]; then
            bash "$QUICK_CHECK_SCRIPT"
        else
            bash "$QUICK_CHECK_SCRIPT"
        fi
    fi
}

# 處理參數
FORCE_ENV=""
CHECK_TYPE="full"
DETECT_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_usage
            exit 0
            ;;
        --force-local)
            FORCE_ENV="local"
            shift
            ;;
        --force-docker)
            FORCE_ENV="docker"
            shift
            ;;
        --quick)
            CHECK_TYPE="quick"
            shift
            ;;
        --full)
            CHECK_TYPE="full"
            shift
            ;;
        --detect-only)
            DETECT_ONLY=true
            shift
            ;;
        *)
            echo -e "${RED}❌ 未知選項: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# 主執行邏輯
main() {
    # 如果強制指定環境
    if [ -n "$FORCE_ENV" ]; then
        echo -e "\n${YELLOW}⚡ 強制使用 $FORCE_ENV 環境檢查${NC}"
        if [ "$DETECT_ONLY" = true ]; then
            echo -e "${CYAN}🔍 環境類型: $FORCE_ENV (強制指定)${NC}"
            exit 0
        fi
        run_check "$CHECK_TYPE" "$FORCE_ENV"
        exit $?
    fi

    # 自動檢測環境
    detect_environment
    local detect_result=$?

    case $detect_result in
        0)
            ENV_TYPE="docker"
            echo -e "\n${GREEN}🎯 選擇環境: Docker${NC}"
            ;;
        1)
            ENV_TYPE="docker"
            echo -e "\n${YELLOW}🎯 選擇環境: Docker (但需要先啟動)${NC}"
            echo -e "${YELLOW}💡 建議執行: docker-compose up -d${NC}"
            ;;
        2)
            ENV_TYPE="local"
            echo -e "\n${GREEN}🎯 選擇環境: 本地開發${NC}"
            ;;
        3)
            echo -e "\n${RED}❌ 無法檢測到運行環境${NC}"
            echo -e "${YELLOW}💡 建議操作:${NC}"
            echo -e "  1. 啟動 Docker 環境: docker-compose up -d"
            echo -e "  2. 或啟動本地開發: npm run dev"
            exit 1
            ;;
    esac

    if [ "$DETECT_ONLY" = true ]; then
        echo -e "${CYAN}🔍 檢測到的環境類型: $ENV_TYPE${NC}"
        exit 0
    fi

    # 執行檢查
    run_check "$CHECK_TYPE" "$ENV_TYPE"
}

# 執行主函數
main "$@"
