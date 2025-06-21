#!/bin/bash
# Docker 環境專用檢查腳本
# 在 Docker 容器內部或從宿主機檢查 Docker 服務

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Docker 環境配置
CONTAINER_NAME_FRONTEND="stock-insight-frontend"
CONTAINER_NAME_BACKEND="stock-insight-backend"
CONTAINER_NAME_DB="stock-insight-db"
CONTAINER_NAME_REDIS="stock-insight-redis"

# 網路配置
NETWORK_NAME="stock-insight-net"
FRONTEND_PORT="5173"
BACKEND_PORT="5001"
DB_PORT="5433"
REDIS_PORT="6379"

# 檢測執行環境
if [ -f /.dockerenv ]; then
    RUNNING_IN_DOCKER=true
    BASE_URL="http://localhost:5173"
    API_BASE_URL=""  # 使用代理
    echo -e "${BOLD}${BLUE}🐳 在 Docker 容器內部執行檢查${NC}"
else
    RUNNING_IN_DOCKER=false
    BASE_URL="http://localhost:5173"
    API_BASE_URL="http://localhost:5001"
    echo -e "${BOLD}${BLUE}🖥️  從宿主機檢查 Docker 環境${NC}"
fi

# 計數器
TOTAL_CHECKS=0
SUCCESS_COUNT=0
FAIL_COUNT=0

echo "==========================================="

# 檢查 Docker 容器狀態
check_docker_containers() {
    echo -e "\n${BOLD}${CYAN}檢查 Docker 容器狀態...${NC}"

    local containers=("$CONTAINER_NAME_FRONTEND" "$CONTAINER_NAME_BACKEND" "$CONTAINER_NAME_DB" "$CONTAINER_NAME_REDIS")

    for container in "${containers[@]}"; do
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

        if docker ps --format "table {{.Names}}" | grep -q "^$container$"; then
            echo -e "  ${GREEN}✅ $container 運行中${NC}"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))

            # 檢查容器健康狀態
            health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "none")
            if [ "$health_status" = "healthy" ]; then
                echo -e "    ${GREEN}💚 健康檢查通過${NC}"
            elif [ "$health_status" = "unhealthy" ]; then
                echo -e "    ${RED}💔 健康檢查失敗${NC}"
            elif [ "$health_status" = "starting" ]; then
                echo -e "    ${YELLOW}⏳ 健康檢查啟動中${NC}"
            fi
        else
            echo -e "  ${RED}❌ $container 未運行${NC}"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi
    done
}

# 檢查 Docker 網路
check_docker_network() {
    echo -e "\n${BOLD}${CYAN}檢查 Docker 網路...${NC}"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if docker network ls | grep -q "$NETWORK_NAME"; then
        echo -e "  ${GREEN}✅ 網路 $NETWORK_NAME 存在${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))

        # 檢查容器網路連接
        echo -e "  ${CYAN}🔗 檢查容器網路連接...${NC}"
        connected_containers=$(docker network inspect "$NETWORK_NAME" --format='{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null || echo "")
        if [ -n "$connected_containers" ]; then
            echo -e "    ${GREEN}連接的容器: $connected_containers${NC}"
        else
            echo -e "    ${YELLOW}⚠️  沒有容器連接到此網路${NC}"
        fi
    else
        echo -e "  ${RED}❌ 網路 $NETWORK_NAME 不存在${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

# 檢查端口映射
check_port_mapping() {
    echo -e "\n${BOLD}${CYAN}檢查端口映射...${NC}"

    local ports=("$FRONTEND_PORT" "$BACKEND_PORT" "$DB_PORT" "$REDIS_PORT")
    local services=("前端" "後端" "資料庫" "Redis")

    for i in "${!ports[@]}"; do
        local port="${ports[$i]}"
        local service="${services[$i]}"

        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

        if netstat -tlnp 2>/dev/null | grep -q ":$port " || ss -tlnp 2>/dev/null | grep -q ":$port "; then
            echo -e "  ${GREEN}✅ 端口 $port ($service) 正在監聽${NC}"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo -e "  ${RED}❌ 端口 $port ($service) 未監聽${NC}"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi
    done
}

# 檢查服務健康狀態
check_service_health() {
    echo -e "\n${BOLD}${CYAN}檢查服務健康狀態...${NC}"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    # 檢查前端服務
    if curl -s --max-time 5 "$BASE_URL" > /dev/null; then
        echo -e "  ${GREEN}✅ 前端服務響應正常${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "  ${RED}❌ 前端服務無響應${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    # 檢查後端 API
    if [ "$RUNNING_IN_DOCKER" = true ]; then
        # 在容器內部，使用代理路徑
        api_url="$BASE_URL/api/health"
    else
        # 從宿主機，直接訪問後端
        api_url="$API_BASE_URL/api/health"
    fi

    if curl -s --max-time 5 "$api_url" > /dev/null; then
        echo -e "  ${GREEN}✅ 後端 API 響應正常${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "  ${RED}❌ 後端 API 無響應${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

# 檢查容器間通訊
check_container_communication() {
    if [ "$RUNNING_IN_DOCKER" = false ]; then
        echo -e "\n${BOLD}${CYAN}檢查容器間通訊...${NC}"

        # 檢查前端是否能訪問後端
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

        if docker exec "$CONTAINER_NAME_FRONTEND" curl -s --max-time 5 "http://$CONTAINER_NAME_BACKEND:5000/api/health" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✅ 前端 → 後端通訊正常${NC}"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo -e "  ${RED}❌ 前端 → 後端通訊失敗${NC}"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi

        # 檢查後端是否能訪問資料庫
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

        if docker exec "$CONTAINER_NAME_BACKEND" python -c "
import psycopg2
try:
    conn = psycopg2.connect(
        host='$CONTAINER_NAME_DB',
        port=5432,
        database='stock_insight',
        user='stock_user',
        password='stock_password123'
    )
    conn.close()
    print('OK')
except Exception as e:
    print(f'ERROR: {e}')
    exit(1)
" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✅ 後端 → 資料庫通訊正常${NC}"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo -e "  ${RED}❌ 後端 → 資料庫通訊失敗${NC}"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi

        # 檢查後端是否能訪問 Redis
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

        if docker exec "$CONTAINER_NAME_BACKEND" python -c "
import redis
try:
    r = redis.Redis(host='$CONTAINER_NAME_REDIS', port=6379, db=0)
    r.ping()
    print('OK')
except Exception as e:
    print(f'ERROR: {e}')
    exit(1)
" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✅ 後端 → Redis 通訊正常${NC}"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo -e "  ${RED}❌ 後端 → Redis 通訊失敗${NC}"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi
    else
        echo -e "\n${YELLOW}⚠️  在容器內部運行，跳過容器間通訊檢查${NC}"
    fi
}

# 檢查 Docker 資源使用
check_docker_resources() {
    echo -e "\n${BOLD}${CYAN}檢查 Docker 資源使用...${NC}"

    echo -e "  ${CYAN}📊 容器資源使用情況:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -5

    echo -e "\n  ${CYAN}💾 磁碟使用情況:${NC}"
    docker system df
}

# 檢查 Docker 日誌
check_docker_logs() {
    echo -e "\n${BOLD}${CYAN}檢查 Docker 日誌 (最近 10 行)...${NC}"

    local containers=("$CONTAINER_NAME_FRONTEND" "$CONTAINER_NAME_BACKEND")

    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "^$container$"; then
            echo -e "\n  ${CYAN}📋 $container 日誌:${NC}"
            docker logs --tail 10 "$container" 2>&1 | sed 's/^/    /'
        fi
    done
}

# 執行完整的功能測試
run_functional_tests() {
    echo -e "\n${BOLD}${CYAN}執行功能測試...${NC}"

    if [ "$RUNNING_IN_DOCKER" = true ]; then
        echo -e "  ${CYAN}🧪 在容器內執行測試頁面...${NC}"
        # 在容器內部，可以訪問測試頁面
        if curl -s --max-time 10 "$BASE_URL/complete-test.html" > /dev/null; then
            echo -e "  ${GREEN}✅ 測試頁面可訪問${NC}"
        else
            echo -e "  ${RED}❌ 測試頁面不可訪問${NC}"
        fi
    else
        echo -e "  ${CYAN}🧪 從宿主機執行功能測試...${NC}"
        echo -e "  ${YELLOW}💡 建議訪問: http://localhost:5173/complete-test.html${NC}"
    fi
}

# 生成 Docker 環境報告
generate_docker_report() {
    echo -e "\n${BOLD}${CYAN}=== Docker 環境檢查報告 ===${NC}"
    echo "🐳 執行環境: $([ "$RUNNING_IN_DOCKER" = true ] && echo "容器內部" || echo "宿主機")"
    echo "📊 總共檢查: $TOTAL_CHECKS 個項目"
    echo -e "✅ 成功: ${GREEN}$SUCCESS_COUNT${NC}"
    echo -e "❌ 失敗: ${RED}$FAIL_COUNT${NC}"

    if [ $TOTAL_CHECKS -gt 0 ]; then
        SUCCESS_RATE=$((SUCCESS_COUNT * 100 / TOTAL_CHECKS))
        echo "📈 成功率: $SUCCESS_RATE%"
    fi

    if [ $FAIL_COUNT -gt 0 ]; then
        echo -e "\n${YELLOW}🔧 Docker 環境修復建議:${NC}"
        echo "1. 檢查容器狀態: docker-compose ps"
        echo "2. 重啟服務: docker-compose restart"
        echo "3. 查看日誌: docker-compose logs -f"
        echo "4. 檢查網路: docker network inspect $NETWORK_NAME"
        echo "5. 檢查端口: docker-compose port frontend 5173"
        echo "6. 完全重建: docker-compose down && docker-compose up --build -d"

        exit 1
    else
        echo -e "\n${GREEN}🎉 Docker 環境完全正常！${NC}"
        echo -e "${CYAN}🚀 可以開始使用 Stock Insight Platform${NC}"
        echo -e "${CYAN}📱 訪問: http://localhost:5173${NC}"
        echo -e "${CYAN}🧪 測試: http://localhost:5173/complete-test.html${NC}"
        exit 0
    fi
}

# 主執行流程
main() {
    # 基本檢查
    check_docker_containers
    check_docker_network
    check_port_mapping

    # 服務檢查
    check_service_health
    check_container_communication

    # 資源和日誌檢查
    check_docker_resources
    check_docker_logs

    # 功能測試
    run_functional_tests

    # 生成報告
    generate_docker_report
}

# 顯示使用說明
show_usage() {
    echo -e "${BOLD}${BLUE}Docker 檢查腳本使用說明${NC}"
    echo "用法: $0 [選項]"
    echo ""
    echo "選項:"
    echo "  --help, -h     顯示此說明"
    echo "  --quick        快速檢查 (僅檢查容器狀態)"
    echo "  --full         完整檢查 (預設)"
    echo "  --logs         顯示更多日誌信息"
    echo ""
    echo "範例:"
    echo "  $0              # 執行完整檢查"
    echo "  $0 --quick      # 快速檢查"
    echo "  $0 --logs       # 顯示詳細日誌"
}

# 處理命令行參數
case "${1:-}" in
    --help|-h)
        show_usage
        exit 0
        ;;
    --quick)
        echo -e "${BOLD}${BLUE}🚀 快速 Docker 檢查${NC}"
        check_docker_containers
        check_service_health
        generate_docker_report
        ;;
    --logs)
        echo -e "${BOLD}${BLUE}📋 Docker 日誌檢查${NC}"
        check_docker_logs
        ;;
    --full|"")
        main
        ;;
    *)
        echo -e "${RED}❌ 未知選項: $1${NC}"
        show_usage
        exit 1
        ;;
esac
