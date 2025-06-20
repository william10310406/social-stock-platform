// 前端單元測試設置
// 為 Jest 或其他測試框架提供基礎配置

// 模擬瀏覽器 API
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

global.sessionStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

// 模擬 fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  }),
);

// 模擬 WebSocket
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}));

// 模擬 Notification API
global.Notification = jest.fn(() => ({
  close: jest.fn(),
}));
global.Notification.permission = 'granted';
global.Notification.requestPermission = jest.fn(() => Promise.resolve('granted'));

// 模擬 DOM 方法
global.document = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  createElement: jest.fn(() => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn(),
    },
    style: {},
    innerHTML: '',
    textContent: '',
  })),
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  head: {
    appendChild: jest.fn(),
  },
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
};

global.window = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  location: {
    href: 'http://localhost:3000',
    pathname: '/',
    hostname: 'localhost',
    protocol: 'http:',
  },
  localStorage: global.localStorage,
  sessionStorage: global.sessionStorage,
  fetch: global.fetch,
  WebSocket: global.WebSocket,
  Notification: global.Notification,
};

// 清理函數，在每個測試後調用
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
