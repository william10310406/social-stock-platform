#!/bin/bash

# 🔧 Docker 問題快速修復腳本
# 專門解決 "Cannot connect to the Docker daemon" 問題

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}   Docker 問題快速修復工具              ${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# 檢測操作系統
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo -e "${YELLOW}🔍 檢測到操作系統: $OS${NC}"
echo ""

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安裝！${NC}"
    echo ""
    echo -e "${BLUE}📥 安裝 Docker:${NC}"
    case $OS in
        "macos")
            echo "   1. 訪問: https://www.docker.com/products/docker-desktop"
            echo "   2. 下載 macOS 版本"
            echo "   3. 安裝並重啟電腦"
            ;;
        "windows")
            echo "   1. 訪問: https://www.docker.com/products/docker-desktop"
            echo "   2. 下載 Windows 版本"
            echo "   3. 安裝並重啟電腦"
            ;;
        "linux")
            echo "   1. Ubuntu/Debian: sudo apt-get install docker.io"
            echo "   2. CentOS/RHEL: sudo yum install docker"
            echo "   3. 啟動服務: sudo systemctl start docker"
            ;;
    esac
    exit 1
fi

echo -e "${GREEN}✅ Docker 已安裝${NC}"

# 檢查 Docker 守護程序
echo -e "${YELLOW}🔍 檢查 Docker 守護程序...${NC}"

if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker 守護程序正在運行${NC}"
    echo ""
    echo -e "${GREEN}🎉 Docker 問題已解決！${NC}"
    echo -e "${BLUE}   現在可以運行: ./scripts/start-for-friends.sh${NC}"
    exit 0
else
    echo -e "${RED}❌ Docker 守護程序未運行${NC}"
    echo ""
    
    case $OS in
        "macos")
            echo -e "${YELLOW}🍎 macOS 修復步驟:${NC}"
            echo ""
            echo "1. 打開 Docker Desktop:"
            echo "   open -a Docker"
            echo ""
            echo "2. 等待 Docker Desktop 完全啟動"
            echo "   狀態欄應該顯示 'Docker Desktop is running'"
            echo ""
            echo "3. 如果 Docker Desktop 沒有自動啟動:"
            echo "   - 打開 Applications 文件夾"
            echo "   - 找到並雙擊 Docker Desktop"
            echo "   - 等待啟動完成"
            echo ""
            echo "4. 檢查狀態:"
            echo "   docker info"
            echo ""
            echo -e "${YELLOW}💡 提示: Docker Desktop 可能需要幾分鐘才能完全啟動${NC}"
            ;;
            
        "windows")
            echo -e "${YELLOW}🪟 Windows 修復步驟:${NC}"
            echo ""
            echo "1. 在開始菜單中搜索 'Docker Desktop'"
            echo "2. 雙擊啟動 Docker Desktop"
            echo "3. 等待完全啟動"
            echo "4. 檢查狀態: docker info"
            echo ""
            echo -e "${YELLOW}💡 提示: 如果 Docker Desktop 沒有自動啟動，請手動啟動${NC}"
            ;;
            
        "linux")
            echo -e "${YELLOW}🐧 Linux 修復步驟:${NC}"
            echo ""
            echo "1. 啟動 Docker 服務:"
            echo "   sudo systemctl start docker"
            echo ""
            echo "2. 設置開機自啟:"
            echo "   sudo systemctl enable docker"
            echo ""
            echo "3. 將用戶加入 docker 組:"
            echo "   sudo usermod -aG docker $USER"
            echo ""
            echo "4. 重新登入或運行:"
            echo "   newgrp docker"
            echo ""
            echo "5. 檢查狀態:"
            echo "   docker info"
            echo ""
            echo -e "${YELLOW}💡 提示: 需要重新登入才能生效${NC}"
            ;;
            
        *)
            echo "請手動啟動 Docker Desktop 或 Docker 服務"
            echo "然後運行: docker info"
            ;;
    esac
    
    echo ""
    echo -e "${BLUE}🔄 修復完成後，重新運行此腳本檢查狀態${NC}"
    echo -e "${BLUE}   或者直接運行: ./scripts/start-for-friends.sh${NC}"
    echo ""
    echo -e "${YELLOW}📞 如果問題持續，請檢查:${NC}"
    echo "   - Docker Desktop 是否正確安裝"
    echo "   - 系統是否有足夠的權限"
    echo "   - 防火牆是否阻止了 Docker"
    echo "   - 系統資源是否充足"
fi 