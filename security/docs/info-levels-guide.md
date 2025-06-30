# INFO 層級架構說明文件

## 概述

INFO 層級是整個安全架構的基礎層，分為三個子層級（info_0、info_1、info_2），每個層級都有明確的職責和依賴關係。本文件詳細說明每個模組的功能、依賴關係和使用方式。

## 分層架構

### 整體架構圖

```
┌─────────────────────────────────────────────────────┐
│                 INFO 層級架構                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │            INFO-2 (系統監控層級)              │    │
│  │  ┌─────────────────┐  ┌─────────────────┐   │    │
│  │  │ config_manager  │  │security_monitoring│   │    │
│  │  └─────────────────┘  └─────────────────┘   │    │
│  └─────────────────────────────────────────────┘    │
│                    ↓ 依賴                           │
│  ┌─────────────────────────────────────────────┐    │
│  │            INFO-1 (基礎服務層級)              │    │
│  │  ┌─────────────────┐                        │    │
│  │  │ security_logger │                        │    │
│  │  └─────────────────┘                        │    │
│  └─────────────────────────────────────────────┘    │
│                    ↓ 依賴                           │
│  ┌─────────────────────────────────────────────┐    │
│  │            INFO-0 (基礎元件層級)              │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────┐ │    │
│  │  │security_const│ │security_utils│ │except│ │    │
│  │  └──────────────┘ └──────────────┘ └──────┘ │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## INFO-0 層級：基礎元件層級

### 概述
- **優先級**: 0.1（最低）
- **依賴**: 無
- **職責**: 提供最基礎的常數、工具函數和例外處理

### 模組詳情

#### 1. security_constants.py
**功能**: 定義所有安全相關的常數

**主要常數**:
```python
# XSS 防護相關
XSS_DANGEROUS_TAGS = ['script', 'iframe', 'object', ...]
XSS_ALLOWED_TAGS = ['b', 'i', 'em', 'strong', ...]

# 安全事件類型
SECURITY_EVENT_TYPES = {
    'XSS_ATTEMPT': 'xss_attempt',
    'AUTH_FAILURE': 'auth_failure',
    ...
}

# 密碼策略
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_UPPERCASE = True
...
```

**依賴關係**:
- 外部依賴: `typing`
- 內部依賴: 無

#### 2. security_utils.py
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
...
```

**依賴關係**:
- 外部依賴: `re`, `hashlib`, `secrets`, `hmac`, `ipaddress`, `datetime`, `typing`, `urllib.parse`
- 內部依賴: `security_constants`

#### 3. security_exceptions.py
**功能**: 定義所有安全相關的例外類別

**主要例外類別**:
```python
class SecurityException(Exception)  # 基礎例外類
class InputValidationError(SecurityException)
class AuthenticationError(SecurityException)
class AuthorizationError(SecurityException)
class RateLimitExceededError(SecurityException)
class FileSecurityError(SecurityException)
...
```

**依賴關係**:
- 外部依賴: `typing`
- 內部依賴: 無

## INFO-1 層級：基礎服務層級

### 概述
- **優先級**: 0.2
- **依賴**: INFO-0 層級
- **職責**: 提供日誌服務

### 模組詳情

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
    ...
```

**全域函數**:
```python
def get_security_logger(name: str) -> SecurityLogger
def log_security_event(event_type: str, message: str, **kwargs)
```

**依賴關係**:
- 外部依賴: `logging`, `json`, `datetime`, `typing`, `threading`, `pathlib`
- 內部依賴: 
  - `security_constants`
  - `security_utils`
  - `security_exceptions`

**日誌格式**:
```json
{
  "timestamp": "2025-06-29T11:00:03.113364",
  "level": "INFO",
  "message": "安全事件消息",
  "module": "security_logger",
  "function": "log_security_event",
  "line": 61,
  "event_type": "XSS_ATTEMPT",
  "priority": "HIGH",
  "details": {...}
}
```

## INFO-2 層級：系統監控層級

### 概述
- **優先級**: 0.3
- **依賴**: INFO-0 和 INFO-1 層級
- **職責**: 提供配置管理和系統監控

### 模組詳情

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
    ...
```

**配置來源優先級**:
1. environment (100) - 環境變數
2. runtime (95) - 執行時設定
3. main_config (50) - 主配置檔
4. defaults (10) - 預設值

**依賴關係**:
- 外部依賴: `yaml`, `json`, `os`, `pathlib`, `typing`, `threading`, `datetime`
- 內部依賴: 
  - `security_constants`
  - `security_utils`
  - `security_exceptions`
  - `security_logger`

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
    ...
```

**監控指標類型**:
- **計數器 (Counter)**: 遞增的數值（如請求次數）
- **量表 (Gauge)**: 瞬時數值（如 CPU 使用率）
- **計時器 (Timer)**: 執行時間測量
- **健康檢查**: 系統狀態檢查

**效能監控裝飾器**:
```python
@monitor_performance("function_name")
def your_function():
    # 自動記錄執行時間和成功/失敗次數
    pass
```

**依賴關係**:
- 外部依賴: `psutil`, `threading`, `time`, `json`, `datetime`, `typing`, `functools`, `collections`
- 內部依賴:
  - `security_constants`
  - `security_utils`
  - `security_exceptions`
  - `security_logger`

## 依賴關係詳解

### 依賴規則
1. **禁止循環依賴**: 任何模組不得直接或間接依賴自己
2. **禁止向上依賴**: 低層級模組不得依賴高層級模組
3. **同層級依賴限制**: 同層級模組之間的依賴應該最小化

### 具體依賴關係

```
info_0:
├── security_constants (無依賴)
├── security_utils → security_constants
└── security_exceptions (無依賴)

info_1:
└── security_logger → security_constants, security_utils, security_exceptions

info_2:
├── config_manager → security_constants, security_utils, security_exceptions, security_logger
└── security_monitoring → security_constants, security_utils, security_exceptions, security_logger
```

## 外部套件依賴

### PyYAML (>=6.0)
- **使用模組**: config_manager
- **用途**: YAML 配置檔案解析
- **安裝**: `pip install PyYAML>=6.0`

### psutil (>=5.8.0)
- **使用模組**: security_monitoring
- **用途**: 系統資源監控（CPU、記憶體、磁碟、網路）
- **安裝**: `pip install psutil>=5.8.0`

## 使用範例

### 基礎工具使用
```python
from security.levels.info.info_0.security_utils import SecurityUtils

# 生成安全令牌
token = SecurityUtils.generate_csrf_token()

# 密碼雜湊和驗證
hashed, salt = SecurityUtils.hash_password("mypassword")
is_valid = SecurityUtils.verify_password("mypassword", hashed, salt)

# 輸入清理
clean_input = SecurityUtils.sanitize_input("<script>alert('xss')</script>Hello")
```

### 日誌記錄
```python
from security.levels.info.info_1.security_logger import log_security_event

# 記錄安全事件
log_security_event("XSS_ATTEMPT", "檢測到 XSS 攻擊嘗試", 
                  user_ip="192.168.1.100", payload="<script>...")
```

### 配置管理
```python
from security.levels.info.info_2.config_manager import get_config, set_config

# 設定配置
set_config("security.max_login_attempts", 5)

# 獲取配置
max_attempts = get_config("security.max_login_attempts", 3)
```

### 監控使用
```python
from security.levels.info.info_2.security_monitoring import get_monitor, monitor_performance

monitor = get_monitor()

# 記錄指標
monitor.record_metric("login_attempts", 1, {"user": "admin"})
monitor.increment_counter("api_requests")

# 使用裝飾器監控效能
@monitor_performance("user_login")
def login_user(username, password):
    # 登入邏輯
    pass
```

## 測試策略

### 測試覆蓋率
- **目標覆蓋率**: 90%
- **測試類型**: 單元測試、依賴關係測試、整合測試

### 測試執行
```bash
# 在 Docker 容器中執行測試
docker-compose -f docker-compose.dual.yml exec backend python test/test_info_levels.py
```

### 測試場景
- **INFO-0**: 常數值正確性、工具函數功能、例外處理邏輯
- **INFO-1**: 日誌記錄功能、日誌格式正確性、多執行緒安全性
- **INFO-2**: 配置管理功能、監控指標收集、健康檢查機制

## 最佳實踐

### 1. 依賴管理
- 始終遵循分層依賴規則
- 在 import 前檢查依賴關係
- 避免不必要的依賴

### 2. 錯誤處理
- 使用適當的例外類別
- 提供詳細的錯誤訊息
- 記錄所有安全相關錯誤

### 3. 日誌記錄
- 使用統一的日誌格式
- 記錄足夠的上下文信息
- 避免記錄敏感信息

### 4. 配置管理
- 使用環境變數覆蓋配置
- 提供合理的預設值
- 驗證配置的正確性

### 5. 監控指標
- 選擇有意義的指標
- 使用適當的標籤分類
- 定期檢查監控數據

## 故障排除

### 常見問題

#### 1. 模組導入失敗
```python
# 錯誤示例
from security.levels.info.info_0.nonexistent import something

# 解決方案：檢查模組路徑和名稱
from security.levels.info.info_0.security_utils import SecurityUtils
```

#### 2. 循環依賴錯誤
```python
# 避免這種情況
# module_a.py imports module_b
# module_b.py imports module_a

# 解決方案：重新設計模組結構或使用延遲導入
```

#### 3. 外部依賴缺失
```bash
# 錯誤：ModuleNotFoundError: No module named 'yaml'
# 解決方案：安裝依賴
pip install PyYAML psutil
```

## 版本歷史

- **v1.0.0**: 初始 INFO 層級架構
- **v1.1.0**: 新增監控系統
- **v1.2.0**: 完善配置管理
- **v1.3.0**: 統一日誌格式

## 參考資料

- [YAML 配置檔案](../configs/security-levels.yaml)
- [依賴關係配置](../configs/info-dependencies.yaml)
- [測試檔案](../../test/test_info_levels.py)
- [Docker 配置](../../docker-compose.dual.yml)
