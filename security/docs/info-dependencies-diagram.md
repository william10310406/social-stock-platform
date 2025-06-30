# INFO 層級依賴關係圖

## 快速參考

### 層級結構
```
INFO-2 (監控層級) ← 依賴 ← INFO-1 (服務層級) ← 依賴 ← INFO-0 (基礎層級)
```

### 詳細依賴圖

```
┌─────────────────────────────────────────────────────────────────┐
│                           INFO-2 層級                            │
├─────────────────────────────┬───────────────────────────────────┤
│        config_manager       │      security_monitoring         │
│                             │                                   │
│  外部依賴:                   │  外部依賴:                         │
│  • yaml ≥6.0               │  • psutil ≥5.8.0                │
│  • json, os, pathlib       │  • threading, time               │
│  • threading, datetime     │  • json, datetime                │
│                             │  • functools, collections        │
│  內部依賴:                   │                                   │
│  • security_constants      │  內部依賴:                         │
│  • security_utils          │  • security_constants            │
│  • security_exceptions     │  • security_utils                │
│  • security_logger         │  • security_exceptions           │
│                             │  • security_logger               │
└─────────────────────────────┴───────────────────────────────────┘
                                │
                                ▼ 依賴
┌─────────────────────────────────────────────────────────────────┐
│                           INFO-1 層級                            │
├─────────────────────────────────────────────────────────────────┤
│                     security_logger                             │
│                                                                 │
│  外部依賴:                                                       │
│  • logging, json, datetime                                     │
│  • typing, threading, pathlib                                  │
│                                                                 │
│  內部依賴:                                                       │
│  • security_constants                                          │
│  • security_utils                                              │
│  • security_exceptions                                         │
│                                                                 │
│  提供功能:                                                       │
│  • 統一日誌記錄                                                  │
│  • 安全事件追蹤                                                  │
│  • JSON 格式輸出                                                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼ 依賴
┌─────────────────────────────────────────────────────────────────┐
│                           INFO-0 層級                            │
├───────────────────┬─────────────────────┬───────────────────────┤
│ security_constants│   security_utils    │ security_exceptions   │
│                   │                     │                       │
│ 外部依賴:          │ 外部依賴:            │ 外部依賴:              │
│ • typing          │ • re, hashlib       │ • typing              │
│                   │ • secrets, hmac     │                       │
│ 內部依賴:          │ • ipaddress         │ 內部依賴:              │
│ • 無              │ • datetime, typing  │ • 無                  │
│                   │ • urllib.parse      │                       │
│ 提供:             │                     │ 提供:                 │
│ • XSS常數         │ 內部依賴:            │ • 例外類別            │
│ • 事件類型        │ • security_constants│ • 錯誤處理            │
│ • 密碼設定        │                     │ • 訊息格式化          │
│ • 日誌級別        │ 提供:               │                       │
│                   │ • SecurityUtils類   │                       │
│                   │ • 工具函數          │                       │
│                   │ • 加密功能          │                       │
│                   │ • 驗證功能          │                       │
└───────────────────┴─────────────────────┴───────────────────────┘
```

## 依賴流向

### 向下依賴 (允許)
```
INFO-2 → INFO-1 → INFO-0
```

### 向上依賴 (禁止)
```
INFO-0 ❌ INFO-1 ❌ INFO-2
```

### 同層依賴 (限制)
```
INFO-0: security_utils → security_constants (允許)
INFO-1: 無同層依賴
INFO-2: 無同層依賴
```

## 使用模式

### 1. 基礎工具 (INFO-0)
```python
# 只使用基礎功能，無依賴
from security.levels.info.info_0.security_utils import SecurityUtils
token = SecurityUtils.generate_csrf_token()
```

### 2. 日誌記錄 (INFO-1)
```python
# 依賴 INFO-0，提供日誌服務
from security.levels.info.info_1.security_logger import log_security_event
log_security_event("XSS_ATTEMPT", "攻擊檢測")
```

### 3. 系統管理 (INFO-2)
```python
# 依賴 INFO-0 和 INFO-1，提供高階服務
from security.levels.info.info_2.config_manager import get_config
from security.levels.info.info_2.security_monitoring import get_monitor

config_value = get_config("security.setting")
monitor = get_monitor()
```

## 檔案結構總覽

```
security/levels/info/
├── info_0/
│   ├── __init__.py
│   ├── security_constants.py    # 常數定義 (無依賴)
│   ├── security_utils.py        # 工具函數 (→ constants)
│   └── security_exceptions.py   # 例外處理 (無依賴)
├── info_1/
│   ├── __init__.py
│   └── security_logger.py       # 日誌系統 (→ info_0/*)
└── info_2/
    ├── __init__.py
    ├── config_manager.py        # 配置管理 (→ info_0/*, info_1/*)
    └── security_monitoring.py   # 監控系統 (→ info_0/*, info_1/*)
```

## 外部依賴摘要

| 套件 | 版本 | 使用模組 | 用途 |
|------|------|----------|------|
| PyYAML | ≥6.0 | config_manager | YAML配置解析 |
| psutil | ≥5.8.0 | security_monitoring | 系統監控 |

## 測試命令

```bash
# 完整測試
docker-compose -f docker-compose.dual.yml exec backend python test/test_info_levels.py

# 檢查特定層級
python -c "from security.levels.info.info_0 import security_constants; print('INFO-0 OK')"
python -c "from security.levels.info.info_1 import security_logger; print('INFO-1 OK')"
python -c "from security.levels.info.info_2 import config_manager; print('INFO-2 OK')"
```
