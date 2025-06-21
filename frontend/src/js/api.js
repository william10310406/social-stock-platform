// api.js - API 工具函數和端點管理
// 統一的 API 調用和錯誤處理

// 使用相對路徑通過 Vite 代理避免 CORS 問題
const API_BASE_URL = '';

// API 端點配置
const API_ENDPOINTS = {
  // 認證相關
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile',
    check: '/api/auth/check',
  },

  // 文章相關
  posts: {
    list: '/api/posts',
    create: '/api/posts',
    detail: '/api/posts',
    update: '/api/posts',
    delete: '/api/posts',
    like: '/api/posts',
    myposts: '/api/posts/myposts',
    comments: '/api/posts',
  },

  // 好友相關
  friends: {
    list: '/api/friends',
    search: '/api/friends/search',
    requests: '/api/friends/requests',
    pending: '/api/friends/requests/pending',
  },

  // 聊天相關
  chat: {
    conversations: '/api/conversations',
    messages: '/api/messages',
  },

  // 系統相關
  system: {
    health: '/api/health',
  },
};

// 統一的 fetch 包裝器，包含認證和錯誤處理
async function fetchWithAuth(url, options = {}) {
  try {
    // 準備請求頭
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 添加認證 token
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // 構建完整的請求配置
    const requestConfig = {
      ...options,
      headers,
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    // 發送請求
    const response = await fetch(url, requestConfig);

    // 檢查響應狀態
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }

      // 處理特定錯誤狀態
      if (response.status === 401) {
        console.warn('API: Unauthorized, clearing tokens');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userId');

        // 如果不是在登入或註冊頁面，重定向到登入頁面
        if (
          !window.location.pathname.includes('login') &&
          !window.location.pathname.includes('register')
        ) {
          setTimeout(() => {
            if (window.RouteUtils) {
              window.RouteUtils.redirectToLogin();
            } else {
              console.warn('RouteUtils not available, using fallback');
              window.location.href = '/src/pages/auth/login.html';
            }
          }, 1000);
        }
      }

      throw new Error(errorMessage);
    }

    // 解析響應
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`API Response: ${response.status}`, data);
      return data;
    } else {
      const text = await response.text();
      console.log(`API Response: ${response.status}`, text);
      return text;
    }
  } catch (error) {
    console.error('API Error:', error);

    // 顯示用戶友好的錯誤訊息
    if (typeof window.errorManager !== 'undefined') {
      window.errorManager.showError(error.message, 'error');
    } else {
      console.warn('ErrorManager not available, showing alert');
      // 簡單的錯誤提示
      if (error.message !== 'Failed to fetch') {
        // 避免網絡錯誤的重複提示
        alert(`請求失敗: ${error.message}`);
      }
    }

    throw error;
  }
}

// 構建完整的 API URL
function buildApiUrl(endpoint, params = {}) {
  let url = API_BASE_URL + endpoint;

  // 替換路徑參數
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });

  return url;
}

// 設置全域變數以便其他模組使用
window.API_BASE_URL = API_BASE_URL;
window.fetchWithAuth = fetchWithAuth;
window.API_ENDPOINTS = API_ENDPOINTS;
window.buildApiUrl = buildApiUrl;

// 初始化 API 模組
function initializeAPI() {
  console.log('API module initialized');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Available endpoints:', Object.keys(API_ENDPOINTS));

  // 測試 API 連接（可選）
  testApiConnection();
}

// 測試 API 連接
async function testApiConnection() {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.system.health));
    if (response.ok) {
      console.log('✓ API connection test successful');
    } else {
      console.warn('⚠ API connection test failed:', response.status);
    }
  } catch (error) {
    console.warn('⚠ API connection test error:', error.message);
  }
}

// 當模組載入時初始化
if (typeof window !== 'undefined') {
  initializeAPI();
}

console.log('API utilities loaded with base URL:', API_BASE_URL);
