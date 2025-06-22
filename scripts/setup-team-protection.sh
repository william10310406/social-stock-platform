#!/bin/bash

# 🔒 團隊保護機制設置腳本
# 設置 Git aliases 和強制安全推送機制

set -e

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}🔒 ===========================================${NC}"
echo -e "${RED}🔒   團隊保護機制設置 - 防呆系統         ${NC}"
echo -e "${RED}🔒 ===========================================${NC}"
echo ""

# 獲取項目根目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${YELLOW}📋 設置內容:${NC}"
echo "   • 安裝強制 Git hooks"
echo "   • 設置安全推送 alias"
echo "   • 創建防呆提醒機制"
echo "   • 配置團隊開發環境"
echo ""

# 1. 安裝 Git hooks
echo -e "${BLUE}🔧 第1步: 安裝 Git Hooks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$PROJECT_ROOT/scripts/install-git-hooks.sh" ]; then
    "$PROJECT_ROOT/scripts/install-git-hooks.sh"
else
    echo -e "${RED}❌ 錯誤: 找不到 Git hooks 安裝腳本${NC}"
    exit 1
fi

# 2. 設置 Git aliases
echo ""
echo -e "${BLUE}🔧 第2步: 設置 Git Aliases${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_ROOT"

# 設置安全推送 alias
git config alias.safe-push "!$PROJECT_ROOT/scripts/safe-git-push.sh"

# 設置檢查 alias
git config alias.check-rules "!$PROJECT_ROOT/scripts/enforce-rules.sh"

# 設置自動修復 alias
git config alias.auto-fix "!$PROJECT_ROOT/scripts/enforce-rules.sh --fix"

# 設置 hooks 檢查 alias
git config alias.check-hooks "!$PROJECT_ROOT/scripts/check-hooks-installation.sh"

echo -e "${GREEN}✅ Git aliases 設置完成${NC}"

# 3. 創建推送提醒
echo ""
echo -e "${BLUE}🔧 第3步: 創建防呆提醒${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 創建 .git/hooks/pre-push 的增強版本
cat > "$PROJECT_ROOT/.git/hooks/pre-push" << 'EOF'
#!/bin/bash

echo ""
echo "🚨 =========================================="
echo "🚨   檢測到直接推送嘗試！                 "
echo "🚨 =========================================="
echo ""
echo "⚠️  為了確保代碼品質，請使用安全推送："
echo ""
echo "   🔒 安全推送: git safe-push"
echo "   🔍 檢查規則: git check-rules"
echo "   🔧 自動修復: git auto-fix"
echo ""
echo "💡 或者直接運行: ./scripts/safe-git-push.sh"
echo ""

# 詢問是否繼續
read -p "是否仍要直接推送 (不建議)? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "推送已取消，請使用 git safe-push"
    exit 1
fi

echo "⚠️  警告: 您選擇了直接推送，請確保已通過所有檢查"

# 運行原來的檢查邏輯
PROJECT_ROOT="$(git rev-parse --show-toplevel)"

# 強制運行規則檢查
if [ -f "$PROJECT_ROOT/scripts/enforce-rules.sh" ]; then
    echo "🔍 運行強制檢查..."
    if ! "$PROJECT_ROOT/scripts/enforce-rules.sh"; then
        echo "❌ 檢查失敗，推送被阻止"
        exit 1
    fi
fi

echo "✅ 檢查通過，允許推送"
EOF

chmod +x "$PROJECT_ROOT/.git/hooks/pre-push"

echo -e "${GREEN}✅ 防呆提醒設置完成${NC}"

# 4. 創建團隊使用指南
echo ""
echo -e "${BLUE}🔧 第4步: 創建使用指南${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > "$PROJECT_ROOT/TEAM_SAFETY_GUIDE.md" << 'EOF'
# 🔒 團隊安全開發指南

## ⚠️ 重要：強制安全機制

為了確保代碼品質和項目安全，本項目實施了強制的安全開發機制。

### 🚨 必須遵循的流程

#### 1. 首次設置 (每個團隊成員必須執行)
```bash
# 設置團隊保護機制
./scripts/setup-team-protection.sh

# 檢查設置是否正確
git check-hooks
```

#### 2. 日常開發流程
```bash
# 開發代碼...

# 檢查代碼品質
git check-rules

# 自動修復問題 (如果需要)
git auto-fix

# 提交代碼
git add .
git commit -m "描述您的變更"

# 安全推送 (強制執行所有檢查)
git safe-push
```

### 🛡️ 安全機制說明

- **🔒 強制檢查**: 推送前必須通過8大類品質檢查
- **🚫 無法跳過**: 不允許使用 --no-verify 跳過檢查
- **🧪 測試保護**: 自動運行項目測試
- **🔐 安全掃描**: 防止敏感文件洩露
- **📝 品質保證**: 檢查提交訊息品質

### 📋 可用命令

| 命令 | 功能 |
|------|------|
| `git safe-push` | 安全推送 (推薦) |
| `git check-rules` | 檢查代碼規則 |
| `git auto-fix` | 自動修復問題 |
| `git check-hooks` | 檢查 hooks 安裝 |

### 🚨 緊急情況

如果遇到問題：

1. **檢查失敗**: 運行 `git auto-fix` 自動修復
2. **測試失敗**: 修復測試後重新推送
3. **Hooks 問題**: 重新運行 `./scripts/setup-team-protection.sh`

### ❌ 禁止的操作

- ❌ 使用 `git push --no-verify`
- ❌ 跳過品質檢查
- ❌ 提交未測試的代碼
- ❌ 推送敏感文件

### ✅ 推薦的操作

- ✅ 使用 `git safe-push`
- ✅ 定期運行 `git check-rules`
- ✅ 提交前自動修復問題
- ✅ 遵循團隊開發規範

---

**記住**: 這些機制是為了保護項目品質和團隊合作效率！
EOF

echo -e "${GREEN}✅ 團隊使用指南創建完成${NC}"

# 5. 最終檢查
echo ""
echo -e "${BLUE}🔧 第5步: 最終檢查${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 檢查所有設置
if "$PROJECT_ROOT/scripts/check-hooks-installation.sh" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Hooks 安裝檢查通過${NC}"
else
    echo -e "${RED}❌ Hooks 安裝檢查失敗${NC}"
fi

# 檢查 aliases
if git config --get alias.safe-push >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Git aliases 設置成功${NC}"
else
    echo -e "${RED}❌ Git aliases 設置失敗${NC}"
fi

echo ""
echo -e "${GREEN}🎉 =========================================${NC}"
echo -e "${GREEN}🎉   團隊保護機制設置完成！              ${NC}"
echo -e "${GREEN}🎉 =========================================${NC}"
echo ""
echo -e "${GREEN}📋 設置摘要:${NC}"
echo "   ✅ Git hooks 強制安裝"
echo "   ✅ 安全推送 aliases"
echo "   ✅ 防呆提醒機制"
echo "   ✅ 團隊使用指南"
echo ""
echo -e "${YELLOW}🎯 下一步:${NC}"
echo "   1. 閱讀 TEAM_SAFETY_GUIDE.md"
echo "   2. 使用 'git safe-push' 進行推送"
echo "   3. 確保所有團隊成員都運行此腳本"
echo ""
echo -e "${BLUE}💡 快速測試:${NC}"
echo "   git check-rules  # 檢查代碼規則"
echo "   git safe-push    # 安全推送"
echo "" 