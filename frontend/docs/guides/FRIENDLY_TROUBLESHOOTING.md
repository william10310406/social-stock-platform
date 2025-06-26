# 🚀 朋友專用故障排除指南

## 🎯 快速解決方案（按問題類型）

### 🐳 Docker 相關問題

#### 問題：Docker 未安裝
**症狀**: 執行腳本時提示 "Docker 未安裝"

**解決方案**:
1. 下載並安裝 Docker Desktop: https://www.docker.com/products/docker-desktop
2. 啟動 Docker Desktop
3. 重新運行啟動腳本

#### 問題：Docker 守護程序未運行
**錯誤信息**: `Cannot connect to the Docker daemon at unix:///Users/xxx/.docker/run/docker.sock. Is the docker daemon running?`

**解決方案**:
```bash
# 🍎 macOS 用戶
open -a Docker
# 等待狀態欄顯示 "Docker Desktop is running"

# 🪟 Windows 用戶
# 在開始菜單搜索 "Docker Desktop" 並啟動

# 🐧 Linux 用戶
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker

# 檢查是否成功
docker info
```

#### 問題：Docker Desktop 啟動失敗
**錯誤信息**: `Docker Desktop failed to start` 或 `Docker Desktop is starting...`

**解決方案**:
```bash
# 🍎 macOS 用戶
# 1. 完全退出 Docker Desktop
killall Docker && open /Applications/Docker.app

# 2. 重置 Docker Desktop
rm -rf ~/Library/Containers/com.docker.docker
rm -rf ~/Library/Application\ Support/Docker\ Desktop
rm -rf ~/.docker

# 3. 重新安裝 Docker Desktop
# 下載最新版本: https://www.docker.com/products/docker-desktop

# 🪟 Windows 用戶
# 1. 以管理員身份運行 PowerShell
# 2. 重置 Docker Desktop
wsl --shutdown
# 3. 重新啟動 Docker Desktop
```

#### 問題：Docker 權限錯誤
**錯誤信息**: `Got permission denied while trying to connect to the Docker daemon socket`

**解決方案**:
```bash
# 🐧 Linux 用戶
sudo usermod -aG docker $USER
newgrp docker

# 或者臨時使用 sudo
sudo docker info

# 🍎 macOS 用戶
# 重新啟動 Docker Desktop
killall Docker && open /Applications/Docker.app
```

#### 問題：Docker 磁盤空間不足
**錯誤信息**: `no space left on device` 或 `Docker Desktop is running out of disk space`

**解決方案**:
```bash
# 清理 Docker 緩存
docker system prune -f
docker volume prune -f
docker image prune -f

# 查看 Docker 磁盤使用情況
docker system df

# 清理所有未使用的資源
docker system prune -a -f --volumes
```

#### 問題：Docker 容器啟動失敗
**錯誤信息**: `container exited with code 1` 或 `failed to start container`

**解決方案**:
```bash
# 查看容器日誌
docker-compose -f docker-compose.dual.yml logs backend
docker-compose -f docker-compose.dual.yml logs frontend

# 重新構建容器
docker-compose -f docker-compose.dual.yml down
docker-compose -f docker-compose.dual.yml build --no-cache
docker-compose -f docker-compose.dual.yml up -d

# 檢查容器狀態
docker-compose -f docker-compose.dual.yml ps
```

#### 問題：Docker 網路連接失敗
**錯誤信息**: `network not found` 或 `failed to connect to the Docker daemon`

**解決方案**:
```bash
# 檢查 Docker 網路
docker network ls

# 重新創建預設網路
docker network create bridge

# 重啟 Docker 服務
# macOS/Windows: 重啟 Docker Desktop
# Linux: sudo systemctl restart docker
```

#### 問題：Docker 映像下載失敗
**錯誤信息**: `failed to pull image` 或 `network timeout`

**解決方案**:
```bash
# 檢查網路連接
ping google.com

# 使用國內鏡像源（中國用戶）
# 在 Docker Desktop 設置中添加鏡像源
# https://registry.docker-cn.com
# https://docker.mirrors.ustc.edu.cn

# 手動拉取映像
docker pull mcr.microsoft.com/mssql/server:2019-latest
docker pull postgres:13
docker pull redis:6-alpine
```

#### 問題：Docker 容器內存不足
**錯誤信息**: `container killed due to memory limit` 或 `out of memory`

**解決方案**:
```bash
# 增加 Docker Desktop 內存限制
# Docker Desktop -> Settings -> Resources -> Memory

# 檢查容器資源使用
docker stats

# 重啟容器
docker-compose -f docker-compose.dual.yml restart
```

#### 問題：Docker 端口被佔用
**錯誤信息**: `Bind for 0.0.0.0:5173 failed: port is already allocated`

**解決方案**:
```bash
# 查看佔用端口的進程
lsof -i :5173
lsof -i :5001
lsof -i :1433
lsof -i :5433

# 強制停止佔用進程
sudo lsof -ti:5173 | xargs kill -9
sudo lsof -ti:5001 | xargs kill -9
sudo lsof -ti:1433 | xargs kill -9
sudo lsof -ti:5433 | xargs kill -9
```

#### 問題：Docker 容器健康檢查失敗
**錯誤信息**: `container is unhealthy` 或 `health check failed`

**解決方案**:
```bash
# 查看健康檢查日誌
docker-compose -f docker-compose.dual.yml logs backend | grep health
docker-compose -f docker-compose.dual.yml logs frontend | grep health

# 重新啟動服務
docker-compose -f docker-compose.dual.yml restart backend
docker-compose -f docker-compose.dual.yml restart frontend

# 檢查服務狀態
docker-compose -f docker-compose.dual.yml ps
```

### 🗄️ 資料庫相關問題

#### 問題：資料庫連接失敗
**錯誤信息**: `Login failed for user 'sa'` 或 `connection refused`

**解決方案**:
```bash
# 檢查資料庫容器狀態
docker-compose -f docker-compose.dual.yml ps

# 手動創建資料庫
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "CREATE DATABASE StockInsight_Hot"
docker exec stock-insight-cold-db psql -U postgres -c "CREATE DATABASE StockInsight_Cold"

# 運行遷移
docker-compose -f docker-compose.dual.yml exec backend python -c "
from app import create_app
from flask_migrate import upgrade
app = create_app()
with app.app_context():
    upgrade()
"
```

#### 問題：Fernet 金鑰錯誤
**錯誤信息**: `Invalid Fernet key` 或 `cryptography.fernet.InvalidToken`

**解決方案**:
```bash
# 重新生成 Fernet 金鑰
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# 更新 docker-compose.dual.yml 中的 FERNET_KEY
# 然後重啟服務
docker-compose -f docker-compose.dual.yml down
docker-compose -f docker-compose.dual.yml up -d
```

#### 問題：資料庫密碼錯誤
**錯誤信息**: `Login failed for user 'sa'` 或 `authentication failed`

**解決方案**:
```bash
# 重置資料庫密碼
docker-compose -f docker-compose.dual.yml down
docker volume rm test_hot_db_data test_cold_db_data
docker-compose -f docker-compose.dual.yml up -d

# 預設密碼是 StrongP@ssw0rd!
```

### 🌐 網路和 API 問題

#### 問題：前端無法訪問後端 API
**錯誤信息**: `Failed to fetch` 或 `Connection refused`

**解決方案**:
```bash
# 檢查後端是否正常
curl http://localhost:5001/api/health

# 檢查前端代理配置
# 確認 frontend/vite.config.js 中的代理設置正確

# 重啟後端
docker-compose -f docker-compose.dual.yml restart backend
```

#### 問題：註冊/登入失敗
**錯誤信息**: `500 Internal Server Error` 或 `Registration failed`

**解決方案**:
```bash
# 檢查後端日誌
docker-compose -f docker-compose.dual.yml logs backend

# 檢查資料庫連接
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT 1"

# 重新創建資料庫
docker-compose -f docker-compose.dual.yml down
docker volume rm test_hot_db_data test_cold_db_data
docker-compose -f docker-compose.dual.yml up -d
```

#### 問題：前端頁面無法載入
**症狀**: 瀏覽器顯示空白頁面或錯誤

**解決方案**:
```bash
# 檢查前端容器
docker-compose -f docker-compose.dual.yml logs frontend

# 清除瀏覽器緩存
# 或使用無痕模式訪問 http://localhost:5173

# 重啟前端
docker-compose -f docker-compose.dual.yml restart frontend
```

### 🔐 認證和會話問題

#### 問題：登入後立即被登出
**症狀**: 登入成功但馬上跳回登入頁面

**解決方案**:
```bash
# 檢查 JWT 配置
docker-compose -f docker-compose.dual.yml exec backend python -c "
from app import create_app
app = create_app()
print('SECRET_KEY:', app.config.get('SECRET_KEY'))
"

# 清除瀏覽器 localStorage
# 在瀏覽器控制台執行: localStorage.clear()

# 重啟所有服務
docker-compose -f docker-compose.dual.yml restart
```

#### 問題：Socket.IO 連接失敗
**錯誤信息**: `WebSocket connection failed` 或 `Socket.IO connection error`

**解決方案**:
```bash
# 檢查 Socket.IO 配置
docker-compose -f docker-compose.dual.yml logs backend | grep socket

# 重啟後端（Socket.IO 需要單 worker 模式）
docker-compose -f docker-compose.dual.yml restart backend

# 檢查前端 Socket.IO 配置
# 確認 src/js/socket.js 中的連接地址正確
```

### 🧹 環境重置和清理

#### 完全重置（終極解決方案）
如果所有方法都無效，使用完全重置：

```bash
# 1. 停止所有服務
docker-compose -f docker-compose.dual.yml down

# 2. 清理所有數據
docker volume rm test_hot_db_data test_cold_db_data test_redis_data

# 3. 清理 Docker 緩存
docker system prune -f

# 4. 重新啟動
docker-compose -f docker-compose.dual.yml up -d

# 5. 等待服務啟動後創建資料庫
sleep 30
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "CREATE DATABASE StockInsight_Hot"
docker exec stock-insight-cold-db psql -U postgres -c "CREATE DATABASE StockInsight_Cold"

# 6. 運行遷移
docker-compose -f docker-compose.dual.yml exec backend python -c "
from app import create_app
from flask_migrate import upgrade
app = create_app()
with app.app_context():
    upgrade()
"
```

#### 瀏覽器清理
```bash
# 清除所有瀏覽器數據
# 1. 打開瀏覽器開發者工具 (F12)
# 2. 在控制台執行:
localStorage.clear()
sessionStorage.clear()
# 3. 清除瀏覽器緩存
# 4. 重新訪問 http://localhost:5173
```

### 🔧 常用診斷命令

#### 檢查服務狀態
```bash
# 查看所有容器狀態
docker-compose -f docker-compose.dual.yml ps

# 查看詳細日誌
docker-compose -f docker-compose.dual.yml logs -f

# 檢查系統資源
docker stats
```

#### 檢查資料庫
```bash
# MSSQL 檢查
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as stocks FROM stocks"

# PostgreSQL 檢查
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT COUNT(*) as users FROM users"
```

#### 檢查網路連接
```bash
# 檢查端口是否開放
netstat -an | grep 5173
netstat -an | grep 5001
netstat -an | grep 1433
netstat -an | grep 5433

# 測試 API 連接
curl -v http://localhost:5001/api/health
curl -v http://localhost:5173
```

#### Docker 診斷命令
```bash
# 檢查 Docker 版本
docker --version
docker-compose --version

# 檢查 Docker 信息
docker info

# 檢查 Docker 磁盤使用
docker system df

# 檢查 Docker 網路
docker network ls

# 檢查 Docker 映像
docker images

# 檢查 Docker 容器
docker ps -a
```

### 🎯 預防措施

#### 定期維護
```bash
# 每週清理一次
docker system prune -f
docker volume prune -f

# 備份重要數據
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "BACKUP DATABASE StockInsight_Hot TO DISK = '/mssql_backup/backup.bak'"
```

#### 啟動前檢查
```bash
# 1. 確保 Docker Desktop 正在運行
docker info

# 2. 檢查端口是否被佔用
lsof -i :5173
lsof -i :5001

# 3. 使用智能啟動腳本
./scripts/start-for-friends.sh
```

### 📞 緊急聯繫

如果以上方法都無法解決問題：

1. **收集錯誤信息**:
   ```bash
   docker-compose -f docker-compose.dual.yml logs > error_logs.txt
   docker info > docker_info.txt
   ```

2. **提供系統信息**:
   - 操作系統版本
   - Docker 版本
   - 錯誤發生的具體步驟

3. **聯繫開發者**:
   - 發送錯誤日誌
   - 描述問題現象
   - 說明已嘗試的解決方案

---

**💡 黃金法則**: 90% 的問題都可以通過 `docker-compose -f docker-compose.dual.yml restart` 解決！

## 🐧 Windows WSL2 + Docker Desktop 問題與解決方案

### 常見錯誤

- `Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?`
- `permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: ... permission denied`

### 成因說明
- WSL2 內部的 Linux 不能自己啟動 dockerd，必須「共用」Windows 上的 Docker Desktop。
- 權限問題：WSL2 用戶沒有存取 /var/run/docker.sock 的權限。
- Docker Desktop 沒有啟用 WSL2 整合。

### 標準修復步驟

1. **Windows 啟動 Docker Desktop**
2. **Docker Desktop 設定 > Resources > WSL Integration 勾選你的 Linux 發行版**
3. **關閉所有 WSL2 終端機**
4. **重新打開 WSL2 終端機，執行：**
   ```bash
   docker info
   ```
   應該能看到 Server 資訊
5. **如遇權限問題，執行：**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

### 進階診斷

- 檢查 WSL2 狀態：
  ```bash
  wsl -l -v
  ```
- 檢查 docker.sock 權限：
  ```bash
  ls -l /var/run/docker.sock
  groups
  ```

### 官方參考
- [Docker Desktop + WSL2 官方說明](https://docs.docker.com/desktop/wsl/)

### 腳本自動偵測
- 本專案啟動腳本已自動偵測 WSL2，並給出專屬提示與修復建議。

--- 