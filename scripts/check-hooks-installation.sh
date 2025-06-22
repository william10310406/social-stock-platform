#!/bin/bash

# 🔍 Git Hooks 安裝檢查腳本
# 檢查團隊成員是否已正確安裝強制的 Git hooks

set -e

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 ========================================${NC}"
echo -e "${BLUE}🔍   Git Hooks 安裝狀態檢查             ${NC}"
echo -e "${BLUE}🔍 ========================================${NC}"
echo ""

# 獲取項目根目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

# 檢查計數器
CHECKS_PASSED=0
TOTAL_CHECKS=6

echo "📋 檢查項目："
echo ""

# 1. 檢查 .git/hooks 目錄是否存在
echo -n "1. 檢查 Git hooks 目錄... "
if [ -d "$HOOKS_DIR" ]; then
    echo -e "${GREEN}✅ 存在${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ 不存在${NC}"
    echo -e "${RED}   錯誤: 不在 Git 項目中或 hooks 目錄缺失${NC}"
fi

# 2. 檢查 pre-commit hook 是否存在
echo -n "2. 檢查 pre-commit hook... "
if [ -f "$HOOKS_DIR/pre-commit" ]; then
    echo -e "${GREEN}✅ 已安裝${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ 未安裝${NC}"
fi

# 3. 檢查 pre-push hook 是否存在
echo -n "3. 檢查 pre-push hook... "
if [ -f "$HOOKS_DIR/pre-push" ]; then
    echo -e "${GREEN}✅ 已安裝${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ 未安裝${NC}"
fi

# 4. 檢查 hooks 是否可執行
echo -n "4. 檢查 hooks 執行權限... "
if [ -x "$HOOKS_DIR/pre-commit" ] && [ -x "$HOOKS_DIR/pre-push" ]; then
    echo -e "${GREEN}✅ 權限正確${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ 權限不足${NC}"
fi

# 5. 檢查 enforce-rules.sh 腳本是否存在
echo -n "5. 檢查規則檢查腳本... "
if [ -f "$PROJECT_ROOT/scripts/enforce-rules.sh" ] && [ -x "$PROJECT_ROOT/scripts/enforce-rules.sh" ]; then
    echo -e "${GREEN}✅ 存在且可執行${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ 缺失或無執行權限${NC}"
fi

# 6. 測試 hooks 是否包含強制檢查
echo -n "6. 檢查強制檢查機制... "
if [ -f "$HOOKS_DIR/pre-push" ] && grep -q "不允許跳過上傳檢查" "$HOOKS_DIR/pre-push"; then
    echo -e "${GREEN}✅ 強制檢查已啟用${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ 強制檢查未啟用${NC}"
fi

echo ""
echo -e "${BLUE}📊 檢查結果摘要:${NC}"
echo "   通過: $CHECKS_PASSED/$TOTAL_CHECKS"

if [ $CHECKS_PASSED -eq $TOTAL_CHECKS ]; then
    echo ""
    echo -e "${GREEN}🎉 ========================================${NC}"
    echo -e "${GREEN}🎉   Git Hooks 安裝完整！               ${NC}"
    echo -e "${GREEN}🎉   您的環境已受到品質保護             ${NC}"
    echo -e "${GREEN}🎉 ========================================${NC}"
    echo ""
    echo -e "${GREEN}✅ 所有檢查都已通過，您可以安全地進行開發${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ ========================================${NC}"
    echo -e "${RED}❌   Git Hooks 安裝不完整！             ${NC}"
    echo -e "${RED}❌   請立即修復以確保代碼品質           ${NC}"
    echo -e "${RED}❌ ========================================${NC}"
    echo ""
    echo -e "${YELLOW}🔧 修復步驟:${NC}"
    echo -e "${YELLOW}   1. 運行安裝腳本: ./scripts/install-git-hooks.sh${NC}"
    echo -e "${YELLOW}   2. 確保在 Git 項目根目錄中${NC}"
    echo -e "${YELLOW}   3. 檢查文件權限: chmod +x scripts/*.sh${NC}"
    echo -e "${YELLOW}   4. 重新運行此檢查: ./scripts/check-hooks-installation.sh${NC}"
    echo ""
    echo -e "${RED}⚠️  警告: 未安裝 hooks 可能導致代碼品質問題！${NC}"
    exit 1
fi 