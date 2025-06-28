"""
資安監控模組 (INFO 層級)
提供基礎監控指標、健康檢查、性能監控等功能
"""

import time
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from collections import defaultdict, deque
import json
import os

from .security_constants import *
from .security_logger import SecurityLogger
from .security_exceptions import SecurityException


@dataclass
class MetricValue:
    """監控指標值"""
    timestamp: datetime
    value: float
    tags: Dict[str, str] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'timestamp': self.timestamp.isoformat(),
            'value': self.value,
            'tags': self.tags
        }


@dataclass
class HealthCheckResult:
    """健康檢查結果"""
    name: str
    status: str  # 'healthy', 'warning', 'critical'
    message: str
    timestamp: datetime
    response_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'status': self.status,
            'message': self.message,
            'timestamp': self.timestamp.isoformat(),
            'response_time': self.response_time,
            'metadata': self.metadata
        }


class SecurityMonitoring:
    """資安監控系統"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.logger = SecurityLogger()
        
        # 監控指標存儲
        self.metrics: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.health_checks: Dict[str, Callable] = {}
        self.alerts: List[Dict[str, Any]] = []
        
        # 監控狀態
        self.monitoring_enabled = True
        self.monitoring_thread = None
        self.monitoring_interval = self.config.get('monitoring_interval', 60)  # 60秒
        
        # 閾值配置
        self.thresholds = {
            'cpu_usage': 80.0,
            'memory_usage': 85.0,
            'disk_usage': 90.0,
            'response_time': 5.0,  # 5秒
            'error_rate': 0.05,    # 5%
            'security_events': 10  # 每分鐘
        }
        
        # 統計計數器
        self.counters = defaultdict(int)
        self.gauges = defaultdict(float)
        self.timers = defaultdict(list)
        
        # 註冊基本健康檢查
        self._register_basic_health_checks()
        
        self.logger.info("安全監控系統初始化完成")
    
    def start_monitoring(self):
        """開始監控"""
        if self.monitoring_thread and self.monitoring_thread.is_alive():
            self.logger.warning("監控已在運行中")
            return
        
        self.monitoring_enabled = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitoring_thread.start()
        self.logger.info("監控系統已啟動")
    
    def stop_monitoring(self):
        """停止監控"""
        self.monitoring_enabled = False
        if self.monitoring_thread:
            self.monitoring_thread.join(timeout=5)
        self.logger.info("監控系統已停止")
    
    def _monitoring_loop(self):
        """監控主循環"""
        while self.monitoring_enabled:
            try:
                # 收集系統指標
                self._collect_system_metrics()
                
                # 執行健康檢查
                self._run_health_checks()
                
                # 檢查閾值
                self._check_thresholds()
                
                time.sleep(self.monitoring_interval)
                
            except Exception as e:
                self.logger.error(f"監控循環錯誤: {e}")
                time.sleep(self.monitoring_interval)
    
    def _collect_system_metrics(self):
        """收集系統指標"""
        try:
            now = datetime.now()
            
            # CPU 使用率
            cpu_percent = psutil.cpu_percent(interval=1)
            self.record_metric('system.cpu.usage', cpu_percent, {'host': 'localhost'})
            
            # 記憶體使用率
            memory = psutil.virtual_memory()
            self.record_metric('system.memory.usage', memory.percent, {'host': 'localhost'})
            self.record_metric('system.memory.available', memory.available, {'host': 'localhost'})
            
            # 磁碟使用率
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            self.record_metric('system.disk.usage', disk_percent, {'host': 'localhost'})
            
            # 網路 I/O
            net_io = psutil.net_io_counters()
            self.record_metric('system.network.bytes_sent', net_io.bytes_sent, {'host': 'localhost'})
            self.record_metric('system.network.bytes_recv', net_io.bytes_recv, {'host': 'localhost'})
            
            # 進程數量
            process_count = len(psutil.pids())
            self.record_metric('system.processes.count', process_count, {'host': 'localhost'})
            
        except Exception as e:
            self.logger.error(f"系統指標收集失敗: {e}")
    
    def record_metric(self, name: str, value: float, tags: Optional[Dict[str, str]] = None):
        """記錄監控指標"""
        metric = MetricValue(
            timestamp=datetime.now(),
            value=value,
            tags=tags or {}
        )
        self.metrics[name].append(metric)
        
        # 記錄到日誌
        self.logger.debug(f"指標記錄: {name}={value}, tags={tags}")
    
    def increment_counter(self, name: str, value: int = 1, tags: Optional[Dict[str, str]] = None):
        """增加計數器"""
        self.counters[name] += value
        self.record_metric(f"counter.{name}", self.counters[name], tags)
    
    def set_gauge(self, name: str, value: float, tags: Optional[Dict[str, str]] = None):
        """設置測量值"""
        self.gauges[name] = value
        self.record_metric(f"gauge.{name}", value, tags)
    
    def record_timer(self, name: str, duration: float, tags: Optional[Dict[str, str]] = None):
        """記錄計時器"""
        self.timers[name].append(duration)
        self.record_metric(f"timer.{name}", duration, tags)
        
        # 保持最近100個記錄
        if len(self.timers[name]) > 100:
            self.timers[name] = self.timers[name][-100:]
    
    def get_metric_stats(self, name: str, time_range: Optional[timedelta] = None) -> Dict[str, Any]:
        """獲取指標統計"""
        if name not in self.metrics:
            return {}
        
        metrics = list(self.metrics[name])
        if time_range:
            cutoff = datetime.now() - time_range
            metrics = [m for m in metrics if m.timestamp >= cutoff]
        
        if not metrics:
            return {}
        
        values = [m.value for m in metrics]
        return {
            'count': len(values),
            'min': min(values),
            'max': max(values),
            'avg': sum(values) / len(values),
            'latest': values[-1] if values else None,
            'timestamp_range': {
                'start': metrics[0].timestamp.isoformat(),
                'end': metrics[-1].timestamp.isoformat()
            }
        }
    
    def register_health_check(self, name: str, check_func: Callable[[], HealthCheckResult]):
        """註冊健康檢查"""
        self.health_checks[name] = check_func
        self.logger.info(f"健康檢查已註冊: {name}")
    
    def _register_basic_health_checks(self):
        """註冊基本健康檢查"""
        
        def system_health_check() -> HealthCheckResult:
            """系統健康檢查"""
            start_time = time.time()
            try:
                # 檢查 CPU 使用率
                cpu_percent = psutil.cpu_percent(interval=0.1)
                memory = psutil.virtual_memory()
                disk = psutil.disk_usage('/')
                
                issues = []
                if cpu_percent > self.thresholds['cpu_usage']:
                    issues.append(f"CPU使用率過高: {cpu_percent:.1f}%")
                
                if memory.percent > self.thresholds['memory_usage']:
                    issues.append(f"記憶體使用率過高: {memory.percent:.1f}%")
                
                disk_percent = (disk.used / disk.total) * 100
                if disk_percent > self.thresholds['disk_usage']:
                    issues.append(f"磁碟使用率過高: {disk_percent:.1f}%")
                
                if issues:
                    status = 'warning' if len(issues) <= 2 else 'critical'
                    message = '; '.join(issues)
                else:
                    status = 'healthy'
                    message = '系統運行正常'
                
                return HealthCheckResult(
                    name='system_health',
                    status=status,
                    message=message,
                    timestamp=datetime.now(),
                    response_time=time.time() - start_time,
                    metadata={
                        'cpu_percent': cpu_percent,
                        'memory_percent': memory.percent,
                        'disk_percent': disk_percent
                    }
                )
                
            except Exception as e:
                return HealthCheckResult(
                    name='system_health',
                    status='critical',
                    message=f'健康檢查失敗: {str(e)}',
                    timestamp=datetime.now(),
                    response_time=time.time() - start_time
                )
        
        def security_events_check() -> HealthCheckResult:
            """安全事件健康檢查"""
            start_time = time.time()
            try:
                # 檢查最近一分鐘的安全事件數量
                recent_events = self.get_recent_security_events(minutes=1)
                event_count = len(recent_events)
                
                if event_count > self.thresholds['security_events']:
                    status = 'warning'
                    message = f'安全事件頻繁: {event_count}次/分鐘'
                else:
                    status = 'healthy'
                    message = f'安全事件正常: {event_count}次/分鐘'
                
                return HealthCheckResult(
                    name='security_events',
                    status=status,
                    message=message,
                    timestamp=datetime.now(),
                    response_time=time.time() - start_time,
                    metadata={'event_count': event_count}
                )
                
            except Exception as e:
                return HealthCheckResult(
                    name='security_events',
                    status='critical',
                    message=f'安全事件檢查失敗: {str(e)}',
                    timestamp=datetime.now(),
                    response_time=time.time() - start_time
                )
        
        self.register_health_check('system_health', system_health_check)
        self.register_health_check('security_events', security_events_check)
    
    def _run_health_checks(self):
        """執行所有健康檢查"""
        for name, check_func in self.health_checks.items():
            try:
                result = check_func()
                
                # 記錄健康檢查結果
                self.logger.debug(f"健康檢查 {name}: {result.status} - {result.message}")
                
                # 記錄響應時間指標
                self.record_metric(f"health_check.{name}.response_time", result.response_time)
                
                # 如果狀態不健康，記錄警告或錯誤
                if result.status == 'warning':
                    self.logger.warning(f"健康檢查警告 {name}: {result.message}")
                elif result.status == 'critical':
                    self.logger.error(f"健康檢查嚴重 {name}: {result.message}")
                    self._create_alert('health_check_critical', result.to_dict())
                
            except Exception as e:
                self.logger.error(f"健康檢查 {name} 執行失敗: {e}")
    
    def _check_thresholds(self):
        """檢查閾值"""
        try:
            # 檢查系統指標閾值
            for metric_name, threshold in self.thresholds.items():
                if metric_name.startswith('system.'):
                    continue  # 系統指標在健康檢查中處理
                
                stats = self.get_metric_stats(metric_name, timedelta(minutes=5))
                if stats and stats.get('latest'):
                    if stats['latest'] > threshold:
                        self._create_alert('threshold_exceeded', {
                            'metric': metric_name,
                            'value': stats['latest'],
                            'threshold': threshold,
                            'timestamp': datetime.now().isoformat()
                        })
                        
        except Exception as e:
            self.logger.error(f"閾值檢查失敗: {e}")
    
    def _create_alert(self, alert_type: str, data: Dict[str, Any]):
        """創建警報"""
        alert = {
            'type': alert_type,
            'timestamp': datetime.now().isoformat(),
            'data': data,
            'level': 'warning' if alert_type == 'threshold_exceeded' else 'critical'
        }
        
        self.alerts.append(alert)
        
        # 保持最近100個警報
        if len(self.alerts) > 100:
            self.alerts = self.alerts[-100:]
        
        # 記錄警報
        self.logger.warning(f"警報產生: {alert_type} - {data}")
    
    def get_recent_security_events(self, minutes: int = 60) -> List[Dict[str, Any]]:
        """獲取最近的安全事件"""
        # 這裡應該從日誌或數據庫中獲取安全事件
        # 目前返回模擬數據
        return []
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """獲取監控儀表板數據"""
        try:
            # 系統指標
            system_metrics = {}
            for metric in ['system.cpu.usage', 'system.memory.usage', 'system.disk.usage']:
                stats = self.get_metric_stats(metric, timedelta(hours=1))
                if stats:
                    system_metrics[metric] = stats
            
            # 最近的健康檢查結果
            health_status = {}
            for name in self.health_checks.keys():
                # 這裡應該存儲最近的健康檢查結果
                health_status[name] = 'unknown'
            
            # 最近的警報
            recent_alerts = [alert for alert in self.alerts 
                           if datetime.fromisoformat(alert['timestamp']) > 
                           datetime.now() - timedelta(hours=24)]
            
            return {
                'timestamp': datetime.now().isoformat(),
                'system_metrics': system_metrics,
                'health_status': health_status,
                'recent_alerts': recent_alerts,
                'counters': dict(self.counters),
                'gauges': dict(self.gauges),
                'monitoring_status': {
                    'enabled': self.monitoring_enabled,
                    'thread_alive': self.monitoring_thread.is_alive() if self.monitoring_thread else False,
                    'interval': self.monitoring_interval
                }
            }
            
        except Exception as e:
            self.logger.error(f"獲取儀表板數據失敗: {e}")
            return {'error': str(e)}
    
    def export_metrics(self, format_type: str = 'json') -> str:
        """導出監控指標"""
        try:
            data = {
                'timestamp': datetime.now().isoformat(),
                'metrics': {}
            }
            
            for name, metric_deque in self.metrics.items():
                data['metrics'][name] = [m.to_dict() for m in metric_deque]
            
            if format_type == 'json':
                return json.dumps(data, indent=2, ensure_ascii=False)
            else:
                return str(data)
                
        except Exception as e:
            self.logger.error(f"導出指標失敗: {e}")
            raise SecurityException(f"指標導出失敗: {e}")


# 全域監控實例
_global_monitor = None

def get_monitor() -> SecurityMonitoring:
    """獲取全域監控實例"""
    global _global_monitor
    if _global_monitor is None:
        _global_monitor = SecurityMonitoring()
    return _global_monitor

def start_monitoring():
    """啟動全域監控"""
    monitor = get_monitor()
    monitor.start_monitoring()

def stop_monitoring():
    """停止全域監控"""
    if _global_monitor:
        _global_monitor.stop_monitoring()


# 監控裝飾器
def monitor_performance(metric_name: str = None):
    """性能監控裝飾器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            name = metric_name or f"{func.__module__}.{func.__name__}"
            monitor = get_monitor()
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                monitor.record_timer(name, duration)
                monitor.increment_counter(f"{name}.success")
                return result
            except Exception as e:
                duration = time.time() - start_time
                monitor.record_timer(f"{name}.error", duration)
                monitor.increment_counter(f"{name}.error")
                raise
        return wrapper
    return decorator

def monitor_security_event(event_type: str):
    """安全事件監控裝飾器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            monitor = get_monitor()
            
            try:
                result = func(*args, **kwargs)
                monitor.increment_counter(f"security.{event_type}.success")
                return result
            except Exception as e:
                monitor.increment_counter(f"security.{event_type}.failure")
                monitor.logger.warning(f"安全事件失敗: {event_type} - {e}")
                raise
        return wrapper
    return decorator


if __name__ == "__main__":
    # 測試監控系統
    monitor = SecurityMonitoring()
    
    # 測試指標記錄
    monitor.record_metric('test.metric', 100.0, {'env': 'test'})
    monitor.increment_counter('test.counter')
    monitor.set_gauge('test.gauge', 50.0)
    monitor.record_timer('test.timer', 0.5)
    
    # 測試統計
    stats = monitor.get_metric_stats('test.metric')
    print(f"指標統計: {stats}")
    
    # 測試儀表板數據
    dashboard = monitor.get_dashboard_data()
    print(f"儀表板數據: {json.dumps(dashboard, indent=2, ensure_ascii=False)}")
    
    print("監控系統測試完成")
