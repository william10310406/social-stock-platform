# Stock Insight Platform 開發規則

## 📋 概述

本文檔是 Stock Insight Platform 項目的總體開發規則指南。所有開發者必須遵循這些規則以確保代碼品質、系統穩定性和團隊協作效率。

---

## 🏗️ 項目架構規則

### 統一架構原則

#### 1. 前後端分離
- **前端**: Vite + Vanilla JavaScript + TailwindCSS
- **後端**: Flask + SQLAlchemy + Flask-SocketIO
- **數據庫**: PostgreSQL + Redis
- **容器化**: Docker + Docker Compose

#### 2. 微服務架構
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │    Database     │
│   (Port 5173)   │◄──►│   (Port 5001)   │◄──►│   (Port 5432)   │
│                 │    │                 │    │                 │
│ Vite + JS       │    │ Flask + Socket  │    │ PostgreSQL      │
│ TailwindCSS     │    │ SQLAlchemy      │    │ Redis           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 3. 3層架構規範
- **Level 0 (基礎層)**: 配置、工具、常量
- **Level 1 (服務層)**: API、認證、數據處理
- **Level 2 (業務層)**: 功能模組、用戶界面

---

## 📁 目錄結構規則

### 項目根目錄
```
Stock-Insight-Platform/
├── frontend/            # 前端應用
│   ├── RULES.md        # 前端開發規則 📋
│   ├── src/            # 源代碼
│   ├── scripts/        # 開發腳本
│   ├── tests/          # 測試文件
│   └── docs/           # 前端文檔
├── backend/             # 後端應用
│   ├── RULES.md        # 後端開發規則 📋
│   ├── app/            # Flask 應用
│   ├── scripts/        # 管理腳本
│   ├── tests/          # 測試文件
│   └── migrations/     # 數據庫遷移
├── scripts/            # 項目級腳本
├── docs/               # 項目文檔
├── docker-compose.yml  # 容器編排
├── RULES.md           # 總體規則 📋
└── README.md          # 項目說明
```

### 強制規則
- **MUST**: 所有新功能開發前閱讀相應的 `RULES.md`
- **MUST**: 遵循目錄結構，不得隨意創建目錄
- **MUST**: 文檔與代碼同步更新

---

## 🔗 規則文檔體系

### 規則文檔層級

#### 1. 項目級規則 (本文檔)
- **範圍**: 整個項目的通用規則
- **內容**: 架構原則、協作流程、部署規範
- **適用**: 所有開發者和運維人員

#### 2. 前端規則 (`frontend/RULES.md`)
- **範圍**: 前端開發的專業規則
- **內容**: 路徑管理、腳本開發、Docker 兼容性
- **適用**: 前端開發者

#### 3. 後端規則 (`backend/RULES.md`)
- **範圍**: 後端開發的專業規則
- **內容**: Flask 架構、API 設計、數據庫管理
- **適用**: 後端開發者

### 規則優先級
1. **項目級規則** (最高優先級)
2. **前端/後端專業規則**
3. **團隊約定**
4. **個人偏好** (最低優先級)

---

## 🐳 Docker 環境規則

### 統一環境檢測

#### 1. 多層檢測機制
所有腳本都必須支持以下環境檢測：

```bash
# 檔案檢測
if [ -f /.dockerenv ]; then
    echo "Docker 環境"
fi

# 環境變數檢測
if [ "$NODE_ENV" = "docker" ] || [ "$DOCKER_ENV" = "true" ]; then
    echo "Docker 環境"
fi

# 容器名稱檢測
if echo "$URL" | grep -q "frontend:\|backend:"; then
    echo "Docker 環境"
fi
```

#### 2. 配置自動切換
- **本地環境**: `localhost` + 開發端口
- **Docker 環境**: 容器服務名 + 標準端口
- **生產環境**: 環境變數配置

### 容器化標準

#### 1. Docker Compose 配置
```yaml
version: '3.8'
services:
  frontend:
    environment:
      - NODE_ENV=docker
      - FRONTEND_URL=http://frontend:5173
      - BACKEND_URL=http://backend:5001
  
  backend:
    environment:
      - FLASK_ENV=docker
      - DATABASE_URL=postgresql://stock_user:stock_password123@db:5432/stock_insight
      - REDIS_URL=redis://redis:6379/0
```

#### 2. .dockerignore 規範
- **前端**: 排除 `node_modules/`, `dist/`, `coverage/`
- **後端**: 排除 `__pycache__/`, `venv/`, `tests/`
- **通用**: 排除 `.git/`, `docs/`, `*.md`

---

## 🔧 腳本開發規則

### 環境兼容性標準

#### 1. 統一環境配置模組
- **前端**: `frontend/scripts/script-env.js`
- **後端**: `backend/scripts/script_env.py`
- **項目**: `scripts/docker-compatibility-check.sh`

#### 2. 腳本命名規範
```bash
# 格式: action-target.extension
check-routes.js          # 檢查路徑配置
dependency-check.js      # 依賴關係檢查
healthcheck.py          # 健康狀態檢查
run_socketio.py         # 啟動 Socket.IO
docker-check.sh         # Docker 環境檢查
```

#### 3. 執行標準
- **退出代碼**: 0=成功，非0=失敗
- **錯誤處理**: 友好的錯誤消息和調試信息
- **環境支持**: 本地和 Docker 環境無縫切換

### 腳本分類

#### 1. 開發工具腳本
- `check-*.js/py` - 各種檢查工具
- `validate-*.js/py` - 驗證工具
- `organize-*.js/py` - 組織工具

#### 2. 環境管理腳本
- `*-env.*` - 環境配置
- `docker-*.sh` - Docker 工具
- `quick-*.sh` - 快速檢查

#### 3. 管理腳本
- `healthcheck.py` - 健康檢查
- `db_manager.py` - 數據庫管理
- `run_*.py` - 服務啟動

---

## 🧪 測試規則

### 測試策略

#### 1. 測試金字塔
```
        🔺 E2E Tests (少量)
       🔺🔺 Integration Tests (適量)
      🔺🔺🔺 Unit Tests (大量)
```

- **單元測試**: 70% - 測試純函數和獨立組件
- **整合測試**: 20% - 測試模組間交互
- **E2E 測試**: 10% - 測試完整用戶流程

#### 2. 測試覆蓋要求
- **代碼覆蓋率**: 最低 80%
- **關鍵路徑**: 100% 覆蓋
- **API 端點**: 全部測試
- **用戶流程**: 主要流程全覆蓋

### 測試執行流程

#### 1. 開發階段
```bash
# 前端測試
cd frontend
npm run test              # 單元測試
npm run test:integration  # 整合測試
npm run test:e2e          # E2E 測試

# 後端測試
cd backend
python -m pytest tests/  # 所有測試
python -m pytest --cov   # 覆蓋率檢查
```

#### 2. 提交前檢查
```bash
# 運行完整測試套件
npm run test:all          # 前端全部測試
python -m pytest         # 後端全部測試

# 兼容性檢查
./scripts/docker-compatibility-check.sh
```

#### 3. CI/CD 流程
- **每次提交**: 自動運行單元測試
- **PR 審查**: 運行完整測試套件
- **部署前**: E2E 測試 + 兼容性檢查

---

## 📝 代碼品質規則

### 代碼風格標準

#### 1. 前端代碼風格
- **JavaScript**: ESLint + Prettier
- **CSS**: TailwindCSS + PostCSS
- **HTML**: 語義化標籤 + 無障礙設計

#### 2. 後端代碼風格
- **Python**: PEP 8 + Black + Flake8
- **SQL**: 標準化查詢格式
- **配置**: YAML 格式優於 JSON

### 提交規範

#### 1. Git 提交消息
```bash
# 格式: type(scope): description
feat(auth): 添加用戶登入功能
fix(api): 修復用戶註冊驗證錯誤
docs(readme): 更新安裝說明
style(frontend): 修復代碼格式
refactor(backend): 重構數據庫連接邏輯
test(integration): 添加 API 整合測試
```

#### 2. 分支管理
- `main` - 生產分支，保護分支
- `develop` - 開發分支，整合分支
- `feature/*` - 功能分支
- `bugfix/*` - 修復分支
- `hotfix/*` - 緊急修復分支

---

## 🚀 部署規則

### 環境管理

#### 1. 環境分類
- **開發環境** (`development`): 本地開發
- **Docker 環境** (`docker`): 容器化開發和測試
- **生產環境** (`production`): 正式部署

#### 2. 配置管理
```bash
# 開發環境
NODE_ENV=development
FLASK_ENV=development
DEBUG=true

# Docker 環境
NODE_ENV=docker
FLASK_ENV=docker
DEBUG=false

# 生產環境
NODE_ENV=production
FLASK_ENV=production
DEBUG=false
```

### 部署流程

#### 1. 自動化部署
```bash
# 構建檢查
npm run build            # 前端構建
docker build .           # 容器構建

# 測試檢查
npm run test:all         # 全面測試
./scripts/docker-compatibility-check.sh  # 兼容性檢查

# 部署執行
docker-compose up -d     # 容器部署
```

#### 2. 健康檢查
- **啟動檢查**: 服務正常啟動
- **連接檢查**: 數據庫和 Redis 連接
- **功能檢查**: 關鍵 API 和 Socket.IO
- **性能檢查**: 響應時間和負載

---

## ⚠️ 違規處理

### 違規分級

#### 1. 嚴重違規 (阻止合併/部署)
- 硬編碼敏感信息（密碼、密鑰）
- 安全漏洞（SQL 注入、XSS）
- 破壞性變更（未經測試的架構修改）
- 環境兼容性問題（無法在 Docker 中運行）

#### 2. 警告違規 (需要修復)
- 代碼風格不符合規範
- 缺少必要的錯誤處理
- 測試覆蓋率不足
- 文檔不完整或過時

#### 3. 建議改進 (優化建議)
- 性能優化機會
- 代碼重構建議
- 用戶體驗改進
- 可維護性提升

### 檢查工具

#### 1. 自動化檢查
```bash
# 項目級檢查
./scripts/docker-compatibility-check.sh

# 前端檢查
cd frontend
npm run lint              # 代碼風格
npm run test:routes       # 路徑配置
npm run quality:check     # 品質檢查

# 後端檢查
cd backend
flake8 app/              # 代碼風格
python -m pytest --cov  # 測試覆蓋率
bandit -r app/           # 安全掃描
```

#### 2. 手動檢查清單
- [ ] 功能需求是否完全實現
- [ ] 所有測試是否通過
- [ ] 代碼是否遵循規範
- [ ] 文檔是否同步更新
- [ ] 安全審查是否通過
- [ ] 性能是否符合要求

---

## 📚 資源和工具

### 開發工具

#### 1. 推薦 IDE 配置
- **VS Code**: 配置 ESLint, Prettier, Python 插件
- **PyCharm**: 配置 Black, Flake8 整合
- **通用**: EditorConfig 統一編輯器設置

#### 2. 瀏覽器開發工具
- **Chrome DevTools**: 調試前端代碼
- **Vue DevTools**: 組件調試
- **Network Tab**: API 調用分析
- **Performance Tab**: 性能分析

### 學習資源

#### 1. 技術文檔
- [前端開發規則](./frontend/RULES.md)
- [後端開發規則](./backend/RULES.md)
- [架構設計文檔](./frontend/docs/architecture/README.md)
- [開發安全指南](./frontend/docs/guides/DEVELOPMENT_SAFETY.md)

#### 2. 最佳實踐
- [路徑管理總結](./frontend/docs/implementation/PATH_MANAGEMENT_SUMMARY.md)
- [Docker 兼容性報告](./frontend/docs/reports/DOCKER_SCRIPT_COMPATIBILITY_REPORT.md)
- [統一配置管理](./frontend/docs/implementation/UNIFIED_CONFIG.md)

---

## 🔄 規則更新機制

### 版本管理

#### 1. 規則版本控制
- **主版本** (x.0.0): 重大架構變更
- **次版本** (x.y.0): 新增規則或重要修改
- **修訂版本** (x.y.z): 規則澄清或錯誤修正

#### 2. 更新流程
1. **提案階段**: 提出規則變更建議
2. **討論階段**: 團隊討論和評估影響
3. **測試階段**: 小範圍試用和驗證
4. **發布階段**: 正式更新規則文檔
5. **推廣階段**: 團隊培訓和執行

### 反饋機制

#### 1. 問題報告
- **Bug 報告**: 規則執行中發現的問題
- **改進建議**: 規則優化的建議
- **工具請求**: 自動化工具的需求

#### 2. 定期審查
- **季度審查**: 規則執行效果評估
- **年度更新**: 技術棧更新帶來的規則調整
- **持續改進**: 基於實際使用體驗的優化

---

## 📞 支持和聯繫

### 技術支持

#### 1. 內部支持
- **架構問題**: 聯繫技術架構師
- **工具問題**: 聯繫 DevOps 工程師
- **規則疑問**: 提 Issue 或 PR

#### 2. 學習資源
- **新手指南**: [DEVELOPMENT_SAFETY.md](./frontend/docs/guides/DEVELOPMENT_SAFETY.md)
- **進階實踐**: [架構文檔](./frontend/docs/architecture/)
- **問題排查**: [故障排除指南](./frontend/docs/guides/README.md)

---

**規則版本**: v1.0  
**最後更新**: 2024年12月  
**維護團隊**: Stock Insight Platform 開發團隊

> 💡 **重要提醒**: 
> - 這些規則是強制性要求，不遵守將影響代碼合併和項目部署
> - 所有開發者在開始工作前必須閱讀相應的規則文檔
> - 規則會根據項目發展持續更新，請定期檢查最新版本
> - 如有疑問或建議，歡迎提出 Issue 或 Pull Request 
