# 🔧 常見問題解決指南

## 🚨 **緊急問題快速解決**

### ⚡ **服務無法啟動**
```bash
# 1. 檢查端口占用
lsof -i :5173
lsof -i :5174

# 2. 殺死占用進程
kill -9 <PID>

# 3. 清理並重啟
npm run clean
npm install
npm run dev
```

### 🐳 **Docker 問題**
```bash
# 1. 重置 Docker 環境
npm run docker:down
docker system prune -f
npm run docker:up

# 2. 檢查 Docker 狀態
docker ps
docker logs <container_name>

# 3. 重建映像
npm run docker:build --no-cache
```

---

## 🧪 **測試相關問題**

### ❌ **測試失敗排查**
```bash
# 1. 檢查具體失敗原因
npm run test -- --verbose

# 2. 單獨運行失敗的測試
npm run test -- --testNamePattern="特定測試名稱"

# 3. 清理測試緩存
npm run test -- --clearCache
```

### 🔍 **常見測試問題**
| 問題 | 原因 | 解決方案 |
|------|------|----------|
| WebSocket 連接失敗 | Docker 環境限制 | 非功能性問題，可忽略 |
| 模組導入錯誤 | 路徑問題 | 檢查 `javascript-dependencies.yaml` |
| 組件庫測試失敗 | 組件未正確載入 | 運行 `npm run lib:check` |
| E2E 測試超時 | 頁面載入慢 | 增加超時時間或檢查網路 |

---

## 📦 **依賴和安裝問題**

### 🔄 **依賴問題解決**
```bash
# 1. 完全清理重裝
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 2. 檢查依賴衝突
npm ls --depth=0
npm audit

# 3. 修復依賴問題
npm audit fix
npm install --legacy-peer-deps
```

### 📋 **版本兼容性**
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **Docker**: >= 20.0.0
- **Docker Compose**: >= 2.0.0

---

## 🏗️ **架構相關問題**

### 🔗 **模組導入錯誤**
```javascript
// ❌ 錯誤 - 循環依賴
// file1.js imports file2.js
// file2.js imports file1.js

// ✅ 解決 - 檢查依賴層級
// 參考 docs/architecture/javascript-dependencies.yaml
```

### 🛣️ **路徑問題**
```javascript
// ❌ 錯誤 - 硬編碼路徑
const url = 'http://localhost:5000/api/stocks';

// ✅ 解決 - 使用 RouteUtils
import { RouteUtils } from './js/utils/routes.js';
const url = RouteUtils.getApiUrl('stocks');
```

### 📚 **組件庫問題**
```bash
# 檢查組件庫狀態
npm run lib:check

# 測試組件庫功能
npm run lib:test

# 瀏覽器測試
npm run lib:browser
```

---

## 🐛 **代碼品質問題**

### 🔍 **ESLint 錯誤**
```bash
# 查看所有 ESLint 錯誤
npm run lint

# 自動修復可修復的錯誤
npm run lint:fix

# 檢查特定文件
npx eslint src/js/specific-file.js
```

### 🎨 **Prettier 格式化**
```bash
# 格式化所有文件
npm run format

# 檢查格式化狀態
npm run format:check

# 格式化特定文件
npx prettier --write src/js/specific-file.js
```

---

## 🔄 **Git 相關問題**

### 📝 **提交被拒絕**
```bash
# 1. 檢查 pre-commit hooks
npm run quality

# 2. 修復代碼品質問題
npm run lint:fix
npm run format

# 3. 重新運行測試
npm run test

# 4. 重新提交
git add .
git commit -m "fix: 修復代碼品質問題"
```

### 🔀 **合併衝突**
```bash
# 1. 查看衝突文件
git status

# 2. 手動解決衝突
# 編輯衝突文件，移除 <<<<<<< 和 >>>>>>> 標記

# 3. 標記為已解決
git add <resolved-file>

# 4. 完成合併
git commit
```

---

## 🌐 **環境相關問題**

### 🔧 **環境變數問題**
```bash
# 1. 檢查環境變數
printenv | grep NODE_ENV
printenv | grep VITE_

# 2. 設置開發環境
export NODE_ENV=development
export VITE_API_URL=http://localhost:5000

# 3. 重啟服務
npm run dev
```

### 🐳 **Docker 環境變數**
```yaml
# docker-compose.yml 檢查
environment:
  - NODE_ENV=development
  - VITE_API_URL=http://localhost:5000
```

---

## 📊 **性能問題**

### 🐌 **開發服務器慢**
```bash
# 1. 清理緩存
npm run clean

# 2. 檢查文件數量
find src -name "*.js" | wc -l

# 3. 優化 Vite 配置
# 檢查 vite.config.js
```

### 💾 **記憶體使用過高**
```bash
# 1. 檢查 Node.js 記憶體使用
node --max-old-space-size=4096 npm run dev

# 2. 監控資源使用
htop
docker stats
```

---

## 🔍 **調試技巧**

### 🛠️ **調試 JavaScript**
```javascript
// 1. 使用 console.log
console.log('Debug info:', variable);

// 2. 使用 debugger
debugger; // 瀏覽器會在此處暫停

// 3. 使用 console.trace
console.trace('Call stack');
```

### 🌐 **瀏覽器調試**
```bash
# 1. 開啟開發者工具
# F12 或 Cmd+Option+I

# 2. 檢查網路請求
# Network 標籤

# 3. 檢查 Console 錯誤
# Console 標籤
```

### 📱 **移動設備調試**
```bash
# 1. 啟動移動設備模擬
# 開發者工具 > Device Toolbar

# 2. 遠程調試 (Android)
# chrome://inspect

# 3. iOS 調試
# Safari > 開發 > 模擬器
```

---

## 📞 **獲取幫助**

### 📚 **文檔參考**
- **架構問題**: `docs/architecture/`
- **實現細節**: `docs/implementation/`
- **測試問題**: `docs/guides/TESTING_STRATEGY.md`
- **最佳實踐**: `docs/best-practices/`

### 🤖 **AI 工具求助**
```bash
# 1. 提供項目狀態
cat memory/PROJECT_STATUS.md

# 2. 描述具體問題
cat memory/DEVELOPMENT_RULES.md

# 3. 提供錯誤日誌
npm run test 2>&1 | tee error.log
```

### 🔧 **系統診斷**
```bash
# 完整健康檢查
npm run health
npm run test
npm run quality
npm run docker:check
```

---

## 🚨 **緊急聯絡**

### 📋 **問題報告模板**
```
**問題描述**: 
**復現步驟**: 
1. 
2. 
3. 

**預期結果**: 
**實際結果**: 
**環境信息**: 
- OS: 
- Node.js: 
- npm: 
- Docker: 

**錯誤日誌**: 
```

### 🆘 **緊急修復流程**
1. **停止所有服務** - `npm run docker:down`
2. **備份當前狀態** - `git stash`
3. **回滾到穩定版本** - `git checkout main`
4. **重新啟動** - `npm install && npm run dev`
5. **報告問題** - 使用上述模板

---

> 💡 **記住**: 大部分問題都可以通過清理緩存、重新安裝依賴或重啟服務解決！
> 🔍 **提示**: 遇到問題時，先檢查 `memory/PROJECT_STATUS.md` 確認項目當前狀態 
