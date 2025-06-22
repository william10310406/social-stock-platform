USE StockInsight;
GO

-- 創建一些測試表和數據
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE Stocks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(10) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    last_updated DATETIME2 DEFAULT GETDATE()
);
GO

-- 插入測試數據
INSERT INTO Users (username, email) VALUES 
('admin', 'admin@stockinsight.com'),
('testuser', 'test@example.com');
GO

INSERT INTO Stocks (symbol, name, price) VALUES 
('2330', '台積電', 520.00),
('2317', '鴻海', 95.50),
('2454', '聯發科', 780.00);
GO

-- 檢查數據
SELECT COUNT(*) as user_count FROM Users;
SELECT COUNT(*) as stock_count FROM Stocks;
GO

-- 備份數據庫到 MDF 文件
BACKUP DATABASE StockInsight 
TO DISK = '/var/opt/mssql/data/StockInsight_backup.mdf'
WITH FORMAT, INIT, COMPRESSION;
GO

PRINT 'Database backup completed successfully!';
GO
