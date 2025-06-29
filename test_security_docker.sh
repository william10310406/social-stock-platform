#!/bin/bash

# Docker 環境下的資安模組測試腳本

set -e

echo "🐳 Docker 環境資安模組測試"
echo "=========================="

# 檢查 Docker 服務狀態
echo "📋 檢查 Docker 服務狀態..."
docker-compose ps

# 檢查 backend 容器是否運行
if ! docker-compose ps | grep -q "stock-insight-backend.*Up"; then
    echo "❌ Backend 容器未運行，正在啟動..."
    docker-compose up -d backend
    sleep 10
fi

echo ""
echo "🔍 測試資安模組..."

# 測試配置管理器
echo "⚙️ 測試配置管理器..."
docker exec stock-insight-backend python -c "
from security.levels.info.info_2.config_manager import get_config, ConfigManager
print('✅ 配置管理器導入成功')
print(f'📊 日誌級別: {get_config(\"security.logging.level\", \"INFO\")}')
cm = ConfigManager()
print(f'📈 配置來源數量: {len(cm.get_config_sources_info())}')
"

# 測試 YAML 支援
echo ""
echo "📄 測試 YAML 支援..."
docker exec stock-insight-backend python -c "
import yaml
from security.levels.info.info_2.config_manager import ConfigManager
cm = ConfigManager()
yaml_config = cm.export_config('yaml')
print(f'✅ YAML 導出成功，長度: {len(yaml_config)} 字符')
"

# 測試系統監控
echo ""
echo "📊 測試系統監控..."
docker exec stock-insight-backend python -c "
try:
    import psutil
    print(f'✅ psutil 可用，CPU 使用率: {psutil.cpu_percent()}%')
    print(f'📈 記憶體使用率: {psutil.virtual_memory().percent}%')
except Exception as e:
    print(f'❌ 系統監控測試失敗: {e}')
"

# 測試加密模組
echo ""
echo "🔐 測試加密模組..."
docker exec stock-insight-backend python -c "
try:
    from cryptography.fernet import Fernet
    key = Fernet.generate_key()
    f = Fernet(key)
    message = b'Hello Docker Security!'
    encrypted = f.encrypt(message)
    decrypted = f.decrypt(encrypted)
    print(f'✅ 加密功能正常: {decrypted.decode()}')
except Exception as e:
    print(f'❌ 加密測試失敗: {e}')
"

# 檢查環境變數
echo ""
echo "🌍 檢查環境變數..."
docker exec stock-insight-backend python -c "
import os
security_vars = [k for k in os.environ.keys() if k.startswith('SECURITY_')]
print(f'✅ 找到 {len(security_vars)} 個資安環境變數')
for var in security_vars[:5]:  # 只顯示前5個
    value = os.environ[var]
    print(f'   {var}: {value[:20]}...' if len(value) > 20 else f'   {var}: {value}')
"

# 測試完整資安系統
echo ""
echo "🚀 執行完整資安系統測試..."
if docker exec stock-insight-backend test -f test_security_system.py; then
    docker exec stock-insight-backend python test_security_system.py
else
    echo "⚠️ test_security_system.py 不存在，跳過完整測試"
fi

echo ""
echo "🎉 Docker 環境資安模組測試完成！"
echo ""
echo "💡 常用指令："
echo "   docker-compose up -d                # 啟動所有服務"
echo "   docker exec -it stock-insight-backend bash  # 進入 backend 容器"
echo "   docker-compose logs -f backend      # 查看 backend 日誌"
echo "   docker-compose restart backend      # 重啟 backend 服務"
