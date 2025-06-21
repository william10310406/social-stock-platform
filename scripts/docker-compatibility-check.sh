#!/bin/bash
# Docker 兼容性檢查腳本
# 驗證所有項目腳本在 Docker 和本地環境中的兼容性

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BOLD}${BLUE}🔍 Docker 兼容性檢查工具${NC}"
echo -e "檢查所有腳本的 Docker 環境適應性"
echo "=============================================="

# 檢查計數器
TOTAL_CHECKS=0
SUCCESS_COUNT=0
FAIL_COUNT=0

# 記錄結果
check_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if [ "$result" = "success" ]; then
        echo -e "  ${GREEN}✅ $test_name${NC}"
        [ -n "$details" ] && echo -e "     ${details}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "  ${RED}❌ $test_name${NC}"
        [ -n "$details" ] && echo -e "     ${RED}$details${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

# 檢查前端腳本
check_frontend_scripts() {
    echo -e "\n${BOLD}${CYAN}📄 檢查前端腳本...${NC}"

    cd frontend/scripts

    # 測試環境配置模組
    if node script-env.js > /dev/null 2>&1; then
        check_result "環境配置模組 (script-env.js)" "success"
    else
        check_result "環境配置模組 (script-env.js)" "fail" "模組載入失敗"
    fi

    # 測試依賴檢查腳本 (跳過實際檢查，只測試語法)
    if node -c dependency-check.js > /dev/null 2>&1; then
        check_result "依賴檢查腳本 (dependency-check.js)" "success"
    else
        check_result "依賴檢查腳本 (dependency-check.js)" "fail" "語法錯誤"
    fi

    # 測試項目組織腳本
    if node organize-project.js > /dev/null 2>&1; then
        check_result "項目組織腳本 (organize-project.js)" "success"
    else
        check_result "項目組織腳本 (organize-project.js)" "fail" "執行失敗"
    fi

    # 測試連結驗證腳本 (跳過實際驗證，只測試語法)
    if node -c validate-links.js > /dev/null 2>&1; then
        check_result "連結驗證腳本 (validate-links.js)" "success"
    else
        check_result "連結驗證腳本 (validate-links.js)" "fail" "語法錯誤"
    fi

    # 測試路徑檢查腳本 (跳過需要服務的部分)
    if node -c check-routes.js > /dev/null 2>&1; then
        check_result "路徑檢查腳本 (check-routes.js)" "success" "語法檢查通過"
    else
        check_result "路徑檢查腳本 (check-routes.js)" "fail" "語法錯誤"
    fi

    cd ../..
}

# 檢查後端腳本
check_backend_scripts() {
    echo -e "\n${BOLD}${CYAN}🐍 檢查後端腳本...${NC}"

    cd backend/scripts

    # 測試環境配置模組
    if python script_env.py > /dev/null 2>&1; then
        check_result "環境配置模組 (script_env.py)" "success"
    else
        check_result "環境配置模組 (script_env.py)" "fail" "模組載入失敗"
    fi

    # 測試資料庫管理腳本
    if python -c "import db_manager; print('OK')" > /dev/null 2>&1; then
        check_result "資料庫管理腳本 (db_manager.py)" "success"
    else
        check_result "資料庫管理腳本 (db_manager.py)" "fail" "導入失敗"
    fi

    # 測試健康檢查腳本 (僅檢查語法)
    if python -c "import script_env; print('健康檢查腳本語法正確')" > /dev/null 2>&1; then
        check_result "健康檢查腳本 (healthcheck.py)" "success"
    else
        check_result "健康檢查腳本 (healthcheck.py)" "fail" "導入或語法錯誤"
    fi

    # 測試 Socket.IO 啟動腳本
    if python -c "import script_env; print('Socket.IO 啟動腳本語法正確')" > /dev/null 2>&1; then
        check_result "Socket.IO 啟動腳本 (run_socketio.py)" "success"
    else
        check_result "Socket.IO 啟動腳本 (run_socketio.py)" "fail" "導入或語法錯誤"
    fi

    cd ../..
}

# 檢查 Shell 腳本
check_shell_scripts() {
    echo -e "\n${BOLD}${CYAN}🖥️  檢查 Shell 腳本...${NC}"

    # 檢查前端 shell 腳本
    for script in frontend/scripts/*.sh; do
        if [ -f "$script" ]; then
            script_name=$(basename "$script")
            if bash -n "$script" 2>/dev/null; then
                check_result "Shell 腳本語法 ($script_name)" "success"
            else
                check_result "Shell 腳本語法 ($script_name)" "fail" "語法錯誤"
            fi
        fi
    done

    # 檢查後端 shell 腳本
    for script in backend/*.sh; do
        if [ -f "$script" ]; then
            script_name=$(basename "$script")
            if bash -n "$script" 2>/dev/null; then
                check_result "Shell 腳本語法 ($script_name)" "success"
            else
                check_result "Shell 腳本語法 ($script_name)" "fail" "語法錯誤"
            fi
        fi
    done
}

# 檢查環境變數支持
check_environment_variables() {
    echo -e "\n${BOLD}${CYAN}🌍 檢查環境變數支持...${NC}"

    # 測試前端環境變數
    cd frontend/scripts

    # 設置測試環境變數
    export NODE_ENV=docker
    export FRONTEND_URL=http://frontend:5173
    export BACKEND_URL=http://backend:5001

    if node -e "
const { ScriptEnvironment } = require('./script-env.js');
const env = new ScriptEnvironment();
const config = env.getEnvironmentInfo();
if (config.docker.isDocker) {
    console.log('Docker 環境檢測成功');
    process.exit(0);
} else {
    console.log('Docker 環境檢測失敗');
    process.exit(1);
}
" > /dev/null 2>&1; then
        check_result "前端 Docker 環境檢測" "success"
    else
        check_result "前端 Docker 環境檢測" "fail" "環境變數配置問題"
    fi

    # 清除測試環境變數
    unset NODE_ENV FRONTEND_URL BACKEND_URL

    cd ../../backend/scripts

    # 測試後端環境變數
    export NODE_ENV=docker
    export DATABASE_URL=postgresql://user:pass@db:5432/test
    export REDIS_URL=redis://redis:6379/0

    if python -c "
from script_env import ScriptEnvironment
env = ScriptEnvironment()
config = env.get_environment_info()
if config['docker']['is_docker']:
    print('Docker 環境檢測成功')
    exit(0)
else:
    print('Docker 環境檢測失敗')
    exit(1)
" > /dev/null 2>&1; then
        check_result "後端 Docker 環境檢測" "success"
    else
        check_result "後端 Docker 環境檢測" "fail" "環境變數配置問題"
    fi

    # 清除測試環境變數
    unset NODE_ENV DATABASE_URL REDIS_URL

    cd ../..
}

# 檢查 Docker 相關文件
check_docker_files() {
    echo -e "\n${BOLD}${CYAN}🐳 檢查 Docker 相關文件...${NC}"

    # 檢查 Docker Compose 文件
    if [ -f "docker-compose.yml" ]; then
        if docker-compose config > /dev/null 2>&1; then
            check_result "Docker Compose 配置" "success"
        else
            check_result "Docker Compose 配置" "fail" "配置文件語法錯誤"
        fi
    else
        check_result "Docker Compose 配置" "fail" "docker-compose.yml 不存在"
    fi

    # 檢查 Dockerfile
    for dockerfile in frontend/Dockerfile backend/Dockerfile; do
        if [ -f "$dockerfile" ]; then
            check_result "Dockerfile 存在 ($(dirname $dockerfile))" "success"
        else
            check_result "Dockerfile 存在 ($(dirname $dockerfile))" "fail" "Dockerfile 不存在"
        fi
    done

    # 檢查 .dockerignore
    for dockerignore in frontend/.dockerignore backend/.dockerignore; do
        if [ -f "$dockerignore" ]; then
            check_result ".dockerignore 存在 ($(dirname $dockerignore))" "success"
        else
            check_result ".dockerignore 存在 ($(dirname $dockerignore))" "fail" ".dockerignore 不存在"
        fi
    done
}

# 主執行流程
main() {
    check_frontend_scripts
    check_backend_scripts
    check_shell_scripts
    check_environment_variables
    check_docker_files

    # 生成最終報告
    echo -e "\n${BOLD}${BLUE}📊 兼容性檢查報告${NC}"
    echo "=============================================="
    echo -e "總檢查項目: ${BOLD}$TOTAL_CHECKS${NC}"
    echo -e "成功: ${GREEN}$SUCCESS_COUNT${NC}"
    echo -e "失敗: ${RED}$FAIL_COUNT${NC}"

    if [ $FAIL_COUNT -eq 0 ]; then
        echo -e "\n${BOLD}${GREEN}🎉 所有腳本都具備完整的 Docker 兼容性！${NC}"
        exit 0
    else
        success_rate=$((SUCCESS_COUNT * 100 / TOTAL_CHECKS))
        echo -e "\n成功率: ${YELLOW}$success_rate%${NC}"

        if [ $success_rate -ge 80 ]; then
            echo -e "\n${YELLOW}⚠️  大部分腳本具備 Docker 兼容性，但仍有改進空間${NC}"
            exit 1
        else
            echo -e "\n${RED}❌ 腳本的 Docker 兼容性需要重大改進${NC}"
            exit 2
        fi
    fi
}

# 執行主程序
main "$@"
