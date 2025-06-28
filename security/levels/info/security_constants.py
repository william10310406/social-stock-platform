"""
資安常數定義 - Info 層級 (Priority: 0)
基礎資安常數，不依賴任何其他層級
"""

# XSS 防護相關常數
XSS_DANGEROUS_TAGS = [
    'script', 'iframe', 'object', 'embed', 'applet', 'meta', 'link', 'style',
    'form', 'input', 'button', 'textarea', 'select', 'option'
]

XSS_DANGEROUS_ATTRIBUTES = [
    'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown', 'onkeyup',
    'onkeypress', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout',
    'onmouseenter', 'onmouseleave', 'ondblclick', 'oncontextmenu'
]

XSS_ALLOWED_TAGS = [
    'b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3',
    'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'span', 'div'
]

XSS_ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'div': ['class'],
    'span': ['class'],
    'p': ['class'],
    'h1': ['class'], 'h2': ['class'], 'h3': ['class'],
    'h4': ['class'], 'h5': ['class'], 'h6': ['class'],
}

XSS_DANGEROUS_PROTOCOLS = [
    'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'
]

# 基本安全限制
MAX_INPUT_LENGTH = 10000
MAX_LOGIN_ATTEMPTS = 5
SESSION_TIMEOUT = 3600  # 1 小時
CSRF_TOKEN_LENGTH = 32

# Content Security Policy 基礎配置
CSP_DEFAULT_SRC = "'self'"
CSP_SCRIPT_SRC = "'self'"
CSP_STYLE_SRC = "'self' 'unsafe-inline'"
CSP_IMG_SRC = "'self' data: https:"
CSP_FONT_SRC = "'self' https://fonts.gstatic.com"
CSP_CONNECT_SRC = "'self'"

# 安全事件類型
SECURITY_EVENT_TYPES = {
    'XSS_ATTEMPT': 'xss_attempt',
    'SQL_INJECTION_ATTEMPT': 'sql_injection_attempt',
    'BRUTE_FORCE_ATTACK': 'brute_force_attack',
    'CSRF_ATTACK': 'csrf_attack',
    'UNAUTHORIZED_ACCESS': 'unauthorized_access',
    'RATE_LIMIT_VIOLATION': 'rate_limit_violation',
    'FILE_UPLOAD_ATTACK': 'file_upload_attack',
    'DIRECTORY_TRAVERSAL': 'directory_traversal'
}

# 安全等級優先級
SECURITY_PRIORITY = {
    'INFO': 0,
    'LOW': 1,
    'MEDIUM': 2,
    'HIGH': 3,
    'CRITICAL': 4
}

# 錯誤訊息
SECURITY_ERROR_MESSAGES = {
    'XSS_DETECTED': '檢測到潛在的 XSS 攻擊',
    'INVALID_INPUT': '輸入內容不符合安全規範',
    'AUTHENTICATION_FAILED': '認證失敗',
    'AUTHORIZATION_DENIED': '權限不足',
    'RATE_LIMIT_EXCEEDED': '請求頻率過高',
    'CSRF_TOKEN_INVALID': 'CSRF 令牌無效',
    'FILE_TYPE_NOT_ALLOWED': '檔案類型不被允許',
    'FILE_SIZE_TOO_LARGE': '檔案大小超出限制'
}

# 日誌等級
LOG_LEVELS = {
    'DEBUG': 'debug',
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'error',
    'CRITICAL': 'critical'
}

# 支援的檔案類型 (安全檔案上傳)
ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.txt', '.doc', '.docx']
DANGEROUS_FILE_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl'
]

# 密碼安全設定
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_NUMBERS = True
PASSWORD_REQUIRE_SPECIAL_CHARS = True
PASSWORD_SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?"

# IP 白名單/黑名單設定
INTERNAL_IP_RANGES = [
    '127.0.0.0/8',     # localhost
    '10.0.0.0/8',      # private class A
    '172.16.0.0/12',   # private class B
    '192.168.0.0/16'   # private class C
]
