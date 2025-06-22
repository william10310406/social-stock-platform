/**
 * 數據類型定義
 * 
 * 定義系統中所有的數據結構和類型規範
 * 提供一致的數據格式和驗證標準
 */

/**
 * 股票數據類型
 */
export const StockDataTypes = {
  /**
   * 股票基本資料
   */
  Stock: {
    id: 'string',
    symbol: 'string',        // 股票代號 (e.g., "2330")
    name: 'string',          // 股票名稱 (e.g., "台積電")
    market_type: 'string',   // 市場類型 (TSE/OTC)
    industry: 'string',      // 行業別
    created_at: 'string',    // ISO 8601 格式
    updated_at: 'string',     // ISO 8601 格式
  },

  /**
   * 股票價格資料
   */
  StockPrice: {
    id: 'string',
    stock_id: 'string',      // 關聯股票 ID
    date: 'string',          // YYYY-MM-DD 格式
    open: 'number',          // 開盤價
    high: 'number',          // 最高價
    low: 'number',           // 最低價
    close: 'number',         // 收盤價
    volume: 'number',        // 成交量
    created_at: 'string',     // ISO 8601 格式
  },

  /**
   * 股票列表響應
   */
  StockListResponse: {
    stocks: 'array<Stock>',
    total: 'number',
    page: 'number',
    totalPages: 'number',
    hasNext: 'boolean',
    hasPrev: 'boolean',
  },

  /**
   * 股票價格歷史響應
   */
  StockPricesResponse: {
    prices: 'array<StockPrice>',
    stock_id: 'string',
    total: 'number',
    dateRange: {
      start: 'string',
      end: 'string',
    },
  },
};

/**
 * 用戶數據類型
 */
export const UserDataTypes = {
  /**
   * 用戶基本資料
   */
  User: {
    id: 'string',
    username: 'string',
    email: 'string',
    profile: {
      displayName: 'string',
      avatar: 'string',
      preferences: 'object',
    },
    created_at: 'string',
    updated_at: 'string',
  },

  /**
   * 認證資料
   */
  AuthToken: {
    token: 'string',
    type: 'string',          // Bearer
    expires_at: 'string',    // ISO 8601 格式
    refresh_token: 'string',
  },

  /**
   * 登入響應
   */
  LoginResponse: {
    user: 'User',
    auth: 'AuthToken',
    permissions: 'array<string>',
  },
};

/**
 * 實時通信數據類型
 */
export const RealtimeDataTypes = {
  /**
   * WebSocket 訊息基本格式
   */
  WebSocketMessage: {
    type: 'string',          // 訊息類型
    payload: 'object',       // 訊息內容
    timestamp: 'string',     // ISO 8601 格式
    id: 'string',            // 訊息 ID
  },

  /**
   * 聊天訊息
   */
  ChatMessage: {
    id: 'string',
    user_id: 'string',
    username: 'string',
    message: 'string',
    room: 'string',
    timestamp: 'string',
  },

  /**
   * 用戶狀態
   */
  UserStatus: {
    user_id: 'string',
    username: 'string',
    status: 'string',        // online/offline/away
    last_seen: 'string',
    room: 'string',
  },

  /**
   * 股價更新
   */
  StockPriceUpdate: {
    stock_id: 'string',
    symbol: 'string',
    price: 'number',
    change: 'number',
    change_percent: 'number',
    volume: 'number',
    timestamp: 'string',
  },
};

/**
 * 錯誤數據類型
 */
export const ErrorDataTypes = {
  /**
   * 標準錯誤格式
   */
  StandardError: {
    message: 'string',
    code: 'string',
    details: 'object',
    timestamp: 'string',
    trace_id: 'string',
  },

  /**
   * 驗證錯誤
   */
  ValidationError: {
    field: 'string',
    message: 'string',
    value: 'any',
    rule: 'string',
  },

  /**
   * API 錯誤響應
   */
  ApiErrorResponse: {
    success: false,
    error: 'StandardError',
    errors: 'array<ValidationError>',
  },
};

/**
 * 配置數據類型
 */
export const ConfigDataTypes = {
  /**
   * 應用配置
   */
  AppConfig: {
    api: {
      baseUrl: 'string',
      timeout: 'number',
      retries: 'number',
    },
    websocket: {
      url: 'string',
      reconnectInterval: 'number',
      maxReconnectAttempts: 'number',
    },
    ui: {
      theme: 'string',
      language: 'string',
      pageSize: 'number',
    },
  },

  /**
   * 路由配置
   */
  RouteConfig: {
    path: 'string',
    template: 'string',
    title: 'string',
    meta: 'object',
  },
};

/**
 * 通用數據類型
 */
export const CommonDataTypes = {
  /**
   * 分頁參數
   */
  PaginationParams: {
    page: 'number',
    limit: 'number',
    offset: 'number',
  },

  /**
   * 分頁資訊
   */
  PaginationInfo: {
    total: 'number',
    page: 'number',
    totalPages: 'number',
    hasNext: 'boolean',
    hasPrev: 'boolean',
  },

  /**
   * 搜尋參數
   */
  SearchParams: {
    query: 'string',
    filters: 'object',
    sort: {
      field: 'string',
      order: 'string',       // asc/desc
    },
  },

  /**
   * 時間範圍
   */
  DateRange: {
    start: 'string',        // YYYY-MM-DD
    end: 'string',           // YYYY-MM-DD
  },
};

/**
 * 數據驗證規則
 */
export const ValidationRules = {
  required: { rule: 'required', message: '此欄位為必填' },
  email: { rule: 'email', message: '請輸入有效的電子郵件地址' },
  minLength: (min) => ({ rule: 'minLength', min, message: `最少需要 ${min} 個字符` }),
  maxLength: (max) => ({ rule: 'maxLength', max, message: `最多只能 ${max} 個字符` }),
  numeric: { rule: 'numeric', message: '必須為數字' },
  positive: { rule: 'positive', message: '必須為正數' },
  dateFormat: { rule: 'dateFormat', format: 'YYYY-MM-DD', message: '日期格式必須為 YYYY-MM-DD' },
}; 