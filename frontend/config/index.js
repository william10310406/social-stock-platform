// 統一配置管理中心
// 此文件集中管理所有工具和框架的配置

import { resolve } from 'path';

// 基礎路徑配置
const BASE_PATHS = {
  src: 'src',
  pages: 'src/pages',
  components: 'src/components',
  css: 'src/css',
  js: 'src/js',
  config: 'src/js/config',
  utils: 'src/js/utils',
  tests: 'tests',
  dist: 'dist',
};

// 頁面入口配置
const PAGE_ENTRIES = {
  main: 'index.html',
  auth: {
    login: 'src/pages/auth/login.html',
    register: 'src/pages/auth/register.html',
  },
  dashboard: {
    index: 'src/pages/dashboard/index.html',
    profile: 'src/pages/dashboard/profile.html',
    friends: 'src/pages/dashboard/friends.html',
    chat: 'src/pages/dashboard/chat.html',
  },
  posts: {
    detail: 'src/pages/posts/detail.html',
  },
};

// 環境配置
const ENV_CONFIG = {
  development: {
    __DEV__: true,
    __PROD__: false,
    API_BASE_URL: 'http://localhost:5001',
    VITE_PORT: 5173,
  },
  production: {
    __DEV__: false,
    __PROD__: true,
    API_BASE_URL: 'https://api.stock-insight.com',
    VITE_PORT: 5173,
  },
  test: {
    __DEV__: true,
    __PROD__: false,
    API_BASE_URL: 'http://localhost:5001',
    VITE_PORT: 5173,
  },
};

// 主題配置
const THEME_CONFIG = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
  animation: {
    'fade-in': 'fadeIn 0.5s ease-in-out',
    'slide-up': 'slideUp 0.3s ease-out',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    slideUp: {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
  },
};

// 測試配置
const TEST_CONFIG = {
  testDir: './tests/e2e',
  baseURL: 'http://localhost:5173',
  timeout: 30000,
  retries: 2,
  workers: 1,
  browsers: ['chromium', 'firefox', 'webkit'],
  mobile: ['Pixel 5', 'iPhone 12'],
};

// =============================================================================
// 配置生成器函數
// =============================================================================

// 獲取扁平化的入口配置
export function getFlatEntries() {
  const entries = {};

  // 主頁面
  entries.main = PAGE_ENTRIES.main;

  // 認證頁面
  Object.entries(PAGE_ENTRIES.auth).forEach(([key, path]) => {
    entries[key] = path;
  });

  // 儀表板頁面
  Object.entries(PAGE_ENTRIES.dashboard).forEach(([key, path]) => {
    entries[key === 'index' ? 'dashboard' : key] = path;
  });

  // 文章頁面
  Object.entries(PAGE_ENTRIES.posts).forEach(([key, path]) => {
    entries[`post${key.charAt(0).toUpperCase() + key.slice(1)}`] = path;
  });

  return entries;
}

// 獲取環境配置
export function getEnvConfig(mode = 'development') {
  return ENV_CONFIG[mode] || ENV_CONFIG.development;
}

// 獲取別名配置
export function getAliasConfig(rootDir = process.cwd()) {
  return {
    '@': resolve(rootDir, BASE_PATHS.src),
    '@config': resolve(rootDir, BASE_PATHS.config),
    '@utils': resolve(rootDir, BASE_PATHS.utils),
    '@components': resolve(rootDir, BASE_PATHS.components),
    '@pages': resolve(rootDir, BASE_PATHS.pages),
    '@css': resolve(rootDir, BASE_PATHS.css),
    '@logger': resolve(rootDir, 'src/js/utils/logger.js'),
  };
}

// =============================================================================
// Vite 配置
// =============================================================================
export function createViteConfig(mode = 'development') {
  const envConfig = getEnvConfig(mode);
  const entries = getFlatEntries();

  return {
    root: '.',
    build: {
      outDir: BASE_PATHS.dist,
      sourcemap: true,
      minify: 'esbuild',
      target: 'es2015',
      rollupOptions: {
        input: Object.fromEntries(
          Object.entries(entries).map(([key, path]) => [key, resolve(process.cwd(), path)]),
        ),
      },
    },
    server: {
      port: envConfig.VITE_PORT,
      host: true,
      fs: {
        strict: false,
      },
      watch: {
        usePolling: true,
      },
    },
    resolve: {
      alias: getAliasConfig(),
    },
    define: {
      ...Object.fromEntries(
        Object.entries(envConfig).map(([key, value]) => [key, JSON.stringify(value)]),
      ),
    },
  };
}

// =============================================================================
// Tailwind 配置
// =============================================================================
export function createTailwindConfig() {
  return {
    content: [
      './index.html',
      './src/**/*.{html,js,ts,jsx,tsx}',
      './src/pages/**/*.html',
      './src/components/**/*.html',
    ],
    theme: {
      extend: THEME_CONFIG,
    },
    plugins: [],
  };
}

// =============================================================================
// PostCSS 配置 (返回配置對象，避免 require)
// =============================================================================
export function createPostCSSConfig() {
  return {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  };
}

// =============================================================================
// Playwright 配置 (返回配置對象，避免 require)
// =============================================================================
export function createPlaywrightConfig() {
  // 返回配置對象，讓調用方處理 devices 導入
  return {
    testDir: TEST_CONFIG.testDir,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? TEST_CONFIG.retries : 0,
    workers: process.env.CI ? TEST_CONFIG.workers : undefined,
    reporter: [
      ['html'],
      ['json', { outputFile: 'test-results/results.json' }],
      ['junit', { outputFile: 'test-results/results.xml' }],
    ],
    use: {
      baseURL: TEST_CONFIG.baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      actionTimeout: 10000,
      navigationTimeout: TEST_CONFIG.timeout,
    },
    // 返回瀏覽器配置信息，讓調用方處理
    browserConfigs: {
      browsers: TEST_CONFIG.browsers,
      mobile: TEST_CONFIG.mobile,
    },
    webServer: {
      command: 'npm run dev',
      port: parseInt(TEST_CONFIG.baseURL.split(':').pop()),
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  };
}

// =============================================================================
// 導出配置常量
// =============================================================================
export { BASE_PATHS, PAGE_ENTRIES, ENV_CONFIG, THEME_CONFIG, TEST_CONFIG };
