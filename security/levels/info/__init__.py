"""
Info 層級初始化 - Priority: 0
基礎資安工具和常數，不依賴任何其他層級
"""

# 匯入所有基礎模組
from .security_constants import *
from .security_utils import SecurityUtils, InputValidator, HTMLUtils, FileUtils, RateLimiter
from .security_exceptions import (
    SecurityException, InputValidationError, AuthenticationError, 
    AuthorizationError, RateLimitExceededError, FileSecurityError,
    CryptographyError, SecurityConfigurationError, SessionSecurityError,
    handle_security_exceptions, get_localized_error_message, SecurityExceptionHandler
)

# 定義對外開放的 API
__all__ = [
    # 常數
    'XSS_DANGEROUS_TAGS', 'XSS_DANGEROUS_ATTRIBUTES', 'XSS_ALLOWED_TAGS',
    'XSS_ALLOWED_ATTRIBUTES', 'XSS_DANGEROUS_PROTOCOLS',
    'MAX_INPUT_LENGTH', 'MAX_LOGIN_ATTEMPTS', 'SESSION_TIMEOUT', 'CSRF_TOKEN_LENGTH',
    'CSP_DEFAULT_SRC', 'CSP_SCRIPT_SRC', 'CSP_STYLE_SRC', 'CSP_IMG_SRC',
    'SECURITY_EVENT_TYPES', 'SECURITY_PRIORITY', 'SECURITY_ERROR_MESSAGES',
    'LOG_LEVELS', 'ALLOWED_IMAGE_EXTENSIONS', 'ALLOWED_DOCUMENT_EXTENSIONS',
    'DANGEROUS_FILE_EXTENSIONS', 'PASSWORD_MIN_LENGTH', 'INTERNAL_IP_RANGES',
    
    # 工具類
    'SecurityUtils', 'InputValidator', 'HTMLUtils', 'FileUtils', 'RateLimiter',
    
    # 例外類
    'SecurityException', 'InputValidationError', 'AuthenticationError',
    'AuthorizationError', 'RateLimitExceededError', 'FileSecurityError',
    'CryptographyError', 'SecurityConfigurationError', 'SessionSecurityError',
    
    # 工具函數
    'handle_security_exceptions', 'get_localized_error_message',
    'SecurityExceptionHandler'
]

# 版本信息
__version__ = "1.0.0"
__priority__ = 0
__level__ = "info"
__description__ = "基礎資安工具和常數，提供其他層級所需的基礎功能"
