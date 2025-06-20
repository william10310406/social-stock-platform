# 路徑管理系統使用指南

## 📖 概述

為了避免路徑不一致的問題，我們建立了統一的路徑管理系統。現在所有路徑都集中在 `frontend/src/js/config/routes.js` 文件中管理。

## 🗂️ 文件結構

```
frontend/src/js/
├── config/
│   └── routes.js           # 🌟 主要路徑配置文件
└── utils/
    └── pathManager.js      # 路徑管理工具
```

## ⚙️ 使用方法

### 1. 在 HTML 文件中載入配置

```html
<!-- 必須最先載入路徑配置 -->
<script src="/src/js/config/routes.js"></script>
<script src="/src/js/utils/pathManager.js"></script>
<!-- 其他腳本 -->
<script src="/src/js/auth.js"></script>
```

### 2. 在 JavaScript 中使用路徑

```javascript
// ✅ 推薦：使用路徑配置
window.location.href = ROUTES.dashboard.index;
RouteUtils.redirectToLogin();
RouteUtils.navigate(ROUTES.posts.detail + '?id=1');

// ❌ 避免：硬編碼路徑
window.location.href = '/src/pages/dashboard/index.html';
```

### 3. 可用的路徑常數

```javascript
// 認證頁面
ROUTES.auth.login          // '/src/pages/auth/login.html'
ROUTES.auth.register       // '/src/pages/auth/register.html'

// 儀表板頁面
ROUTES.dashboard.index     // '/src/pages/dashboard/index.html'
ROUTES.dashboard.profile   // '/src/pages/dashboard/profile.html'
ROUTES.dashboard.friends   // '/src/pages/dashboard/friends.html'
ROUTES.dashboard.chat      // '/src/pages/dashboard/chat.html'

// 文章頁面
ROUTES.posts.detail        // '/src/pages/posts/detail.html'

// API 端點
RouteUtils.getApiUrl('auth')    // 'http://localhost:5001/api/auth'
RouteUtils.getApiUrl('posts')   // 'http://localhost:5001/api/posts'
```

### 4. 工具函數

```javascript
// 頁面跳轉
RouteUtils.navigate(ROUTES.dashboard.profile);

// 重定向快捷方式
RouteUtils.redirectToLogin();
RouteUtils.redirectToDashboard();

// 檢查當前頁面
if (RouteUtils.isCurrent(ROUTES.auth.login)) {
  console.log('當前在登入頁面');
}

// 獲取 API URL
const apiUrl = RouteUtils.getApiUrl('posts');
```

## 🔧 修改路徑

### 當需要更改路徑時：

1. **只需修改 `routes.js` 一個文件**
2. **所有引用自動更新**

```javascript
// 在 routes.js 中修改
const ROUTES = {
  dashboard: {
    index: '/new/dashboard/path.html',  // 只改這裡
    // ...
  }
};
```

### 範例：添加新頁面

```javascript
// 在 routes.js 中添加
const ROUTES = {
  // ... 現有路徑
  
  // 新增設定頁面
  settings: '/src/pages/dashboard/settings.html',
  
  // 或者在 dashboard 下分組
  dashboard: {
    // ... 現有頁面
    settings: '/src/pages/dashboard/settings.html'
  }
};
```

## 🚀 最佳實踐

### ✅ 好的做法

```javascript
// 使用路徑常數
const loginUrl = ROUTES.auth.login;
RouteUtils.navigate(ROUTES.dashboard.profile);

// 動態構建 URL
const postDetailUrl = `${ROUTES.posts.detail}?id=${postId}`;

// 使用工具函數
RouteUtils.redirectToLogin();
```

### ❌ 避免的做法

```javascript
// 硬編碼路徑
window.location.href = '/src/pages/auth/login.html';

// 字串拼接
const url = '/src/pages/posts/detail.html?id=' + postId;

// 重複的重定向邏輯
localStorage.removeItem('token');
window.location.href = '/src/pages/auth/login.html';
```

## 🐛 故障排除

### 問題：路徑配置未載入

```javascript
// 錯誤訊息：ROUTES is not defined
// 解決方案：確保在 HTML 中載入 routes.js
<script src="/src/js/config/routes.js"></script>
```

### 問題：PathManager 初始化失敗

```javascript
// 錯誤訊息：ROUTES configuration not loaded
// 解決方案：routes.js 必須在 pathManager.js 之前載入
```

## 📈 好處

1. **單一真實來源**：所有路徑集中管理
2. **易於維護**：只需修改一個文件
3. **減少錯誤**：避免硬編碼路徑不一致
4. **開發效率**：統一的 API 和工具函數
5. **重構友善**：路徑變更時自動更新所有引用

## 🔄 遷移現有代碼

如果有現有的硬編碼路徑，可以使用以下步驟遷移：

1. 載入路徑配置文件
2. 替換硬編碼路徑為配置常數
3. 使用 RouteUtils 工具函數
4. 測試所有功能

現在你就有了一個完整的路徑管理系統！🎉 
