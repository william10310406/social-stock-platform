USE StockInsight;
GO

-- 備份完整資料庫
BACKUP DATABASE StockInsight 
TO DISK = '/var/opt/mssql/backup/StockInsight_Export.bak'
WITH FORMAT, INIT, COMPRESSION;
GO

PRINT 'Database backup completed successfully!';
GO
