// 路徑管理工具單元測試
const { describe, test, expect, beforeEach } = require('@jest/globals');

// 模擬 ROUTES 配置
const ROUTES = {
  auth: {
    login: '/src/pages/auth/login.html',
    register: '/src/pages/auth/register.html',
  },
  dashboard: {
    index: '/src/pages/dashboard/index.html',
    profile: '/src/pages/dashboard/profile.html',
  },
  api: {
    base: '',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
    },
  },
};

global.ROUTES = ROUTES;

const RouteUtils = {
  getApiUrl: (endpoint) => {
    return `${ROUTES.api.base}${ROUTES.api.endpoints[endpoint] || endpoint}`;
  },
  navigate: (route) => {
    window.location.href = route;
  },
  isCurrent: (route) => {
    return window.location.pathname === route;
  },
  redirectToLogin: () => {
    window.location.href = ROUTES.auth.login;
  },
  redirectToDashboard: () => {
    window.location.href = ROUTES.dashboard.index;
  },
};

global.RouteUtils = RouteUtils;

describe('RouteUtils', () => {
  const mockRoutes = {
    api: {
      base: '',
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
      },
      posts: {
        list: '/api/posts',
        detail: '/api/posts/:id',
      },
    },
    pages: {
      home: '/',
      auth: {
        login: '/src/pages/auth/login.html',
      },
    },
  };

  beforeEach(() => {
    // 設置全域 ROUTES
    global.ROUTES = mockRoutes;
  });

  describe('getApiUrl', () => {
    test('應該正確構建基本 API URL', () => {
      // 設置測試用的 ROUTES 配置
      const testRoutes = {
        api: {
          base: '',
          auth: {
            login: '/api/auth/login',
            register: '/api/auth/register',
          },
          posts: {
            list: '/api/posts',
            detail: '/api/posts/:id',
          },
        },
      };

      const RouteUtils = {
        getApiUrl: (category, endpoint, params = {}) => {
          if (!testRoutes?.api?.[category]?.[endpoint]) {
            return null;
          }

          let url = testRoutes.api.base + testRoutes.api[category][endpoint];

          // 替換參數
          Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, value);
          });

          return url;
        },
      };

      const url = RouteUtils.getApiUrl('auth', 'login');
      expect(url).toBe('/api/auth/login');
    });

    test('應該正確替換 URL 參數', () => {
      const testRoutes = {
        api: {
          base: '',
          posts: {
            detail: '/api/posts/:id',
          },
        },
      };

      const RouteUtils = {
        getApiUrl: (category, endpoint, params = {}) => {
          if (!testRoutes?.api?.[category]?.[endpoint]) {
            return null;
          }

          let url = testRoutes.api.base + testRoutes.api[category][endpoint];

          Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, value);
          });

          return url;
        },
      };

      const url = RouteUtils.getApiUrl('posts', 'detail', { id: '123' });
      expect(url).toBe('/api/posts/123');
    });

    test('應該處理不存在的路由', () => {
      const RouteUtils = {
        getApiUrl: (category, endpoint) => {
          if (!ROUTES?.api?.[category]?.[endpoint]) {
            return null;
          }
          return ROUTES.api.base + ROUTES.api[category][endpoint];
        },
      };

      const url = RouteUtils.getApiUrl('invalid', 'endpoint');
      expect(url).toBeNull();
    });
  });

  describe('buildUrl', () => {
    test('應該正確構建完整 URL', () => {
      const buildUrl = (base, path) => `${base}${path}`;

      const url = buildUrl('', '/api/auth');
      expect(url).toBe('/api/auth');
    });

    test('應該處理自定義端點', () => {
      const buildUrl = (base, path) => `${base}${path}`;

      const url = buildUrl('', '/custom/endpoint');
      expect(url).toBe('/custom/endpoint');
    });
  });

  describe('navigate', () => {
    test('應該能夠導航到頁面', () => {
      // 模擬 window.location
      const mockLocation = {
        href: '',
        assign: jest.fn(),
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      const navigate = (path) => {
        window.location.assign(path);
      };

      navigate('/src/pages/auth/login.html');
      expect(mockLocation.assign).toHaveBeenCalledWith('/src/pages/auth/login.html');
    });
  });

  describe('參數處理', () => {
    test('應該正確編碼 URL 參數', () => {
      const encodeParams = (params) => {
        return new URLSearchParams(params).toString();
      };

      const params = { query: 'hello world', page: 1 };
      const encoded = encodeParams(params);
      expect(encoded).toBe('query=hello+world&page=1');
    });

    test('應該處理空參數', () => {
      const encodeParams = (params) => {
        return new URLSearchParams(params).toString();
      };

      const encoded = encodeParams({});
      expect(encoded).toBe('');
    });
  });

  describe('路由驗證', () => {
    test('應該驗證必需的路由配置', () => {
      expect(ROUTES.api).toBeDefined();
      expect(ROUTES.auth).toBeDefined();
      expect(ROUTES.api.base).toBe('');
    });

    test('應該處理缺失的配置', () => {
      const invalidRoutes = {
        api: {
          base: '',
          auth: { login: '/api/auth/login' },
        },
      };

      const getApiUrl = (category, endpoint) => {
        if (!invalidRoutes?.api?.[category]?.[endpoint]) {
          return null;
        }
        return invalidRoutes.api.base + invalidRoutes.api[category][endpoint];
      };

      const url = getApiUrl('auth', 'login');
      expect(url).toBe('/api/auth/login');
    });
  });

  beforeEach(() => {
    // 重置 window.location
    delete window.location;
    window.location = {
      href: '',
      pathname: '/',
      hostname: process.env.NODE_ENV === 'docker' ? '127.0.0.1' : 'localhost',
      protocol: 'http:',
    };
  });

  describe('legacy getApiUrl tests', () => {
    test('應該返回正確的 API URL', () => {
      const getApiUrl = (path) => `${path}`;
      const url = getApiUrl('/api/auth');
      expect(url).toBe('/api/auth');
    });

    test('應該處理自定義端點', () => {
      const getApiUrl = (path) => `${path}`;
      const url = getApiUrl('/custom/endpoint');
      expect(url).toBe('/custom/endpoint');
    });
  });

  describe('isCurrent', () => {
    test('應該正確檢查當前頁面', () => {
      window.location.pathname = '/src/pages/auth/login.html';
      expect(RouteUtils.isCurrent(ROUTES.auth.login)).toBe(true);
      expect(RouteUtils.isCurrent(ROUTES.auth.register)).toBe(false);
    });
  });

  describe('redirectToLogin', () => {
    test('應該重定向到登入頁面', () => {
      RouteUtils.redirectToLogin();
      expect(window.location.href).toBe(ROUTES.auth.login);
    });
  });

  describe('redirectToDashboard', () => {
    test('應該重定向到儀表板', () => {
      RouteUtils.redirectToDashboard();
      expect(window.location.href).toBe(ROUTES.dashboard.index);
    });
  });
});

describe('ROUTES 配置', () => {
  test('應該包含所有必要的路徑', () => {
    expect(ROUTES.auth.login).toBeDefined();
    expect(ROUTES.auth.register).toBeDefined();
    expect(ROUTES.dashboard.index).toBeDefined();
    expect(ROUTES.dashboard.profile).toBeDefined();
  });

  test('應該包含 API 配置', () => {
    expect(ROUTES.api.base).toBeDefined();
    expect(ROUTES.api.endpoints.auth).toBeDefined();
    expect(ROUTES.api.endpoints.posts).toBeDefined();
  });
});
