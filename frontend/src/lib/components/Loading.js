/**
 * Loading 組件 - 統一的載入狀態組件
 * 取代 loadingManager.js 中分散的載入邏輯
 */

class Loading {
  constructor() {
    this.activeLoaders = new Map();
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;

    this.setupStyles();
    this.initialized = true;
  }

  setupStyles() {
    if (document.getElementById('loading-styles')) return;

    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
      }

      .loading-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: loading-spin 1s linear infinite;
      }

      .loading-dots {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .loading-dot {
        width: 8px;
        height: 8px;
        background-color: #3b82f6;
        border-radius: 50%;
        animation: loading-pulse 1.4s ease-in-out infinite both;
      }

      .loading-dot:nth-child(1) { animation-delay: -0.32s; }
      .loading-dot:nth-child(2) { animation-delay: -0.16s; }
      .loading-dot:nth-child(3) { animation-delay: 0s; }

      .loading-bar {
        width: 200px;
        height: 4px;
        background-color: #f3f4f6;
        border-radius: 2px;
        overflow: hidden;
        position: relative;
      }

      .loading-bar-fill {
        height: 100%;
        background-color: #3b82f6;
        border-radius: 2px;
        animation: loading-progress 2s ease-in-out infinite;
      }

      .loading-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading-skeleton 1.5s infinite;
        border-radius: 4px;
      }

      .skeleton-text {
        height: 16px;
        margin-bottom: 8px;
      }

      .skeleton-title {
        height: 24px;
        margin-bottom: 12px;
      }

      .skeleton-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .skeleton-card {
        height: 120px;
        border-radius: 8px;
      }

      @keyframes loading-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes loading-pulse {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      @keyframes loading-progress {
        0% {
          transform: translateX(-100%);
        }
        50% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      @keyframes loading-skeleton {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }

      .loading-inline {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .loading-inline .loading-spinner {
        width: 16px;
        height: 16px;
        border-width: 2px;
      }

      .loading-container {
        padding: 24px;
        text-align: center;
      }

      .loading-message {
        margin-top: 16px;
        color: #6b7280;
        font-size: 14px;
      }

      .error-container {
        padding: 24px;
        text-align: center;
      }

      .error-icon {
        width: 48px;
        height: 48px;
        color: #ef4444;
        margin: 0 auto 16px;
      }

      .retry-button {
        margin-top: 16px;
        padding: 8px 16px;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
      }

      .retry-button:hover {
        background-color: #2563eb;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 顯示全屏載入器
   * @param {string} message - 載入訊息
   * @param {string} id - 載入器ID
   * @param {string} type - 載入器類型 (spinner, dots, bar)
   */
  showFullscreen(message = '載入中...', id = 'global', type = 'spinner') {
    this.hideFullscreen(id); // 移除現有的載入器

    const overlay = document.createElement('div');
    overlay.id = `loading-overlay-${id}`;
    overlay.className = 'loading-overlay';

    const content = this.createLoadingContent(message, type);
    overlay.appendChild(content);

    document.body.appendChild(overlay);
    this.activeLoaders.set(id, overlay);

    // 顯示動畫
    requestAnimationFrame(() => {
      overlay.classList.add('show');
    });

    return overlay;
  }

  /**
   * 隱藏全屏載入器
   * @param {string} id - 載入器ID
   */
  hideFullscreen(id = 'global') {
    const overlay = this.activeLoaders.get(id);
    if (!overlay) return;

    overlay.classList.remove('show');
    this.activeLoaders.delete(id);

    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }

  /**
   * 顯示容器載入狀態
   * @param {Element|string} container - 容器元素或選擇器
   * @param {string} type - 載入類型 (spinner, skeleton)
   * @param {string} message - 載入訊息
   */
  showInContainer(container, type = 'spinner', message = '載入中...') {
    if (typeof container === 'string') {
      container = document.getElementById(container) || document.querySelector(container);
    }

    if (!container) return;

    // 保存原始內容
    if (!container.dataset.originalContent) {
      container.dataset.originalContent = container.innerHTML;
    }

    let content;
    if (type === 'skeleton') {
      content = this.createSkeletonContent();
    } else {
      content = this.createLoadingContent(message, type);
      content.className = 'loading-container';
    }

    container.innerHTML = '';
    container.appendChild(content);

    return container;
  }

  /**
   * 隱藏容器載入狀態
   * @param {Element|string} container - 容器元素或選擇器
   */
  hideInContainer(container) {
    if (typeof container === 'string') {
      container = document.getElementById(container) || document.querySelector(container);
    }

    if (!container) return;

    // 恢復原始內容
    if (container.dataset.originalContent) {
      container.innerHTML = container.dataset.originalContent;
      delete container.dataset.originalContent;
    }

    return container;
  }

  /**
   * 顯示內聯載入狀態
   * @param {string} message - 載入訊息
   * @param {string} type - 載入類型
   */
  showInline(message = '載入中...', type = 'spinner') {
    const wrapper = document.createElement('span');
    wrapper.className = 'loading-inline';

    const icon = this.createLoadingIcon(type);
    const text = document.createElement('span');
    text.textContent = message;

    wrapper.appendChild(icon);
    wrapper.appendChild(text);

    return wrapper;
  }

  /**
   * 創建載入內容
   * @param {string} message - 載入訊息
   * @param {string} type - 載入類型
   */
  createLoadingContent(message, type = 'spinner') {
    const container = document.createElement('div');
    container.className = 'loading-container';

    const icon = this.createLoadingIcon(type);
    const messageElement = document.createElement('p');
    messageElement.className = 'loading-message';
    messageElement.textContent = message;

    container.appendChild(icon);
    container.appendChild(messageElement);

    return container;
  }

  /**
   * 創建載入圖標
   * @param {string} type - 圖標類型
   */
  createLoadingIcon(type) {
    const wrapper = document.createElement('div');

    switch (type) {
      case 'dots':
        wrapper.className = 'loading-dots';
        wrapper.innerHTML = `
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        `;
        break;
      case 'bar':
        wrapper.className = 'loading-bar';
        wrapper.innerHTML = '<div class="loading-bar-fill"></div>';
        break;
      case 'spinner':
      default:
        wrapper.className = 'loading-spinner';
        break;
    }

    return wrapper;
  }

  /**
   * 創建骨架屏內容
   * @param {Object} options - 選項
   */
  createSkeletonContent(options = {}) {
    const { lines = 3, avatar = false, title = false, card = false } = options;

    const container = document.createElement('div');
    container.className = 'space-y-4';

    if (avatar) {
      const avatarEl = document.createElement('div');
      avatarEl.className = 'loading-skeleton skeleton-avatar';
      container.appendChild(avatarEl);
    }

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'loading-skeleton skeleton-title';
      container.appendChild(titleEl);
    }

    if (card) {
      const cardEl = document.createElement('div');
      cardEl.className = 'loading-skeleton skeleton-card';
      container.appendChild(cardEl);
    } else {
      for (let i = 0; i < lines; i++) {
        const line = document.createElement('div');
        line.className = 'loading-skeleton skeleton-text';

        // 隨機寬度讓骨架屏更自然
        const widths = ['w-full', 'w-3/4', 'w-1/2', 'w-2/3'];
        line.classList.add(widths[i % widths.length]);

        container.appendChild(line);
      }
    }

    return container;
  }

  /**
   * 顯示錯誤狀態
   * @param {Element|string} container - 容器
   * @param {string} message - 錯誤訊息
   * @param {Function} retryCallback - 重試回調
   */
  showError(container, message = '載入失敗', retryCallback = null) {
    if (typeof container === 'string') {
      container = document.getElementById(container) || document.querySelector(container);
    }

    if (!container) return;

    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';

    const retryButton = retryCallback
      ? `<button class="retry-button" onclick="(${retryCallback.toString()})()">重試</button>`
      : '';

    errorContainer.innerHTML = `
      <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z">
        </path>
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">載入失敗</h3>
      <p class="text-gray-600 mb-4">${message}</p>
      ${retryButton}
    `;

    container.innerHTML = '';
    container.appendChild(errorContainer);

    return container;
  }

  /**
   * 清除所有載入器
   */
  clearAll() {
    this.activeLoaders.forEach((overlay, id) => {
      this.hideFullscreen(id);
    });
  }

  /**
   * 靜態方法：快速顯示全屏載入
   */
  static show(message, type) {
    if (!window.loading) {
      window.loading = new Loading();
    }
    return window.loading.showFullscreen(message, 'static', type);
  }

  /**
   * 靜態方法：快速隱藏全屏載入
   */
  static hide() {
    if (window.loading) {
      window.loading.hideFullscreen('static');
    }
  }
}

// 創建全局實例
const loading = new Loading();

// 全局暴露
window.loading = loading;
window.Loading = Loading;

// ES6 模組導出
export default loading;
export { Loading };
