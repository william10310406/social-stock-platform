#!/bin/bash

# StockOS 開發環境設定腳本
# 基於 Stock Insight Platform 的自動化經驗

echo "🚀 Setting up StockOS development environment..."
echo "================================================"

# 檢查是否為 macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is designed for macOS"
    exit 1
fi

# 檢查 Homebrew
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew already installed"
fi

# 更新 Homebrew
echo "🔄 Updating Homebrew..."
brew update

# 安裝基本開發工具
echo "📦 Installing development tools..."

# QEMU (虛擬機)
if ! command -v qemu-system-i386 &> /dev/null; then
    echo "  Installing QEMU..."
    brew install qemu
else
    echo "  ✅ QEMU already installed"
fi

# NASM (組語編譯器)
if ! command -v nasm &> /dev/null; then
    echo "  Installing NASM..."
    brew install nasm
else
    echo "  ✅ NASM already installed"
fi

# GDB (除錯器)
if ! command -v gdb &> /dev/null; then
    echo "  Installing GDB..."
    brew install gdb
else
    echo "  ✅ GDB already installed"
fi

# 交叉編譯工具鏈
echo "🔧 Installing cross-compilation toolchain..."

# 檢查 i686-elf-gcc
if ! command -v i686-elf-gcc &> /dev/null; then
    echo "  Installing i686-elf-gcc..."
    brew install i686-elf-gcc
else
    echo "  ✅ i686-elf-gcc already installed"
fi

# 檢查 i686-elf-binutils
if ! command -v i686-elf-ld &> /dev/null; then
    echo "  Installing i686-elf-binutils..."
    brew install i686-elf-binutils
else
    echo "  ✅ i686-elf-binutils already installed"
fi

# GRUB (用於創建可啟動 ISO)
if ! command -v grub-mkrescue &> /dev/null; then
    echo "  Installing GRUB..."
    brew install grub
else
    echo "  ✅ GRUB already installed"
fi

# 創建必要的目錄
echo "📁 Creating project directories..."
mkdir -p build
mkdir -p iso/boot

# 設定權限
echo "🔐 Setting up permissions..."
chmod +x tools/*.sh

# 驗證安裝
echo "🔍 Verifying installation..."
echo ""

# 檢查所有工具
tools=("qemu-system-i386" "nasm" "gdb" "i686-elf-gcc" "i686-elf-ld" "grub-mkrescue")
all_installed=true

for tool in "${tools[@]}"; do
    if command -v "$tool" &> /dev/null; then
        echo "✅ $tool: $(which $tool)"
    else
        echo "❌ $tool: Not found"
        all_installed=false
    fi
done

echo ""

if [ "$all_installed" = true ]; then
    echo "🎉 StockOS development environment setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Run 'make setup' to verify everything works"
    echo "  2. Run 'make' to build StockOS"
    echo "  3. Run 'make run' to test in QEMU"
    echo "  4. Run 'make debug' for debugging"
    echo ""
    echo "📚 Useful commands:"
    echo "  make help     - Show all available commands"
    echo "  make info     - Show build information"
    echo "  make clean    - Clean build files"
    echo ""
    echo "🚀 Ready to start developing StockOS!"
else
    echo "❌ Some tools failed to install. Please check the errors above."
    exit 1
fi 