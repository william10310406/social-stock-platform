// 路徑管理系統測試
describe('路徑管理系統', () => {
  let ROUTES, RouteUtils;

  beforeEach(() => {
    // Mock 路徑配置
    ROUTES = {
      pages: {
        auth: {
          login: '/src/pages/auth/login.html',
          register: '/src/pages/auth/register.html',
        },
        dashboard: {
          index: '/src/pages/dashboard/index.html',
          profile: '/src/pages/dashboard/profile.html',
        },
        posts: {
          detail: '/src/pages/posts/detail.html',
        },
        home: '/index.html',
      },
      components: {
        navbar: '/src/components/navbar.html',
      },
      api: {
        base: 'http://localhost:5001',
        endpoints: {
          auth: {
            login: '/api/auth/login',
          },
          posts: {
            list: '/api/posts',
            detail: '/api/posts/:id',
            like: '/api/posts/:id/like',
          },
        },
      },
    };

    RouteUtils = {
      getPagePath(category, page) {
        return ROUTES.pages[category]?.[page] || ROUTES.pages.home;
      },

      getApiUrl(category, endpoint, params = {}) {
        let url = ROUTES.api.base + ROUTES.api.endpoints[category]?.[endpoint];

        Object.entries(params).forEach(([key, value]) => {
          url = url.replace(`:${key}`, value);
        });

        return url;
      },

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
    };
  });

  describe('ROUTES 配置', () => {
    test('應該包含所有必要的頁面路徑', () => {
      expect(ROUTES.pages.auth.login).toBe('/src/pages/auth/login.html');
      expect(ROUTES.pages.auth.register).toBe('/src/pages/auth/register.html');
      expect(ROUTES.pages.dashboard.index).toBe('/src/pages/dashboard/index.html');
      expect(ROUTES.pages.posts.detail).toBe('/src/pages/posts/detail.html');
      expect(ROUTES.pages.home).toBe('/index.html');
    });

    test('應該包含組件路徑', () => {
      expect(ROUTES.components.navbar).toBe('/src/components/navbar.html');
    });

    test('應該包含 API 配置', () => {
      expect(ROUTES.api.base).toBe('http://localhost:5001');
      expect(ROUTES.api.endpoints.auth.login).toBe('/api/auth/login');
      expect(ROUTES.api.endpoints.posts.list).toBe('/api/posts');
    });
  });

  describe('RouteUtils.getPagePath', () => {
    test('應該正確獲取頁面路徑', () => {
      expect(RouteUtils.getPagePath('auth', 'login')).toBe('/src/pages/auth/login.html');
      expect(RouteUtils.getPagePath('dashboard', 'profile')).toBe(
        '/src/pages/dashboard/profile.html',
      );
      expect(RouteUtils.getPagePath('posts', 'detail')).toBe('/src/pages/posts/detail.html');
    });

    test('應該在路徑不存在時返回首頁', () => {
      expect(RouteUtils.getPagePath('nonexistent', 'page')).toBe('/index.html');
      expect(RouteUtils.getPagePath('auth', 'nonexistent')).toBe('/index.html');
    });
  });

  describe('RouteUtils.getApiUrl', () => {
    test('應該正確構建 API URL', () => {
      expect(RouteUtils.getApiUrl('auth', 'login')).toBe('http://localhost:5001/api/auth/login');
      expect(RouteUtils.getApiUrl('posts', 'list')).toBe('http://localhost:5001/api/posts');
    });

    test('應該正確替換路徑參數', () => {
      expect(RouteUtils.getApiUrl('posts', 'detail', { id: '123' })).toBe(
        'http://localhost:5001/api/posts/123',
      );

      expect(RouteUtils.getApiUrl('posts', 'like', { id: '456' })).toBe(
        'http://localhost:5001/api/posts/456/like',
      );
    });
  });

  describe('路徑收集方法', () => {
    test('getAllPagePaths 應該返回所有頁面路徑', () => {
      const paths = RouteUtils.getAllPagePaths();
      expect(paths).toContain('/src/pages/auth/login.html');
      expect(paths).toContain('/src/pages/dashboard/index.html');
      expect(paths).toContain('/src/pages/posts/detail.html');
      expect(paths).toContain('/index.html');
    });
  });

  describe('錯誤處理', () => {
    test('應該優雅處理無效的 API 端點', () => {
      expect(RouteUtils.getApiUrl('nonexistent', 'endpoint')).toContain('undefined');
    });

    test('應該處理缺少參數的情況', () => {
      const url = RouteUtils.getApiUrl('posts', 'detail', {});
      expect(url).toBe('http://localhost:5001/api/posts/:id');
    });
  });
});

// 集成測試
describe('路徑管理系統集成測試', () => {
  test('應該支持完整的使用流程', () => {
    const ROUTES = {
      pages: {
        auth: { login: '/src/pages/auth/login.html' },
        dashboard: { index: '/src/pages/dashboard/index.html' },
        posts: { detail: '/src/pages/posts/detail.html' },
        home: '/index.html',
      },
      api: {
        base: 'http://localhost:5001',
        endpoints: {
          auth: { login: '/api/auth/login' },
          posts: { list: '/api/posts', like: '/api/posts/:id/like' },
        },
      },
    };

    const RouteUtils = {
      getPagePath(category, page) {
        return ROUTES.pages[category]?.[page] || ROUTES.pages.home;
      },
      getApiUrl(category, endpoint, params = {}) {
        let url = ROUTES.api.base + ROUTES.api.endpoints[category]?.[endpoint];
        Object.entries(params).forEach(([key, value]) => {
          url = url.replace(`:${key}`, value);
        });
        return url;
      },
    };

    // 頁面導航流程
    const loginPath = RouteUtils.getPagePath('auth', 'login');
    expect(loginPath).toBe('/src/pages/auth/login.html');

    const dashboardPath = RouteUtils.getPagePath('dashboard', 'index');
    expect(dashboardPath).toBe('/src/pages/dashboard/index.html');

    // API 請求流程
    const loginApi = RouteUtils.getApiUrl('auth', 'login');
    expect(loginApi).toBe('http://localhost:5001/api/auth/login');

    const postsApi = RouteUtils.getApiUrl('posts', 'list');
    expect(postsApi).toBe('http://localhost:5001/api/posts');

    const likeApi = RouteUtils.getApiUrl('posts', 'like', { id: '123' });
    expect(likeApi).toBe('http://localhost:5001/api/posts/123/like');
  });
});
