"""
基礎安全工具函數 - INFO-1 層級
工具函數，只依賴 INFO-0 常數，無其他依賴
"""
import re
import hashlib
import secrets
import hmac
import ipaddress
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Union
from urllib.parse import urlparse


class SecurityUtils:
    """基礎資安工具類"""
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """生成安全的隨機令牌"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def generate_csrf_token() -> str:
        """生成 CSRF 令牌"""
        return secrets.token_hex(16)
    
    @staticmethod
    def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
        """密碼雜湊 - 使用 PBKDF2"""
        if salt is None:
            salt = secrets.token_hex(16)
        
        hashed = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000  # 迭代次數
        )
        return hashed.hex(), salt
    
    @staticmethod
    def verify_password(password: str, hashed: str, salt: str) -> bool:
        """驗證密碼"""
        new_hashed, _ = SecurityUtils.hash_password(password, salt)
        return hmac.compare_digest(hashed, new_hashed)
    
    @staticmethod
    def calculate_hmac(data: str, secret: str) -> str:
        """計算 HMAC-SHA256"""
        return hmac.new(
            secret.encode('utf-8'),
            data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
    
    @staticmethod
    def verify_hmac(data: str, signature: str, secret: str) -> bool:
        """驗證 HMAC"""
        expected = SecurityUtils.calculate_hmac(data, secret)
        return hmac.compare_digest(signature, expected)
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """清理檔案名稱，移除危險字符"""
        # 移除危險字符，只保留字母、數字、點號、破折號、底線
        sanitized = re.sub(r'[^\w\s.-]', '', filename)
        # 限制長度
        sanitized = sanitized[:255]
        # 移除多餘空白
        return sanitized.strip()
    
    @staticmethod
    def is_valid_email(email: str) -> bool:
        """驗證 Email 格式"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def get_client_ip(request_headers: Dict[str, str]) -> str:
        """獲取客戶端真實 IP 地址"""
        # 檢查代理標頭
        ip_headers = [
            'X-Forwarded-For',
            'X-Real-IP',
            'X-Client-IP',
            'CF-Connecting-IP',  # Cloudflare
            'X-Cluster-Client-IP'
        ]
        
        for header in ip_headers:
            if header in request_headers:
                ip = request_headers[header].split(',')[0].strip()
                if ip and SecurityUtils.is_valid_ip(ip):
                    return ip
        
        return 'unknown'
    
    @staticmethod
    def is_valid_ip(ip: str) -> bool:
        """驗證 IP 地址格式"""
        try:
            ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def is_internal_ip(ip: str) -> bool:
        """檢查是否為內部網路 IP"""
        try:
            ip_obj = ipaddress.ip_address(ip)
            return ip_obj.is_private or ip_obj.is_loopback
        except ValueError:
            return False
    
    @staticmethod
    def mask_sensitive_data(data: str, mask_char: str = '*', visible_chars: int = 4) -> str:
        """遮蔽敏感數據，保留部分可見字符"""
        if len(data) <= visible_chars:
            return mask_char * len(data)
        
        visible_start = data[:visible_chars//2]
        visible_end = data[-(visible_chars//2):] if visible_chars//2 > 0 else ''
        masked_middle = mask_char * (len(data) - visible_chars)
        
        return visible_start + masked_middle + visible_end
    
    @staticmethod
    def encode_base64_safe(data: str) -> str:
        """安全的 Base64 編碼"""
        import base64
        return base64.urlsafe_b64encode(data.encode('utf-8')).decode('utf-8')
    
    @staticmethod
    def decode_base64_safe(encoded_data: str) -> Optional[str]:
        """安全的 Base64 解碼"""
        try:
            import base64
            decoded = base64.urlsafe_b64decode(encoded_data.encode('utf-8'))
            return decoded.decode('utf-8')
        except Exception:
            return None


class InputValidator:
    """輸入驗證工具"""
    
    @staticmethod
    def is_safe_length(text: str, max_length: int = 1000) -> bool:
        """檢查字符串長度是否安全"""
        return len(text) <= max_length
    
    @staticmethod
    def contains_only_safe_chars(text: str, allowed_pattern: str = r'^[a-zA-Z0-9\s\-_.@]+$') -> bool:
        """檢查是否只包含安全字符"""
        return re.match(allowed_pattern, text) is not None
    
    @staticmethod
    def is_numeric(text: str) -> bool:
        """檢查是否為數字"""
        try:
            float(text)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def is_alphanumeric(text: str) -> bool:
        """檢查是否為字母數字組合"""
        return text.isalnum()
    
    @staticmethod
    def is_safe_url(url: str, allowed_hosts: List[str] = None) -> bool:
        """檢查 URL 是否安全"""
        if not url:
            return False
        
        try:
            parsed = urlparse(url)
        except Exception:
            return False
        
        # 檢查危險協議
        dangerous_protocols = ['javascript', 'data', 'vbscript', 'file']
        if parsed.scheme.lower() in dangerous_protocols:
            return False
        
        # 如果有指定允許的主機，檢查是否在列表中
        if allowed_hosts and parsed.netloc:
            if parsed.netloc not in allowed_hosts:
                return False
        
        return True
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, bool]:
        """驗證密碼強度"""
        from ..info_0.security_constants import (
            PASSWORD_MIN_LENGTH, PASSWORD_REQUIRE_UPPERCASE,
            PASSWORD_REQUIRE_LOWERCASE, PASSWORD_REQUIRE_NUMBERS,
            PASSWORD_REQUIRE_SPECIAL_CHARS, PASSWORD_SPECIAL_CHARS
        )
        
        checks = {
            'min_length': len(password) >= PASSWORD_MIN_LENGTH,
            'has_uppercase': bool(re.search(r'[A-Z]', password)) if PASSWORD_REQUIRE_UPPERCASE else True,
            'has_lowercase': bool(re.search(r'[a-z]', password)) if PASSWORD_REQUIRE_LOWERCASE else True,
            'has_numbers': bool(re.search(r'\d', password)) if PASSWORD_REQUIRE_NUMBERS else True,
            'has_special_chars': bool(re.search(f'[{re.escape(PASSWORD_SPECIAL_CHARS)}]', password)) if PASSWORD_REQUIRE_SPECIAL_CHARS else True,
        }
        
        checks['is_strong'] = all(checks.values())
        return checks


class HTMLUtils:
    """HTML 處理工具"""
    
    @staticmethod
    def escape_html(text: str) -> str:
        """HTML 實體轉義"""
        import html
        return html.escape(text, quote=True)
    
    @staticmethod
    def unescape_html(text: str) -> str:
        """HTML 實體反轉義"""
        import html
        return html.unescape(text)
    
    @staticmethod
    def strip_html_tags(text: str) -> str:
        """移除所有 HTML 標籤"""
        clean = re.compile('<.*?>')
        return re.sub(clean, '', text)
    
    @staticmethod
    def extract_text_from_html(html_content: str) -> str:
        """從 HTML 中提取純文本"""
        # 移除腳本和樣式標籤
        html_content = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        # 移除其他標籤
        text = re.sub(r'<[^>]+>', '', html_content)
        # 清理空白字符
        text = ' '.join(text.split())
        return text


class FileUtils:
    """檔案安全工具"""
    
    @staticmethod
    def get_file_extension(filename: str) -> str:
        """獲取檔案副檔名"""
        return '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    
    @staticmethod
    def is_allowed_file_type(filename: str, allowed_extensions: List[str]) -> bool:
        """檢查檔案類型是否被允許"""
        extension = FileUtils.get_file_extension(filename)
        return extension in [ext.lower() for ext in allowed_extensions]
    
    @staticmethod
    def is_dangerous_file_type(filename: str) -> bool:
        """檢查是否為危險檔案類型"""
        from ..info_0.security_constants import DANGEROUS_FILE_EXTENSIONS
        extension = FileUtils.get_file_extension(filename)
        return extension in [ext.lower() for ext in DANGEROUS_FILE_EXTENSIONS]
    
    @staticmethod
    def calculate_file_hash(file_content: bytes, algorithm: str = 'sha256') -> str:
        """計算檔案雜湊值"""
        hash_obj = hashlib.new(algorithm)
        hash_obj.update(file_content)
        return hash_obj.hexdigest()


class RateLimiter:
    """簡單的速率限制器"""
    
    def __init__(self):
        self.request_history = {}
    
    def is_rate_limited(self, identifier: str, max_requests: int, time_window: int) -> bool:
        """檢查是否被速率限制"""
        now = datetime.now()
        cutoff_time = now - timedelta(seconds=time_window)
        
        # 清理過期的請求記錄
        if identifier in self.request_history:
            self.request_history[identifier] = [
                req_time for req_time in self.request_history[identifier] 
                if req_time > cutoff_time
            ]
        else:
            self.request_history[identifier] = []
        
        # 檢查是否超過限制
        if len(self.request_history[identifier]) >= max_requests:
            return True
        
        # 記錄當前請求
        self.request_history[identifier].append(now)
        return False
    
    def get_remaining_requests(self, identifier: str, max_requests: int, time_window: int) -> int:
        """獲取剩餘請求次數"""
        now = datetime.now()
        cutoff_time = now - timedelta(seconds=time_window)
        
        if identifier in self.request_history:
            recent_requests = [
                req_time for req_time in self.request_history[identifier] 
                if req_time > cutoff_time
            ]
            return max(0, max_requests - len(recent_requests))
        
        return max_requests
