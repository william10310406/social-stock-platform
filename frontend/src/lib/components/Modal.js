/**
 * Modal 組件 - 統一的模態框組件
 * 取代分散在各頁面的模態框邏輯
 */

class Modal {
  constructor(options = {}) {
    this.options = {
      id: options.id || `modal-${Date.now()}`,
      closable: options.closable !== false,
      backdrop: options.backdrop !== false,
      className: options.className || '',
      size: options.size || 'default', // small, default, large, xl
      centered: options.centered !== false,
      scrollable: options.scrollable !== false,
      ...options,
    };

    this.element = null;
    this.isOpen = false;
    this.onClose = options.onClose;
    this.onOpen = options.onOpen;

    this.init();
  }

  init() {
    this.setupStyles();
    this.create();
  }

  setupStyles() {
    if (document.getElementById('modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
        padding: 16px;
      }

      .modal-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      .modal-dialog {
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
        max-height: 90vh;
        width: 100%;
        position: relative;
        transform: scale(0.9) translateY(-20px);
        transition: transform 0.3s ease-in-out;
      }

      .modal-overlay.show .modal-dialog {
        transform: scale(1) translateY(0);
      }

      .modal-dialog.modal-sm {
        max-width: 400px;
      }

      .modal-dialog.modal-default {
        max-width: 600px;
      }

      .modal-dialog.modal-lg {
        max-width: 800px;
      }

      .modal-dialog.modal-xl {
        max-width: 1200px;
      }

      .modal-dialog.modal-scrollable {
        max-height: 90vh;
        display: flex;
        flex-direction: column;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
        flex-shrink: 0;
      }

      .modal-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }

      .modal-close {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
      }

      .modal-close:hover {
        color: #374151;
        background-color: #f3f4f6;
      }

      .modal-close:focus {
        outline: none;
        color: #374151;
        background-color: #f3f4f6;
      }

      .modal-body {
        padding: 24px;
        flex: 1;
        overflow-y: auto;
      }

      .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        flex-shrink: 0;
      }

      .modal-scrollable .modal-body {
        overflow-y: auto;
      }

      @media (max-width: 640px) {
        .modal-overlay {
          padding: 8px;
        }

        .modal-dialog {
          max-height: 95vh;
        }

        .modal-header,
        .modal-body {
          padding: 16px;
        }

        .modal-footer {
          padding: 12px 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  create() {
    this.element = document.createElement('div');
    this.element.id = this.options.id;
    this.element.className = `modal-overlay ${this.options.className}`;
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');

    const sizeClass = `modal-${this.options.size}`;
    const scrollableClass = this.options.scrollable ? 'modal-scrollable' : '';

    this.element.innerHTML = `
      <div class="modal-dialog ${sizeClass} ${scrollableClass}">
        ${
          this.options.closable
            ? `
          <div class="modal-header">
            <h3 class="modal-title"></h3>
            <button class="modal-close" aria-label="關閉">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        `
            : ''
        }
        <div class="modal-body"></div>
        <div class="modal-footer" style="display: none;"></div>
      </div>
    `;

    // 事件監聽
    this.setupEventListeners();

    // 添加到 DOM
    document.body.appendChild(this.element);

    return this.element;
  }

  setupEventListeners() {
    // 背景點擊關閉
    if (this.options.backdrop) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.close();
        }
      });
    }

    // 關閉按鈕
    if (this.options.closable) {
      const closeBtn = this.element.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
    }

    // ESC 鍵關閉
    this.handleEscKey = (e) => {
      if (e.key === 'Escape' && this.isOpen && this.options.closable) {
        this.close();
      }
    };
  }

  /**
   * 打開模態框
   * @param {Object} content - 內容配置
   */
  open(content = {}) {
    if (this.isOpen) return;

    // 設置內容
    if (content.title) {
      this.setTitle(content.title);
    }

    if (content.body) {
      this.setBody(content.body);
    }

    if (content.footer) {
      this.setFooter(content.footer);
    }

    // 顯示模態框
    this.element.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // 觸發顯示動畫
    requestAnimationFrame(() => {
      this.element.classList.add('show');
    });

    // 設置焦點
    this.setFocus();

    // 添加 ESC 監聽
    document.addEventListener('keydown', this.handleEscKey);

    this.isOpen = true;

    // 回調
    if (this.onOpen) {
      this.onOpen(this);
    }

    return this;
  }

  /**
   * 關閉模態框
   */
  close() {
    if (!this.isOpen) return;

    this.element.classList.remove('show');

    setTimeout(() => {
      this.element.style.display = 'none';
      document.body.style.overflow = '';

      // 移除 ESC 監聽
      document.removeEventListener('keydown', this.handleEscKey);

      this.isOpen = false;

      // 回調
      if (this.onClose) {
        this.onClose(this);
      }
    }, 300);

    return this;
  }

  /**
   * 設置標題
   */
  setTitle(title) {
    const titleElement = this.element.querySelector('.modal-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
    return this;
  }

  /**
   * 設置內容
   */
  setBody(content) {
    const bodyElement = this.element.querySelector('.modal-body');
    if (bodyElement) {
      if (typeof content === 'string') {
        bodyElement.innerHTML = content;
      } else if (content instanceof Element) {
        bodyElement.innerHTML = '';
        bodyElement.appendChild(content);
      }
    }
    return this;
  }

  /**
   * 設置底部
   */
  setFooter(content) {
    const footerElement = this.element.querySelector('.modal-footer');
    if (footerElement) {
      if (content) {
        footerElement.style.display = 'flex';
        if (typeof content === 'string') {
          footerElement.innerHTML = content;
        } else if (content instanceof Element) {
          footerElement.innerHTML = '';
          footerElement.appendChild(content);
        }
      } else {
        footerElement.style.display = 'none';
      }
    }
    return this;
  }

  /**
   * 設置載入狀態
   */
  setLoading(message = '載入中...') {
    this.setBody(`
      <div class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">${message}</p>
      </div>
    `);
    return this;
  }

  /**
   * 設置錯誤狀態
   */
  setError(message = '載入失敗') {
    this.setBody(`
      <div class="text-center py-8">
        <div class="text-red-600 text-4xl mb-4">⚠️</div>
        <p class="text-red-600">${message}</p>
      </div>
    `);
    return this;
  }

  /**
   * 設置焦點
   */
  setFocus() {
    const firstFocusable = this.element.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  /**
   * 銷毀模態框
   */
  destroy() {
    if (this.isOpen) {
      this.close();
    }

    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 300);
  }

  /**
   * 靜態方法：快速創建確認對話框
   */
  static confirm(options = {}) {
    const {
      title = '確認',
      message = '確定要執行此操作嗎？',
      confirmText = '確定',
      cancelText = '取消',
      onConfirm,
      onCancel,
    } = options;

    const modal = new Modal({
      size: 'small',
      onClose: onCancel,
    });

    const footer = document.createElement('div');
    footer.className = 'flex gap-3';
    footer.innerHTML = `
      <button class="btn-cancel px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
        ${cancelText}
      </button>
      <button class="btn-confirm px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
        ${confirmText}
      </button>
    `;

    footer.querySelector('.btn-cancel').addEventListener('click', () => {
      modal.close();
      if (onCancel) onCancel();
    });

    footer.querySelector('.btn-confirm').addEventListener('click', () => {
      modal.close();
      if (onConfirm) onConfirm();
    });

    modal.open({
      title,
      body: `<p class="text-gray-700">${message}</p>`,
      footer,
    });

    return modal;
  }

  /**
   * 靜態方法：快速創建提示對話框
   */
  static alert(options = {}) {
    const { title = '提示', message = '', buttonText = '確定', onClose } = options;

    const modal = new Modal({
      size: 'small',
      onClose,
    });

    const footer = document.createElement('div');
    footer.innerHTML = `
      <button class="btn-ok px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
        ${buttonText}
      </button>
    `;

    footer.querySelector('.btn-ok').addEventListener('click', () => {
      modal.close();
      if (onClose) onClose();
    });

    modal.open({
      title,
      body: `<p class="text-gray-700">${message}</p>`,
      footer,
    });

    return modal;
  }
}

// 全局暴露
window.Modal = Modal;

// ES6 模組導出
export default Modal;
export { Modal };
