"""
數據庫適配器 - 處理 MSSQL 和 PostgreSQL 之間的語法差異
"""
import os
from typing import Dict, Any, Optional
from sqlalchemy import text, Column, Integer, String, DateTime, Text, Boolean, Numeric
from sqlalchemy.dialects import mssql, postgresql
from datetime import datetime


class DatabaseAdapter:
    """數據庫適配器，處理不同數據庫引擎的語法差異"""
    
    MSSQL_DIALECTS = ['mssql', 'pyodbc']
    POSTGRESQL_DIALECTS = ['postgresql', 'psycopg2']
    
    def __init__(self, engine_name: str):
        self.engine_name = engine_name.lower()
        self.is_mssql = any(dialect in self.engine_name for dialect in self.MSSQL_DIALECTS)
        self.is_postgresql = any(dialect in self.engine_name for dialect in self.POSTGRESQL_DIALECTS)
    
    @classmethod
    def from_connection_string(cls, connection_string: str):
        """從連接字符串創建適配器"""
        engine_name = connection_string.split('://')[0] if '://' in connection_string else ''
        return cls(engine_name)
    
    @classmethod
    def from_environment(cls, bind_key: Optional[str] = None):
        """從環境變數創建適配器"""
        if bind_key == 'cold':
            # 冷庫是 PostgreSQL
            return cls('postgresql')
        else:
            # 熱庫是 MSSQL
            return cls('mssql')
    
    def get_datetime_default(self) -> text:
        """獲取當前時間的數據庫函數"""
        if self.is_mssql:
            return text('GETDATE()')
        elif self.is_postgresql:
            return text('NOW()')
        else:
            return text('CURRENT_TIMESTAMP')
    
    def get_string_type(self, length: int = 255, unicode: bool = True):
        """獲取字符串類型"""
        if self.is_mssql:
            return mssql.NVARCHAR(length) if unicode else mssql.VARCHAR(length)
        elif self.is_postgresql:
            return postgresql.VARCHAR(length)
        else:
            return String(length)
    
    def get_text_type(self, unicode: bool = True):
        """獲取文本類型"""
        if self.is_mssql:
            return mssql.NTEXT() if unicode else mssql.TEXT()
        elif self.is_postgresql:
            return postgresql.TEXT()
        else:
            return Text()
    
    def get_numeric_type(self, precision: int = 10, scale: int = 2):
        """獲取數值類型"""
        if self.is_mssql:
            return mssql.NUMERIC(precision, scale)
        elif self.is_postgresql:
            return postgresql.NUMERIC(precision, scale)
        else:
            return Numeric(precision, scale)
    
    def get_datetime_type(self):
        """獲取日期時間類型"""
        if self.is_mssql:
            return mssql.DATETIME2()
        elif self.is_postgresql:
            return postgresql.TIMESTAMP()
        else:
            return DateTime()
    
    def get_boolean_type(self):
        """獲取布林類型"""
        if self.is_mssql:
            return mssql.BIT()
        elif self.is_postgresql:
            return postgresql.BOOLEAN()
        else:
            return Boolean()
    
    def get_auto_increment_column(self, name: str = 'id'):
        """獲取自增主鍵欄位"""
        if self.is_mssql:
            return Column(name, mssql.INTEGER(), primary_key=True, autoincrement=True)
        elif self.is_postgresql:
            return Column(name, postgresql.INTEGER(), primary_key=True, autoincrement=True)
        else:
            return Column(name, Integer(), primary_key=True, autoincrement=True)
    
    def format_limit_query(self, query: str, limit: int, offset: int = 0) -> str:
        """格式化分頁查詢"""
        # 驗證參數防止 SQL 注入
        if not isinstance(limit, int) or limit < 0 or limit > 10000:
            raise ValueError("limit 必須是 0-10000 之間的整數")
        if not isinstance(offset, int) or offset < 0:
            raise ValueError("offset 必須是非負整數")
            
        if self.is_mssql:
            # MSSQL 使用 OFFSET/FETCH
            return "{} ORDER BY id OFFSET {} ROWS FETCH NEXT {} ROWS ONLY".format(query, int(offset), int(limit))
        elif self.is_postgresql:
            # PostgreSQL 使用 LIMIT/OFFSET
            return "{} LIMIT {} OFFSET {}".format(query, int(limit), int(offset))
        else:
            return "{} LIMIT {} OFFSET {}".format(query, int(limit), int(offset))
    
    def get_concat_function(self, *columns) -> str:
        """獲取字符串連接函數"""
        # 驗證欄位名稱以防止 SQL 注入
        for col in columns:
            if not isinstance(col, str) or not col.replace('_', '').replace('.', '').isalnum():
                raise ValueError("欄位名稱只能包含字母、數字、底線和點號")
        
        columns_str = ', '.join(columns)
        if self.is_mssql:
            return "CONCAT({})".format(columns_str)
        elif self.is_postgresql:
            return "CONCAT({})".format(columns_str)
        else:
            return "CONCAT({})".format(columns_str)
    
    def get_date_part_function(self, part: str, column: str) -> str:
        """獲取日期部分提取函數"""
        # 驗證參數以防止 SQL 注入
        valid_parts = ['year', 'month', 'day', 'hour', 'minute', 'second', 'week', 'quarter']
        if part.lower() not in valid_parts:
            raise ValueError("part 必須是有效的日期部分: {}".format(', '.join(valid_parts)))
        if not isinstance(column, str) or not column.replace('_', '').replace('.', '').isalnum():
            raise ValueError("欄位名稱只能包含字母、數字、底線和點號")
            
        if self.is_mssql:
            return "DATEPART({}, {})".format(part, column)
        elif self.is_postgresql:
            return "EXTRACT({} FROM {})".format(part, column)
        else:
            return "EXTRACT({} FROM {})".format(part, column)
    
    def get_top_query(self, query: str, limit: int) -> str:
        """獲取TOP查詢"""
        # 嚴格驗證 limit 參數以防止 SQL 注入
        if not isinstance(limit, int) or limit < 0 or limit > 10000:
            raise ValueError("limit 必須是 0-10000 之間的整數")
        
        if self.is_mssql:
            # MSSQL 支持 TOP - 避免使用 f-string 拼接
            if not query.upper().strip().startswith('SELECT'):
                raise ValueError("查詢必須以 SELECT 開頭")
            
            # 使用字符串格式化而不是 f-string 提高安全性
            top_clause = "SELECT TOP {}".format(int(limit))
            return query.replace('SELECT', top_clause, 1)
        else:
            # 其他數據庫使用 LIMIT - 使用 format 而不是 f-string
            return "{} LIMIT {}".format(query, int(limit))
    
    def escape_identifier(self, identifier: str) -> str:
        """轉義標識符"""
        # 驗證標識符以防止 SQL 注入
        if not isinstance(identifier, str) or not identifier.replace('_', '').isalnum():
            raise ValueError("標識符只能包含字母、數字和底線")
            
        if self.is_mssql:
            return "[{}]".format(identifier)
        elif self.is_postgresql:
            return '"{}"'.format(identifier)
        else:
            return "`{}`".format(identifier)
    
    def get_full_text_search(self, column: str, search_term: str) -> str:
        """獲取全文搜索語法"""
        # 驗證參數以防止 SQL 注入
        if not isinstance(column, str) or not column.replace('_', '').replace('.', '').isalnum():
            raise ValueError("欄位名稱只能包含字母、數字、底線和點號")
        if not isinstance(search_term, str):
            raise ValueError("搜索詞必須是字符串")
        
        # 清理搜索詞，移除危險字符
        safe_search_term = search_term.replace("'", "''").replace('"', '""')
        
        if self.is_mssql:
            return "CONTAINS({}, '{}')".format(column, safe_search_term)
        elif self.is_postgresql:
            return "{} @@ to_tsquery('{}')".format(column, safe_search_term)
        else:
            return "{} LIKE '%{}%'".format(column, safe_search_term)
    
    def get_upsert_query(self, table: str, columns: Dict[str, Any], 
                        conflict_columns: list) -> str:
        """獲取 UPSERT 查詢語法"""
        if self.is_mssql:
            # MSSQL 使用 MERGE
            return self._get_mssql_merge_query(table, columns, conflict_columns)
        elif self.is_postgresql:
            # PostgreSQL 使用 ON CONFLICT
            return self._get_postgresql_upsert_query(table, columns, conflict_columns)
        else:
            # 通用的 INSERT OR REPLACE
            return self._get_generic_upsert_query(table, columns, conflict_columns)
    
    def _get_mssql_merge_query(self, table: str, columns: Dict[str, Any], 
                              conflict_columns: list) -> str:
        """生成 MSSQL MERGE 查詢"""
        # 驗證表名和欄位名
        if not isinstance(table, str) or not table.replace('_', '').isalnum():
            raise ValueError("表名只能包含字母、數字和底線")
        for key in columns.keys():
            if not isinstance(key, str) or not key.replace('_', '').isalnum():
                raise ValueError("欄位名稱只能包含字母、數字和底線")
        
        # 簡化實現，實際使用時可以擴展
        set_parts = []
        for k in columns.keys():
            set_parts.append("{} = VALUES({})".format(k, k))
        set_clause = ', '.join(set_parts)
        return "INSERT INTO {} ... ON DUPLICATE KEY UPDATE {}".format(table, set_clause)
    
    def _get_postgresql_upsert_query(self, table: str, columns: Dict[str, Any], 
                                   conflict_columns: list) -> str:
        """生成 PostgreSQL ON CONFLICT 查詢"""
        # 驗證表名和欄位名
        if not isinstance(table, str) or not table.replace('_', '').isalnum():
            raise ValueError("表名只能包含字母、數字和底線")
        for key in columns.keys():
            if not isinstance(key, str) or not key.replace('_', '').isalnum():
                raise ValueError("欄位名稱只能包含字母、數字和底線")
        for col in conflict_columns:
            if not isinstance(col, str) or not col.replace('_', '').isalnum():
                raise ValueError("衝突欄位名稱只能包含字母、數字和底線")
        
        conflict_cols = ', '.join(conflict_columns)
        set_parts = []
        for k in columns.keys():
            if k not in conflict_columns:
                set_parts.append("{} = EXCLUDED.{}".format(k, k))
        set_clause = ', '.join(set_parts)
        return "INSERT INTO {} ... ON CONFLICT ({}) DO UPDATE SET {}".format(table, conflict_cols, set_clause)
    
    def _get_generic_upsert_query(self, table: str, columns: Dict[str, Any], 
                                 conflict_columns: list) -> str:
        """生成通用 UPSERT 查詢"""
        # 驗證表名
        if not isinstance(table, str) or not table.replace('_', '').isalnum():
            raise ValueError("表名只能包含字母、數字和底線")
        return "INSERT OR REPLACE INTO {} ...".format(table)


class ModelFieldAdapter:
    """模型欄位適配器"""
    
    @staticmethod
    def create_datetime_field(bind_key: Optional[str] = None, nullable: bool = False):
        """創建適應性日期時間欄位"""
        adapter = DatabaseAdapter.from_environment(bind_key)
        return Column(
            adapter.get_datetime_type(),
            nullable=nullable,
            server_default=adapter.get_datetime_default()
        )
    
    @staticmethod
    def create_string_field(length: int = 255, bind_key: Optional[str] = None, 
                          nullable: bool = False, unicode: bool = True):
        """創建適應性字符串欄位"""
        adapter = DatabaseAdapter.from_environment(bind_key)
        return Column(
            adapter.get_string_type(length, unicode),
            nullable=nullable
        )
    
    @staticmethod
    def create_text_field(bind_key: Optional[str] = None, nullable: bool = False, 
                         unicode: bool = True):
        """創建適應性文本欄位"""
        adapter = DatabaseAdapter.from_environment(bind_key)
        return Column(
            adapter.get_text_type(unicode),
            nullable=nullable
        )
    
    @staticmethod
    def create_numeric_field(precision: int = 10, scale: int = 2, 
                           bind_key: Optional[str] = None, nullable: bool = True):
        """創建適應性數值欄位"""
        adapter = DatabaseAdapter.from_environment(bind_key)
        return Column(
            adapter.get_numeric_type(precision, scale),
            nullable=nullable
        )


# 全局適配器實例
hot_db_adapter = DatabaseAdapter('mssql')
cold_db_adapter = DatabaseAdapter('postgresql')


def get_adapter(bind_key: Optional[str] = None) -> DatabaseAdapter:
    """獲取適配器實例"""
    if bind_key == 'cold':
        return cold_db_adapter
    else:
        return hot_db_adapter


def create_cross_db_compatible_model():
    """創建跨數據庫兼容的模型裝飾器"""
    def decorator(cls):
        """為模型類添加跨數據庫兼容性"""
        # 添加適配器方法
        cls.get_adapter = classmethod(lambda cls: get_adapter(getattr(cls, '__bind_key__', None)))
        cls.get_datetime_default = classmethod(lambda cls: cls.get_adapter().get_datetime_default())
        return cls
    return decorator 