// WebSocket 管理器
// 實現真正的實時通訊，替代輪詢機制

// 導入路徑配置
import { RouteUtils } from '../config/routes.js';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000; // 開始 1 秒
    this.maxReconnectInterval = 30000; // 最大 30 秒
    this.heartbeatInterval = null;
    this.heartbeatTimer = 30000; // 30 秒心跳

    this.eventListeners = new Map();
    this.isConnecting = false;
    this.isManualClose = false;

    this.connect();
  }

  // 連接 WebSocket
  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    this.isManualClose = false;

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('WebSocket: 無 token，跳過連接');
      this.isConnecting = false;
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = '5001'; // 後端 WebSocket 端口
    const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/ws?token=${token}`;

    console.log('WebSocket: 嘗試連接...', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket: 連接錯誤', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  // 設置事件處理器
  setupEventHandlers() {
    this.ws.onopen = (event) => {
      console.log('WebSocket: 連接成功');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectInterval = 1000;

      this.startHeartbeat();
      this.emit('connected', event);

      // 顯示連接成功提示
      if (window.pwaManager) {
        window.pwaManager.showToast('實時連接已建立', 'success', 3000);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket: 收到消息', data);

        this.handleMessage(data);
      } catch (error) {
        console.error('WebSocket: 消息解析錯誤', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket: 連接關閉', event.code, event.reason);
      this.isConnecting = false;
      this.stopHeartbeat();

      this.emit('disconnected', event);

      if (!this.isManualClose) {
        this.scheduleReconnect();

        // 顯示斷線提示
        if (window.pwaManager) {
          window.pwaManager.showToast('連接已斷開，正在重新連接...', 'warning', 5000);
        }
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket: 錯誤', error);
      this.emit('error', error);
    };
  }

  // 處理接收到的消息
  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'pong':
        console.log('WebSocket: 收到心跳回應');
        break;

      case 'new_message':
        this.emit('message', payload);
        this.showMessageNotification(payload);
        break;

      case 'friend_request':
        this.emit('friend_request', payload);
        this.showFriendRequestNotification(payload);
        break;

      case 'friend_accepted':
        this.emit('friend_accepted', payload);
        break;

      case 'post_liked':
        this.emit('post_liked', payload);
        break;

      case 'post_commented':
        this.emit('post_commented', payload);
        break;

      case 'user_online':
        this.emit('user_online', payload);
        break;

      case 'user_offline':
        this.emit('user_offline', payload);
        break;

      default:
        console.log('WebSocket: 未知消息類型', type);
        this.emit('unknown', data);
    }
  }

  // 發送消息
  send(type, payload = {}) {
    if (!this.isConnected()) {
      console.warn('WebSocket: 連接未建立，無法發送消息');
      return false;
    }

    const message = {
      type,
      payload,
      timestamp: Date.now(),
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log('WebSocket: 發送消息', message);
      return true;
    } catch (error) {
      console.error('WebSocket: 發送失敗', error);
      return false;
    }
  }

  // 檢查連接狀態
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // 手動關閉連接
  close() {
    this.isManualClose = true;
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
    }
  }

  // 重新連接
  reconnect() {
    this.close();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // 安排重連
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('WebSocket: 達到最大重連次數，停止重連');
      if (window.pwaManager) {
        window.pwaManager.showToast('無法建立連接，請檢查網路', 'error', 10000);
      }
      return;
    }

    this.reconnectAttempts++;

    console.log(`WebSocket: ${this.reconnectInterval}ms 後進行第 ${this.reconnectAttempts} 次重連`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);

    // 指數退避算法
    this.reconnectInterval = Math.min(this.reconnectInterval * 2, this.maxReconnectInterval);
  }

  // 開始心跳
  startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping');
      }
    }, this.heartbeatTimer);
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 顯示消息通知
  showMessageNotification(message) {
    // 如果用戶不在聊天頁面，顯示通知
    if (!window.location.pathname.includes('chat.html')) {
      if (Notification.permission === 'granted') {
        new Notification(`來自 ${message.sender_name} 的新消息`, {
          body: message.content,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'chat-message',
          data: {
            url: window.RouteUtils
              ? window.RouteUtils.getPagePath('dashboard', 'chat')
              : '/src/pages/dashboard/chat.html',
            conversationId: message.conversation_id,
          },
        });
      }

      // 顯示應用內通知
      if (window.pwaManager) {
        window.pwaManager.showToast(
          `${message.sender_name}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
          'info',
          5000,
        );
      }
    }
  }

  // 顯示好友請求通知
  showFriendRequestNotification(request) {
    if (Notification.permission === 'granted') {
      new Notification('新的好友請求', {
        body: `${request.sender_name} 想要加您為好友`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'friend-request',
        data: {
          type: 'friend_request',
          url: RouteUtils.getPagePath('dashboard', 'friends'),
          requestId: request.id,
        },
      });
    }

    if (window.pwaManager) {
      window.pwaManager.showToast(`${request.sender_name} 發送了好友請求`, 'info', 5000);
    }
  }

  // 事件監聽器管理
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`WebSocket: 事件處理器錯誤 (${event})`, error);
        }
      });
    }
  }

  // 聊天相關方法
  sendChatMessage(conversationId, content) {
    return this.send('send_message', {
      conversation_id: conversationId,
      content: content,
    });
  }

  joinConversation(conversationId) {
    return this.send('join_conversation', {
      conversation_id: conversationId,
    });
  }

  leaveConversation(conversationId) {
    return this.send('leave_conversation', {
      conversation_id: conversationId,
    });
  }

  // 好友相關方法
  sendFriendRequest(userId) {
    return this.send('friend_request', {
      user_id: userId,
    });
  }

  acceptFriendRequest(requestId) {
    return this.send('accept_friend_request', {
      request_id: requestId,
    });
  }

  // 狀態相關方法
  updateOnlineStatus(status = 'online') {
    return this.send('update_status', {
      status: status,
    });
  }

  // 獲取連接狀態信息
  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.ws ? this.ws.readyState : null,
      url: this.ws ? this.ws.url : null,
    };
  }
}

// 全域 WebSocket 管理器實例
// 只在已登入時初始化
let wsManager = null;

function initWebSocket() {
  if (!wsManager && localStorage.getItem('token')) {
    wsManager = new WebSocketManager();
    window.wsManager = wsManager;
    console.log('WebSocket: 管理器已初始化');
  }
  return wsManager;
}

function getWebSocketManager() {
  return wsManager || initWebSocket();
}

// 頁面載入時自動初始化（如果已登入）
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    initWebSocket();
  }
});

// 登入時初始化 WebSocket
window.addEventListener('storage', (event) => {
  if (event.key === 'token' && event.newValue && !wsManager) {
    initWebSocket();
  } else if (event.key === 'token' && !event.newValue && wsManager) {
    // 登出時關閉 WebSocket
    wsManager.close();
    wsManager = null;
    window.wsManager = null;
  }
});

// 頁面關閉時清理
window.addEventListener('beforeunload', () => {
  if (wsManager) {
    wsManager.close();
  }
});

// 導出
window.initWebSocket = initWebSocket;
window.getWebSocketManager = getWebSocketManager;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebSocketManager, initWebSocket, getWebSocketManager };
}
