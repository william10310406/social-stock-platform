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

#### 問題：端口被佔用
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

#### 問題：容器啟動失敗
**症狀**: 容器狀態顯示 "Exit" 或 "unhealthy"

**解決方案**:
```bash
# 查看具體錯誤
docker-compose -f docker-compose.dual.yml logs backend
docker-compose -f docker-compose.dual.yml logs frontend

# 重新啟動
docker-compose -f docker-compose.dual.yml down
docker-compose -f docker-compose.dual.yml up -d
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