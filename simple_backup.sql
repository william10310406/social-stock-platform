USE StockInsight;
GO

-- 簡單備份（不使用壓縮）
BACKUP DATABASE StockInsight 
TO DISK = '/var/opt/mssql/data/StockInsight.bak'
WITH FORMAT, INIT;
GO

PRINT 'Database backup to BAK file completed!';
GO

-- 分離數據庫以取得 MDF 文件
USE master;
GO

ALTER DATABASE StockInsight SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

EXEC sp_detach_db 'StockInsight';
GO

PRINT 'Database detached! MDF file available at: /var/opt/mssql/data/StockInsight.mdf';
GO
