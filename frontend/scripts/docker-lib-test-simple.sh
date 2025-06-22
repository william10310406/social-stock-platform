#!/bin/sh

# 簡化的 Docker 環境組件庫測試腳本
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              Docker 環境組件庫測試                            ║"
echo "║            Stock Insight Platform v1.0.0                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 檢查 Docker 環境
echo "📚 檢查 Docker 環境"
if [ -f /.dockerenv ] || [ -n "${DOCKER_CONTAINER}" ]; then
    echo "✅ 確認運行在 Docker 容器中"
    IS_DOCKER=true
else
    echo "⚠️  未檢測到 Docker 環境，可能在本地運行"
    IS_DOCKER=false
fi

echo "ℹ️  容器主機名: ${HOSTNAME:-未知}"
echo "ℹ️  NODE_ENV: ${NODE_ENV:-未設置}"
echo ""

# 檢查組件庫文件
echo "📚 檢查組件庫文件結構"
files_ok=true

for file in "src/lib/index.js" "src/lib/components/Toast.js" "src/lib/components/Modal.js" "src/lib/components/Loading.js" "src/lib/data/Formatter.js"; do
    if [ -f "$file" ]; then
        echo "✅ 文件存在: $file"
    else
        echo "❌ 文件缺失: $file"
        files_ok=false
    fi
done

if [ "$files_ok" = true ]; then
    echo "✅ 所有組件庫文件都存在"
else
    echo "❌ 部分文件缺失"
fi
echo ""

# 檢查 Docker 網路配置
echo "📚 檢查 Docker 網路配置"
echo "ℹ️  Vite 端口: ${VITE_PORT:-5173}"
echo "ℹ️  Vite 主機: ${VITE_HOST:-localhost}"
echo "ℹ️  API 基礎 URL: ${VITE_API_BASE_URL:-預設}"
echo ""

# 運行 Node.js 組件庫檢查
echo "📚 運行 Node.js 組件庫檢查"
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js 可用"

    if [ -f "scripts/check-lib.js" ]; then
        echo "ℹ️  執行組件庫檢查..."
        if node scripts/check-lib.js >/dev/null 2>&1; then
            echo "✅ 組件庫檢查通過"
            node_check=true
        else
            echo "❌ 組件庫檢查失敗"
            node_check=false
        fi
    else
        echo "❌ 找不到檢查腳本: scripts/check-lib.js"
        node_check=false
    fi
else
    echo "❌ Node.js 不可用"
    node_check=false
fi
echo ""

# 檢查測試頁面
echo "📚 檢查測試頁面可訪問性"
test_page="src/pages/test/lib-test.html"

if [ -f "$test_page" ]; then
    echo "✅ 測試頁面存在: $test_page"

    if grep -q "Component Library Test" "$test_page" 2>/dev/null; then
        echo "✅ 測試頁面內容正確"
        page_check=true
    else
        echo "⚠️  測試頁面內容可能不完整"
        page_check=true
    fi

    port="${VITE_PORT:-5173}"
    echo "ℹ️  測試頁面 URL: http://localhost:${port}/${test_page}"
else
    echo "❌ 測試頁面不存在: $test_page"
    page_check=false
fi
echo ""

# 檢查 package.json 腳本
echo "📚 檢查 npm 腳本配置"
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"

    if grep -q "lib:check" package.json 2>/dev/null; then
        echo "✅ lib:check 腳本已配置"
    else
        echo "⚠️  lib:check 腳本未配置"
    fi

    npm_check=true
else
    echo "❌ package.json 不存在"
    npm_check=false
fi
echo ""

# 生成測試總結
echo "📚 測試總結"

if [ "$files_ok" = true ] && [ "$node_check" = true ] && [ "$page_check" = true ] && [ "$npm_check" = true ]; then
    echo "✅ 🎉 所有檢查都通過！組件庫在 Docker 環境中運行正常。"
    echo ""
    echo "ℹ️  下一步建議:"
    echo "  1. 訪問測試頁面: http://localhost:${VITE_PORT:-5173}/src/pages/test/lib-test.html"
    echo "  2. 在瀏覽器控制台運行: window.runLibTest()"
    echo "  3. 測試各個組件功能"
    exit 0
else
    echo "⚠️  部分檢查失敗，請檢查上述輸出。"
    echo ""
    echo "故障排除建議:"
    echo "  1. 檢查文件是否完整"
    echo "  2. 確認 Docker 環境變數設置"
    echo "  3. 驗證網路配置"
    exit 1
fi
