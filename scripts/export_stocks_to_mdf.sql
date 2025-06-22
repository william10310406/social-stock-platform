-- 導出股票資料庫為 MDF 文件的腳本
USE master;
GO

-- 檢查並刪除已存在的備份資料庫
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'StockExport')
BEGIN
    PRINT 'Dropping existing StockExport database...';
    ALTER DATABASE StockExport SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE StockExport;
END
GO

-- 創建新的導出資料庫
CREATE DATABASE StockExport;
GO

USE StockExport;
GO

-- 創建股票表格結構
CREATE TABLE Stocks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(20) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    exchange NVARCHAR(50),
    market_type NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- 從原始資料庫複製股票資料
INSERT INTO StockExport.dbo.Stocks (symbol, name, exchange, market_type, created_at, updated_at)
SELECT symbol, name, exchange, market_type, created_at, updated_at
FROM StockInsight.dbo.Stocks;
GO

-- 顯示複製的記錄數
SELECT COUNT(*) as '導出股票數量' FROM Stocks;
GO

-- 備份資料庫到 MDF 文件
BACKUP DATABASE StockExport 
TO DISK = '/exports/StockExport.bak'
WITH FORMAT, INIT, COMPRESSION;
GO

-- 分離資料庫以獲取 MDF 文件
USE master;
GO

ALTER DATABASE StockExport SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

EXEC sp_detach_db 'StockExport';
GO

PRINT 'Stock database exported successfully!';
PRINT 'MDF file location: /var/opt/mssql/data/StockExport.mdf';
PRINT 'LDF file location: /var/opt/mssql/data/StockExport_log.ldf';
GO 