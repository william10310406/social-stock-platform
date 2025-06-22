/**
 * WebSocket 協議定義
 * 
 * 定義實時通信的所有協議規範
 * 基於你現有的 Socket.IO 5.3.6 完整實現
 */

/**
 * WebSocket 連接協議
 */
export const ConnectionProtocols = {
  /**
   * 連接建立
   */
  CONNECT: {
    event: 'connect',
    direction: 'bidirectional',
    payload: {
      timestamp: 'string',
      clientId: 'string',
      version: 'string',
    },
  },

  /**
   * 連接斷開
   */
  DISCONNECT: {
    event: 'disconnect',
    direction: 'bidirectional',
    payload: {
      reason: 'string',      // 'io server disconnect', 'io client disconnect', 'ping timeout'
      timestamp: 'string',
    },
  },

  /**
   * 重新連接
   */
  RECONNECT: {
    event: 'reconnect',
    direction: 'client-to-server',
    payload: {
      attempt: 'number',
      timestamp: 'string',
    },
  },

  /**
   * 心跳檢測
   */
  PING: {
    event: 'ping',
    direction: 'client-to-server',
    payload: {
      timestamp: 'string',
    },
  },

  /**
   * 心跳響應
   */
  PONG: {
    event: 'pong',
    direction: 'server-to-client',
    payload: {
      timestamp: 'string',
      latency: 'number',
    },
  },
};

/**
 * 聊天室協議
 */
export const ChatProtocols = {
  /**
   * 加入房間
   */
  JOIN_ROOM: {
    event: 'join_room',
    direction: 'client-to-server',
    payload: {
      room: 'string',
      user: {
        id: 'string',
        username: 'string',
      },
      timestamp: 'string',
    },
  },

  /**
   * 離開房間
   */
  LEAVE_ROOM: {
    event: 'leave_room',
    direction: 'client-to-server',
    payload: {
      room: 'string',
      user: {
        id: 'string',
        username: 'string',
      },
      timestamp: 'string',
    },
  },

  /**
   * 發送訊息
   */
  SEND_MESSAGE: {
    event: 'send_message',
    direction: 'client-to-server',
    payload: {
      room: 'string',
      message: 'string',
      user: {
        id: 'string',
        username: 'string',
      },
      timestamp: 'string',
      messageType: 'string',    // text/image/file
    },
  },

  /**
   * 接收訊息
   */
  RECEIVE_MESSAGE: {
    event: 'receive_message',
    direction: 'server-to-client',
    payload: {
      id: 'string',
      room: 'string',
      message: 'string',
      user: {
        id: 'string',
        username: 'string',
      },
      timestamp: 'string',
      messageType: 'string',
    },
  },

  /**
   * 用戶加入房間通知
   */
  USER_JOINED: {
    event: 'user_joined',
    direction: 'server-to-client',
    payload: {
      room: 'string',
      user: {
        id: 'string',
        username: 'string',
      },
      userCount: 'number',
      timestamp: 'string',
    },
  },

  /**
   * 用戶離開房間通知
   */
  USER_LEFT: {
    event: 'user_left',
    direction: 'server-to-client',
    payload: {
      room: 'string',
      user: {
        id: 'string',
        username: 'string',
      },
      userCount: 'number',
      timestamp: 'string',
    },
  },

  /**
   * 正在輸入通知
   */
  TYPING_START: {
    event: 'typing_start',
    direction: 'client-to-server',
    payload: {
      room: 'string',
      user: {
        id: 'string',
        username: 'string',
      },
      timestamp: 'string',
    },
  },

  /**
   * 停止輸入通知
   */
  TYPING_STOP: {
    event: 'typing_stop',
    direction: 'client-to-server',
    payload: {
      room: 'string',
      user: {
        id: 'string',
        username: 'string',
      },
      timestamp: 'string',
    },
  },
};

/**
 * 股票實時數據協議
 */
export const StockRealtimeProtocols = {
  /**
   * 訂閱股票數據
   */
  SUBSCRIBE_STOCK: {
    event: 'subscribe_stock',
    direction: 'client-to-server',
    payload: {
      stockIds: 'array<string>',
      userId: 'string',
      timestamp: 'string',
    },
  },

  /**
   * 取消訂閱股票數據
   */
  UNSUBSCRIBE_STOCK: {
    event: 'unsubscribe_stock',
    direction: 'client-to-server',
    payload: {
      stockIds: 'array<string>',
      userId: 'string',
      timestamp: 'string',
    },
  },

  /**
   * 股價更新推送
   */
  STOCK_PRICE_UPDATE: {
    event: 'stock_price_update',
    direction: 'server-to-client',
    payload: {
      stockId: 'string',
      symbol: 'string',
      data: {
        price: 'number',
        change: 'number',
        changePercent: 'number',
        volume: 'number',
        high: 'number',
        low: 'number',
      },
      timestamp: 'string',
    },
  },

  /**
   * 市場狀態更新
   */
  MARKET_STATUS_UPDATE: {
    event: 'market_status_update',
    direction: 'server-to-client',
    payload: {
      market: 'string',       // TSE/OTC
      status: 'string',       // open/closed/pre-market/after-market
      nextOpen: 'string',
      timestamp: 'string',
    },
  },
};

/**
 * 用戶狀態協議
 */
export const UserStatusProtocols = {
  /**
   * 用戶上線
   */
  USER_ONLINE: {
    event: 'user_online',
    direction: 'server-to-client',
    payload: {
      user: {
        id: 'string',
        username: 'string',
      },
      timestamp: 'string',
    },
  },

  /**
   * 用戶離線
   */
  USER_OFFLINE: {
    event: 'user_offline',
    direction: 'server-to-client',
    payload: {
      user: {
        id: 'string',
        username: 'string',
      },
      lastSeen: 'string',
      timestamp: 'string',
    },
  },

  /**
   * 更新用戶狀態
   */
  UPDATE_USER_STATUS: {
    event: 'update_user_status',
    direction: 'client-to-server',
    payload: {
      status: 'string',       // online/away/busy/offline
      message: 'string',
      timestamp: 'string',
    },
  },
};

/**
 * 系統通知協議
 */
export const SystemNotificationProtocols = {
  /**
   * 系統廣播
   */
  SYSTEM_BROADCAST: {
    event: 'system_broadcast',
    direction: 'server-to-client',
    payload: {
      type: 'string',         // info/warning/error/maintenance
      title: 'string',
      message: 'string',
      priority: 'number',
      timestamp: 'string',
      expiresAt: 'string',
    },
  },

  /**
   * 個人通知
   */
  PERSONAL_NOTIFICATION: {
    event: 'personal_notification',
    direction: 'server-to-client',
    payload: {
      userId: 'string',
      type: 'string',
      title: 'string',
      message: 'string',
      data: 'object',
      timestamp: 'string',
    },
  },

  /**
   * 股價預警
   */
  PRICE_ALERT: {
    event: 'price_alert',
    direction: 'server-to-client',
    payload: {
      userId: 'string',
      stockId: 'string',
      symbol: 'string',
      alertType: 'string',    // price_above/price_below/volume_spike
      currentValue: 'number',
      targetValue: 'number',
      message: 'string',
      timestamp: 'string',
    },
  },
};

/**
 * WebSocket 配置協議
 */
export const WebSocketConfig = {
  /**
   * 連接配置
   */
  connection: {
    transports: ['websocket'],
    timeout: 20000,
    forceNew: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 5,
    randomizationFactor: 0.5,
  },

  /**
   * 命名空間配置
   */
  namespaces: {
    default: '/',
    chat: '/chat',
    stocks: '/stocks',
    admin: '/admin',
  },

  /**
   * 房間配置
   */
  rooms: {
    general: 'general',
    stocks: 'stocks',
    alerts: 'alerts',
    admin: 'admin',
  },

  /**
   * 事件限制配置
   */
  rateLimiting: {
    'send_message': { maxPerMinute: 30 },
    'subscribe_stock': { maxPerMinute: 10 },
    'ping': { maxPerMinute: 60 },
  },
};

/**
 * 錯誤處理協議
 */
export const WebSocketErrorProtocols = {
  /**
   * 連接錯誤
   */
  CONNECTION_ERROR: {
    event: 'connect_error',
    payload: {
      error: {
        message: 'string',
        code: 'string',
        type: 'string',
      },
      timestamp: 'string',
    },
  },

  /**
   * 認證錯誤
   */
  AUTH_ERROR: {
    event: 'auth_error',
    payload: {
      error: {
        message: 'string',
        code: 'string',
      },
      timestamp: 'string',
    },
  },

  /**
   * 限流錯誤
   */
  RATE_LIMIT_ERROR: {
    event: 'rate_limit_error',
    payload: {
      error: {
        message: 'string',
        limit: 'number',
        window: 'number',
      },
      timestamp: 'string',
    },
  },
}; 