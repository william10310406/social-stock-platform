"""
端點安全模組 (LOW 層級)
提供 API 端點安全檢查、敏感路徑保護、請求驗證等功能
"""

import re
import json
from typing import Dict, Any, List, Optional, Set, Callable
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs
from collections import defaultdict, deque

# 引入 INFO 層級的基礎模組 - 按四層架構依賴
from ..info.info_0.security_constants import SECURITY_EVENT_TYPES, LOG_LEVELS
from ..info.info_1.security_exceptions import SecurityException, InputValidationError, RateLimitExceededError
from ..info.info_1.security_utils import SecurityUtils
from ..info.info_2.security_logger import SecurityLogger, log_security_event
from ..info.info_3.config_manager import get_config


class EndpointSecurity:
    """端點安全管理器"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.logger = SecurityLogger()
        self.config = config or self._get_default_config()
        
        # 敏感端點模式
        self.sensitive_endpoints = {
            'admin': {
                'patterns': [r'/admin', r'/administrator', r'/management', r'/console'],
                'risk_level': 'high',
                'require_auth': True
            },
            'auth': {
                'patterns': [r'/login', r'/logout', r'/auth', r'/signin', r'/signup'],
                'risk_level': 'medium',
                'require_auth': False
            },
            'api': {
                'patterns': [r'/api/', r'/rest/', r'/service/', r'/ws/'],
                'risk_level': 'medium',
                'require_auth': True
            },
            'debug': {
                'patterns': [r'/debug', r'/test', r'/dev', r'/_debug'],
                'risk_level': 'critical',
                'require_auth': True
            },
            'config': {
                'patterns': [r'/config', r'/settings', r'/preferences'],
                'risk_level': 'high',
                'require_auth': True
            }
        }
        
        # 危險端點模式
        self.dangerous_endpoints = [
            r'/phpinfo',
            r'/server-info',
            r'/server-status',
            r'/\.git/',
            r'/\.svn/',
            r'/backup',
            r'/dump',
            r'/export',
            r'/install',
            r'/setup',
            r'/migrate',
        ]
        
        # 可疑請求模式
        self.suspicious_patterns = {
            'sql_injection': [
                r'union\s+select', r'or\s+1=1', r'and\s+1=1',
                r'exec\s*\(', r'drop\s+table', r'delete\s+from'
            ],
            'xss': [
                r'<script', r'javascript:', r'onerror\s*=',
                r'onload\s*=', r'eval\s*\('
            ],
            'command_injection': [
                r';.*ls', r';.*cat', r';.*rm', r'\|\s*nc',
                r'`.*`', r'\$\(.*\)'
            ],
            'path_traversal': [
                r'\.\./', r'\.\.\\', r'%2e%2e%2f', r'%c0%ae'
            ]
        }
        
        # 請求速率限制器
        self.rate_limiters = {}
        
        # 異常請求追蹤
        self.anomaly_tracker = defaultdict(lambda: deque(maxlen=100))
        
        self.logger.info("端點安全模組初始化完成")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """獲取默認配置"""
        return {
            'max_request_size': 10 * 1024 * 1024,  # 10MB
            'max_url_length': 2048,
            'max_headers_count': 50,
            'max_query_params': 100,
            'allowed_methods': ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            'blocked_user_agents': [
                'scanner', 'bot', 'crawler', 'spider', 'automated'
            ],
            'rate_limit_requests': 100,
            'rate_limit_window': 3600,  # 1 hour
            'enable_anomaly_detection': True,
            'require_https': True,
            'allowed_origins': [],
            'debug_mode': False
        }
    
    def validate_request(self, request_info: Dict[str, Any]) -> Dict[str, Any]:
        """驗證請求安全性"""
        result = {
            'is_safe': True,
            'risk_level': 'low',
            'violations': [],
            'warnings': [],
            'blocked_reason': None,
            'recommendations': []
        }
        
        try:
            # 基本請求信息
            method = request_info.get('method', 'GET').upper()
            url = request_info.get('url', '')
            path = request_info.get('path', '')
            query_params = request_info.get('query_params', {})
            headers = request_info.get('headers', {})
            body = request_info.get('body', '')
            user_agent = headers.get('User-Agent', '')
            remote_ip = request_info.get('remote_ip', '')
            
            # 1. HTTP 方法檢查
            if method not in self.config['allowed_methods']:
                result['violations'].append(f"不允許的 HTTP 方法: {method}")
                result['is_safe'] = False
                result['risk_level'] = 'medium'
            
            # 2. URL 長度檢查
            if len(url) > self.config['max_url_length']:
                result['violations'].append(f"URL 長度超過限制: {len(url)}")
                result['is_safe'] = False
                result['risk_level'] = 'medium'
            
            # 3. HTTPS 檢查
            if self.config['require_https'] and not url.startswith('https://'):
                result['warnings'].append("建議使用 HTTPS")
            
            # 4. 敏感端點檢查
            endpoint_check = self._check_sensitive_endpoint(path)
            if endpoint_check['is_sensitive']:
                result['warnings'].append(f"存取敏感端點: {endpoint_check['type']}")
                if endpoint_check['risk_level'] in ['high', 'critical']:
                    result['risk_level'] = endpoint_check['risk_level']
            
            # 5. 危險端點檢查
            if self._check_dangerous_endpoint(path):
                result['violations'].append("嘗試存取危險端點")
                result['is_safe'] = False
                result['risk_level'] = 'critical'
            
            # 6. User-Agent 檢查
            ua_check = self._check_user_agent(user_agent)
            if not ua_check['is_allowed']:
                result['violations'].append(f"可疑的 User-Agent: {ua_check['reason']}")
                result['is_safe'] = False
                result['risk_level'] = 'medium'
            
            # 7. 請求大小檢查
            content_length = int(headers.get('Content-Length', 0))
            if content_length > self.config['max_request_size']:
                result['violations'].append(f"請求大小超過限制: {content_length}")
                result['is_safe'] = False
                result['risk_level'] = 'medium'
            
            # 8. 標頭數量檢查
            if len(headers) > self.config['max_headers_count']:
                result['violations'].append(f"HTTP 標頭數量過多: {len(headers)}")
                result['is_safe'] = False
                result['risk_level'] = 'low'
            
            # 9. 查詢參數檢查
            if len(query_params) > self.config['max_query_params']:
                result['violations'].append(f"查詢參數過多: {len(query_params)}")
                result['is_safe'] = False
                result['risk_level'] = 'medium'
            
            # 10. 可疑內容檢查
            suspicious_check = self._check_suspicious_content(url, query_params, body)
            if suspicious_check['found']:
                result['violations'].extend(suspicious_check['violations'])
                result['is_safe'] = False
                result['risk_level'] = 'high'
            
            # 11. 速率限制檢查
            if remote_ip:
                rate_check = self._check_rate_limit(remote_ip, path)
                if not rate_check['is_allowed']:
                    result['violations'].append("超過速率限制")
                    result['is_safe'] = False
                    result['blocked_reason'] = 'rate_limit_exceeded'
            
            # 12. 異常檢測
            if self.config['enable_anomaly_detection'] and remote_ip:
                anomaly_check = self._detect_anomaly(remote_ip, request_info)
                if anomaly_check['is_anomaly']:
                    result['warnings'].append(f"檢測到異常行為: {anomaly_check['reason']}")
                    if anomaly_check['severity'] == 'high':
                        result['risk_level'] = 'high'
            
            # 13. CORS 檢查
            origin = headers.get('Origin')
            if origin:
                cors_check = self._check_cors_origin(origin)
                if not cors_check['is_allowed']:
                    result['violations'].append(f"不允許的來源: {origin}")
                    result['is_safe'] = False
                    result['risk_level'] = 'medium'
            
            # 生成建議
            if not result['is_safe'] or result['warnings']:
                result['recommendations'] = self._generate_security_recommendations(result)
            
            # 記錄安全事件
            if not result['is_safe']:
                self._log_security_violation(request_info, result)
            
            return result
            
        except Exception as e:
            self.logger.error(f"請求驗證失敗: {e}")
            return {
                'is_safe': False,
                'risk_level': 'critical',
                'violations': [f"驗證失敗: {e}"],
                'blocked_reason': 'validation_error'
            }
    
    def _check_sensitive_endpoint(self, path: str) -> Dict[str, Any]:
        """檢查敏感端點"""
        for endpoint_type, config in self.sensitive_endpoints.items():
            for pattern in config['patterns']:
                if re.search(pattern, path, re.IGNORECASE):
                    return {
                        'is_sensitive': True,
                        'type': endpoint_type,
                        'risk_level': config['risk_level'],
                        'require_auth': config['require_auth']
                    }
        
        return {'is_sensitive': False}
    
    def _check_dangerous_endpoint(self, path: str) -> bool:
        """檢查危險端點"""
        for pattern in self.dangerous_endpoints:
            if re.search(pattern, path, re.IGNORECASE):
                return True
        return False
    
    def _check_user_agent(self, user_agent: str) -> Dict[str, Any]:
        """檢查 User-Agent"""
        if not user_agent:
            return {
                'is_allowed': False,
                'reason': 'empty_user_agent'
            }
        
        user_agent_lower = user_agent.lower()
        
        # 檢查被阻止的 User-Agent
        for blocked_pattern in self.config['blocked_user_agents']:
            if blocked_pattern in user_agent_lower:
                return {
                    'is_allowed': False,
                    'reason': f'blocked_pattern: {blocked_pattern}'
                }
        
        # 檢查可疑模式
        suspicious_patterns = ['curl', 'wget', 'python-requests', 'sqlmap', 'nikto']
        for pattern in suspicious_patterns:
            if pattern in user_agent_lower:
                return {
                    'is_allowed': False,
                    'reason': f'suspicious_tool: {pattern}'
                }
        
        return {'is_allowed': True}
    
    def _check_suspicious_content(self, url: str, query_params: Dict[str, Any], body: str) -> Dict[str, Any]:
        """檢查可疑內容"""
        result = {
            'found': False,
            'violations': [],
            'attack_types': []
        }
        
        # 合併所有要檢查的內容
        content_to_check = [url, json.dumps(query_params), body]
        
        for content in content_to_check:
            if not content:
                continue
                
            content_lower = content.lower()
            
            # 檢查各種攻擊模式
            for attack_type, patterns in self.suspicious_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, content_lower, re.IGNORECASE):
                        result['found'] = True
                        result['violations'].append(f"檢測到 {attack_type} 攻擊模式: {pattern}")
                        if attack_type not in result['attack_types']:
                            result['attack_types'].append(attack_type)
        
        return result
    
    def _check_rate_limit(self, remote_ip: str, path: str) -> Dict[str, Any]:
        """檢查速率限制"""
        try:
            # 為每個 IP 創建速率限制器
            limiter_key = f"{remote_ip}:{path}"
            
            if limiter_key not in self.rate_limiters:
                self.rate_limiters[limiter_key] = SecurityUtils.RateLimiter()
            
            limiter = self.rate_limiters[limiter_key]
            is_rate_limited = limiter.is_rate_limited(
                remote_ip, 
                self.config['rate_limit_requests'], 
                self.config['rate_limit_window']
            )
            
            return {
                'is_allowed': not is_rate_limited,
                'remaining': limiter.get_remaining_requests(remote_ip),
                'reset_time': limiter.get_reset_time(remote_ip)
            }
            
        except Exception as e:
            self.logger.warning(f"速率限制檢查失敗: {e}")
            return {'is_allowed': True}
    
    def _detect_anomaly(self, remote_ip: str, request_info: Dict[str, Any]) -> Dict[str, Any]:
        """異常行為檢測"""
        try:
            current_time = datetime.now()
            
            # 記錄請求
            self.anomaly_tracker[remote_ip].append({
                'timestamp': current_time,
                'path': request_info.get('path', ''),
                'method': request_info.get('method', ''),
                'user_agent': request_info.get('headers', {}).get('User-Agent', '')
            })
            
            recent_requests = list(self.anomaly_tracker[remote_ip])
            
            # 檢查短時間內大量請求
            time_threshold = current_time - timedelta(minutes=1)
            recent_count = sum(1 for req in recent_requests if req['timestamp'] > time_threshold)
            
            if recent_count > 50:  # 1分鐘內超過50個請求
                return {
                    'is_anomaly': True,
                    'reason': 'high_frequency_requests',
                    'severity': 'high',
                    'details': f'{recent_count} requests in 1 minute'
                }
            
            # 檢查路徑掃描行為
            time_threshold = current_time - timedelta(minutes=5)
            recent_paths = [req['path'] for req in recent_requests if req['timestamp'] > time_threshold]
            unique_paths = len(set(recent_paths))
            
            if unique_paths > 20:  # 5分鐘內存取超過20個不同路徑
                return {
                    'is_anomaly': True,
                    'reason': 'path_scanning',
                    'severity': 'medium',
                    'details': f'{unique_paths} unique paths in 5 minutes'
                }
            
            # 檢查 User-Agent 變化
            time_threshold = current_time - timedelta(minutes=10)
            recent_uas = [req['user_agent'] for req in recent_requests if req['timestamp'] > time_threshold]
            unique_uas = len(set(recent_uas))
            
            if unique_uas > 5:  # 10分鐘內使用超過5個不同的 User-Agent
                return {
                    'is_anomaly': True,
                    'reason': 'user_agent_switching',
                    'severity': 'medium',
                    'details': f'{unique_uas} different user agents in 10 minutes'
                }
            
            return {'is_anomaly': False}
            
        except Exception as e:
            self.logger.warning(f"異常檢測失敗: {e}")
            return {'is_anomaly': False}
    
    def _check_cors_origin(self, origin: str) -> Dict[str, Any]:
        """檢查 CORS 來源"""
        if not self.config.get('allowed_origins'):
            return {'is_allowed': True}  # 沒有限制
        
        if origin in self.config['allowed_origins']:
            return {'is_allowed': True}
        
        # 檢查通配符
        for allowed_origin in self.config['allowed_origins']:
            if allowed_origin == '*':
                return {'is_allowed': True}
            elif allowed_origin.startswith('*.'):
                domain = allowed_origin[2:]
                if origin.endswith(domain):
                    return {'is_allowed': True}
        
        return {'is_allowed': False}
    
    def _generate_security_recommendations(self, result: Dict[str, Any]) -> List[str]:
        """生成安全建議"""
        recommendations = []
        
        if any('HTTP 方法' in v for v in result['violations']):
            recommendations.append("限制允許的 HTTP 方法")
        
        if any('HTTPS' in w for w in result['warnings']):
            recommendations.append("強制使用 HTTPS")
        
        if any('速率限制' in v for v in result['violations']):
            recommendations.append("實施速率限制和請求節流")
        
        if any('User-Agent' in v for v in result['violations']):
            recommendations.append("加強 User-Agent 驗證")
        
        if result['risk_level'] in ['high', 'critical']:
            recommendations.append("考慮暫時封鎖該 IP 地址")
            recommendations.append("增強監控和日誌記錄")
        
        return recommendations
    
    def _log_security_violation(self, request_info: Dict[str, Any], result: Dict[str, Any]):
        """記錄安全違規"""
        try:
            self.logger.log_security_event(
                event_type=SECURITY_EVENT_TYPES.get('ENDPOINT_SECURITY_VIOLATION', 'endpoint_security_violation'),
                message=f"Endpoint security violation detected",
                priority=self._get_priority_by_risk(result['risk_level']),
                remote_ip=request_info.get('remote_ip'),
                path=request_info.get('path'),
                method=request_info.get('method'),
                user_agent=request_info.get('headers', {}).get('User-Agent'),
                violations=result['violations'],
                risk_level=result['risk_level'],
                blocked_reason=result.get('blocked_reason')
            )
            
        except Exception as e:
            self.logger.error(f"記錄安全違規失敗: {e}")
    
    def _get_priority_by_risk(self, risk_level: str) -> str:
        """根據風險等級獲取優先級"""
        risk_to_priority = {
            'low': 'LOW',
            'medium': 'MEDIUM', 
            'high': 'HIGH',
            'critical': 'CRITICAL'
        }
        return risk_to_priority.get(risk_level, 'MEDIUM')
    
    def create_request_validator(self) -> Callable:
        """創建請求驗證中間件"""
        def validate_request_middleware(request):
            """請求驗證中間件"""
            try:
                # 提取請求信息
                request_info = {
                    'method': getattr(request, 'method', 'GET'),
                    'url': getattr(request, 'url', ''),
                    'path': getattr(request, 'path', ''),
                    'query_params': getattr(request, 'GET', {}),
                    'headers': dict(getattr(request, 'headers', {})),
                    'body': getattr(request, 'body', ''),
                    'remote_ip': self._get_client_ip(request)
                }
                
                # 驗證請求
                validation_result = self.validate_request(request_info)
                
                # 如果不安全，拒絕請求
                if not validation_result['is_safe']:
                    return self._create_blocked_response(validation_result)
                
                return None  # 允許請求繼續
                
            except Exception as e:
                self.logger.error(f"請求驗證中間件錯誤: {e}")
                return None  # 發生錯誤時允許請求繼續
        
        return validate_request_middleware
    
    def _get_client_ip(self, request) -> str:
        """獲取客戶端 IP"""
        try:
            # 嘗試從各種標頭獲取真實 IP
            headers_to_check = [
                'HTTP_X_FORWARDED_FOR',
                'HTTP_X_REAL_IP',
                'HTTP_CF_CONNECTING_IP',
                'REMOTE_ADDR'
            ]
            
            for header in headers_to_check:
                ip = getattr(request, 'META', {}).get(header)
                if ip:
                    # 如果有多個 IP，取第一個
                    return ip.split(',')[0].strip()
            
            return getattr(request, 'META', {}).get('REMOTE_ADDR', 'unknown')
            
        except Exception:
            return 'unknown'
    
    def _create_blocked_response(self, validation_result: Dict[str, Any]) -> Dict[str, Any]:
        """創建被阻止的響應"""
        status_code = 403  # Forbidden
        
        if validation_result.get('blocked_reason') == 'rate_limit_exceeded':
            status_code = 429  # Too Many Requests
        
        return {
            'status_code': status_code,
            'content': {
                'error': 'Request blocked',
                'reason': validation_result.get('blocked_reason', 'security_violation'),
                'message': '您的請求因安全原因被阻止'
            },
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    
    def get_endpoint_security_report(self) -> Dict[str, Any]:
        """獲取端點安全報告"""
        try:
            report = {
                'timestamp': datetime.now().isoformat(),
                'active_rate_limiters': len(self.rate_limiters),
                'tracked_ips': len(self.anomaly_tracker),
                'configuration': {
                    'max_request_size': self.config['max_request_size'],
                    'rate_limit_requests': self.config['rate_limit_requests'],
                    'rate_limit_window': self.config['rate_limit_window'],
                    'require_https': self.config['require_https']
                },
                'statistics': self._get_security_statistics()
            }
            
            return report
            
        except Exception as e:
            self.logger.error(f"生成端點安全報告失敗: {e}")
            return {'error': f'報告生成失敗: {e}'}
    
    def _get_security_statistics(self) -> Dict[str, Any]:
        """獲取安全統計"""
        try:
            stats = {
                'total_requests_tracked': 0,
                'anomalous_ips': 0,
                'high_activity_ips': []
            }
            
            current_time = datetime.now()
            hour_ago = current_time - timedelta(hours=1)
            
            for ip, requests in self.anomaly_tracker.items():
                recent_requests = [r for r in requests if r['timestamp'] > hour_ago]
                stats['total_requests_tracked'] += len(recent_requests)
                
                if len(recent_requests) > 100:  # 高活動 IP
                    stats['high_activity_ips'].append({
                        'ip': ip,
                        'request_count': len(recent_requests)
                    })
                
                if len(recent_requests) > 200:  # 異常 IP
                    stats['anomalous_ips'] += 1
            
            return stats
            
        except Exception as e:
            self.logger.warning(f"統計計算失敗: {e}")
            return {}


# 便利函數
def validate_endpoint_request(request_info: Dict[str, Any]) -> Dict[str, Any]:
    """快速驗證端點請求"""
    endpoint_security = EndpointSecurity()
    return endpoint_security.validate_request(request_info)

def create_endpoint_validator():
    """快速創建端點驗證器"""
    endpoint_security = EndpointSecurity()
    return endpoint_security.create_request_validator()


if __name__ == "__main__":
    # 測試端點安全
    endpoint_security = EndpointSecurity()
    
    # 測試請求
    test_requests = [
        {
            'method': 'GET',
            'url': 'https://example.com/page',
            'path': '/page',
            'query_params': {},
            'headers': {'User-Agent': 'Mozilla/5.0'},
            'body': '',
            'remote_ip': '192.168.1.100'
        },
        {
            'method': 'GET',
            'url': 'https://example.com/admin',
            'path': '/admin',
            'query_params': {},
            'headers': {'User-Agent': 'sqlmap/1.0'},
            'body': '',
            'remote_ip': '192.168.1.101'
        },
        {
            'method': 'POST',
            'url': 'https://example.com/search?q=1%27+OR+1=1--',
            'path': '/search',
            'query_params': {'q': "1' OR 1=1--"},
            'headers': {'User-Agent': 'Mozilla/5.0'},
            'body': '',
            'remote_ip': '192.168.1.102'
        }
    ]
    
    for i, request_info in enumerate(test_requests, 1):
        result = endpoint_security.validate_request(request_info)
        print(f"請求 {i}: {request_info['path']}")
        print(f"安全: {result['is_safe']}")
        print(f"風險等級: {result['risk_level']}")
        if result['violations']:
            print(f"違規: {result['violations']}")
        if result['recommendations']:
            print(f"建議: {result['recommendations']}")
        print("-" * 50)
    
    # 獲取安全報告
    report = endpoint_security.get_endpoint_security_report()
    print(f"安全報告: {report}")
    
    print("端點安全測試完成")
