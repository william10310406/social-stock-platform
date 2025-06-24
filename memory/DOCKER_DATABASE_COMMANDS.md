# Docker 資料庫指令快速參考

## 核心指令 (已驗證)

### MSSQL 熱資料庫
```bash
# 正確指令模板
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SQL查詢"

# 常用查詢
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as total_stocks FROM stocks"
```

### PostgreSQL 冷資料庫
```bash
# 正確指令模板
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SQL查詢"

# 常用查詢
docker exec stock-insight-cold-db psql -U postgres -d StockInsight_Cold -c "SELECT COUNT(*) as total_analysis FROM stock_analysis"
```

## 關鍵要點

1. **MSSQL**: 使用 `mssql-tools18` (不是 `mssql-tools`)
2. **MSSQL**: 必須加 `-C` 參數信任證書
3. **MSSQL**: 密碼是 `StrongP@ssw0rd!` (用單引號包圍)
4. **MSSQL**: 資料庫名是 `StockInsight_Hot`
5. **PostgreSQL**: 用戶名是 `postgres` (不是 stockinsight)
6. **PostgreSQL**: 資料庫名是 `StockInsight_Cold`

## 容器狀態檢查
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## 完整指南位置
詳細指南: `frontend/docs/guides/DOCKER_DATABASE_COMMANDS_GUIDE.md` 