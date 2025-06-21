# Stock Insight Platform - 架構文檔中心

## 📚 文檔概覽

本目錄包含 Stock Insight Platform 的所有架構文檔，現已重新組織為清晰的分類結構，提供系統設計、依賴關係和開發指引的完整參考。

## 📁 文檔結構

```
docs/
├── README.md                     # 文檔中心主索引
├── 📐 architecture/              # 系統架構文檔
│   ├── stock-architecture.yaml   # 完整系統架構
│   ├── javascript-dependencies.yaml  # JS 模組依賴關係
│   ├── html-dependencies.yaml    # HTML 文件依賴映射
│   ├── path-config-architecture.yaml  # 路徑管理架構
│   └── future-lib-architecture.yaml   # 未來架構規劃
├── 🚀 implementation/            # 功能實現文檔
│   ├── SOCKETIO_IMPLEMENTATION_COMPLETE.md  # Socket.IO 完整實現
│   ├── ARCHITECTURE_IMPROVEMENTS.md         # 架構改進記錄
│   ├── PATH_MANAGEMENT_SUMMARY.md          # 路徑管理系統
│   └── UNIFIED_CONFIG.md                   # 統一配置管理
├── 📊 reports/                   # 項目報告
│   ├── MIGRATION_REPORT.md       # 路徑遷移報告
│   ├── DOCKER_ARCHITECTURE_VALIDATION.md  # Docker 架構驗證
│   ├── DOCKER_LOCALHOST_FIXES_COMPLETE.md # Docker 修復報告
│   └── LOCALHOST_CLEANUP_REPORT.md        # 本地清理報告
└── 📖 guides/                    # 開發指南
    ├── DEVELOPMENT_SAFETY.md     # 開發安全實踐
    └── TESTING_STRATEGY.md       # 測試策略
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

#### [`SOCKETIO_IMPLEMENTATION_COMPLETE.md`](./implementation/SOCKETIO_IMPLEMENTATION_COMPLETE.md) ⭐ **最新實現**
- **完整 Socket.IO 實現**: 從 0% 到 100% 的完整歷程
- **技術解決方案**: Gunicorn Eventlet Worker 配置
- **測試系統**: 完整的測試套件和驗證
- **生產就緒**: 企業級穩定性和性能

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

---

## 🎯 快速導航

### 🔍 **我想了解...**

| 需求 | 推薦文檔 | 路徑 |
|------|----------|------|
| 系統整體架構 | 主架構文檔 | `architecture/stock-architecture.yaml` |
| Socket.IO 實現 | 實時功能實現 | `implementation/SOCKETIO_IMPLEMENTATION_COMPLETE.md` |
| JavaScript 模組關係 | 依賴關係圖 | `architecture/javascript-dependencies.yaml` |
| 路徑管理系統 | 路徑架構 | `architecture/path-config-architecture.yaml` |
| 開發規範 | 安全指南 | `guides/DEVELOPMENT_SAFETY.md` |
| 測試策略 | 測試指南 | `guides/TESTING_STRATEGY.md` |
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

- ✅ **2025年1月**: Socket.IO 實時功能完全實現
- ✅ **文檔重組**: 按類別重新組織，提升可維護性
- ✅ **架構同步**: 所有文檔已同步最新技術棧

**版本**: 2.0.0  
**最後更新**: 2025年1月  
**維護團隊**: Frontend Development Team
