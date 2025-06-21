# 後端開發規則

## 📋 概述

本文檔規定了 Stock Insight Platform 後端開發的強制性規則和最佳實踐。所有開發者必須嚴格遵循這些規則。

---

## 🛠️ 架構規則

### Flask 應用結構

#### 1. 應用工廠模式
- **MUST**: 使用 `create_app()` 工廠函數創建應用
- **MUST**: 配置通過 `app/config.py` 統一管理
- **MUST**: 藍圖（Blueprint）模組化組織功能

```python
# ✅ 正確做法
from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)

# ❌ 禁止做法
from flask import Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'hardcoded-secret'
```

#### 2. 模組組織規範
```
app/
├── __init__.py          # 應用工廠
├── config.py            # 配置管理
├── models.py            # 數據模型
├── extensions.py        # 擴展初始化
├── utils.py             # 工具函數
├── decorators.py        # 裝飾器
└── blueprints/          # 功能藍圖
    ├── auth.py          # 認證功能
    ├── chat.py          # 聊天功能
    ├── stocks.py        # 股票功能
    └── ...
```

#### 3. 配置管理
- **MUST**: 所有配置項定義在 `config.py` 中
- **MUST**: 敏感配置使用環境變數
- **MUST**: 提供開發、測試、生產環境配置

---

## 🐳 Docker 兼容性規則

### 環境配置模組

#### 1. 統一環境檢測
- **MUST**: 所有腳本使用 `scripts/script_env.py` 環境配置
- **MUST**: 支持本地和 Docker 環境自動切換
- **MUST**: 動態配置主機、端口和服務發現

```python
# ✅ 正確做法
from scripts.script_env import ScriptEnvironment

env = ScriptEnvironment()
config = env.env_config

database_url = config['urls']['database']
redis_url = config['urls']['redis']

# ❌ 禁止做法
DATABASE_URL = "postgresql://user:pass@localhost:5432/db"
REDIS_URL = "redis://localhost:6379/0"
```

#### 2. 多層環境檢測
- **檔案檢測**: `/.dockerenv` 文件存在性
- **環境變數**: `NODE_ENV=docker`, `DOCKER_ENV=true`
- **容器名稱**: URL 包含容器服務名
- **主機名**: Docker 容器主機名模式

### 環境變數規範

#### 1. 標準環境變數
```bash
# 應用配置
FLASK_ENV=development|docker|production
FLASK_DEBUG=true|false
SECRET_KEY=your-secret-key

# 數據庫配置
DATABASE_URL=postgresql://user:pass@host:port/dbname
DB_HOST=localhost|db
DB_PORT=5432
DB_NAME=stock_insight
DB_USER=stock_user
DB_PASSWORD=stock_password123

# Redis 配置
REDIS_URL=redis://host:port/db
REDIS_HOST=localhost|redis
REDIS_PORT=6379

# 服務配置
BACKEND_PORT=5000
FRONTEND_URL=http://frontend:5173
```

#### 2. Docker Compose 配置
```yaml
services:
  backend:
    environment:
      - NODE_ENV=docker
      - FLASK_ENV=docker
      - DATABASE_URL=postgresql://stock_user:stock_password123@db:5432/stock_insight
      - REDIS_URL=redis://redis:6379/0
      - BACKEND_PORT=5000
```

---

## 🔧 腳本開發規則

### 腳本環境兼容性

#### 1. 環境配置模組使用
```python
#!/usr/bin/env python3
import sys
import os

# 添加項目根目錄到路徑
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# 導入環境配置
try:
    from scripts.script_env import ScriptEnvironment
except ImportError:
    # 向後兼容的備用導入
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    from script_env import ScriptEnvironment
```

#### 2. 腳本分類規範

**管理腳本**：
- `healthcheck.py` - 健康檢查
- `run_socketio.py` - Socket.IO 啟動
- `db_manager.py` - 資料庫管理

**環境腳本**：
- `script_env.py` - 環境配置模組

#### 3. 錯誤處理標準
- **退出代碼**: 0=成功，1=一般錯誤，2=配置錯誤
- **日誌級別**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **異常處理**: 捕獲並記錄所有異常

### 腳本執行規範

#### 1. 命令行參數
```python
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='健康檢查腳本')
    parser.add_argument('--docker', action='store_true', help='Docker 環境模式')
    parser.add_argument('--debug', action='store_true', help='調試模式')
    
    args = parser.parse_args()
```

#### 2. 環境信息顯示
```python
def main():
    env = ScriptEnvironment()
    env.print_environment_info()
    
    # 根據環境執行相應邏輯
    if env.docker_config['is_docker']:
        # Docker 環境特殊處理
        pass
```

---

## 🗄️ 資料庫規則

### SQLAlchemy 模型規範

#### 1. 模型定義
```python
from app.extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }
```

#### 2. 遷移管理
- **MUST**: 使用 Flask-Migrate 管理資料庫遷移
- **MUST**: 每次模型變更創建新遷移
- **MUST**: 遷移文件包含描述性註釋

```bash
# 創建遷移
flask db migrate -m "添加用戶表"

# 應用遷移
flask db upgrade

# 檢查當前版本
flask db current
```

### 查詢優化規則

#### 1. 查詢性能
- **MUST**: 為外鍵添加索引
- **MUST**: 使用 `select_related` 減少 N+1 查詢
- **MUST**: 大數據集使用分頁

#### 2. 事務管理
```python
from app.extensions import db

# ✅ 正確的事務處理
try:
    user = User(username='test')
    db.session.add(user)
    db.session.commit()
except Exception as e:
    db.session.rollback()
    raise e
```

---

## 🌐 API 設計規則

### RESTful API 規範

#### 1. URL 設計
```python
# ✅ 正確的 RESTful 設計
GET    /api/users          # 獲取用戶列表
GET    /api/users/{id}     # 獲取特定用戶
POST   /api/users          # 創建用戶
PUT    /api/users/{id}     # 更新用戶
DELETE /api/users/{id}     # 刪除用戶

# ❌ 錯誤設計
GET    /api/get-users
POST   /api/create-user
```

#### 2. 響應格式
```python
# 統一響應格式
{
    "success": true,
    "data": {...},
    "message": "操作成功",
    "timestamp": "2024-12-01T12:00:00Z"
}

# 錯誤響應格式
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "請求參數無效",
        "details": {...}
    },
    "timestamp": "2024-12-01T12:00:00Z"
}
```

#### 3. 狀態碼規範
- **200**: 成功
- **201**: 創建成功
- **400**: 請求錯誤
- **401**: 未授權
- **403**: 禁止訪問
- **404**: 資源不存在
- **500**: 服務器錯誤

### 認證和授權

#### 1. JWT 認證
```python
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

@auth_bp.route('/login', methods=['POST'])
def login():
    # 驗證用戶憑證
    access_token = create_access_token(identity=user.id)
    return {'access_token': access_token}

@api_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    return {'user_id': current_user_id}
```

#### 2. 權限檢查
```python
from functools import wraps
from flask_jwt_extended import get_jwt_identity

def require_role(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.role != role:
                return {'error': '權限不足'}, 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
```

---

## 🔗 Socket.IO 規則

### 實時通信規範

#### 1. 事件命名
```python
# ✅ 標準事件命名
@socketio.on('user_join_chat')
@socketio.on('user_leave_chat')
@socketio.on('send_message')
@socketio.on('typing_start')
@socketio.on('typing_stop')

# ❌ 不規範命名
@socketio.on('join')
@socketio.on('msg')
@socketio.on('type')
```

#### 2. 事件處理器
```python
@socketio.on('send_message')
def handle_message(data):
    try:
        # 驗證數據
        if not data.get('message') or not data.get('room'):
            emit('error', {'message': '無效的消息數據'})
            return
        
        # 處理業務邏輯
        message = create_message(data)
        
        # 廣播消息
        emit('new_message', message.to_dict(), room=data['room'])
        
    except Exception as e:
        logger.error(f"處理消息失敗: {e}")
        emit('error', {'message': '消息發送失敗'})
```

#### 3. 連接管理
```python
# 連接管理
connected_users = {}

@socketio.on('connect')
def handle_connect():
    user_id = get_jwt_identity()
    if user_id:
        connected_users[request.sid] = user_id
        emit('user_connected', {'user_id': user_id}, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    user_id = connected_users.pop(request.sid, None)
    if user_id:
        emit('user_disconnected', {'user_id': user_id}, broadcast=True)
```

---

## 🧪 測試規則

### 測試結構

#### 1. 測試組織
```
tests/
├── __init__.py
├── conftest.py          # pytest 配置
├── test_auth.py         # 認證測試
├── test_api.py          # API 測試
├── test_models.py       # 模型測試
├── test_socketio.py     # Socket.IO 測試
└── fixtures/            # 測試數據
```

#### 2. 測試類型
- **單元測試**: 測試單個函數或類
- **整合測試**: 測試模組間交互
- **API 測試**: 測試 HTTP 端點
- **Socket.IO 測試**: 測試實時功能

### 測試編寫規範

#### 1. 測試函數命名
```python
def test_user_registration_success():
    """測試用戶註冊成功流程"""
    pass

def test_user_registration_duplicate_email():
    """測試用戶註冊重複郵箱錯誤"""
    pass
```

#### 2. 測試數據管理
```python
import pytest
from app import create_app, db
from app.models import User

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def user():
    return User(username='test', email='test@example.com')
```

---

## 📝 日誌和監控規則

### 日誌管理

#### 1. 日誌配置
```python
import logging
from logging.handlers import RotatingFileHandler

def configure_logging(app):
    if not app.debug:
        file_handler = RotatingFileHandler(
            'logs/app.log', maxBytes=10240, backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
```

#### 2. 日誌使用
```python
import logging

logger = logging.getLogger(__name__)

# ✅ 適當的日誌記錄
logger.info(f"用戶 {user.id} 登入成功")
logger.warning(f"用戶 {user.id} 登入失敗，原因：{error}")
logger.error(f"資料庫連接失敗: {e}")

# ❌ 避免敏感信息
logger.info(f"用戶密碼: {password}")  # 禁止記錄密碼
```

### 性能監控

#### 1. 響應時間監控
```python
import time
from functools import wraps

def monitor_performance(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        result = f(*args, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        if execution_time > 1.0:  # 超過1秒記錄警告
            logger.warning(f"{f.__name__} 執行時間: {execution_time:.2f}s")
        
        return result
    return decorated_function
```

---

## 🔒 安全規則

### 資料驗證

#### 1. 輸入驗證
```python
from marshmallow import Schema, fields, validate

class UserRegistrationSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))

# 使用驗證
@auth_bp.route('/register', methods=['POST'])
def register():
    schema = UserRegistrationSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as e:
        return {'errors': e.messages}, 400
```

#### 2. SQL 注入防護
```python
# ✅ 使用參數化查詢
user = User.query.filter(User.username == username).first()

# ❌ 避免字符串拼接
query = f"SELECT * FROM users WHERE username = '{username}'"  # 危險
```

### 認證安全

#### 1. 密碼處理
```python
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    password_hash = db.Column(db.String(255))
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
```

#### 2. CORS 配置
```python
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # 配置 CORS
    CORS(app, origins=['http://localhost:5173', 'http://frontend:5173'])
    
    return app
```

---

## 🚀 部署規則

### 容器化規範

#### 1. Dockerfile 最佳實踐
```dockerfile
# 多階段構建
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .

CMD ["gunicorn", "--worker-class", "eventlet", "--workers", "1", "--bind", "0.0.0.0:5000", "run:app"]
```

#### 2. .dockerignore 配置
```dockerignore
# Python 快取
__pycache__/
*.pyc
*.pyo
*.pyd

# 虛擬環境
venv/
env/

# 開發文件
.env
.env.local
tests/
docs/

# Git 和 IDE
.git/
.vscode/
.idea/
```

### 生產環境配置

#### 1. 環境變數管理
```python
class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    REDIS_URL = os.environ.get('REDIS_URL')
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # 安全配置
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    PERMANENT_SESSION_LIFETIME = timedelta(hours=1)
```

#### 2. 健康檢查端點
```python
@api_bp.route('/health', methods=['GET'])
def health_check():
    try:
        # 檢查資料庫連接
        db.session.execute('SELECT 1')
        
        # 檢查 Redis 連接
        from app.extensions import redis_client
        redis_client.ping()
        
        return {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': app.config.get('VERSION', '1.0.0')
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }, 500
```

---

## ⚠️ 違規處理

### 嚴重違規 (阻止部署)
1. 硬編碼敏感配置（密碼、密鑰）
2. SQL 注入漏洞
3. 未處理的異常導致服務崩潰
4. 跳過認證檢查
5. 不兼容 Docker 環境

### 警告違規 (需要修復)
1. 缺少輸入驗證
2. 不當的日誌記錄
3. 性能問題（響應時間過長）
4. 缺少錯誤處理
5. 代碼風格不符合規範

### 檢查工具

#### 1. 自動化檢查
```bash
# 運行測試
python -m pytest tests/

# 代碼風格檢查
flake8 app/
black --check app/

# 安全掃描
bandit -r app/

# Docker 兼容性檢查
cd scripts && python script_env.py
```

#### 2. 健康檢查
```bash
# 後端健康檢查
python scripts/healthcheck.py --docker

# Socket.IO 功能檢查
python scripts/run_socketio.py --test
```

---

## 📚 參考資源

- [Flask 官方文檔](https://flask.palletsprojects.com/)
- [SQLAlchemy 文檔](https://docs.sqlalchemy.org/)
- [Flask-SocketIO 文檔](https://flask-socketio.readthedocs.io/)
- [JWT 認證指南](https://flask-jwt-extended.readthedocs.io/)
- [Docker 最佳實踐](https://docs.docker.com/develop/dev-best-practices/)

---

**規則版本**: v1.0  
**最後更新**: 2024年12月  
**適用範圍**: Stock Insight Platform 後端開發

> 💡 **提醒**: 這些規則是強制性要求，違反規則的代碼將不被接受部署。安全相關規則尤其重要，必須嚴格遵守。 
