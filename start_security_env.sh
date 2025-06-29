#!/bin/bash

# 資安專案日常啟動腳本
# 僅用於日常開發時快速啟動虛擬環境

set -e

PROJECT_DIR="/Users/angelina1114/Desktop/social-stock-platform"
VENV_DIR="$PROJECT_DIR/venv"

echo "🔒 啟動資安專案虛擬環境"
echo "=========================="

# 檢查專案目錄
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ 專案目錄不存在: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# 檢查虛擬環境
if [ ! -d "$VENV_DIR" ]; then
    echo "❌ 虛擬環境不存在，請先運行完整設置："
    echo "   ./setup_security_env.sh"
    exit 1
fi

# 啟動虛擬環境
echo "🚀 啟動虛擬環境..."
source venv/bin/activate

echo ""
echo "✅ 虛擬環境已啟動！"
echo ""
echo "🎯 常用指令："
echo "   python test_security_system.py  # 測試資安系統"
echo "   python -m security.levels.info.info_2.config_manager  # 測試配置管理"
echo "   deactivate  # 停用虛擬環境"
echo ""
echo "📍 當前環境："
python -c "import sys; print(f'   Python: {sys.version.split()[0]}')"
python -c "import sys; print(f'   路徑: {sys.executable}')"
echo ""
echo "🎉 準備就緒，開始開發吧！"

# 保持 shell 在虛擬環境中
exec "$SHELL"
