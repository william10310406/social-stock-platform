# 前端開發規則

## 📋 概述

本文檔規定了 Stock Insight Platform 前端開發的強制性規則和最佳實踐。所有開發者必須嚴格遵循這些規則。

---

## 🛣️ 路徑管理規則

### 強制規則

#### 1. 統一路徑管理
- **MUST**: 所有路徑配置必須使用 `src/js/config/routes.js`
- **MUST**: 禁止在代碼中硬編碼任何路徑
- **MUST**: 使用 `RouteUtils` 工具函數獲取路徑

```javascript
// ✅ 正確做法
import { RouteUtils } from './utils/pathManager.js';
const loginPath = RouteUtils.getPagePath('auth.login');

// ❌ 禁止做法
const loginPath = '/src/pages/auth/login.html';
```

#### 2. 路徑格式規範
- **MUST**: 所有內部路徑使用相對路徑格式（以 `/` 開頭）
- **MUST**: API 路徑使用統一的 `ROUTES.api.endpoints` 配置
- **MUST**: 靜態資源路徑使用 `ROUTES.styles` 和 `ROUTES.components`

#### 3. 路徑更新流程
- **MUST**: 路徑變更必須先更新 `routes.js` 配置
- **MUST**: 路徑更新後必須運行 `npm run test:routes` 驗證
- **MUST**: 確保所有引用該路徑的文件同步更新

### 禁止事項
- **NEVER**: 不得使用絕對文件系統路徑
- **NEVER**: 不得在 HTML 中直接寫死 script src 路徑
- **NEVER**: 不得跳過路徑配置直接修改引用

---

## 🔧 腳本開發規則

### 環境兼容性

#### 1. 環境配置模組
- **MUST**: 所有腳本必須使用 `scripts/script-env.js` 環境配置
- **MUST**: 支持 Docker 和本地環境自動切換
- **MUST**: 使用環境變數而非硬編碼配置

```javascript
// ✅ 正確做法
const { ScriptEnvironment } = require('./script-env.js');
const env = new ScriptEnvironment();
const config = env.getEnvironmentInfo().config;

// ❌ 禁止做法
const BASE_URL = 'http://localhost:5173';
```

#### 2. 項目根目錄檢測
- **MUST**: 所有腳本必須支持從任意目錄運行
- **MUST**: 使用動態項目根目錄檢測
- **MUST**: 不假設腳本運行的當前目錄

#### 3. 錯誤處理
- **MUST**: 提供清晰的錯誤消息
- **MUST**: 包含足夠的調試信息
- **MUST**: 適當的退出代碼（0=成功，非0=失敗）

### 腳本分類規範

#### 1. 開發工具腳本
- 路徑檢查：`check-routes.js`
- 依賴分析：`dependency-check.js`
- 項目組織：`organize-project.js`
- 連結驗證：`validate-links.js`

#### 2. 環境管理腳本
- 環境配置：`script-env.js`
- Docker 檢查：`docker-check.sh`
- 快速檢查：`quick-check.sh`

### 腳本命名規範
- **格式**: `kebab-case.js` 或 `kebab-case.sh`
- **描述性**: 文件名清楚表達功能
- **一致性**: 同類腳本使用統一前綴

---

## 🐳 Docker 兼容性規則

### 環境檢測

#### 1. 多層檢測機制
- **檔案檢測**: `/.dockerenv` 存在性
- **環境變數**: `NODE_ENV=docker`, `DOCKER_ENV=true`
- **容器服務**: URL 包含容器名 (`frontend:`, `backend:`)
- **主機名**: Docker 容器主機名模式

#### 2. 配置自動切換
```javascript
// 環境配置示例
const config = {
  frontend: {
    host: isDocker ? 'frontend' : 'localhost',
    port: parseInt(process.env.FRONTEND_PORT || '5173'),
    protocol: 'http'
  },
  urls: {
    api: isDocker ? '/api' : 'http://localhost:5001/api'
  }
};
```

### 環境變數規範

#### 1. 標準環境變數
- `NODE_ENV`: 環境標識 (`development`, `docker`, `production`)
- `FRONTEND_URL`: 前端服務 URL
- `BACKEND_URL`: 後端服務 URL
- `REQUEST_TIMEOUT`: 請求超時時間

#### 2. Docker Compose 配置
```yaml
services:
  frontend:
    environment:
      - NODE_ENV=docker
      - FRONTEND_URL=http://frontend:5173
      - BACKEND_URL=http://backend:5001
```

### 容器化規則

#### 1. .dockerignore 規範
- **排除開發文件**: `node_modules/`, `.env.local`
- **排除構建產物**: `dist/`, `build/`, `coverage/`
- **排除文檔**: `docs/`, `*.md`
- **排除腳本**: `scripts/` (除必要的生產腳本)

#### 2. 構建最佳實踐
- **多階段構建**: 開發和生產環境分離
- **依賴優化**: 只安裝必要的生產依賴
- **層級緩存**: 合理安排 Dockerfile 層級順序

---

## 📦 依賴管理規則

### 模組依賴

#### 1. 3層架構規範
- **Level 0 (基礎層)**: `config/`, `utils/`
- **Level 1 (工具層)**: `template.js`, `api.js`, `auth.js`
- **Level 2 (功能層)**: `dashboard.js`, `chat.js`, `friends.js`

#### 2. 循環依賴防護
- **MUST**: 運行 `dependency-check.js` 檢查循環依賴
- **MUST**: 高層級模組不得導入低層級模組
- **MUST**: 同層級模組避免相互依賴

### npm 依賴管理

#### 1. 版本鎖定
- **MUST**: 使用 `package-lock.json` 鎖定依賴版本
- **MUST**: 定期更新安全漏洞依賴
- **MUST**: 區分 `dependencies` 和 `devDependencies`

#### 2. 依賴審計
- **定期執行**: `npm audit`
- **安全掃描**: `npm audit fix`
- **許可證檢查**: 確保依賴許可證兼容

---

## 🧪 測試規則

### 測試覆蓋

#### 1. 必須測試項目
- **路徑管理**: 所有路徑配置和工具函數
- **環境配置**: 不同環境下的配置切換
- **API 調用**: 所有 API 端點和錯誤處理
- **用戶交互**: 關鍵業務流程

#### 2. 測試分層
- **單元測試**: `tests/unit/` - 純函數和工具類
- **整合測試**: `tests/integration/` - API 和服務交互
- **E2E 測試**: `tests/e2e/` - 完整用戶流程
- **Socket.IO 測試**: `tests/socketio/` - 實時功能

### 測試執行規則

#### 1. 提交前檢查
```bash
# 必須執行並通過的檢查
npm run test              # 運行所有測試
npm run test:routes       # 路徑檢查
npm run lint              # 代碼風格檢查
npm run format            # 代碼格式化
```

#### 2. CI/CD 集成
- **每次提交**: 自動運行測試套件
- **PR 合併**: 必須通過所有檢查
- **部署前**: 完整測試 + 兼容性檢查

---

## 🎨 代碼品質規則

### 代碼風格

#### 1. ESLint 配置
- **強制執行**: 所有 JavaScript 代碼必須通過 ESLint
- **規則集**: 使用項目統一的 `.eslintrc.js`
- **自動修復**: `npm run lint:fix`

#### 2. Prettier 格式化
- **統一格式**: 所有代碼使用 Prettier 格式化
- **配置文件**: `.prettierrc`
- **IDE 集成**: 保存時自動格式化

### 文件組織

#### 1. 目錄結構
```
src/
├── js/
│   ├── config/           # 配置文件
│   ├── utils/            # 工具函數
│   ├── components/       # 組件
│   └── [features]/       # 功能模組
├── css/                  # 樣式文件
├── pages/               # 頁面文件
└── components/          # HTML 組件
```

#### 2. 文件命名
- **JavaScript**: `camelCase.js`
- **CSS**: `kebab-case.css`
- **HTML**: `kebab-case.html`
- **配置文件**: `kebab-case.config.js`

---

## 🚀 部署規則

### 構建流程

#### 1. 構建命令
```bash
npm run build            # 生產構建
npm run build:dev        # 開發構建
npm run preview          # 構建預覽
```

#### 2. 構建檢查
- **語法檢查**: 確保沒有語法錯誤
- **依賴分析**: 檢查未使用的依賴
- **大小檢查**: 監控構建產物大小
- **兼容性**: 瀏覽器兼容性測試

### 環境部署

#### 1. 環境區分
- **開發環境**: `NODE_ENV=development`
- **Docker 環境**: `NODE_ENV=docker`
- **生產環境**: `NODE_ENV=production`

#### 2. 配置管理
- **環境變數**: 敏感配置使用環境變數
- **配置文件**: 非敏感配置使用配置文件
- **默認值**: 提供合理的默認配置

---

## ⚠️ 違規處理

### 嚴重違規 (阻止合併)
1. 硬編碼路徑或配置
2. 跳過環境兼容性檢查
3. 測試覆蓋率低於要求
4. 循環依賴或架構違規

### 警告違規 (需要修復)
1. 代碼風格不符合規範
2. 缺少必要的錯誤處理
3. 文檔不完整
4. 性能問題

### 檢查工具
```bash
# 運行完整檢查
npm run quality:check

# Docker 兼容性檢查
./scripts/docker-compatibility-check.sh

# 路徑配置檢查
npm run test:routes
```

---

## 📚 參考資源

- [統一路徑管理文檔](./docs/implementation/PATH_MANAGEMENT_SUMMARY.md)
- [Docker 兼容性報告](./docs/reports/DOCKER_SCRIPT_COMPATIBILITY_REPORT.md)
- [架構設計文檔](./docs/architecture/README.md)
- [開發安全指南](./docs/guides/DEVELOPMENT_SAFETY.md)

---

**規則版本**: v1.0  
**最後更新**: 2024年12月  
**適用範圍**: Stock Insight Platform 前端開發

> 💡 **提醒**: 這些規則不是建議，而是強制性要求。違反規則的代碼將不被接受合併。 
