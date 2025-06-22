/**
 * API 協議定義
 * 
 * 定義系統中所有 API 端點的接口契約
 * 包括請求/響應格式、參數驗證、錯誤代碼等
 */

/**
 * 股票 API 協議
 */
export const StockApiContract = {
  // GET /api/stocks
  getStocks: {
    method: 'GET',
    endpoint: '/api/stocks',
    queryParams: {
      page: { type: 'number', default: 1, min: 1 },
      limit: { type: 'number', default: 20, min: 1, max: 100 },
      search: { type: 'string', optional: true },
      market: { type: 'string', optional: true, enum: ['TSE', 'OTC'] },
    },
    response: {
      success: {
        stocks: 'array',
        total: 'number',
        page: 'number',
        totalPages: 'number',
      },
      error: {
        message: 'string',
        code: 'string',
      },
    },
  },

  // GET /api/stocks/:id
  getStock: {
    method: 'GET',
    endpoint: '/api/stocks/:id',
    params: {
      id: { type: 'string', required: true },
    },
    response: {
      success: {
        id: 'string',
        symbol: 'string',
        name: 'string',
        market_type: 'string',
        industry: 'string',
        current_price: 'number',
        change: 'number',
        change_percent: 'number',
      },
      error: {
        message: 'string',
        code: 'string',
      },
    },
  },

  // GET /api/stocks/:id/prices
  getStockPrices: {
    method: 'GET',
    endpoint: '/api/stocks/:id/prices',
    params: {
      id: { type: 'string', required: true },
    },
    queryParams: {
      start_date: { type: 'string', optional: true, format: 'YYYY-MM-DD' },
      end_date: { type: 'string', optional: true, format: 'YYYY-MM-DD' },
      limit: { type: 'number', default: 100, min: 1, max: 1000 },
    },
    response: {
      success: {
        prices: 'array',
        stock_id: 'string',
        total: 'number',
      },
    },
  },
};

/**
 * 認證 API 協議
 */
export const AuthApiContract = {
  // POST /api/auth/login
  login: {
    method: 'POST',
    endpoint: '/api/auth/login',
    body: {
      username: { type: 'string', required: true, minLength: 3 },
      password: { type: 'string', required: true, minLength: 6 },
    },
    response: {
      success: {
        token: 'string',
        user: {
          id: 'string',
          username: 'string',
          email: 'string',
        },
      },
      error: {
        message: 'string',
        code: 'string',
      },
    },
  },

  // POST /api/auth/logout
  logout: {
    method: 'POST',
    endpoint: '/api/auth/logout',
    headers: {
      'Authorization': { required: true, format: 'Bearer <token>' },
    },
    response: {
      success: {
        message: 'string',
      },
    },
  },
};

/**
 * 通用 API 響應格式
 */
export const ApiResponseFormat = {
  success: {
    success: true,
    data: 'any',
    timestamp: 'string',
  },
  error: {
    success: false,
    error: {
      message: 'string',
      code: 'string',
      details: 'any',
    },
    timestamp: 'string',
  },
};

/**
 * HTTP 狀態代碼定義
 */
export const HttpStatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * API 錯誤代碼定義
 */
export const ApiErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
}; 