/**
 * Toast 組件 - 統一的提示訊息組件
 * 取代 errorManager.js 和 pwa.js 中分散的 Toast 實現
 */

class Toast {
  constructor() {
    this.activeToasts = new Set();
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;

    this.setupStyles();
    this.initialized = true;
  }

  setupStyles() {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 320px;
        max-width: 500px;
        margin-bottom: 12px;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        pointer-events: auto;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
        opacity: 0;
      }

      .toast.show {
        transform: translateX(0);
        opacity: 1;
      }

      .toast.error {
        background: #fee;
        border-left: 4px solid #dc2626;
        color: #991b1b;
      }

      .toast.warning {
        background: #fffbeb;
        border-left: 4px solid #f59e0b;
        color: #92400e;
      }

      .toast.info {
        background: #eff6ff;
        border-left: 4px solid #3b82f6;
        color: #1e40af;
      }

      .toast.success {
        background: #f0fdf4;
        border-left: 4px solid #10b981;
        color: #047857;
      }

      .toast-content {
        flex: 1;
      }

      .toast-title {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .toast-message {
        font-weight: 400;
      }

      .toast-close {
        margin-left: 12px;
        background: none;
        border: none;
        color: currentColor;
        opacity: 0.7;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-close:hover {
        opacity: 1;
      }

      .toast-close:focus {
        outline: none;
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * 顯示 Toast 訊息
   * @param {string} message - 訊息內容
   * @param {string} type - 類型 (success, error, warning, info)
   * @param {Object} options - 選項
   */
  show(message, type = 'info', options = {}) {
    const {
      title,
      duration = this.getDefaultDuration(type),
      persistent = false,
      onClick,
      onClose,
    } = options;

    const toast = this.createToast(message, type, title, { onClick, onClose });
    const container = this.getContainer();

    container.appendChild(toast);
    this.activeToasts.add(toast);

    // 顯示動畫
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 自動移除
    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  createToast(message, type, title, { onClick, onClose }) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const titleHtml = title ? `<div class="toast-title">${title}</div>` : '';

    toast.innerHTML = `
      <div class="toast-content">
        ${titleHtml}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="關閉">✕</button>
    `;

    // 點擊事件
    if (onClick) {
      toast.addEventListener('click', (e) => {
        if (!e.target.classList.contains('toast-close')) {
          onClick(toast);
        }
      });
      toast.style.cursor = 'pointer';
    }

    // 關閉按鈕
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.remove(toast);
      if (onClose) onClose(toast);
    });

    return toast;
  }

  remove(toast) {
    if (!toast || !toast.parentNode) return;

    toast.classList.remove('show');
    this.activeToasts.delete(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * 快捷方法
   */
  success(message, options = {}) {
    return this.show(message, 'success', { title: '成功', ...options });
  }

  error(message, options = {}) {
    return this.show(message, 'error', { title: '錯誤', ...options });
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', { title: '警告', ...options });
  }

  info(message, options = {}) {
    return this.show(message, 'info', { title: '提示', ...options });
  }

  getDefaultDuration(type) {
    switch (type) {
      case 'error':
        return 8000;
      case 'warning':
        return 6000;
      case 'success':
        return 4000;
      case 'info':
      default:
        return 5000;
    }
  }

  /**
   * 清除所有 Toast
   */
  clearAll() {
    this.activeToasts.forEach((toast) => this.remove(toast));
  }
}

// 創建全局實例
const toast = new Toast();

// 全局暴露
window.toast = toast;
window.Toast = Toast;

// ES6 模組導出
export default toast;
export { Toast };
