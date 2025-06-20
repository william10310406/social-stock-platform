// routes.js - 統一路徑配置文件
// 所有頁面路徑的單一真實來源 (Single Source of Truth)

const ROUTES = {
  // 認證相關頁面
  auth: {
    login: '/src/pages/auth/login.html',
    register: '/src/pages/auth/register.html',
  },

  // 儀表板相關頁面
  dashboard: {
    index: '/src/pages/dashboard/index.html',
    profile: '/src/pages/dashboard/profile.html',
    friends: '/src/pages/dashboard/friends.html',
    chat: '/src/pages/dashboard/chat.html',
  },

  // 文章相關頁面
  posts: {
    detail: '/src/pages/posts/detail.html',
  },

  // 主頁
  home: '/',

  // API 基礎路徑
  api: {
    base: 'http://localhost:5001',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      friends: '/api/friends',
      chat: '/api/chat',
    },
  },
};

// 工具函數
const RouteUtils = {
  // 獲取完整的 API URL
  getApiUrl: (endpoint) => {
    return `${ROUTES.api.base}${ROUTES.api.endpoints[endpoint] || endpoint}`;
  },

  // 頁面跳轉
  navigate: (route) => {
    window.location.href = route;
  },

  // 檢查當前頁面
  isCurrent: (route) => {
    return window.location.pathname === route;
  },

  // 重定向到登入頁面
  redirectToLogin: () => {
    window.location.href = ROUTES.auth.login;
  },

  // 重定向到儀表板
  redirectToDashboard: () => {
    window.location.href = ROUTES.dashboard.index;
  },
};

// 導出配置
window.ROUTES = ROUTES;
window.RouteUtils = RouteUtils;

// 如果是模組環境，也支援 export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ROUTES, RouteUtils };
}

console.log('Routes configuration loaded:', ROUTES);
