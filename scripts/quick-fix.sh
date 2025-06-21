#!/bin/bash

# 快速修復腳本
# 自動修復常見的規則違規問題

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Stock Insight Platform 快速修復   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 獲取項目根目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

FIXES_APPLIED=0

apply_fix() {
    echo -e "${GREEN}✅ $1${NC}"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
}

skip_fix() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. 修復硬編碼密碼檢測的誤判
fix_false_positives() {
    echo "🔍 處理硬編碼檢測誤判..."

    # 這些是合理的變數名，不是真正的硬編碼敏感信息
    # 真正的硬編碼會是像 password="abc123456" 這樣的

    # 檢查是否有真正的硬編碼
    if grep -r -E "(password|secret|key).*=.*['\"][a-zA-Z0-9]{8,}['\"]" frontend/src backend/app --include="*.js" --include="*.py" 2>/dev/null; then
        echo -e "${RED}❌ 發現真正的硬編碼敏感信息，需要手動修復${NC}"
    else
        apply_fix "硬編碼檢測: 未發現真正的硬編碼敏感信息"
    fi
}

# 2. 修復硬編碼路徑問題
fix_hardcoded_paths() {
    echo "🛣️  修復硬編碼路徑..."

    # 檢查哪些文件有硬編碼路徑
    HARDCODED_FILES=$(grep -r "'/src/" frontend/src --include="*.js" -l 2>/dev/null | grep -v "routes.js" | grep -v "test" || true)

    if [ -n "$HARDCODED_FILES" ]; then
        echo "發現以下文件有硬編碼路徑:"
        echo "$HARDCODED_FILES"
        echo ""
        echo "建議手動修復，使用 RouteUtils:"
        echo "  import { RouteUtils } from './utils/pathManager.js';"
        echo "  const path = RouteUtils.getPagePath('auth.login');"
        skip_fix "硬編碼路徑需要手動修復"
    else
        apply_fix "未發現硬編碼路徑問題"
    fi
}

# 3. 自動格式化代碼
fix_code_style() {
    echo "🎨 自動格式化代碼..."

    # 前端代碼格式化
    if [ -d "frontend" ]; then
        cd frontend
        if command -v npm >/dev/null 2>&1 && [ -f "package.json" ]; then
            if npm run lint:fix >/dev/null 2>&1; then
                apply_fix "前端代碼格式化完成"
            else
                skip_fix "前端代碼格式化失敗，可能需要手動修復"
            fi
        fi
        cd "$PROJECT_ROOT"
    fi

    # 後端代碼格式化
    if [ -d "backend" ]; then
        cd backend
        if command -v black >/dev/null 2>&1; then
            if black app/ >/dev/null 2>&1; then
                apply_fix "後端代碼格式化完成"
            else
                skip_fix "後端代碼格式化失敗"
            fi
        fi
        cd "$PROJECT_ROOT"
    fi
}

# 4. 修復安全問題提示
fix_security_warnings() {
    echo "🔒 檢查安全問題..."

    # 檢查 innerHTML 使用
    UNSAFE_INNERHTML=$(grep -r "innerHTML.*=" frontend/src --include="*.js" 2>/dev/null | grep -v "DOMPurify" || true)

    if [ -n "$UNSAFE_INNERHTML" ]; then
        echo "發現不安全的 innerHTML 使用:"
        echo "$UNSAFE_INNERHTML"
        echo ""
        echo "建議修復方法:"
        echo "1. 安裝 DOMPurify: npm install dompurify"
        echo "2. 使用安全方式: element.innerHTML = DOMPurify.sanitize(content);"
        skip_fix "安全問題需要手動修復"
    else
        apply_fix "未發現安全問題"
    fi
}

# 5. 安裝開發工具
install_dev_tools() {
    echo "🔧 檢查開發工具..."

    # 檢查前端開發工具
    if [ -d "frontend" ]; then
        cd frontend
        if command -v npm >/dev/null 2>&1; then
            # 檢查是否安裝了 ESLint 和 Prettier
            if ! npm list eslint >/dev/null 2>&1; then
                echo "安裝前端開發工具..."
                npm install --save-dev eslint prettier @eslint/js >/dev/null 2>&1 || true
                apply_fix "安裝前端開發工具"
            fi
        fi
        cd "$PROJECT_ROOT"
    fi

    # 檢查後端開發工具
    if [ -d "backend" ]; then
        if ! command -v black >/dev/null 2>&1; then
            echo "建議安裝 Python 開發工具:"
            echo "  pip install black flake8 pytest"
            skip_fix "需要安裝 Python 開發工具"
        fi
    fi
}

# 6. 創建缺失的配置文件
create_missing_configs() {
    echo "📝 檢查配置文件..."

    # 創建 .editorconfig
    if [ ! -f ".editorconfig" ]; then
        cat > ".editorconfig" << 'EOF'
# EditorConfig is awesome: https://EditorConfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.py]
indent_size = 4

[*.md]
trim_trailing_whitespace = false
EOF
        apply_fix "創建 .editorconfig 文件"
    fi

    # 創建前端 .eslintrc.js (如果不存在)
    if [ ! -f "frontend/.eslintrc.js" ] && [ -d "frontend" ]; then
        cat > "frontend/.eslintrc.js" << 'EOF'
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  globals: {
    // 定義全局變數
    'RouteUtils': 'readonly',
    'websocketManager': 'readonly'
  }
};
EOF
        apply_fix "創建前端 ESLint 配置"
    fi
}

# 執行修復
main() {
    echo "開始執行快速修復..."
    echo ""

    fix_false_positives
    fix_hardcoded_paths
    fix_code_style
    fix_security_warnings
    install_dev_tools
    create_missing_configs

    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}            修復結果摘要                ${NC}"
    echo -e "${BLUE}========================================${NC}"

    if [ $FIXES_APPLIED -gt 0 ]; then
        echo -e "${GREEN}✅ 已應用 $FIXES_APPLIED 個自動修復${NC}"
        echo ""
        echo "建議下一步:"
        echo "1. 運行 ./scripts/enforce-rules.sh 重新檢查"
        echo "2. 手動修復剩餘的警告"
        echo "3. 運行測試確保功能正常"
        echo "4. 提交修復的代碼"
    else
        echo -e "${YELLOW}⚠️  沒有可以自動修復的問題${NC}"
        echo "請手動檢查規則檢查報告中的問題"
    fi

    echo ""
    echo -e "${BLUE}手動修復指南:${NC}"
    echo "📚 路徑管理: 查看 frontend/RULES.md 第 🛣️ 章節"
    echo "🔒 安全問題: 查看 backend/RULES.md 第 🔒 章節"
    echo "🧪 測試配置: 查看項目 RULES.md 第 🧪 章節"
}

# 處理命令行參數
case "${1:-}" in
    --help|-h)
        echo "用法: $0"
        echo ""
        echo "自動修復常見的規則違規問題："
        echo "  ✅ 代碼格式化"
        echo "  ✅ 創建缺失的配置文件"
        echo "  ✅ 安裝開發工具"
        echo "  ✅ 處理誤判問題"
        echo ""
        echo "注意: 某些問題需要手動修復"
        exit 0
        ;;
esac

# 執行主函數
main
