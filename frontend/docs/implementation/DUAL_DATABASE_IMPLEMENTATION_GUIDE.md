# Stock Insight Platform - 雙資料庫實施指南

## 🎯 概覽

本指南詳細說明如何在 Stock Insight Platform 中實施冷熱數據分離型雙資料庫架構。

### 📊 架構概述
- **熱資料庫**: MSSQL Server 2022 (高性能即時數據)
- **冷資料庫**: PostgreSQL 14 (歷史數據和分析)
- **分離策略**: 以30天為界限進行冷熱數據分離

---

## 🚀 Phase 1: 基礎設施配置

### 1.1 Docker Compose 擴展

更新 `docker-compose.yml` 添加冷資料庫：

```yaml
services:
  # 現有的熱資料庫 (重命名)
  hot-db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: stock-insight-hot-db
    ports:
      - "1433:1433"
    env_file:
      - .env
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=${MSSQL_SA_PASSWORD}
      - MSSQL_PID=Express
    volumes:
      - hot_db_data:/var/opt/mssql
      - ./mssql_backup:/mssql_backup
    networks:
      - stock-insight-net
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'

  # 新增的冷資料庫
  cold-db:
    image: postgres:14
    container_name: stock-insight-cold-db
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=${POSTGRES_COLD_DATABASE}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - cold_db_data:/var/lib/postgresql/data
      - ./postgres_backup:/postgres_backup
    networks:
      - stock-insight-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'

volumes:
  hot_db_data:
  cold_db_data:
```

### 1.2 環境變數配置

更新 `.env` 文件：

```bash
# 熱資料庫 (MSSQL)
MSSQL_HOST=stock-insight-hot-db
MSSQL_PORT=1433
MSSQL_HOT_DATABASE=StockInsight_Hot
MSSQL_USER=sa
MSSQL_SA_PASSWORD=YourStrongPassword123!

# 冷資料庫 (PostgreSQL)
POSTGRES_HOST=stock-insight-cold-db
POSTGRES_PORT=5432
POSTGRES_COLD_DATABASE=StockInsight_Cold
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YourColdDbPassword123!

# 數據庫配置環境
FLASK_CONFIG=dual_database
```

---

## 🔧 Phase 2: Flask 配置更新

### 2.1 配置類擴展

更新 `backend/app/config.py`：

```python
class DualDatabaseConfig(Config):
    """雙資料庫配置"""
    DEBUG = True
    
    # 主資料庫 (熱資料庫 - MSSQL)
    SQLALCHEMY_DATABASE_URI = (
        f"mssql+pyodbc://{os.environ.get('MSSQL_USER', 'sa')}:"
        f"{os.environ.get('MSSQL_SA_PASSWORD')}@"
        f"{os.environ.get('MSSQL_HOST', 'localhost')}:"
        f"{os.environ.get('MSSQL_PORT', '1433')}/"
        f"{os.environ.get('MSSQL_HOT_DATABASE', 'StockInsight_Hot')}"
        f"?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
    )
    
    # 數據庫綁定配置
    SQLALCHEMY_BINDS = {
        'hot': SQLALCHEMY_DATABASE_URI,  # 熱資料庫
        'cold': (
            f"postgresql://{os.environ.get('POSTGRES_USER', 'postgres')}:"
            f"{os.environ.get('POSTGRES_PASSWORD')}@"
            f"{os.environ.get('POSTGRES_HOST', 'localhost')}:"
            f"{os.environ.get('POSTGRES_PORT', '5432')}/"
            f"{os.environ.get('POSTGRES_COLD_DATABASE', 'StockInsight_Cold')}"
        )
    }
    
    # 連接池配置
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,
        'max_overflow': 30,
        'pool_timeout': 30,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
    
    # 綁定特定配置
    SQLALCHEMY_BINDS_ENGINE_OPTIONS = {
        'cold': {
            'pool_size': 10,
            'max_overflow': 20,
            'pool_timeout': 60,
            'pool_recycle': 7200,
            'pool_pre_ping': True
        }
    }

# 更新配置字典
config = {
    "development": DevelopmentConfig,
    "development_mssql": DevelopmentMSSQLConfig,
    "dual_database": DualDatabaseConfig,  # 新增
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
```

### 2.2 模型綁定設置

創建新的模型文件 `backend/app/models_cold.py`：

```python
"""冷資料庫模型定義"""
from datetime import datetime
from .extensions import db


class MessageArchive(db.Model):
    """聊天記錄歷史檔案"""
    __bind_key__ = 'cold'
    __tablename__ = 'messages_archive'
    
    id = db.Column(db.Integer, primary_key=True)
    original_id = db.Column(db.Integer, nullable=False)  # 原始熱庫ID
    conversation_id = db.Column(db.Integer, nullable=False)
    sender_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    archived_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.original_id,  # 返回原始ID保持一致性
            'conversation_id': self.conversation_id,
            'sender_id': self.sender_id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'from_archive': True
        }


class PostArchive(db.Model):
    """貼文歷史檔案"""
    __bind_key__ = 'cold'
    __tablename__ = 'posts_archive'
    
    id = db.Column(db.Integer, primary_key=True)
    original_id = db.Column(db.Integer, nullable=False)
    author_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    archived_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.original_id,
            'author_id': self.author_id,
            'title': self.title,
            'body': self.body,
            'created_at': self.created_at.isoformat(),
            'from_archive': True
        }


class StockPriceHistory(db.Model):
    """股價歷史數據"""
    __bind_key__ = 'cold'
    __tablename__ = 'stock_prices_history'
    
    id = db.Column(db.Integer, primary_key=True)
    original_id = db.Column(db.Integer, nullable=False)
    stock_id = db.Column(db.Integer, nullable=False)
    trade_date = db.Column(db.Date, nullable=False)
    open_price = db.Column(db.Numeric(10, 2))
    high_price = db.Column(db.Numeric(10, 2))
    low_price = db.Column(db.Numeric(10, 2))
    close_price = db.Column(db.Numeric(10, 2))
    change_amount = db.Column(db.Numeric(10, 2))
    volume = db.Column(db.BigInteger)
    turnover = db.Column(db.BigInteger)
    transaction_count = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, nullable=False)
    archived_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 唯一約束
    __table_args__ = (
        db.UniqueConstraint('stock_id', 'trade_date', name='uq_stock_date_archive'),
    )
    
    def to_dict(self):
        return {
            'id': self.original_id,
            'stock_id': self.stock_id,
            'trade_date': self.trade_date.isoformat(),
            'open_price': float(self.open_price) if self.open_price else None,
            'high_price': float(self.high_price) if self.high_price else None,
            'low_price': float(self.low_price) if self.low_price else None,
            'close_price': float(self.close_price) if self.close_price else None,
            'change_amount': float(self.change_amount) if self.change_amount else None,
            'volume': self.volume,
            'turnover': self.turnover,
            'transaction_count': self.transaction_count,
            'from_archive': True
        }


class UserBehaviorAnalytics(db.Model):
    """用戶行為分析數據"""
    __bind_key__ = 'cold'
    __tablename__ = 'user_behavior_analytics'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    action_type = db.Column(db.String(50), nullable=False)  # login, post, chat, etc.
    action_count = db.Column(db.Integer, default=1)
    analysis_date = db.Column(db.Date, nullable=False)
    metadata = db.Column(db.JSON)  # 額外的分析數據
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action_type': self.action_type,
            'action_count': self.action_count,
            'analysis_date': self.analysis_date.isoformat(),
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat()
        }
```

---

## 🔄 Phase 3: 數據遷移腳本

### 3.1 創建遷移腳本

創建 `backend/scripts/data_archival.py`：

```python
#!/usr/bin/env python3
"""
數據歸檔腳本 - 將熱資料庫中的歷史數據遷移到冷資料庫
"""
import os
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# 添加項目路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import Message, Post, StockPrice
from app.models_cold import MessageArchive, PostArchive, StockPriceHistory


class DataArchival:
    def __init__(self):
        self.app = create_app('dual_database')
        self.app_context = self.app.app_context()
        self.cutoff_date = datetime.utcnow() - timedelta(days=30)
    
    def __enter__(self):
        self.app_context.push()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.app_context.pop()
    
    def archive_messages(self):
        """歸檔聊天記錄"""
        print(f"🔄 開始歸檔聊天記錄 (早於 {self.cutoff_date.date()})")
        
        # 查詢需要歸檔的記錄
        old_messages = Message.query.filter(
            Message.created_at < self.cutoff_date
        ).all()
        
        archived_count = 0
        for msg in old_messages:
            # 檢查是否已歸檔
            existing = MessageArchive.query.filter_by(
                original_id=msg.id
            ).first()
            
            if not existing:
                # 創建歸檔記錄
                archive = MessageArchive(
                    original_id=msg.id,
                    conversation_id=msg.conversation_id,
                    sender_id=msg.sender_id,
                    content=msg.content,
                    created_at=msg.created_at
                )
                db.session.add(archive)
                archived_count += 1
        
        # 提交歸檔
        db.session.commit()
        
        if archived_count > 0:
            # 刪除已歸檔的熱數據
            Message.query.filter(
                Message.created_at < self.cutoff_date
            ).delete()
            db.session.commit()
        
        print(f"✅ 完成聊天記錄歸檔: {archived_count} 條記錄")
        return archived_count
    
    def archive_posts(self):
        """歸檔貼文"""
        print(f"🔄 開始歸檔貼文 (早於 {self.cutoff_date.date()})")
        
        old_posts = Post.query.filter(
            Post.created_at < self.cutoff_date
        ).all()
        
        archived_count = 0
        for post in old_posts:
            existing = PostArchive.query.filter_by(
                original_id=post.id
            ).first()
            
            if not existing:
                archive = PostArchive(
                    original_id=post.id,
                    author_id=post.author_id,
                    title=post.title,
                    body=post.body,
                    created_at=post.created_at
                )
                db.session.add(archive)
                archived_count += 1
        
        db.session.commit()
        
        if archived_count > 0:
            # 注意：需要處理關聯的評論和按讚
            Post.query.filter(
                Post.created_at < self.cutoff_date
            ).delete()
            db.session.commit()
        
        print(f"✅ 完成貼文歸檔: {archived_count} 條記錄")
        return archived_count
    
    def archive_stock_prices(self):
        """歸檔股價數據"""
        print(f"🔄 開始歸檔股價數據 (早於 {self.cutoff_date.date()})")
        
        old_prices = StockPrice.query.filter(
            StockPrice.trade_date < self.cutoff_date.date()
        ).all()
        
        archived_count = 0
        for price in old_prices:
            existing = StockPriceHistory.query.filter_by(
                original_id=price.id
            ).first()
            
            if not existing:
                archive = StockPriceHistory(
                    original_id=price.id,
                    stock_id=price.stock_id,
                    trade_date=price.trade_date,
                    open_price=price.open_price,
                    high_price=price.high_price,
                    low_price=price.low_price,
                    close_price=price.close_price,
                    change_amount=price.change_amount,
                    volume=price.volume,
                    turnover=price.turnover,
                    transaction_count=price.transaction_count,
                    created_at=price.created_at
                )
                db.session.add(archive)
                archived_count += 1
        
        db.session.commit()
        
        if archived_count > 0:
            StockPrice.query.filter(
                StockPrice.trade_date < self.cutoff_date.date()
            ).delete()
            db.session.commit()
        
        print(f"✅ 完成股價數據歸檔: {archived_count} 條記錄")
        return archived_count
    
    def run_full_archival(self):
        """執行完整歸檔"""
        print("🚀 開始執行數據歸檔流程")
        start_time = datetime.utcnow()
        
        try:
            total_archived = 0
            total_archived += self.archive_messages()
            total_archived += self.archive_posts()
            total_archived += self.archive_stock_prices()
            
            duration = datetime.utcnow() - start_time
            print(f"🎉 歸檔完成! 總計歸檔 {total_archived} 條記錄，耗時 {duration}")
            
            return True
        except Exception as e:
            print(f"❌ 歸檔過程中出現錯誤: {e}")
            db.session.rollback()
            return False


def main():
    """主函數"""
    with DataArchival() as archival:
        success = archival.run_full_archival()
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
```

### 3.2 創建自動化定時任務

創建 `scripts/setup_archival_cron.sh`：

```bash
#!/bin/bash
"""
設置數據歸檔定時任務
"""

set -e

echo "🔧 設置數據歸檔定時任務..."

# 創建日誌目錄
mkdir -p /app/logs/archival

# 設置 cron 任務 (每日凌晨 2:00 執行)
CRON_JOB="0 2 * * * cd /app && python backend/scripts/data_archival.py >> /app/logs/archival/archival.log 2>&1"

# 檢查是否已存在
if crontab -l 2>/dev/null | grep -q "data_archival.py"; then
    echo "⚠️  定時任務已存在"
else
    # 添加到 crontab
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ 定時任務已設置: 每日凌晨 2:00 執行數據歸檔"
fi

echo "📋 當前 cron 任務:"
crontab -l 2>/dev/null | grep -E "(data_archival|#)" || echo "沒有相關任務"
```

---

## 🔍 Phase 4: 服務層適配

### 4.1 統一查詢服務

創建 `backend/app/services/dual_database_service.py`：

```python
"""
雙資料庫統一查詢服務
"""
from datetime import datetime, timedelta
from sqlalchemy import and_, or_
from ..extensions import db
from ..models import Message, Post, StockPrice
from ..models_cold import MessageArchive, PostArchive, StockPriceHistory


class DualDatabaseService:
    """雙資料庫統一查詢服務"""
    
    @staticmethod
    def get_messages_unified(conversation_id, limit=50, offset=0):
        """統一查詢聊天記錄 (熱庫 + 冷庫)"""
        # 先查詢熱庫
        hot_messages = Message.query.filter_by(
            conversation_id=conversation_id
        ).order_by(Message.created_at.desc()).limit(limit).offset(offset).all()
        
        # 如果熱庫數據不足，查詢冷庫
        if len(hot_messages) < limit:
            remaining = limit - len(hot_messages)
            cold_messages = MessageArchive.query.filter_by(
                conversation_id=conversation_id
            ).order_by(MessageArchive.created_at.desc()).limit(remaining).all()
            
            # 合併結果
            all_messages = [msg.to_dict() for msg in hot_messages] + \
                          [msg.to_dict() for msg in cold_messages]
        else:
            all_messages = [msg.to_dict() for msg in hot_messages]
        
        # 按時間排序
        all_messages.sort(key=lambda x: x['created_at'], reverse=True)
        return all_messages
    
    @staticmethod
    def get_stock_prices_unified(stock_id, start_date=None, end_date=None):
        """統一查詢股價數據"""
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=365)
        if not end_date:
            end_date = datetime.utcnow()
        
        # 查詢熱庫 (最近30天)
        hot_cutoff = datetime.utcnow() - timedelta(days=30)
        hot_prices = StockPrice.query.filter(
            and_(
                StockPrice.stock_id == stock_id,
                StockPrice.trade_date >= start_date.date(),
                StockPrice.trade_date <= end_date.date(),
                StockPrice.trade_date >= hot_cutoff.date()
            )
        ).order_by(StockPrice.trade_date.desc()).all()
        
        # 查詢冷庫 (30天以前)
        cold_prices = StockPriceHistory.query.filter(
            and_(
                StockPriceHistory.stock_id == stock_id,
                StockPriceHistory.trade_date >= start_date.date(),
                StockPriceHistory.trade_date <= end_date.date(),
                StockPriceHistory.trade_date < hot_cutoff.date()
            )
        ).order_by(StockPriceHistory.trade_date.desc()).all()
        
        # 合併結果
        all_prices = [price.to_dict() for price in hot_prices] + \
                    [price.to_dict() for price in cold_prices]
        
        # 按日期排序
        all_prices.sort(key=lambda x: x['trade_date'], reverse=True)
        return all_prices
    
    @staticmethod
    def get_posts_unified(limit=20, offset=0):
        """統一查詢貼文"""
        # 先查詢熱庫
        hot_posts = Post.query.order_by(
            Post.created_at.desc()
        ).limit(limit).offset(offset).all()
        
        # 如果需要更多數據，查詢冷庫
        if len(hot_posts) < limit:
            remaining = limit - len(hot_posts)
            cold_posts = PostArchive.query.order_by(
                PostArchive.created_at.desc()
            ).limit(remaining).all()
            
            all_posts = [post.to_dict() for post in hot_posts] + \
                       [post.to_dict() for post in cold_posts]
        else:
            all_posts = [post.to_dict() for post in hot_posts]
        
        return all_posts
    
    @staticmethod
    def search_messages_unified(conversation_id, keyword):
        """跨庫搜索聊天記錄"""
        # 搜索熱庫
        hot_results = Message.query.filter(
            and_(
                Message.conversation_id == conversation_id,
                Message.content.contains(keyword)
            )
        ).all()
        
        # 搜索冷庫
        cold_results = MessageArchive.query.filter(
            and_(
                MessageArchive.conversation_id == conversation_id,
                MessageArchive.content.contains(keyword)
            )
        ).all()
        
        # 合併結果
        all_results = [msg.to_dict() for msg in hot_results] + \
                     [msg.to_dict() for msg in cold_results]
        
        # 按時間排序
        all_results.sort(key=lambda x: x['created_at'], reverse=True)
        return all_results
```

### 4.2 API 端點更新

更新 `backend/app/blueprints/chat.py`：

```python
from ..services.dual_database_service import DualDatabaseService

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['GET'])
@token_required
def get_messages(current_user, conversation_id):
    """獲取聊天記錄 (統一查詢熱庫和冷庫)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    offset = (page - 1) * per_page
    
    try:
        # 使用統一查詢服務
        messages = DualDatabaseService.get_messages_unified(
            conversation_id, limit=per_page, offset=offset
        )
        
        return jsonify({
            'success': True,
            'messages': messages,
            'page': page,
            'per_page': per_page,
            'total': len(messages)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'獲取聊天記錄失敗: {str(e)}'
        }), 500
```

---

## 🧪 Phase 5: 測試和驗證

### 5.1 創建測試腳本

創建 `backend/tests/test_dual_database.py`：

```python
"""
雙資料庫測試
"""
import unittest
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models import Message, StockPrice
from app.models_cold import MessageArchive, StockPriceHistory
from app.services.dual_database_service import DualDatabaseService


class TestDualDatabase(unittest.TestCase):
    
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_hot_cold_data_separation(self):
        """測試冷熱數據分離"""
        # 創建熱數據
        hot_date = datetime.utcnow() - timedelta(days=10)
        hot_message = Message(
            conversation_id=1,
            sender_id=1,
            content="熱數據測試",
            created_at=hot_date
        )
        db.session.add(hot_message)
        
        # 創建冷數據
        cold_date = datetime.utcnow() - timedelta(days=40)
        cold_message = MessageArchive(
            original_id=999,
            conversation_id=1,
            sender_id=1,
            content="冷數據測試",
            created_at=cold_date
        )
        db.session.add(cold_message)
        db.session.commit()
        
        # 測試統一查詢
        messages = DualDatabaseService.get_messages_unified(1)
        self.assertEqual(len(messages), 2)
        
        # 驗證數據來源
        hot_found = any(msg['content'] == "熱數據測試" for msg in messages)
        cold_found = any(msg['content'] == "冷數據測試" and msg.get('from_archive') for msg in messages)
        
        self.assertTrue(hot_found)
        self.assertTrue(cold_found)
    
    def test_database_binding(self):
        """測試數據庫綁定"""
        # 測試熱庫綁定
        self.assertEqual(Message.__bind_key__, None)  # 默認庫
        
        # 測試冷庫綁定
        self.assertEqual(MessageArchive.__bind_key__, 'cold')
        self.assertEqual(StockPriceHistory.__bind_key__, 'cold')


if __name__ == '__main__':
    unittest.main()
```

---

## 📊 監控和維護

### 監控指標
1. **熱庫性能**: 查詢響應時間 < 100ms
2. **冷庫存儲**: 壓縮率和存儲使用率
3. **數據遷移**: 每日歸檔成功率
4. **跨庫查詢**: 統一查詢性能

### 維護任務
1. **每日**: 自動數據歸檔
2. **每週**: 冷庫壓縮和統計更新
3. **每月**: 性能分析和優化建議

---

## 🎯 成功指標

- ✅ 熱庫查詢響應時間提升 50%
- ✅ 存儲成本降低 30%
- ✅ 備份時間縮短 60%
- ✅ 系統可擴展性顯著提升

---

## 📝 注意事項

1. **數據一致性**: 確保歸檔過程中的事務一致性
2. **回滾計劃**: 準備緊急回滾到單庫模式的方案
3. **監控告警**: 設置關鍵指標的監控告警
4. **性能測試**: 定期進行性能基準測試

這個實施指南提供了完整的雙資料庫架構實施路徑，確保平穩過渡和高效運行。 