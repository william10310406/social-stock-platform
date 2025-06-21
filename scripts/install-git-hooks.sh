#!/bin/bash

# Git Hooks 安裝腳本
# 安裝 pre-commit 和 pre-push hooks

set -e

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Stock Insight Platform Git Hooks   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 獲取腳本目錄和項目根目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

# 確保 hooks 目錄存在
if [ ! -d "$HOOKS_DIR" ]; then
    echo -e "${YELLOW}警告: .git/hooks 目錄不存在，可能不在 Git 項目中${NC}"
    exit 1
fi

echo "📝 安裝 Git hooks 到 $HOOKS_DIR"

# Pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash
#
# Pre-commit hook - 提交前檢查
# 檢查代碼風格和基本規範

echo "🔍 運行 pre-commit 檢查..."

# 獲取項目根目錄
PROJECT_ROOT="$(git rev-parse --show-toplevel)"

# 檢查是否有待提交的檔案
if git diff --cached --quiet; then
    echo "沒有檔案要提交"
    exit 0
fi

# 只檢查被修改的檔案
STAGED_JS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "\.js$" || true)
STAGED_PY_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "\.py$" || true)

# 檢查 JavaScript 代碼風格
if [ -n "$STAGED_JS_FILES" ]; then
    echo "🎨 檢查 JavaScript 代碼風格..."
    cd "$PROJECT_ROOT/frontend"
    if command -v npm >/dev/null 2>&1; then
        # 運行 ESLint 檢查被修改的檔案
        for file in $STAGED_JS_FILES; do
            if [[ $file == frontend/* ]]; then
                relative_file=${file#frontend/}
                if ! npx eslint "$relative_file" --quiet; then
                    echo "❌ ESLint 檢查失敗: $file"
                    echo "💡 提示: 運行 'npm run lint:fix' 自動修復"
                    exit 1
                fi
            fi
        done
    fi
    cd "$PROJECT_ROOT"
fi

# 檢查 Python 代碼風格
if [ -n "$STAGED_PY_FILES" ]; then
    echo "🐍 檢查 Python 代碼風格..."
    cd "$PROJECT_ROOT/backend"
    if command -v flake8 >/dev/null 2>&1; then
        for file in $STAGED_PY_FILES; do
            if [[ $file == backend/* ]]; then
                relative_file=${file#backend/}
                if ! flake8 "$relative_file" --quiet; then
                    echo "❌ Flake8 檢查失敗: $file"
                    echo "💡 提示: 運行 'black $relative_file' 自動格式化"
                    exit 1
                fi
            fi
        done
    fi
    cd "$PROJECT_ROOT"
fi

# 檢查硬編碼問題 (快速檢查)
echo "🔍 檢查硬編碼問題..."
for file in $STAGED_JS_FILES; do
    if git show :"$file" | grep -q "'/src/" && [[ $file != *"routes.js"* ]]; then
        echo "❌ 發現硬編碼路徑: $file"
        echo "💡 提示: 使用 RouteUtils 代替硬編碼路徑"
        exit 1
    fi
done

for file in $STAGED_PY_FILES; do
    if git show :"$file" | grep -q "localhost" && [[ $file == *"scripts/"* ]] && [[ $file != *"script_env.py"* ]]; then
        echo "❌ 發現硬編碼 localhost: $file"
        echo "💡 提示: 使用環境配置模組"
        exit 1
    fi
done

echo "✅ Pre-commit 檢查通過"
exit 0
EOF

# Pre-push hook
cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash
#
# Pre-push hook - 推送前檢查
# 運行完整的規則檢查和測試

echo "🚀 運行 pre-push 檢查..."

# 獲取項目根目錄
PROJECT_ROOT="$(git rev-parse --show-toplevel)"

# 運行完整規則檢查
if [ -f "$PROJECT_ROOT/scripts/enforce-rules.sh" ]; then
    echo "📋 運行完整規則檢查..."
    if ! "$PROJECT_ROOT/scripts/enforce-rules.sh"; then
        echo "❌ 規則檢查失敗，推送被阻止"
        echo "💡 提示: 修復所有錯誤後再次推送"
        exit 1
    fi
else
    echo "⚠️  找不到規則檢查腳本，跳過檢查"
fi

# 運行測試 (如果存在)
echo "🧪 運行測試..."

# 前端測試
if [ -d "$PROJECT_ROOT/frontend" ]; then
    cd "$PROJECT_ROOT/frontend"
    if [ -f "package.json" ] && command -v npm >/dev/null 2>&1; then
        if npm list --depth=0 | grep -q "jest\|vitest\|mocha"; then
            echo "🧪 運行前端測試..."
            if ! npm run test >/dev/null 2>&1; then
                echo "❌ 前端測試失敗"
                exit 1
            fi
        fi
    fi
    cd "$PROJECT_ROOT"
fi

# 後端測試
if [ -d "$PROJECT_ROOT/backend" ]; then
    cd "$PROJECT_ROOT/backend"
    if [ -f "requirements.txt" ] && command -v python >/dev/null 2>&1; then
        if pip list | grep -q pytest; then
            echo "🧪 運行後端測試..."
            if ! python -m pytest tests/ -x >/dev/null 2>&1; then
                echo "❌ 後端測試失敗"
                exit 1
            fi
        fi
    fi
    cd "$PROJECT_ROOT"
fi

echo "✅ Pre-push 檢查通過，允許推送"
exit 0
EOF

# 設置執行權限
chmod +x "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-push"

echo -e "${GREEN}✅ Git hooks 安裝完成！${NC}"
echo ""
echo "安裝的 hooks:"
echo "  📝 pre-commit  - 提交前檢查代碼風格和硬編碼"
echo "  🚀 pre-push    - 推送前運行完整規則檢查和測試"
echo ""
echo "使用方法:"
echo "  🔧 手動運行規則檢查: ./scripts/enforce-rules.sh"
echo "  🎨 自動修復代碼風格: ./scripts/enforce-rules.sh --fix"
echo "  🔒 嚴格模式檢查:     ./scripts/enforce-rules.sh --strict"
echo ""
echo -e "${YELLOW}注意: 如果需要跳過 hooks，可以使用 git commit --no-verify${NC}"
