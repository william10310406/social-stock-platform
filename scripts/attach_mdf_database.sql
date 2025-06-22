-- 附加 MDF 文件到 SQL Server 的腳本
USE master;
GO

-- 檢查資料庫是否已存在
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'StockInsightFromMDF')
BEGIN
    PRINT 'Database StockInsightFromMDF already exists. Dropping it first...';
    ALTER DATABASE StockInsightFromMDF SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE StockInsightFromMDF;
END
GO

-- 附加 MDF 文件（假設 LDF 文件也在同一位置）
CREATE DATABASE StockInsightFromMDF ON
(FILENAME = '/mssql_backup/StockInsight.mdf'),
(FILENAME = '/mssql_backup/StockInsight_log.ldf')
FOR ATTACH;
GO

PRINT 'Database attached successfully!';

-- 切換到附加的資料庫
USE StockInsightFromMDF;
GO

-- 顯示所有表格
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
ORDER BY TABLE_SCHEMA, TABLE_NAME;
GO

PRINT 'Available tables listed above.';
GO 