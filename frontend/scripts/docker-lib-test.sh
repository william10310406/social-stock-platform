#!/bin/bash

# Docker 環境組件庫測試腳本
# 用於在 Docker 容器中測試 /lib 組件庫功能

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_title() {
    echo -e "${BLUE}📚 $1${NC}"
}

# 檢查 Docker 環境
check_docker_environment() {
    log_title "檢查 Docker 環境"

    # 檢查是否在 Docker 容器中
    if [ -f /.dockerenv ] || [ -n "${DOCKER_CONTAINER}" ]; then
        log_success "確認運行在 Docker 容器中"
        export IS_DOCKER=true
    else
        log_warning "未檢測到 Docker 環境，可能在本地運行"
        export IS_DOCKER=false
    fi

    # 檢查容器名稱
    if [ -n "${HOSTNAME}" ]; then
        log_info "容器主機名: ${HOSTNAME}"
    fi

    # 檢查環境變數
    if [ "${NODE_ENV}" = "docker" ]; then
        log_success "NODE_ENV 設置為 docker"
    else
        log_warning "NODE_ENV 不是 docker: ${NODE_ENV:-未設置}"
    fi
}

# 檢查組件庫文件
check_lib_files() {
    log_title "檢查組件庫文件結構"

    local files=(
        "src/lib/index.js"
        "src/lib/components/Toast.js"
        "src/lib/components/Modal.js"
        "src/lib/components/Loading.js"
        "src/lib/data/Formatter.js"
    )

    local missing_files=()

    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            log_success "文件存在: $file"
        else
            log_error "文件缺失: $file"
            missing_files+=("$file")
        fi
    done

    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "所有組件庫文件都存在"
        return 0
    else
        log_error "缺失 ${#missing_files[@]} 個文件"
        return 1
    fi
}

# 檢查 Docker 網路連接
check_docker_networking() {
    log_title "檢查 Docker 網路配置"

    # 檢查端口配置
    if [ -n "${VITE_PORT}" ]; then
        log_success "Vite 端口配置: ${VITE_PORT}"
    else
        log_warning "Vite 端口未配置"
    fi

    # 檢查 API 基礎 URL
    if [ -n "${VITE_API_BASE_URL}" ]; then
        log_info "API 基礎 URL: ${VITE_API_BASE_URL}"
    else
        log_info "API 基礎 URL 使用預設值"
    fi

    # 檢查主機配置
    if [ "${VITE_HOST}" = "0.0.0.0" ]; then
        log_success "Vite 主機配置正確: ${VITE_HOST}"
    else
        log_warning "Vite 主機配置: ${VITE_HOST:-未設置}"
    fi
}

# 運行 Node.js 組件庫檢查
run_node_check() {
    log_title "運行 Node.js 組件庫檢查"

    if command -v node >/dev/null 2>&1; then
        log_success "Node.js 可用"

        # 運行組件庫檢查腳本
        if [ -f "scripts/check-lib.js" ]; then
            log_info "執行組件庫檢查..."
            if node scripts/check-lib.js; then
                log_success "組件庫檢查通過"
                return 0
            else
                log_error "組件庫檢查失敗"
                return 1
            fi
        else
            log_error "找不到檢查腳本: scripts/check-lib.js"
            return 1
        fi
    else
        log_error "Node.js 不可用"
        return 1
    fi
}

# 檢查測試頁面可訪問性
check_test_page_accessibility() {
    log_title "檢查測試頁面可訪問性"

    local test_page="src/pages/test/lib-test.html"

    if [ -f "$test_page" ]; then
        log_success "測試頁面存在: $test_page"

        # 檢查頁面內容
        if grep -q "Component Library Test" "$test_page"; then
            log_success "測試頁面內容正確"
        else
            log_warning "測試頁面內容可能不完整"
        fi

        # 提供訪問 URL
        local port="${VITE_PORT:-5173}"
        local url="http://localhost:${port}/${test_page}"
        log_info "測試頁面 URL: $url"

        return 0
    else
        log_error "測試頁面不存在: $test_page"
        return 1
    fi
}

# 檢查 package.json 腳本
check_npm_scripts() {
    log_title "檢查 npm 腳本配置"

    if [ -f "package.json" ]; then
        log_success "package.json 存在"

        # 檢查組件庫相關腳本
        if grep -q "lib:check" package.json; then
            log_success "lib:check 腳本已配置"
        else
            log_warning "lib:check 腳本未配置"
        fi

        if grep -q "lib:test" package.json; then
            log_success "lib:test 腳本已配置"
        else
            log_warning "lib:test 腳本未配置"
        fi

        return 0
    else
        log_error "package.json 不存在"
        return 1
    fi
}

# 生成 Docker 測試報告
generate_docker_report() {
    log_title "生成 Docker 測試報告"

    local report_file="docker-lib-test-report.txt"

    cat > "$report_file" << EOF
# Docker 環境組件庫測試報告
生成時間: $(date)
容器主機名: ${HOSTNAME:-未知}
Docker 環境: ${IS_DOCKER:-false}
NODE_ENV: ${NODE_ENV:-未設置}

## 測試結果
- 環境檢查: $([[ $env_check_result -eq 0 ]] && echo "✅ 通過" || echo "❌ 失敗")
- 文件檢查: $([[ $file_check_result -eq 0 ]] && echo "✅ 通過" || echo "❌ 失敗")
- 網路檢查: $([[ $network_check_result -eq 0 ]] && echo "✅ 通過" || echo "❌ 失敗")
- Node.js 檢查: $([[ $node_check_result -eq 0 ]] && echo "✅ 通過" || echo "❌ 失敗")
- 測試頁面檢查: $([[ $page_check_result -eq 0 ]] && echo "✅ 通過" || echo "❌ 失敗")
- npm 腳本檢查: $([[ $npm_check_result -eq 0 ]] && echo "✅ 通過" || echo "❌ 失敗")

## 建議
EOF

    if [[ $overall_result -eq 0 ]]; then
        cat >> "$report_file" << EOF
🎉 所有檢查都通過！組件庫在 Docker 環境中運行正常。

下一步:
1. 啟動開發伺服器: npm run dev
2. 訪問測試頁面: http://localhost:${VITE_PORT:-5173}/src/pages/test/lib-test.html
3. 在瀏覽器控制台運行測試腳本
EOF
    else
        cat >> "$report_file" << EOF
⚠️ 部分檢查失敗，請根據上述結果修復問題。

故障排除:
1. 檢查文件是否完整
2. 確認 Docker 環境變數設置
3. 驗證網路配置
4. 重新構建 Docker 鏡像
EOF
    fi

    log_success "測試報告已生成: $report_file"
}

# 主函數
main() {
    echo "
╔══════════════════════════════════════════════════════════════╗
║              Docker 環境組件庫測試                            ║
║            Stock Insight Platform v1.0.0                   ║
╚══════════════════════════════════════════════════════════════╝
"

    # 執行所有檢查
    check_docker_environment
    env_check_result=$?

    check_lib_files
    file_check_result=$?

    check_docker_networking
    network_check_result=$?

    run_node_check
    node_check_result=$?

    check_test_page_accessibility
    page_check_result=$?

    check_npm_scripts
    npm_check_result=$?

    # 計算總體結果
    overall_result=$((env_check_result + file_check_result + network_check_result + node_check_result + page_check_result + npm_check_result))

    # 生成報告
    generate_docker_report

    # 輸出總結
    echo ""
    log_title "測試總結"

    if [[ $overall_result -eq 0 ]]; then
        log_success "🎉 所有檢查都通過！組件庫在 Docker 環境中運行正常。"
        echo ""
        log_info "下一步建議:"
        echo "  1. 啟動開發伺服器: npm run dev"
        echo "  2. 訪問測試頁面: http://localhost:${VITE_PORT:-5173}/src/pages/test/lib-test.html"
        echo "  3. 在瀏覽器控制台運行: window.runLibTest()"
        exit 0
    else
        log_error "⚠️ 部分檢查失敗 ($overall_result 個錯誤)，請檢查上述輸出。"
        exit 1
    fi
}

# 執行主函數
main "$@"
