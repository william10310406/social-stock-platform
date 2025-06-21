// 錯誤管理器
// 統一處理和顯示應用中的各種錯誤

class ErrorManager {
  constructor() {
    this.errorHistory = [];
    this.maxHistorySize = 100;
    this.setupGlobalErrorHandlers();
    this.setupStyles();
  }

  // 設置全域錯誤處理器
  setupGlobalErrorHandlers() {
    // 捕獲未處理的 JavaScript 錯誤
    window.addEventListener('error', (event) => {
      this.handleGlobalError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    // 捕獲未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', (event) => {
      this.handleGlobalError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        error: event.reason,
      });
    });
  }

  // 處理全域錯誤
  handleGlobalError(errorInfo) {
    console.error('Global error caught:', errorInfo);
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

  // 設置錯誤顯示樣式
  setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .error-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
      }

      .error-toast.show {
        transform: translateX(0);
      }

      .error-toast.error {
        background: #fee;
        border-left: 4px solid #dc2626;
        color: #991b1b;
      }

      .error-toast.warning {
        background: #fffbeb;
        border-left: 4px solid #f59e0b;
        color: #92400e;
      }

      .error-toast.info {
        background: #eff6ff;
        border-left: 4px solid #3b82f6;
        color: #1e40af;
      }

      .error-toast.success {
        background: #f0fdf4;
        border-left: 4px solid #10b981;
        color: #047857;
      }
    `;
    document.head.appendChild(style);
  }

  // 顯示錯誤訊息
  showError(message, type = 'error', options = {}) {
    const {
      title = this.getDefaultTitle(type),
      duration = this.getDefaultDuration(type),
      persistent = false,
    } = options;

    const toast = this.createErrorToast(message, type, title);
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.removeErrorToast(toast);
      }, duration);
    }

    return toast;
  }

  // 創建錯誤提示元素
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

  // 移除錯誤提示
  removeErrorToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  // 處理 API 錯誤
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

  // 記錄錯誤
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

  // 獲取預設標題
  getDefaultTitle(type) {
    const titles = {
      error: '錯誤',
      warning: '警告',
      info: '提示',
      success: '成功',
    };
    return titles[type] || '通知';
  }

  // 獲取預設持續時間
  getDefaultDuration(type) {
    const durations = {
      error: 8000,
      warning: 6000,
      info: 4000,
      success: 3000,
    };
    return durations[type] || 5000;
  }

  // 清除所有錯誤提示
  clearAllErrors() {
    const toasts = document.querySelectorAll('.error-toast');
    toasts.forEach((toast) => this.removeErrorToast(toast));
  }

  // 獲取錯誤歷史
  getErrorHistory() {
    return [...this.errorHistory];
  }
}

// 全域錯誤管理器實例
window.errorManager = new ErrorManager();

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorManager;
}
