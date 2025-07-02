"""
安全日誌系統 - INFO-2 層級
提供基礎日誌功能，依賴 INFO-0 常數和 INFO-1 例外
"""
import logging
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional

# 依賴 INFO-0 和 INFO-1 層級
from ..info_0.security_constants import LOG_LEVELS, SECURITY_EVENT_TYPES, SECURITY_PRIORITY
from ..info_1.security_exceptions import SecurityException


class SecurityLogger:
    """資安專用日誌記錄器"""
    
    def __init__(self, name: str = "security", log_file: str = "security.log", 
                 log_level: str = "INFO", enable_console: bool = True):
        
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, log_level.upper()))
        
        # 避免重複添加 handler
        if not self.logger.handlers:
            self._setup_handlers(log_file, enable_console)
    
    def _setup_handlers(self, log_file: str, enable_console: bool):
        """設置日誌處理器"""
        formatter = SecurityLogFormatter()
        
        # 文件處理器
        if log_file:
            # 確保日誌目錄存在
            log_dir = os.path.dirname(log_file) if os.path.dirname(log_file) else "logs"
            os.makedirs(log_dir, exist_ok=True)
            
            file_handler = logging.FileHandler(log_file, encoding='utf-8')
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
        
        # 控制台處理器
        if enable_console:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)
    
    def log_security_event(self, event_type: str, message: str, 
                          priority: str = "INFO", **kwargs):
        """記錄安全事件"""
        extra_data = {
            'event_type': event_type,
            'priority': priority,
            'timestamp': datetime.now().isoformat(),
            **kwargs
        }
        
        # 根據優先級選擇日誌等級
        log_level = self._get_log_level_by_priority(priority)
        self.logger.log(log_level, message, extra=extra_data)
    
    def log_xss_attempt(self, content: str, user_ip: str = None, 
                       user_id: str = None, request_path: str = None):
        """記錄 XSS 攻擊嘗試"""
        self.log_security_event(
            event_type=SECURITY_EVENT_TYPES['XSS_ATTEMPT'],
            message=f"XSS attack attempt detected",
            priority="HIGH",
            content_preview=content[:100],
            user_ip=user_ip,
            user_id=user_id,
            request_path=request_path
        )
    
    def log_authentication_failure(self, username: str, user_ip: str = None, 
                                 reason: str = None):
        """記錄認證失敗"""
        self.log_security_event(
            event_type=SECURITY_EVENT_TYPES['BRUTE_FORCE_ATTACK'],
            message=f"Authentication failed for user: {username}",
            priority="MEDIUM",
            username=username,
            user_ip=user_ip,
            failure_reason=reason
        )
    
    def log_rate_limit_violation(self, identifier: str, limit: int, 
                                time_window: int, request_count: int):
        """記錄速率限制違規"""
        self.log_security_event(
            event_type=SECURITY_EVENT_TYPES['RATE_LIMIT_VIOLATION'],
            message=f"Rate limit exceeded for {identifier}",
            priority="MEDIUM",
            identifier=identifier,
            limit=limit,
            time_window=time_window,
            request_count=request_count
        )
    
    def log_file_upload_attack(self, filename: str, file_type: str, 
                              user_ip: str = None, reason: str = None):
        """記錄檔案上傳攻擊"""
        self.log_security_event(
            event_type=SECURITY_EVENT_TYPES['FILE_UPLOAD_ATTACK'],
            message=f"Malicious file upload attempt: {filename}",
            priority="HIGH",
            filename=filename,
            file_type=file_type,
            user_ip=user_ip,
            detection_reason=reason
        )
    
    def log_unauthorized_access(self, resource: str, user_id: str = None, 
                               user_ip: str = None, required_permission: str = None):
        """記錄未授權存取"""
        self.log_security_event(
            event_type=SECURITY_EVENT_TYPES['UNAUTHORIZED_ACCESS'],
            message=f"Unauthorized access attempt to: {resource}",
            priority="HIGH",
            resource=resource,
            user_id=user_id,
            user_ip=user_ip,
            required_permission=required_permission
        )
    
    def _get_log_level_by_priority(self, priority: str) -> int:
        """根據安全優先級轉換為日誌等級"""
        priority_to_log_level = {
            'INFO': logging.INFO,
            'LOW': logging.INFO,
            'MEDIUM': logging.WARNING,
            'HIGH': logging.ERROR,
            'CRITICAL': logging.CRITICAL
        }
        return priority_to_log_level.get(priority.upper(), logging.INFO)
    
    def info(self, message: str, **kwargs):
        """記錄 INFO 級別日誌"""
        self.logger.info(message, extra=kwargs)
    
    def warning(self, message: str, **kwargs):
        """記錄 WARNING 級別日誌"""
        self.logger.warning(message, extra=kwargs)
    
    def error(self, message: str, **kwargs):
        """記錄 ERROR 級別日誌"""
        self.logger.error(message, extra=kwargs)
    
    def critical(self, message: str, **kwargs):
        """記錄 CRITICAL 級別日誌"""
        self.logger.critical(message, extra=kwargs)
    
    def debug(self, message: str, **kwargs):
        """記錄 DEBUG 級別日誌"""
        self.logger.debug(message, extra=kwargs)
    


class SecurityLogFormatter(logging.Formatter):
    """安全日誌格式化器"""
    
    def format(self, record):
        # 基本日誌信息
        log_entry = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # 添加安全相關的額外信息
        if hasattr(record, 'event_type'):
            log_entry['event_type'] = record.event_type
        if hasattr(record, 'priority'):
            log_entry['priority'] = record.priority
        if hasattr(record, 'user_ip'):
            log_entry['user_ip'] = record.user_ip
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        
        # 收集其他自定義欄位
        security_fields = {}
        for key, value in record.__dict__.items():
            if key not in ['name', 'msg', 'args', 'levelname', 'levelno', 
                          'pathname', 'filename', 'module', 'lineno', 
                          'funcName', 'created', 'msecs', 'relativeCreated',
                          'thread', 'threadName', 'processName', 'process',
                          'getMessage', 'exc_info', 'exc_text', 'stack_info',
                          'message', 'event_type', 'priority', 'user_ip', 'user_id']:
                security_fields[key] = value
        
        if security_fields:
            log_entry['details'] = security_fields
        
        return json.dumps(log_entry, ensure_ascii=False, default=str)


class SecurityLogAnalyzer:
    """安全日誌分析器"""
    
    def __init__(self, log_file: str):
        self.log_file = log_file
    
    def analyze_recent_events(self, hours: int = 24) -> Dict[str, Any]:
        """分析最近的安全事件"""
        events = self._read_recent_logs(hours)
        
        analysis = {
            'total_events': len(events),
            'events_by_type': {},
            'events_by_priority': {},
            'top_source_ips': {},
            'timeline': []
        }
        
        for event in events:
            # 按類型統計
            event_type = event.get('event_type', 'unknown')
            analysis['events_by_type'][event_type] = analysis['events_by_type'].get(event_type, 0) + 1
            
            # 按優先級統計
            priority = event.get('priority', 'INFO')
            analysis['events_by_priority'][priority] = analysis['events_by_priority'].get(priority, 0) + 1
            
            # 統計來源 IP
            if 'user_ip' in event:
                ip = event['user_ip']
                analysis['top_source_ips'][ip] = analysis['top_source_ips'].get(ip, 0) + 1
            
            # 時間線
            analysis['timeline'].append({
                'timestamp': event.get('timestamp'),
                'event_type': event_type,
                'priority': priority,
                'message': event.get('message', '')[:100]
            })
        
        # 排序 Top IPs
        analysis['top_source_ips'] = dict(
            sorted(analysis['top_source_ips'].items(), 
                  key=lambda x: x[1], reverse=True)[:10]
        )
        
        return analysis
    
    def _read_recent_logs(self, hours: int) -> list:
        """讀取最近的日誌記錄"""
        events = []
        cutoff_time = datetime.now().timestamp() - (hours * 3600)
        
        try:
            with open(self.log_file, 'r', encoding='utf-8') as f:
                for line in f:
                    try:
                        event = json.loads(line.strip())
                        event_time = datetime.fromisoformat(event.get('timestamp', '')).timestamp()
                        if event_time >= cutoff_time:
                            events.append(event)
                    except (json.JSONDecodeError, ValueError):
                        continue
        except FileNotFoundError:
            pass
        
        return events
    
    def get_attack_patterns(self) -> Dict[str, Any]:
        """分析攻擊模式"""
        events = self._read_recent_logs(24)
        
        patterns = {
            'repeated_attacks': {},  # 重複攻擊的 IP
            'escalating_attacks': [],  # 攻擊升級模式
            'coordinated_attacks': []  # 協調攻擊
        }
        
        # 分析重複攻擊
        ip_events = {}
        for event in events:
            if 'user_ip' in event and event.get('priority') in ['HIGH', 'CRITICAL']:
                ip = event['user_ip']
                if ip not in ip_events:
                    ip_events[ip] = []
                ip_events[ip].append(event)
        
        # 找出重複攻擊的 IP
        for ip, ip_event_list in ip_events.items():
            if len(ip_event_list) >= 3:  # 3次以上高危事件
                patterns['repeated_attacks'][ip] = {
                    'count': len(ip_event_list),
                    'event_types': list(set(e.get('event_type', '') for e in ip_event_list)),
                    'latest_attack': ip_event_list[-1].get('timestamp')
                }
        
        return patterns


# 全域日誌記錄器實例
_security_logger = None

def get_security_logger(name: str = "security", log_file: str = "logs/security.log") -> SecurityLogger:
    """獲取全域安全日誌記錄器"""
    global _security_logger
    if _security_logger is None:
        _security_logger = SecurityLogger(name, log_file)
    return _security_logger


# 便利函數
def log_security_event(event_type: str, message: str, priority: str = "INFO", **kwargs):
    """快速記錄安全事件"""
    logger = get_security_logger()
    logger.log_security_event(event_type, message, priority, **kwargs)


def log_attack_attempt(attack_type: str, details: Dict[str, Any]):
    """快速記錄攻擊嘗試"""
    priority_mapping = {
        'xss': 'HIGH',
        'sql_injection': 'CRITICAL',
        'file_upload': 'HIGH',
        'brute_force': 'MEDIUM',
        'csrf': 'MEDIUM'
    }
    
    priority = priority_mapping.get(attack_type.lower(), 'MEDIUM')
    logger = get_security_logger()
    logger.log_security_event(
        event_type=f"{attack_type}_attempt",
        message=f"{attack_type.upper()} attack detected",
        priority=priority,
        **details
    )
