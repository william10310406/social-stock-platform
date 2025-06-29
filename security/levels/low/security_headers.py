"""
HTTP 安全標頭模組 (LOW 層級)
提供各種 HTTP 安全標頭的配置和管理功能
"""

from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
from urllib.parse import urlparse

# 引入 INFO 層級的基礎模組
from ..info import (
    SecurityLogger, SecurityException, ValidationError,
    get_config, SECURITY_HEADERS
)


class SecurityHeaders:
    """HTTP 安全標頭管理器"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.logger = SecurityLogger()
        self.config = config or self._get_default_config()
        
        # 預定義的安全標頭
        self.security_headers_definitions = {
            'X-Content-Type-Options': {
                'description': '防止 MIME 類型嗅探攻擊',
                'default_value': 'nosniff',
                'risk_level': 'medium'
            },
            'X-Frame-Options': {
                'description': '防止點擊劫持攻擊',
                'default_value': 'DENY',
                'options': ['DENY', 'SAMEORIGIN', 'ALLOW-FROM'],
                'risk_level': 'high'
            },
            'X-XSS-Protection': {
                'description': '啟用瀏覽器 XSS 防護',
                'default_value': '1; mode=block',
                'risk_level': 'medium'
            },
            'Strict-Transport-Security': {
                'description': '強制使用 HTTPS',
                'default_value': 'max-age=31536000; includeSubDomains',
                'risk_level': 'high'
            },
            'Content-Security-Policy': {
                'description': '防止 XSS 和數據注入攻擊',
                'default_value': "default-src 'self'",
                'risk_level': 'critical'
            },
            'Referrer-Policy': {
                'description': '控制 Referer 標頭的發送',
                'default_value': 'strict-origin-when-cross-origin',
                'options': [
                    'no-referrer', 'no-referrer-when-downgrade',
                    'origin', 'origin-when-cross-origin',
                    'same-origin', 'strict-origin',
                    'strict-origin-when-cross-origin', 'unsafe-url'
                ],
                'risk_level': 'low'
            },
            'Permissions-Policy': {
                'description': '控制瀏覽器功能權限',
                'default_value': 'geolocation=(), microphone=(), camera=()',
                'risk_level': 'medium'
            },
            'Cache-Control': {
                'description': '控制快取行為',
                'default_value': 'no-cache, no-store, must-revalidate',
                'risk_level': 'low'
            },
            'Pragma': {
                'description': 'HTTP/1.0 快取控制',
                'default_value': 'no-cache',
                'risk_level': 'low'
            },
            'Expires': {
                'description': '設置過期時間',
                'default_value': '0',
                'risk_level': 'low'
            }
        }
        
        self.logger.info("HTTP 安全標頭模組初始化完成")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """獲取默認配置"""
        return {
            'enabled_headers': [
                'X-Content-Type-Options',
                'X-Frame-Options', 
                'X-XSS-Protection',
                'Strict-Transport-Security',
                'Content-Security-Policy',
                'Referrer-Policy'
            ],
            'custom_headers': {},
            'environment': 'production',  # development, staging, production
            'hsts_max_age': 31536000,  # 1 year
            'csp_report_uri': None,
            'frame_ancestors': [],
        }
    
    def generate_headers(self, request_info: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
        """生成安全標頭"""
        try:
            headers = {}
            request_info = request_info or {}
            
            for header_name in self.config['enabled_headers']:
                if header_name in self.security_headers_definitions:
                    header_value = self._generate_header_value(header_name, request_info)
                    if header_value:
                        headers[header_name] = header_value
            
            # 添加自定義標頭
            headers.update(self.config.get('custom_headers', {}))
            
            # 記錄生成的標頭
            self.logger.debug(f"生成安全標頭: {list(headers.keys())}")
            
            return headers
            
        except Exception as e:
            self.logger.error(f"生成安全標頭失敗: {e}")
            raise SecurityException(f"生成安全標頭失敗: {e}")
    
    def _generate_header_value(self, header_name: str, request_info: Dict[str, Any]) -> Optional[str]:
        """生成特定標頭的值"""
        try:
            definition = self.security_headers_definitions[header_name]
            
            if header_name == 'Strict-Transport-Security':
                return self._generate_hsts_header(request_info)
            elif header_name == 'Content-Security-Policy':
                return self._generate_csp_header(request_info)
            elif header_name == 'X-Frame-Options':
                return self._generate_frame_options_header(request_info)
            elif header_name == 'Permissions-Policy':
                return self._generate_permissions_policy_header(request_info)
            elif header_name == 'Cache-Control':
                return self._generate_cache_control_header(request_info)
            else:
                return definition['default_value']
                
        except Exception as e:
            self.logger.warning(f"生成標頭值失敗 {header_name}: {e}")
            return self.security_headers_definitions[header_name]['default_value']
    
    def _generate_hsts_header(self, request_info: Dict[str, Any]) -> str:
        """生成 HSTS 標頭"""
        max_age = self.config.get('hsts_max_age', 31536000)
        
        hsts_value = f"max-age={max_age}"
        
        if self.config.get('hsts_include_subdomains', True):
            hsts_value += "; includeSubDomains"
        
        if self.config.get('hsts_preload', False):
            hsts_value += "; preload"
        
        return hsts_value
    
    def _generate_csp_header(self, request_info: Dict[str, Any]) -> str:
        """生成 CSP 標頭"""
        csp_config = self.config.get('csp', {})
        
        # 默認 CSP 策略
        default_csp = {
            'default-src': ["'self'"],
            'script-src': ["'self'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", "data:", "https:"],
            'font-src': ["'self'", "https://fonts.gstatic.com"],
            'connect-src': ["'self'"],
            'object-src': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            'frame-ancestors': ["'none'"]
        }
        
        # 合併配置
        csp_policy = {**default_csp, **csp_config}
        
        # 處理 frame-ancestors
        if self.config.get('frame_ancestors'):
            csp_policy['frame-ancestors'] = self.config['frame_ancestors']
        
        # 構建 CSP 字符串
        csp_parts = []
        for directive, sources in csp_policy.items():
            if sources:
                sources_str = ' '.join(sources)
                csp_parts.append(f"{directive} {sources_str}")
        
        csp_value = '; '.join(csp_parts)
        
        # 添加報告 URI
        if self.config.get('csp_report_uri'):
            csp_value += f"; report-uri {self.config['csp_report_uri']}"
        
        return csp_value
    
    def _generate_frame_options_header(self, request_info: Dict[str, Any]) -> str:
        """生成 X-Frame-Options 標頭"""
        frame_option = self.config.get('frame_option', 'DENY')
        
        if frame_option == 'ALLOW-FROM':
            allowed_origin = self.config.get('frame_allowed_origin')
            if allowed_origin:
                return f"ALLOW-FROM {allowed_origin}"
            else:
                return 'DENY'  # 如果沒有指定來源，使用 DENY
        
        return frame_option
    
    def _generate_permissions_policy_header(self, request_info: Dict[str, Any]) -> str:
        """生成 Permissions-Policy 標頭"""
        permissions_config = self.config.get('permissions_policy', {})
        
        # 默認權限策略
        default_permissions = {
            'geolocation': [],
            'microphone': [],
            'camera': [],
            'payment': [],
            'usb': [],
            'magnetometer': [],
            'gyroscope': [],
            'fullscreen': ['self']
        }
        
        # 合併配置
        permissions = {**default_permissions, **permissions_config}
        
        # 構建權限策略字符串
        policy_parts = []
        for feature, allowed_origins in permissions.items():
            if not allowed_origins:
                policy_parts.append(f"{feature}=()")
            else:
                origins_str = ' '.join(f'"{origin}"' if origin != 'self' else origin for origin in allowed_origins)
                policy_parts.append(f"{feature}=({origins_str})")
        
        return ', '.join(policy_parts)
    
    def _generate_cache_control_header(self, request_info: Dict[str, Any]) -> str:
        """生成 Cache-Control 標頭"""
        # 根據內容類型調整快取策略
        content_type = request_info.get('content_type', '')
        path = request_info.get('path', '')
        
        # 敏感頁面不快取
        sensitive_paths = ['/login', '/admin', '/account', '/api/auth']
        if any(sensitive_path in path for sensitive_path in sensitive_paths):
            return 'no-cache, no-store, must-revalidate, private'
        
        # 靜態資源可以快取
        static_extensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2']
        if any(path.endswith(ext) for ext in static_extensions):
            return 'public, max-age=3600'  # 1小時快取
        
        # 默認不快取
        return 'no-cache, no-store, must-revalidate'
    
    def validate_headers(self, headers: Dict[str, str]) -> Dict[str, Any]:
        """驗證當前標頭的安全性"""
        validation_result = {
            'is_secure': True,
            'missing_headers': [],
            'weak_headers': [],
            'recommendations': [],
            'security_score': 0,
            'max_score': 0
        }
        
        try:
            # 檢查必需的安全標頭
            for header_name, definition in self.security_headers_definitions.items():
                validation_result['max_score'] += self._get_header_score(header_name)
                
                if header_name in headers:
                    # 驗證標頭值
                    header_value = headers[header_name]
                    validation = self._validate_header_value(header_name, header_value)
                    
                    if validation['is_valid']:
                        validation_result['security_score'] += self._get_header_score(header_name)
                    else:
                        validation_result['weak_headers'].append({
                            'header': header_name,
                            'current_value': header_value,
                            'issues': validation['issues'],
                            'recommended_value': definition['default_value']
                        })
                        validation_result['is_secure'] = False
                else:
                    validation_result['missing_headers'].append({
                        'header': header_name,
                        'description': definition['description'],
                        'recommended_value': definition['default_value'],
                        'risk_level': definition['risk_level']
                    })
                    validation_result['is_secure'] = False
            
            # 生成建議
            validation_result['recommendations'] = self._generate_header_recommendations(validation_result)
            
            # 記錄驗證結果
            if not validation_result['is_secure']:
                self.logger.log_security_event(
                    event_type='security_headers_validation_failed',
                    message="Security headers validation failed",
                    priority="LOW",
                    missing_count=len(validation_result['missing_headers']),
                    weak_count=len(validation_result['weak_headers']),
                    security_score=validation_result['security_score'],
                    max_score=validation_result['max_score']
                )
            
            return validation_result
            
        except Exception as e:
            self.logger.error(f"標頭驗證失敗: {e}")
            raise SecurityException(f"標頭驗證失敗: {e}")
    
    def _validate_header_value(self, header_name: str, header_value: str) -> Dict[str, Any]:
        """驗證特定標頭的值"""
        result = {
            'is_valid': True,
            'issues': []
        }
        
        try:
            if header_name == 'Content-Security-Policy':
                result = self._validate_csp_value(header_value)
            elif header_name == 'Strict-Transport-Security':
                result = self._validate_hsts_value(header_value)
            elif header_name == 'X-Frame-Options':
                result = self._validate_frame_options_value(header_value)
            elif header_name == 'X-Content-Type-Options':
                if header_value.lower() != 'nosniff':
                    result['is_valid'] = False
                    result['issues'].append("應該設置為 'nosniff'")
            elif header_name == 'X-XSS-Protection':
                if not header_value.startswith('1'):
                    result['is_valid'] = False
                    result['issues'].append("應該啟用 XSS 防護")
            
            return result
            
        except Exception as e:
            return {
                'is_valid': False,
                'issues': [f"驗證錯誤: {e}"]
            }
    
    def _validate_csp_value(self, csp_value: str) -> Dict[str, Any]:
        """驗證 CSP 標頭值"""
        result = {'is_valid': True, 'issues': []}
        
        # 檢查危險的 CSP 設置
        if "'unsafe-eval'" in csp_value:
            result['issues'].append("不建議使用 'unsafe-eval'")
        
        if "'unsafe-inline'" in csp_value and 'script-src' in csp_value:
            result['issues'].append("script-src 中不建議使用 'unsafe-inline'")
        
        if 'data:' in csp_value and 'script-src' in csp_value:
            result['issues'].append("script-src 中不建議允許 data: 協議")
        
        if '*' in csp_value:
            result['issues'].append("不建議使用通配符 '*'")
        
        if result['issues']:
            result['is_valid'] = False
        
        return result
    
    def _validate_hsts_value(self, hsts_value: str) -> Dict[str, Any]:
        """驗證 HSTS 標頭值"""
        result = {'is_valid': True, 'issues': []}
        
        if 'max-age=' not in hsts_value:
            result['is_valid'] = False
            result['issues'].append("缺少 max-age 指令")
            return result
        
        # 提取 max-age 值
        import re
        match = re.search(r'max-age=(\d+)', hsts_value)
        if match:
            max_age = int(match.group(1))
            if max_age < 86400:  # 少於1天
                result['issues'].append("max-age 時間太短，建議至少1天")
            elif max_age < 2592000:  # 少於30天
                result['issues'].append("max-age 時間較短，建議至少30天")
        
        if 'includeSubDomains' not in hsts_value:
            result['issues'].append("建議添加 includeSubDomains")
        
        if result['issues']:
            result['is_valid'] = False
        
        return result
    
    def _validate_frame_options_value(self, frame_value: str) -> Dict[str, Any]:
        """驗證 X-Frame-Options 標頭值"""
        result = {'is_valid': True, 'issues': []}
        
        valid_values = ['DENY', 'SAMEORIGIN']
        if not any(frame_value.startswith(v) for v in valid_values + ['ALLOW-FROM']):
            result['is_valid'] = False
            result['issues'].append("無效的 X-Frame-Options 值")
        
        return result
    
    def _get_header_score(self, header_name: str) -> int:
        """獲取標頭的安全分數"""
        definition = self.security_headers_definitions.get(header_name, {})
        risk_level = definition.get('risk_level', 'low')
        
        score_map = {
            'critical': 20,
            'high': 15,
            'medium': 10,
            'low': 5
        }
        
        return score_map.get(risk_level, 5)
    
    def _generate_header_recommendations(self, validation_result: Dict[str, Any]) -> List[str]:
        """生成標頭改進建議"""
        recommendations = []
        
        # 缺少的關鍵標頭
        critical_missing = [h for h in validation_result['missing_headers'] 
                          if h['risk_level'] in ['critical', 'high']]
        if critical_missing:
            recommendations.append("立即添加關鍵安全標頭以防止嚴重安全風險")
        
        # CSP 建議
        csp_missing = any(h['header'] == 'Content-Security-Policy' for h in validation_result['missing_headers'])
        if csp_missing:
            recommendations.append("實施內容安全策略 (CSP) 以防止 XSS 攻擊")
        
        # HSTS 建議
        hsts_missing = any(h['header'] == 'Strict-Transport-Security' for h in validation_result['missing_headers'])
        if hsts_missing:
            recommendations.append("啟用 HSTS 以強制使用 HTTPS")
        
        # 一般建議
        if validation_result['security_score'] < validation_result['max_score'] * 0.8:
            recommendations.append("提高安全標頭覆蓋率以增強整體安全性")
        
        return recommendations
    
    def get_header_middleware(self):
        """獲取適用於 Web 框架的中間件函數"""
        def security_headers_middleware(request, response):
            """安全標頭中間件"""
            try:
                request_info = {
                    'path': getattr(request, 'path', '/'),
                    'method': getattr(request, 'method', 'GET'),
                    'content_type': getattr(response, 'content_type', 'text/html')
                }
                
                headers = self.generate_headers(request_info)
                
                # 設置標頭
                for header_name, header_value in headers.items():
                    if hasattr(response, 'headers'):
                        response.headers[header_name] = header_value
                    elif hasattr(response, 'setHeader'):
                        response.setHeader(header_name, header_value)
                
                return response
                
            except Exception as e:
                self.logger.error(f"安全標頭中間件錯誤: {e}")
                return response
        
        return security_headers_middleware


# 便利函數
def get_security_headers(request_info: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
    """快速獲取安全標頭"""
    headers_manager = SecurityHeaders()
    return headers_manager.generate_headers(request_info)

def validate_security_headers(headers: Dict[str, str]) -> Dict[str, Any]:
    """快速驗證安全標頭"""
    headers_manager = SecurityHeaders()
    return headers_manager.validate_headers(headers)


if __name__ == "__main__":
    # 測試安全標頭
    headers_manager = SecurityHeaders()
    
    # 生成安全標頭
    headers = headers_manager.generate_headers({
        'path': '/login',
        'content_type': 'text/html'
    })
    
    print("生成的安全標頭:")
    for name, value in headers.items():
        print(f"{name}: {value}")
    
    # 驗證標頭
    validation = headers_manager.validate_headers(headers)
    print(f"\n安全評分: {validation['security_score']}/{validation['max_score']}")
    print(f"是否安全: {validation['is_secure']}")
    
    if validation['recommendations']:
        print(f"建議: {validation['recommendations']}")
    
    print("安全標頭測試完成")
