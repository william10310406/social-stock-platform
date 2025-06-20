// PWA 工具函數
// 處理 Service Worker 註冊、安裝提示和推送通知

class PWAManager {
  constructor() {
    this.swRegistration = null;
    this.deferredPrompt = null;
    this.isInstalled = false;

    this.init();
  }

  // 初始化 PWA 功能
  async init() {
    await this.registerServiceWorker();
    this.setupInstallPrompt();
    this.checkInstallation();
    this.setupNotifications();
    this.setupUpdateCheck();
  }

  // 註冊 Service Worker
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker 不支援');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker 註冊成功:', this.swRegistration.scope);

      // 監聽 Service Worker 更新
      this.swRegistration.addEventListener('updatefound', () => {
        console.log('Service Worker 更新中...');
        this.showUpdateNotification();
      });
    } catch (error) {
      console.error('Service Worker 註冊失敗:', error);
    }
  }

  // 設置安裝提示
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA 安裝提示已準備');

      // 阻止默認的安裝提示
      e.preventDefault();
      this.deferredPrompt = e;

      // 顯示自定義安裝按鈕
      this.showInstallButton();
    });

    // 監聽應用安裝事件
    window.addEventListener('appinstalled', () => {
      console.log('PWA 已安裝');
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstallSuccessMessage();
    });
  }

  // 檢查是否已安裝
  checkInstallation() {
    // 檢查是否在獨立模式運行（已安裝）
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      this.isInstalled = true;
      console.log('PWA 已安裝並在獨立模式運行');
    }
  }

  // 顯示安裝按鈕
  showInstallButton() {
    const installContainer =
      document.getElementById('install-container') || this.createInstallContainer();

    if (installContainer && !this.isInstalled) {
      installContainer.style.display = 'block';
    }
  }

  // 創建安裝容器
  createInstallContainer() {
    const container = document.createElement('div');
    container.id = 'install-container';
    container.className =
      'fixed bottom-4 right-4 z-50 bg-indigo-600 text-white p-4 rounded-lg shadow-lg max-w-sm';
    container.style.display = 'none';

    container.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold mb-1">安裝應用程式</h4>
          <p class="text-sm opacity-90">安裝到您的裝置以獲得更好的體驗</p>
        </div>
        <div class="ml-4 flex space-x-2">
          <button id="install-button" class="bg-white text-indigo-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">
            安裝
          </button>
          <button id="install-dismiss" class="text-white opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // 綁定事件
    document.getElementById('install-button').addEventListener('click', () => {
      this.promptInstall();
    });

    document.getElementById('install-dismiss').addEventListener('click', () => {
      this.hideInstallButton();
    });

    return container;
  }

  // 隱藏安裝按鈕
  hideInstallButton() {
    const installContainer = document.getElementById('install-container');
    if (installContainer) {
      installContainer.style.display = 'none';
    }
  }

  // 提示安裝
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('安裝提示不可用');
      return;
    }

    try {
      // 顯示安裝提示
      this.deferredPrompt.prompt();

      // 等待用戶回應
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('用戶接受安裝');
      } else {
        console.log('用戶拒絕安裝');
      }

      this.deferredPrompt = null;
      this.hideInstallButton();
    } catch (error) {
      console.error('安裝過程出錯:', error);
    }
  }

  // 顯示安裝成功訊息
  showInstallSuccessMessage() {
    this.showToast('應用程式安裝成功！', 'success');
  }

  // 設置推送通知
  async setupNotifications() {
    if (!('Notification' in window) || !this.swRegistration) {
      console.log('推送通知不支援');
      return;
    }

    // 檢查通知權限
    if (Notification.permission === 'default') {
      // 延遲請求通知權限，避免打擾用戶
      setTimeout(() => {
        this.showNotificationPermissionPrompt();
      }, 30000); // 30秒後提示
    }
  }

  // 顯示通知權限提示
  showNotificationPermissionPrompt() {
    const notifContainer = this.createNotificationContainer();
    document.body.appendChild(notifContainer);
  }

  // 創建通知權限容器
  createNotificationContainer() {
    const container = document.createElement('div');
    container.className =
      'fixed top-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm';

    container.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold mb-1">啟用通知</h4>
          <p class="text-sm opacity-90">接收重要更新和新消息提醒</p>
        </div>
        <div class="ml-4 flex space-x-2">
          <button id="enable-notifications" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">
            啟用
          </button>
          <button id="dismiss-notifications" class="text-white opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      </div>
    `;

    // 綁定事件
    container.querySelector('#enable-notifications').addEventListener('click', () => {
      this.requestNotificationPermission();
      container.remove();
    });

    container.querySelector('#dismiss-notifications').addEventListener('click', () => {
      container.remove();
    });

    return container;
  }

  // 請求通知權限
  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('通知權限已授予');
        this.showToast('通知已啟用！', 'success');
        await this.subscribeToNotifications();
      } else {
        console.log('通知權限被拒絕');
        this.showToast('通知權限被拒絕', 'warning');
      }
    } catch (error) {
      console.error('請求通知權限失敗:', error);
    }
  }

  // 訂閱推送通知
  async subscribeToNotifications() {
    if (!this.swRegistration) {
      console.log('Service Worker 未註冊');
      return;
    }

    try {
      // 檢查是否已訂閱
      let subscription = await this.swRegistration.pushManager.getSubscription();

      if (!subscription) {
        // 創建新訂閱
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            // 這裡需要您的 VAPID 公鑰
            'YOUR_VAPID_PUBLIC_KEY_HERE',
          ),
        });

        console.log('推送通知訂閱成功:', subscription);

        // 發送訂閱信息到服務器
        await this.sendSubscriptionToServer(subscription);
      }
    } catch (error) {
      console.error('訂閱推送通知失敗:', error);
    }
  }

  // 發送訂閱信息到服務器
  async sendSubscriptionToServer(subscription) {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${RouteUtils.getApiUrl('notifications')}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (response.ok) {
        console.log('訂閱信息已發送到服務器');
      }
    } catch (error) {
      console.error('發送訂閱信息失敗:', error);
    }
  }

  // 設置更新檢查
  setupUpdateCheck() {
    if (!this.swRegistration) return;

    // 檢查更新
    setInterval(() => {
      this.swRegistration.update();
    }, 60000); // 每分鐘檢查一次
  }

  // 顯示更新通知
  showUpdateNotification() {
    this.showToast('應用程式有新版本可用，請重新整理頁面', 'info', 10000);
  }

  // 顯示 Toast 訊息
  showToast(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-white max-w-md ${
      type === 'success'
        ? 'bg-green-600'
        : type === 'warning'
          ? 'bg-yellow-600'
          : type === 'error'
            ? 'bg-red-600'
            : 'bg-blue-600'
    }`;

    toast.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white opacity-70 hover:opacity-100">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // 自動移除
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }

  // 工具函數：將 Base64 轉換為 Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // 發送測試通知
  async sendTestNotification() {
    if (Notification.permission === 'granted' && this.swRegistration) {
      this.swRegistration.showNotification('測試通知', {
        body: '這是一個測試通知，證明推送功能正常運作！',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
      });
    }
  }
}

// 全域 PWA 管理器實例
window.pwaManager = new PWAManager();

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAManager;
}
