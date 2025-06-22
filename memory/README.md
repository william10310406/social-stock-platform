# 🧠 Stock Insight Platform - 項目記憶中心

## 📖 給新加入開發者和 AI 工具的快速指南

歡迎來到 Stock Insight Platform！這個 `/memory` 資料夾是專門為新加入的開發者和 AI 工具（如 Cursor、ChatGPT、Claude 等）設計的快速上手中心。

## 🎯 **立即開始 - 5分鐘了解項目**

### 1️⃣ **項目狀態檢查** (必讀)
```bash
# 查看項目當前狀態
cat memory/PROJECT_STATUS.md
```

### 2️⃣ **架構快速了解**
```bash
# 查看系統架構總覽
cat docs/README.md
cat docs/architecture/stock-architecture.yaml
```

### 3️⃣ **開發環境準備**
```bash
# 安裝依賴
npm install

# 檢查可用命令
npm run

# 啟動開發環境
npm run dev
```

---

## 📁 記憶文件結構

```
memory/
├── README.md                    # 🔥 主索引 (你現在在這裡)
├── PROJECT_STATUS.md            # 🔥 項目當前狀態總覽
├── QUICK_START_GUIDE.md         # 🚀 5分鐘快速上手
├── ARCHITECTURE_SUMMARY.md      # 🏗️ 架構決策摘要
├── DEVELOPMENT_RULES.md         # 📋 開發規範和最佳實踐
├── COMPLETED_FEATURES.md        # ✅ 已完成功能清單
├── TECH_STACK_DECISIONS.md      # 🛠️ 技術棧選擇原因
├── COMMON_COMMANDS.md           # 💻 常用命令速查
├── TESTING_CHECKLIST.md        # 🧪 測試檢查清單
└── TROUBLESHOOTING.md           # 🔧 常見問題解決
```

---

## 🎯 **根據你的角色快速導航**

### 👨‍💻 **前端開發者**
1. 閱讀 `PROJECT_STATUS.md` 了解當前狀態
2. 查看 `ARCHITECTURE_SUMMARY.md` 了解組件庫和路徑管理
3. 參考 `DEVELOPMENT_RULES.md` 了解編碼規範
4. 使用 `COMMON_COMMANDS.md` 快速開發

### 🤖 **AI 工具 (Cursor/ChatGPT/Claude)**
1. **必讀**: `PROJECT_STATUS.md` - 獲取項目完整狀態
2. **架構**: `ARCHITECTURE_SUMMARY.md` - 了解技術決策
3. **規範**: `DEVELOPMENT_RULES.md` - 遵循開發標準
4. **測試**: `TESTING_CHECKLIST.md` - 確保代碼品質

### 🔧 **DevOps 工程師**
1. 查看 `TECH_STACK_DECISIONS.md` 了解部署架構
2. 參考 `docs/architecture/stock-architecture.yaml` 了解完整技術棧
3. 檢查 Docker 相關配置和文檔

### 📊 **項目經理**
1. 閱讀 `COMPLETED_FEATURES.md` 了解進度
2. 查看 `docs/reports/` 了解項目報告
3. 參考 `QUICK_START_GUIDE.md` 了解項目概況

---

## 🚨 **重要原則**

### 🔒 **上傳檢查腳本 - 強制執行**
> ⚠️ **任何代碼提交前都必須運行**: `./scripts/enforce-rules.sh`
> 
> 包含8大類檢查：硬編碼檢查、路徑管理、Docker兼容性、測試覆蓋率、代碼風格、安全漏洞、依賴關係、文檔同步

### ⚠️ **開發前必讀**
- **上傳檢查**: 提交前必須運行 `./scripts/enforce-rules.sh`
- **測試優先**: 所有修改必須先測試通過才能提交
- **路徑管理**: 使用統一路徑管理系統，避免硬編碼
- **組件重用**: 優先使用 `src/lib/` 組件庫
- **文檔同步**: 重大修改需更新對應文檔

### 🎯 **AI 工具使用指南**
1. 開始任何任務前先讀取 `PROJECT_STATUS.md`
2. 遵循 `DEVELOPMENT_RULES.md` 中的編碼規範
3. 使用 `TESTING_CHECKLIST.md` 確保代碼品質
4. 參考 `TROUBLESHOOTING.md` 解決常見問題

---

## 🔄 **記憶更新規則**

### 誰來更新？
- **項目狀態**: 技術負責人每週更新
- **開發規範**: 團隊討論後更新
- **完成功能**: 功能開發者即時更新
- **故障排除**: 遇到問題時即時補充

### 何時更新？
- 新功能完成時
- 架構重大變更時
- 發現新的最佳實踐時
- 解決重要問題時

---

## 🎉 **快速開始建議**

### 對於新開發者：
```bash
# 1. 了解項目狀態
cat memory/PROJECT_STATUS.md

# 2. 快速上手
cat memory/QUICK_START_GUIDE.md

# 3. 開始開發
npm run dev
```

### 對於 AI 工具：
```bash
# 1. 載入項目記憶
cat memory/PROJECT_STATUS.md
cat memory/ARCHITECTURE_SUMMARY.md
cat memory/DEVELOPMENT_RULES.md

# 2. 檢查可用命令
cat memory/COMMON_COMMANDS.md

# 3. 開始協助開發
```

---

**版本**: 1.0.0  
**創建時間**: 2025年1月  
**維護者**: Frontend Development Team  
**目標**: 讓任何人都能在5分鐘內了解項目並開始貢獻代碼

---

> 💡 **提示**: 如果你是 AI 工具，建議先完整閱讀這個資料夾的所有文件，這樣你就能更好地協助開發工作！ 
