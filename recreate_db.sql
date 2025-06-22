-- 重新附加數據庫
CREATE DATABASE StockInsight
ON (FILENAME = '/var/opt/mssql/data/StockInsight.mdf')
LOG ON (FILENAME = '/var/opt/mssql/data/StockInsight_log.ldf')
FOR ATTACH;
GO

USE StockInsight;
GO

-- 檢查數據是否存在
SELECT COUNT(*) as user_count FROM Users;
SELECT COUNT(*) as stock_count FROM Stocks;
GO

PRINT 'Database reattached successfully!';
GO
