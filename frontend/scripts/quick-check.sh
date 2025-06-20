#!/bin/bash
# 快速路徑檢查腳本
# 檢查所有重要的頁面和資源是否可以正常訪問

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# 基礎 URL
BASE_URL="http://localhost:5173"
API_BASE_URL="http://localhost:5001"

# 計數器
TOTAL_CHECKS=0
SUCCESS_COUNT=0
FAIL_COUNT=0

echo -e "${BOLD}${BLUE}🔍 Stock Insight Platform 快速路徑檢查${NC}"
echo "==========================================="

# 檢查單個 URL 的函數
check_url() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" | grep -q "^$expected_status$"; then
        echo -e "  ${GREEN}✅ $name${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        return 0
    else
        echo -e "  ${RED}❌ $name ($url)${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

# 檢查服務是否運行
check_service() {
    echo -e "\n${BOLD}${CYAN}檢查服務狀態...${NC}"

    if curl -s --max-time 3 "$BASE_URL" > /dev/null; then
        echo -e "  ${GREEN}✅ 前端服務運行中${NC}"
        FRONTEND_RUNNING=true
    else
        echo -e "  ${RED}❌ 前端服務未運行${NC}"
        echo -e "  ${YELLOW}請執行: docker-compose up -d${NC}"
        FRONTEND_RUNNING=false
    fi

    if curl -s --max-time 3 "$API_BASE_URL/api/health" > /dev/null; then
        echo -e "  ${GREEN}✅ 後端服務運行中${NC}"
        BACKEND_RUNNING=true
    else
        echo -e "  ${RED}❌ 後端服務未運行${NC}"
        BACKEND_RUNNING=false
    fi
}

# 檢查主要頁面
check_pages() {
    echo -e "\n${BOLD}${CYAN}檢查主要頁面...${NC}"

    check_url "$BASE_URL/index.html" "首頁"
    check_url "$BASE_URL/src/pages/auth/login.html" "登入頁面"
    check_url "$BASE_URL/src/pages/auth/register.html" "註冊頁面"
    check_url "$BASE_URL/src/pages/dashboard/index.html" "儀表板"
    check_url "$BASE_URL/src/pages/dashboard/profile.html" "個人資料頁面"
    check_url "$BASE_URL/src/pages/dashboard/friends.html" "好友頁面"
    check_url "$BASE_URL/src/pages/dashboard/chat.html" "聊天頁面"
    check_url "$BASE_URL/src/pages/posts/detail.html" "文章詳情頁面"
}

# 檢查靜態資源
check_assets() {
    echo -e "\n${BOLD}${CYAN}檢查靜態資源...${NC}"

    check_url "$BASE_URL/src/css/style.css" "主樣式表"
    check_url "$BASE_URL/src/js/config/routes.js" "路徑配置"
    check_url "$BASE_URL/src/js/utils/pathManager.js" "路徑管理器"
    check_url "$BASE_URL/src/js/utils/pwa.js" "PWA 工具"
    check_url "$BASE_URL/src/js/utils/websocket.js" "WebSocket 管理器"
    check_url "$BASE_URL/src/js/utils/loadingManager.js" "加載管理器"
    check_url "$BASE_URL/src/js/template.js" "模板工具"
    check_url "$BASE_URL/src/js/api.js" "API 工具"
    check_url "$BASE_URL/src/js/auth.js" "認證模組"
    check_url "$BASE_URL/src/js/dashboard.js" "儀表板腳本"
    check_url "$BASE_URL/src/js/chat.js" "聊天腳本"
    check_url "$BASE_URL/src/js/friends.js" "好友腳本"
    check_url "$BASE_URL/src/js/profile.js" "個人資料腳本"
    check_url "$BASE_URL/src/js/post.js" "文章腳本"
    check_url "$BASE_URL/src/components/navbar.html" "導航組件"
}

# 檢查 PWA 相關文件
check_pwa() {
    echo -e "\n${BOLD}${CYAN}檢查 PWA 相關文件...${NC}"

    check_url "$BASE_URL/manifest.json" "PWA 清單"
    check_url "$BASE_URL/sw.js" "Service Worker"
}

# 檢查 API 端點（如果後端運行）
check_api() {
    if [ "$BACKEND_RUNNING" = true ]; then
        echo -e "\n${BOLD}${CYAN}檢查 API 端點...${NC}"
        check_url "$API_BASE_URL/api/health" "健康檢查"
    else
        echo -e "\n${YELLOW}⚠️  跳過 API 檢查，後端服務未運行${NC}"
    fi
}

# 生成報告
generate_report() {
    echo -e "\n${BOLD}${CYAN}=== 檢查報告 ===${NC}"
    echo "📊 總共檢查: $TOTAL_CHECKS 個項目"
    echo -e "✅ 成功: ${GREEN}$SUCCESS_COUNT${NC}"
    echo -e "❌ 失敗: ${RED}$FAIL_COUNT${NC}"

    if [ $TOTAL_CHECKS -gt 0 ]; then
        SUCCESS_RATE=$((SUCCESS_COUNT * 100 / TOTAL_CHECKS))
        echo "📈 成功率: $SUCCESS_RATE%"
    fi

    if [ $FAIL_COUNT -gt 0 ]; then
        echo -e "\n${YELLOW}修復建議:${NC}"
        echo "1. 確保 Docker 服務運行: docker-compose up -d"
        echo "2. 檢查文件是否存在於正確位置"
        echo "3. 檢查網路連接"
        echo "4. 查看 Docker 日誌: docker-compose logs"

        exit 1
    else
        echo -e "\n${GREEN}🎉 所有檢查都通過了！${NC}"
        exit 0
    fi
}

# 主執行流程
main() {
    check_service

    if [ "$FRONTEND_RUNNING" = false ]; then
        echo -e "\n${RED}❌ 前端服務未運行，無法進行路徑檢查${NC}"
        echo -e "${YELLOW}請先執行: docker-compose up -d${NC}"
        exit 1
    fi

    check_pages
    check_assets
    check_pwa
    check_api
    generate_report
}

# 執行主函數
main "$@"
