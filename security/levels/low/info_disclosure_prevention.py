"""
信息洩露防護模組 (LOW 層級)
防止敏感信息意外洩露，包括錯誤信息、系統信息、調試信息等
"""

import re
import json
import traceback
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from pathlib import Path

# 引入 INFO 層級的基礎模組 - 按四層架構依賴
from ..info.info_0.security_constants import SECURITY_EVENT_TYPES, LOG_LEVELS
from ..info.info_1.security_exceptions import SecurityException, InputValidationError
from ..info.info_2.security_logger import SecurityLogger, log_security_event
from ..info.info_3.config_manager import get_config


class InfoDisclosurePrevention:
    """信息洩露防護類"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.logger = SecurityLogger()
        self.config = config or {}
        
        # 敏感信息模式
        self.sensitive_patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'(\+?886-?|0)?[2-9]\d{2,3}-?\d{3}-?\d{3,4}',
            'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
            'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
            'ip_address': r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
            'api_key': r'[Aa][Pp][Ii][_-]?[Kk][Ee][Yy][\s]*[:=][\s]*[\'"]?([A-Za-z0-9]{32,})[\'"]?',
            'password': r'[Pp]assword[\s]*[:=][\s]*[\'"]?([^\s\'"]{6,})[\'"]?',
            'secret': r'[Ss]ecret[\s]*[:=][\s]*[\'"]?([A-Za-z0-9]{16,})[\'"]?',
            'token': r'[Tt]oken[\s]*[:=][\s]*[\'"]?([A-Za-z0-9._-]{20,})[\'"]?',
        }
        
        # 敏感文件路徑模式
        self.sensitive_file_patterns = [
            r'\.env',
            r'config\.py',
            r'settings\.py',
            r'\.git/',
            r'\.ssh/',
            r'id_rsa',
            r'\.pem$',
            r'\.key$',
            r'backup\.',
            r'\.sql$',
            r'\.db$',
            r'\.sqlite',
        ]
        
        # 系統信息模式
        self.system_info_patterns = {
            'server_version': r'Server:\s+([^\r\n]+)',
            'php_version': r'PHP/([0-9.]+)',
            'apache_version': r'Apache/([0-9.]+)',
            'mysql_version': r'MySQL\s+([0-9.]+)',
            'python_version': r'Python\s+([0-9.]+)',
        }
        
        # 錯誤信息模式
        self.error_patterns = [
            r'Traceback \(most recent call last\):',
            r'Fatal error:',
            r'Warning:',
            r'Notice:',
            r'Exception in thread',
            r'Stack trace:',
            r'ORA-\d+:',  # Oracle 錯誤
            r'ERROR \d+',  # MySQL 錯誤
        ]
        
        self.logger.info("信息洩露防護模組初始化完成")
    
    def scan_text_for_leaks(self, text: str, context: str = "") -> Dict[str, Any]:
        """掃描文本中的信息洩露"""
        findings = {
            'has_leaks': False,
            'leak_count': 0,
            'sensitive_data': [],
            'system_info': [],
            'error_traces': [],
            'recommendations': []
        }
        
        try:
            # 檢查敏感數據
            for data_type, pattern in self.sensitive_patterns.items():
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    findings['has_leaks'] = True
                    findings['leak_count'] += len(matches)
                    findings['sensitive_data'].append({
                        'type': data_type,
                        'count': len(matches),
                        'sample': matches[0] if matches else None,
                        'masked_sample': self._mask_sensitive_data(matches[0], data_type) if matches else None
                    })
            
            # 檢查系統信息洩露
            for info_type, pattern in self.system_info_patterns.items():
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    findings['has_leaks'] = True
                    findings['system_info'].append({
                        'type': info_type,
                        'value': matches[0]
                    })
            
            # 檢查錯誤追蹤信息
            for pattern in self.error_patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    findings['has_leaks'] = True
                    findings['error_traces'].append(pattern)
            
            # 生成建議
            if findings['has_leaks']:
                findings['recommendations'] = self._generate_recommendations(findings)
                
                # 記錄安全事件
                self.logger.log_security_event(
                    event_type=SECURITY_EVENT_TYPES.get('INFO_DISCLOSURE', 'info_disclosure'),
                    message=f"Information disclosure detected in {context}",
                    priority="LOW",
                    leak_count=findings['leak_count'],
                    context=context,
                    findings_summary=self._summarize_findings(findings)
                )
            
            return findings
            
        except Exception as e:
            self.logger.error(f"信息洩露掃描失敗: {e}")
            raise SecurityException(f"信息洩露掃描失敗: {e}")
    
    def scan_file_for_leaks(self, file_path: str) -> Dict[str, Any]:
        """掃描文件中的信息洩露"""
        try:
            path = Path(file_path)
            
            # 檢查文件名是否敏感
            filename_risk = self._check_sensitive_filename(path.name)
            
            if not path.exists():
                raise InputValidationError(f"文件不存在: {file_path}")
            
            # 讀取文件內容
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read(10000)  # 限制讀取大小
            except UnicodeDecodeError:
                # 嘗試其他編碼
                with open(path, 'r', encoding='latin-1') as f:
                    content = f.read(10000)
            
            # 掃描內容
            findings = self.scan_text_for_leaks(content, f"file:{file_path}")
            findings['filename_risk'] = filename_risk
            
            return findings
            
        except Exception as e:
            self.logger.error(f"文件掃描失敗 {file_path}: {e}")
            raise SecurityException(f"文件掃描失敗: {e}")
    
    def scan_directory_for_leaks(self, directory_path: str, recursive: bool = True) -> Dict[str, Any]:
        """掃描目錄中的信息洩露"""
        try:
            dir_path = Path(directory_path)
            if not dir_path.exists():
                raise InputValidationError(f"目錄不存在: {directory_path}")
            
            results = {
                'total_files': 0,
                'scanned_files': 0,
                'files_with_leaks': 0,
                'total_leaks': 0,
                'file_results': {},
                'summary': {
                    'high_risk_files': [],
                    'sensitive_filenames': [],
                    'common_leak_types': {}
                }
            }
            
            # 獲取文件列表
            if recursive:
                files = list(dir_path.rglob('*'))
            else:
                files = list(dir_path.iterdir())
            
            text_extensions = {'.txt', '.py', '.js', '.html', '.css', '.json', '.xml', '.log', '.config'}
            
            for file_path in files:
                if file_path.is_file():
                    results['total_files'] += 1
                    
                    # 檢查文件名
                    if self._check_sensitive_filename(file_path.name)['is_sensitive']:
                        results['summary']['sensitive_filenames'].append(str(file_path))
                    
                    # 只掃描文本文件
                    if file_path.suffix.lower() in text_extensions and file_path.stat().st_size < 1024*1024:  # 小於1MB
                        try:
                            file_findings = self.scan_file_for_leaks(str(file_path))
                            results['scanned_files'] += 1
                            
                            if file_findings['has_leaks']:
                                results['files_with_leaks'] += 1
                                results['total_leaks'] += file_findings['leak_count']
                                results['file_results'][str(file_path)] = file_findings
                                
                                # 統計洩露類型
                                for leak in file_findings['sensitive_data']:
                                    leak_type = leak['type']
                                    results['summary']['common_leak_types'][leak_type] = \
                                        results['summary']['common_leak_types'].get(leak_type, 0) + leak['count']
                                
                                # 高風險文件
                                if file_findings['leak_count'] >= 3:
                                    results['summary']['high_risk_files'].append(str(file_path))
                        
                        except Exception as e:
                            self.logger.warning(f"掃描文件失敗 {file_path}: {e}")
                            continue
            
            # 記錄目錄掃描結果
            if results['files_with_leaks'] > 0:
                self.logger.log_security_event(
                    event_type=SECURITY_EVENT_TYPES.get('INFO_DISCLOSURE', 'info_disclosure'),
                    message=f"Directory scan found information leaks in {directory_path}",
                    priority="LOW",
                    total_files=results['total_files'],
                    files_with_leaks=results['files_with_leaks'],
                    total_leaks=results['total_leaks']
                )
            
            return results
            
        except Exception as e:
            self.logger.error(f"目錄掃描失敗 {directory_path}: {e}")
            raise SecurityException(f"目錄掃描失敗: {e}")
    
    def _check_sensitive_filename(self, filename: str) -> Dict[str, Any]:
        """檢查文件名是否敏感"""
        result = {
            'is_sensitive': False,
            'matched_patterns': [],
            'risk_level': 'none'
        }
        
        for pattern in self.sensitive_file_patterns:
            if re.search(pattern, filename, re.IGNORECASE):
                result['is_sensitive'] = True
                result['matched_patterns'].append(pattern)
        
        if result['is_sensitive']:
            if any(p in filename.lower() for p in ['.env', 'secret', 'key', 'password']):
                result['risk_level'] = 'high'
            elif any(p in filename.lower() for p in ['config', 'settings', '.git']):
                result['risk_level'] = 'medium'
            else:
                result['risk_level'] = 'low'
        
        return result
    
    def _mask_sensitive_data(self, data: str, data_type: str) -> str:
        """遮蔽敏感數據"""
        if not data:
            return ""
        
        if data_type == 'email':
            parts = data.split('@')
            if len(parts) == 2:
                username = parts[0]
                domain = parts[1]
                if len(username) > 2:
                    masked_username = username[:2] + '*' * (len(username) - 2)
                else:
                    masked_username = '*' * len(username)
                return f"{masked_username}@{domain}"
        
        elif data_type == 'phone':
            if len(data) >= 4:
                return data[:2] + '*' * (len(data) - 4) + data[-2:]
            else:
                return '*' * len(data)
        
        elif data_type == 'credit_card':
            # 只顯示後四位
            return '*' * (len(data) - 4) + data[-4:]
        
        elif data_type in ['api_key', 'password', 'secret', 'token']:
            if len(data) >= 6:
                return data[:3] + '*' * (len(data) - 6) + data[-3:]
            else:
                return '*' * len(data)
        
        else:
            # 默認遮蔽
            if len(data) >= 4:
                return data[:2] + '*' * (len(data) - 4) + data[-2:]
            else:
                return '*' * len(data)
    
    def _generate_recommendations(self, findings: Dict[str, Any]) -> List[str]:
        """生成修復建議"""
        recommendations = []
        
        if findings['sensitive_data']:
            recommendations.append("移除或遮蔽敏感數據，如電子郵件、電話號碼、API 密鑰等")
            
            # 具體建議
            for data in findings['sensitive_data']:
                data_type = data['type']
                if data_type in ['api_key', 'password', 'secret', 'token']:
                    recommendations.append(f"將 {data_type} 移至環境變數或安全配置文件")
                elif data_type in ['email', 'phone']:
                    recommendations.append(f"使用數據遮蔽技術隱藏 {data_type}")
        
        if findings['system_info']:
            recommendations.append("隱藏系統版本信息，配置伺服器不顯示版本號")
        
        if findings['error_traces']:
            recommendations.append("配置錯誤處理，避免向用戶顯示詳細的錯誤追蹤信息")
            recommendations.append("使用自定義錯誤頁面替代系統默認錯誤信息")
        
        return recommendations
    
    def _summarize_findings(self, findings: Dict[str, Any]) -> str:
        """總結發現的問題"""
        summary_parts = []
        
        if findings['sensitive_data']:
            data_types = [d['type'] for d in findings['sensitive_data']]
            summary_parts.append(f"敏感數據: {', '.join(data_types)}")
        
        if findings['system_info']:
            info_types = [i['type'] for i in findings['system_info']]
            summary_parts.append(f"系統信息: {', '.join(info_types)}")
        
        if findings['error_traces']:
            summary_parts.append(f"錯誤追蹤: {len(findings['error_traces'])} 個模式")
        
        return "; ".join(summary_parts)
    
    def sanitize_error_message(self, error_message: str, show_generic: bool = True) -> str:
        """清理錯誤信息，移除敏感內容"""
        try:
            sanitized = error_message
            
            # 移除文件路徑
            sanitized = re.sub(r'[A-Za-z]:[\\\/][^\\\/\s]+[\\\/][^\\\/\s]*', '[PATH]', sanitized)
            sanitized = re.sub(r'\/[^\/\s]+\/[^\/\s]*', '[PATH]', sanitized)
            
            # 移除 IP 地址
            sanitized = re.sub(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', '[IP]', sanitized)
            
            # 移除用戶名
            sanitized = re.sub(r'user[=:][\s]*[\'"]?([^\'"\s]+)[\'"]?', 'user=[USER]', sanitized, flags=re.IGNORECASE)
            
            # 移除密碼
            sanitized = re.sub(r'password[=:][\s]*[\'"]?([^\'"\s]+)[\'"]?', 'password=[HIDDEN]', sanitized, flags=re.IGNORECASE)
            sanitized = re.sub(r'pwd[=:][\s]*[\'"]?([^\'"\s]+)[\'"]?', 'pwd=[HIDDEN]', sanitized, flags=re.IGNORECASE)
            sanitized = re.sub(r'passwd[=:][\s]*[\'"]?([^\'"\s]+)[\'"]?', 'passwd=[HIDDEN]', sanitized, flags=re.IGNORECASE)
            
            # 移除 API 金鑰和令牌
            sanitized = re.sub(r'(api[_-]?key|token|secret)[=:][\s]*[\'"]?([^\'"\s]+)[\'"]?', r'\1=[HIDDEN]', sanitized, flags=re.IGNORECASE)
            
            # 移除詳細的堆疊追蹤
            if 'Traceback' in sanitized:
                lines = sanitized.split('\n')
                # 只保留第一行和最後一行
                if len(lines) > 3:
                    sanitized = lines[0] + '\n[詳細錯誤信息已隱藏]\n' + lines[-1]
            
            if show_generic and len(sanitized.strip()) == 0:
                return "發生了一個內部錯誤，請聯繫系統管理員"
            
            return sanitized
            
        except Exception as e:
            self.logger.error(f"錯誤信息清理失敗: {e}")
            return "發生了一個內部錯誤，請聯繫系統管理員" if show_generic else ""
    
    def create_safe_error_response(self, error: Exception, request_id: str = None) -> Dict[str, Any]:
        """創建安全的錯誤響應"""
        try:
            # 記錄完整錯誤到日誌
            self.logger.error(f"錯誤發生: {str(error)}", extra={
                'error_type': type(error).__name__,
                'request_id': request_id,
                'traceback': traceback.format_exc()
            })
            
            # 返回安全的錯誤響應
            safe_response = {
                'error': True,
                'message': "請求處理失敗",
                'error_code': 'INTERNAL_ERROR',
                'timestamp': datetime.now().isoformat()
            }
            
            if request_id:
                safe_response['request_id'] = request_id
            
            return safe_response
            
        except Exception as e:
            self.logger.critical(f"創建安全錯誤響應失敗: {e}")
            return {
                'error': True,
                'message': "系統暫時無法處理請求",
                'error_code': 'SYSTEM_ERROR'
            }


# 便利函數
def scan_for_info_leaks(text: str, context: str = "") -> Dict[str, Any]:
    """快速掃描文本中的信息洩露"""
    scanner = InfoDisclosurePrevention()
    return scanner.scan_text_for_leaks(text, context)

def sanitize_error(error_message: str) -> str:
    """快速清理錯誤信息"""
    scanner = InfoDisclosurePrevention()
    return scanner.sanitize_error_message(error_message)

def create_safe_error(error: Exception, request_id: str = None) -> Dict[str, Any]:
    """快速創建安全錯誤響應"""
    scanner = InfoDisclosurePrevention()
    return scanner.create_safe_error_response(error, request_id)


if __name__ == "__main__":
    # 測試信息洩露防護
    scanner = InfoDisclosurePrevention()
    
    # 測試文本掃描
    test_text = """
    Database connection failed: mysql://user:password123@192.168.1.100:3306/mydb
    API Key: api_key_abc123def456ghi789
    Contact us at: admin@example.com or call 02-1234-5678
    """
    
    results = scanner.scan_text_for_leaks(test_text, "test")
    print(f"發現 {results['leak_count']} 個信息洩露")
    
    # 測試錯誤清理
    error_msg = "Traceback (most recent call last):\n  File '/home/user/app.py', line 123\nError: Database connection failed"
    clean_msg = scanner.sanitize_error_message(error_msg)
    print(f"清理後的錯誤信息: {clean_msg}")
    
    print("信息洩露防護測試完成")
