// api.js - API utilities and endpoints

const API_BASE_URL = 'http://localhost:5001';

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token is invalid or expired, redirect to login
    alert('Your session has expired. Please log in again.');
    localStorage.removeItem('token');
    window.location.href = '/src/pages/auth/login.html';
    // Throw an error to stop further processing in the calling function
    throw new Error('Unauthorized');
  }

  return response;
};

const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',

  // User endpoints
  PROFILE: '/user/profile',
  USERS: '/users',

  // Post endpoints
  POSTS: '/posts',
  POSTS_CREATE: '/posts',

  // Friend endpoints
  FRIENDS: '/friends',
  FRIEND_REQUESTS: '/friends/requests',

  // Chat endpoints
  MESSAGES: '/messages',
  CONVERSATIONS: '/conversations',
};

// 將函數添加到全局 window 對象，供其他腳本使用
window.API_BASE_URL = API_BASE_URL;
window.fetchWithAuth = fetchWithAuth;
window.API_ENDPOINTS = API_ENDPOINTS;
