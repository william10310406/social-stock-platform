// 加載狀態管理器
// 提供統一的加載指示器、骨架屏和錯誤處理

class LoadingManager {
  constructor() {
    this.activeLoaders = new Set();
    this.setupStyles();
  }

  // 設置加載器樣式
  setupStyles() {
    if (document.getElementById('loading-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'loading-styles';
    styles.textContent = `
      /* 加載指示器樣式 */
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(2px);
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid #4f46e5;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-dots {
        display: flex;
        space-x: 2px;
      }

      .loading-dot {
        width: 8px;
        height: 8px;
        background: #4f46e5;
        border-radius: 50%;
        animation: bounce 1.4s ease-in-out infinite both;
      }

      .loading-dot:nth-child(1) { animation-delay: -0.32s; }
      .loading-dot:nth-child(2) { animation-delay: -0.16s; }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      /* 骨架屏樣式 */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }

      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .skeleton-text {
        height: 1rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }

      .skeleton-text.w-full { width: 100%; }
      .skeleton-text.w-3/4 { width: 75%; }
      .skeleton-text.w-1/2 { width: 50%; }
      .skeleton-text.w-1/4 { width: 25%; }

      .skeleton-avatar {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
      }

      .skeleton-card {
        height: 200px;
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      /* 錯誤狀態樣式 */
      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
      }

      .error-icon {
        width: 4rem;
        height: 4rem;
        color: #ef4444;
        margin-bottom: 1rem;
      }

      .retry-button {
        background: #4f46e5;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        margin-top: 1rem;
        transition: background-color 0.2s;
      }

      .retry-button:hover {
        background: #4338ca;
      }
    `;

    document.head.appendChild(styles);
  }

  // 顯示全屏加載器
  showLoader(message = '載入中...', id = 'global') {
    this.hideLoader(id); // 移除現有的加載器

    const loader = document.createElement('div');
    loader.id = `loader-${id}`;
    loader.className = 'loading-overlay';
    loader.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-gray-600">${message}</p>
      </div>
    `;

    document.body.appendChild(loader);
    this.activeLoaders.add(id);

    return loader;
  }

  // 隱藏加載器
  hideLoader(id = 'global') {
    const loader = document.getElementById(`loader-${id}`);
    if (loader) {
      loader.remove();
      this.activeLoaders.delete(id);
    }
  }

  // 顯示內聯加載器
  showInlineLoader(container, message = '載入中...') {
    if (typeof container === 'string') {
      container = document.getElementById(container) || document.querySelector(container);
    }

    if (!container) return;

    container.innerHTML = `
      <div class="flex items-center justify-center py-8">
        <div class="loading-dots mr-3">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
        <span class="text-gray-600">${message}</span>
      </div>
    `;
  }

  // 顯示骨架屏
  showSkeleton(container, type = 'default') {
    if (typeof container === 'string') {
      container = document.getElementById(container) || document.querySelector(container);
    }

    if (!container) return;

    let skeletonHTML = '';

    switch (type) {
      case 'posts':
        skeletonHTML = this.getPostsSkeleton();
        break;
      case 'profile':
        skeletonHTML = this.getProfileSkeleton();
        break;
      case 'chat':
        skeletonHTML = this.getChatSkeleton();
        break;
      case 'cards':
        skeletonHTML = this.getCardsSkeleton();
        break;
      default:
        skeletonHTML = this.getDefaultSkeleton();
    }

    container.innerHTML = skeletonHTML;
  }

  // 默認骨架屏
  getDefaultSkeleton() {
    return `
      <div class="space-y-4">
        ${Array(3)
          .fill()
          .map(
            () => `
          <div class="skeleton skeleton-text w-full"></div>
          <div class="skeleton skeleton-text w-3/4"></div>
          <div class="skeleton skeleton-text w-1/2"></div>
        `,
          )
          .join('')}
      </div>
    `;
  }

  // 文章列表骨架屏
  getPostsSkeleton() {
    return `
      <div class="space-y-6">
        ${Array(3)
          .fill()
          .map(
            () => `
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-start space-x-4">
              <div class="skeleton skeleton-avatar"></div>
              <div class="flex-1">
                <div class="skeleton skeleton-text w-1/4 mb-2"></div>
                <div class="skeleton skeleton-text w-full"></div>
                <div class="skeleton skeleton-text w-3/4"></div>
                <div class="skeleton skeleton-text w-1/2"></div>
              </div>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  }

  // 個人資料骨架屏
  getProfileSkeleton() {
    return `
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center space-x-4 mb-6">
          <div class="skeleton skeleton-avatar w-16 h-16"></div>
          <div class="flex-1">
            <div class="skeleton skeleton-text w-1/3 mb-2"></div>
            <div class="skeleton skeleton-text w-1/2"></div>
          </div>
        </div>
        <div class="space-y-3">
          <div class="skeleton skeleton-text w-full"></div>
          <div class="skeleton skeleton-text w-3/4"></div>
          <div class="skeleton skeleton-text w-1/2"></div>
        </div>
      </div>
    `;
  }

  // 聊天骨架屏
  getChatSkeleton() {
    return `
      <div class="space-y-4">
        ${Array(5)
          .fill()
          .map(
            (_, index) => `
          <div class="flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}">
            <div class="skeleton skeleton-text ${index % 2 === 0 ? 'w-1/2' : 'w-1/3'} h-12 rounded-lg"></div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  }

  // 卡片骨架屏
  getCardsSkeleton() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${Array(6)
          .fill()
          .map(
            () => `
          <div class="skeleton skeleton-card"></div>
        `,
          )
          .join('')}
      </div>
    `;
  }

  // 顯示錯誤狀態
  showError(container, message = '載入失敗', retryCallback = null) {
    if (typeof container === 'string') {
      container = document.getElementById(container) || document.querySelector(container);
    }

    if (!container) return;

    const retryButton = retryCallback
      ? `
      <button class="retry-button" onclick="(${retryCallback.toString()})()">
        重試
      </button>
    `
      : '';

    container.innerHTML = `
      <div class="error-container">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z">
          </path>
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">載入失敗</h3>
        <p class="text-gray-600 mb-4">${message}</p>
        ${retryButton}
      </div>
    `;
  }

  // 顯示空狀態
  showEmpty(container, message = '暫無數據', actionText = null, actionCallback = null) {
    if (typeof container === 'string') {
      container = document.getElementById(container) || document.querySelector(container);
    }

    if (!container) return;

    const actionButton =
      actionText && actionCallback
        ? `
      <button class="retry-button" onclick="(${actionCallback.toString()})()">
        ${actionText}
      </button>
    `
        : '';

    container.innerHTML = `
      <div class="error-container">
        <svg class="error-icon text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4">
          </path>
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">沒有內容</h3>
        <p class="text-gray-600 mb-4">${message}</p>
        ${actionButton}
      </div>
    `;
  }

  // 包裝 Promise 以自動處理加載狀態
  async wrapPromise(promise, loaderId = 'global', message = '載入中...') {
    try {
      this.showLoader(message, loaderId);
      const result = await promise;
      this.hideLoader(loaderId);
      return result;
    } catch (error) {
      this.hideLoader(loaderId);
      throw error;
    }
  }

  // 包裝容器的 Promise 處理
  async wrapContainerPromise(container, promise, options = {}) {
    const {
      skeletonType = 'default',
      errorMessage = '載入失敗',
      emptyMessage = '暫無數據',
      retryCallback = null,
    } = options;

    try {
      this.showSkeleton(container, skeletonType);
      const result = await promise;

      // 檢查結果是否為空
      if (Array.isArray(result) && result.length === 0) {
        this.showEmpty(container, emptyMessage);
      }

      return result;
    } catch (error) {
      this.showError(container, errorMessage, retryCallback);
      throw error;
    }
  }

  // 清理所有加載器
  clearAll() {
    this.activeLoaders.forEach((id) => this.hideLoader(id));
    this.activeLoaders.clear();
  }
}

// 全域加載管理器實例
window.loadingManager = new LoadingManager();

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingManager;
}
