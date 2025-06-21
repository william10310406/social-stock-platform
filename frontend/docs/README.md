# Stock Insight Platform - 架構文檔中心

## 📚 文檔概覽

本目錄包含 Stock Insight Platform 的所有架構文檔，提供系統設計、依賴關係和開發指引的完整參考。

## 🏗️ 架構文檔列表

### 1. 📋 **依賴關係映射**

#### [`html-dependencies.yaml`](./html-dependencies.yaml)
- **用途**: HTML 文件與 JavaScript 依賴關係映射
- **包含**: 8 個 HTML 頁面的腳本載入順序和依賴規則
- **關鍵內容**:
  - 每個頁面載入的腳本清單
  - 載入順序規則 (routes.js → pathManager.js → template.js → api.js → auth.js → 功能腳本)
  - 循環依賴檢查規則
  - 外部庫依賴 (Chart.js)

#### [`javascript-dependencies.yaml`](./javascript-dependencies.yaml)
- **用途**: JavaScript 模組間的相互依賴關係
- **包含**: 所有 JS 文件的導入/導出關係和層級結構
- **關鍵內容**:
  - 3 層依賴結構 (Level 0: 基礎層 → Level 1: 工具層 → Level 2: 功能層)
  - 每個模組的導入、導出和全域變數
  - 循環依賴防護規則
  - 模組間通信方法 (全域變數、事件系統)

### 2. 🛣️ **路徑管理系統**

#### [`path-config-architecture.yaml`](./path-config-architecture.yaml)
- **用途**: 統一路徑管理系統的完整架構
- **包含**: 路徑配置結構和工具函數規範
- **關鍵內容**:
  - 核心配置文件 `src/js/config/routes.js` 結構
  - RouteUtils 工具函數庫 API
  - 頁面、腳本、API、組件路徑分類
  - 參數化路徑支持
  - 環境配置管理

### 3. 🏢 **整體系統架構**

#### [`stock-architecture.yaml`](./stock-architecture.yaml)
- **用途**: Stock Insight Platform 的完整系統架構
- **包含**: 前端、後端、資料庫的完整技術規格
- **關鍵內容**:
  - 技術棧選擇和架構決策
  - 前端模組結構和功能分工
  - 後端 API 端點和資料模型
  - 資料庫表結構和關係
  - 安全性和效能考量

### 4. 🐳 **Docker 環境文檔**

#### [`DOCKER_ARCHITECTURE_VALIDATION.md`](./DOCKER_ARCHITECTURE_VALIDATION.md)
- **用途**: Docker 環境架構驗證指南
- **包含**: Docker 專用配置和測試方法
- **關鍵內容**:
  - routes-docker.js 配置差異
  - API 代理設置驗證
  - 模組載入測試清單
  - 完整環境驗證流程

#### [`LOCALHOST_CLEANUP_REPORT.md`](./LOCALHOST_CLEANUP_REPORT.md)
- Docker 環境問題診斷和解決
- localhost 硬編碼清理報告

### 5. 📖 **開發指引文檔**

#### [`ARCHITECTURE_IMPROVEMENTS.md`](./ARCHITECTURE_IMPROVEMENTS.md)
- 企業級架構改進記錄
- 代碼品質工具鏈配置
- 統一日誌管理系統

#### [`UNIFIED_CONFIG.md`](./UNIFIED_CONFIG.md)
- 統一配置管理系統
- 工具配置集中化方案

#### [`MIGRATION_REPORT.md`](./MIGRATION_REPORT.md)
- 路徑管理系統遷移報告
- 硬編碼路徑解決方案

#### [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md)
- 測試策略和覆蓋率報告
- 單元測試、整合測試指引

#### [`DEVELOPMENT_SAFETY.md`](./DEVELOPMENT_SAFETY.md)
- 開發安全實踐
- 代碼提交前檢查清單

## 🎯 使用指引

### 🔍 **查看依賴關係**
```bash
# 檢查 HTML 頁面的腳本依賴
less docs/html-dependencies.yaml

# 檢查 JavaScript 模組依賴
less docs/javascript-dependencies.yaml
```

### 🛠️ **開發新功能時**
1. **確定模組層級**: 參考 `javascript-dependencies.yaml` 的層級結構
2. **檢查路徑配置**: 使用 `path-config-architecture.yaml` 的 RouteUtils API
3. **避免循環依賴**: 遵循依賴層級規則 (不能向上依賴)
4. **更新文檔**: 新增模組時更新對應的 YAML 文檔

### 🔧 **重構現有代碼時**
1. **評估影響範圍**: 檢查 `javascript-dependencies.yaml` 的 `used_by` 欄位
2. **保持層級結構**: 不要打破現有的依賴層級
3. **測試依賴關係**: 運行 `npm run test` 確保所有測試通過
4. **更新架構文檔**: 修改後更新相關 YAML 文檔

## 📊 **架構概覽圖**

```
┌─────────────────────────────────────────────────────────────┐
│                    Stock Insight Platform                   │
│                      架構層級結構                            │
└─────────────────────────────────────────────────────────────┘

Level 0 (基礎層) - 不依賴任何模組
├── config/routes.js        # 路徑配置 (單一真實來源)
├── config/constants.js     # 系統常數
├── utils/logger.js         # 日誌管理
├── utils/errorManager.js   # 錯誤管理
└── utils/loadingManager.js # 載入管理

Level 1 (工具層) - 只依賴基礎層
├── utils/pathManager.js    # 路徑管理工具
├── utils/websocket.js      # WebSocket 管理
├── utils/pwa.js           # PWA 功能
├── template.js            # 模板引擎
├── api.js                 # API 工具
└── auth.js                # 認證系統

Level 2 (功能層) - 依賴基礎層和工具層
├── dashboard.js           # 儀表板功能
├── profile.js             # 個人資料
├── friends.js             # 好友管理
├── chat.js                # 聊天功能
└── post.js                # 文章功能
```

## 🚀 **最佳實踐**

### ✅ **推薦做法**
- 新增功能前先檢查依賴關係文檔
- 使用 RouteUtils API 而非硬編碼路徑
- 遵循模組層級結構，避免循環依賴
- 通過全域變數或事件系統進行跨模組通信
- 修改架構後及時更新 YAML 文檔

### ❌ **避免做法**
- 功能層模組之間的直接導入
- 向上層級的依賴 (工具層依賴功能層)
- 硬編碼路徑和 URL
- 繞過統一路徑管理系統
- 修改架構後不更新文檔

## 🔄 **文檔維護**

這些架構文檔應該隨著系統演進而更新：

1. **新增模組時**: 更新 `javascript-dependencies.yaml`
2. **新增頁面時**: 更新 `html-dependencies.yaml`
3. **修改路徑時**: 更新 `path-config-architecture.yaml`
4. **架構變更時**: 更新 `stock-architecture.yaml`
5. **重大改進時**: 新增或更新 Markdown 文檔

---

**維護團隊**: Frontend Team  
**最後更新**: 2025-06-21  
**版本**: 1.0.0 
