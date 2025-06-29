"""
INFO-0 層級：基礎常數、工具、例外層級
最基礎的常數定義、工具函數和例外處理，無任何依賴
"""

from .security_constants import *
from .security_utils import *
from .security_exceptions import *

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
    'DANGEROUS_TAGS',
    'DANGEROUS_ATTRIBUTES',
    'DANGEROUS_PROTOCOLS',
    
    # SQL 注入防護相關
    'SQL_INJECTION_PATTERNS',
    'DANGEROUS_SQL_KEYWORDS',
    
    # 檔案上傳安全相關
    'ALLOWED_FILE_EXTENSIONS',
    'DANGEROUS_FILE_EXTENSIONS',
    'MAX_FILE_SIZE',
    
    # 密碼安全相關
    'PASSWORD_MIN_LENGTH',
    'PASSWORD_MAX_LENGTH',
    'PASSWORD_PATTERNS',
    
    # 速率限制相關
    'DEFAULT_RATE_LIMITS',
    
    # HTTP 安全標頭
    'SECURITY_HEADERS',
    
    # 加密相關
    'ENCRYPTION_ALGORITHMS',
    'HASH_ALGORITHMS',
    
    # 網路安全相關
    'BLOCKED_IPS',
    'ALLOWED_IPS',
    'SUSPICIOUS_USER_AGENTS',
    
    # 安全工具函數
    'sanitize_html',
    'escape_html',
    'validate_email',
    'validate_url',
    'validate_ip',
    'generate_secure_token',
    'hash_password',
    'verify_password',
    'encrypt_data',
    'decrypt_data',
    'clean_filename',
    'safe_file_path',
    'calculate_file_hash',
    'RateLimiter',
    
    # 安全例外
    'SecurityException',
    'XSSException',
    'SQLInjectionException',
    'FileUploadException',
    'AuthenticationException',
    'AuthorizationException',
    'RateLimitException',
    'ConfigurationException',
    'ValidationException',
    'EncryptionException',
    'security_exception_handler'
]
