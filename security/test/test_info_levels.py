#!/usr/bin/env python3
"""
INFO 層級功能測試 - 更新版本
測試資安架構 info_0、info_1、info_2、info_3 四層級的各項功能
"""

import sys
import os
import time
import json
from datetime import datetime, timedelta

# 添加項目路徑 - 從 security/test/ 到項目根目錄
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

def test_info_0_constants():
    """測試 INFO-0 層級：常數定義"""
    print("🔍 測試 INFO-0 層級：安全常數...")
    
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
        assert SECURITY_EVENT_TYPES['XSS_ATTEMPT'] == 'xss_attempt', "事件類型值應正確"
        
        # 測試日誌級別
        assert 'INFO' in LOG_LEVELS, "應有 INFO 日誌級別"
        assert LOG_LEVELS['INFO'] == 'info', "日誌級別值應正確"
        
        # 測試密碼設定
        assert PASSWORD_MIN_LENGTH >= 8, "最小密碼長度應不少於 8"
        
        print("✅ INFO-0 常數測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-0 常數測試失敗: {e}")
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
        
        # 測試安全令牌生成
        secure_token = SecurityUtils.generate_secure_token(16)
        assert len(secure_token) >= 20, "安全令牌長度應足夠"  # base64編碼會變長
        
        # 測試電子郵件驗證
        assert SecurityUtils.is_valid_email("test@example.com") == True, "有效郵件應通過驗證"
        assert SecurityUtils.is_valid_email("invalid-email") == False, "無效郵件應不通過驗證"
        
        # 測試密碼雜湊（返回 tuple）
        password = "TestPassword123!"
        hashed, salt = SecurityUtils.hash_password(password)
        assert len(hashed) > 50, "雜湊密碼長度應足夠"
        assert len(salt) > 10, "鹽值長度應足夠"
        assert SecurityUtils.verify_password(password, hashed, salt) == True, "密碼驗證應成功"
        assert SecurityUtils.verify_password("wrong", hashed, salt) == False, "錯誤密碼應驗證失敗"
        
        # 測試文件名清理
        dirty_filename = "test<>file?.txt"
        clean_filename = SecurityUtils.sanitize_filename(dirty_filename)
        assert '<' not in clean_filename, "應移除危險字符"
        assert 'test' in clean_filename, "應保留安全內容"
        
        # 測試 IP 驗證
        assert SecurityUtils.is_valid_ip("192.168.1.1") == True, "有效 IP 應通過驗證"
        assert SecurityUtils.is_valid_ip("invalid-ip") == False, "無效 IP 應不通過驗證"
        
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
            AuthorizationError, XSSException, SQLInjectionException, CSRFException
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
        
        # 測試授權例外
        try:
            raise AuthorizationError("授權失敗")
        except AuthorizationError as e:
            assert "授權" in str(e), "授權例外應包含授權關鍵字"
        
        # 測試 XSS 例外
        try:
            raise XSSException("XSS 攻擊檢測")
        except XSSException as e:
            assert "XSS" in str(e), "XSS 例外應包含 XSS 關鍵字"
        
        # 測試例外轉字典
        exc = SecurityException("測試", error_code="TEST", priority="HIGH")
        exc_dict = exc.to_dict()
        assert exc_dict['message'] == "測試", "例外字典應包含訊息"
        assert exc_dict['error_code'] == "TEST", "例外字典應包含錯誤碼"
        assert exc_dict['priority'] == "HIGH", "例外字典應包含優先級"
        
        print("✅ INFO-1 例外測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-1 例外測試失敗: {e}")
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
        logger.log_rate_limit_violation("user123", 100, 3600, 150)
        
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
        
        # 測試配置存在檢查
        assert config_manager.has_config("test.key") == True, "已設置的配置應存在"
        assert config_manager.has_config("nonexistent.key") == False, "未設置的配置應不存在"
        
        # 測試配置導出
        json_config = config_manager.export_config('json')
        assert isinstance(json_config, str), "配置導出應返回字符串"
        
        # 測試全域配置管理器
        global_manager = get_config_manager()
        assert global_manager is not None, "全域配置管理器應可獲取"
        
        # 測試便利函數
        set_config("global.test", "global_value")
        global_value = get_config("global.test")
        assert global_value == "global_value", "全域配置函數應正常工作"
        
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
        monitor.record_timer("test.timer", 0.5)
        
        # 測試指標統計
        stats = monitor.get_metric_stats("test.metric")
        assert stats.get('count') == 1, "指標統計應正確"
        assert stats.get('latest') == 100.0, "最新指標值應正確"
        
        # 測試健康檢查註冊
        def custom_health_check():
            return HealthCheckResult(
                name="custom_check",
                status="healthy",
                message="自定義檢查正常",
                timestamp=datetime.now()
            )
        
        monitor.register_health_check("custom_check", custom_health_check)
        assert "custom_check" in monitor.health_checks, "健康檢查應正確註冊"
        
        # 測試監控啟動和停止
        monitor.start_monitoring()
        time.sleep(2)  # 讓監控運行一段時間
        monitor.stop_monitoring()
        
        # 測試儀表板數據
        dashboard_data = monitor.get_dashboard_data()
        assert isinstance(dashboard_data, dict), "儀表板數據應為字典"
        assert 'timestamp' in dashboard_data, "儀表板數據應包含時間戳"
        
        # 測試指標導出
        exported = monitor.export_metrics('json')
        assert isinstance(exported, str), "指標導出應返回字符串"
        
        # 測試全域監控實例
        global_monitor = get_monitor()
        assert global_monitor is not None, "全域監控實例應可獲取"
        
        # 測試性能監控裝飾器
        @monitor_performance("test_function")
        def test_function():
            time.sleep(0.1)
            return "success"
        
        result = test_function()
        assert result == "success", "裝飾器不應影響函數返回值"
        
        print("✅ INFO-3 安全監控測試通過")
        return True
        
    except Exception as e:
        print(f"❌ INFO-3 安全監控測試失敗: {e}")
        return False


def test_dependencies():
    """測試依賴關係"""
    print("🔍 測試依賴關係...")
    
    try:
        # 測試 INFO-0 無依賴
        from security.levels.info.info_0 import security_constants
        
        # 測試 INFO-1 依賴 INFO-0
        from security.levels.info.info_1 import security_utils
        from security.levels.info.info_1 import security_exceptions
        
        # 測試 INFO-2 依賴 INFO-0, INFO-1
        from security.levels.info.info_2 import security_logger
        
        # 測試 INFO-3 依賴 INFO-0, INFO-1, INFO-2
        from security.levels.info.info_3 import config_manager
        from security.levels.info.info_3 import security_monitoring
        
        print("✅ 依賴關係測試通過")
        return True
        
    except Exception as e:
        print(f"❌ 依賴關係測試失敗: {e}")
        return False


def test_yaml_configuration():
    """測試 YAML 配置"""
    print("🔍 測試 YAML 配置...")
    
    try:
        import yaml
        
        # 讀取安全層級配置
        config_path = os.path.join(project_root, 'security', 'configs', 'security-levels.yaml')
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
            
            # 檢查 info 層級配置
            security_levels = config.get('security_levels', {})
            
            assert 'info_0' in security_levels, "應有 info_0 層級配置"
            assert 'info_1' in security_levels, "應有 info_1 層級配置"
            assert 'info_2' in security_levels, "應有 info_2 層級配置"
            assert 'info_3' in security_levels, "應有 info_3 層級配置"
            
            # 檢查依賴關係
            info_0 = security_levels['info_0']
            info_1 = security_levels['info_1']
            info_2 = security_levels['info_2']
            info_3 = security_levels['info_3']
            
            assert info_0.get('dependencies') == [], "info_0 應無依賴"
            assert 'info_0' in info_1.get('dependencies', []), "info_1 應依賴 info_0"
            assert 'info_0' in info_2.get('dependencies', []), "info_2 應依賴 info_0"
            assert 'info_1' in info_2.get('dependencies', []), "info_2 應依賴 info_1"
            
            print("✅ YAML 配置測試通過")
            return True
        else:
            print("⚠️ YAML 配置文件不存在，跳過測試")
            return True
        
    except Exception as e:
        print(f"❌ YAML 配置測試失敗: {e}")
        return False


def test_integration():
    """整合測試"""
    print("🔍 執行整合測試...")
    
    try:
        # 整合測試：配置 + 日誌 + 監控
        from security.levels.info.info_2.security_logger import SecurityLogger
        from security.levels.info.info_3.config_manager import ConfigManager
        from security.levels.info.info_3.security_monitoring import SecurityMonitoring
        
        # 初始化各組件
        logger = SecurityLogger("integration_test", log_file=None, enable_console=False)
        config = ConfigManager()
        monitor = SecurityMonitoring()
        
        # 測試組件協作
        config.set_config("monitor.enabled", True)
        enabled = config.get_config("monitor.enabled")
        
        if enabled:
            logger.log_security_event("INTEGRATION_TEST", "整合測試開始")
            monitor.record_metric("integration.test", 1.0)
            
        # 測試性能監控與配置結合
        monitoring_interval = config.get_config("security.monitoring.interval", 60)
        assert isinstance(monitoring_interval, (int, float)), "監控間隔應為數字"
        
        logger.log_security_event("INTEGRATION_TEST", "整合測試完成")
        
        print("✅ 整合測試通過")
        return True
        
    except Exception as e:
        print(f"❌ 整合測試失敗: {e}")
        return False


def main():
    """主測試函數"""
    print("🚀 開始 INFO 四層級功能測試")
    print("=" * 60)
    
    test_results = []
    
    # 執行各項測試
    tests = [
        ("INFO-0 常數", test_info_0_constants),
        ("INFO-1 工具", test_info_1_utils),
        ("INFO-1 例外", test_info_1_exceptions),
        ("INFO-2 日誌", test_info_2_security_logger),
        ("INFO-3 配置", test_info_3_config_manager),
        ("INFO-3 監控", test_info_3_security_monitoring),
        ("依賴關係", test_dependencies),
        ("YAML 配置", test_yaml_configuration),
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
    print("\n" + "=" * 60)
    print("📊 測試結果摘要")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ 通過" if result else "❌ 失敗"
        print(f"{test_name:.<30} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("-" * 60)
    print(f"總計: {len(test_results)} 項測試")
    print(f"通過: {passed} 項")
    print(f"失敗: {failed} 項")
    print(f"成功率: {(passed/len(test_results)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 所有測試通過！INFO 四層級功能正常！")
        return 0
    else:
        print(f"\n⚠️ 有 {failed} 項測試失敗，請檢查相關功能。")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
