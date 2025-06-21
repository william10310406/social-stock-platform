# Stock Insight Platform 規則工具使用指南

## 📋 概述

本目錄包含 Stock Insight Platform 項目的規則強制執行工具和腳本。這些工具確保代碼品質、架構一致性和最佳實踐的遵循。

---

## 🛠️ 可用工具

### 1. 📋 規則檢查工具 (`enforce-rules.sh`)

**用途**: 完整的規則合規性檢查，用於開發和 CI/CD 流程

**使用方法**:
```bash
# 基本檢查
./scripts/enforce-rules.sh

# 嚴格模式 (警告也會導致失敗)
./scripts/enforce-rules.sh --strict

# 自動修復代碼風格
./scripts/enforce-rules.sh --fix

# 顯示幫助
./scripts/enforce-rules.sh --help
```

**檢查項目**:
- 🔍 硬編碼敏感信息檢測
- 🛣️ 路徑管理規範檢查
- 🐳 Docker 兼容性驗證
- 🧪 測試覆蓋率檢查
- 🎨 代碼風格驗證
- 🔒 安全漏洞掃描
- 📦 依賴關係檢查
- 📚 文檔同步檢查

### 2. 🔧 快速修復工具 (`quick-fix.sh`)

**用途**: 自動修復常見的規則違規問題

**使用方法**:
```bash
# 執行自動修復
./scripts/quick-fix.sh

# 顯示幫助
./scripts/quick-fix.sh --help
```

**修復內容**:
- ✅ 代碼自動格式化
- ✅ 創建缺失的配置文件
- ✅ 安裝必要的開發工具
- ✅ 處理檢測誤判問題

### 3. 🪝 Git Hooks 安裝器 (`install-git-hooks.sh`)

**用途**: 安裝 Git hooks 實現自動規則檢查

**使用方法**:
```bash
# 安裝 Git hooks
./scripts/install-git-hooks.sh
```

**安裝的 Hooks**:
- **pre-commit**: 提交前檢查代碼風格和硬編碼
- **pre-push**: 推送前運行完整規則檢查和測試

### 4. 🐳 Docker 兼容性檢查 (`docker-compatibility-check.sh`)

**用途**: 驗證所有腳本在 Docker 環境中的兼容性

**使用方法**:
```bash
# 運行兼容性檢查
./scripts/docker-compatibility-check.sh
```

**檢查內容**:
- 前端腳本兼容性 (5項)
- 後端腳本兼容性 (4項)
- Shell 腳本兼容性 (5項)
- 環境變數支持 (2項)
- Docker 文件配置 (5項)

---

## 🚀 快速開始

### 新開發者設置

1. **安裝 Git hooks**:
   ```bash
   ./scripts/install-git-hooks.sh
   ```

2. **運行初始檢查**:
   ```bash
   ./scripts/enforce-rules.sh
   ```

3. **自動修復問題**:
   ```bash
   ./scripts/quick-fix.sh
   ```

4. **重新檢查**:
   ```bash
   ./scripts/enforce-rules.sh
   ```

### 日常開發流程

1. **開發功能**
2. **提交前** (自動觸發 pre-commit hook):
   - 代碼風格檢查
   - 硬編碼檢查
3. **推送前** (自動觸發 pre-push hook):
   - 完整規則檢查
   - 測試執行
4. **CI/CD** (自動執行):
   - 規則強制檢查
   - 安全掃描
   - Docker 驗證

---

## ⚙️ 配置和自定義

### 修改規則檢查標準

編輯 `enforce-rules.sh` 中的檢查函數:

```bash
# 例如：調整測試覆蓋率要求
if [ "$COVERAGE" -lt 80 ]; then  # 改為其他數值
    report_warning "測試覆蓋率低於要求"
fi
```

### 跳過特定檢查

使用環境變數跳過某些檢查:

```bash
# 跳過測試檢查
SKIP_TESTS=1 ./scripts/enforce-rules.sh

# 跳過安全掃描
SKIP_SECURITY=1 ./scripts/enforce-rules.sh
```

### Git Hooks 自定義

編輯 `.git/hooks/pre-commit` 或 `.git/hooks/pre-push` 文件:

```bash
# 添加自定義檢查
echo "🔍 運行自定義檢查..."
# 你的自定義邏輯
```

---

## 🚨 故障排除

### 常見問題

#### 1. Git hooks 沒有執行
```bash
# 檢查權限
ls -la .git/hooks/
# 如果沒有執行權限，重新安裝
./scripts/install-git-hooks.sh
```

#### 2. 規則檢查失敗
```bash
# 查看詳細錯誤
./scripts/enforce-rules.sh

# 嘗試自動修復
./scripts/quick-fix.sh

# 檢查特定問題
grep -r "問題關鍵字" frontend/src backend/app
```

#### 3. 測試無法運行
```bash
# 前端測試
cd frontend && npm install && npm run test

# 後端測試  
cd backend && pip install -r requirements.txt && python -m pytest
```

#### 4. Docker 兼容性問題
```bash
# 檢查環境配置
./scripts/docker-compatibility-check.sh

# 檢查配置模組
ls -la frontend/scripts/script-env.js
ls -la backend/scripts/script_env.py
```

### 跳過檢查 (緊急情況)

```bash
# 跳過 Git hooks
git commit --no-verify
git push --no-verify

# 跳過特定規則
SKIP_RULES=1 ./scripts/enforce-rules.sh
```

---

## 📊 CI/CD 集成

### GitHub Actions

項目已配置 `.github/workflows/rules-enforcement.yml`:

- ✅ 自動運行規則檢查
- ✅ 安全漏洞掃描
- ✅ Docker 構建驗證
- ✅ 生成檢查報告

### 其他 CI 系統

#### GitLab CI
```yaml
rules_check:
  script:
    - chmod +x ./scripts/enforce-rules.sh
    - ./scripts/enforce-rules.sh --strict
```

#### Jenkins
```groovy
stage('Rules Check') {
    steps {
        sh 'chmod +x ./scripts/enforce-rules.sh'
        sh './scripts/enforce-rules.sh --strict'
    }
}
```

---

## 📚 規則文檔參考

- 📋 [項目總體規則](../RULES.md)
- 🎨 [前端開發規則](../frontend/RULES.md)
- 🐍 [後端開發規則](../backend/RULES.md)

---

## 🔄 工具更新

### 更新規則檢查工具

1. 修改 `enforce-rules.sh`
2. 測試新功能:
   ```bash
   ./scripts/enforce-rules.sh --help
   ./scripts/enforce-rules.sh
   ```
3. 更新文檔

### 添加新的檢查項目

1. 在 `enforce-rules.sh` 中添加新函數:
   ```bash
   check_new_rule() {
       echo "🔍 檢查新規則..."
       # 檢查邏輯
   }
   ```

2. 在 `main()` 函數中調用:
   ```bash
   check_new_rule
   ```

3. 測試並更新文檔

---

## 💡 最佳實踐

### 開發者

1. **每日開始前**運行 `./scripts/enforce-rules.sh`
2. **提交前**確保所有檢查通過
3. **遇到問題**先嘗試 `./scripts/quick-fix.sh`
4. **手動修復**參考規則文檔

### 團隊負責人

1. **定期審查**規則執行效果
2. **更新規則**基於實際需求
3. **培訓團隊**使用規則工具
4. **監控**CI/CD 中的規則檢查結果

### 項目維護

1. **保持工具更新**與項目發展同步
2. **文檔及時更新**反映最新變更
3. **收集反饋**持續改進工具
4. **測試兼容性**新功能不影響現有流程

---

**工具版本**: v1.0  
**最後更新**: 2024年12月  
**維護者**: Stock Insight Platform 開發團隊

> 💡 **提示**: 如果工具有問題或改進建議，請提交 Issue 或 Pull Request 
