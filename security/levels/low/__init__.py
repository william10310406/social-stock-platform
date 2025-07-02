"""
Low 層級安全模組初始化 - Priority: 1
一般安全風險防護，依賴 INFO 四層級的基礎功能
"""

# 匯入所有 LOW 層級模組
from .info_disclosure_prevention import (
    InfoDisclosurePrevention, scan_for_info_leaks, sanitize_error, create_safe_error
)
from .password_policy import (
    PasswordPolicy, PasswordStrength, validate_password_strength, 
    generate_secure_password, generate_passphrase
)
from .security_headers import (
    SecurityHeaders, get_security_headers, validate_security_headers
)
from .path_traversal_guard import (
    PathTraversalGuard, validate_file_path, get_safe_filename, create_safe_file_opener
)
from .endpoint_security import (
    EndpointSecurity, validate_endpoint_request, create_endpoint_validator
)

# 定義對外開放的 API
__all__ = [
    # 信息洩露防護
    'InfoDisclosurePrevention',
    'scan_for_info_leaks',
    'sanitize_error',
    'create_safe_error',
    
    # 密碼策略
    'PasswordPolicy',
    'PasswordStrength',
    'validate_password_strength',
    'generate_secure_password',
    'generate_passphrase',
    
    # 安全標頭
    'SecurityHeaders',
    'get_security_headers',
    'validate_security_headers',
    
    # 路徑遍歷防護
    'PathTraversalGuard',
    'validate_file_path',
    'get_safe_filename',
    'create_safe_file_opener',
    
    # 端點安全
    'EndpointSecurity',
    'validate_endpoint_request',
    'create_endpoint_validator'
]

# 版本信息
__version__ = "1.0.0"
__priority__ = 1
__level__ = "low"
__description__ = "一般安全風險防護模組，處理輕微的安全問題"

# 依賴關係 - 根據四層 INFO 架構
__dependencies__ = ["info_0", "info_1", "info_2", "info_3"]  # 依賴所有 INFO 層級
