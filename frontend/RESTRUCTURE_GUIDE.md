# 前端重構指南

## 📁 新的文件結構

```
frontend/
├── index.html                    # 主頁面（根目錄）
├── src/                         # 源文件目錄
│   ├── components/              # 可重用組件
│   │   └── navbar.html         # 導航欄組件
│   ├── layouts/                # 頁面佈局模板
│   │   └── base.html           # 基礎佈局
│   ├── pages/                  # 頁面文件
│   │   ├── auth/               # 認證相關頁面
│   │   │   ├── login.html      # 登入頁面
│   │   │   └── register.html   # 註冊頁面
│   │   ├── dashboard/          # 儀表板相關頁面
│   │   │   ├── index.html      # 主儀表板
│   │   │   ├── profile.html    # 個人資料
│   │   │   ├── friends.html    # 好友管理
│   │   │   └── chat.html       # 聊天頁面
│   │   └── posts/              # 文章相關頁面
│   │       └── detail.html     # 文章詳情
│   ├── js/                     # JavaScript 文件
│   │   ├── template.js         # 模板引擎
│   │   ├── api.js             # API 工具
│   │   ├── auth.js            # 認證邏輯
│   │   └── ...                # 其他 JS 文件
│   └── css/                    # 樣式文件
│       └── style.css          # 主樣式文件
├── public/                     # 靜態資源
├── package.json               # NPM 配置
├── vite.config.js            # Vite 配置
└── Dockerfile                # Docker 配置
```

## 🔧 重構內容

### 1. 文件組織改進
- **分類清晰**：按功能和類型分組文件
- **模塊化設計**：每個功能區域獨立管理
- **易於維護**：新功能可以輕鬆添加到對應目錄

### 2. 組件化系統
- **navbar.html**：統一的導航欄組件
- **base.html**：基礎頁面模板
- **template.js**：簡單的模板引擎，用於組件注入

### 3. 路徑結構優化
```
舊路徑               →  新路徑
/login.html         →  /src/pages/auth/login.html
/register.html      →  /src/pages/auth/register.html
/dashboard.html     →  /src/pages/dashboard/index.html
/profile.html       →  /src/pages/dashboard/profile.html
/friends.html       →  /src/pages/dashboard/friends.html
/chat.html          →  /src/pages/dashboard/chat.html
/post.html          →  /src/pages/posts/detail.html
```

### 4. 模板引擎系統
**template.js** 提供以下功能：
- 組件載入：`loadComponent(name, path)`
- 模板渲染：`render(template, data)`
- 頁面初始化：`initPage(pageConfig)`

## 🎨 設計改進

### 1. 中文本地化
- 所有界面文字改為繁體中文
- 改善用戶體驗

### 2. 現代化 UI
- 統一的設計語言
- 改善色彩搭配
- 更好的響應式設計

### 3. 用戶體驗提升
- 載入狀態指示
- 更清晰的錯誤訊息
- 一致的交互模式

## 🚀 使用方式

### 1. 創建新頁面
```bash
# 1. 在對應目錄創建 HTML 文件
touch src/pages/category/new-page.html

# 2. 使用模板結構
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="page-title" content="頁面標題">
    <title>頁面標題 - Stock Insight Platform</title>
    <link rel="stylesheet" href="/src/css/style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- 導航欄容器 -->
    <div id="navbar-container"></div>

    <main class="container mx-auto px-4 py-8">
        <!-- 頁面內容 -->
    </main>

    <!-- Scripts -->
    <script src="/src/js/template.js"></script>
    <script src="/src/js/api.js"></script>
    <script src="/src/js/auth.js"></script>
</body>
</html>
```

# 3. 更新 vite.config.js
```javascript
// 在 rollupOptions.input 中添加新頁面
newPage: resolve(__dirname, 'src/pages/category/new-page.html'),
```

### 2. 添加新組件
```bash
# 1. 創建組件文件
echo '<div>新組件內容</div>' > src/components/new-component.html

# 2. 在 template.js 中載入
await templateEngine.loadComponent('newComponent', '/src/components/new-component.html');

# 3. 在頁面中使用
<div id="component-container"></div>
<script>
document.addEventListener('DOMContentLoaded', async () => {
    await templateEngine.loadComponent('newComponent', '/src/components/new-component.html');
    document.getElementById('component-container').innerHTML = 
        templateEngine.components.get('newComponent');
});
</script>
```

## 🧪 測試檢查清單

- [ ] 首頁正常載入 (http://localhost:5173/)
- [ ] 登入頁面正常 (http://localhost:5173/src/pages/auth/login.html)
- [ ] 註冊頁面正常 (http://localhost:5173/src/pages/auth/register.html)
- [ ] 導航欄正確載入
- [ ] 所有樣式正常顯示
- [ ] JavaScript 功能正常工作
- [ ] Docker 構建成功
- [ ] 前端服務正常啟動

## 📝 注意事項

1. **路徑更新**：所有內部連結都需要更新為新路徑
2. **組件載入**：確保 template.js 在其他腳本之前載入
3. **Vite 配置**：新頁面需要在 vite.config.js 中注冊
4. **樣式路徑**：CSS 和 JS 文件的相對路徑需要正確設置

## 🔄 未來改進計劃

1. **進一步組件化**：將更多重複代碼提取為組件
2. **單頁應用遷移**：考慮使用 Vue.js 或 React
3. **構建優化**：改善打包和載入性能
4. **測試覆蓋**：添加前端單元測試

---

**重構完成日期**: 2024年12月
**版本**: v2.0.0
**負責人**: AI Assistant 
