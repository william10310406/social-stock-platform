"""
資安配置管理模組 (INFO 層級)
提供配置文件加載、環境變數管理、安全配置驗證等功能
"""

import os
import yaml
import json
import configparser
from pathlib import Path
from typing import Dict, Any, Optional, Union, List
from dataclasses import dataclass, field
import re
from copy import deepcopy

from .security_constants import *
from .security_logger import SecurityLogger
from .security_exceptions import SecurityException, ConfigurationError


@dataclass
class ConfigSource:
    """配置來源"""
    name: str
    path: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    priority: int = 0  # 優先級越高越先使用
    readonly: bool = False


class ConfigManager:
    """配置管理器"""
    
    def __init__(self, config_dir: Optional[str] = None):
        self.logger = SecurityLogger()
        
        # 配置目錄
        self.config_dir = Path(config_dir or self._get_default_config_dir())
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # 配置來源列表
        self.config_sources: List[ConfigSource] = []
        
        # 合併後的配置
        self.merged_config: Dict[str, Any] = {}
        
        # 敏感配置鍵名模式
        self.sensitive_patterns = [
            r'.*password.*',
            r'.*secret.*', 
            r'.*key.*',
            r'.*token.*',
            r'.*credential.*',
            r'.*auth.*'
        ]
        
        # 配置變更回調
        self.change_callbacks: List[callable] = []
        
        # 初始化默認配置來源
        self._init_default_sources()
        
        self.logger.info(f"配置管理器初始化完成，配置目錄: {self.config_dir}")
    
    def _get_default_config_dir(self) -> str:
        """獲取默認配置目錄"""
        # 嘗試從環境變數獲取
        if 'SECURITY_CONFIG_DIR' in os.environ:
            return os.environ['SECURITY_CONFIG_DIR']
        
        # 嘗試從當前項目根目錄
        current_dir = Path(__file__).parent.parent.parent.parent
        config_dir = current_dir / 'security' / 'configs'
        if config_dir.exists():
            return str(config_dir)
        
        # 默認使用當前目錄
        return str(Path.cwd() / 'configs')
    
    def _init_default_sources(self):
        """初始化默認配置來源"""
        # 1. 環境變數 (最高優先級)
        self.add_config_source(
            ConfigSource(
                name='environment',
                data=self._load_env_config(),
                priority=100,
                readonly=True
            )
        )
        
        # 2. 本地配置文件
        local_config_path = self.config_dir / 'local.yaml'
        if local_config_path.exists():
            self.add_config_source(
                ConfigSource(
                    name='local_config',
                    path=str(local_config_path),
                    priority=90
                )
            )
        
        # 3. 主配置文件
        main_config_path = self.config_dir / 'security-levels.yaml'
        if main_config_path.exists():
            self.add_config_source(
                ConfigSource(
                    name='main_config',
                    path=str(main_config_path),
                    priority=50
                )
            )
        
        # 4. 默認配置
        self.add_config_source(
            ConfigSource(
                name='defaults',
                data=self._get_default_config(),
                priority=10,
                readonly=True
            )
        )
        
        # 重新加載所有配置
        self.reload_config()
    
    def _load_env_config(self) -> Dict[str, Any]:
        """從環境變數加載配置"""
        env_config = {}
        
        # 搜尋所有以 SECURITY_ 開頭的環境變數
        for key, value in os.environ.items():
            if key.startswith('SECURITY_'):
                # 轉換環境變數名稱為配置鍵
                config_key = key[9:].lower().replace('_', '.')  # 移除 SECURITY_ 前綴
                
                # 嘗試解析 JSON 值
                try:
                    if value.startswith('{') or value.startswith('['):
                        parsed_value = json.loads(value)
                    else:
                        # 處理布爾值
                        if value.lower() in ('true', 'false'):
                            parsed_value = value.lower() == 'true'
                        # 處理數字
                        elif value.isdigit():
                            parsed_value = int(value)
                        elif '.' in value and value.replace('.', '').isdigit():
                            parsed_value = float(value)
                        else:
                            parsed_value = value
                    
                    # 使用點號分隔建立嵌套字典
                    self._set_nested_value(env_config, config_key, parsed_value)
                    
                except (json.JSONDecodeError, ValueError):
                    env_config[config_key] = value
        
        return env_config
    
    def _get_default_config(self) -> Dict[str, Any]:
        """獲取默認配置"""
        return {
            'security': {
                'logging': {
                    'level': 'INFO',
                    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    'max_file_size': '10MB',
                    'backup_count': 5
                },
                'monitoring': {
                    'enabled': True,
                    'interval': 60,
                    'thresholds': {
                        'cpu_usage': 80.0,
                        'memory_usage': 85.0,
                        'disk_usage': 90.0,
                        'response_time': 5.0,
                        'error_rate': 0.05
                    }
                },
                'rate_limiting': {
                    'enabled': True,
                    'default_limit': 100,
                    'window_size': 3600
                },
                'encryption': {
                    'algorithm': 'AES-256-GCM',
                    'key_rotation_days': 90
                }
            }
        }
    
    def _set_nested_value(self, d: Dict[str, Any], key: str, value: Any):
        """設置嵌套字典值"""
        keys = key.split('.')
        current = d
        
        for k in keys[:-1]:
            if k not in current:
                current[k] = {}
            current = current[k]
        
        current[keys[-1]] = value
    
    def add_config_source(self, source: ConfigSource):
        """添加配置來源"""
        # 移除同名的配置來源
        self.config_sources = [s for s in self.config_sources if s.name != source.name]
        
        # 添加新的配置來源
        self.config_sources.append(source)
        
        # 按優先級排序
        self.config_sources.sort(key=lambda x: x.priority, reverse=True)
        
        self.logger.info(f"已添加配置來源: {source.name} (優先級: {source.priority})")
    
    def remove_config_source(self, source_name: str):
        """移除配置來源"""
        self.config_sources = [s for s in self.config_sources if s.name != source_name]
        self.logger.info(f"已移除配置來源: {source_name}")
    
    def load_config_file(self, file_path: str) -> Dict[str, Any]:
        """加載配置文件"""
        path = Path(file_path)
        
        if not path.exists():
            raise ConfigurationError(f"配置文件不存在: {file_path}")
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                if path.suffix.lower() in ('.yaml', '.yml'):
                    return yaml.safe_load(f) or {}
                elif path.suffix.lower() == '.json':
                    return json.load(f)
                elif path.suffix.lower() in ('.ini', '.cfg'):
                    config = configparser.ConfigParser()
                    config.read(path)
                    return {section: dict(config[section]) for section in config.sections()}
                else:
                    raise ConfigurationError(f"不支援的配置文件格式: {path.suffix}")
                    
        except Exception as e:
            raise ConfigurationError(f"加載配置文件失敗 {file_path}: {e}")
    
    def reload_config(self):
        """重新加載所有配置"""
        self.logger.info("開始重新加載配置")
        
        # 收集所有配置數據
        all_configs = []
        
        for source in self.config_sources:
            try:
                if source.data is not None:
                    # 使用預載入的數據
                    config_data = source.data
                elif source.path:
                    # 從文件加載
                    config_data = self.load_config_file(source.path)
                else:
                    continue
                
                all_configs.append((source.priority, config_data))
                self.logger.debug(f"已加載配置來源: {source.name}")
                
            except Exception as e:
                self.logger.error(f"加載配置來源失敗 {source.name}: {e}")
                continue
        
        # 按優先級合併配置
        self.merged_config = {}
        for priority, config_data in sorted(all_configs, key=lambda x: x[0]):
            self.merged_config = self._deep_merge(self.merged_config, config_data)
        
        # 驗證配置
        self._validate_config()
        
        # 通知配置變更
        self._notify_config_change()
        
        self.logger.info("配置重新加載完成")
    
    def _deep_merge(self, base: Dict[str, Any], update: Dict[str, Any]) -> Dict[str, Any]:
        """深度合併字典"""
        result = deepcopy(base)
        
        for key, value in update.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._deep_merge(result[key], value)
            else:
                result[key] = deepcopy(value)
        
        return result
    
    def _validate_config(self):
        """驗證配置"""
        try:
            # 檢查必需的配置項
            required_keys = [
                'security.logging.level',
                'security.monitoring.enabled'
            ]
            
            for key in required_keys:
                if not self.has_config(key):
                    raise ConfigurationError(f"缺少必需的配置項: {key}")
            
            # 驗證日誌級別
            log_level = self.get_config('security.logging.level', 'INFO')
            if log_level not in ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']:
                raise ConfigurationError(f"無效的日誌級別: {log_level}")
            
            # 驗證監控間隔
            monitoring_interval = self.get_config('security.monitoring.interval', 60)
            if not isinstance(monitoring_interval, (int, float)) or monitoring_interval <= 0:
                raise ConfigurationError(f"無效的監控間隔: {monitoring_interval}")
            
            self.logger.debug("配置驗證通過")
            
        except Exception as e:
            self.logger.error(f"配置驗證失敗: {e}")
            raise
    
    def _notify_config_change(self):
        """通知配置變更"""
        for callback in self.change_callbacks:
            try:
                callback(self.merged_config)
            except Exception as e:
                self.logger.error(f"配置變更回調失敗: {e}")
    
    def get_config(self, key: str, default: Any = None) -> Any:
        """獲取配置值"""
        try:
            keys = key.split('.')
            current = self.merged_config
            
            for k in keys:
                if isinstance(current, dict) and k in current:
                    current = current[k]
                else:
                    return default
            
            return current
            
        except Exception as e:
            self.logger.error(f"獲取配置失敗 {key}: {e}")
            return default
    
    def set_config(self, key: str, value: Any, source_name: str = 'runtime'):
        """設置配置值"""
        try:
            # 找到或創建運行時配置來源
            runtime_source = None
            for source in self.config_sources:
                if source.name == source_name:
                    runtime_source = source
                    break
            
            if runtime_source is None:
                runtime_source = ConfigSource(
                    name=source_name,
                    data={},
                    priority=95
                )
                self.add_config_source(runtime_source)
            
            # 設置值
            if runtime_source.data is None:
                runtime_source.data = {}
            
            self._set_nested_value(runtime_source.data, key, value)
            
            # 重新加載配置
            self.reload_config()
            
            self.logger.info(f"配置已設置: {key} = {self._mask_sensitive_value(key, value)}")
            
        except Exception as e:
            self.logger.error(f"設置配置失敗 {key}: {e}")
            raise ConfigurationError(f"設置配置失敗: {e}")
    
    def has_config(self, key: str) -> bool:
        """檢查配置是否存在"""
        return self.get_config(key) is not None
    
    def get_all_config(self) -> Dict[str, Any]:
        """獲取所有配置"""
        return deepcopy(self.merged_config)
    
    def get_config_sources_info(self) -> List[Dict[str, Any]]:
        """獲取配置來源信息"""
        info = []
        for source in self.config_sources:
            info.append({
                'name': source.name,
                'priority': source.priority,
                'path': source.path,
                'readonly': source.readonly,
                'has_data': source.data is not None
            })
        return info
    
    def _mask_sensitive_value(self, key: str, value: Any) -> str:
        """遮蔽敏感配置值"""
        key_lower = key.lower()
        
        for pattern in self.sensitive_patterns:
            if re.match(pattern, key_lower):
                if isinstance(value, str) and len(value) > 4:
                    return f"{value[:2]}...{value[-2:]}"
                else:
                    return "***"
        
        return str(value)
    
    def export_config(self, format_type: str = 'yaml', mask_sensitive: bool = True) -> str:
        """導出配置"""
        try:
            config_to_export = deepcopy(self.merged_config)
            
            if mask_sensitive:
                config_to_export = self._mask_sensitive_config(config_to_export)
            
            if format_type == 'yaml':
                return yaml.dump(config_to_export, default_flow_style=False, 
                               allow_unicode=True, sort_keys=True)
            elif format_type == 'json':
                return json.dumps(config_to_export, indent=2, ensure_ascii=False)
            else:
                return str(config_to_export)
                
        except Exception as e:
            raise ConfigurationError(f"導出配置失敗: {e}")
    
    def _mask_sensitive_config(self, config: Dict[str, Any], prefix: str = '') -> Dict[str, Any]:
        """遮蔽敏感配置"""
        result = {}
        
        for key, value in config.items():
            full_key = f"{prefix}.{key}" if prefix else key
            
            if isinstance(value, dict):
                result[key] = self._mask_sensitive_config(value, full_key)
            else:
                result[key] = self._mask_sensitive_value(full_key, value)
        
        return result
    
    def save_config_file(self, file_path: str, config: Optional[Dict[str, Any]] = None, 
                        format_type: Optional[str] = None):
        """保存配置到文件"""
        try:
            path = Path(file_path)
            config_to_save = config or self.merged_config
            
            # 自動判斷格式
            if format_type is None:
                if path.suffix.lower() in ('.yaml', '.yml'):
                    format_type = 'yaml'
                elif path.suffix.lower() == '.json':
                    format_type = 'json'
                else:
                    format_type = 'yaml'
            
            # 確保目錄存在
            path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(path, 'w', encoding='utf-8') as f:
                if format_type == 'yaml':
                    yaml.dump(config_to_save, f, default_flow_style=False, 
                             allow_unicode=True, sort_keys=True)
                elif format_type == 'json':
                    json.dump(config_to_save, f, indent=2, ensure_ascii=False)
                else:
                    f.write(str(config_to_save))
            
            self.logger.info(f"配置已保存到: {file_path}")
            
        except Exception as e:
            raise ConfigurationError(f"保存配置文件失敗: {e}")
    
    def add_change_callback(self, callback: callable):
        """添加配置變更回調"""
        self.change_callbacks.append(callback)
    
    def remove_change_callback(self, callback: callable):
        """移除配置變更回調"""
        if callback in self.change_callbacks:
            self.change_callbacks.remove(callback)
    
    def create_config_template(self, template_path: str):
        """創建配置模板文件"""
        template_config = {
            '# 資安配置模板': None,
            'security': {
                'logging': {
                    'level': 'INFO',
                    'file': 'logs/security.log',
                    'max_file_size': '10MB',
                    'backup_count': 5
                },
                'monitoring': {
                    'enabled': True,
                    'interval': 60,
                    'thresholds': {
                        'cpu_usage': 80.0,
                        'memory_usage': 85.0,
                        'disk_usage': 90.0
                    }
                },
                'rate_limiting': {
                    'enabled': True,
                    'default_limit': 100,
                    'window_size': 3600
                },
                'encryption': {
                    'algorithm': 'AES-256-GCM',
                    'key_rotation_days': 90
                },
                'authentication': {
                    'session_timeout': 3600,
                    'max_login_attempts': 5,
                    'lockout_duration': 300
                }
            }
        }
        
        # 移除註釋鍵
        template_config.pop('# 資安配置模板')
        
        self.save_config_file(template_path, template_config)
        self.logger.info(f"配置模板已創建: {template_path}")


# 全域配置管理器
_global_config_manager = None

def get_config_manager() -> ConfigManager:
    """獲取全域配置管理器"""
    global _global_config_manager
    if _global_config_manager is None:
        _global_config_manager = ConfigManager()
    return _global_config_manager

def get_config(key: str, default: Any = None) -> Any:
    """獲取配置值"""
    return get_config_manager().get_config(key, default)

def set_config(key: str, value: Any):
    """設置配置值"""
    get_config_manager().set_config(key, value)

def has_config(key: str) -> bool:
    """檢查配置是否存在"""
    return get_config_manager().has_config(key)


if __name__ == "__main__":
    # 測試配置管理器
    config_manager = ConfigManager()
    
    # 測試配置獲取
    log_level = config_manager.get_config('security.logging.level', 'INFO')
    print(f"日誌級別: {log_level}")
    
    # 測試配置設置
    config_manager.set_config('test.value', 'hello world')
    test_value = config_manager.get_config('test.value')
    print(f"測試值: {test_value}")
    
    # 測試配置導出
    yaml_config = config_manager.export_config('yaml')
    print(f"YAML 配置:\n{yaml_config}")
    
    print("配置管理器測試完成")
