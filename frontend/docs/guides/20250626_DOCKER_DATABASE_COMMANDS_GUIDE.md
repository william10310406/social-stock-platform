# Docker 資料庫連接指令指南

## 概述
本指南記錄了 Stock Insight Platform 在 Docker 環境中連接和操作雙資料庫的正確指令。這些指令經過實際測試驗證，避免常見的路徑、密碼和容器名稱錯誤。

## 容器信息

### 當前運行的容器
```bash
# 查看所有運行的容器
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 輸出示例：
# NAMES                    STATUS                      PORTS
# stock-insight-backend    Up (unhealthy)              0.0.0.0:5001->5000/tcp
# stock-insight-hot-db     Up (healthy)                0.0.0.0:1433->1433/tcp
# stock-insight-frontend   Up                          0.0.0.0:5173-5174->5173-5174/tcp
# stock-insight-redis      Up (healthy)                0.0.0.0:6379->6379/tcp
# stock-insight-cold-db    Up (healthy)                0.0.0.0:5433->5432/tcp
```

## MSSQL 熱資料庫 (stock-insight-hot-db)

### 關鍵信息
- **容器名**: `stock-insight-hot-db`
- **sqlcmd 路徑**: `/opt/mssql-tools18/bin/sqlcmd` (注意是 `mssql-tools18`)
- **密碼**: `StrongP@ssw0rd!`
- **資料庫名**: `StockInsight_Hot`
- **必要參數**: `-C` (信任服務器證書)

### 基本連接測試
```bash
# 測試連接
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT 1 as test"
```

### 查看資料庫列表
```bash
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT name FROM sys.databases"
```

### 查看表格列表
```bash
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
```

### 常用查詢指令
```bash
# 查詢股票總數
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as total_stocks FROM stocks"

# 查詢價格記錄總數
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as total_prices FROM stock_prices"

# 查詢使用者總數
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as total_users FROM users"

# 查看股票交易所分布
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT exchange, COUNT(*) as count FROM stocks GROUP BY exchange"
```

## PostgreSQL 冷資料庫 (stock-insight-cold-db)

### 關鍵信息
- **容器名**: `stock-insight-cold-db`
- **用戶名**: `postgres` (不是 stockinsight)
- **密碼**: `StrongP@ssw0rd!`
- **資料庫名**: `StockInsight_Cold`

### 基本連接測試
```bash
# 測試連接
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT 1 as test"
```

### 查看資料庫列表
```bash
docker exec stock-insight-cold-db psql -U postgres -l
```

### 查看表格列表
```bash
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "\dt"
```

### 常用查詢指令
```bash
# 查詢分析記錄總數
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT COUNT(*) as total_analysis FROM stock_analysis"

# 查詢歷史數據總數
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT COUNT(*) as total_historical FROM historical_data"

# 查詢報告總數
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT COUNT(*) as total_reports FROM reports"
```

## Redis 快取 (stock-insight-redis)

### 基本操作
```bash
# 測試連接
docker exec stock-insight-redis redis-cli ping

# 查看所有鍵
docker exec stock-insight-redis redis-cli keys "*"

# 查看記憶體使用情況
docker exec stock-insight-redis redis-cli info memory
```

## 後端容器 (stock-insight-backend)

### 健康檢查
```bash
# 查看後端狀態
docker exec stock-insight-backend python /app/scripts/healthcheck.py --docker

# 查看後端日誌
docker logs stock-insight-backend --tail 50
```

## 常見錯誤與解決方案

### 1. SSL/證書錯誤
```
錯誤: SSL Provider: certificate verify failed
解決: 添加 -C 參數信任服務器證書
```

### 2. 找不到 sqlcmd
```
錯誤: stat /opt/mssql-tools/bin/sqlcmd: no such file or directory
解決: 使用正確路徑 /opt/mssql-tools18/bin/sqlcmd
```

### 3. 登入失敗
```
錯誤: Login failed for user 'sa'
解決: 檢查密碼是否正確，使用單引號包圍密碼
```

### 4. 找不到表格
```
錯誤: Invalid object name 'stocks'
解決: 添加 -d StockInsight_Hot 指定正確的資料庫
```

### 5. PostgreSQL 角色不存在
```
錯誤: role "stockinsight" does not exist
解決: 使用正確的用戶名 postgres
```

## 環境變數檢查

### 檢查 MSSQL 環境變數
```bash
docker exec stock-insight-hot-db printenv | grep -E "(MSSQL_SA_PASSWORD|SA_PASSWORD)"
```

### 檢查 PostgreSQL 環境變數
```bash
docker exec stock-insight-cold-db printenv | grep -E "(POSTGRES_|DB_)"
```

## 快速檢查腳本

### 完整系統狀態檢查
```bash
# 檢查所有容器狀態
echo "=== 容器狀態 ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n=== MSSQL 熱資料庫 ==="
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as total_stocks FROM stocks"

echo -e "\n=== PostgreSQL 冷資料庫 ==="
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT COUNT(*) as total_analysis FROM stock_analysis"

echo -e "\n=== Redis 快取 ==="
docker exec stock-insight-redis redis-cli ping
```

## 注意事項

1. **密碼安全**: 始終使用單引號包圍密碼，避免特殊字符問題
2. **工具版本**: 使用 `mssql-tools18` 而不是 `mssql-tools`
3. **資料庫名稱**: 注意大小寫，使用 `StockInsight_Hot` 和 `StockInsight_Cold`
4. **容器名稱**: 使用完整的容器名稱，避免簡寫
5. **網路連接**: 確保所有容器都在 `stock-insight-net` 網路中

## 更新記錄

- **2025-01-21**: 初始版本，記錄所有驗證過的指令
- **驗證狀態**: 所有指令已通過實際測試

---

這份指南提供了經過驗證的 Docker 資料庫操作指令，避免常見的配置錯誤，確保開發和維護的效率。 