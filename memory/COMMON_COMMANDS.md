# 💻 常用命令速查表

## 🚀 **開發環境**

### 📦 **基本開發**
```bash
# 安裝依賴
npm install

# 啟動開發服務器 (http://localhost:5173)
npm run dev

# 構建生產版本
npm run build

# 預覽生產版本
npm run preview
```

### 🐳 **Docker 開發**
```bash
# 構建 Docker 映像
npm run docker:build

# 啟動 Docker 環境
npm run docker:up

# 停止 Docker 環境
npm run docker:down

# 查看 Docker 日誌
npm run docker:logs

# Docker 環境測試
npm run docker:test
```

---

## 🧪 **測試命令**

### 📋 **完整測試流程**
```bash
# 運行所有測試
npm run test

# 單元測試
npm run test:unit

# E2E 測試
npm run test:e2e

# 組件庫測試
npm run lib:test

# 組件庫控制台測試
npm run lib:console

# 組件庫檢查
npm run lib:check
```

### 🔍 **測試相關**
```bash
# 測試覆蓋率報告
npm run test:coverage

# 監聽模式測試
npm run test:watch

# 調試模式測試
npm run test:debug
```

---

## 🔧 **代碼品質**

### ✨ **格式化和檢查**
```bash
# ESLint 檢查
npm run lint

# ESLint 自動修復
npm run lint:fix

# Prettier 格式化
npm run format

# 完整品質檢查
npm run quality

# 項目結構整理
npm run organize
```

### 📊 **分析工具**
```bash
# 構建分析
npm run analyze

# 依賴檢查
npm run deps:check

# 依賴更新
npm run deps:update
```

---

## 📚 **組件庫相關**

### 🧩 **組件庫操作**
```bash
# 組件庫完整測試
npm run lib:test

# 瀏覽器測試頁面
npm run lib:browser

# 控制台測試
npm run lib:console

# 文件結構檢查
npm run lib:check

# Docker 環境組件庫測試
npm run lib:docker
```

### 📖 **組件使用範例**
```javascript
// Toast 通知
import { Toast } from './src/lib/index.js';
Toast.show('成功訊息', 'success');
Toast.show('錯誤訊息', 'error');

// Modal 彈窗
import { Modal } from './src/lib/index.js';
Modal.show('標題', '內容');

// Loading 載入
import { Loading } from './src/lib/index.js';
Loading.show();
Loading.hide();

// Formatter 格式化
import { Formatter } from './src/lib/index.js';
const price = Formatter.currency(123.45); // "$123.45"
```

---

## 🛠️ **開發工具**

### 🔍 **檢查和診斷**
```bash
# 項目健康檢查
npm run health

# 環境檢查
npm run env:check

# 路徑檢查
npm run paths:check

# Docker 兼容性檢查
npm run docker:check
```

### 📄 **文檔相關**
```bash
# 生成文檔
npm run docs:generate

# 文檔服務器
npm run docs:serve

# 架構驗證
npm run docs:validate
```

---

## 🔄 **Git 和部署**

### 🔍 **上傳檢查腳本 (必須步驟!)**

⚠️ **重要**: 項目有完整的上傳檢查腳本，必須先通過檢查才能提交！

```bash
# 運行完整檢查 (8大類檢查)
./scripts/enforce-rules.sh

# 嚴格模式 (警告也會導致失敗)
./scripts/enforce-rules.sh --strict

# 自動修復模式
./scripts/enforce-rules.sh --fix

# 查看幫助
./scripts/enforce-rules.sh --help
```

### 🔒 **強制防呆機制 - Git Hooks**

🚨 **團隊必須安裝**: 所有成員都必須安裝 Git hooks 防呆系統！

```bash
# 安裝強制 Git hooks (團隊必須執行)
./scripts/install-git-hooks.sh

# 檢查 hooks 是否正確安裝
./scripts/check-hooks-installation.sh
```

#### 🛡️ **防呆機制特性**
- **🚫 無法跳過**: 不允許使用 `--no-verify` 跳過檢查
- **🔒 強制執行**: 推送前必須通過所有檢查
- **📋 完整檢查**: 自動運行 8大類規則檢查
- **🧪 測試保護**: 強制運行項目測試
- **🔐 安全檢查**: 防止敏感文件推送
- **📝 品質保證**: 檢查提交訊息品質

#### 📋 **檢查項目詳情**
1. **🔍 硬編碼敏感信息檢查** - 防止密碼、密鑰洩露
2. **🛣️ 硬編碼路徑檢查** - 確保使用統一路徑管理 (RouteUtils)
3. **🐳 Docker 兼容性檢查** - 驗證環境配置模組存在
4. **🧪 測試覆蓋率檢查** - 要求 80% 以上覆蓋率
5. **🎨 代碼風格檢查** - ESLint + Prettier + Black + Flake8
6. **🔒 安全漏洞檢查** - SQL注入、XSS、eval 等風險檢測
7. **📦 依賴關係檢查** - 循環依賴檢測
8. **📚 文檔同步檢查** - 確保規則文檔齊全

### 📝 **完整提交流程**
```bash
# 1. 運行上傳檢查 (必須步驟!)
./scripts/enforce-rules.sh

# 2. 如果檢查失敗，嘗試自動修復
./scripts/enforce-rules.sh --fix

# 3. 查看狀態
git status

# 4. 添加所有變更
git add .

# 5. 提交 (語義化訊息，會觸發 pre-commit hooks)
git commit -m "feat: 新增功能"
git commit -m "fix: 修復問題"
git commit -m "docs: 更新文檔"

# 6. 推送到遠端 (會觸發 pre-push hooks)
git push origin main
```

### 🚀 **部署流程**
```bash
# 1. 上傳檢查
./scripts/enforce-rules.sh

# 2. 測試
npm run test

# 3. 品質檢查
npm run quality

# 4. 構建
npm run build

# 5. 部署 (如果有配置)
npm run deploy
```

---

## 🔧 **故障排除**

### 🐛 **常見問題解決**
```bash
# 清理依賴
rm -rf node_modules package-lock.json
npm install

# 清理緩存
npm run clean

# 重置開發環境
npm run reset

# 修復權限問題 (macOS/Linux)
chmod +x scripts/*.sh
```

### 📊 **日誌和調試**
```bash
# 詳細日誌
npm run dev --verbose

# 調試模式
DEBUG=* npm run dev

# 查看構建詳情
npm run build --verbose
```

---

## 📱 **快速操作**

### ⚡ **一鍵操作**
```bash
# 快速開始開發
npm run quick:start

# 快速測試
npm run quick:test

# 快速部署準備
npm run quick:deploy

# 快速重置
npm run quick:reset
```

### 🎯 **情境化命令**

#### 🔥 **新功能開發**
```bash
npm run dev          # 啟動開發
npm run lib:test     # 測試組件
npm run test         # 運行測試
npm run quality      # 品質檢查
```

#### 🐛 **問題修復**
```bash
npm run test         # 確認問題
npm run lint:fix     # 自動修復
npm run test         # 驗證修復
npm run docker:test  # Docker 測試
```

#### 🚀 **發布準備**
```bash
npm run quality      # 品質檢查
npm run test         # 完整測試
npm run build        # 構建生產版本
npm run docker:test  # Docker 驗證
```

---

## 🎯 **AI 工具特別命令**

### 🤖 **AI 開發助手**
```bash
# 檢查項目狀態
cat memory/PROJECT_STATUS.md

# 了解開發規範
cat memory/DEVELOPMENT_RULES.md

# 查看架構
cat docs/architecture/stock-architecture.yaml

# 檢查可用命令
npm run
```

### 💡 **快速診斷**
```bash
# 項目健康狀態
npm run health && npm run test

# 架構一致性檢查
npm run docs:validate

# 完整環境檢查
npm run env:check && npm run docker:check
```

---

**💡 提示**: 所有命令都支援 `--help` 參數查看詳細說明
**🔍 查找**: 使用 `npm run | grep <關鍵字>` 搜尋特定命令 
