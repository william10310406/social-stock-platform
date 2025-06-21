# Stock Insight Platform - Frontend

## 🚀 項目概述

Stock Insight Platform 前端是一個現代化的 Web 應用，採用統一路徑管理系統，提供股票數據展示、社交互動和即時聊天功能。

## 📋 核心特性

- ✅ **統一路徑管理系統** - 消除硬編碼，一處修改處處生效
- ✅ **完整測試覆蓋** - 33個測試100%通過
- ✅ **自動化工具** - 遷移、檢查和驗證工具
- ✅ **開發安全防護** - 循環依賴檢測和架構完整性
- ✅ **響應式設計** - 支持移動端和桌面端
- ✅ **PWA 支持** - 離線功能和推送通知

## 🛠️ 技術棧

- **框架**: Vanilla JavaScript (ES6+)
- **構建工具**: Vite
- **樣式**: TailwindCSS
- **測試**: Jest + Playwright
- **工具**: 統一路徑管理系統

## 📁 項目結構

```
frontend/
├── src/
│   ├── js/
│   │   ├── config/
│   │   │   ├── routes.js           # 🌟 統一路徑配置
│   │   │   └── constants.js        # 應用常數
│   │   ├── utils/
│   │   │   ├── errorManager.js     # 錯誤管理
│   │   │   ├── loadingManager.js   # 載入狀態
│   │   │   └── websocket.js        # WebSocket 管理
│   │   ├── api.js                  # API 工具
│   │   ├── auth.js                 # 認證管理
│   │   └── dashboard.js            # 儀表板功能
│   ├── css/
│   │   └── style.css               # 主樣式
│   ├── pages/                      # HTML 頁面
│   └── components/                 # 可重用組件
├── scripts/
│   ├── migrate-paths.js            # 自動遷移工具
│   ├── dependency-check.js         # 依賴檢查
│   └── check-routes.js             # 路徑驗證
├── tests/                          # 測試文件
└── docs/                           # 文檔
```

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 啟動開發服務器
```bash
npm run dev
```

### 3. 運行測試
```bash
npm test                # 所有測試
npm run test:routes     # 路徑檢查
npm run test:deps       # 依賴檢查
```

### 4. 構建生產版本
```bash
npm run build
```

## 📖 統一路徑管理系統

### 核心概念
- **單一真實來源**: 所有路徑在 `routes.js` 中集中管理
- **RouteUtils**: 強大的路徑工具函數庫
- **自動遷移**: 工具自動替換硬編碼路徑

### 使用方法

```javascript
// ✅ 推薦：使用統一路徑管理
import { ROUTES, RouteUtils } from './config/routes.js';

// 頁面導航
RouteUtils.redirectToLogin();
RouteUtils.navigate('dashboard', 'profile');

// API 請求
const apiUrl = RouteUtils.getApiUrl('posts', 'list');
const detailUrl = RouteUtils.getApiUrl('posts', 'detail', { id: '123' });

// 頁面路徑
const loginPath = RouteUtils.getPagePath('auth', 'login');
```

### 路徑配置示例

```javascript
// routes.js
export const ROUTES = {
  pages: {
    auth: {
      login: '/src/pages/auth/login.html',
      register: '/src/pages/auth/register.html'
    },
    dashboard: {
      index: '/src/pages/dashboard/index.html',
      profile: '/src/pages/dashboard/profile.html'
    }
  },
  api: {
    base: 'http://localhost:5001',
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register'
      }
    }
  }
};
```

## 🧪 測試系統

### 測試覆蓋
- **單元測試**: 路徑管理、錯誤處理、工具函數
- **集成測試**: API 集成、組件交互
- **E2E 測試**: 用戶流程、認證流程

### 測試命令
```bash
npm run test:basic      # 基礎測試
npm run test:routes     # 路徑系統檢查 (26項檢查)
npm run test:deps       # 依賴關係檢查
npm run test:e2e        # 端到端測試
npm run test:ci         # CI/CD 測試套件
```

### 測試結果
- ✅ **33個測試** 100% 通過
- ✅ **26個路徑檢查** 100% 成功
- ✅ **0個依賴錯誤** 完全安全

## 🔧 開發工具

### 自動化腳本
- `migrate-paths.js` - 自動替換硬編碼路徑
- `dependency-check.js` - 檢測循環依賴
- `check-routes.js` - 驗證路徑完整性
- `validate-links.js` - 檢查鏈接有效性

### 開發安全
- **循環依賴防護** - 自動檢測並防止循環導入
- **路徑驗證** - 確保所有路徑有效
- **架構完整性** - 維護系統架構一致性

## 📊 系統優勢

### 1. 維護效率
- **一處修改，處處生效** - 路徑變更只需修改配置文件
- **零維護開銷** - 自動化工具處理路徑更新
- **IDE 友好** - 語義化 API 提供智能提示

### 2. 開發安全
- **完整測試覆蓋** - 確保功能穩定性
- **依賴檢查** - 防止循環依賴問題
- **自動驗證** - 持續檢查系統完整性

### 3. 擴展性
- **模組化設計** - 易於添加新功能
- **參數化支持** - 動態路徑構建
- **環境配置** - 支持多環境部署

## 🚨 開發規範

### 路徑使用規範
```javascript
// ✅ 正確
RouteUtils.getPagePath('auth', 'login');
RouteUtils.getApiUrl('posts', 'detail', { id: postId });

// ❌ 禁止
window.location.href = '/src/pages/auth/login.html';
fetch('http://localhost:5001/api/posts/' + postId);
```

### 新功能開發
1. 在 `routes.js` 中添加新路徑配置
2. 使用 RouteUtils 進行路徑操作
3. 添加相應的測試用例
4. 運行 `npm run test:deps` 檢查依賴

### 代碼提交前檢查
```bash
npm run test:routes     # 路徑系統檢查
npm run test:deps       # 依賴關係檢查
npm test               # 完整測試套件
```

## 🔗 相關文檔

- [路徑配置架構](./path-config-architecture.yaml) - 完整的系統架構說明
- [開發安全指南](./docs/DEVELOPMENT_SAFETY.md) - 開發最佳實踐
- [測試策略文檔](./docs/TESTING_STRATEGY.md) - 測試方法和策略

## 🎯 項目狀態

- ✅ **路徑管理系統** - 完全實施
- ✅ **核心功能** - 認證、社交、聊天
- ✅ **測試系統** - 完整覆蓋
- ✅ **文檔系統** - 完整架構說明
- 🔄 **進行中** - 股票數據集成、新聞功能
- 📋 **計劃中** - 即時通知、高級圖表

## 🤝 貢獻指南

1. 遵循統一路徑管理系統
2. 添加適當的測試用例
3. 更新相關文檔
4. 運行所有檢查工具
5. 確保測試 100% 通過

---

**Stock Insight Platform** - 專業級統一路徑管理系統 🚀 
