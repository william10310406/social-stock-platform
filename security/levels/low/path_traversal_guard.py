"""
目錄遍歷防護模組 (LOW 層級)
防止路徑遍歷攻擊，保護文件系統安全
"""

import os
import re
from pathlib import Path, PurePath
from typing import Dict, Any, List, Optional, Union, Tuple
from urllib.parse import unquote, quote
import mimetypes

# 引入 INFO 層級的基礎模組
from ..info import (
    SecurityLogger, SecurityException, ValidationError,
    get_config, SECURITY_EVENT_TYPES
)


class PathTraversalGuard:
    """路徑遍歷防護器"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.logger = SecurityLogger()
        self.config = config or self._get_default_config()
        
        # 危險路徑模式
        self.dangerous_patterns = [
            r'\.\./',           # ../
            r'\.\.\.',          # ...
            r'\.\.\\',          # ..\
            r'%2e%2e%2f',       # URL encoded ../
            r'%2e%2e%5c',       # URL encoded ..\
            r'%252e%252e%252f', # Double URL encoded ../
            r'/\.\.',           # /..
            r'\\\.\.',          # \..
            r'\.\.%2f',         # ..%2f
            r'\.\.%5c',         # ..%5c
            r'%c0%ae%c0%ae/',   # UTF-8 encoded ../
            r'%c0%ae%c0%ae\\',  # UTF-8 encoded ..\
        ]
        
        # 敏感文件模式
        self.sensitive_file_patterns = [
            r'\.env$',
            r'\.git/',
            r'\.ssh/',
            r'\.htaccess$',
            r'\.htpasswd$',
            r'web\.config$',
            r'\.ini$',
            r'\.conf$',
            r'\.cfg$',
            r'passwd$',
            r'shadow$',
            r'\.key$',
            r'\.pem$',
            r'\.crt$',
            r'\.log$',
            r'\.backup$',
            r'\.bak$',
            r'\.sql$',
            r'\.db$',
            r'\.sqlite',
        ]
        
        # 系統目錄模式
        self.system_directories = [
            '/etc/', '/proc/', '/sys/', '/dev/', '/var/', '/tmp/',
            '/boot/', '/root/', '/home/', '/usr/bin/', '/usr/sbin/',
            'C:\\Windows\\', 'C:\\Program Files\\', 'C:\\Users\\',
            'C:\\System32\\', '/System/', '/Library/', '/Applications/'
        ]
        
        self.logger.info("路徑遍歷防護模組初始化完成")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """獲取默認配置"""
        return {
            'allowed_base_paths': ['/var/www/html', '/app/public', './static'],
            'max_path_length': 4096,
            'case_sensitive': True,
            'allow_symlinks': False,
            'allowed_extensions': ['.html', '.css', '.js', '.png', '.jpg', '.gif', '.pdf', '.txt'],
            'blocked_extensions': ['.exe', '.bat', '.sh', '.php', '.asp', '.jsp'],
            'max_directory_depth': 10,
            'strict_mode': True,
        }
    
    def validate_path(self, user_path: str, base_path: Optional[str] = None) -> Dict[str, Any]:
        """驗證路徑安全性"""
        result = {
            'is_safe': True,
            'sanitized_path': None,
            'resolved_path': None,
            'violations': [],
            'warnings': [],
            'risk_level': 'low'
        }
        
        try:
            # 基本檢查
            if not user_path:
                result['violations'].append("空路徑")
                result['is_safe'] = False
                return result
            
            # 長度檢查
            if len(user_path) > self.config['max_path_length']:
                result['violations'].append(f"路徑長度超過限制 ({self.config['max_path_length']})")
                result['is_safe'] = False
                result['risk_level'] = 'medium'
            
            # URL 解碼
            decoded_path = self._decode_path(user_path)
            result['sanitized_path'] = decoded_path
            
            # 檢查危險模式
            dangerous_found = self._check_dangerous_patterns(decoded_path)
            if dangerous_found:
                result['violations'].extend(dangerous_found)
                result['is_safe'] = False
                result['risk_level'] = 'high'
            
            # 路徑正規化和解析
            try:
                normalized_path = self._normalize_path(decoded_path, base_path)
                result['resolved_path'] = normalized_path
                
                # 檢查路徑是否在允許的基礎路徑內
                if base_path:
                    containment_check = self._check_path_containment(normalized_path, base_path)
                    if not containment_check['is_contained']:
                        result['violations'].append("路徑超出允許範圍")
                        result['is_safe'] = False
                        result['risk_level'] = 'critical'
                
                # 檢查敏感文件
                sensitive_check = self._check_sensitive_file(normalized_path)
                if sensitive_check['is_sensitive']:
                    result['violations'].append(f"嘗試存取敏感文件: {sensitive_check['type']}")
                    result['is_safe'] = False
                    result['risk_level'] = 'high'
                
                # 檢查文件擴展名
                extension_check = self._check_file_extension(normalized_path)
                if not extension_check['is_allowed']:
                    result['violations'].append(f"不允許的文件類型: {extension_check['extension']}")
                    result['is_safe'] = False
                    result['risk_level'] = 'medium'
                
                # 檢查目錄深度
                depth_check = self._check_directory_depth(normalized_path)
                if depth_check > self.config['max_directory_depth']:
                    result['warnings'].append(f"目錄深度較深: {depth_check}")
                
                # 檢查符號鏈接
                if not self.config['allow_symlinks'] and os.path.islink(normalized_path):
                    result['violations'].append("不允許存取符號鏈接")
                    result['is_safe'] = False
                    result['risk_level'] = 'medium'
                
            except Exception as e:
                result['violations'].append(f"路徑解析錯誤: {e}")
                result['is_safe'] = False
                result['risk_level'] = 'high'
            
            # 記錄安全事件
            if not result['is_safe']:
                self.logger.log_security_event(
                    event_type=SECURITY_EVENT_TYPES.get('PATH_TRAVERSAL', 'path_traversal_attempt'),
                    message=f"Path traversal attempt detected: {user_path}",
                    priority=self._get_priority_by_risk(result['risk_level']),
                    user_path=user_path,
                    decoded_path=decoded_path,
                    violations=result['violations'],
                    risk_level=result['risk_level']
                )
            
            return result
            
        except Exception as e:
            self.logger.error(f"路徑驗證失敗: {e}")
            return {
                'is_safe': False,
                'violations': [f"驗證失敗: {e}"],
                'risk_level': 'critical'
            }
    
    def _decode_path(self, path: str) -> str:
        """安全解碼路徑"""
        try:
            # 多次 URL 解碼
            decoded = path
            for _ in range(3):  # 最多解碼3次
                new_decoded = unquote(decoded)
                if new_decoded == decoded:
                    break
                decoded = new_decoded
            
            # 處理特殊編碼
            decoded = decoded.replace('%c0%ae', '.')
            decoded = decoded.replace('%c1%9c', '.')
            
            return decoded
            
        except Exception as e:
            self.logger.warning(f"路徑解碼失敗: {e}")
            return path
    
    def _check_dangerous_patterns(self, path: str) -> List[str]:
        """檢查危險模式"""
        violations = []
        
        for pattern in self.dangerous_patterns:
            if re.search(pattern, path, re.IGNORECASE):
                violations.append(f"包含危險模式: {pattern}")
        
        # 檢查系統目錄
        for sys_dir in self.system_directories:
            if sys_dir.lower() in path.lower():
                violations.append(f"嘗試存取系統目錄: {sys_dir}")
        
        return violations
    
    def _normalize_path(self, path: str, base_path: Optional[str] = None) -> str:
        """正規化路徑"""
        try:
            # 如果有基礎路徑，先結合
            if base_path:
                if not os.path.isabs(path):
                    # 相對路徑，結合基礎路徑
                    combined_path = os.path.join(base_path, path)
                else:
                    # 絕對路徑，檢查是否在基礎路徑內
                    combined_path = path
            else:
                combined_path = path
            
            # 正規化路徑
            normalized = os.path.normpath(combined_path)
            
            # 解析絕對路徑
            resolved = os.path.realpath(normalized)
            
            return resolved
            
        except Exception as e:
            raise SecurityException(f"路徑正規化失敗: {e}")
    
    def _check_path_containment(self, resolved_path: str, base_path: str) -> Dict[str, Any]:
        """檢查路徑是否包含在基礎路徑內"""
        try:
            resolved_base = os.path.realpath(base_path)
            
            # 確保兩個路徑都以 / 結尾進行比較
            if not resolved_base.endswith(os.sep):
                resolved_base += os.sep
            
            if not resolved_path.startswith(resolved_base):
                return {
                    'is_contained': False,
                    'base_path': resolved_base,
                    'attempted_path': resolved_path
                }
            
            return {
                'is_contained': True,
                'base_path': resolved_base,
                'resolved_path': resolved_path
            }
            
        except Exception as e:
            return {
                'is_contained': False,
                'error': str(e)
            }
    
    def _check_sensitive_file(self, path: str) -> Dict[str, Any]:
        """檢查是否為敏感文件"""
        filename = os.path.basename(path)
        
        for pattern in self.sensitive_file_patterns:
            if re.search(pattern, filename, re.IGNORECASE):
                return {
                    'is_sensitive': True,
                    'type': pattern,
                    'filename': filename
                }
        
        return {'is_sensitive': False}
    
    def _check_file_extension(self, path: str) -> Dict[str, Any]:
        """檢查文件擴展名"""
        _, extension = os.path.splitext(path)
        extension = extension.lower()
        
        # 檢查被阻止的擴展名
        if extension in self.config['blocked_extensions']:
            return {
                'is_allowed': False,
                'extension': extension,
                'reason': 'blocked_extension'
            }
        
        # 如果設置了允許列表，檢查是否在列表中
        if self.config.get('allowed_extensions'):
            if extension not in self.config['allowed_extensions']:
                return {
                    'is_allowed': False,
                    'extension': extension,
                    'reason': 'not_in_allowlist'
                }
        
        return {
            'is_allowed': True,
            'extension': extension
        }
    
    def _check_directory_depth(self, path: str) -> int:
        """檢查目錄深度"""
        return len(Path(path).parts)
    
    def _get_priority_by_risk(self, risk_level: str) -> str:
        """根據風險等級獲取優先級"""
        risk_to_priority = {
            'low': 'LOW',
            'medium': 'MEDIUM',
            'high': 'HIGH',
            'critical': 'CRITICAL'
        }
        return risk_to_priority.get(risk_level, 'MEDIUM')
    
    def sanitize_filename(self, filename: str) -> str:
        """清理文件名"""
        try:
            # 移除路徑分隔符
            sanitized = filename.replace('/', '_').replace('\\', '_')
            
            # 移除危險字符
            sanitized = re.sub(r'[<>:"|?*]', '_', sanitized)
            
            # 移除控制字符
            sanitized = re.sub(r'[\x00-\x1f\x7f]', '', sanitized)
            
            # 移除前後空白和點
            sanitized = sanitized.strip(' .')
            
            # 確保不為空
            if not sanitized:
                sanitized = 'unknown_file'
            
            # 限制長度
            if len(sanitized) > 255:
                name, ext = os.path.splitext(sanitized)
                max_name_len = 255 - len(ext)
                sanitized = name[:max_name_len] + ext
            
            return sanitized
            
        except Exception as e:
            self.logger.warning(f"文件名清理失敗: {e}")
            return 'sanitized_file'
    
    def get_safe_path(self, user_path: str, base_path: str) -> Optional[str]:
        """獲取安全的路徑"""
        try:
            validation = self.validate_path(user_path, base_path)
            
            if validation['is_safe']:
                return validation['resolved_path']
            else:
                self.logger.warning(f"路徑不安全: {user_path}, 違規: {validation['violations']}")
                return None
                
        except Exception as e:
            self.logger.error(f"獲取安全路徑失敗: {e}")
            return None
    
    def create_secure_file_handler(self, base_directory: str):
        """創建安全的文件處理器"""
        
        def secure_file_access(filename: str, mode: str = 'r') -> Optional[object]:
            """安全的文件存取函數"""
            try:
                # 驗證路徑
                validation = self.validate_path(filename, base_directory)
                
                if not validation['is_safe']:
                    self.logger.warning(f"拒絕文件存取: {filename}, 原因: {validation['violations']}")
                    raise SecurityException(f"不安全的文件路徑: {filename}")
                
                safe_path = validation['resolved_path']
                
                # 檢查文件是否存在
                if 'r' in mode and not os.path.exists(safe_path):
                    raise FileNotFoundError(f"文件不存在: {safe_path}")
                
                # 檢查權限
                if 'w' in mode or 'a' in mode:
                    directory = os.path.dirname(safe_path)
                    if not os.access(directory, os.W_OK):
                        raise PermissionError(f"沒有寫入權限: {directory}")
                
                # 安全打開文件
                return open(safe_path, mode, encoding='utf-8')
                
            except Exception as e:
                self.logger.error(f"安全文件存取失敗: {e}")
                raise
        
        return secure_file_access
    
    def scan_directory_for_vulnerabilities(self, directory: str) -> Dict[str, Any]:
        """掃描目錄的安全漏洞"""
        try:
            vulnerabilities = {
                'total_files': 0,
                'sensitive_files': [],
                'suspicious_files': [],
                'world_writable': [],
                'symlinks': [],
                'large_files': [],
                'recommendations': []
            }
            
            max_file_size = 100 * 1024 * 1024  # 100MB
            
            for root, dirs, files in os.walk(directory):
                for file in files:
                    file_path = os.path.join(root, file)
                    vulnerabilities['total_files'] += 1
                    
                    try:
                        # 檢查敏感文件
                        sensitive_check = self._check_sensitive_file(file_path)
                        if sensitive_check['is_sensitive']:
                            vulnerabilities['sensitive_files'].append({
                                'path': file_path,
                                'type': sensitive_check['type']
                            })
                        
                        # 檢查符號鏈接
                        if os.path.islink(file_path):
                            link_target = os.readlink(file_path)
                            vulnerabilities['symlinks'].append({
                                'path': file_path,
                                'target': link_target
                            })
                        
                        # 檢查權限
                        file_stat = os.stat(file_path)
                        if file_stat.st_mode & 0o002:  # world writable
                            vulnerabilities['world_writable'].append(file_path)
                        
                        # 檢查大文件
                        if file_stat.st_size > max_file_size:
                            vulnerabilities['large_files'].append({
                                'path': file_path,
                                'size': file_stat.st_size
                            })
                        
                        # 檢查可疑文件
                        if any(pattern in file.lower() for pattern in ['backup', 'temp', 'tmp', 'old']):
                            vulnerabilities['suspicious_files'].append(file_path)
                    
                    except (OSError, PermissionError):
                        continue
            
            # 生成建議
            if vulnerabilities['sensitive_files']:
                vulnerabilities['recommendations'].append("移除或保護敏感文件")
            if vulnerabilities['world_writable']:
                vulnerabilities['recommendations'].append("修改世界可寫文件的權限")
            if vulnerabilities['symlinks']:
                vulnerabilities['recommendations'].append("檢查符號鏈接的安全性")
            
            return vulnerabilities
            
        except Exception as e:
            self.logger.error(f"目錄安全掃描失敗: {e}")
            raise SecurityException(f"目錄安全掃描失敗: {e}")


# 便利函數
def validate_file_path(path: str, base_path: Optional[str] = None) -> Dict[str, Any]:
    """快速驗證文件路徑"""
    guard = PathTraversalGuard()
    return guard.validate_path(path, base_path)

def get_safe_filename(filename: str) -> str:
    """快速獲取安全的文件名"""
    guard = PathTraversalGuard()
    return guard.sanitize_filename(filename)

def create_safe_file_opener(base_directory: str):
    """快速創建安全的文件開啟器"""
    guard = PathTraversalGuard()
    return guard.create_secure_file_handler(base_directory)


if __name__ == "__main__":
    # 測試路徑遍歷防護
    guard = PathTraversalGuard()
    
    # 測試路徑
    test_paths = [
        "file.txt",                    # 安全路徑
        "../etc/passwd",               # 路徑遍歷
        "..\\windows\\system32",       # Windows 路徑遍歷
        "%2e%2e%2fpasswd",            # URL 編碼路徑遍歷
        "normal/path/file.html",       # 正常路徑
        ".env",                        # 敏感文件
        "upload.php",                  # 危險文件類型
    ]
    
    base_path = "/var/www/html"
    
    for path in test_paths:
        result = guard.validate_path(path, base_path)
        print(f"路徑: {path}")
        print(f"安全: {result['is_safe']}")
        print(f"風險等級: {result['risk_level']}")
        if result['violations']:
            print(f"違規: {result['violations']}")
        print("-" * 40)
    
    # 測試文件名清理
    dirty_filename = "../<script>alert('xss')</script>.txt"
    clean_filename = guard.sanitize_filename(dirty_filename)
    print(f"原始文件名: {dirty_filename}")
    print(f"清理後: {clean_filename}")
    
    print("路徑遍歷防護測試完成")
