"""
安全例外處理 - Info 層級 (Priority: 0)
不依賴任何其他層級，提供基礎例外類型
"""
from typing import Dict, Any, Optional


class SecurityException(Exception):
    """資安相關例外的基類"""
    
    def __init__(self, message: str, error_code: str = None, details: Dict[str, Any] = None, priority: str = "INFO"):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        self.priority = priority
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典格式，便於日誌記錄"""
        return {
            'message': self.message,
            'error_code': self.error_code,
            'priority': self.priority,
            'details': self.details
        }


class InputValidationError(SecurityException):
    """輸入驗證失敗例外"""
    
    def __init__(self, message: str = "輸入內容不符合安全規範", field: str = None, 
                 value: str = None, **kwargs):
        super().__init__(message, error_code="INVALID_INPUT", priority="LOW", **kwargs)
        if field:
            self.details['field'] = field
        if value:
            self.details['value'] = value[:50]  # 只記錄前50字符


class AuthenticationError(SecurityException):
    """認證失敗例外"""
    
    def __init__(self, message: str = "認證失敗", user_id: str = None, 
                 ip_address: str = None, **kwargs):
        super().__init__(message, error_code="AUTHENTICATION_FAILED", priority="MEDIUM", **kwargs)
        if user_id:
            self.details['user_id'] = user_id
        if ip_address:
            self.details['ip_address'] = ip_address


class AuthorizationError(SecurityException):
    """授權失敗例外"""
    
    def __init__(self, message: str = "權限不足", user_id: str = None, 
                 resource: str = None, action: str = None, **kwargs):
        super().__init__(message, error_code="AUTHORIZATION_DENIED", priority="MEDIUM", **kwargs)
        if user_id:
            self.details['user_id'] = user_id
        if resource:
            self.details['resource'] = resource
        if action:
            self.details['action'] = action


class RateLimitExceededError(SecurityException):
    """速率限制超出例外"""
    
    def __init__(self, message: str = "請求頻率過高", identifier: str = None, 
                 limit: int = None, time_window: int = None, **kwargs):
        super().__init__(message, error_code="RATE_LIMIT_EXCEEDED", priority="MEDIUM", **kwargs)
        if identifier:
            self.details['identifier'] = identifier
        if limit:
            self.details['limit'] = limit
        if time_window:
            self.details['time_window'] = time_window


class FileSecurityError(SecurityException):
    """檔案安全例外"""
    
    def __init__(self, message: str = "檔案安全檢查失敗", filename: str = None, 
                 file_type: str = None, **kwargs):
        super().__init__(message, error_code="FILE_SECURITY_ERROR", priority="HIGH", **kwargs)
        if filename:
            self.details['filename'] = filename
        if file_type:
            self.details['file_type'] = file_type


class CryptographyError(SecurityException):
    """加密相關例外"""
    
    def __init__(self, message: str = "加密操作失敗", operation: str = None, **kwargs):
        super().__init__(message, error_code="CRYPTOGRAPHY_ERROR", priority="HIGH", **kwargs)
        if operation:
            self.details['operation'] = operation


class SecurityConfigurationError(SecurityException):
    """資安配置錯誤例外"""
    
    def __init__(self, message: str = "資安配置錯誤", config_key: str = None, **kwargs):
        super().__init__(message, error_code="SECURITY_CONFIG_ERROR", priority="CRITICAL", **kwargs)
        if config_key:
            self.details['config_key'] = config_key


class SessionSecurityError(SecurityException):
    """會話安全例外"""
    
    def __init__(self, message: str = "會話安全驗證失敗", session_id: str = None, 
                 user_id: str = None, **kwargs):
        super().__init__(message, error_code="SESSION_SECURITY_ERROR", priority="HIGH", **kwargs)
        if session_id:
            self.details['session_id'] = session_id
        if user_id:
            self.details['user_id'] = user_id


# 便利函數
def handle_security_exceptions(logger=None):
    """資安例外處理裝飾器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except SecurityException as e:
                if logger:
                    logger.error(
                        f"Security exception in {func.__name__}: {e.message}", 
                        extra={
                            'error_code': e.error_code, 
                            'priority': e.priority,
                            'details': e.details
                        }
                    )
                raise
            except Exception as e:
                if logger:
                    logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
                # 將一般例外包裝成資安例外
                raise SecurityException(
                    f"安全檢查時發生未預期的錯誤: {str(e)}",
                    error_code="UNEXPECTED_ERROR",
                    priority="HIGH"
                )
        return wrapper
    return decorator


# 例外訊息本地化
SECURITY_ERROR_MESSAGES_ZH_TW = {
    'INVALID_INPUT': '輸入內容不符合安全要求',
    'AUTHENTICATION_FAILED': '用戶認證失敗',
    'AUTHORIZATION_DENIED': '用戶權限不足，拒絕存取',
    'RATE_LIMIT_EXCEEDED': '請求頻率超出限制',
    'FILE_SECURITY_ERROR': '檔案安全檢查失敗',
    'CRYPTOGRAPHY_ERROR': '加密解密操作失敗',
    'SECURITY_CONFIG_ERROR': '資安配置設定錯誤',
    'SESSION_SECURITY_ERROR': '會話安全驗證失敗',
    'UNEXPECTED_ERROR': '發生未預期的安全錯誤',
}

SECURITY_ERROR_MESSAGES_EN = {
    'INVALID_INPUT': 'Input does not meet security requirements',
    'AUTHENTICATION_FAILED': 'User authentication failed',
    'AUTHORIZATION_DENIED': 'Access denied due to insufficient permissions',
    'RATE_LIMIT_EXCEEDED': 'Request rate limit exceeded',
    'FILE_SECURITY_ERROR': 'File security check failed',
    'CRYPTOGRAPHY_ERROR': 'Cryptographic operation failed',
    'SECURITY_CONFIG_ERROR': 'Security configuration error',
    'SESSION_SECURITY_ERROR': 'Session security validation failed',
    'UNEXPECTED_ERROR': 'Unexpected security error occurred',
}


def get_localized_error_message(error_code: str, locale: str = 'zh-tw') -> str:
    """獲取本地化的錯誤訊息"""
    if locale.lower() == 'zh-tw':
        return SECURITY_ERROR_MESSAGES_ZH_TW.get(error_code, error_code)
    elif locale.lower() == 'en':
        return SECURITY_ERROR_MESSAGES_EN.get(error_code, error_code)
    else:
        return error_code


# 基於優先級的例外處理策略
class SecurityExceptionHandler:
    """資安例外處理器"""
    
    def __init__(self, logger=None):
        self.logger = logger
        self.priority_levels = {
            'INFO': 0,
            'LOW': 1,
            'MEDIUM': 2,
            'HIGH': 3,
            'CRITICAL': 4
        }
    
    def handle_exception(self, exception: SecurityException, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """處理安全例外"""
        response = {
            'handled': True,
            'priority': exception.priority,
            'action_taken': self._determine_action(exception),
            'should_alert': self._should_send_alert(exception),
            'should_block': self._should_block_request(exception)
        }
        
        # 記錄日誌
        if self.logger:
            log_level = self._get_log_level(exception.priority)
            self.logger.log(
                getattr(self.logger, log_level.upper()),
                f"Security exception: {exception.message}",
                extra={
                    'error_code': exception.error_code,
                    'priority': exception.priority,
                    'details': exception.details,
                    'context': context or {}
                }
            )
        
        return response
    
    def _determine_action(self, exception: SecurityException) -> str:
        """根據優先級決定處理動作"""
        priority_level = self.priority_levels.get(exception.priority, 0)
        
        if priority_level >= 4:  # CRITICAL
            return "immediate_response"
        elif priority_level >= 3:  # HIGH
            return "escalate_to_security_team"
        elif priority_level >= 2:  # MEDIUM
            return "log_and_monitor"
        else:  # LOW, INFO
            return "log_only"
    
    def _should_send_alert(self, exception: SecurityException) -> bool:
        """判斷是否需要發送警報"""
        priority_level = self.priority_levels.get(exception.priority, 0)
        return priority_level >= 3  # HIGH 以上發送警報
    
    def _should_block_request(self, exception: SecurityException) -> bool:
        """判斷是否需要阻擋請求"""
        priority_level = self.priority_levels.get(exception.priority, 0)
        return priority_level >= 2  # MEDIUM 以上阻擋請求
    
    def _get_log_level(self, priority: str) -> str:
        """根據優先級取得日誌等級"""
        log_level_mapping = {
            'INFO': 'info',
            'LOW': 'info',
            'MEDIUM': 'warning',
            'HIGH': 'error',
            'CRITICAL': 'critical'
        }
        return log_level_mapping.get(priority, 'info')
