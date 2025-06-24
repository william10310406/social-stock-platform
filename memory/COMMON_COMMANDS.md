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

## 🗄️ **Docker 資料庫指令 (已驗證)**

### 📊 **MSSQL 熱資料庫**
```bash
# 正確指令模板 (關鍵: mssql-tools18 + -C 參數)
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SQL查詢"

# 查詢股票總數
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as total_stocks FROM stocks"

# 查詢價格記錄總數
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as total_prices FROM stock_prices"
```

### 🐘 **PostgreSQL 冷資料庫**
```bash
# 正確指令模板 (關鍵: 用戶是 postgres)
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SQL查詢"

# 查詢分析記錄總數
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT COUNT(*) as total_analysis FROM stock_analysis"

# 查看表格列表
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "\dt"
```

### 🔧 **容器狀態檢查**
```bash
# 查看所有容器狀態
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 檢查環境變數
docker exec stock-insight-hot-db printenv | grep MSSQL_SA_PASSWORD
docker exec stock-insight-cold-db printenv | grep POSTGRES
```

⚠️ **常見錯誤避免**:
- 使用 `mssql-tools18` 不是 `mssql-tools`
- 必須加 `-C` 參數信任證書
- PostgreSQL 用戶是 `postgres` 不是 `stockinsight`
- 密碼用單引號包圍: `'StrongP@ssw0rd!'`

📖 **詳細指南**: `frontend/docs/guides/DOCKER_DATABASE_COMMANDS_GUIDE.md`

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

## 📊 **數據庫導入命令** (⭐ 新增)

### 🎯 **雙資料庫股票數據導入**
```bash
# 1. 環境準備檢查
docker exec -it stock-insight-backend python -c "from app import create_app; app = create_app(); print('✅ 連接成功')"

# 2. 運行股票數據導入
docker exec -it stock-insight-backend python scripts/import_stock_data_v2.py

# 3. 驗證導入結果
docker exec -it stock-insight-backend python scripts/check_stock_data.py
```

### 🔍 **數據驗證命令**
```bash
# 檢查熱資料庫數據
docker exec -it stock-insight-backend python -c "
from app import create_app
from app.models import Stock, StockPrice
app = create_app()
with app.app_context():
    from app import db
    print(f'股票數: {db.session.query(Stock).count()}')
    print(f'價格記錄: {db.session.query(StockPrice).count()}')
"

# 檢查冷資料庫狀態
docker exec -it stock-insight-backend python -c "
from app import create_app
from app.models_cold import MessageArchive, PostArchive
app = create_app()
with app.app_context():
    from app import db
    print('冷資料庫表格已創建並準備就緒')
"
```

### 🗄️ **雙資料庫管理**
```bash
# 啟動雙資料庫環境
docker-compose -f docker-compose.dual.yml up -d

# 停止雙資料庫環境
docker-compose -f docker-compose.dual.yml down

# 檢查雙資料庫狀態
docker ps | grep -E "(mssql|postgres|redis)"

# 查看雙資料庫日誌
docker-compose -f docker-compose.dual.yml logs
```

### 📋 **數據庫維護命令**
```bash
# 創建數據庫遷移
docker exec -it stock-insight-backend flask db migrate -m "描述"

# 應用數據庫遷移
docker exec -it stock-insight-backend flask db upgrade

# 檢查數據庫架構
docker exec -it stock-insight-backend python -c "
from sqlalchemy import inspect
from app import create_app
app = create_app()
with app.app_context():
    from app import db
    inspector = inspect(db.engine)
    print('Tables:', inspector.get_table_names())
"
```

### 🚨 **故障排除 - 數據導入**
```bash
# 檢查加密金鑰問題
docker exec -it stock-insight-backend python -c "import os; print('SECRET_KEY 設置正確' if os.getenv('SECRET_KEY') else '缺少 SECRET_KEY')"

# 檢查 DatabaseAdapter 問題
docker exec -it stock-insight-backend python -c "
from app.database_adapter import DatabaseAdapter
adapter = DatabaseAdapter.from_environment('hot')
print('DatabaseAdapter 正常工作')
"

# 檢查模型欄位
docker exec -it stock-insight-backend python -c "
from app.models import Stock, StockPrice
print('Stock 欄位:')
for col in Stock.__table__.columns:
    print(f'  {col.name}: {col.type}')
print('StockPrice 欄位:')
for col in StockPrice.__table__.columns:
    print(f'  {col.name}: {col.type}')
"
```

---

**💡 提示**: 所有命令都支援 `--help` 參數查看詳細說明
**🔍 查找**: 使用 `npm run | grep <關鍵字>` 搜尋特定命令  
**📊 數據導入**: 參考 `memory/DATABASE_IMPORT_GUIDE.md` 獲取詳細指南 
