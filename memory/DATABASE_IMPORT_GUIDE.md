# 📊 數據庫導入操作指南

> **適用場景**: 新增其他數據庫或大規模數據導入  
> **基於實戰經驗**: 2025-06-23 雙資料庫股票數據導入成功案例  
> **完成度**: ✅ 實戰驗證

---

## 🎯 導入前準備檢查清單

### 📋 **環境準備**
- [ ] **雙資料庫配置確認**
  ```bash
  DUAL_DATABASE_ENABLED=true
  FLASK_CONFIG=dual_database
  ```
- [ ] **Docker 環境運行**
  ```bash
  docker-compose -f docker-compose.dual.yml up -d
  ```
- [ ] **資料庫連接測試**
  ```bash
  docker exec -it stock-insight-backend python -c "from app import create_app; app = create_app(); print('✅ 連接成功')"
  ```

### 📁 **數據來源準備**
- [ ] **數據格式驗證**: CSV 格式標準化
- [ ] **中文編碼檢查**: UTF-8 或 Unicode 支持
- [ ] **目錄結構確認**: 按股票代碼組織
- [ ] **數據完整性**: 必要欄位檢查

---

## 🔧 導入腳本開發流程

### 1️⃣ **腳本架構設計**
```python
# backend/scripts/import_[DATA_TYPE]_v2.py
#!/usr/bin/env python3
"""
[數據類型] 導入腳本
基於 2025-06-23 股票數據導入成功經驗
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from app.models import [YourModel]
from app.database_adapter import DatabaseAdapter

def import_data():
    """主要導入函數"""
    app = create_app()
    
    with app.app_context():
        # 數據處理邏輯
        pass

if __name__ == "__main__":
    import_data()
```

### 2️⃣ **關鍵實現要素**

#### 🏗️ **模型欄位對應**
- **問題**: 模型定義與實際資料庫欄位不符
- **解決**: 先檢查實際資料庫架構
```python
# 檢查實際欄位
for column in YourModel.__table__.columns:
    print(f'  - {column.name}: {column.type}')
```

#### 🧹 **數據清理機制**
```python
def clean_price_data(value_str):
    """清理價格數據"""
    if not value_str or value_str in ['--', 'N/A']:
        return None
    
    # 移除逗號和處理正負號
    cleaned = value_str.replace(',', '').strip()
    if cleaned.startswith('+'):
        cleaned = cleaned[1:]
    
    try:
        return float(cleaned)
    except ValueError:
        return None
```

#### 📦 **批量導入機制**
```python
def batch_import(records, batch_size=1000):
    """批量導入避免內存溢出"""
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        db.session.bulk_insert_mappings(YourModel, batch)
        db.session.commit()
        print(f"✅ 已導入 {i + len(batch)} / {len(records)} 記錄")
```

#### 🔍 **重複檢查機制**
```python
def check_existing_record(key_fields):
    """檢查記錄是否已存在"""
    return db.session.query(YourModel).filter_by(**key_fields).first()
```

### 3️⃣ **目錄解析邏輯** (適用於按目錄組織的數據)
```python
def parse_directory_name(dir_name):
    """
    解析目錄名稱提取關鍵信息
    範例: "1101 台泥 上市" -> code="1101", name="台泥", market="TWSE"
    """
    parts = dir_name.split()
    if len(parts) >= 3:
        code = parts[0]
        name = parts[1]
        market_type = "TWSE" if "上市" in parts[2] else "TPEx"
        return code, name, market_type
    return None, None, None
```

---

## 🗄️ 資料庫架構處理

### 📊 **雙資料庫分工策略**

#### 🔥 **熱資料庫 (MSSQL) - 即時數據**
- 用戶操作數據
- 最新交易數據
- 即時查詢需求
- 高頻讀寫操作

#### 🧊 **冷資料庫 (PostgreSQL) - 歷史數據**
- 歷史記錄歸檔
- 分析和報表數據
- 長期存儲需求
- 複雜查詢分析

### 🔧 **模型定義修正流程**

1. **檢查現有資料庫架構**
```python
# 檢查實際資料庫欄位
from sqlalchemy import inspect
inspector = inspect(db.engine)
columns = inspector.get_columns('your_table_name')
for col in columns:
    print(f"{col['name']}: {col['type']}")
```

2. **修正模型定義**
```python
# 移除不存在的欄位
# 添加缺失的欄位
# 修正欄位類型
```

3. **創建遷移文件**
```bash
flask db migrate -m "修正模型定義"
flask db upgrade
```

---

## ✅ 數據驗證與檢查

### 🔍 **導入後驗證腳本**
```python
# backend/scripts/check_[DATA_TYPE]_data.py
def verify_import():
    """驗證導入結果"""
    app = create_app()
    
    with app.app_context():
        from app import db
        
        # 基本統計
        total_count = db.session.query(YourModel).count()
        print(f"📊 總記錄數: {total_count:,}")
        
        # 數據分布檢查
        # 日期範圍檢查
        # 完整性檢查
        # 樣本數據展示
```

### 📈 **關鍵驗證指標**

#### ✅ **數據完整性檢查**
- [ ] 總記錄數符合預期
- [ ] 必要欄位無空值
- [ ] 外鍵關係正確
- [ ] 數據格式統一

#### ✅ **業務邏輯檢查**
- [ ] 日期範圍合理
- [ ] 數值範圍正常
- [ ] 分類數據正確
- [ ] 關聯數據一致

#### ✅ **系統功能檢查**
- [ ] API 查詢正常
- [ ] 前端顯示正確
- [ ] 搜尋功能可用
- [ ] 分頁功能正常

---

## 🚨 常見問題與解決方案

### ❌ **問題 1: 加密金鑰錯誤**
```
ValueError: Fernet key must be 32 url-safe base64-encoded bytes.
```
**解決**: 使用 Docker 容器內執行檢查
```bash
docker exec -it stock-insight-backend python scripts/check_data.py
```

### ❌ **問題 2: DatabaseAdapter 初始化錯誤**
```
TypeError: DatabaseAdapter.__init__() missing 1 required positional argument: 'engine_name'
```
**解決**: 使用正確的初始化方式
```python
# 錯誤
adapter = DatabaseAdapter()

# 正確
adapter = DatabaseAdapter.from_environment('hot')  # 或 'cold'
```

### ❌ **問題 3: 模型欄位不存在**
```
AttributeError: type object 'StockPrice' has no attribute 'date'
```
**解決**: 檢查實際欄位名稱
```python
# 檢查模型欄位
for column in StockPrice.__table__.columns:
    print(f'  - {column.name}: {column.type}')
```

### ❌ **問題 4: SQL 語法錯誤** (跨資料庫)
**解決**: 使用 DatabaseAdapter 處理語法差異
```python
adapter = DatabaseAdapter.from_environment()
query = adapter.format_limit_query(base_query, limit=100)
```

---

## 📊 成功案例參考

### 🎯 **2025-06-23 股票數據導入成功指標**
- **數據規模**: 1,312支股票，19,650筆記錄
- **導入時間**: 約 2-3 分鐘
- **錯誤率**: 0%
- **數據完整性**: 100%
- **系統穩定性**: 完全正常

### 📁 **相關文檔位置**
- **詳細報告**: `frontend/docs/reports/STOCK_DATA_IMPORT_CONFIRMATION_REPORT.md`
- **導入腳本**: `backend/scripts/import_stock_data_v2.py`
- **檢查腳本**: `backend/scripts/check_stock_data.py`
- **架構文檔**: `frontend/docs/architecture/dual-database-hot-cold-architecture.yaml`

---

## 🔮 未來擴展建議

### 🎯 **其他數據類型導入**
1. **用戶行為數據**
2. **交易記錄數據**
3. **財務報表數據**
4. **新聞和公告數據**

### 🚀 **自動化改進**
1. **定時導入任務**
2. **增量更新機制**
3. **數據品質監控**
4. **異常告警系統**

### 📈 **性能優化**
1. **並行處理**
2. **索引優化**
3. **緩存策略**
4. **查詢優化**

---

**📝 最後更新**: 2025-06-23  
**✅ 驗證狀態**: 實戰成功  
**🎯 適用場景**: 所有大規模數據導入項目 