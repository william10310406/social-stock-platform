# 🚀 朋友專用故障排除指南

## 快速解決常見問題

### 🐳 Docker 相關問題

#### 問題：Docker 未安裝
**症狀**: 執行腳本時提示 "Docker 未安裝"

**解決方案**:
1. 下載並安裝 Docker Desktop: https://www.docker.com/products/docker-desktop
2. 啟動 Docker Desktop
3. 重新運行啟動腳本

#### 問題：端口被佔用
**症狀**: 啟動時提示端口被佔用

**解決方案**:
```bash
# 查看佔用端口的進程
lsof -i :5173
lsof -i :5001
lsof -i :1433
lsof -i :5433

# 停止佔用進程
sudo lsof -ti:5173 | xargs kill -9
sudo lsof -ti:5001 | xargs kill -9
sudo lsof -ti:1433 | xargs kill -9
sudo lsof -ti:5433 | xargs kill -9
```

#### 問題：容器啟動失敗
**症狀**: 容器狀態顯示 "Exit" 或 "unhealthy"

**解決方案**:
```bash
# 查看容器日誌
docker-compose -f docker-compose.dual.yml logs backend
docker-compose -f docker-compose.dual.yml logs frontend

# 重新啟動所有服務
docker-compose -f docker-compose.dual.yml down
docker-compose -f docker-compose.dual.yml up -d

# 或者使用我們的啟動腳本
./scripts/start-for-friends.sh
```

### 🗄️ 資料庫相關問題

#### 問題：資料庫連接失敗
**症狀**: 後端日誌顯示資料庫連接錯誤

**解決方案**:
```bash
# 檢查資料庫容器狀態
docker-compose -f docker-compose.dual.yml ps

# 手動創建資料庫
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "CREATE DATABASE StockInsight_Hot"
docker exec stock-insight-cold-db psql -U postgres -c "CREATE DATABASE StockInsight_Cold"

# 運行資料庫遷移
docker-compose -f docker-compose.dual.yml exec backend python -c "
from app import create_app
from flask_migrate import upgrade
app = create_app()
with app.app_context():
    upgrade()
"
```

#### 問題：資料庫密碼錯誤
**症狀**: 資料庫連接時提示密碼錯誤

**解決方案**:
預設密碼是 `StrongP@ssw0rd!`，如果還是不行：
```bash
# 重置 MSSQL 密碼
docker-compose -f docker-compose.dual.yml down
docker volume rm test_hot_db_data
docker-compose -f docker-compose.dual.yml up -d

# 重置 PostgreSQL 密碼
docker volume rm test_cold_db_data
docker-compose -f docker-compose.dual.yml up -d
```

### 🌐 網路相關問題

#### 問題：無法訪問前端
**症狀**: 瀏覽器無法打開 http://localhost:5173

**解決方案**:
1. 確認前端容器正在運行
2. 檢查端口是否被佔用
3. 嘗試使用 `http://0.0.0.0:5173`
4. 清除瀏覽器緩存

#### 問題：API 請求失敗
**症狀**: 前端顯示 API 錯誤

**解決方案**:
```bash
# 檢查後端 API 是否正常
curl http://localhost:5001/api/health

# 查看後端日誌
docker-compose -f docker-compose.dual.yml logs backend

# 重啟後端服務
docker-compose -f docker-compose.dual.yml restart backend
```

### 🔐 認證相關問題

#### 問題：註冊/登入失敗
**症狀**: 無法註冊新用戶或登入

**解決方案**:
1. 確認資料庫正常運行
2. 檢查後端日誌中的錯誤信息
3. 嘗試清除瀏覽器緩存
4. 確認 Fernet 金鑰配置正確

#### 問題：JWT Token 錯誤
**症狀**: 登入後立即被登出

**解決方案**:
```bash
# 檢查 SECRET_KEY 配置
docker-compose -f docker-compose.dual.yml exec backend python -c "
from app import create_app
app = create_app()
print('SECRET_KEY:', app.config.get('SECRET_KEY'))
"
```

### 🧹 清理和重置

#### 完全重置環境
如果遇到無法解決的問題，可以完全重置：

```bash
# 停止所有服務
docker-compose -f docker-compose.dual.yml down

# 清理所有數據
docker volume rm test_hot_db_data test_cold_db_data test_redis_data

# 清理 Docker 緩存
docker system prune -f

# 重新啟動
./scripts/start-for-friends.sh
```

#### 清理瀏覽器數據
1. 清除瀏覽器緩存
2. 清除 localStorage 和 sessionStorage
3. 重新訪問 http://localhost:5173

### 📞 獲取幫助

如果以上方法都無法解決問題：

1. **查看詳細日誌**:
   ```bash
   docker-compose -f docker-compose.dual.yml logs -f
   ```

2. **檢查系統資源**:
   ```bash
   docker stats
   ```

3. **重啟 Docker Desktop**:
   - 完全退出 Docker Desktop
   - 重新啟動
   - 等待完全啟動後再運行腳本

4. **聯繫開發者**:
   - 提供錯誤日誌
   - 說明操作步驟
   - 描述系統環境

### 🎯 預防措施

為了避免問題：

1. **定期清理**:
   ```bash
   docker system prune -f
   ```

2. **備份重要數據**:
   ```bash
   docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "BACKUP DATABASE StockInsight_Hot TO DISK = '/mssql_backup/backup.bak'"
   ```

3. **使用啟動腳本**:
   總是使用 `./scripts/start-for-friends.sh` 而不是手動啟動

---

**💡 提示**: 大多數問題都可以通過重新啟動服務解決。如果問題持續存在，請聯繫項目維護者。 