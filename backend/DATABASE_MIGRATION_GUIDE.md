# 📦 Database Migration Guide - Stock Insight Platform

## 🚀 自動遷移功能

我們的平台現在具備完整的自動化數據庫遷移系統，確保每次部署都能順利運行。

## 🔧 改進內容

### 1. 智能啟動腳本 (`entrypoint.sh`)

```bash
# 啟動流程
🔍 檢查數據庫連接 → 📦 運行遷移 → 🧪 驗證應用 → 🚀 啟動服務
```

**主要功能：**
- 智能數據庫連接檢查（最多30次重試）
- 自動初始化遷移目錄（如果不存在）
- 開發模式下自動檢測模型變更
- 應用配置驗證
- 優化的 Gunicorn 配置

### 2. 數據庫管理工具 (`scripts/db_manager.py`)

```bash
# 使用方法
python scripts/db_manager.py migrate     # 運行遷移
python scripts/db_manager.py check       # 健康檢查
python scripts/db_manager.py auto        # 全自動設置
```

**功能特點：**
- 全面的數據庫健康檢查
- 自動表結構驗證
- 數據統計報告
- 錯誤處理和日誌

### 3. 健康檢查系統 (`scripts/healthcheck.py`)

```bash
# 檢查項目
✅ 數據庫連接
✅ Redis 連接  
✅ 遷移狀態
```

**Docker 健康檢查：**
- 每30秒自動檢查
- 60秒啟動期緩衝
- 3次重試機制

### 4. API 健康端點

```http
GET http://localhost:5001/api/health
GET http://localhost:5001/health
```

**響應示例：**
```json
{
    "status": "healthy",
    "timestamp": "2025-06-20T13:32:48.470736",
    "version": "1.0.0",
    "database": "connected",
    "services": {
        "database": "ok",
        "redis": "ok"
    }
}
```

## 📋 使用指南

### 開發環境

```bash
# 啟動服務（自動遷移）
docker-compose up -d

# 手動檢查健康狀態
docker exec stock-insight-backend python scripts/db_manager.py check
```

### 新遷移創建

```bash
# 進入容器
docker exec -it stock-insight-backend bash

# 創建新遷移
flask db migrate -m "描述變更內容"

# 應用遷移
flask db upgrade
```

### 故障排除

```bash
# 查看啟動日誌
docker logs stock-insight-backend

# 檢查數據庫連接
docker exec stock-insight-backend python scripts/healthcheck.py

# 重置數據庫（謹慎使用）
docker-compose down -v
docker-compose up -d
```

## 🔄 自動化流程

### 容器啟動序列

1. **數據庫等待** - 等待 PostgreSQL 準備就緒
2. **連接檢查** - 驗證數據庫可連接性
3. **遷移執行** - 自動應用待處理的遷移
4. **應用驗證** - 確認配置正確性
5. **服務啟動** - 啟動 Gunicorn 工作進程

### 監控與告警

- **Docker 健康檢查** - 自動監控容器狀態
- **HTTP 健康端點** - 外部監控系統可用
- **詳細日誌** - 所有操作都有清晰的日誌輸出

## ⚠️ 注意事項

1. **生產環境**：自動遷移功能建議在維護窗口執行
2. **備份策略**：重要變更前請備份數據庫
3. **測試優先**：新遷移應在測試環境充分驗證

## 🎯 最佳實踐

1. **小步快跑**：避免大規模的數據結構變更
2. **向後兼容**：確保新遷移不破壞現有功能
3. **充分測試**：每個遷移都應經過完整測試
4. **文檔記錄**：為重要變更添加清晰的註釋

---

**✨ 效果：** 
- 🚀 零停機部署
- 🔄 自動化遷移
- 🛡️ 穩定可靠
- 📊 完整監控 
