// E2E 測試路徑配置助手
// 由於 Playwright 測試運行在 Node.js 環境，無法直接使用 ES6 模組

const TEST_CONFIG = {
  BASE_URL: 'http://localhost:5173',
  API_BASE_URL: 'http://localhost:5001',

  // 頁面路徑
  PAGES: {
    HOME: '/index.html',
    AUTH: {
      LOGIN: '/src/pages/auth/login.html',
      REGISTER: '/src/pages/auth/register.html',
    },
    DASHBOARD: {
      INDEX: '/src/pages/dashboard/index.html',
      PROFILE: '/src/pages/dashboard/profile.html',
      FRIENDS: '/src/pages/dashboard/friends.html',
      CHAT: '/src/pages/dashboard/chat.html',
    },
    POSTS: {
      DETAIL: '/src/pages/posts/detail.html',
    },
  },
};

// 路徑工具函數
const TestRouteUtils = {
  getFullUrl(path) {
    return `${TEST_CONFIG.BASE_URL}${path}`;
  },

  getPageUrl(category, page) {
    if (typeof category === 'string' && !page) {
      // 處理簡單路徑，如 'HOME'
      return this.getFullUrl(TEST_CONFIG.PAGES[category]);
    }

    const path = TEST_CONFIG.PAGES[category.toUpperCase()]?.[page.toUpperCase()];
    return path ? this.getFullUrl(path) : this.getFullUrl(TEST_CONFIG.PAGES.HOME);
  },

  getApiUrl(endpoint) {
    return `${TEST_CONFIG.API_BASE_URL}${endpoint}`;
  },
};

module.exports = {
  TEST_CONFIG,
  TestRouteUtils,
};
