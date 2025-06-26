# 開發者安全指南

## 🔐 密碼和金鑰說明

### 為什麼使用硬編碼密碼？

本項目為了方便開發者快速上手，在 `docker-compose.dual.yml` 中使用了預設的密碼和金鑰：

#### 📊 資料庫密碼
- **MSSQL 密碼**: `StrongP@ssw0rd!`
- **PostgreSQL 密碼**: `StrongP@ssw0rd!`

#### 🔑 加密金鑰
- **Fernet 金鑰**: `V8M_miy2DA3EGRwFdOn50Fhw63aqQSvHeatCUjy9uHE=`

### ⚠️ 重要安全提醒

#### 🟢 開發環境 (安全)
- 這些密碼**僅用於本地開發**
- Docker 容器運行在本地網路中
- 不會暴露到公網

#### 🔴 生產環境 (必須修改)
- **絕對不要**在生產環境使用這些密碼
- 部署前必須修改所有密碼和金鑰
- 使用環境變數或密鑰管理系統

### 🚀 快速開始

#### 1. 克隆項目
```bash
git clone <repository-url>
cd stock-insight-platform
```

#### 2. 直接啟動 (無需配置)
```bash
docker-compose -f docker-compose.dual.yml up -d
```

#### 3. 訪問應用
- 前端: http://localhost:5173
- 後端: http://localhost:5001
- MSSQL: localhost:1433
- PostgreSQL: localhost:5433

### 🔧 自定義配置 (可選)

如果您想使用自己的密碼：

#### 1. 創建環境文件
```bash
cp frontend/config/dual-database.env.example .env
```

#### 2. 修改密碼
編輯 `.env` 文件：
```bash
MSSQL_SA_PASSWORD=your-mssql-password
POSTGRES_PASSWORD=your-postgres-password
FERNET_KEY=your-fernet-key
```

#### 3. 生成新的 Fernet 金鑰
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

### 📋 資料庫連接資訊

#### MSSQL (熱資料庫)
- **主機**: localhost:1433
- **用戶**: sa
- **密碼**: StrongP@ssw0rd!
- **資料庫**: StockInsight_Hot

#### PostgreSQL (冷資料庫)
- **主機**: localhost:5433
- **用戶**: postgres
- **密碼**: StrongP@ssw0rd!
- **資料庫**: StockInsight_Cold

### 🛠️ 常用命令

#### 檢查資料庫狀態
```bash
# MSSQL
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT 1"

# PostgreSQL
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT 1"
```

#### 查看資料庫內容
```bash
# 查看股票數量
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as total_stocks FROM stocks"

# 查看用戶數量
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT COUNT(*) as total_users FROM users"
```

### 🔒 安全最佳實踐

#### 開發階段
1. ✅ 使用預設密碼快速開始
2. ✅ 在本地 Docker 環境中開發
3. ✅ 定期備份重要數據

#### 部署階段
1. 🔒 修改所有預設密碼
2. 🔒 使用強密碼生成器
3. 🔒 啟用 SSL/TLS 加密
4. 🔒 設置防火牆規則
5. 🔒 定期更新密碼

### 📞 支援

如果您遇到任何問題：
1. 檢查 Docker 容器狀態
2. 查看應用日誌
3. 確認端口未被佔用
4. 參考故障排除文檔

---

**注意**: 這些密碼僅供開發使用，請勿在生產環境中使用！ 