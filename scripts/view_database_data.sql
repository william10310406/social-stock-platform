-- 查看附加資料庫中所有資料的腳本
USE StockInsightFromMDF;
GO

PRINT '=== 資料庫概覽 ===';

-- 顯示資料庫大小和基本信息
SELECT 
    DB_NAME() as DatabaseName,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE') as TableCount,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS) as ViewCount;
GO

PRINT '=== 所有表格及其記錄數 ===';

-- 動態生成查詢來顯示每個表的記錄數
DECLARE @sql NVARCHAR(MAX) = '';
DECLARE @tableName NVARCHAR(128);

DECLARE table_cursor CURSOR FOR
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @tableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = @sql + 'SELECT ''' + @tableName + ''' as TableName, COUNT(*) as RecordCount FROM [' + @tableName + '] UNION ALL ';
    FETCH NEXT FROM table_cursor INTO @tableName;
END

CLOSE table_cursor;
DEALLOCATE table_cursor;

-- 移除最後的 UNION ALL
IF LEN(@sql) > 0
BEGIN
    SET @sql = LEFT(@sql, LEN(@sql) - 10);
    SET @sql = @sql + ' ORDER BY TableName;';
    EXEC sp_executesql @sql;
END
GO

PRINT '=== 表格結構信息 ===';

-- 顯示所有表格的列信息
SELECT 
    c.TABLE_NAME,
    c.COLUMN_NAME,
    c.DATA_TYPE,
    c.IS_NULLABLE,
    c.COLUMN_DEFAULT,
    CASE 
        WHEN pk.COLUMN_NAME IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END as IS_PRIMARY_KEY
FROM INFORMATION_SCHEMA.COLUMNS c
LEFT JOIN (
    SELECT ku.TABLE_NAME, ku.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
        ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
        AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
) pk ON c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;
GO

PRINT '=== 查詢完成 ===';
PRINT '要查看特定表格的資料，請使用: SELECT * FROM [表格名稱];';
GO 