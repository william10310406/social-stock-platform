// pathManager.js - 路徑管理工具
// 用於批量更新 HTML 文件中的路徑引用

class PathManager {
  constructor() {
    // 確保路徑配置已載入
    if (typeof ROUTES === 'undefined') {
      throw new Error('ROUTES configuration not loaded. Please include routes.js first.');
    }
    this.routes = ROUTES;
  }

  // 更新頁面中所有的路徑引用
  updatePageLinks() {
    this.updateNavigationLinks();
    this.updateFormActions();
    this.updateRedirectLinks();
  }

  // 更新導航欄連結
  updateNavigationLinks() {
    // StockInsight 標誌
    const logoLinks = document.querySelectorAll('a[href*="dashboard"], a[href*="index"]');
    logoLinks.forEach((link) => {
      if (link.textContent.includes('StockInsight') || link.textContent.includes('Stock')) {
        link.href = this.routes.dashboard.index;
      }
    });

    // Dashboard 連結
    const dashboardLinks = document.querySelectorAll('a[href*="dashboard"]');
    dashboardLinks.forEach((link) => {
      if (link.textContent.includes('Dashboard') || link.textContent.includes('儀表板')) {
        link.href = this.routes.dashboard.index;
      }
    });

    // Profile 連結
    const profileLinks = document.querySelectorAll('a[href*="profile"]');
    profileLinks.forEach((link) => {
      if (link.textContent.includes('Profile') || link.textContent.includes('個人資料')) {
        link.href = this.routes.dashboard.profile;
      }
    });

    // Friends 連結
    const friendsLinks = document.querySelectorAll('a[href*="friends"]');
    friendsLinks.forEach((link) => {
      if (link.textContent.includes('Friends') || link.textContent.includes('好友')) {
        link.href = this.routes.dashboard.friends;
      }
    });

    // Chat 連結
    const chatLinks = document.querySelectorAll('a[href*="chat"]');
    chatLinks.forEach((link) => {
      if (link.textContent.includes('Chat') || link.textContent.includes('聊天')) {
        link.href = this.routes.dashboard.chat;
      }
    });

    // Login 連結
    const loginLinks = document.querySelectorAll('a[href*="login"]');
    loginLinks.forEach((link) => {
      if (link.textContent.includes('Login') || link.textContent.includes('登入')) {
        link.href = this.routes.auth.login;
      }
    });

    // Register 連結
    const registerLinks = document.querySelectorAll('a[href*="register"]');
    registerLinks.forEach((link) => {
      if (link.textContent.includes('Register') || link.textContent.includes('註冊')) {
        link.href = this.routes.auth.register;
      }
    });
  }

  // 更新表單 action
  updateFormActions() {
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      const action = form.getAttribute('action');
      if (action) {
        // 根據 action 內容更新路徑
        if (action.includes('login')) {
          form.setAttribute('action', this.routes.auth.login);
        } else if (action.includes('register')) {
          form.setAttribute('action', this.routes.auth.register);
        }
      }
    });
  }

  // 更新重定向連結（如文章連結）
  updateRedirectLinks() {
    // 文章詳情連結
    const postLinks = document.querySelectorAll('a[href*="post.html"], a[href*="detail.html"]');
    postLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.includes('id=')) {
        const urlParams = new URLSearchParams(href.split('?')[1]);
        const postId = urlParams.get('id');
        link.href = `${this.routes.posts.detail}?id=${postId}`;
      }
    });
  }

  // 初始化路徑管理（在頁面載入時調用）
  static init() {
    try {
      const manager = new PathManager();

      // 等待 DOM 載入完成
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          manager.updatePageLinks();
        });
      } else {
        manager.updatePageLinks();
      }

      console.log('PathManager initialized successfully');
      return manager;
    } catch (error) {
      console.error('PathManager initialization failed:', error);
      return null;
    }
  }
}

// 自動初始化
window.PathManager = PathManager;
PathManager.init();

console.log('PathManager loaded');
