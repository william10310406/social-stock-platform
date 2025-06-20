// 路徑管理工具單元測試
import '../test-setup.js';

// 模擬 ROUTES 配置
global.ROUTES = {
  auth: {
    login: '/src/pages/auth/login.html',
    register: '/src/pages/auth/register.html',
  },
  dashboard: {
    index: '/src/pages/dashboard/index.html',
    profile: '/src/pages/dashboard/profile.html',
  },
  api: {
    base: 'http://localhost:5001',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
    },
  },
};

global.RouteUtils = {
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

describe('RouteUtils', () => {
  beforeEach(() => {
    // 重置 window.location
    delete window.location;
    window.location = {
      href: '',
      pathname: '/',
      hostname: 'localhost',
      protocol: 'http:',
    };
  });

  describe('getApiUrl', () => {
    test('應該返回正確的 API URL', () => {
      const url = RouteUtils.getApiUrl('auth');
      expect(url).toBe('http://localhost:5001/api/auth');
    });

    test('應該處理自定義端點', () => {
      const url = RouteUtils.getApiUrl('/custom/endpoint');
      expect(url).toBe('http://localhost:5001/custom/endpoint');
    });
  });

  describe('navigate', () => {
    test('應該設置正確的 href', () => {
      RouteUtils.navigate('/test/page');
      expect(window.location.href).toBe('/test/page');
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
