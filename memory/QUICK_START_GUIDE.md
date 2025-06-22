# 🚀 5分鐘快速上手指南

> **目標**: 讓任何人在5分鐘內了解項目並開始開發

## ⚡ **超快速開始 (1分鐘)**

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發服務器
npm run dev

# 3. 打開瀏覽器
# http://localhost:5173
```

**✅ 成功標誌**: 看到 Stock Insight Platform 首頁

---

## 📖 **了解項目 (2分鐘)**

### 🎯 **這是什麼？**
Stock Insight Platform - **企業級股票數據分析平台**

### 📊 **核心數據**
- **126支真實台股** + 2030+筆價格資料
- **97.4% 測試通過率** (74/76)
- **85% 代碼重用率** (組件庫)
- **100% Docker 兼容**

### 🏗️ **技術棧**
- **前端**: Vanilla JS + Vite + TailwindCSS
- **後端**: Flask + PostgreSQL + Redis
- **實時**: Socket.IO 5.3.6
- **容器**: Docker + Docker Compose

---

## 🧩 **核心組件 (1分鐘)**

### 📚 **組件庫** (`src/lib/`)
```javascript
// Toast 通知
import { Toast } from './src/lib/index.js';
Toast.show('成功!', 'success');

// Modal 彈窗
import { Modal } from './src/lib/index.js';
Modal.show('標題', '內容');

// Loading 載入
import { Loading } from './src/lib/index.js';
Loading.show();

// Formatter 格式化
import { Formatter } from './src/lib/index.js';
Formatter.currency(123.45); // "$123.45"
```

### 🛣️ **路徑管理**
```javascript
// ✅ 正確方式 - 使用 RouteUtils
import { RouteUtils } from './js/utils/routes.js';
const apiUrl = RouteUtils.getApiUrl('stocks');

// ❌ 錯誤方式 - 硬編碼
const apiUrl = 'http://localhost:5000/api/stocks';
```

---

## 🧪 **測試 (1分鐘)**

### 📋 **必要測試**
```bash
# 運行所有測試
npm run test

# 代碼品質檢查
npm run quality

# 組件庫測試
npm run lib:test
```

### ✅ **成功標準**
- 測試通過率 > 90%
- ESLint 無錯誤
- Prettier 格式正確

---

## 🎯 **開發流程**

### 1️⃣ **開始新功能**
```bash
# 1. 確保測試通過
npm run test

# 2. 創建新分支
git checkout -b feature/new-feature

# 3. 開始開發
npm run dev
```

### 2️⃣ **開發中**
- 使用組件庫 (`src/lib/`)
- 使用 RouteUtils (路徑管理)
- 遵循 3層架構 (Level 0-2)
- 定期運行測試

### 3️⃣ **完成功能**
```bash
# 1. 完整測試
npm run test
npm run quality

# 2. 提交代碼
git add .
git commit -m "feat: 新功能描述"

# 3. 推送
git push origin feature/new-feature
```

---

## 🚨 **重要規則**

### ⚠️ **絕對必須**
1. **測試優先** - 所有修改必須先測試通過
2. **使用組件庫** - 避免重複實現
3. **統一路徑管理** - 使用 RouteUtils
4. **遵循架構** - 3層依賴結構

### ❌ **絕對禁止**
1. 硬編碼路徑
2. 未測試提交
3. 循環依賴
4. 跳過文檔更新

---

## 🐳 **Docker 開發**

### 🔧 **Docker 環境**
```bash
# 啟動 Docker 環境
npm run docker:up

# 檢查狀態
docker ps

# 查看日誌
npm run docker:logs

# 停止環境
npm run docker:down
```

### ✅ **Docker 測試**
```bash
# Docker 兼容性測試
npm run docker:test

# 組件庫 Docker 測試
npm run lib:docker
```

---

## 📚 **快速參考**

### 🔍 **遇到問題？**
1. **項目狀態**: `cat memory/PROJECT_STATUS.md`
2. **開發規範**: `cat memory/DEVELOPMENT_RULES.md`
3. **常用命令**: `cat memory/COMMON_COMMANDS.md`
4. **故障排除**: `cat memory/TROUBLESHOOTING.md`

### 📖 **深入了解**
- **架構文檔**: `docs/architecture/`
- **實現記錄**: `docs/implementation/`
- **測試報告**: `docs/reports/`
- **開發指南**: `docs/guides/`

---

## 🎯 **角色導向指南**

### 👨‍💻 **前端開發者**
```bash
# 1. 了解組件庫
npm run lib:test

# 2. 查看架構
cat docs/architecture/javascript-dependencies.yaml

# 3. 開始開發
npm run dev
```

### 🤖 **AI 工具**
```bash
# 1. 載入項目記憶
cat memory/PROJECT_STATUS.md
cat memory/DEVELOPMENT_RULES.md

# 2. 了解架構
cat docs/architecture/stock-architecture.yaml

# 3. 開始協助
```

### 🔧 **DevOps**
```bash
# 1. 檢查 Docker
npm run docker:check

# 2. 運行測試
npm run test

# 3. 部署準備
npm run build
```

---

## ⏰ **時間分配建議**

### 📅 **第一天 (30分鐘)**
- ✅ 5分鐘: 快速上手 (本指南)
- ✅ 10分鐘: 閱讀 `PROJECT_STATUS.md`
- ✅ 10分鐘: 閱讀 `DEVELOPMENT_RULES.md`
- ✅ 5分鐘: 運行測試確認環境

### 📅 **第一週**
- 熟悉組件庫使用
- 了解路徑管理系統
- 掌握測試流程
- 完成第一個小功能

---

## 🎉 **檢查清單**

### ✅ **環境設置完成**
- [ ] `npm install` 成功
- [ ] `npm run dev` 啟動成功
- [ ] `npm run test` 通過 > 90%
- [ ] 瀏覽器可以訪問 http://localhost:5173

### ✅ **理解項目**
- [ ] 知道項目是做什麼的
- [ ] 了解技術棧
- [ ] 熟悉組件庫
- [ ] 理解路徑管理

### ✅ **開發準備**
- [ ] 知道開發規範
- [ ] 了解測試流程
- [ ] 會使用常用命令
- [ ] 知道如何獲取幫助

---

## 🚀 **下一步**

### 🎯 **立即行動**
1. 運行 `npm run dev` 啟動項目
2. 瀏覽 http://localhost:5173 查看界面
3. 運行 `npm run lib:test` 測試組件庫
4. 閱讀 `memory/DEVELOPMENT_RULES.md` 了解規範

### 📖 **深入學習**
- 研究 `docs/architecture/` 了解系統設計
- 查看 `docs/implementation/` 了解實現細節
- 參考 `docs/guides/` 學習最佳實踐

---

**🎯 目標達成**: 5分鐘內從零開始到能夠進行開發！

> 💡 **提示**: 這個指南涵蓋了最重要的 20%，足以開始 80% 的開發工作。
> 🔍 **記住**: 遇到問題時，先查看 `memory/` 資料夾的其他文件！ 
