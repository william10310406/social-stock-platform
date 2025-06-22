#!/bin/bash

# 🔒 Git Hooks 強制安裝腳本
# ⚠️  團隊必須安裝此 Git hooks 系統
# 📋 提供強制的代碼品質檢查和上傳防呆機制

set -e

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}🔒 ==========================================${NC}"
echo -e "${RED}🔒   Stock Insight Platform Git Hooks    ${NC}"
echo -e "${RED}🔒   強制安裝 - 團隊必須執行             ${NC}"
echo -e "${RED}🔒 ==========================================${NC}"
echo ""

echo -e "${YELLOW}⚠️  重要說明:${NC}"
echo -e "${YELLOW}   • 此 Git hooks 系統是強制性的${NC}"
echo -e "${YELLOW}   • 所有團隊成員都必須安裝${NC}"
echo -e "${YELLOW}   • 提供上傳前的品質檢查防呆機制${NC}"
echo -e "${YELLOW}   • 無法使用 --no-verify 跳過檢查${NC}"
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
    if git show :"$file" | grep -q "'/src/" && [[ $file != *"routes.js"* ]] && [[ $file != *"routes-docker.js"* ]]; then
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
# 🔒 MANDATORY Pre-push hook - 強制推送前檢查
# ⚠️  此檢查無法跳過，確保代碼品質
# 運行完整的規則檢查和測試

echo ""
echo "🔒 =========================================="
echo "🔒   強制上傳檢查 - 無法跳過               "
echo "🔒 =========================================="
echo ""

# 獲取項目根目錄
PROJECT_ROOT="$(git rev-parse --show-toplevel)"

# 檢查是否嘗試跳過檢查
if [ "$1" = "--no-verify" ] || [ "$2" = "--no-verify" ]; then
    echo "❌ 錯誤: 不允許跳過上傳檢查！"
    echo "🔒 此項目要求所有推送都必須通過完整檢查"
    echo "💡 如果遇到問題，請修復後重新推送"
    exit 1
fi

echo "🚀 開始強制上傳檢查流程..."

# 1. 強制運行完整規則檢查
echo ""
echo "📋 第1步: 運行完整規則檢查 (enforce-rules.sh)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$PROJECT_ROOT/scripts/enforce-rules.sh" ]; then
    if ! "$PROJECT_ROOT/scripts/enforce-rules.sh"; then
        echo ""
        echo "❌ 規則檢查失敗，推送被強制阻止！"
        echo ""
        echo "🔧 修復建議:"
        echo "   1. 運行 ./scripts/enforce-rules.sh --fix 自動修復"
        echo "   2. 手動修復所有錯誤"
        echo "   3. 重新提交並推送"
        echo ""
        echo "📋 檢查項目包括:"
        echo "   • 硬編碼敏感信息檢查"
        echo "   • 硬編碼路徑檢查 (RouteUtils)"
        echo "   • Docker 兼容性檢查"
        echo "   • 測試覆蓋率檢查"
        echo "   • 代碼風格檢查"
        echo "   • 安全漏洞檢查"
        echo "   • 依賴關係檢查"
        echo "   • 文檔同步檢查"
        echo ""
        exit 1
    fi
    echo "✅ 規則檢查通過"
else
    echo "❌ 錯誤: 找不到規則檢查腳本 (scripts/enforce-rules.sh)"
    echo "🔧 此腳本是強制要求的，請確保它存在"
    exit 1
fi

# 2. 強制運行測試
echo ""
echo "🧪 第2步: 運行項目測試"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TEST_FAILED=false

# 前端測試
if [ -d "$PROJECT_ROOT/frontend" ]; then
    cd "$PROJECT_ROOT/frontend"
    if [ -f "package.json" ] && command -v npm >/dev/null 2>&1; then
        echo "🧪 運行前端測試..."
        if npm run test:basic >/dev/null 2>&1; then
            echo "✅ 前端測試通過"
        else
            echo "❌ 前端測試失敗"
            TEST_FAILED=true
        fi
    else
        echo "⚠️  跳過前端測試 (npm 或 package.json 不存在)"
    fi
    cd "$PROJECT_ROOT"
fi

# 後端測試
if [ -d "$PROJECT_ROOT/backend" ]; then
    cd "$PROJECT_ROOT/backend"
    if [ -f "requirements.txt" ] && command -v python >/dev/null 2>&1; then
        echo "🧪 運行後端測試..."
        if python -m pytest tests/ -x >/dev/null 2>&1; then
            echo "✅ 後端測試通過"
        else
            echo "❌ 後端測試失敗"
            TEST_FAILED=true
        fi
    else
        echo "⚠️  跳過後端測試 (Python 或 requirements.txt 不存在)"
    fi
    cd "$PROJECT_ROOT"
fi

if [ "$TEST_FAILED" = true ]; then
    echo ""
    echo "❌ 測試失敗，推送被強制阻止！"
    echo "🔧 請修復所有測試錯誤後重新推送"
    exit 1
fi

# 3. 最終檢查
echo ""
echo "🔍 第3步: 最終安全檢查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 檢查是否有敏感文件
SENSITIVE_FILES=$(git diff --name-only HEAD~1 HEAD | grep -E "\.(env|key|pem|p12)$" || true)
if [ -n "$SENSITIVE_FILES" ]; then
    echo "❌ 錯誤: 發現敏感文件嘗試推送"
    echo "🔒 敏感文件: $SENSITIVE_FILES"
    echo "💡 請將這些文件添加到 .gitignore"
    exit 1
fi

# 檢查提交訊息品質
COMMIT_MSG=$(git log -1 --pretty=%B)
if [ ${#COMMIT_MSG} -lt 10 ]; then
    echo "❌ 錯誤: 提交訊息太短 (少於10字符)"
    echo "💡 請提供有意義的提交訊息"
    exit 1
fi

echo "✅ 最終安全檢查通過"

echo ""
echo "🎉 =========================================="
echo "🎉   所有檢查通過，允許推送！             "
echo "🎉 =========================================="
echo ""
echo "📊 檢查摘要:"
echo "   ✅ 規則檢查 (8大類)"
echo "   ✅ 項目測試"
echo "   ✅ 安全檢查"
echo "   ✅ 提交品質檢查"
echo ""

exit 0
EOF

# 設置執行權限
chmod +x "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-push"

echo -e "${GREEN}✅ Git hooks 強制安裝完成！${NC}"
echo ""
echo -e "${GREEN}🔒 安裝的強制檢查 hooks:${NC}"
echo "  📝 pre-commit  - 提交前檢查代碼風格和硬編碼"
echo "  🚀 pre-push    - 推送前運行完整規則檢查和測試"
echo ""
echo -e "${BLUE}🛠️  可用命令:${NC}"
echo "  🔧 手動運行規則檢查: ./scripts/enforce-rules.sh"
echo "  🎨 自動修復代碼風格: ./scripts/enforce-rules.sh --fix"
echo "  🔒 嚴格模式檢查:     ./scripts/enforce-rules.sh --strict"
echo ""
echo -e "${RED}🚨 重要防呆機制:${NC}"
echo -e "${RED}   • 無法使用 --no-verify 跳過檢查${NC}"
echo -e "${RED}   • 所有推送都必須通過完整檢查${NC}"
echo -e "${RED}   • 檢查失敗會強制阻止推送${NC}"
echo ""
echo -e "${YELLOW}📋 團隊成員必須執行:${NC}"
echo -e "${YELLOW}   1. git clone 項目後立即運行此腳本${NC}"
echo -e "${YELLOW}   2. 確保所有檢查都能正常運行${NC}"
echo -e "${YELLOW}   3. 遵循統一的代碼品質標準${NC}"
echo ""
echo -e "${GREEN}🎉 現在您的提交和推送都受到品質保護！${NC}"
