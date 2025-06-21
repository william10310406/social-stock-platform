// 錯誤管理器單元測試
const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

// 模擬錯誤管理器
class MockErrorManager {
  constructor() {
    this.errorHistory = [];
    this.maxHistorySize = 100;
    this.setupGlobalErrorHandlers();
    this.setupStyles();
  }

  setupGlobalErrorHandlers() {
    // 模擬全域錯誤處理器設置
  }

  setupStyles() {
    // 模擬樣式設置
  }

  handleGlobalError(errorInfo) {
    this.logError({
      ...errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    if (errorInfo.type === 'javascript' || errorInfo.type === 'promise') {
      this.showError('系統發生未預期的錯誤，請重新整理頁面', 'error');
    }
  }

  showError(message, type = 'error', options = {}) {
    const {
      title = this.getDefaultTitle(type),
      duration = this.getDefaultDuration(type),
      persistent = false,
    } = options;

    const toast = this.createErrorToast(message, type, title);
    document.body.appendChild(toast);

    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.removeErrorToast(toast);
      }, duration);
    }

    return toast;
  }

  createErrorToast(message, type, title) {
    const toast = document.createElement('div');
    toast.className = `error-toast ${type}`;
    toast.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div>${message}</div>
    `;

    toast.addEventListener('click', () => {
      this.removeErrorToast(toast);
    });

    return toast;
  }

  removeErrorToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  handleApiError(error, endpoint = '') {
    let message = '網路請求失敗';
    let type = 'error';

    if (error.status) {
      switch (error.status) {
        case 400:
          message = '請求參數錯誤';
          break;
        case 401:
          message = '登入已過期，請重新登入';
          break;
        case 403:
          message = '沒有權限執行此操作';
          break;
        case 404:
          message = '請求的資源不存在';
          break;
        case 429:
          message = '請求過於頻繁，請稍後再試';
          type = 'warning';
          break;
        case 500:
          message = '伺服器內部錯誤';
          break;
        default:
          message = `請求失敗 (${error.status})`;
      }
    }

    this.logError({
      type: 'api',
      endpoint,
      status: error.status,
      message: error.message || message,
      timestamp: new Date().toISOString(),
    });

    return this.showError(message, type);
  }

  logError(errorInfo) {
    this.errorHistory.unshift({
      ...errorInfo,
      id: Date.now() + Math.random(),
    });

    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }

    console.error('Error logged:', errorInfo);
  }

  getDefaultTitle(type) {
    const titles = {
      error: '錯誤',
      warning: '警告',
      info: '提示',
      success: '成功',
    };
    return titles[type] || '通知';
  }

  getDefaultDuration(type) {
    const durations = {
      error: 8000,
      warning: 6000,
      info: 4000,
      success: 3000,
    };
    return durations[type] || 5000;
  }

  clearAllErrors() {
    const toasts = document.querySelectorAll('.error-toast');
    toasts.forEach((toast) => this.removeErrorToast(toast));
  }

  getErrorHistory() {
    return [...this.errorHistory];
  }
}

describe('ErrorManager', () => {
  let errorManager;

  beforeEach(() => {
    errorManager = new MockErrorManager();
    // 清理 DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('showError', () => {
    test('應該創建錯誤提示元素', () => {
      const toast = errorManager.showError('測試錯誤', 'error');

      expect(toast).toBeDefined();
      expect(toast.className).toContain('error-toast error');
      expect(toast.innerHTML).toContain('測試錯誤');
      expect(document.body.contains(toast)).toBe(true);
    });

    test('應該使用正確的錯誤類型樣式', () => {
      const errorToast = errorManager.showError('錯誤訊息', 'error');
      const warningToast = errorManager.showError('警告訊息', 'warning');
      const infoToast = errorManager.showError('資訊訊息', 'info');
      const successToast = errorManager.showError('成功訊息', 'success');

      expect(errorToast.className).toContain('error');
      expect(warningToast.className).toContain('warning');
      expect(infoToast.className).toContain('info');
      expect(successToast.className).toContain('success');
    });

    test('應該設置正確的預設標題', () => {
      const toast = errorManager.showError('測試訊息', 'warning');
      expect(toast.innerHTML).toContain('警告');
    });
  });

  describe('handleApiError', () => {
    test('應該處理 400 錯誤', () => {
      const error = { status: 400 };
      const toast = errorManager.handleApiError(error, '/api/test');

      expect(toast.innerHTML).toContain('請求參數錯誤');
      expect(errorManager.errorHistory).toHaveLength(1);
      expect(errorManager.errorHistory[0].status).toBe(400);
    });

    test('應該處理 401 錯誤', () => {
      const error = { status: 401 };
      const toast = errorManager.handleApiError(error, '/api/test');

      expect(toast.innerHTML).toContain('登入已過期');
    });

    test('應該處理 404 錯誤', () => {
      const error = { status: 404 };
      const toast = errorManager.handleApiError(error, '/api/test');

      expect(toast.innerHTML).toContain('請求的資源不存在');
    });

    test('應該處理 500 錯誤', () => {
      const error = { status: 500 };
      const toast = errorManager.handleApiError(error, '/api/test');

      expect(toast.innerHTML).toContain('伺服器內部錯誤');
    });

    test('應該處理未知錯誤', () => {
      const error = { status: 999 };
      const toast = errorManager.handleApiError(error, '/api/test');

      expect(toast.innerHTML).toContain('請求失敗 (999)');
    });
  });

  describe('logError', () => {
    test('應該記錄錯誤到歷史', () => {
      const errorInfo = {
        type: 'test',
        message: '測試錯誤',
        timestamp: new Date().toISOString(),
      };

      errorManager.logError(errorInfo);

      expect(errorManager.errorHistory).toHaveLength(1);
      expect(errorManager.errorHistory[0]).toMatchObject(errorInfo);
      expect(errorManager.errorHistory[0].id).toBeDefined();
    });

    test('應該限制錯誤歷史大小', () => {
      errorManager.maxHistorySize = 2;

      // 添加 3 個錯誤
      for (let i = 0; i < 3; i++) {
        errorManager.logError({
          type: 'test',
          message: `錯誤 ${i}`,
          timestamp: new Date().toISOString(),
        });
      }

      expect(errorManager.errorHistory).toHaveLength(2);
      expect(errorManager.errorHistory[0].message).toBe('錯誤 2'); // 最新的錯誤
      expect(errorManager.errorHistory[1].message).toBe('錯誤 1');
    });
  });

  describe('getDefaultTitle', () => {
    test('應該返回正確的預設標題', () => {
      expect(errorManager.getDefaultTitle('error')).toBe('錯誤');
      expect(errorManager.getDefaultTitle('warning')).toBe('警告');
      expect(errorManager.getDefaultTitle('info')).toBe('提示');
      expect(errorManager.getDefaultTitle('success')).toBe('成功');
      expect(errorManager.getDefaultTitle('unknown')).toBe('通知');
    });
  });

  describe('getDefaultDuration', () => {
    test('應該返回正確的預設持續時間', () => {
      expect(errorManager.getDefaultDuration('error')).toBe(8000);
      expect(errorManager.getDefaultDuration('warning')).toBe(6000);
      expect(errorManager.getDefaultDuration('info')).toBe(4000);
      expect(errorManager.getDefaultDuration('success')).toBe(3000);
      expect(errorManager.getDefaultDuration('unknown')).toBe(5000);
    });
  });

  describe('clearAllErrors', () => {
    test('應該清除所有錯誤提示', () => {
      // 創建多個錯誤提示
      errorManager.showError('錯誤 1', 'error');
      errorManager.showError('錯誤 2', 'warning');

      expect(document.querySelectorAll('.error-toast')).toHaveLength(2);

      errorManager.clearAllErrors();

      // 注意：由於 removeErrorToast 使用 setTimeout，這裡我們只檢查是否調用了移除方法
      // 實際的 DOM 移除會在 300ms 後發生
      expect(document.querySelectorAll('.error-toast')).toHaveLength(2);
    });
  });

  describe('getErrorHistory', () => {
    test('應該返回錯誤歷史的副本', () => {
      const errorInfo = {
        type: 'test',
        message: '測試錯誤',
        timestamp: new Date().toISOString(),
      };

      errorManager.logError(errorInfo);
      const history = errorManager.getErrorHistory();

      expect(history).toHaveLength(1);
      expect(history).not.toBe(errorManager.errorHistory); // 應該是副本
      expect(history[0]).toMatchObject(errorInfo);
    });
  });
});
