# INFO 層級依賴關係說明

## 概述

本文件詳細說明 INFO 層級（資訊層級）各個檔案之間的依賴關係，確保架構清晰且無循環依賴。

## 層級結構

### 四層架構設計

我們將 INFO 層級重新設計為四個子層級，每個層級有明確的職責和依賴關係：

```
INFO-3 (系統監控和配置)
    ↓ 依賴
INFO-2 (日誌服務)
    ↓ 依賴  
INFO-1 (基礎工具)
    ↓ 依賴
INFO-0 (基礎常數)
```

## 各層級詳細說明

### INFO-0：基礎常數層級

**目錄**: `security/levels/info/info_0/`

**描述**: 最基礎的常數定義層級，不依賴任何其他模組。

**檔案**:
- `security_constants.py` - 所有安全相關常數定義
- `__init__.py` - 模組初始化檔案

**依賴關係**:
- ✅ 無內部依賴
- ✅ 只使用 Python 標準庫

**主要導出**:
```python
# XSS 防護
XSS_DANGEROUS_TAGS = ['script', 'iframe', 'object', ...]
XSS_ALLOWED_TAGS = ['b', 'i', 'u', 'strong', ...]

# 安全事件類型
SECURITY_EVENT_TYPES = {
    'XSS_ATTEMPT': 'xss_attempt',
    'SQL_INJECTION': 'sql_injection',
    ...
}

# 日誌級別
LOG_LEVELS = {
    'DEBUG': 'debug',
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'error',
    'CRITICAL': 'critical'
}
```

### INFO-1：基礎工具層級

**目錄**: `security/levels/info/info_1/`

**描述**: 提供基礎工具函數和例外處理，只依賴 INFO-0 常數。

**檔案**:
- `security_utils.py` - 安全工具函數
- `security_exceptions.py` - 安全例外類別
- `__init__.py` - 模組初始化檔案

**依賴關係**:
- ✅ 依賴 INFO-0：`../info_0/security_constants`
- ❌ 不依賴同層級其他模組
- ❌ 不依賴更高層級

**主要功能**:

#### SecurityUtils 類
```python
class SecurityUtils:
    @staticmethod
    def generate_secure_token(length: int = 32) -> str
    def generate_csrf_token() -> str
    def hash_password(password: str, salt: str = None) -> tuple
    def verify_password(password: str, hashed: str, salt: str) -> bool
    def sanitize_filename(filename: str) -> str
    def is_valid_email(email: str) -> bool
    def is_valid_ip(ip: str) -> bool
```

#### 例外類別
```python
class SecurityException(Exception)
class InputValidationError(SecurityException)
class AuthenticationError(SecurityException)
class AuthorizationError(SecurityException)
class RateLimitExceededError(SecurityException)
class FileSecurityError(SecurityException)
class CryptographyError(SecurityException)
class XSSException(SecurityException)
class SQLInjectionException(SecurityException)
class CSRFException(SecurityException)
```

### INFO-2：日誌服務層級

**目錄**: `security/levels/info/info_2/`

**描述**: 提供統一的日誌記錄服務，依賴 INFO-0 常數和 INFO-1 工具。

**檔案**:
- `security_logger.py` - 安全日誌系統
- `__init__.py` - 模組初始化檔案

**依賴關係**:
- ✅ 依賴 INFO-0：`../info_0/security_constants`
- ✅ 依賴 INFO-1：`../info_1/security_exceptions`
- ❌ 不依賴 INFO-3

**主要功能**:
```python
class SecurityLogger:
    def log_security_event(self, event_type: str, message: str, priority: str = "INFO")
    def log_xss_attempt(self, content: str, user_ip: str = None)
    def log_authentication_failure(self, username: str, user_ip: str = None)
    def log_rate_limit_violation(self, identifier: str, limit: int, window: int, actual: int)

# 便利函數
def get_security_logger(name: str = "security") -> SecurityLogger
def log_security_event(event_type: str, message: str, priority: str = "INFO")
```

### INFO-3：系統監控和配置層級

**目錄**: `security/levels/info/info_3/`

**描述**: 提供配置管理和系統監控功能，依賴所有下層級。

**檔案**:
- `config_manager.py` - 配置管理系統
- `security_monitoring.py` - 安全監控系統
- `__init__.py` - 模組初始化檔案

**依賴關係**:
- ✅ 依賴 INFO-0：`../info_0/security_constants`
- ✅ 依賴 INFO-1：`../info_1/security_exceptions`
- ✅ 依賴 INFO-2：`../info_2/security_logger`

**主要功能**:

#### ConfigManager 類
```python
class ConfigManager:
    def get_config(self, key: str, default: Any = None) -> Any
    def set_config(self, key: str, value: Any) -> None
    def has_config(self, key: str) -> bool
    def reload_config(self) -> None
    def export_config(self, format: str = 'json') -> str
```

#### SecurityMonitoring 類
```python
class SecurityMonitoring:
    def record_metric(self, name: str, value: float, tags: Dict = None)
    def increment_counter(self, name: str, tags: Dict = None)
    def set_gauge(self, name: str, value: float, tags: Dict = None)
    def record_timer(self, name: str, duration: float, tags: Dict = None)
    def start_monitoring(self)
    def stop_monitoring(self)
    def get_dashboard_data(self) -> Dict
```

## 依賴規則

### ✅ 允許的依賴

1. **向下依賴**: 高層級可以依賴低層級
   - INFO-3 → INFO-2, INFO-1, INFO-0
   - INFO-2 → INFO-1, INFO-0
   - INFO-1 → INFO-0

2. **Python 標準庫**: 所有層級都可以使用
   - `os`, `sys`, `json`, `datetime`, `typing` 等

3. **第三方庫**: 在 requirements.txt 中聲明的庫
   - `PyYAML`, `psutil` 等

### ❌ 禁止的依賴

1. **循環依賴**: A → B → A
2. **向上依賴**: 低層級依賴高層級
3. **同層級依賴**: 同層級模組間互相依賴
4. **跨層級依賴**: 跳過中間層級的依賴

## 導入順序建議

在每個檔案中，按照以下順序導入模組：

```python
# 1. Python 標準庫
import os
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

# 2. 第三方庫
import yaml
import psutil

# 3. INFO-0 層級
from ..info_0.security_constants import SECURITY_EVENT_TYPES

# 4. INFO-1 層級
from ..info_1.security_exceptions import SecurityException

# 5. INFO-2 層級
from ..info_2.security_logger import log_security_event

# 6. 當前層級（如果需要）
from .other_module import SomeClass
```

## 測試策略

### 依賴測試

每個層級都需要有對應的測試：

```python
# test/test_info_dependencies.py
def test_info_0_no_dependencies():
    """測試 INFO-0 無內部依賴"""
    
def test_info_1_only_depends_on_info_0():
    """測試 INFO-1 只依賴 INFO-0"""
    
def test_info_2_depends_on_info_0_and_1():
    """測試 INFO-2 依賴 INFO-0 和 INFO-1"""
    
def test_info_3_depends_on_all_lower_levels():
    """測試 INFO-3 依賴所有下層級"""
    
def test_no_circular_dependencies():
    """測試無循環依賴"""
```

### 功能測試

每個模組都需要單獨的功能測試：

```python
# test/test_info_levels.py
def test_info_0_constants()
def test_info_1_utils()
def test_info_1_exceptions()
def test_info_2_logger()
def test_info_3_config()
def test_info_3_monitoring()
```

## 開發指南

### 新增模組時的檢查清單

1. **確定層級**: 新模組屬於哪個層級？
2. **檢查依賴**: 是否只依賴下層級？
3. **更新配置**: 在 `info-dependencies.yaml` 中添加配置
4. **更新 __init__.py**: 添加必要的導出
5. **編寫測試**: 確保依賴關係正確
6. **文件更新**: 更新本文件

### 重構時的注意事項

1. **向下兼容**: 儘量保持對外 API 不變
2. **逐步遷移**: 一次只修改一個層級
3. **測試驗證**: 每次修改後都要跑完整測試
4. **文件同步**: 及時更新相關文件

## 常見問題

### Q: 為什麼要避免同層級依賴？

A: 同層級依賴會造成：
- 模組間耦合度過高
- 難以單獨測試
- 重構時影響範圍擴大
- 可能產生循環依賴

### Q: 如何處理跨層級的共同需求？

A: 將共同需求下沉到更低層級，或者創建專門的工具模組。

### Q: 可以跳過中間層級直接依賴嗎？

A: 可以，但不建議。建議通過中間層級提供的介面來使用。

## 相關文件

- [security-levels.yaml](../configs/security-levels.yaml) - 主要安全層級配置
- [info-dependencies.yaml](../configs/info-dependencies.yaml) - 詳細依賴配置
- [info-architecture.md](./info-architecture.md) - 架構設計說明
- [test/test_info_levels.py](../../test/test_info_levels.py) - 測試檔案

---

*最後更新: 2025-06-30*
*版本: 2.0.0*
