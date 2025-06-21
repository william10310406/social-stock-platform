// Docker 專用路由配置 - 簡化版本
// 解決 Docker 環境中的模組載入問題

console.log('Loading Docker routes configuration...');

// 基本路由配置
const ROUTES = {
  pages: {
    auth: {
      login: '/src/pages/auth/login.html',
      register: '/src/pages/auth/register.html',
    },
    dashboard: {
      index: '/src/pages/dashboard/index.html',
      profile: '/src/pages/dashboard/profile.html',
      friends: '/src/pages/dashboard/friends.html',
      chat: '/src/pages/dashboard/chat.html',
    },
    posts: {
      detail: '/src/pages/posts/detail.html',
    },
    home: '/index.html',
  },
  api: {
    base: '', // 使用相對路徑，通過 Vite 代理
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
      },
      user: {
        profile: '/api/user/profile',
      },
      posts: {
        list: '/api/posts',
      },
      health: '/api/health',
    },
  },
};

// 簡化的工具函數
const RouteUtils = {
  getPagePath(category, page) {
    if (!ROUTES.pages[category]) {
      console.warn(`Category ${category} not found`);
      return ROUTES.pages.home;
    }
    if (!ROUTES.pages[category][page]) {
      console.warn(`Page ${page} not found in category ${category}`);
      return ROUTES.pages.home;
    }
    return ROUTES.pages[category][page];
  },

  getApiUrl(category, endpoint, params = {}) {
    let url = ROUTES.api.base;

    if (category === '' && endpoint === 'health') {
      // 特殊處理健康檢查
      url += ROUTES.api.endpoints.health;
    } else if (ROUTES.api.endpoints[category] && ROUTES.api.endpoints[category][endpoint]) {
      url += ROUTES.api.endpoints[category][endpoint];
    } else {
      console.warn(`API endpoint ${category}.${endpoint} not found`);
      return ROUTES.api.base + '/api/health';
    }

    // 替換參數
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });

    return url;
  },

  navigate(category, page) {
    const path = this.getPagePath(category, page);
    window.location.href = path;
  },

  redirectToLogin() {
    this.navigate('auth', 'login');
  },

  redirectToDashboard() {
    this.navigate('dashboard', 'index');
  },
};

// 立即設置全局變數
if (typeof window !== 'undefined') {
  window.ROUTES = ROUTES;
  window.RouteUtils = RouteUtils;
  console.log('Routes set as global variables:', { ROUTES, RouteUtils });
}

// ES6 導出
export { ROUTES, RouteUtils };

// 立即輸出確認
console.log('Docker routes loaded successfully:', {
  pages: Object.keys(ROUTES.pages),
  apiBase: ROUTES.api.base,
  routeUtils: Object.keys(RouteUtils),
});
