#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
股票資料導出為 JSON 格式的腳本
Stock data export to JSON format script
"""

import os
import sys
import json
import pyodbc
from datetime import datetime
from typing import List, Dict, Any

# 添加項目根目錄到路徑（動態獲取）
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(project_root, 'backend'))

try:
    from scripts.script_env import ScriptEnvironment
    env = ScriptEnvironment()
    config = env.get_environment_info()['config']
except ImportError:
    # 備用配置（如果無法導入環境模組）
    is_docker = os.getenv('DOCKER_ENV') == 'true' or os.path.exists('/.dockerenv')
    config = {
        'database': {
            'host': os.getenv('DB_HOST', 'stock-insight-db' if is_docker else '127.0.0.1'),
            'name': os.getenv('MSSQL_DATABASE', 'StockInsight'),
            'user': os.getenv('MSSQL_USER', 'sa'),
            'password': os.getenv('MSSQL_SA_PASSWORD', 'StrongPassword123!')
        }
    }

def get_db_connection():
    """獲取資料庫連接"""
    try:
        # 使用統一環境配置
        db_config = config['database']
        server = db_config['host']
        database = db_config['name']
        username = db_config['user']
        password = db_config['password']
        
        # 構建連接字符串
        conn_str = f"""
        DRIVER={{ODBC Driver 18 for SQL Server}};
        SERVER={server};
        DATABASE={database};
        UID={username};
        PWD={password};
        TrustServerCertificate=yes;
        """
        
        connection = pyodbc.connect(conn_str)
        return connection
    except Exception as e:
        print(f"❌ 資料庫連接失敗: {e}")
        return None

def export_stocks_to_json(output_dir: str) -> bool:
    """導出股票資料為 JSON 格式"""
    try:
        # 獲取資料庫連接
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        # 查詢所有股票資料
        query = """
        SELECT 
            id,
            symbol,
            name,
            exchange,
            market_type,
            created_at,
            updated_at
        FROM Stocks
        ORDER BY symbol
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # 轉換為字典列表
        stocks_data = []
        for row in rows:
            stock = {
                "id": row.id,
                "symbol": row.symbol,
                "name": row.name,
                "exchange": row.exchange,
                "market_type": row.market_type,
                "created_at": row.created_at.isoformat() if row.created_at else None,
                "updated_at": row.updated_at.isoformat() if row.updated_at else None
            }
            stocks_data.append(stock)
        
        # 創建導出的元數據
        export_metadata = {
            "export_time": datetime.now().isoformat(),
            "total_stocks": len(stocks_data),
            "source_database": "StockInsight",
            "format_version": "1.0"
        }
        
        # 按交易所分類統計
        exchange_stats = {}
        market_type_stats = {}
        
        for stock in stocks_data:
            # 統計交易所
            exchange = stock["exchange"] or "未知"
            exchange_stats[exchange] = exchange_stats.get(exchange, 0) + 1
            
            # 統計市場類型
            market_type = stock["market_type"] or "一般"
            market_type_stats[market_type] = market_type_stats.get(market_type, 0) + 1
        
        # 完整的導出結構
        export_data = {
            "metadata": export_metadata,
            "statistics": {
                "by_exchange": exchange_stats,
                "by_market_type": market_type_stats
            },
            "stocks": stocks_data
        }
        
        # 確保輸出目錄存在
        os.makedirs(output_dir, exist_ok=True)
        
        # 寫入完整的 JSON 文件
        full_json_path = os.path.join(output_dir, "stocks_complete.json")
        with open(full_json_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        # 寫入簡化的股票列表 JSON
        simple_json_path = os.path.join(output_dir, "stocks_simple.json")
        with open(simple_json_path, 'w', encoding='utf-8') as f:
            json.dump(stocks_data, f, ensure_ascii=False, indent=2)
        
        # 寫入統計資料 JSON
        stats_json_path = os.path.join(output_dir, "stocks_statistics.json")
        stats_data = {
            "metadata": export_metadata,
            "statistics": {
                "total_stocks": len(stocks_data),
                "by_exchange": exchange_stats,
                "by_market_type": market_type_stats
            }
        }
        with open(stats_json_path, 'w', encoding='utf-8') as f:
            json.dump(stats_data, f, ensure_ascii=False, indent=2)
        
        conn.close()
        
        print(f"✅ JSON 導出成功!")
        print(f"📁 導出目錄: {output_dir}")
        print(f"📄 完整資料: {full_json_path}")
        print(f"📄 簡化列表: {simple_json_path}")
        print(f"📄 統計資料: {stats_json_path}")
        print(f"📊 總股票數: {len(stocks_data)}")
        
        return True
        
    except Exception as e:
        print(f"❌ JSON 導出失敗: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("使用方法: python export_stocks_to_json.py <輸出目錄>")
        sys.exit(1)
    
    output_directory = sys.argv[1]
    success = export_stocks_to_json(output_directory)
    sys.exit(0 if success else 1) 