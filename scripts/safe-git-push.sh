#!/bin/bash

# 🔒 安全的 Git Push Wrapper
# 強制執行所有檢查，無法跳過
# 團隊必須使用此腳本進行推送

set -e

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}🔒 ========================================${NC}"
echo -e "${RED}🔒   安全推送系統 - 強制品質檢查       ${NC}"
echo -e "${RED}🔒 ========================================${NC}"
echo ""

# 獲取項目根目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Detect if changes to be pushed are only in StockOS directory (kernel project)
if git diff --name-only origin/main..HEAD | grep -q "^StockOS/"; then
    # Check if ALL changes are in StockOS (not mixed with frontend/backend)
    if ! git diff --name-only origin/main..HEAD | grep -v "^StockOS/" | grep -q .; then
        export OS_ONLY=1
        echo -e "${YELLOW}🔧 檢測到純 StockOS 變更，啟用 OS_ONLY 特例模式${NC}"
    fi
fi

# 檢查是否嘗試使用不安全的推送
echo -e "${YELLOW}⚠️  重要提醒:${NC}"
echo -e "${YELLOW}   • 此腳本強制執行所有品質檢查${NC}"
echo -e "${YELLOW}   • 無法跳過任何檢查步驟${NC}"
echo -e "${YELLOW}   • 確保代碼品質和項目安全${NC}"
echo ""

# 1. 強制運行上傳檢查腳本
echo -e "${BLUE}🔍 第1步: 強制品質檢查${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$PROJECT_ROOT/scripts/enforce-rules.sh" ]; then
    if ! "$PROJECT_ROOT/scripts/enforce-rules.sh" --light; then
        echo ""
        echo -e "${RED}❌ 品質檢查失敗，推送被阻止！${NC}"
        echo ""
        echo -e "${YELLOW}🔧 修復建議:${NC}"
        echo "   1. 運行 ./scripts/enforce-rules.sh --fix 自動修復"
        echo "   2. 手動修復所有錯誤"
        echo "   3. 重新運行此安全推送腳本"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}✅ 品質檢查通過${NC}"
else
    echo -e "${RED}❌ 錯誤: 找不到品質檢查腳本${NC}"
    exit 1
fi

# 2. 檢查 Git 狀態
echo ""
echo -e "${BLUE}📋 第2步: Git 狀態檢查${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_ROOT"

# 檢查是否有未提交的變更
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ 錯誤: 有未提交的變更${NC}"
    echo "💡 請先提交所有變更: git add . && git commit -m '描述'"
    exit 1
fi

# 檢查是否有未追蹤的文件
if [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo -e "${YELLOW}⚠️  警告: 發現未追蹤的文件${NC}"
    echo "未追蹤的文件:"
    git ls-files --others --exclude-standard
    echo ""
    read -p "是否繼續推送? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "推送已取消"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Git 狀態檢查通過${NC}"

# 3. 安全推送
echo ""
echo -e "${BLUE}🚀 第3步: 執行安全推送${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 獲取當前分支
CURRENT_BRANCH=$(git branch --show-current)

# 獲取推送參數 (如果有的話)
REMOTE=${1:-origin}
BRANCH=${2:-$CURRENT_BRANCH}

echo "推送目標: $REMOTE/$BRANCH"
echo ""

# 執行推送 (設置環境變數告知 pre-push hook 這是安全推送)
if SAFE_PUSH=1 git push "$REMOTE" "$BRANCH"; then
    echo ""
    echo -e "${GREEN}🎉 ========================================${NC}"
    echo -e "${GREEN}🎉   安全推送成功完成！                 ${NC}"
    echo -e "${GREEN}🎉 ========================================${NC}"
    echo ""
    echo -e "${GREEN}📊 完成的檢查:${NC}"
    echo "   ✅ 品質檢查 (8大類)"
    echo "   ✅ Git 狀態檢查"
    echo "   ✅ 安全推送執行"
    echo ""
else
    echo ""
    echo -e "${RED}❌ 推送失敗！${NC}"
    echo "💡 請檢查錯誤信息並修復後重試"
    exit 1
fi