// WebSocket 管理器單元測試

// 模擬 WebSocket 管理器
class MockWebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.isConnecting = false;
    this.eventHandlers = new Map();
    this.messageQueue = [];
    this.isOnline = navigator.onLine;

    this.setupNetworkMonitoring();
  }

  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (!this.isConnected()) {
        this.connect();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.disconnect();
    });
  }

  connect(
    url = process.env.NODE_ENV === 'docker' ? 'ws://127.0.0.1:5173/ws' : 'ws://localhost:5174/',
  ) {
    if (this.isConnecting || this.isConnected()) {
      return;
    }

    if (!this.isOnline) {
      console.warn('Cannot connect WebSocket: offline');
      return;
    }

    this.isConnecting = true;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.processPendingMessages();
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this.stopHeartbeat();
      this.emit('disconnected');
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      this.isConnecting = false;
      this.emit('error', error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
    this.reconnectAttempts = 0;
  }

  isConnected() {
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false;
  }

  send(data) {
    if (this.isConnected()) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.messageQueue.push(data);
    }
  }

  processPendingMessages() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });

        this.heartbeatTimeout = setTimeout(() => {
          this.disconnect();
        }, 5000);
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    setTimeout(() => {
      if (!this.isConnected() && this.isOnline) {
        this.connect();
      }
    }, delay);
  }

  handleMessage(data) {
    if (data.type === 'pong') {
      if (this.heartbeatTimeout) {
        clearTimeout(this.heartbeatTimeout);
        this.heartbeatTimeout = null;
      }
      return;
    }

    this.emit('message', data);
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('WebSocket event handler error:', error);
        }
      });
    }
  }

  getStatus() {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      online: this.isOnline,
    };
  }
}

describe('WebSocketManager', () => {
  let wsManager;
  let mockWebSocket;

  beforeEach(() => {
    // 重置 WebSocket mock
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      readyState: WebSocket.OPEN,
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
    };

    global.WebSocket = jest.fn(() => {
      const ws = mockWebSocket;
      // 模擬連接成功
      setTimeout(() => {
        if (ws.onopen) ws.onopen();
      }, 0);
      return ws;
    });
    global.WebSocket.OPEN = 1;
    global.WebSocket.CLOSED = 3;

    wsManager = new MockWebSocketManager();
  });

  afterEach(() => {
    wsManager.disconnect();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('connect', () => {
    test('應該創建 WebSocket 連接', () => {
      wsManager.connect('ws://test.example.com');

      expect(global.WebSocket).toHaveBeenCalledWith('ws://test.example.com');
      expect(wsManager.isConnecting).toBe(true);
    });

    test('應該使用預設 URL', () => {
      wsManager.connect();

      const expectedUrl =
        process.env.NODE_ENV === 'docker' ? 'ws://127.0.0.1:5173/ws' : 'ws://localhost:5174/';
      expect(global.WebSocket).toHaveBeenCalledWith(expectedUrl);
    });

    test('不應該重複連接', () => {
      wsManager.connect();
      wsManager.connect();

      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });

    test('離線時不應該連接', () => {
      wsManager.isOnline = false;
      wsManager.connect();

      expect(global.WebSocket).not.toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    test('應該關閉 WebSocket 連接', () => {
      wsManager.connect();
      wsManager.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(wsManager.ws).toBeNull();
    });

    test('應該停止心跳', () => {
      wsManager.startHeartbeat();
      wsManager.disconnect();

      expect(wsManager.heartbeatInterval).toBeNull();
    });
  });

  describe('isConnected', () => {
    test('應該正確檢測連接狀態', () => {
      expect(wsManager.isConnected()).toBe(false);

      wsManager.connect();
      expect(wsManager.isConnected()).toBe(true);

      mockWebSocket.readyState = WebSocket.CLOSED;
      expect(wsManager.isConnected()).toBe(false);
    });
  });

  describe('send', () => {
    test('連接時應該發送訊息', () => {
      wsManager.connect();
      const testData = { type: 'test', message: 'hello' };

      wsManager.send(testData);

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(testData));
    });

    test('未連接時應該將訊息加入隊列', () => {
      const testData = { type: 'test', message: 'hello' };

      wsManager.send(testData);

      expect(wsManager.messageQueue).toContain(testData);
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });
  });

  describe('processPendingMessages', () => {
    test('應該處理隊列中的訊息', () => {
      const testData1 = { type: 'test1' };
      const testData2 = { type: 'test2' };

      wsManager.messageQueue.push(testData1, testData2);
      wsManager.connect();
      wsManager.processPendingMessages();

      expect(mockWebSocket.send).toHaveBeenCalledTimes(2);
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(testData1));
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(testData2));
      expect(wsManager.messageQueue).toHaveLength(0);
    });
  });

  describe('heartbeat', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('應該定期發送心跳', () => {
      wsManager.connect();
      wsManager.startHeartbeat();

      jest.advanceTimersByTime(30000);

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }));
    });

    test('心跳超時應該斷開連接', () => {
      wsManager.connect();
      wsManager.startHeartbeat();

      jest.advanceTimersByTime(30000); // 觸發心跳
      jest.advanceTimersByTime(5000); // 心跳超時

      expect(mockWebSocket.close).toHaveBeenCalled();
    });
  });

  describe('reconnect', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('應該在斷線後重連', () => {
      wsManager.connect();

      // 模擬連接成功
      if (mockWebSocket.onopen) mockWebSocket.onopen();

      // 模擬連接關閉並觸發重連
      if (mockWebSocket.onclose) mockWebSocket.onclose();

      jest.advanceTimersByTime(1000);

      // 驗證重連嘗試次數
      expect(wsManager.reconnectAttempts).toBe(1);
    });

    test('應該使用指數退避算法', () => {
      wsManager.connect();

      // 模擬連接成功
      if (mockWebSocket.onopen) mockWebSocket.onopen();

      // 第一次重連
      if (mockWebSocket.onclose) mockWebSocket.onclose();
      expect(wsManager.reconnectAttempts).toBe(1);

      jest.advanceTimersByTime(1000); // 1秒後重連

      // 模擬第二次斷線
      if (mockWebSocket.onclose) mockWebSocket.onclose();

      // 驗證重連次數增加
      expect(wsManager.reconnectAttempts).toBe(2);
    });

    test('達到最大重連次數後應該停止', () => {
      wsManager.maxReconnectAttempts = 2;
      wsManager.connect();

      // 觸發多次重連
      for (let i = 0; i < 3; i++) {
        mockWebSocket.onclose();
        jest.advanceTimersByTime(10000);
      }

      expect(wsManager.reconnectAttempts).toBe(2);
    });
  });

  describe('event handling', () => {
    test('應該註冊和觸發事件處理器', () => {
      const handler = jest.fn();
      wsManager.on('test', handler);

      wsManager.emit('test', { data: 'test' });

      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    test('應該移除事件處理器', () => {
      const handler = jest.fn();
      wsManager.on('test', handler);
      wsManager.off('test', handler);

      wsManager.emit('test', { data: 'test' });

      expect(handler).not.toHaveBeenCalled();
    });

    test('應該處理 pong 訊息', () => {
      wsManager.connect();
      wsManager.startHeartbeat();

      // 模擬接收 pong 訊息
      wsManager.handleMessage({ type: 'pong' });

      expect(wsManager.heartbeatTimeout).toBeNull();
    });
  });

  describe('network monitoring', () => {
    test('應該在網路恢復時重連', () => {
      wsManager.isOnline = false;

      // 模擬網路恢復
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);

      expect(wsManager.isOnline).toBe(true);
      expect(global.WebSocket).toHaveBeenCalled();
    });

    test('應該在網路斷開時斷線', () => {
      wsManager.connect();

      // 模擬網路斷開
      const offlineEvent = new Event('offline');
      window.dispatchEvent(offlineEvent);

      expect(wsManager.isOnline).toBe(false);
      expect(mockWebSocket.close).toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    test('應該返回正確的狀態信息', () => {
      wsManager.messageQueue.push({ test: 'data' });
      wsManager.reconnectAttempts = 2;

      const status = wsManager.getStatus();

      expect(status).toEqual({
        connected: false,
        connecting: false,
        reconnectAttempts: 2,
        queuedMessages: 1,
        online: true,
      });
    });
  });
});
