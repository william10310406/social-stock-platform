#!/bin/bash

# 資安專案虛擬環境設置腳本
# 用於快速設置和啟動虛擬環境

set -e

PROJECT_DIR="/Users/angelina1114/Desktop/social-stock-platform"
VENV_DIR="$PROJECT_DIR/venv"

echo "🔒 資安專案虛擬環境設置"
echo "==============================="

# 檢查專案目錄
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ 專案目錄不存在: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# 檢查虛擬環境
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 建立虛擬環境..."
    python3 -m venv venv
    echo "✅ 虛擬環境建立完成"
else
    echo "✅ 虛擬環境已存在"
fi

# 啟動虛擬環境
echo "🚀 啟動虛擬環境..."
source venv/bin/activate

# 檢查並安裝依賴
echo "📦 檢查依賴套件..."
if [ -f "security_requirements.txt" ]; then
    echo "🔧 安裝資安模組依賴..."
    pip install -r security_requirements.txt
else
    echo "🔧 安裝基礎依賴..."
    pip install pyyaml psutil cryptography flask pytest
fi

echo ""
echo "✅ 虛擬環境設置完成！"
echo "🎯 您可以使用以下指令："
echo "   source venv/bin/activate  # 啟動虛擬環境"
echo "   python test_security_system.py  # 測試資安系統"
echo "   python -m security.levels.info.info_2.config_manager  # 測試配置管理"
echo "   deactivate  # 停用虛擬環境"
echo ""
echo "📋 虛擬環境資訊："
echo "   路徑: $VENV_DIR"
echo "   Python: $(python --version)"
echo "   已安裝套件: $(pip list | wc -l) 個"
echo ""

# 顯示 Python 路徑
echo "🐍 Python 資訊："
python -c "import sys; print(f'   執行路徑: {sys.executable}')"
python -c "import sys; print(f'   版本: {sys.version}')"

# 檢查關鍵套件
echo ""
echo "📦 關鍵套件檢查："
for package in "yaml" "psutil" "cryptography" "flask"; do
    if python -c "import $package" 2>/dev/null; then
        echo "   ✅ $package"
    else
        echo "   ❌ $package"
    fi
done

echo ""
echo "🎉 準備就緒！可以開始開發資安系統了！"
