#!/usr/bin/env python3
"""
資安系統測試腳本
在虛擬環境中測試所有 INFO 層級模組
"""

import sys
import os
import logging
from pathlib import Path

# 設置項目路徑
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_info_level_modules():
    """測試 INFO 層級的所有模組"""
    print("🚀 開始測試資安系統 INFO 層級模組...")
    
    # 測試 INFO-0 層級
    print("\n📋 測試 INFO-0 層級模組:")
    
    try:
        from security.levels.info.info_0 import security_constants
        print("✅ security_constants 模組導入成功")
        print(f"   - 日誌默認級別: {security_constants.DEFAULT_LOG_LEVEL}")
        print(f"   - 最大文件大小: {security_constants.DEFAULT_MAX_FILE_SIZE}")
    except Exception as e:
        print(f"❌ security_constants 模組導入失敗: {e}")
    
    try:
        from security.levels.info.info_0.security_utils import sanitize_input, is_safe_path
        print("✅ security_utils 模組導入成功")
        # 測試工具函數
        test_input = "<script>alert('test')</script>"
        sanitized = sanitize_input(test_input)
        print(f"   - 輸入淨化測試: '{test_input}' -> '{sanitized}'")
    except Exception as e:
        print(f"❌ security_utils 模組導入失敗: {e}")
    
    try:
        from security.levels.info.info_0.security_exceptions import SecurityException
        print("✅ security_exceptions 模組導入成功")
        # 測試例外類
        try:
            raise SecurityException("測試例外")
        except SecurityException as se:
            print(f"   - 例外測試通過: {se}")
    except Exception as e:
        print(f"❌ security_exceptions 模組導入失敗: {e}")
    
    # 測試 INFO-1 層級
    print("\n📊 測試 INFO-1 層級模組:")
    
    try:
        from security.levels.info.info_1.security_logger import get_security_logger
        logger = get_security_logger("test")
        logger.info("測試日誌記錄")
        print("✅ security_logger 模組導入成功")
        print(f"   - 日誌器名稱: {logger.name}")
    except Exception as e:
        print(f"❌ security_logger 模組導入失敗: {e}")
    
    try:
        from security.levels.info.info_2.security_monitoring import SystemMonitor
        monitor = SystemMonitor()
        metrics = monitor.get_system_metrics()
        print("✅ security_monitoring 模組導入成功")
        print(f"   - CPU 使用率: {metrics.get('cpu_percent', 'N/A')}%")
        print(f"   - 記憶體使用率: {metrics.get('memory_percent', 'N/A')}%")
    except Exception as e:
        print(f"❌ security_monitoring 模組導入失敗: {e}")
    
    # 測試 INFO-2 層級
    print("\n⚙️ 測試 INFO-2 層級模組:")
    
    try:
        from security.levels.info.info_2.config_manager import ConfigManager, get_config
        config_manager = ConfigManager()
        print("✅ config_manager 模組導入成功")
        
        # 測試配置讀取
        log_level = get_config('security.logging.level', 'INFO')
        print(f"   - 配置讀取測試: security.logging.level = {log_level}")
        
        # 測試 YAML 導出
        yaml_config = config_manager.export_config('yaml')
        print(f"   - YAML 導出測試: {len(yaml_config)} 字符")
        
        # 測試配置來源信息
        sources = config_manager.get_config_sources_info()
        print(f"   - 配置來源數量: {len(sources)}")
        
    except Exception as e:
        print(f"❌ config_manager 模組導入失敗: {e}")

def test_package_installations():
    """測試套件安裝"""
    print("\n📦 測試套件安裝:")
    
    required_packages = [
        'yaml',
        'psutil', 
        'cryptography',
        'flask',
        'pytest'
    ]
    
    for package in required_packages:
        try:
            __import__(package if package != 'yaml' else 'yaml')
            print(f"✅ {package} 套件已安裝")
        except ImportError:
            print(f"❌ {package} 套件未安裝")

def test_virtual_environment():
    """測試虛擬環境"""
    print("\n🐍 測試虛擬環境:")
    
    print(f"✅ Python 版本: {sys.version}")
    print(f"✅ Python 路徑: {sys.executable}")
    
    # 檢查是否在虛擬環境中
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ 正在虛擬環境中運行")
        print(f"   - 虛擬環境路徑: {sys.prefix}")
    else:
        print("⚠️ 未在虛擬環境中運行")

def main():
    """主測試函數"""
    print("=" * 60)
    print("🔒 資安系統虛擬環境測試")
    print("=" * 60)
    
    # 設置日誌
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    test_virtual_environment()
    test_package_installations()
    test_info_level_modules()
    
    print("\n" + "=" * 60)
    print("🎉 測試完成！")
    print("=" * 60)

if __name__ == "__main__":
    main()
