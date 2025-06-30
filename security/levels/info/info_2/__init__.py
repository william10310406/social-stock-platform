"""
INFO-2 層級：日誌服務層級
提供日誌記錄功能，依賴 INFO-0 常數和 INFO-1 工具
"""

from .security_logger import (
    SecurityLogger,
    get_security_logger,
    log_security_event
)

__all__ = [
    # 日誌系統
    'SecurityLogger',
    'get_security_logger',
    'log_security_event'
]
