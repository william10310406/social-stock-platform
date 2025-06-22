/**
 * 配置契約定義
 * 
 * 定義系統配置的標準格式和驗證規則
 * 基於你現有的統一配置管理系統
 */

/**
 * 應用程式配置契約
 */
export const AppConfigContract = {
  /**
   * 基本配置
   */
  app: {
    name: { type: 'string', required: true, default: 'Stock Insight Platform' },
    version: { type: 'string', required: true, pattern: /^\d+\.\d+\.\d+$/ },
    environment: { type: 'string', required: true, enum: ['development', 'production', 'test'] },
    debug: { type: 'boolean', default: false },
    locale: { type: 'string', default: 'zh-TW', enum: ['zh-TW', 'en-US'] },
  },

  /**
   * API 配置
   */
  api: {
    baseUrl: { type: 'string', required: true, format: 'url' },
    timeout: { type: 'number', default: 10000, min: 1000, max: 60000 },
    retries: { type: 'number', default: 3, min: 0, max: 10 },
    headers: {
      'Content-Type': { type: 'string', default: 'application/json' },
      'Accept': { type: 'string', default: 'application/json' },
    },
  },

  /**
   * WebSocket 配置
   */
  websocket: {
    url: { type: 'string', required: true, format: 'url' },
    reconnectInterval: { type: 'number', default: 1000, min: 500, max: 10000 },
    maxReconnectAttempts: { type: 'number', default: 5, min: 1, max: 20 },
    heartbeatInterval: { type: 'number', default: 30000, min: 5000, max: 60000 },
  },

  /**
   * UI 配置
   */
  ui: {
    theme: { type: 'string', default: 'light', enum: ['light', 'dark', 'auto'] },
    pageSize: { type: 'number', default: 20, min: 10, max: 100 },
    language: { type: 'string', default: 'zh-TW' },
    animations: { type: 'boolean', default: true },
    notifications: { type: 'boolean', default: true },
  },
};

/**
 * 路由配置契約
 */
export const RouteConfigContract = {
  /**
   * 路由基本配置
   */
  route: {
    path: { type: 'string', required: true, pattern: /^\/.*/ },
    template: { type: 'string', required: true },
    title: { type: 'string', required: true },
    description: { type: 'string', optional: true },
    keywords: { type: 'array', items: 'string', optional: true },
  },

  /**
   * 路由元數據
   */
  meta: {
    requiresAuth: { type: 'boolean', default: false },
    roles: { type: 'array', items: 'string', optional: true },
    layout: { type: 'string', default: 'default' },
    cache: { type: 'boolean', default: true },
    preload: { type: 'boolean', default: false },
  },

  /**
   * SEO 配置
   */
  seo: {
    canonical: { type: 'string', optional: true, format: 'url' },
    robots: { type: 'string', default: 'index, follow' },
    ogType: { type: 'string', default: 'website' },
    twitterCard: { type: 'string', default: 'summary' },
  },
};

/**
 * 資料庫配置契約
 */
export const DatabaseConfigContract = {
  /**
   * 連接配置
   */
  connection: {
    host: { type: 'string', required: true },
    port: { type: 'number', required: true, min: 1, max: 65535 },
    database: { type: 'string', required: true },
    username: { type: 'string', required: true },
    password: { type: 'string', required: true, sensitive: true },
  },

  /**
   * 連接池配置
   */
  pool: {
    min: { type: 'number', default: 0, min: 0 },
    max: { type: 'number', default: 10, min: 1, max: 100 },
    acquireTimeoutMillis: { type: 'number', default: 60000 },
    idleTimeoutMillis: { type: 'number', default: 30000 },
  },

  /**
   * 快取配置
   */
  cache: {
    enabled: { type: 'boolean', default: true },
    ttl: { type: 'number', default: 300, min: 60, max: 3600 },
    maxSize: { type: 'number', default: 1000, min: 100, max: 10000 },
  },
};

/**
 * 安全配置契約
 */
export const SecurityConfigContract = {
  /**
   * JWT 配置
   */
  jwt: {
    secret: { type: 'string', required: true, sensitive: true, minLength: 32 },
    expiresIn: { type: 'string', default: '1h' },
    refreshExpiresIn: { type: 'string', default: '7d' },
    issuer: { type: 'string', required: true },
    audience: { type: 'string', required: true },
  },

  /**
   * CORS 配置
   */
  cors: {
    origin: { type: 'array', items: 'string', required: true },
    methods: { type: 'array', items: 'string', default: ['GET', 'POST', 'PUT', 'DELETE'] },
    allowedHeaders: { type: 'array', items: 'string', default: ['Content-Type', 'Authorization'] },
    credentials: { type: 'boolean', default: true },
  },

  /**
   * 限流配置
   */
  rateLimit: {
    windowMs: { type: 'number', default: 900000, min: 60000 },
    max: { type: 'number', default: 100, min: 10, max: 1000 },
    message: { type: 'string', default: 'Too many requests' },
    skipSuccessfulRequests: { type: 'boolean', default: false },
  },
};

/**
 * 日誌配置契約
 */
export const LoggingConfigContract = {
  /**
   * 基本日誌配置
   */
  logging: {
    level: { type: 'string', default: 'info', enum: ['error', 'warn', 'info', 'debug'] },
    format: { type: 'string', default: 'json', enum: ['json', 'simple', 'combined'] },
    timestamp: { type: 'boolean', default: true },
    colorize: { type: 'boolean', default: false },
  },

  /**
   * 輸出配置
   */
  transports: {
    console: {
      enabled: { type: 'boolean', default: true },
      level: { type: 'string', default: 'info' },
    },
    file: {
      enabled: { type: 'boolean', default: true },
      filename: { type: 'string', default: 'app.log' },
      maxSize: { type: 'string', default: '20m' },
      maxFiles: { type: 'number', default: 5 },
    },
  },

  /**
   * 錯誤日誌配置
   */
  errorLogging: {
    enabled: { type: 'boolean', default: true },
    filename: { type: 'string', default: 'error.log' },
    level: { type: 'string', default: 'error' },
  },
};

/**
 * 監控配置契約
 */
export const MonitoringConfigContract = {
  /**
   * 健康檢查配置
   */
  healthCheck: {
    enabled: { type: 'boolean', default: true },
    endpoint: { type: 'string', default: '/health' },
    interval: { type: 'number', default: 30000, min: 5000 },
    timeout: { type: 'number', default: 5000, min: 1000 },
  },

  /**
   * 指標收集配置
   */
  metrics: {
    enabled: { type: 'boolean', default: true },
    endpoint: { type: 'string', default: '/metrics' },
    collectDefault: { type: 'boolean', default: true },
    prefix: { type: 'string', default: 'app_' },
  },

  /**
   * 性能監控配置
   */
  performance: {
    enabled: { type: 'boolean', default: true },
    sampleRate: { type: 'number', default: 0.1, min: 0, max: 1 },
    slowQueryThreshold: { type: 'number', default: 1000, min: 100 },
  },
};

/**
 * 測試配置契約
 */
export const TestConfigContract = {
  /**
   * 測試環境配置
   */
  test: {
    environment: { type: 'string', required: true, enum: ['test', 'ci'] },
    timeout: { type: 'number', default: 10000, min: 1000 },
    verbose: { type: 'boolean', default: false },
    coverage: { type: 'boolean', default: true },
  },

  /**
   * 測試資料庫配置
   */
  testDb: {
    useInMemory: { type: 'boolean', default: true },
    resetBetweenTests: { type: 'boolean', default: true },
    seedData: { type: 'boolean', default: true },
  },

  /**
   * Mock 配置
   */
  mocks: {
    enabled: { type: 'boolean', default: true },
    apiDelay: { type: 'number', default: 100, min: 0, max: 5000 },
    errorRate: { type: 'number', default: 0, min: 0, max: 1 },
  },
};

/**
 * 配置驗證規則
 */
export const ConfigValidationRules = {
  /**
   * 類型驗證
   */
  validateType: {
    string: (value) => typeof value === 'string',
    number: (value) => typeof value === 'number' && !isNaN(value),
    boolean: (value) => typeof value === 'boolean',
    array: (value) => Array.isArray(value),
    object: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
    url: (value) => /^https?:\/\/.+/.test(value),
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },

  /**
   * 範圍驗證
   */
  validateRange: {
    min: (value, min) => value >= min,
    max: (value, max) => value <= max,
    minLength: (value, min) => value.length >= min,
    maxLength: (value, max) => value.length <= max,
  },

  /**
   * 格式驗證
   */
  validateFormat: {
    pattern: (value, pattern) => pattern.test(value),
    enum: (value, options) => options.includes(value),
  },
};

/**
 * 配置合併策略
 */
export const ConfigMergeStrategy = {
  /**
   * 深度合併
   */
  deepMerge: true,

  /**
   * 數組合併策略
   */
  arrayMerge: 'replace', // 'replace' | 'concat' | 'merge'

  /**
   * 環境變數覆蓋
   */
  envOverride: true,

  /**
   * 敏感資料處理
   */
  sensitiveKeys: ['password', 'secret', 'key', 'token'],

  /**
   * 配置鎖定
   */
  lockAfterLoad: true,
}; 