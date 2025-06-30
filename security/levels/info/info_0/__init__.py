"""
INFO-0 層級：基礎常數層級
最基礎的常數定義，無任何依賴
"""

from .security_constants import *

__all__ = [
    # 基礎安全等級
    'SECURITY_LEVELS',
    'SECURITY_PRIORITY',
    
    # 日誌等級
    'LOG_LEVELS',
    
    # 安全事件類型  
    'SECURITY_EVENT_TYPES',
    
    # XSS 防護相關
    'XSS_PATTERNS',
    'XSS_DANGEROUS_TAGS',
    'XSS_ALLOWED_TAGS',
    'DANGEROUS_ATTRIBUTES',
    'DANGEROUS_PROTOCOLS',
    
    # SQL 注入防護相關
    'SQL_INJECTION_PATTERNS',
    'DANGEROUS_SQL_KEYWORDS',
    
    # 密碼安全相關
    'PASSWORD_MIN_LENGTH',
    'PASSWORD_REQUIRE_UPPERCASE',
    'PASSWORD_REQUIRE_LOWERCASE', 
    'PASSWORD_REQUIRE_DIGITS',
    'PASSWORD_REQUIRE_SPECIAL',
    'PASSWORD_SPECIAL_CHARS',
    
    # 檔案安全相關
    'ALLOWED_FILE_EXTENSIONS',
    'DANGEROUS_FILE_EXTENSIONS',
    'MAX_FILE_SIZE',
    
    # 網路安全相關
    'ALLOWED_HOSTS',
    'BLOCKED_IPS',
    'RATE_LIMIT_DEFAULTS',
    
    # 加密相關
    'ENCRYPTION_ALGORITHMS',
    'HASH_ALGORITHMS',
    'KEY_SIZES',
    
    # 會話安全相關
    'SESSION_TIMEOUT',
    'CSRF_TOKEN_LENGTH',
    'JWT_ALGORITHMS',
    
    # 輸入驗證相關
    'MAX_INPUT_LENGTH',
    'ALLOWED_CHARS_PATTERNS',
    'EMAIL_REGEX',
    'URL_REGEX',
    'PHONE_REGEX',
    
    # HTTP 安全標頭
    'SECURITY_HEADERS',
    'CSP_DIRECTIVES',
    
    # 錯誤碼
    'ERROR_CODES',
    'HTTP_STATUS_CODES'
]
