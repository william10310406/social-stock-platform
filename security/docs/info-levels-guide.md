# INFO 層級完整架構說明文件

## 📋 概述

INFO 層級是整個資安系統的基礎層，採用四層分層架構（info_0 到 info_3），每個層級都有明確的職責和依賴關係。本文件詳細說明每個模組的功能、依賴關係和使用方式。

## 🏗️ 四層分層架構

### 整體架構圖

<pre>
┌──────────────────────────────────────────────────────────────┐
│                      INFO 四層級架構                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │            INFO-3 (系統監控和配置層級)                   │   │
│  │  ┌─────────────────┐  ┌─────────────────────────┐     │   │
│  │  │ config_manager  │  │ security_monitoring     │     │   │
│  │  └─────────────────┘  └─────────────────────────┘     │   │
│  └───────────────────────────────────────────────────────┘   │
│                         ↓ 依賴                                │
│  ┌───────────────────────────────────────────────────────┐   │
│  │            INFO-2 (日誌服務層級)                        │   │
│  │  ┌─────────────────┐                                  │   │
│  │  │ security_logger │                                  │   │
│  │  └─────────────────┘                                  │   │
│  └───────────────────────────────────────────────────────┘   │
│                         ↓ 依賴                                │
│  ┌───────────────────────────────────────────────────────┐   │
│  │            INFO-1 (基礎工具層級)                        │   │
│  │  ┌──────────────┐  ┌─────────────────────────┐        │   │
│  │  │security_utils│  │ security_exceptions     │        │   │
│  │  └──────────────┘  └─────────────────────────┘        │   │
│  └───────────────────────────────────────────────────────┘   │
│                         ↓ 依賴                                │
│  ┌───────────────────────────────────────────────────────┐   │
│  │            INFO-0 (基礎常數層級)                        │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │           security_constants                 │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
</pre>

## 📁 INFO-0 層級：基礎常數層級

### 🎯 概述
- **優先級**: 0.1（最低）
- **依賴**: 無任何依賴
- **職責**: 提供所有基礎安全常數定義

### 📄 模組詳情

#### security_constants.py
**功能**: 定義所有安全相關的常數

**主要常數**:
```python
# XSS 防護相關
XSS_DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', ...]
XSS_ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'p', 'br', ...]

# 安全事件類型
SECURITY_EVENT_TYPES = {
    'XSS_ATTEMPT': 'xss_attempt',
    'AUTH_FAILURE': 'auth_failure',
    'RATE_LIMIT_EXCEEDED': 'rate_limit_exceeded',
    ...
}

# 密碼策略
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_NUMBERS = True
PASSWORD_REQUIRE_SYMBOLS = True

# 日誌等級
LOG_LEVELS = {
    'DEBUG': 'debug',
    'INFO': 'info', 
    'WARNING': 'warning',
    'ERROR': 'error',
    'CRITICAL': 'critical'
}
```

**依賴關係**:
- 外部依賴: `typing`
- 內部依賴: 無

## 📁 INFO-1 層級：基礎工具層級

### 🎯 概述
- **優先級**: 0.2
- **依賴**: 僅依賴 INFO-0 層級
- **職責**: 提供基礎工具函數和例外處理

### 📄 模組詳情

#### 1. security_utils.py
**功能**: 提供基礎安全工具函數

**主要類別**: `SecurityUtils`

**核心方法**:
```python
@staticmethod
def generate_secure_token(length: int = 32) -> str
def generate_csrf_token() -> str
def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]
def verify_password(password: str, hashed: str, salt: str) -> bool
def sanitize_input(text: str) -> str
def is_valid_email(email: str) -> bool
def is_valid_ip(ip: str) -> bool
def validate_password_strength(password: str) -> Dict[str, bool]
def generate_api_key() -> str
def create_signature(data: str, secret: str) -> str
```

**依賴關係**:
- 外部依賴: `re`, `hashlib`, `secrets`, `hmac`, `ipaddress`, `datetime`, `typing`, `urllib.parse`
- 內部依賴: `..info_0.security_constants`

#### 2. security_exceptions.py
**功能**: 定義所有安全相關的例外類別

**主要例外類別**:
```python
class SecurityException(Exception)           # 基礎例外類
class InputValidationError(SecurityException)
class AuthenticationError(SecurityException)
class AuthorizationError(SecurityException)
class RateLimitExceededError(SecurityException)
class FileSecurityError(SecurityException)
class CryptographyError(SecurityException)
class XSSException(SecurityException)        # XSS 攻擊例外
class SQLInjectionException(SecurityException)  # SQL 注入例外
class CSRFException(SecurityException)       # CSRF 攻擊例外
```

**依賴關係**:
- 外部依賴: `typing`
- 內部依賴: 無

## 📁 INFO-2 層級：日誌服務層級

### 🎯 概述
- **優先級**: 0.3
- **依賴**: INFO-0 常數 + INFO-1 例外
- **職責**: 提供統一的安全日誌系統

### 📄 模組詳情

#### security_logger.py
**功能**: 統一的安全日誌系統

**主要類別**: `SecurityLogger`

**核心功能**:
```python
class SecurityLogger:
    def log_security_event(self, event_type: str, message: str, **kwargs)
    def log_xss_attempt(self, payload: str, **kwargs)
    def log_authentication_failure(self, username: str, **kwargs)
    def log_rate_limit_violation(self, identifier: str, **kwargs)
    def log_file_access_attempt(self, filename: str, **kwargs)
    def log_api_abuse(self, endpoint: str, **kwargs)
```

**全域函數**:
```python
def get_security_logger(name: str = "security") -> SecurityLogger
def log_security_event(event_type: str, message: str, **kwargs)
```

**依賴關係**:
- 外部依賴: `logging`, `json`, `datetime`, `typing`, `threading`, `pathlib`
- 內部依賴: 
  - `..info_0.security_constants`
  - `..info_1.security_exceptions`

**日誌格式**:
```json
{
  "timestamp": "2025-06-30T10:30:15.123456",
  "level": "WARNING",
  "message": "檢測到 XSS 攻擊嘗試",
  "module": "security_logger",
  "function": "log_xss_attempt",
  "line": 78,
  "event_type": "XSS_ATTEMPT",
  "priority": "HIGH",
  "details": {
    "user_ip": "192.168.1.100",
    "payload": "<script>alert('xss')</script>",
    "blocked": true
  }
}
```

## 📁 INFO-3 層級：系統監控和配置層級

### 🎯 概述
- **優先級**: 0.4（最高）
- **依賴**: INFO-0 常數 + INFO-1 工具/例外 + INFO-2 日誌
- **職責**: 提供配置管理和系統監控功能

### 📄 模組詳情

#### 1. config_manager.py
**功能**: 多來源配置管理系統

**主要類別**: `ConfigManager`

**核心功能**:
```python
class ConfigManager:
    def get_config(self, key: str, default: Any = None) -> Any
    def set_config(self, key: str, value: Any)
    def has_config(self, key: str) -> bool
    def add_config_source(self, name: str, source: ConfigSource)
    def reload_config(self)
    def validate_config(self) -> bool
    def export_config(self, format: str = 'json') -> str
    def watch_config_changes(self, callback: Callable)
```

**配置來源優先級**:
1. **environment (100)** - 環境變數
2. **runtime (95)** - 執行時設定
3. **main_config (50)** - 主配置檔
4. **defaults (10)** - 預設值

**全域函數**:
```python
def get_config_manager() -> ConfigManager
def get_config(key: str, default: Any = None) -> Any
def set_config(key: str, value: Any)
def has_config(key: str) -> bool
```

**依賴關係**:
- 外部依賴: `yaml`, `json`, `os`, `pathlib`, `typing`, `threading`, `datetime`
- 內部依賴: 
  - `..info_0.security_constants`
  - `..info_1.security_exceptions`
  - `..info_2.security_logger`

#### 2. security_monitoring.py
**功能**: 安全監控和指標收集系統

**主要類別**: `SecurityMonitoring`

**核心功能**:
```python
class SecurityMonitoring:
    def record_metric(self, name: str, value: float, tags: Dict = None)
    def increment_counter(self, name: str, tags: Dict = None)
    def set_gauge(self, name: str, value: float, tags: Dict = None)
    def record_timer(self, name: str, duration: float, tags: Dict = None)
    def register_health_check(self, name: str, check_func: Callable)
    def start_monitoring(self)
    def stop_monitoring(self)
    def get_dashboard_data(self) -> Dict
    def get_system_metrics(self) -> Dict
```

**監控指標類型**:
- **計數器 (Counter)**: 遞增的數值（如請求次數、錯誤次數）
- **量表 (Gauge)**: 瞬時數值（如 CPU 使用率、記憶體使用量）
- **計時器 (Timer)**: 執行時間測量（如函數執行時間）
- **健康檢查**: 系統狀態檢查（如資料庫連線、API 可用性）

**效能監控裝飾器**:
```python
@monitor_performance("function_name")
def your_function():
    # 自動記錄執行時間和成功/失敗次數
    pass

@monitor_security_event("login_attempt")
def login_user(username, password):
    # 自動記錄安全事件
    pass
```

**全域函數**:
```python
def get_monitor() -> SecurityMonitoring
def start_monitoring()
def stop_monitoring()
def monitor_performance(name: str)  # 裝飾器
def monitor_security_event(event_type: str)  # 裝飾器
```

**依賴關係**:
- 外部依賴: `psutil`, `threading`, `time`, `json`, `datetime`, `typing`, `functools`, `collections`
- 內部依賴:
  - `..info_0.security_constants`
  - `..info_1.security_exceptions`
  - `..info_2.security_logger`

## 🔗 依賴關係詳解

### 🚫 依賴規則
1. **禁止循環依賴**: 任何模組不得直接或間接依賴自己
2. **禁止向上依賴**: 低層級模組不得依賴高層級模組
3. **同層級依賴限制**: 同層級模組之間應避免相互依賴
4. **明確依賴路徑**: 使用相對導入明確指定依賴關係

### 🏗️ 具體依賴關係

```
INFO 四層架構依賴關係：

info_0 (基礎常數層級):
└── security_constants (無內部依賴)

info_1 (基礎工具層級):
├── security_utils → info_0/security_constants
└── security_exceptions (無內部依賴)

info_2 (日誌服務層級):
└── security_logger → info_0/security_constants, info_1/security_exceptions

info_3 (系統監控和配置層級):
├── config_manager → info_0/security_constants, info_1/security_exceptions, info_2/security_logger
└── security_monitoring → info_0/security_constants, info_1/security_exceptions, info_2/security_logger
```

### 📦 外部套件依賴

#### PyYAML (>=6.0)
- **使用模組**: config_manager
- **用途**: YAML 配置檔案解析
- **安裝**: `pip install PyYAML>=6.0`

#### psutil (>=5.8.0)
- **使用模組**: security_monitoring
- **用途**: 系統資源監控（CPU、記憶體、磁碟、網路）
- **安裝**: `pip install psutil>=5.8.0`

## 💡 使用範例

### 🔧 基礎工具使用
```python
from security.levels.info.info_1.security_utils import SecurityUtils

# 生成安全令牌
csrf_token = SecurityUtils.generate_csrf_token()
api_key = SecurityUtils.generate_api_key()

# 密碼雜湊和驗證
hashed, salt = SecurityUtils.hash_password("mypassword")
is_valid = SecurityUtils.verify_password("mypassword", hashed, salt)

# 輸入清理和驗證
clean_input = SecurityUtils.sanitize_input("<script>alert('xss')</script>Hello")
is_email_valid = SecurityUtils.is_valid_email("user@example.com")
password_strength = SecurityUtils.validate_password_strength("MyP@ssw0rd!")
```

### 📝 日誌記錄
```python
from security.levels.info.info_2.security_logger import log_security_event, get_security_logger

# 使用全域函數記錄安全事件
log_security_event("XSS_ATTEMPT", "檢測到 XSS 攻擊嘗試", 
                  user_ip="192.168.1.100", 
                  payload="<script>alert('hack')</script>",
                  blocked=True)

# 使用 SecurityLogger 實例
logger = get_security_logger("my_module")
logger.log_authentication_failure("admin", client_ip="192.168.1.50")
logger.log_rate_limit_violation("api_key_123", endpoint="/api/data")
```

### ⚙️ 配置管理
```python
from security.levels.info.info_3.config_manager import get_config, set_config, get_config_manager

# 基本配置操作
set_config("security.max_login_attempts", 5)
max_attempts = get_config("security.max_login_attempts", 3)
has_setting = get_config_manager().has_config("database.host")

# 高級配置管理
config_manager = get_config_manager()
config_manager.add_config_source("env", ConfigSource.from_env_vars())
config_manager.validate_config()
```

### 📊 監控使用
```python
from security.levels.info.info_3.security_monitoring import get_monitor, monitor_performance

monitor = get_monitor()

# 記錄指標
monitor.record_metric("login_attempts", 1, {"user": "admin", "status": "success"})
monitor.increment_counter("api_requests", {"endpoint": "/api/users"})
monitor.set_gauge("active_sessions", 127)

# 使用裝飾器監控效能
@monitor_performance("user_login")
def login_user(username, password):
    # 登入邏輯 - 自動記錄執行時間和成功率
    pass

# 註冊健康檢查
def check_database_connection():
    # 檢查資料庫連線
    return True

monitor.register_health_check("database", check_database_connection)
```

## 🧪 測試策略

### 📋 測試覆蓋率目標
- **單元測試覆蓋率**: 90%+
- **依賴關係測試**: 100%
- **整合測試覆蓋率**: 80%+

### 🔬 測試執行方式
```bash
# 基本測試執行
python3 security/test/test_info_levels.py

# 在 Docker 容器中執行
docker-compose exec backend python security/test/test_info_levels.py
```

### 🎯 測試場景分類
- **INFO-0**: 
  - 常數值正確性測試
  - 工具函數功能測試
  - 例外處理邏輯測試
  
- **INFO-1**: 
  - 日誌記錄功能測試
  - 日誌格式正確性測試
  - 多執行緒安全性測試
  
- **INFO-2**: 
  - 配置管理功能測試
  - 監控指標收集測試
  - 健康檢查機制測試

- **INFO-3**: 
  - 跨層級整合測試
  - 依賴關係驗證測試
  - 效能監控測試

## ⚡ 最佳實踐

### 🏗️ 依賴管理
- ✅ 始終遵循四層分層依賴規則
- ✅ 使用相對導入明確指定依賴路徑
- ✅ 在 import 前檢查依賴關係
- ❌ 避免不必要的跨層級依賴

### ⚠️ 錯誤處理
- ✅ 使用適當的例外類別
- ✅ 提供詳細的錯誤訊息和上下文
- ✅ 記錄所有安全相關錯誤
- ❌ 不要在例外訊息中暴露敏感資訊

### 📋 日誌記錄
- ✅ 使用統一的日誌格式
- ✅ 記錄足夠的上下文信息（IP、用戶、時間等）
- ✅ 區分不同安全事件的優先級
- ❌ 避免在日誌中記錄密碼等敏感資訊

### ⚙️ 配置管理
- ✅ 使用環境變數覆蓋敏感配置
- ✅ 提供合理的預設值
- ✅ 定期驗證配置的正確性
- ❌ 不要在代碼中硬編碼敏感資訊

### 📊 監控指標
- ✅ 選擇有業務意義的指標
- ✅ 使用適當的標籤進行分類
- ✅ 定期檢查和分析監控數據
- ❌ 避免過度監控影響系統效能

## 🔧 故障排除

### ❗ 常見問題解決

#### 1. 模組導入失敗
```python
# ❌ 錯誤示例
from security.levels.info.info_0.nonexistent import something

# ✅ 正確做法
from security.levels.info.info_0.security_utils import SecurityUtils
from security.levels.info.info_1.security_exceptions import SecurityException
```

#### 2. 循環依賴錯誤
```python
# ❌ 避免這種情況
# module_a.py imports module_b
# module_b.py imports module_a

# ✅ 解決方案：重新設計模組結構或使用延遲導入
def get_dependency():
    from .module_b import SomeClass  # 延遲導入
    return SomeClass()
```

#### 3. 外部依賴缺失
```bash
# ❌ 錯誤：ModuleNotFoundError: No module named 'yaml'
# ✅ 解決方案：安裝缺失的依賴
pip install PyYAML>=6.0 psutil>=5.8.0
```

#### 4. 相對導入路徑錯誤
```python
# ❌ 錯誤的相對導入
from security_constants import LOG_LEVELS

# ✅ 正確的相對導入
from ..info_0.security_constants import LOG_LEVELS
```

## 📄 相關檔案參考

### 📁 配置檔案
- `security/configs/security-levels.yaml` - 安全層級配置
- `security/configs/info-dependencies.yaml` - 依賴關係詳細配置

### 🧪 測試檔案
- `security/test/test_info_levels.py` - INFO 層級功能測試

### 🐳 部署配置
- `docker-compose.yml` - Docker 容器配置
- `docker-compose.dual.yml` - 雙資料庫 Docker 配置

## 📋 版本歷史

- **v1.0.0** (2025-06-01): 初始三層 INFO 架構
- **v1.1.0** (2025-06-15): 新增監控系統和配置管理
- **v1.2.0** (2025-06-20): 完善日誌格式和依賴管理
- **v2.0.0** (2025-06-30): 重構為四層架構，優化依賴關係

---

*本文件為 INFO 層級的完整架構說明，包含所有模組的詳細介紹、使用範例和最佳實踐。如有任何問題或建議，請參考相關配置檔案或執行測試驗證功能。*
