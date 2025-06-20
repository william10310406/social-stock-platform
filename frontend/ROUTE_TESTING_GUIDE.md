# 路徑測試與驗證指南

## 🎯 概述

本指南提供了多種方法來檢查和驗證 Stock Insight Platform 中的所有路徑，確保所有頁面、資源和 API 端點都正常工作。

## 🛠️ 可用的檢查工具

### 1. 🚀 快速檢查腳本（推薦）

**最簡單快速的方法，無需額外依賴**

```bash
# 執行快速路徑檢查
./frontend/scripts/quick-check.sh
```

**檢查內容：**
- ✅ 服務狀態（前端 + 後端）
- ✅ 所有主要頁面（9 個頁面）
- ✅ 靜態資源（JS/CSS/組件）
- ✅ PWA 相關文件
- ✅ API 健康檢查

**輸出示例：**
```
🔍 Stock Insight Platform 快速路徑檢查
===========================================

檢查服務狀態...
  ✅ 前端服務運行中
  ✅ 後端服務運行中

檢查主要頁面...
  ✅ 首頁
  ✅ 登入頁面
  ✅ 儀表板
  ...

=== 檢查報告 ===
📊 總共檢查: 25 個項目
✅ 成功: 25
❌ 失敗: 0
📈 成功率: 100%

🎉 所有檢查都通過了！
```

### 2. 🔧 進階路徑檢查工具

**功能更強大的 Node.js 工具**

```bash
# 安裝依賴（首次使用）
cd frontend && npm install

# 執行完整路徑檢查
node scripts/check-routes.js
```

**額外功能：**
- 🔍 更詳細的錯誤信息
- 📊 分組檢查報告
- ⚡ 並行請求檢查
- 🎯 自定義超時設置

### 3. 🔗 鏈接驗證工具

**檢查 HTML 文件中的內部鏈接**

```bash
# 安裝額外依賴
npm install jsdom

# 執行鏈接驗證
node scripts/validate-links.js
```

**檢查內容：**
- 🔗 `<a href="">` 鏈接
- 📜 `<script src="">` 腳本文件
- 🎨 `<link href="">` 樣式表
- 🖼️ `<img src="">` 圖片資源

## 📋 手動檢查方法

### 瀏覽器檢查

**1. 主要頁面訪問測試**
```
✅ http://localhost:5173/                           - 首頁
✅ http://localhost:5173/src/pages/auth/login.html   - 登入
✅ http://localhost:5173/src/pages/auth/register.html - 註冊
✅ http://localhost:5173/src/pages/dashboard/index.html - 儀表板
✅ http://localhost:5173/src/pages/dashboard/profile.html - 個人資料
✅ http://localhost:5173/src/pages/dashboard/friends.html - 好友
✅ http://localhost:5173/src/pages/dashboard/chat.html - 聊天
✅ http://localhost:5173/src/pages/posts/detail.html - 文章詳情
```

**2. PWA 功能測試**
```
✅ http://localhost:5173/manifest.json - PWA 清單
✅ http://localhost:5173/sw.js - Service Worker
```

**3. 開發者工具檢查**
- F12 打開開發者工具
- 檢查 Console 面板是否有錯誤
- 檢查 Network 面板確認資源載入
- 檢查 Application 面板的 Service Workers

### 命令行檢查

**快速 HTTP 狀態檢查**
```bash
# 檢查首頁
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/

# 檢查登入頁面
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/src/pages/auth/login.html

# 檢查 PWA 清單
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/manifest.json
```

**批量檢查腳本**
```bash
# 定義要檢查的 URL 列表
urls=(
  "http://localhost:5173/"
  "http://localhost:5173/src/pages/auth/login.html"
  "http://localhost:5173/src/pages/dashboard/index.html"
  # ... 更多 URL
)

# 批量檢查
for url in "${urls[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" -eq 200 ]; then
    echo "✅ $url"
  else
    echo "❌ $url ($status)"
  fi
done
```

## 🔍 常見問題排查

### 問題 1: 前端服務未運行
**症狀:** `curl: (7) Failed to connect`
**解決方案:**
```bash
# 啟動服務
docker-compose up -d

# 檢查服務狀態
docker-compose ps

# 查看日誌
docker-compose logs frontend
```

### 問題 2: 頁面返回 404
**症狀:** HTTP 404 Not Found
**可能原因:**
- 文件路徑錯誤
- 文件不存在
- 文件名大小寫不匹配

**檢查方法:**
```bash
# 檢查文件是否存在
ls -la frontend/src/pages/auth/login.html

# 檢查文件結構
tree frontend/src/pages/
```

### 問題 3: 靜態資源載入失敗
**症狀:** JS/CSS 文件 404
**解決方案:**
```bash
# 檢查資源文件
ls -la frontend/src/js/
ls -la frontend/src/css/

# 檢查 Vite 配置
cat frontend/vite.config.js
```

### 問題 4: PWA 功能異常
**症狀:** manifest.json 或 sw.js 載入失敗
**檢查方法:**
```bash
# 檢查文件內容
cat frontend/public/manifest.json
cat frontend/public/sw.js

# 檢查 JSON 語法
cat frontend/public/manifest.json | jq .
```

## 📊 測試報告範例

### ✅ 健康狀態範例
```
=== 路徑檢查報告 ===
📊 總共檢查: 25 個項目
✅ 成功: 25
❌ 失敗: 0
📈 成功率: 100%

服務狀態:
✅ 前端服務 (http://localhost:5173)
✅ 後端服務 (http://localhost:5001)

主要頁面: 9/9 ✅
靜態資源: 14/14 ✅
PWA 文件: 2/2 ✅
```

### ❌ 問題狀態範例
```
=== 路徑檢查報告 ===
📊 總共檢查: 25 個項目
✅ 成功: 22
❌ 失敗: 3
📈 成功率: 88%

失敗的路徑:
❌ /src/js/utils/newTool.js - HTTP 404
❌ /src/pages/new-feature.html - HTTP 404
❌ /manifest.json - 語法錯誤

修復建議:
1. 檢查文件是否存在於正確位置
2. 檢查 JSON 語法是否正確
3. 確保文件名大小寫匹配
```

## 🚀 自動化集成

### GitHub Actions 集成
```yaml
# .github/workflows/test-routes.yml
name: Route Testing
on: [push, pull_request]

jobs:
  test-routes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Start services
        run: docker-compose up -d
      - name: Wait for services
        run: sleep 30
      - name: Test routes
        run: ./frontend/scripts/quick-check.sh
```

### 開發腳本整合
```json
// package.json
{
  "scripts": {
    "test:routes": "./frontend/scripts/quick-check.sh",
    "test:links": "node frontend/scripts/validate-links.js",
    "test:all": "npm run test:routes && npm run test:links"
  }
}
```

## 📝 最佳實踐

### 1. 定期檢查
- 📅 每次部署前執行路徑檢查
- 🔄 CI/CD 管道中集成自動檢查
- 🧪 開發過程中定期驗證

### 2. 問題追蹤
- 📋 記錄常見問題和解決方案
- 📊 監控路徑檢查成功率趨勢
- 🔍 建立問題排查清單

### 3. 文檔維護
- 📚 保持路徑清單更新
- 🔄 新增頁面時更新檢查腳本
- 📝 記錄路徑變更歷史

## 🎯 總結

使用這些工具和方法，您可以：

1. **🚀 快速驗證** - 使用 `quick-check.sh` 進行日常檢查
2. **🔍 深度分析** - 使用 Node.js 工具進行詳細檢查
3. **🔗 鏈接驗證** - 確保 HTML 中的所有鏈接正確
4. **📊 持續監控** - 集成到開發流程中

**推薦工作流程：**
```bash
# 1. 日常快速檢查
./frontend/scripts/quick-check.sh

# 2. 如果有問題，使用瀏覽器開發者工具詳細檢查

# 3. 重大變更後，執行完整驗證
node frontend/scripts/check-routes.js
node frontend/scripts/validate-links.js
```

這樣可以確保您的 Stock Insight Platform 的所有路徑都保持健康狀態！🎉 
