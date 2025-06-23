# Stock Insight Platform - 架構文檔中心

## 📚 文檔概覽

本目錄包含 Stock Insight Platform 的所有架構文檔，現已重新組織為清晰的分類結構，提供系統設計、依賴關係和開發指引的完整參考。

## 📁 文檔結構

```
docs/
├── README.md                     # 文檔中心主索引
├── 📐 architecture/              # 系統架構文檔
│   ├── stock-architecture.yaml   # 完整系統架構
│   ├── dual-database-hot-cold-architecture.yaml  # **NEW** 雙資料庫冷熱分離架構
│   ├── javascript-dependencies.yaml  # JS 模組依賴關係
│   ├── html-dependencies.yaml    # HTML 文件依賴映射
│   ├── path-config-architecture.yaml  # 路徑管理架構
│   └── future-lib-architecture.yaml   # 未來架構規劃
├── 🚀 implementation/            # 功能實現文檔
│   ├── SOCKETIO_IMPLEMENTATION_COMPLETE.md  # Socket.IO 完整實現
│   ├── STOCKS_FEATURE_IMPLEMENTATION.md    # 股票功能完整實現
│   ├── LIB_IMPLEMENTATION_COMPLETE.md      # 組件庫實現完成
│   ├── ARCHITECTURE_IMPROVEMENTS.md         # 架構改進記錄
│   ├── PATH_MANAGEMENT_SUMMARY.md          # 路徑管理系統
│   └── UNIFIED_CONFIG.md                   # 統一配置管理
├── 📊 reports/                   # 項目報告
│   ├── STOCK_DATA_IMPORT_CONFIRMATION_REPORT.md    # **最新** 雙資料庫股票數據導入確認報告
│   ├── COMPLETE_TAIWAN_STOCK_DATA_IMPORT_REPORT.md    # 116支台股完整導入報告
│   ├── STOCKS_DATA_EXPORT_REPORT.md       # 股票資料匯出報告
│   ├── STOCK_SCHEMA_VALIDATION_REPORT.md  # 股票架構驗證報告
│   ├── LIB_DOCKER_TEST_COMPLETE.md        # 組件庫 Docker 測試報告
│   ├── MIGRATION_REPORT.md       # 路徑遷移報告
│   ├── DOCKER_ARCHITECTURE_VALIDATION.md  # Docker 架構驗證
│   ├── DOCKER_LOCALHOST_FIXES_COMPLETE.md # Docker 修復報告
│   └── LOCALHOST_CLEANUP_REPORT.md        # 本地清理報告
├── 📖 guides/                    # 開發指南
│   ├── DEVELOPMENT_SAFETY.md     # 開發安全實踐
│   ├── TESTING_STRATEGY.md       # 測試策略
│   └── LIB_TESTING_GUIDE.md      # 組件庫測試指南
└── 🛡️ best-practices/           # 最佳實踐
    └── DEFENSIVE_PROGRAMMING_SOLUTION.md  # 防禦性編程解決方案
```

---

## 🏗️ 架構文檔 (`architecture/`)

### 核心架構規格

#### [`stock-architecture.yaml`](./architecture/stock-architecture.yaml) ⭐ **主要架構**
- **技術棧**: Flask + Gunicorn + Flask-SocketIO + Vite + TailwindCSS
- **實時功能**: Socket.IO 5.3.6 + Socket.IO Client 4.0.1 完整集成
- **部署配置**: Docker Compose + Eventlet Worker
- **數據庫**: PostgreSQL + Redis + SQLAlchemy

#### [`javascript-dependencies.yaml`](./architecture/javascript-dependencies.yaml) 🔗 **模組依賴**
- **依賴層級**: 3 層架構 (基礎 → 工具 → 功能)
- **Socket.IO 集成**: 完整的實時通信模組
- **循環依賴防護**: 嚴格的依賴層級規則

#### [`html-dependencies.yaml`](./architecture/html-dependencies.yaml) 📄 **頁面依賴**
- **腳本載入順序**: 8 個 HTML 頁面的載入規則
- **依賴映射**: 每個頁面的腳本清單

#### [`path-config-architecture.yaml`](./architecture/path-config-architecture.yaml) 🛣️ **路徑管理**
- **統一路徑管理**: RouteUtils API 完整規範
- **配置中心**: routes.js 作為單一真實來源

#### [`future-lib-architecture.yaml`](./architecture/future-lib-architecture.yaml) 🔮 **未來規劃**
- **組件化架構**: 未來的 lib/ 目錄結構規劃

---

## 🚀 實現文檔 (`implementation/`)

### 主要功能實現

#### [`SOCKETIO_IMPLEMENTATION_COMPLETE.md`](./implementation/SOCKETIO_IMPLEMENTATION_COMPLETE.md) ⭐ **Socket.IO 實現**
- **完整 Socket.IO 實現**: 從 0% 到 100% 的完整歷程
- **技術解決方案**: Gunicorn Eventlet Worker 配置
- **測試系統**: 完整的測試套件和驗證
- **生產就緒**: 企業級穩定性和性能

#### [`STOCKS_FEATURE_IMPLEMENTATION.md`](./implementation/STOCKS_FEATURE_IMPLEMENTATION.md) ⭐ **股票功能實現**
- **完整股票系統**: 從資料庫修復到前端開發的完整實現
- **126 支真實台股**: 包含完整價格歷史資料 (2030+ 筆)
- **API 系統設計**: RESTful API + 搜尋/分頁/關注功能
- **多格式資料匯出**: 5 種格式滿足不同使用需求

#### [`LIB_IMPLEMENTATION_COMPLETE.md`](./implementation/LIB_IMPLEMENTATION_COMPLETE.md) 📚 **組件庫實現**
- **組件化架構**: 新增 Level 0 組件庫層級
- **4 個核心組件**: Toast、Modal、Loading、Formatter
- **85% 代碼重用率**: 消除分散的重複實現
- **向後兼容性**: 現有代碼無需修改

#### [`ARCHITECTURE_IMPROVEMENTS.md`](./implementation/ARCHITECTURE_IMPROVEMENTS.md) 🏢 **企業級改進**
- **代碼品質工具鏈**: ESLint + Prettier + EditorConfig
- **統一日誌管理**: 替代散亂 console 輸出
- **自動化工作流程**: npm 腳本和項目結構檢查

#### [`PATH_MANAGEMENT_SUMMARY.md`](./implementation/PATH_MANAGEMENT_SUMMARY.md) 🛣️ **路徑管理**
- **統一路徑管理系統**: 解決硬編碼路徑問題
- **RouteUtils API**: 語義化路徑管理工具

#### [`UNIFIED_CONFIG.md`](./implementation/UNIFIED_CONFIG.md) ⚙️ **統一配置**
- **配置集中化**: config/index.js 統一管理
- **工具配置生成器**: 自動化配置管理

---

## 📊 項目報告 (`reports/`)

### 遷移和修復記錄

#### [`STOCKS_DATA_EXPORT_REPORT.md`](./reports/STOCKS_DATA_EXPORT_REPORT.md) 📊 **股票資料匯出**
- **多格式匯出**: PostgreSQL, CSV, JSON, SQLite, ZIP 共 5 種格式
- **資料統計**: 126 支股票, 2030+ 筆價格記錄, 221KB 壓縮檔
- **使用指南**: 各格式的詳細使用說明和查詢範例
- **品質保證**: 完整性、一致性、可用性三重驗證

#### [`STOCK_SCHEMA_VALIDATION_REPORT.md`](./reports/STOCK_SCHEMA_VALIDATION_REPORT.md) 🔍 **架構驗證**
- **一致性檢查**: YAML 文檔與實際資料庫模型對比
- **問題修復**: 缺失的 market_type 欄位和 stock_prices 表
- **API 端點同步**: 更新架構文檔中的 API 定義
- **維護規範**: 架構文檔維護最佳實踐

#### [`LIB_DOCKER_TEST_COMPLETE.md`](./reports/LIB_DOCKER_TEST_COMPLETE.md) 📚 **組件庫 Docker 測試**
- **完整測試覆蓋**: 4個核心組件 + 完整測試工具鏈
- **Docker 兼容性**: 100% 在容器環境中正常運行
- **技術問題解決**: 腳本權限、組件整合、路徑管理
- **生產就緒性**: 企業級穩定性和測試覆蓋

#### [`MIGRATION_REPORT.md`](./reports/MIGRATION_REPORT.md) 📋 **路徑遷移**
- **遷移執行記錄**: 11 個文件的完整遷移
- **測試結果**: 33 個測試 100% 通過
- **效果評估**: 維護性、開發效率提升報告

#### [`DOCKER_ARCHITECTURE_VALIDATION.md`](./reports/DOCKER_ARCHITECTURE_VALIDATION.md) 🐳 **Docker 驗證**
- **Docker 環境配置**: 容器化架構驗證
- **代理設置**: API 代理和模組載入測試

#### [`DOCKER_LOCALHOST_FIXES_COMPLETE.md`](./reports/DOCKER_LOCALHOST_FIXES_COMPLETE.md) 🔧 **Docker 修復**
- **localhost 問題解決**: Docker 環境修復記錄
- **代碼變更統計**: 58 個文件變更記錄

#### [`LOCALHOST_CLEANUP_REPORT.md`](./reports/LOCALHOST_CLEANUP_REPORT.md) 🧹 **清理報告**
- **硬編碼清理**: localhost 引用清理記錄

---

## 📖 開發指南 (`guides/`)

### 開發最佳實踐

#### [`DEVELOPMENT_SAFETY.md`](./guides/DEVELOPMENT_SAFETY.md) 🛡️ **開發安全**
- **安全實踐**: 代碼提交前檢查清單
- **品質保證**: 開發流程規範

#### [`TESTING_STRATEGY.md`](./guides/TESTING_STRATEGY.md) 🧪 **測試策略**
- **測試覆蓋**: 單元、整合、E2E 測試策略
- **測試工具**: Jest + Playwright 測試配置

#### [`LIB_TESTING_GUIDE.md`](./guides/LIB_TESTING_GUIDE.md) 📚 **組件庫測試指南**
- **四種測試方法**: 命令行、瀏覽器、控制台、手動驗證
- **完整測試工具鏈**: 從開發到生產的測試覆蓋
- **故障排除指南**: 常見問題解決方案

---

## 🛡️ 最佳實踐 (`best-practices/`)

### 編程規範與解決方案

#### [`DEFENSIVE_PROGRAMMING_SOLUTION.md`](./best-practices/DEFENSIVE_PROGRAMMING_SOLUTION.md) 🛡️ **防禦性編程**
- **路徑管理最佳實踐**: 如何正確處理硬編碼路徑問題
- **智能檢查腳本**: 既滿足代碼規範又保持系統健壯性
- **防禦性編程模式**: fallback 機制和錯誤處理最佳實踐
- **資安和維護考量**: 避免單點失效風險的完整解決方案

---

## 🎯 快速導航

### 🔍 **我想了解...**

| 需求 | 推薦文檔 | 路徑 |
|------|----------|------|
| **🎯 雙資料庫股票數據導入** | **股票數據導入確認報告** | `reports/STOCK_DATA_IMPORT_CONFIRMATION_REPORT.md` |
| 台股數據導入完成 | 台股導入報告 | `reports/COMPLETE_TAIWAN_STOCK_DATA_IMPORT_REPORT.md` |
| 系統整體架構 | 主架構文檔 | `architecture/stock-architecture.yaml` |
| 股票功能實現 | 股票系統文檔 | `implementation/STOCKS_FEATURE_IMPLEMENTATION.md` |
| 組件庫使用 | 組件庫實現 | `implementation/LIB_IMPLEMENTATION_COMPLETE.md` |
| 組件庫測試 | 測試指南 | `guides/LIB_TESTING_GUIDE.md` |
| 組件庫 Docker 測試 | Docker 測試報告 | `reports/LIB_DOCKER_TEST_COMPLETE.md` |
| 資料匯出使用 | 資料匯出報告 | `reports/STOCKS_DATA_EXPORT_REPORT.md` |
| 架構一致性檢查 | 架構驗證報告 | `reports/STOCK_SCHEMA_VALIDATION_REPORT.md` |
| Socket.IO 實現 | 實時功能實現 | `implementation/SOCKETIO_IMPLEMENTATION_COMPLETE.md` |
| JavaScript 模組關係 | 依賴關係圖 | `architecture/javascript-dependencies.yaml` |
| 路徑管理系統 | 路徑架構 | `architecture/path-config-architecture.yaml` |
| 開發規範 | 安全指南 | `guides/DEVELOPMENT_SAFETY.md` |
| 測試策略 | 測試指南 | `guides/TESTING_STRATEGY.md` |
| 防禦性編程 | 最佳實踐 | `best-practices/DEFENSIVE_PROGRAMMING_SOLUTION.md` |
| 項目歷程 | 遷移報告 | `reports/MIGRATION_REPORT.md` |

### 🛠️ **我想開發...**

| 開發任務 | 必讀文檔 | 步驟 |
|----------|----------|------|
| 新增 JS 模組 | 1. `architecture/javascript-dependencies.yaml`<br>2. `guides/DEVELOPMENT_SAFETY.md` | 1. 確定層級<br>2. 檢查依賴<br>3. 避免循環 |
| 新增頁面 | 1. `architecture/html-dependencies.yaml`<br>2. `architecture/path-config-architecture.yaml` | 1. 配置路徑<br>2. 設定依賴<br>3. 更新架構 |
| 實時功能 | 1. `implementation/SOCKETIO_IMPLEMENTATION_COMPLETE.md`<br>2. `architecture/stock-architecture.yaml` | 1. 了解架構<br>2. 參考實現<br>3. 集成測試 |

---

## 🔄 文檔維護

### 更新規則
1. **新增功能**: 更新對應的 `architecture/` 文檔
2. **重大改進**: 在 `implementation/` 添加實現文檔  
3. **問題修復**: 在 `reports/` 記錄修復過程
4. **流程規範**: 更新 `guides/` 開發指南

### 維護責任
- **架構文檔**: 技術負責人維護
- **實現文檔**: 功能開發者編寫  
- **報告文檔**: 項目經理整理
- **指南文檔**: 團隊共同維護

---

## 🎉 最新更新

- ✅ **2025年6月**: 股票功能完整實現 - 126支真實台股 + 2030+筆價格資料
- ✅ **2025年6月**: 多格式資料匯出系統 - 5種格式滿足不同需求
- ✅ **2025年1月**: Socket.IO 實時功能完全實現
- ✅ **文檔重組**: 按類別重新組織，提升可維護性
- ✅ **架構同步**: 所有文檔已同步最新技術棧

**版本**: 2.1.0  
**最後更新**: 2025年6月21日  
**維護團隊**: Frontend Development Team
