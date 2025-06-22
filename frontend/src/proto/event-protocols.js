/**
 * 事件協議定義
 * 
 * 定義系統中所有的事件類型和格式
 * 包括前端事件、後端事件、自定義事件等
 */

/**
 * DOM 事件協議
 */
export const DomEventProtocols = {
  /**
   * 股票搜索事件
   */
  STOCK_SEARCH: {
    type: 'stock:search',
    detail: {
      query: 'string',
      filters: 'object',
      timestamp: 'string',
    },
  },

  /**
   * 股票選擇事件
   */
  STOCK_SELECT: {
    type: 'stock:select',
    detail: {
      stockId: 'string',
      symbol: 'string',
      name: 'string',
      timestamp: 'string',
    },
  },

  /**
   * 頁面導航事件
   */
  PAGE_NAVIGATE: {
    type: 'page:navigate',
    detail: {
      from: 'string',
      to: 'string',
      params: 'object',
      timestamp: 'string',
    },
  },

  /**
   * 用戶交互事件
   */
  USER_INTERACTION: {
    type: 'user:interaction',
    detail: {
      action: 'string',      // click/hover/scroll/input
      element: 'string',     // 元素選擇器
      value: 'any',
      timestamp: 'string',
    },
  },
};

/**
 * 應用程式事件協議
 */
export const AppEventProtocols = {
  /**
   * 應用程式初始化
   */
  APP_INIT: {
    type: 'app:init',
    payload: {
      version: 'string',
      environment: 'string',
      config: 'object',
      timestamp: 'string',
    },
  },

  /**
   * 應用程式就緒
   */
  APP_READY: {
    type: 'app:ready',
    payload: {
      loadTime: 'number',
      components: 'array',
      timestamp: 'string',
    },
  },

  /**
   * 錯誤事件
   */
  APP_ERROR: {
    type: 'app:error',
    payload: {
      error: {
        message: 'string',
        code: 'string',
        stack: 'string',
      },
      context: 'object',
      timestamp: 'string',
    },
  },

  /**
   * 主題變更事件
   */
  THEME_CHANGE: {
    type: 'app:theme-change',
    payload: {
      from: 'string',
      to: 'string',
      timestamp: 'string',
    },
  },
};

/**
 * 數據事件協議
 */
export const DataEventProtocols = {
  /**
   * 數據載入開始
   */
  DATA_LOAD_START: {
    type: 'data:load-start',
    payload: {
      resource: 'string',
      params: 'object',
      timestamp: 'string',
    },
  },

  /**
   * 數據載入成功
   */
  DATA_LOAD_SUCCESS: {
    type: 'data:load-success',
    payload: {
      resource: 'string',
      data: 'any',
      duration: 'number',
      timestamp: 'string',
    },
  },

  /**
   * 數據載入失敗
   */
  DATA_LOAD_ERROR: {
    type: 'data:load-error',
    payload: {
      resource: 'string',
      error: 'object',
      duration: 'number',
      timestamp: 'string',
    },
  },

  /**
   * 數據更新事件
   */
  DATA_UPDATE: {
    type: 'data:update',
    payload: {
      resource: 'string',
      changes: 'object',
      timestamp: 'string',
    },
  },
};

/**
 * UI 組件事件協議
 */
export const ComponentEventProtocols = {
  /**
   * Toast 顯示事件
   */
  TOAST_SHOW: {
    type: 'toast:show',
    detail: {
      message: 'string',
      type: 'string',       // success/error/warning/info
      duration: 'number',
      timestamp: 'string',
    },
  },

  /**
   * Modal 開啟事件
   */
  MODAL_OPEN: {
    type: 'modal:open',
    detail: {
      modalId: 'string',
      title: 'string',
      content: 'string',
      timestamp: 'string',
    },
  },

  /**
   * Modal 關閉事件
   */
  MODAL_CLOSE: {
    type: 'modal:close',
    detail: {
      modalId: 'string',
      reason: 'string',     // user/programmatic/escape
      timestamp: 'string',
    },
  },

  /**
   * Loading 狀態變更
   */
  LOADING_CHANGE: {
    type: 'loading:change',
    detail: {
      isLoading: 'boolean',
      message: 'string',
      target: 'string',
      timestamp: 'string',
    },
  },
};

/**
 * 業務邏輯事件協議
 */
export const BusinessEventProtocols = {
  /**
   * 股票加入關注
   */
  STOCK_WATCH_ADD: {
    type: 'stock:watch-add',
    payload: {
      stockId: 'string',
      userId: 'string',
      timestamp: 'string',
    },
  },

  /**
   * 股票移除關注
   */
  STOCK_WATCH_REMOVE: {
    type: 'stock:watch-remove',
    payload: {
      stockId: 'string',
      userId: 'string',
      timestamp: 'string',
    },
  },

  /**
   * 用戶登入
   */
  USER_LOGIN: {
    type: 'user:login',
    payload: {
      userId: 'string',
      username: 'string',
      timestamp: 'string',
    },
  },

  /**
   * 用戶登出
   */
  USER_LOGOUT: {
    type: 'user:logout',
    payload: {
      userId: 'string',
      reason: 'string',
      timestamp: 'string',
    },
  },
};

/**
 * 事件優先級定義
 */
export const EventPriority = {
  CRITICAL: 1,      // 系統錯誤、安全事件
  HIGH: 2,          // 業務重要事件
  NORMAL: 3,        // 一般操作事件
  LOW: 4,            // 統計、日誌事件
};

/**
 * 事件處理配置
 */
export const EventHandlerConfig = {
  /**
   * 是否啟用事件日誌
   */
  enableLogging: true,

  /**
   * 事件日誌級別
   */
  logLevel: {
    [EventPriority.CRITICAL]: 'error',
    [EventPriority.HIGH]: 'warn',
    [EventPriority.NORMAL]: 'info',
    [EventPriority.LOW]: 'debug',
  },

  /**
   * 事件重試配置
   */
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },

  /**
   * 事件過濾規則
   */
  filterRules: {
    ignoreTypes: ['user:interaction'],
    rateLimiting: {
      'data:load-start': { maxPerSecond: 10 },
      'user:interaction': { maxPerSecond: 100 },
    },
  },
}; 