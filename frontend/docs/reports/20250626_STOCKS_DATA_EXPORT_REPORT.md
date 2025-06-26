# 📊 Stock Insight Platform - 資料匯出報告

**匯出日期：** 2025-06-21  
**資料範圍：** 完整股票資料庫  
**匯出狀態：** ✅ 完成

---

## 📈 資料統計概覽

### 🎯 匯出資料量
- **股票總數：** 126 支
- **價格記錄：** 2,030+ 筆
- **最新交易日：** 2025-06-20
- **涵蓋市場：** 台灣上市/上櫃股票

### 📋 代表性股票清單
| 代號 | 名稱 | 交易所 | 市場類型 |
|------|------|--------|----------|
| 2065 | 世豐 | 上櫃 | - |
| 1586 | 和勤 | 上櫃 | - |
| 2729 | 瓦城 | 上櫃 | - |
| 2732 | 六角 | 上櫃 | - |
| ... | ... | ... | ... |

---

## 📁 匯出檔案清單

### 🗃️ 檔案統計
| 檔案名稱 | 格式 | 大小 | 壓縮後 | 狀態 |
|---------|------|------|--------|------|
| stock_insight_backup.sql | PostgreSQL | 217KB | 56KB | ✅ |
| stocks.csv | CSV | 6.4KB | 2.2KB | ✅ |
| stock_prices.csv | CSV | 122KB | 40KB | ✅ |
| stocks_data.json | JSON | 628KB | 63KB | ✅ |
| stocks_data.db | SQLite | 164KB | 59KB | ✅ |
| **stock_data_export.zip** | **壓縮檔** | **221KB** | **-** | **✅** |

---

## 📄 檔案格式說明

### 1. PostgreSQL 備份 (.sql)
**檔案：** `stock_insight_backup.sql`
```sql
-- 完整資料庫結構和資料
-- 可直接匯入到 PostgreSQL 資料庫
-- 包含索引、約束、觸發器等完整定義
```

**使用方式：**
```bash
# 還原到 PostgreSQL
psql -U username -d database_name < stock_insight_backup.sql
```

### 2. CSV 格式檔案

#### 股票基本資料 (.csv)
**檔案：** `stocks.csv`
```csv
symbol,name,exchange,market_type,created_at
2065,世豐,上櫃,,2025-06-21T17:13:56.345266
1586,和勤,上櫃,,2025-06-21T17:13:56.491788
```

#### 股票價格資料 (.csv)
**檔案：** `stock_prices.csv`
```csv
stock_symbol,trade_date,open_price,high_price,low_price,close_price,change_amount,volume,turnover,transaction_count
2065,2025-06-02,40.0,40.05,39.5,39.8,-0.25,64000,2554000,126
2065,2025-06-03,39.7,39.95,39.7,39.95,0.15,19000,739000,55
```

**使用方式：**
- Excel 或 Google Sheets 直接開啟
- 資料分析工具匯入
- 程式語言 (Python, R) 讀取

### 3. JSON 結構化資料 (.json)
**檔案：** `stocks_data.json`
```json
{
  "export_time": "2025-06-21T17:56:25.123456",
  "stocks_count": 126,
  "prices_count": 2030,
  "stocks": [
    {
      "symbol": "2065",
      "name": "世豐",
      "exchange": "上櫃",
      "market_type": null,
      "prices": [
        {
          "trade_date": "2025-06-02",
          "open_price": 40.0,
          "high_price": 40.05,
          "low_price": 39.5,
          "close_price": 39.8,
          "change_amount": -0.25,
          "volume": 64000,
          "turnover": 2554000,
          "transaction_count": 126
        }
      ]
    }
  ]
}
```

**使用方式：**
- API 整合和資料交換
- JavaScript/Python 程式處理
- NoSQL 資料庫匯入

### 4. SQLite 資料庫 (.db)
**檔案：** `stocks_data.db`

**資料庫結構：**
```sql
-- 股票表
CREATE TABLE stocks (
    id INTEGER PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    exchange TEXT,
    market_type TEXT,
    created_at TEXT
);

-- 股價表
CREATE TABLE stock_prices (
    id INTEGER PRIMARY KEY,
    stock_id INTEGER,
    trade_date TEXT,
    open_price REAL,
    high_price REAL,
    low_price REAL,
    close_price REAL,
    change_amount REAL,
    volume INTEGER,
    turnover INTEGER,
    transaction_count INTEGER,
    FOREIGN KEY (stock_id) REFERENCES stocks (id)
);
```

**使用方式：**
```bash
# 開啟 SQLite 資料庫
sqlite3 stocks_data.db

# 查詢股票列表
.tables
SELECT * FROM stocks LIMIT 5;

# 查詢價格資料
SELECT s.symbol, s.name, p.trade_date, p.close_price 
FROM stocks s 
JOIN stock_prices p ON s.id = p.stock_id 
WHERE s.symbol = '2065' 
ORDER BY p.trade_date DESC 
LIMIT 10;
```

---

## 🔧 使用指南

### 📊 資料分析場景

#### Excel/試算表分析
```bash
# 推薦檔案：stocks.csv + stock_prices.csv
# 優點：直接開啟，支援篩選、排序、圖表
# 適用：基礎數據分析、報表製作
```

#### 程式開發整合
```bash
# 推薦檔案：stocks_data.json
# 優點：結構化資料，易於程式處理
# 適用：API 開發、資料處理腳本
```

#### 資料庫應用
```bash
# 推薦檔案：stocks_data.db 或 stock_insight_backup.sql
# 優點：完整資料庫功能，支援 SQL 查詢
# 適用：資料庫應用開發、進階分析
```

#### 備份與傳輸
```bash
# 推薦檔案：stock_data_export.zip
# 優點：檔案小，包含所有格式
# 適用：資料備份、跨系統傳輸
```

### 🔍 資料查詢範例

#### 查詢特定股票
```sql
-- SQLite 查詢
SELECT * FROM stocks WHERE symbol = '2065';
```

#### 查詢最新價格
```sql
-- 查詢所有股票最新收盤價
SELECT s.symbol, s.name, p.close_price, p.trade_date
FROM stocks s
JOIN stock_prices p ON s.id = p.stock_id
WHERE p.trade_date = (
    SELECT MAX(trade_date) 
    FROM stock_prices 
    WHERE stock_id = s.id
);
```

#### 查詢價格趨勢
```sql
-- 查詢特定股票 30 天價格走勢
SELECT trade_date, close_price, change_amount
FROM stock_prices p
JOIN stocks s ON p.stock_id = s.id
WHERE s.symbol = '2065'
ORDER BY trade_date DESC
LIMIT 30;
```

---

## 🛡️ 資料品質保證

### ✅ 完整性檢查
- [x] 所有股票都有基本資料
- [x] 價格資料完整無缺失
- [x] 外鍵關聯正確
- [x] 日期格式一致

### ✅ 一致性驗證
- [x] 跨格式資料一致
- [x] 數值精度保持
- [x] 字符編碼統一 (UTF-8)
- [x] 欄位定義統一

### ✅ 可用性確認
- [x] 所有檔案可正常開啟
- [x] SQLite 資料庫可查詢
- [x] CSV 檔案格式正確
- [x] JSON 結構有效

---

## 📞 技術支援

### 🔗 相關文檔
- [股票功能實作報告](../implementation/STOCKS_FEATURE_IMPLEMENTATION.md)
- [API 使用指南](../guides/API_GUIDE.md)
- [資料庫架構文檔](../architecture/database-schema.yaml)

### ❓ 常見問題

**Q: 如何開啟 SQLite 檔案？**
A: 使用 SQLite 客戶端工具，如 DB Browser for SQLite 或命令列工具 `sqlite3`

**Q: CSV 檔案中文顯示亂碼？**
A: 請確保使用 UTF-8 編碼開啟，Excel 使用者可選擇「資料 > 從文字檔」並指定編碼

**Q: 如何將資料匯入其他資料庫？**
A: 可使用 CSV 檔案匯入，或參考 SQL 備份檔案的結構創建表格

---

## 📋 匯出檢查清單

- [x] PostgreSQL 完整備份 - ✅ 217KB
- [x] 股票基本資料 CSV - ✅ 6.4KB  
- [x] 股票價格資料 CSV - ✅ 122KB
- [x] JSON 結構化資料 - ✅ 628KB
- [x] SQLite 資料庫檔案 - ✅ 164KB
- [x] 壓縮打包檔案 - ✅ 221KB
- [x] 資料完整性驗證 - ✅ 通過
- [x] 檔案可用性測試 - ✅ 通過
- [x] 文檔說明完整 - ✅ 完成

---

**匯出執行者：** AI Assistant  
**匯出完成時間：** 2025-06-21 17:56:25  
**資料版本：** v1.0.0 
