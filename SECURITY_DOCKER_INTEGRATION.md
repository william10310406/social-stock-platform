# 🔒 資安系統 Docker 整合指南

本專案使用 Docker 容器環境，資安模組將直接整合到現有的 Docker 服務中。

## 🐳 Docker 環境優勢

✅ **完全環境隔離** - 比 Python 虛擬環境更強大  
✅ **一致性保證** - 開發、測試、生產環境完全一致  
✅ **依賴管理** - 通過 Dockerfile 統一管理  
✅ **服務整合** - 與現有的 backend/frontend/db 服務無縫整合  

## 🚀 整合方案

### 1. 資安模組整合到 Backend 容器

將資安模組直接整合到現有的 `stock-insight-backend` 容器中：

```dockerfile
# 在 backend/Dockerfile 中添加資安模組依賴
COPY ./requirements.txt /app/requirements.txt
COPY ./security_requirements.txt /app/security_requirements.txt

# 安裝資安模組依賴
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r security_requirements.txt
```

### 2. Docker Compose 配置

```yaml
# docker-compose.yml 中的 backend 服務
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  volumes:
    - ./backend:/app
    - ./security:/app/security  # 掛載資安模組
    - ./exports:/app/exports
    - ./scripts:/app/scripts
  environment:
    - SECURITY_CONFIG_DIR=/app/security/configs
    - SECURITY_LOGGING_LEVEL=INFO
```

## 🔧 Docker 環境下的使用方式

### 啟動服務
```bash
# 啟動所有服務（包含資安模組）
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看後端日誌
docker-compose logs -f backend
```

### 測試資安模組
```bash
# 在 backend 容器中測試資安系統
docker exec -it stock-insight-backend python -m security.levels.info.info_2.config_manager

# 或者進入容器交互式測試
docker exec -it stock-insight-backend bash
python test_security_system.py
```

### 配置管理
```bash
# 設置環境變數（通過 .env 文件）
echo "SECURITY_LOGGING_LEVEL=DEBUG" >> .env
echo "SECURITY_MONITORING_ENABLED=true" >> .env

# 重啟服務以載入新配置
docker-compose restart backend
```

## 📦 整合 Requirements

將資安模組依賴整合到現有的 backend/requirements.txt：

```pip-requirements
# 現有依賴...
Flask==2.3.3
Flask-SocketIO==5.3.6
# ...

# 資安模組依賴
PyYAML==6.0.2
psutil==7.0.0
cryptography==45.0.4
```

## 🏗️ 專案結構（Docker 版）

```
social-stock-platform/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt  # 包含資安模組依賴
│   └── ...
├── security/             # 資安模組（掛載到容器）
│   ├── configs/
│   │   └── security-levels.yaml
│   └── levels/
│       └── info/
└── test_security_system.py
```

## 🎯 建議的開發流程

1. **移除虛擬環境相關文件**
   ```bash
   rm -rf venv/
   rm setup_security_env.sh
   rm start_security_env.sh
   rm security_requirements.txt
   ```

2. **整合依賴到 backend/requirements.txt**
   - 將資安模組需要的套件加入現有的 requirements.txt

3. **更新 Docker 配置**
   - 確保 security 目錄掛載到 backend 容器
   - 設置相關環境變數

4. **測試整合**
   ```bash
   docker-compose up --build
   docker exec -it stock-insight-backend python -m security.levels.info.info_2.config_manager
   ```

## 🚨 重要提醒

- ❌ **移除 venv 相關設置** - Docker 已提供環境隔離
- ✅ **使用 Docker 掛載** - 程式碼變更即時生效  
- ✅ **環境變數配置** - 通過 .env 或 docker-compose.yml 管理
- ✅ **容器內測試** - 所有測試都在容器內執行

這樣的整合方案更符合您現有的 Docker 架構！
