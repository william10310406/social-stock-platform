// routes.js - 統一路徑配置文件
// 所有頁面路徑的單一真實來源 (Single Source of Truth)

const ROUTES = {
  // 頁面路徑
  pages: {
    // 認證頁面
    auth: {
      login: '/src/pages/auth/login.html',
      register: '/src/pages/auth/register.html',
    },

    // 儀表板頁面
    dashboard: {
      index: '/src/pages/dashboard/index.html',
      profile: '/src/pages/dashboard/profile.html',
      friends: '/src/pages/dashboard/friends.html',
      chat: '/src/pages/dashboard/chat.html',
    },

    // 文章頁面
    posts: {
      detail: '/src/pages/posts/detail.html',
    },

    // 主頁面
    home: '/index.html',
  },

  // JavaScript 模組路徑
  scripts: {
    config: {
      routes: '/src/js/config/routes.js',
      constants: '/src/js/config/constants.js',
    },
    utils: {
      pathManager: '/src/js/utils/pathManager.js',
      pwa: '/src/js/utils/pwa.js',
      websocket: '/src/js/utils/websocket.js',
      loadingManager: '/src/js/utils/loadingManager.js',
      errorManager: '/src/js/utils/errorManager.js',
    },
    core: {
      template: '/src/js/template.js',
      api: '/src/js/api.js',
      auth: '/src/js/auth.js',
      main: '/src/js/main.js',
    },
    features: {
      dashboard: '/src/js/dashboard.js',
      chat: '/src/js/chat.js',
      friends: '/src/js/friends.js',
      profile: '/src/js/profile.js',
      post: '/src/js/post.js',
      news: '/src/js/news.js',
      chart: '/src/js/chart.js',
    },
  },

  // 組件路徑
  components: {
    navbar: '/src/components/navbar.html',
  },

  // 樣式路徑
  styles: {
    main: '/src/css/style.css',
  },

  // API 端點
  api: {
    base: 'http://localhost:5001',
    endpoints: {
      // 認證
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        refresh: '/api/auth/refresh',
        logout: '/api/auth/logout',
        check: '/api/auth/check',
      },

      // 用戶
      user: {
        profile: '/api/user/profile',
        update: '/api/user/profile',
        users: '/api/users',
      },

      // 文章
      posts: {
        list: '/api/posts',
        create: '/api/posts',
        detail: '/api/posts/:id',
        update: '/api/posts/:id',
        delete: '/api/posts/:id',
        like: '/api/posts/:id/like',
      },

      // 好友
      friends: {
        list: '/api/friends',
        requests: '/api/friends/requests',
        sendRequest: '/api/friends/requests',
        acceptRequest: '/api/friends/requests/:id/accept',
        rejectRequest: '/api/friends/requests/:id/reject',
      },

      // 聊天
      chat: {
        conversations: '/api/conversations',
        messages: '/api/messages',
        sendMessage: '/api/messages',
      },

      // 其他
      health: '/api/health',
      news: '/api/news',
      stocks: '/api/stocks',
    },
  },

  // PWA 相關
  pwa: {
    manifest: '/manifest.json',
    serviceWorker: '/sw.js',
    offline: '/offline.html',
  },

  // 測試相關
  test: {
    base: 'http://localhost:5173',
  },
};

// 路徑工具函數
const RouteUtils = {
  // 獲取頁面路徑
  getPagePath(category, page) {
    return ROUTES.pages[category]?.[page] || ROUTES.pages.home;
  },

  // 獲取腳本路徑
  getScriptPath(category, script) {
    return ROUTES.scripts[category]?.[script];
  },

  // 獲取 API URL
  getApiUrl(category, endpoint, params = {}) {
    let url = ROUTES.api.base + ROUTES.api.endpoints[category]?.[endpoint];

    // 替換路徑參數
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });

    return url;
  },

  // 獲取完整 URL
  getFullUrl(path, baseUrl = ROUTES.test.base) {
    return baseUrl + path;
  },

  // 導航到指定頁面
  navigate(category, page, params = '') {
    const path = this.getPagePath(category, page);
    window.location.href = path + params;
  },

  // 重定向到登入頁面
  redirectToLogin() {
    this.navigate('auth', 'login');
  },

  // 重定向到儀表板
  redirectToDashboard() {
    this.navigate('dashboard', 'index');
  },

  // 檢查當前頁面
  isCurrent(category, page) {
    const path = this.getPagePath(category, page);
    return window.location.pathname === path;
  },

  // 獲取所有頁面路徑（用於快取）
  getAllPagePaths() {
    const paths = [];
    Object.values(ROUTES.pages).forEach((category) => {
      if (typeof category === 'string') {
        paths.push(category);
      } else {
        Object.values(category).forEach((path) => paths.push(path));
      }
    });
    return paths;
  },

  // 獲取所有腳本路徑（用於快取）
  getAllScriptPaths() {
    const paths = [];
    Object.values(ROUTES.scripts).forEach((category) => {
      Object.values(category).forEach((path) => paths.push(path));
    });
    return paths;
  },

  // 獲取所有組件路徑（用於快取）
  getAllComponentPaths() {
    return Object.values(ROUTES.components);
  },

  // 獲取所有靜態資源路徑
  getAllStaticPaths() {
    return [
      ...this.getAllPagePaths(),
      ...this.getAllScriptPaths(),
      ...this.getAllComponentPaths(),
      ROUTES.styles.main,
      ROUTES.pwa.manifest,
      ROUTES.pwa.serviceWorker,
    ];
  },
};

// 向後兼容的舊格式（逐步移除）
const LEGACY_ROUTES = {
  auth: {
    login: ROUTES.pages.auth.login,
    register: ROUTES.pages.auth.register,
  },
  dashboard: {
    index: ROUTES.pages.dashboard.index,
    profile: ROUTES.pages.dashboard.profile,
    friends: ROUTES.pages.dashboard.friends,
    chat: ROUTES.pages.dashboard.chat,
  },
  posts: {
    detail: ROUTES.pages.posts.detail,
  },
  api: ROUTES.api,
};

// ES6 模組導出
export { ROUTES, RouteUtils, LEGACY_ROUTES };

// 向後兼容：瀏覽器全局變量
if (typeof window !== 'undefined') {
  window.ROUTES = ROUTES;
  window.RouteUtils = RouteUtils;
  window.LEGACY_ROUTES = LEGACY_ROUTES;
}

console.log('Routes configuration loaded:', ROUTES);
