# 🐳 Docker 環境架構驗證指南

## 概述

本文檔說明如何驗證 Stock Insight Platform 的架構文檔中記錄的所有功能在 Docker 環境中的實際運行情況。

## 架構文檔 Docker 適配狀態

### ✅ 已更新的文檔

1. **html-dependencies.yaml**
   - ✅ 添加了 Docker 專用路由配置引用
   - ✅ 新增 Docker 環境載入順序
   - ✅ 包含測試頁面配置
   - ✅ 新增代理配置說明

2. **javascript-dependencies.yaml**
   - ✅ 添加 `routes-docker.js` 模組說明
   - ✅ 更新 `pathManager.js` 智能載入邏輯
   - ✅ 包含 Docker 環境特性

3. **path-config-architecture.yaml**
   - ✅ 支援多環境配置檔案
   - ✅ 新增 Docker 環境配置
   - ✅ 更新 API 基礎 URL 配置

4. **stock-architecture.yaml**
   - ✅ 更新部署配置包含 HMR 端口
   - ✅ 添加環境變數配置
   - ✅ 包含 Docker 專用功能

## Docker 環境特殊配置

### 1. 路由配置差異

| 配置項 | 開發環境 | Docker 環境 |
|--------|----------|-------------|
| 配置檔案 | `routes.js` | `routes-docker.js` |
| API 基礎 URL | `http://localhost:5001` | `""` (相對路徑) |
| 載入方式 | 直接導入 | 智能檢測 |

### 2. API 連接方式

**開發環境:**
```javascript
// 直接連接到後端
const apiUrl = 'http://localhost:5001/api/health';
```

**Docker 環境:**
```javascript
// 通過 Vite 代理
const apiUrl = '/api/health';  // 自動代理到 stock-insight-backend:5000
```

### 3. 模組載入策略

```javascript
// pathManager.js 中的智能載入
async function loadRoutes() {
  try {
    // 優先嘗試 Docker 專用路由
    const routesModule = await import('../config/routes-docker.js');
    console.log('Docker routes loaded');
  } catch (dockerError) {
    // 回退到標準路由
    const routesModule = await import('../config/routes.js');
    console.log('Standard routes loaded');
  }
}
```

## 驗證清單

### 🔍 基本環境驗證

```bash
# 1. 確認容器運行狀態
docker compose ps

# 2. 檢查端口暴露
# 前端: 5173 (主服務) + 5174 (HMR)
# 後端: 5001

# 3. 測試基本連接
curl http://localhost:5173/complete-test.html
curl http://localhost:5173/api/health
```

### 📦 模組載入驗證

訪問 `http://localhost:5173/complete-test.html` 檢查：

- ✅ **routes-docker.js 載入**: 確認 Docker 專用配置被正確載入
- ✅ **全域變數設置**: `window.ROUTES` 和 `window.RouteUtils` 存在
- ✅ **API 基礎配置**: `ROUTES.api.base` 為空字符串（使用代理）

### 🌐 API 代理驗證

```javascript
// 在瀏覽器控制台測試
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('API 代理正常:', data));
```

### 🔄 HMR 驗證

1. 修改任意前端文件
2. 檢查頁面是否自動重載
3. 查看容器日誌是否有 HMR 相關訊息

```bash
docker logs -f stock-insight-frontend
```

### 🧪 完整功能測試

使用測試頁面進行完整驗證：

```
http://localhost:5173/complete-test.html
```

**測試項目:**
- 🟢 基本功能測試 (localStorage, DOM 操作)
- 🟢 API 連接測試 (代理配置)
- 🟢 模組載入測試 (routes-docker.js)
- 🟡 WebSocket 測試 (應用層級，非 HMR)

## 常見問題和解決方案

### ❌ 模組載入失敗

**症狀:** `window.ROUTES` 未定義

**解決方案:**
1. 檢查 `routes-docker.js` 是否存在
2. 確認全域變數設置邏輯
3. 查看瀏覽器控制台錯誤

### ❌ API 連接失敗

**症狀:** CORS 錯誤或網路錯誤

**解決方案:**
1. 檢查 Vite 代理配置
2. 確認後端容器運行狀態
3. 驗證 Docker 網路配置

### ❌ HMR 不工作

**症狀:** 文件修改後頁面不自動重載

**解決方案:**
1. 檢查端口 5174 是否正確暴露
2. 確認 `usePolling: true` 配置
3. 檢查容器文件權限

## 自動化驗證腳本

創建驗證腳本 `scripts/validate-docker.sh`:

```bash
#!/bin/bash
echo "🐳 Docker 環境驗證開始..."

# 檢查容器狀態
if ! docker compose ps | grep -q "Up"; then
    echo "❌ 容器未運行"
    exit 1
fi

# 測試前端訪問
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 前端服務正常"
else
    echo "❌ 前端服務異常"
fi

# 測試 API 代理
if curl -s http://localhost:5173/api/health | grep -q "healthy"; then
    echo "✅ API 代理正常"
else
    echo "❌ API 代理異常"
fi

echo "🎉 Docker 環境驗證完成"
```

## 開發建議

1. **優先使用測試頁面** - `complete-test.html` 是最佳的環境診斷工具
2. **檢查容器日誌** - 詳細錯誤信息都在容器日誌中
3. **分層測試** - 從基礎功能到複雜功能逐步測試
4. **文檔同步更新** - 功能變更時同步更新架構文檔

## 總結

經過更新後，所有架構文檔都正確反映了 Docker 環境的實際配置：

- 📋 **路由配置**: 支援 Docker 專用簡化版本
- 🌐 **API 連接**: 通過代理避免 CORS 問題  
- 📦 **模組載入**: 智能檢測環境並載入適當配置
- 🧪 **測試覆蓋**: 完整的 Docker 環境測試工具

現在架構文檔與實際 Docker 部署完全一致！ 🎉 
