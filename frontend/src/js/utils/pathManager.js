// pathManager.js - 路徑管理工具
// 用於批量更新 HTML 文件中的路徑引用

// 延遲導入，避免循環依賴
let ROUTES = null;

async function loadRoutes() {
  if (!ROUTES) {
    try {
      // 優先嘗試 Docker 專用路由
      try {
        const routesModule = await import('../config/routes-docker.js');
        ROUTES = routesModule.ROUTES;
        console.log('PathManager: Docker routes loaded successfully');
      } catch (dockerError) {
        console.warn('PathManager: Docker routes not available, falling back to standard routes');
        const routesModule = await import('../config/routes.js');
        ROUTES = routesModule.ROUTES;
        console.log('PathManager: Standard routes loaded successfully');
      }
    } catch (error) {
      console.error('PathManager: Failed to load any routes:', error);
      throw error;
    }
  }
  return ROUTES;
}

class PathManager {
  constructor() {
    this.routes = null;
    this.initialized = false;
  }

  async init() {
    try {
      const routes = await loadRoutes();
      this.routes = routes.pages;
      this.initialized = true;
      console.log('PathManager: Initialized successfully');
      return true;
    } catch (error) {
      console.error('PathManager: Initialization failed:', error);
      return false;
    }
  }

  // 更新頁面中所有的路徑引用
  async updatePageLinks() {
    if (!this.initialized) {
      const success = await this.init();
      if (!success) {
        console.warn('PathManager: Cannot update links - initialization failed');
        return;
      }
    }

    try {
      this.updateNavigationLinks();
      this.updateFormActions();
      this.updateRedirectLinks();
      console.log('PathManager: Page links updated successfully');
    } catch (error) {
      console.error('PathManager: Error updating page links:', error);
    }
  }

  // 更新導航欄連結
  updateNavigationLinks() {
    if (!this.routes || !this.routes.dashboard || !this.routes.auth) {
      console.warn('PathManager: Routes not properly initialized');
      return;
    }

    try {
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
          if (this.routes.dashboard.profile) {
            link.href = this.routes.dashboard.profile;
          }
        }
      });

      // Friends 連結
      const friendsLinks = document.querySelectorAll('a[href*="friends"]');
      friendsLinks.forEach((link) => {
        if (link.textContent.includes('Friends') || link.textContent.includes('好友')) {
          if (this.routes.dashboard.friends) {
            link.href = this.routes.dashboard.friends;
          }
        }
      });

      // Chat 連結
      const chatLinks = document.querySelectorAll('a[href*="chat"]');
      chatLinks.forEach((link) => {
        if (link.textContent.includes('Chat') || link.textContent.includes('聊天')) {
          if (this.routes.dashboard.chat) {
            link.href = this.routes.dashboard.chat;
          }
        }
      });

      // Login 連結
      const loginLinks = document.querySelectorAll('a[href*="login"]');
      loginLinks.forEach((link) => {
        if (link.textContent.includes('Login') || link.textContent.includes('登入')) {
          if (this.routes.auth.login) {
            link.href = this.routes.auth.login;
          }
        }
      });

      // Register 連結
      const registerLinks = document.querySelectorAll('a[href*="register"]');
      registerLinks.forEach((link) => {
        if (link.textContent.includes('Register') || link.textContent.includes('註冊')) {
          if (this.routes.auth.register) {
            link.href = this.routes.auth.register;
          }
        }
      });
    } catch (error) {
      console.error('PathManager: Error updating navigation links:', error);
    }
  }

  // 更新表單 action
  updateFormActions() {
    if (!this.routes) return;

    try {
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
    } catch (error) {
      console.error('PathManager: Error updating form actions:', error);
    }
  }

  // 更新重定向連結（如文章連結）
  updateRedirectLinks() {
    if (!this.routes) return;

    try {
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
    } catch (error) {
      console.error('PathManager: Error updating redirect links:', error);
    }
  }

  // 靜態初始化方法
  static async init() {
    try {
      const manager = new PathManager();
      const success = await manager.init();

      if (success) {
        // 等待 DOM 載入完成
        const updateLinks = async () => {
          await manager.updatePageLinks();
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', updateLinks);
        } else {
          await updateLinks();
        }

        // 設置全域引用
        window.PathManager = PathManager;
        window.pathManager = manager;

        console.log('PathManager: Static initialization completed successfully');
        return manager;
      } else {
        console.error('PathManager: Static initialization failed');
        return null;
      }
    } catch (error) {
      console.error('PathManager: Static initialization error:', error);
      return null;
    }
  }
}

// ES6 模組導出
export default PathManager;
export { PathManager };

// 設置全域引用但不自動初始化
if (typeof window !== 'undefined') {
  window.PathManager = PathManager;

  // 延遲初始化，確保所有依賴都已載入
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      PathManager.init().catch((error) => {
        console.error('PathManager: Auto-initialization failed:', error);
      });
    }, 500); // 給其他模組更多時間載入
  });
}

console.log('PathManager module loaded');
