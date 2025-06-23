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
    // 檢測是否在 Docker 環境中
    API_BASE_URL: process.env.NODE_ENV === 'docker' ? '' : '',
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
    API_BASE_URL: '',
    VITE_PORT: 5173,
  },
  docker: {
    __DEV__: true,
    __PROD__: false,
    API_BASE_URL: '', // 使用代理路徑避免 CORS
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
  baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
  timeout: 30000,
  retries: 2,
  workers: 1,
  browsers: ['chromium', 'firefox', 'webkit'],
  mobile: ['Pixel 5', 'iPhone 12'],
};

// 雙資料庫配置
const DUAL_DATABASE_CONFIG = {
  architecture_type: 'hot-cold-separation',
  hot_database: {
    name: 'StockInsight_Hot',
    engine: 'MSSQL Server 2022',
    purpose: 'real-time and active data',
    retention_days: 30,
    host: process.env.MSSQL_HOST || 'stock-insight-hot-db',
    port: process.env.MSSQL_PORT || 1433,
    database: process.env.MSSQL_HOT_DATABASE || 'StockInsight_Hot',
    connection_pool: {
      size: 20,
      max_overflow: 30,
      timeout: 30,
      recycle: 3600,
    },
  },
  cold_database: {
    name: 'StockInsight_Cold',
    engine: 'PostgreSQL 14',
    purpose: 'historical and analytical data',
    retention_policy: 'permanent',
    host: process.env.POSTGRES_HOST || 'stock-insight-cold-db',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_COLD_DATABASE || 'StockInsight_Cold',
    connection_pool: {
      size: 10,
      max_overflow: 20,
      timeout: 60,
      recycle: 7200,
    },
  },
  data_distribution: {
    hot_tables: [
      'users', 'conversations', 'messages', 'posts', 'comments', 
      'likes', 'stocks', 'stock_prices', 'user_stocks', 'news',
    ],
    cold_tables: [
      'messages_archive', 'posts_archive', 'stock_prices_history',
      'user_behavior_analytics', 'market_trend_analysis',
    ],
  },
  archival_settings: {
    enabled: process.env.ARCHIVAL_ENABLED === 'true',
    cutoff_days: parseInt(process.env.ARCHIVAL_CUTOFF_DAYS) || 30,
    schedule: process.env.ARCHIVAL_SCHEDULE || '0 2 * * *',
    batch_size: 1000,
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    performance_threshold_ms: parseInt(process.env.PERFORMANCE_THRESHOLD_MS) || 100,
    storage_alert_threshold: parseInt(process.env.STORAGE_ALERT_THRESHOLD) || 85,
  },
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
      host: '0.0.0.0', // 允許外部訪問，Docker 必需
      strictPort: false, // 如果端口被佔用，自動嘗試下一個
      fs: {
        strict: false,
      },
      watch: {
        usePolling: true, // Docker 中必需
        interval: 1000, // 降低輪詢頻率
      },
      hmr: {
        port: 5174, // 使用固定端口避免衝突
        host: '0.0.0.0', // HMR 主機 - Docker 兼容
        clientPort: 5174, // 確保客戶端使用正確端口
      },
      cors: true, // 啟用 CORS
    },
    resolve: {
      alias: getAliasConfig(),
    },
    define: {
      ...Object.fromEntries(
        Object.entries(envConfig).map(([key, value]) => [key, JSON.stringify(value)]),
      ),
    },
    optimizeDeps: {
      include: [], // 預構建依賴
      exclude: [], // 排除預構建
    },
    esbuild: {
      target: 'es2015',
      keepNames: true, // 保持函數名稱，便於調試
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
// 雙資料庫配置生成器
// =============================================================================
export function getDualDatabaseConfig(mode = 'development') {
  return {
    ...DUAL_DATABASE_CONFIG,
    environment: mode,
    isEnabled: mode === 'dual_database' || process.env.DUAL_DATABASE_ENABLED === 'true',
  };
}

// 獲取熱資料庫配置
export function getHotDatabaseConfig() {
  return DUAL_DATABASE_CONFIG.hot_database;
}

// 獲取冷資料庫配置
export function getColdDatabaseConfig() {
  return DUAL_DATABASE_CONFIG.cold_database;
}

// 獲取數據歸檔配置
export function getArchivalConfig() {
  return DUAL_DATABASE_CONFIG.archival_settings;
}

// 獲取監控配置
export function getMonitoringConfig() {
  return DUAL_DATABASE_CONFIG.monitoring;
}

// 生成後端 Flask 配置
export function createFlaskDualDatabaseConfig() {
  const hotConfig = getHotDatabaseConfig();
  const coldConfig = getColdDatabaseConfig();
  
  return {
    SQLALCHEMY_DATABASE_URI: `mssql+pyodbc://${process.env.MSSQL_USER || 'sa'}:${process.env.MSSQL_SA_PASSWORD}@${hotConfig.host}:${hotConfig.port}/${hotConfig.database}?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes`,
    SQLALCHEMY_BINDS: {
      hot: `mssql+pyodbc://${process.env.MSSQL_USER || 'sa'}:${process.env.MSSQL_SA_PASSWORD}@${hotConfig.host}:${hotConfig.port}/${hotConfig.database}?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes`,
      cold: `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${coldConfig.host}:${coldConfig.port}/${coldConfig.database}`,
    },
    SQLALCHEMY_ENGINE_OPTIONS: {
      pool_size: hotConfig.connection_pool.size,
      max_overflow: hotConfig.connection_pool.max_overflow,
      pool_timeout: hotConfig.connection_pool.timeout,
      pool_recycle: hotConfig.connection_pool.recycle,
      pool_pre_ping: true,
    },
    SQLALCHEMY_BINDS_ENGINE_OPTIONS: {
      cold: {
        pool_size: coldConfig.connection_pool.size,
        max_overflow: coldConfig.connection_pool.max_overflow,
        pool_timeout: coldConfig.connection_pool.timeout,
        pool_recycle: coldConfig.connection_pool.recycle,
        pool_pre_ping: true,
      },
    },
  };
}

// =============================================================================
// 導出配置常量
// =============================================================================
export { BASE_PATHS, PAGE_ENTRIES, ENV_CONFIG, THEME_CONFIG, TEST_CONFIG, DUAL_DATABASE_CONFIG };
