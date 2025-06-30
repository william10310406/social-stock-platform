"""
INFO-1 層級：基礎工具和例外層級
基礎工具函數和例外處理，只依賴 INFO-0 常數
"""

from .security_utils import SecurityUtils
from .security_exceptions import (
    SecurityException,
    InputValidationError,
    AuthenticationError,
    AuthorizationError,
    RateLimitExceededError,
    FileSecurityError,
    CryptographyError,
    XSSException,
    SQLInjectionException,
    CSRFException
)

__all__ = [
    # 工具類
    'SecurityUtils',
    
    # 基礎例外
    'SecurityException',
    'InputValidationError',
    'AuthenticationError', 
    'AuthorizationError',
    'RateLimitExceededError',
    'FileSecurityError',
    'CryptographyError',
    
    # 特定攻擊例外
    'XSSException',
    'SQLInjectionException',
    'CSRFException'
]
