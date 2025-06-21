#!/bin/bash

# 強制規則檢查腳本
# 用於 Git hooks 和 CI/CD 流程，確保代碼符合規範

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查結果計數
ERRORS=0
WARNINGS=0

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}   Stock Insight Platform 規則檢查工具   ${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# 獲取腳本目錄和項目根目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 切換到項目根目錄
cd "$PROJECT_ROOT"

# 錯誤報告函數
report_error() {
    echo -e "${RED}❌ 嚴重違規: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

report_warning() {
    echo -e "${YELLOW}⚠️  警告違規: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. 檢查硬編碼敏感信息
check_hardcoded_secrets() {
    echo "🔍 檢查硬編碼敏感信息..."

    # 檢查常見的硬編碼密碼/密鑰模式
    if grep -r -E "(password|secret|key).*=.*['\"][^'\"]{8,}" frontend/src backend/app --include="*.js" --include="*.py" 2>/dev/null; then
        report_error "發現硬編碼密碼或密鑰"
    else
        report_success "未發現硬編碼敏感信息"
    fi
}

# 2. 檢查硬編碼路徑
check_hardcoded_paths() {
    echo "🛣️  檢查硬編碼路徑..."

    # 檢查前端硬編碼路徑
    if grep -r "'/src/" frontend/src --include="*.js" 2>/dev/null | grep -v "routes.js" | grep -v "test" >/dev/null; then
        report_error "前端發現硬編碼路徑，必須使用 RouteUtils"
    fi

    # 檢查後端硬編碼 localhost
    if grep -r "localhost" backend/scripts --include="*.py" 2>/dev/null | grep -v "script_env.py" >/dev/null; then
        report_error "後端腳本發現硬編碼 localhost，必須使用環境配置"
    fi

    if [ $ERRORS -eq 0 ]; then
        report_success "路徑管理檢查通過"
    fi
}

# 3. 檢查 Docker 兼容性
check_docker_compatibility() {
    echo "🐳 檢查 Docker 兼容性..."

    # 檢查環境配置模組是否存在
    if [ ! -f "frontend/scripts/script-env.js" ]; then
        report_error "缺少前端環境配置模組 script-env.js"
    fi

    if [ ! -f "backend/scripts/script_env.py" ]; then
        report_error "缺少後端環境配置模組 script_env.py"
    fi

    # 檢查 .dockerignore 文件
    if [ ! -f "frontend/.dockerignore" ]; then
        report_error "缺少前端 .dockerignore 文件"
    fi

    if [ ! -f "backend/.dockerignore" ]; then
        report_error "缺少後端 .dockerignore 文件"
    fi

    if [ $ERRORS -eq 0 ]; then
        report_success "Docker 兼容性檢查通過"
    fi
}

# 4. 檢查測試覆蓋率
check_test_coverage() {
    echo "🧪 檢查測試覆蓋率..."

    # 檢查前端測試
    if [ -d "frontend" ]; then
        cd frontend
        if command -v npm >/dev/null 2>&1; then
            if npm run test:coverage >/dev/null 2>&1; then
                # 提取覆蓋率數字 (這需要根據實際測試工具調整)
                COVERAGE=$(npm run test:coverage 2>/dev/null | grep -o "Statements.*[0-9]\+%" | tail -1 | grep -o "[0-9]\+")
                if [ -n "$COVERAGE" ] && [ "$COVERAGE" -lt 80 ]; then
                    report_warning "前端測試覆蓋率 $COVERAGE% 低於要求的 80%"
                fi
            else
                report_warning "無法運行前端測試"
            fi
        fi
        cd "$PROJECT_ROOT"
    fi

    # 檢查後端測試
    if [ -d "backend" ]; then
        cd backend
        if command -v python >/dev/null 2>&1; then
            if python -m pytest --cov-report=term --cov=app tests/ >/dev/null 2>&1; then
                report_success "後端測試執行成功"
            else
                report_warning "後端測試執行失敗"
            fi
        fi
        cd "$PROJECT_ROOT"
    fi
}

# 5. 檢查代碼風格
check_code_style() {
    echo "🎨 檢查代碼風格..."

    # 前端代碼風格
    if [ -d "frontend" ]; then
        cd frontend
        if command -v npm >/dev/null 2>&1; then
            if ! npm run lint >/dev/null 2>&1; then
                report_error "前端代碼風格檢查失敗，運行 npm run lint:fix"
            fi
        fi
        cd "$PROJECT_ROOT"
    fi

    # 後端代碼風格
    if [ -d "backend" ]; then
        cd backend
        if command -v flake8 >/dev/null 2>&1; then
            if ! flake8 app/ >/dev/null 2>&1; then
                report_error "後端代碼風格檢查失敗，運行 black app/ 和 flake8 app/"
            fi
        fi
        cd "$PROJECT_ROOT"
    fi

    if [ $ERRORS -eq 0 ]; then
        report_success "代碼風格檢查通過"
    fi
}

# 6. 檢查安全漏洞
check_security() {
    echo "🔒 檢查安全漏洞..."

    # 檢查 SQL 注入風險
    if grep -r "f\".*SELECT\|f'.*SELECT" backend/app --include="*.py" 2>/dev/null; then
        report_error "發現潛在 SQL 注入風險，使用 f-string 拼接 SQL"
    fi

    # 檢查 XSS 風險
    if grep -r "innerHTML.*=" frontend/src --include="*.js" 2>/dev/null | grep -v "DOMPurify" >/dev/null; then
        report_warning "發現潛在 XSS 風險，直接設置 innerHTML 未使用 DOMPurify"
    fi

    # 檢查不安全的 eval
    if grep -r "eval(" frontend/src backend/app --include="*.js" --include="*.py" 2>/dev/null; then
        report_error "發現不安全的 eval() 使用"
    fi

    if [ $ERRORS -eq 0 ]; then
        report_success "安全檢查通過"
    fi
}

# 7. 檢查依賴關係
check_dependencies() {
    echo "📦 檢查依賴關係..."

    # 檢查循環依賴
    if [ -f "frontend/scripts/dependency-check.js" ]; then
        cd frontend
        if node scripts/dependency-check.js >/dev/null 2>&1; then
            report_success "前端依賴關係檢查通過"
        else
            report_error "前端存在循環依賴或架構違規"
        fi
        cd "$PROJECT_ROOT"
    fi
}

# 8. 檢查文檔同步
check_documentation() {
    echo "📚 檢查文檔同步..."

    # 檢查是否有未跟蹤的規則變更
    if [ -f "RULES.md" ] && [ -f "frontend/RULES.md" ] && [ -f "backend/RULES.md" ]; then
        report_success "規則文檔齊全"
    else
        report_error "缺少必要的規則文檔"
    fi

    # 檢查 README 是否存在
    if [ ! -f "README.md" ]; then
        report_warning "缺少項目 README.md"
    fi
}

# 主要檢查流程
main() {
    echo "開始執行強制規則檢查..."
    echo ""

    check_hardcoded_secrets
    check_hardcoded_paths
    check_docker_compatibility
    check_test_coverage
    check_code_style
    check_security
    check_dependencies
    check_documentation

    echo ""
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}            檢查結果摘要                  ${NC}"
    echo -e "${BLUE}===========================================${NC}"

    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 所有檢查通過！代碼符合規範要求。${NC}"
        exit 0
    elif [ $ERRORS -eq 0 ]; then
        echo -e "${YELLOW}⚠️  發現 $WARNINGS 個警告，建議修復但不阻止提交。${NC}"
        exit 0
    else
        echo -e "${RED}❌ 發現 $ERRORS 個嚴重錯誤和 $WARNINGS 個警告。${NC}"
        echo -e "${RED}   必須修復所有錯誤才能提交代碼！${NC}"
        echo ""
        echo "修復建議："
        echo "1. 檢查並移除硬編碼的敏感信息"
        echo "2. 使用統一路徑管理系統 (RouteUtils)"
        echo "3. 確保 Docker 環境兼容性"
        echo "4. 運行代碼格式化工具"
        echo "5. 修復安全漏洞"
        echo ""
        exit 1
    fi
}

# 處理命令行參數
case "${1:-}" in
    --strict)
        echo "🔒 嚴格模式：警告也會導致失敗"
        STRICT_MODE=true
        ;;
    --fix)
        echo "🔧 自動修復模式"
        # 運行自動修復
        cd frontend 2>/dev/null && npm run lint:fix >/dev/null 2>&1 || true
        cd "$PROJECT_ROOT"
        cd backend 2>/dev/null && black app/ >/dev/null 2>&1 || true
        cd "$PROJECT_ROOT"
        ;;
    --help|-h)
        echo "用法: $0 [選項]"
        echo ""
        echo "選項:"
        echo "  --strict    嚴格模式，警告也會導致失敗"
        echo "  --fix       嘗試自動修復代碼風格問題"
        echo "  --help      顯示此幫助信息"
        echo ""
        echo "退出代碼:"
        echo "  0  所有檢查通過"
        echo "  1  發現嚴重錯誤"
        echo ""
        exit 0
        ;;
esac

# 執行主函數
main

# 如果是嚴格模式且有警告，則失敗
if [ "${STRICT_MODE:-}" = "true" ] && [ $WARNINGS -gt 0 ]; then
    echo -e "${RED}嚴格模式：因為有警告所以失敗${NC}"
    exit 1
fi
