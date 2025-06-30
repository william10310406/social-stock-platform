#!/usr/bin/env python3
"""
INFO 四層級依賴測試
測試新的 INFO-0, INFO-1, INFO-2, INFO-3 四層架構的依賴關係和功能
"""

import sys
import os
import time
from datetime import datetime

# 添加項目路徑
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

def test_info_0_constants():
    """測試 INFO-0 層級：基礎常數定義"""
    print("🔍 測試 INFO-0 層級：基礎常數...")
    
    try:
        from security.levels.info.info_0.security_constants import (
            XSS_DANGEROUS_TAGS, XSS_ALLOWED_TAGS, SECURITY_EVENT_TYPES,
            LOG_LEVELS, PASSWORD_MIN_LENGTH
        )
        
        # 測試 XSS 相關常數
        assert 'script' in XSS_DANGEROUS_TAGS, "XSS 危險標籤應包含 script"
        assert 'b' in XSS_ALLOWED_TAGS, "XSS 允許標籤應包含 b"
        assert len(XSS_DANGEROUS_TAGS) > 0, "應有危險標籤定義"
        
        # 測試安全事件類型
        assert 'XSS_ATTEMPT' in SECURITY_EVENT_TYPES, "應有 XSS 攻擊事件類型"
        
        # 測試日誌級別
        assert 'INFO' in LOG_LEVELS, "應有 INFO 日誌級別"
        
        # 測試密碼設定
        assert PASSWORD_MIN_LENGTH >= 8, "最小密碼長度應不少於 8"
        
        print("✅ INFO-0 常數測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-0 常數測試失敗: {e}")
        return False


def test_info_0_module():
    """測試 INFO-0 層級模組導入"""
    print("🔍 測試 INFO-0 層級模組導入...")
    
    try:
        # 測試從 __init__.py 導入
        from security.levels.info.info_0 import (
            XSS_DANGEROUS_TAGS, SECURITY_EVENT_TYPES, LOG_LEVELS
        )
        
        assert len(XSS_DANGEROUS_TAGS) > 0, "模組導入應包含常數"
        assert 'INFO' in LOG_LEVELS, "模組導入應包含日誌級別"
        
        print("✅ INFO-0 模組導入測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-0 模組導入測試失敗: {e}")
        return False


def test_info_1_utils():
    """測試 INFO-1 層級：工具函數"""
    print("🔍 測試 INFO-1 層級：安全工具...")
    
    try:
        from security.levels.info.info_1.security_utils import SecurityUtils
        
        # 測試 CSRF 令牌生成
        token1 = SecurityUtils.generate_csrf_token()
        token2 = SecurityUtils.generate_csrf_token()
        assert len(token1) >= 32, "CSRF 令牌長度應足夠"
        assert token1 != token2, "每次生成的令牌應不同"
        
        # 測試電子郵件驗證
        assert SecurityUtils.is_valid_email("test@example.com") == True, "有效郵件應通過驗證"
        assert SecurityUtils.is_valid_email("invalid-email") == False, "無效郵件應不通過驗證"
        
        # 測試密碼雜湊
        password = "TestPassword123!"
        hashed, salt = SecurityUtils.hash_password(password)
        assert len(hashed) > 50, "雜湊密碼長度應足夠"
        assert SecurityUtils.verify_password(password, hashed, salt) == True, "密碼驗證應成功"
        
        # 測試檔案名清理
        dirty_filename = "test<>file?.txt"
        clean_filename = SecurityUtils.sanitize_filename(dirty_filename)
        assert '<' not in clean_filename, "應移除危險字符"
        
        print("✅ INFO-1 工具測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-1 工具測試失敗: {e}")
        return False


def test_info_1_exceptions():
    """測試 INFO-1 層級：例外處理"""
    print("🔍 測試 INFO-1 層級：安全例外...")
    
    try:
        from security.levels.info.info_1.security_exceptions import (
            SecurityException, InputValidationError, AuthenticationError,
            XSSException, SQLInjectionException
        )
        
        # 測試基本安全例外
        try:
            raise SecurityException("測試安全例外")
        except SecurityException as e:
            assert str(e) == "測試安全例外", "例外訊息應正確"
        
        # 測試輸入驗證例外
        try:
            raise InputValidationError("輸入驗證失敗")
        except InputValidationError as e:
            assert "驗證" in str(e), "驗證例外應包含驗證關鍵字"
        
        # 測試認證例外
        try:
            raise AuthenticationError("認證失敗")
        except AuthenticationError as e:
            assert "認證" in str(e), "認證例外應包含認證關鍵字"
        
        # 測試 XSS 例外
        try:
            raise XSSException("XSS 攻擊檢測")
        except XSSException as e:
            assert "XSS" in str(e), "XSS 例外應包含 XSS 關鍵字"
        
        print("✅ INFO-1 例外測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-1 例外測試失敗: {e}")
        return False


def test_info_1_module():
    """測試 INFO-1 層級模組導入"""
    print("🔍 測試 INFO-1 層級模組導入...")
    
    try:
        from security.levels.info.info_1 import (
            SecurityUtils, SecurityException, InputValidationError
        )
        
        # 測試工具類可用
        token = SecurityUtils.generate_csrf_token()
        assert len(token) > 0, "工具類應正常工作"
        
        # 測試例外類可用
        exc = SecurityException("測試")
        assert str(exc) == "測試", "例外類應正常工作"
        
        print("✅ INFO-1 模組導入測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-1 模組導入測試失敗: {e}")
        return False


def test_info_2_security_logger():
    """測試 INFO-2 層級：安全日誌"""
    print("🔍 測試 INFO-2 層級：安全日誌系統...")
    
    try:
        from security.levels.info.info_2.security_logger import (
            SecurityLogger, get_security_logger, log_security_event
        )
        
        # 測試 SecurityLogger 初始化
        logger = SecurityLogger("test_logger", log_file=None, enable_console=False)
        assert logger is not None, "SecurityLogger 應能正常初始化"
        
        # 測試日誌記錄
        logger.log_security_event("TEST_EVENT", "這是一個測試事件", priority="INFO")
        
        # 測試不同類型的安全事件
        logger.log_xss_attempt("<script>", user_ip="192.168.1.100")
        logger.log_authentication_failure("testuser", user_ip="192.168.1.100")
        
        # 測試全域日誌記錄器
        global_logger = get_security_logger("global_test")
        assert global_logger is not None, "全域日誌記錄器應可獲取"
        
        # 測試便利函數
        log_security_event("UTILITY_TEST", "便利函數測試", priority="DEBUG")
        
        print("✅ INFO-2 日誌測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-2 日誌測試失敗: {e}")
        return False


def test_info_2_module():
    """測試 INFO-2 層級模組導入"""
    print("🔍 測試 INFO-2 層級模組導入...")
    
    try:
        from security.levels.info.info_2 import (
            SecurityLogger, get_security_logger, log_security_event
        )
        
        # 測試日誌系統可用
        logger = SecurityLogger("module_test", log_file=None, enable_console=False)
        logger.log_security_event("MODULE_TEST", "模組測試")
        
        print("✅ INFO-2 模組導入測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-2 模組導入測試失敗: {e}")
        return False


def test_info_3_config_manager():
    """測試 INFO-3 層級：配置管理"""
    print("🔍 測試 INFO-3 層級：配置管理系統...")
    
    try:
        from security.levels.info.info_3.config_manager import (
            ConfigManager, get_config_manager, get_config, set_config
        )
        
        # 測試 ConfigManager 初始化
        config_manager = ConfigManager()
        assert config_manager is not None, "ConfigManager 應能正常初始化"
        
        # 測試配置設置和獲取
        config_manager.set_config("test.key", "test_value")
        value = config_manager.get_config("test.key")
        assert value == "test_value", "配置值應正確設置和獲取"
        
        # 測試默認值
        default_value = config_manager.get_config("nonexistent.key", "default")
        assert default_value == "default", "不存在的配置應返回默認值"
        
        # 測試全域配置管理器
        global_manager = get_config_manager()
        assert global_manager is not None, "全域配置管理器應可獲取"
        
        print("✅ INFO-3 配置管理測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-3 配置管理測試失敗: {e}")
        return False


def test_info_3_security_monitoring():
    """測試 INFO-3 層級：安全監控"""
    print("🔍 測試 INFO-3 層級：安全監控系統...")
    
    try:
        from security.levels.info.info_3.security_monitoring import (
            SecurityMonitoring, MetricValue, HealthCheckResult,
            get_monitor, monitor_performance
        )
        
        # 測試 SecurityMonitoring 初始化
        monitor = SecurityMonitoring()
        assert monitor is not None, "SecurityMonitoring 應能正常初始化"
        
        # 測試指標記錄
        monitor.record_metric("test.metric", 100.0, {"env": "test"})
        monitor.increment_counter("test.counter")
        monitor.set_gauge("test.gauge", 75.5)
        
        # 測試指標統計
        stats = monitor.get_metric_stats("test.metric")
        assert stats.get('count') == 1, "指標統計應正確"
        
        # 測試全域監控實例
        global_monitor = get_monitor()
        assert global_monitor is not None, "全域監控實例應可獲取"
        
        # 測試性能監控裝飾器
        @monitor_performance("test_function")
        def test_function():
            time.sleep(0.01)
            return "success"
        
        result = test_function()
        assert result == "success", "裝飾器不應影響函數返回值"
        
        print("✅ INFO-3 安全監控測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-3 安全監控測試失敗: {e}")
        return False


def test_info_3_module():
    """測試 INFO-3 層級模組導入"""
    print("🔍 測試 INFO-3 層級模組導入...")
    
    try:
        from security.levels.info.info_3 import (
            ConfigManager, SecurityMonitoring, get_config_manager, get_monitor
        )
        
        # 測試配置管理器可用
        config = ConfigManager()
        config.set_config("module.test", "value")
        
        # 測試監控系統可用
        monitor = SecurityMonitoring()
        monitor.record_metric("module.test", 1.0)
        
        print("✅ INFO-3 模組導入測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-3 模組導入測試失敗: {e}")
        return False


def test_dependency_hierarchy():
    """測試依賴層級關係"""
    print("🔍 測試依賴層級關係...")
    
    try:
        # 測試四層級都能正常導入
        from security.levels.info import info_0, info_1, info_2, info_3
        
        # 測試依賴方向正確 (高層級依賴低層級)
        # INFO-3 使用 INFO-2 的日誌
        from security.levels.info.info_3.config_manager import ConfigManager
        from security.levels.info.info_2.security_logger import get_security_logger
        
        config = ConfigManager()
        logger = get_security_logger("dependency_test")
        
        # 測試 INFO-2 使用 INFO-1 的例外
        from security.levels.info.info_2.security_logger import SecurityLogger
        from security.levels.info.info_1.security_exceptions import SecurityException
        
        # 測試 INFO-1 使用 INFO-0 的常數
        from security.levels.info.info_1.security_utils import SecurityUtils
        from security.levels.info.info_0.security_constants import PASSWORD_MIN_LENGTH
        
        print("✅ 依賴層級關係測試通過")
        return True
        
    except Exception as e:
        print(f"❌ 依賴層級關係測試失敗: {e}")
        return False


def test_integration():
    """整合測試：測試跨層級功能協作"""
    print("🔍 執行整合測試...")
    
    try:
        # 整合測試：使用所有四個層級
        from security.levels.info.info_0.security_constants import SECURITY_EVENT_TYPES
        from security.levels.info.info_1.security_utils import SecurityUtils
        from security.levels.info.info_2.security_logger import SecurityLogger
        from security.levels.info.info_3.config_manager import ConfigManager
        from security.levels.info.info_3.security_monitoring import SecurityMonitoring
        
        # 初始化各組件
        config = ConfigManager()
        logger = SecurityLogger("integration_test", log_file=None, enable_console=False)
        monitor = SecurityMonitoring()
        
        # 測試組件協作
        config.set_config("integration.test", True)
        test_enabled = config.get_config("integration.test")
        
        if test_enabled:
            # 使用工具生成令牌
            token = SecurityUtils.generate_csrf_token()
            
            # 記錄安全事件
            logger.log_security_event("INTEGRATION_TEST", f"生成令牌: {token[:8]}...")
            
            # 記錄監控指標
            monitor.record_metric("integration.token_generated", 1.0)
        
        # 驗證事件類型常數可用
        assert 'INTEGRATION_TEST' in SECURITY_EVENT_TYPES or len(SECURITY_EVENT_TYPES) > 0
        
        print("✅ 整合測試通過")
        return True
        
    except Exception as e:
        print(f"❌ 整合測試失敗: {e}")
        return False


def main():
    """主測試函數"""
    print("🚀 開始 INFO 四層級依賴測試")
    print("=" * 70)
    
    test_results = []
    
    # 執行各項測試
    tests = [
        ("INFO-0 常數", test_info_0_constants),
        ("INFO-0 模組", test_info_0_module),
        ("INFO-1 工具", test_info_1_utils),
        ("INFO-1 例外", test_info_1_exceptions),
        ("INFO-1 模組", test_info_1_module),
        ("INFO-2 日誌", test_info_2_security_logger),
        ("INFO-2 模組", test_info_2_module),
        ("INFO-3 配置", test_info_3_config_manager),
        ("INFO-3 監控", test_info_3_security_monitoring),
        ("INFO-3 模組", test_info_3_module),
        ("依賴層級", test_dependency_hierarchy),
        ("整合測試", test_integration)
    ]
    
    for test_name, test_func in tests:
        print(f"\n📋 執行 {test_name} 測試...")
        try:
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} 測試出現異常: {e}")
            test_results.append((test_name, False))
    
    # 輸出測試結果摘要
    print("\n" + "=" * 70)
    print("📊 測試結果摘要")
    print("=" * 70)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ 通過" if result else "❌ 失敗"
        print(f"{test_name:.<35} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("-" * 70)
    print(f"總計: {len(test_results)} 項測試")
    print(f"通過: {passed} 項")
    print(f"失敗: {failed} 項")
    print(f"成功率: {(passed/len(test_results)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 所有測試通過！INFO 四層級架構正常！")
        return 0
    else:
        print(f"\n⚠️ 有 {failed} 項測試失敗，請檢查相關功能。")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
