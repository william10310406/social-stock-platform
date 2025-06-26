# 🚨 MSSQL Docker 緊急修復指南

## 問題現象
其他主機上的團隊成員無法連接 MSSQL 資料庫

## 🔧 一鍵修復腳本

### 步驟 1: 緊急診斷
```bash
# 建立診斷腳本
cat > mssql_emergency_fix.sh << 'EOF'
#!/bin/bash

echo "🔍 MSSQL Docker 緊急診斷開始..."

echo "=== 1. 檢查容器狀態 ==="
docker ps --filter name=stock-insight-hot-db --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n=== 2. 檢查容器日誌 ==="
docker logs stock-insight-hot-db --tail 10

echo -e "\n=== 3. 檢查 sqlcmd 路徑 ==="
docker exec stock-insight-hot-db ls -la /opt/mssql-tools*/bin/sqlcmd 2>/dev/null || echo "❌ sqlcmd 路徑問題"

echo -e "\n=== 4. 測試基本連接 ==="
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT 1 as test" 2>/dev/null && echo "✅ MSSQL 連接正常" || echo "❌ MSSQL 連接失敗"

echo -e "\n=== 5. 檢查系統架構 ==="
docker exec stock-insight-hot-db uname -m

echo -e "\n🔧 診斷完成！"
EOF

chmod +x mssql_emergency_fix.sh
./mssql_emergency_fix.sh
```

### 步驟 2: 常見修復方案

#### 修復 A: 重啟容器
```bash
echo "🔄 重啟 MSSQL 容器..."
docker restart stock-insight-hot-db
sleep 10
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT 1"
```

#### 修復 B: 完全重建
```bash
echo "🏗️ 重建 MSSQL 容器..."
docker-compose down stock-insight-hot-db
docker-compose up stock-insight-hot-db -d
sleep 30
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT 1"
```

#### 修復 C: 架構兼容性修復 (不同主機架構)
```bash
echo "🏗️ 修復架構兼容性..."
docker-compose down
docker-compose up --platform linux/amd64 -d
sleep 30
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT 1"
```

### 步驟 3: 驗證修復
```bash
echo "✅ 最終驗證..."

# 測試基本連接
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT 1 as test"

# 測試資料庫訪問
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as stocks FROM stocks"

echo "🎉 修復完成！"
```

## 🆘 **最緊急修復 (核選項)**

如果上述都無效，使用核選項：

```bash
# 停止所有容器
docker-compose down

# 清理 Docker 系統
docker system prune -f
docker volume prune -f

# 重新拉取映像
docker-compose pull

# 重新啟動
docker-compose up -d

# 等待啟動完成
sleep 60

# 測試連接
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT 1"
```

## 📋 **不同主機架構注意事項**

### Intel/AMD64 主機
```bash
# 標準啟動
docker-compose up -d
```

### Apple M1/M2 (ARM64) 主機
```bash
# 強制使用 x86_64 架構
docker-compose up --platform linux/amd64 -d
```

### 混合環境團隊
在 `docker-compose.yml` 中添加：
```yaml
services:
  stock-insight-hot-db:
    platform: linux/amd64  # 強制 x86_64 架構
    image: mcr.microsoft.com/mssql/server:2022-latest
```

## 📞 **求救聯絡**

如果問題仍然存在：

1. **提供診斷信息**：
   ```bash
   ./mssql_emergency_fix.sh > mssql_diagnosis.txt
   ```

2. **檢查系統信息**：
   ```bash
   echo "系統: $(uname -a)" >> mssql_diagnosis.txt
   echo "Docker 版本: $(docker --version)" >> mssql_diagnosis.txt
   echo "Docker Compose 版本: $(docker-compose --version)" >> mssql_diagnosis.txt
   ```

3. **發送診斷報告給團隊**

## ✅ **修復成功標準**

修復成功的標準：
```bash
# 這個指令應該回傳 1
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -Q "SELECT 1 as test"

# 這個指令應該回傳股票數量
docker exec stock-insight-hot-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!' -C -d StockInsight_Hot -Q "SELECT COUNT(*) as stocks FROM stocks"
```

---
**更新時間**: 2025-06-25  
**適用版本**: Stock Insight Platform v2.0+  
**測試環境**: macOS (Intel/ARM), Linux (x86_64), Windows (WSL2) 