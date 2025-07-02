#!/usr/bin/env python3
"""
LOW 層級功能測試
測試資安架構 LOW 層級的各項功能，包括：
- 信息洩露防護 (info_disclosure_prevention)
- 密碼策略 (password_policy)
- 安全標頭 (security_headers)
- 路徑遍歷防護 (path_traversal_guard)
- 端點安全 (endpoint_security)
"""

import sys
import os
import tempfile
from datetime import datetime
from pathlib import Path

# 添加項目路徑
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

def test_info_disclosure_prevention():
    """測試信息洩露防護模組"""
    print("🔍 測試 LOW 層級：信息洩露防護...")
    
    from security.levels.low.info_disclosure_prevention import (
        InfoDisclosurePrevention, scan_for_info_leaks, sanitize_error
    )
    
    # 測試信息洩露防護實例化
    idp = InfoDisclosurePrevention()
    assert idp is not None, "InfoDisclosurePrevention 實例化失敗"
    
    # 測試敏感信息掃描
    test_text = "這是我的email: user@example.com 和電話: 0912-345-678"
    leaks = scan_for_info_leaks(test_text)
    assert leaks is not None, "scan_for_info_leaks 應該返回結果"
    assert len(leaks) > 0, "應該檢測到敏感信息"
    
    # 測試錯誤信息清理
    error_msg = "Database connection failed: password='secret123' at line 42"
    clean_error = sanitize_error(error_msg)
    assert clean_error != error_msg, "錯誤信息應該被清理"
    assert "secret123" not in clean_error, "敏感信息應該被移除"
    
    print("✅ 信息洩露防護測試通過")

def test_password_policy():
    """測試密碼策略模組"""
    print("🔍 測試 LOW 層級：密碼策略...")
    
    from security.levels.low.password_policy import (
        PasswordPolicy, PasswordStrength, validate_password_strength
    )
    
    # 測試密碼策略實例化
    pp = PasswordPolicy()
    assert pp is not None, "PasswordPolicy 實例化失敗"
    
    # 測試密碼強度驗證
    weak_password = "123"
    strong_password = "MyP@ssw0rd123!"
    
    weak_result = validate_password_strength(weak_password)
    strong_result = validate_password_strength(strong_password)
    
    assert weak_result['strength'] == PasswordStrength.VERY_WEAK, "弱密碼應該被識別"
    assert strong_result['strength'].value >= PasswordStrength.STRONG.value, "強密碼應該被識別"
    assert not weak_result['is_valid'], "弱密碼應該不通過驗證"
    assert strong_result['is_valid'], "強密碼應該通過驗證"
    
    print("✅ 密碼策略測試通過")

def test_security_headers():
    """測試安全標頭模組"""
    print("🔍 測試 LOW 層級：安全標頭...")
    
    from security.levels.low.security_headers import (
        SecurityHeaders, get_security_headers
    )
    
    # 測試安全標頭實例化
    sh = SecurityHeaders()
    assert sh is not None, "SecurityHeaders 實例化失敗"
    
    # 測試獲取安全標頭
    headers = get_security_headers()
    assert headers is not None, "get_security_headers 應該返回標頭"
    assert isinstance(headers, dict), "標頭應該是字典格式"
    
    # 檢查關鍵安全標頭
    key_headers = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection']
    for header in key_headers:
        assert header in headers, f"缺少關鍵安全標頭: {header}"
    
    # 測試標頭驗證
    test_headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
    }
    validation_result = sh.validate_headers(test_headers)
    assert validation_result is not None, "標頭驗證應該返回結果"
    
    print("✅ 安全標頭測試通過")

def test_path_traversal_guard():
    """測試路徑遍歷防護模組"""
    print("🔍 測試 LOW 層級：路徑遍歷防護...")
    
    from security.levels.low.path_traversal_guard import (
        PathTraversalGuard, validate_file_path, get_safe_filename
    )
    
    # 測試路徑遍歷防護實例化
    ptg = PathTraversalGuard()
    assert ptg is not None, "PathTraversalGuard 實例化失敗"
    
    # 測試安全路徑驗證 - 使用相對路徑避免系統目錄檢查
    safe_path = "public/safe_file.txt"
    dangerous_path = "../../../etc/passwd"
    
    safe_result = validate_file_path(safe_path)
    dangerous_result = validate_file_path(dangerous_path)
    
    assert safe_result['is_safe'], "安全路徑應該通過驗證"
    assert not dangerous_result['is_safe'], "危險路徑應該被阻止"
    
    # 測試安全檔案名生成
    dangerous_filename = "../../../malicious.txt"
    safe_filename = get_safe_filename(dangerous_filename)
    assert safe_filename != dangerous_filename, "危險檔案名應該被清理"
    assert "../" not in safe_filename, "路徑遍歷字符應該被移除"
    
    print("✅ 路徑遍歷防護測試通過")

def test_endpoint_security():
    """測試端點安全模組"""
    print("🔍 測試 LOW 層級：端點安全...")
    
    from security.levels.low.endpoint_security import (
        EndpointSecurity, validate_endpoint_request
    )
    
    # 測試端點安全實例化
    es = EndpointSecurity()
    assert es is not None, "EndpointSecurity 實例化失敗"
    
    # 測試端點請求驗證
    safe_request = {
        'path': '/api/public/data',
        'method': 'GET',
        'headers': {'User-Agent': 'Mozilla/5.0'},
        'remote_ip': '192.168.1.100'
    }
    
    dangerous_request = {
        'path': '/admin/delete_all',
        'method': 'POST',
        'headers': {'User-Agent': 'curl/7.0'},
        'remote_ip': '192.168.1.100'
    }
    
    safe_result = validate_endpoint_request(safe_request)
    dangerous_result = validate_endpoint_request(dangerous_request)
    
    assert safe_result is not None, "端點驗證應該返回結果"
    assert dangerous_result is not None, "端點驗證應該返回結果"
    
    # 測試速率限制檢查 (使用公開方法)
    rate_limit_result = es._check_rate_limit('192.168.1.100', '/api/test')
    assert rate_limit_result is not None, "速率限制檢查應該返回結果"
    assert 'is_allowed' in rate_limit_result, "速率限制結果應該包含 is_allowed"
    
    print("✅ 端點安全測試通過")

def test_low_level_dependencies():
    """測試 LOW 層級依賴關係"""
    print("🔍 測試 LOW 層級：依賴關係...")
    
    # 測試所有 LOW 層級模組導入
    from security.levels.low import (
        InfoDisclosurePrevention, PasswordPolicy, SecurityHeaders,
        PathTraversalGuard, EndpointSecurity
    )
    
    # 測試依賴的 INFO 層級模組
    from security.levels.info.info_0.security_constants import SECURITY_EVENT_TYPES
    from security.levels.info.info_1.security_exceptions import SecurityException
    from security.levels.info.info_2.security_logger import SecurityLogger
    from security.levels.info.info_3.config_manager import get_config
    
    # 測試實例化
    idp = InfoDisclosurePrevention()
    pp = PasswordPolicy()
    sh = SecurityHeaders()
    ptg = PathTraversalGuard()
    es = EndpointSecurity()
    
    assert all([idp, pp, sh, ptg, es]), "所有 LOW 層級模組應該可以實例化"
    
    print("✅ LOW 層級依賴關係測試通過")

def test_low_level_integration():
    """測試 LOW 層級整合功能"""
    print("🔍 測試 LOW 層級：整合功能...")
    
    from security.levels.low import (
        InfoDisclosurePrevention, PasswordPolicy, SecurityHeaders
    )
    from security.levels.low.security_headers import get_security_headers
    
    # 創建測試實例
    idp = InfoDisclosurePrevention()
    pp = PasswordPolicy()
    sh = SecurityHeaders()
    
    # 測試整合場景：處理用戶註冊
    test_data = {
        'email': 'user@example.com',
        'password': 'Test123!@#',
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    # 1. 檢查信息洩露
    email_leaks = idp.scan_text_for_leaks(test_data['email'])
    assert email_leaks is not None, "信息洩露掃描應該返回結果"
    
    # 2. 驗證密碼強度
    password_check = pp.validate_password(test_data['password'])
    assert password_check['is_valid'], "測試密碼應該通過驗證"
    
    # 3. 獲取安全標頭 (使用全域函數)
    headers = get_security_headers()
    assert headers is not None, "應該生成安全標頭"
    
    print("✅ LOW 層級整合功能測試通過")

def run_all_tests():
    """執行所有測試"""
    print("🚀 開始執行 LOW 層級測試...")
    print("=" * 60)
    
    tests = [
        test_info_disclosure_prevention,
        test_password_policy,
        test_security_headers,
        test_path_traversal_guard,
        test_endpoint_security,
        test_low_level_dependencies,
        test_low_level_integration
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()  # 直接調用測試函數，不檢查返回值
            passed += 1
        except Exception as e:
            print(f"❌ 測試執行異常: {e}")
            failed += 1
        print("-" * 40)
    
    print("=" * 60)
    print(f"📊 測試結果：")
    print(f"✅ 通過: {passed}")
    print(f"❌ 失敗: {failed}")
    print(f"📈 成功率: {passed/(passed+failed)*100:.1f}%")
    
    if failed == 0:
        print("🎉 所有 LOW 層級測試通過！")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查錯誤信息")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
