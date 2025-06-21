// 統一構建配置
// 此文件集中管理所有構建相關的路徑和設置

export const BUILD_CONFIG = {
  // 頁面入口配置
  entries: {
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
  },

  // 別名配置
  aliases: {
    '@': 'src',
    '@config': 'src/js/config',
    '@utils': 'src/js/utils',
    '@components': 'src/components',
    '@pages': 'src/pages',
    '@css': 'src/css',
  },

  // 開發服務器配置
  server: {
    port: 5173,
    host: true,
    strictFs: false,
    usePolling: true,
  },

  // 構建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2015',
  },

  // 環境變量
  env: {
    development: {
      __DEV__: true,
      __PROD__: false,
      API_BASE_URL: 'http://localhost:5001',
    },
    production: {
      __DEV__: false,
      __PROD__: true,
      API_BASE_URL: 'https://api.stock-insight.com',
    },
  },
};

// 獲取扁平化的入口配置
export function getFlatEntries() {
  const entries = {};

  // 主頁面
  entries.main = BUILD_CONFIG.entries.main;

  // 認證頁面
  Object.entries(BUILD_CONFIG.entries.auth).forEach(([key, path]) => {
    entries[key] = path;
  });

  // 儀表板頁面
  Object.entries(BUILD_CONFIG.entries.dashboard).forEach(([key, path]) => {
    entries[key === 'index' ? 'dashboard' : key] = path;
  });

  // 文章頁面
  Object.entries(BUILD_CONFIG.entries.posts).forEach(([key, path]) => {
    entries[`post${key.charAt(0).toUpperCase() + key.slice(1)}`] = path;
  });

  return entries;
}

// 獲取環境配置
export function getEnvConfig(mode = 'development') {
  return BUILD_CONFIG.env[mode] || BUILD_CONFIG.env.development;
}
