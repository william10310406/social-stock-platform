# 🐳 Stock Insight Platform - Docker 環境設置

## 問題診斷與解決

### 發現的問題
您遇到的 JavaScript 錯誤主要是因為在 **Docker 環境** 中運行，而之前的修復都是針對本地開發環境。

### Docker 環境特殊問題
1. **PostCSS 配置問題**: ES6 模組語法在 Docker 容器中無法正確解析
2. **Tailwind 配置問題**: 同樣的 ES6 模組導入問題
3. **CORS 配置**: 需要允許來自 Docker 容器的請求
4. **HMR (熱重載)**: Docker 環境需要特殊的 WebSocket 配置

### 已修復的問題

#### 1. PostCSS 配置修復
```javascript
// 修復前 (postcss.config.cjs)
const { createPostCSSConfig } = require('./config/index.js'); // ❌ ES6 模組導入錯誤

// 修復後
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
}; // ✅ 直接配置，避免 ES6 模組問題
```

#### 2. Tailwind 配置修復
```javascript
// 修復前 (tailwind.config.cjs)
const { createTailwindConfig } = require('./config/index.js'); // ❌ ES6 模組導入錯誤

// 修復後
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: { extend: { /* ... */ } },
  plugins: [],
}; // ✅ 直接配置
```

#### 3. 後端 CORS 配置
```python
# backend/app/__init__.py
CORS(app, origins=[
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://0.0.0.0:5173",  # Docker 容器訪問
    "http://stock-insight-frontend:5173",  # 容器間通信
], supports_credentials=True)
```

#### 4. Dockerfile 優化
```dockerfile
# 設置環境變數
ENV NODE_ENV=docker
ENV VITE_API_BASE_URL=http://localhost:5001
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=5173

# 暴露 HMR 端口
EXPOSE 5173
EXPOSE 5174
```

## 使用方法

### 1. 啟動 Docker 服務
```bash
# 停止現有容器
docker-compose down

# 重新構建並啟動
docker-compose up --build -d

# 檢查容器狀態
docker ps
```

### 2. 訪問應用
- **前端**: http://localhost:5173
- **後端 API**: http://localhost:5001
- **Docker 測試頁面**: http://localhost:5173/docker-test.html

### 3. 測試 API 連接
```bash
# 測試後端健康檢查
curl http://localhost:5001/api/health
```

### 4. 查看容器日誌
```bash
# 前端日誌
docker logs stock-insight-frontend

# 後端日誌
docker logs stock-insight-backend

# 實時日誌
docker logs -f stock-insight-frontend
```

## 測試頁面

訪問 `http://localhost:5173/docker-test.html` 進行完整的環境測試：

- ✅ 環境檢測
- ✅ API 連接測試
- ✅ 模組載入測試
- ✅ 路由系統測試
- ✅ 實時日誌監控

## 常見問題

### Q: 前端容器無法啟動
**A**: 檢查 PostCSS 和 Tailwind 配置是否有 ES6 模組導入錯誤

### Q: API 連接失敗 (CORS 錯誤)
**A**: 確保後端 CORS 配置包含 Docker 容器地址

### Q: 熱重載不工作
**A**: 檢查 Vite 配置中的 `usePolling: true` 和 HMR 端口設置

### Q: 模組載入失敗
**A**: 確保所有 HTML 文件中的 script 標籤都有 `type="module"` 屬性

## 開發建議

1. **使用 Docker 測試頁面** 進行快速診斷
2. **檢查容器日誌** 了解詳細錯誤信息
3. **分別測試前後端** 確保服務正常運行
4. **清除瀏覽器緩存** 避免舊版本干擾

## 環境對比

| 項目 | 本地開發 | Docker 環境 |
|------|----------|-------------|
| 前端端口 | 5173 | 5173 |
| 後端端口 | 5001 | 5001 |
| 數據庫端口 | 5432 | 5433 |
| HMR | 自動 | 需要輪詢 |
| 模組系統 | ES6 | ES6 + CommonJS 混合 |
| CORS | 簡單 | 需要容器地址 |

現在您的 Docker 環境應該可以正常運行了！🎉 
