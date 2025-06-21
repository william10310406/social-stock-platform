// constants.js - 統一常數配置文件
// 集中管理所有應用常數和配置項

// ==================== 環境配置 ====================
const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};

const CURRENT_ENV = process.env.NODE_ENV || ENV.DEVELOPMENT;

// ==================== API 配置 ====================
const API_CONFIG = {
  // 基礎 URL
  BASE_URL:
    CURRENT_ENV === ENV.PRODUCTION ? 'https://your-production-api.com' : 'http://localhost:5001',

  // 超時設置
  TIMEOUT: 10000, // 10 秒

  // 重試配置
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 秒

  // 端點路徑
  ENDPOINTS: {
    // 認證相關
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      CHECK: '/api/auth/check',
    },

    // 用戶相關
    USER: {
      PROFILE: '/api/user/profile',
      UPDATE: '/api/user/profile',
      USERS: '/api/users',
    },

    // 文章相關
    POSTS: {
      LIST: '/api/posts',
      CREATE: '/api/posts',
      DETAIL: '/api/posts/:id',
      UPDATE: '/api/posts/:id',
      DELETE: '/api/posts/:id',
      LIKE: '/api/posts/:id/like',
    },

    // 好友相關
    FRIENDS: {
      LIST: '/api/friends',
      REQUESTS: '/api/friends/requests',
      SEND_REQUEST: '/api/friends/requests',
      ACCEPT_REQUEST: '/api/friends/requests/:id/accept',
      REJECT_REQUEST: '/api/friends/requests/:id/reject',
    },

    // 聊天相關
    CHAT: {
      CONVERSATIONS: '/api/conversations',
      MESSAGES: '/api/messages',
      SEND_MESSAGE: '/api/messages',
    },

    // 其他
    HEALTH: '/api/health',
    NEWS: '/api/news',
    STOCKS: '/api/stocks',
  },
};

// ==================== WebSocket 配置 ====================
const WEBSOCKET_CONFIG = {
  URL:
    CURRENT_ENV === ENV.PRODUCTION ? 'wss://your-production-ws.com/ws' : 'ws://localhost:5001/ws',

  // 重連配置
  RECONNECT: {
    MAX_ATTEMPTS: 5,
    INITIAL_DELAY: 1000, // 1 秒
    MAX_DELAY: 30000, // 30 秒
    BACKOFF_FACTOR: 2,
  },

  // 心跳配置
  HEARTBEAT: {
    INTERVAL: 30000, // 30 秒
    TIMEOUT: 5000, // 5 秒
  },

  // 事件類型
  EVENTS: {
    MESSAGE: 'message',
    FRIEND_REQUEST: 'friend_request',
    NOTIFICATION: 'notification',
    USER_STATUS: 'user_status',
    TYPING: 'typing',
  },
};

// ==================== 本地存儲配置 ====================
const STORAGE_KEYS = {
  // 認證相關
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',

  // 用戶偏好
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',

  // 應用狀態
  LAST_ACTIVE_TAB: 'last_active_tab',
  CHAT_DRAFT: 'chat_draft_',
  FORM_DRAFTS: 'form_drafts',

  // PWA 相關
  PWA_INSTALL_PROMPT: 'pwa_install_prompt',
  PWA_LAST_UPDATE: 'pwa_last_update',
};

// ==================== UI 配置 ====================
const UI_CONFIG = {
  // 分頁配置
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SHOW_SIZE_OPTIONS: [10, 20, 50, 100],
  },

  // 加載配置
  LOADING: {
    MIN_DISPLAY_TIME: 500, // 最小顯示時間
    SKELETON_DELAY: 200, // 骨架屏延遲
    ERROR_RETRY_DELAY: 3000, // 錯誤重試延遲
  },

  // 通知配置
  NOTIFICATIONS: {
    DEFAULT_DURATION: 5000, // 5 秒
    ERROR_DURATION: 10000, // 10 秒
    SUCCESS_DURATION: 3000, // 3 秒
    MAX_NOTIFICATIONS: 5,
  },

  // 動畫配置
  ANIMATIONS: {
    FADE_DURATION: 300,
    SLIDE_DURATION: 250,
    BOUNCE_DURATION: 400,
    DISABLED: false, // 可用於無障礙設置
  },

  // 響應式斷點
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
};

// ==================== 業務邏輯配置 ====================
const BUSINESS_CONFIG = {
  // 文章相關
  POST: {
    MAX_TITLE_LENGTH: 100,
    MAX_CONTENT_LENGTH: 5000,
    MAX_IMAGES: 5,
    ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  },

  // 聊天相關
  CHAT: {
    MAX_MESSAGE_LENGTH: 1000,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    TYPING_TIMEOUT: 3000, // 3 秒
    MESSAGE_BATCH_SIZE: 20,
  },

  // 用戶相關
  USER: {
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    MIN_PASSWORD_LENGTH: 8,
    MAX_BIO_LENGTH: 500,
    ALLOWED_AVATAR_TYPES: ['jpg', 'jpeg', 'png'],
    MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
  },

  // 好友相關
  FRIENDS: {
    MAX_FRIENDS: 1000,
    REQUEST_EXPIRY_DAYS: 30,
  },
};

// ==================== 錯誤碼配置 ====================
const ERROR_CODES = {
  // 認證錯誤
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_001',
    TOKEN_EXPIRED: 'AUTH_002',
    TOKEN_INVALID: 'AUTH_003',
    UNAUTHORIZED: 'AUTH_004',
  },

  // 驗證錯誤
  VALIDATION: {
    REQUIRED_FIELD: 'VAL_001',
    INVALID_FORMAT: 'VAL_002',
    LENGTH_EXCEEDED: 'VAL_003',
    INVALID_TYPE: 'VAL_004',
  },

  // 業務錯誤
  BUSINESS: {
    USER_NOT_FOUND: 'BUS_001',
    POST_NOT_FOUND: 'BUS_002',
    PERMISSION_DENIED: 'BUS_003',
    RESOURCE_CONFLICT: 'BUS_004',
  },

  // 系統錯誤
  SYSTEM: {
    NETWORK_ERROR: 'SYS_001',
    SERVER_ERROR: 'SYS_002',
    TIMEOUT: 'SYS_003',
    UNKNOWN: 'SYS_999',
  },
};

// ==================== 正規表達式配置 ====================
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PHONE: /^\+?[\d\s-()]{10,}$/,
  URL: /^https?:\/\/.+/,
  HASHTAG: /#[\w\u4e00-\u9fff]+/g,
  MENTION: /@[\w\u4e00-\u9fff]+/g,
};

// ==================== 國際化配置 ====================
const I18N_CONFIG = {
  DEFAULT_LANGUAGE: 'zh-TW',
  SUPPORTED_LANGUAGES: ['zh-TW', 'zh-CN', 'en-US'],
  FALLBACK_LANGUAGE: 'en-US',

  // 日期格式
  DATE_FORMATS: {
    'zh-TW': 'YYYY/MM/DD',
    'zh-CN': 'YYYY年MM月DD日',
    'en-US': 'MM/DD/YYYY',
  },

  // 時間格式
  TIME_FORMATS: {
    'zh-TW': 'HH:mm',
    'zh-CN': 'HH:mm',
    'en-US': 'h:mm A',
  },
};

// ==================== 導出配置 ====================
const APP_CONFIG = {
  ENV,
  CURRENT_ENV,
  API_CONFIG,
  WEBSOCKET_CONFIG,
  STORAGE_KEYS,
  UI_CONFIG,
  BUSINESS_CONFIG,
  ERROR_CODES,
  REGEX_PATTERNS,
  I18N_CONFIG,
};

// 全域導出
window.APP_CONFIG = APP_CONFIG;

// 個別導出（方便使用）
window.ENV = ENV;
window.API_CONFIG = API_CONFIG;
window.WEBSOCKET_CONFIG = WEBSOCKET_CONFIG;
window.STORAGE_KEYS = STORAGE_KEYS;
window.UI_CONFIG = UI_CONFIG;
window.BUSINESS_CONFIG = BUSINESS_CONFIG;
window.ERROR_CODES = ERROR_CODES;
window.REGEX_PATTERNS = REGEX_PATTERNS;
window.I18N_CONFIG = I18N_CONFIG;

// ES6 模組導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONFIG;
}

console.log('Application constants loaded:', APP_CONFIG);
