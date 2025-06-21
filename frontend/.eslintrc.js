module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // 代碼風格 (交由 Prettier 處理)
    indent: 'off', // 禁用，由 Prettier 處理
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],

    // 最佳實踐
    'no-console': 'off', // 暫時關閉，因為我們有統一的日誌系統
    'no-debugger': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',

    // 潛在錯誤
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-duplicate-imports': 'error',
    'no-self-compare': 'error',

    // 安全性
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
  },
  globals: {
    // 全域變數
    ROUTES: 'readonly',
    RouteUtils: 'readonly',
    APP_CONFIG: 'readonly',
    ENV: 'readonly',
    API_CONFIG: 'readonly',
    Chart: 'readonly',
    Highcharts: 'readonly',
    updateNavbar: 'readonly',
    log: 'readonly',
    logger: 'readonly',
  },
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '*.min.js'],
};
