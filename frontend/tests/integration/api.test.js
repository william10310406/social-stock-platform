// API 集成測試

// 模擬 API 工具
class MockApiUtils {
  constructor() {
    this.baseURL = 'http://localhost:5001';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: { ...this.defaultHeaders },
      ...options,
    };

    // 添加認證標頭
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Request failed',
          data,
        };
      }

      return data;
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw {
        status: null,
        message: 'Network error',
        error,
      };
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // 認證相關 API
  async login(credentials) {
    return this.post('/api/auth/login', credentials);
  }

  async register(userData) {
    return this.post('/api/auth/register', userData);
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.post('/api/auth/refresh', { refresh_token: refreshToken });
  }

  async logout() {
    return this.post('/api/auth/logout');
  }

  // 用戶相關 API
  async getProfile() {
    return this.get('/api/user/profile');
  }

  async updateProfile(profileData) {
    return this.put('/api/user/profile', profileData);
  }

  // 文章相關 API
  async getPosts(params = {}) {
    return this.get('/api/posts', params);
  }

  async createPost(postData) {
    return this.post('/api/posts', postData);
  }

  async getPost(postId) {
    return this.get(`/api/posts/${postId}`);
  }

  async updatePost(postId, postData) {
    return this.put(`/api/posts/${postId}`, postData);
  }

  async deletePost(postId) {
    return this.delete(`/api/posts/${postId}`);
  }

  async likePost(postId) {
    return this.post(`/api/posts/${postId}/like`);
  }

  // 好友相關 API
  async getFriends() {
    return this.get('/api/friends');
  }

  async sendFriendRequest(userId) {
    return this.post('/api/friends/requests', { user_id: userId });
  }

  async getFriendRequests() {
    return this.get('/api/friends/requests');
  }

  async acceptFriendRequest(requestId) {
    return this.post(`/api/friends/requests/${requestId}/accept`);
  }

  async rejectFriendRequest(requestId) {
    return this.post(`/api/friends/requests/${requestId}/reject`);
  }
}

describe('API Integration Tests', () => {
  let api;
  let mockFetch;

  beforeEach(() => {
    api = new MockApiUtils();

    // 重置 localStorage
    localStorage.clear();

    // 設置 fetch mock
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    test('應該成功登入並儲存 token', async () => {
      const mockResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 1, username: 'testuser' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
        }),
      });

      expect(result).toEqual(mockResponse);
    });

    test('應該處理登入失敗', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      await expect(api.login({ username: 'testuser', password: 'wrongpassword' })).rejects.toEqual({
        status: 401,
        message: 'Invalid credentials',
        data: { message: 'Invalid credentials' },
      });
    });

    test('應該使用 refresh token 更新訪問令牌', async () => {
      localStorage.setItem('refresh_token', 'mock-refresh-token');

      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.refreshToken();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: 'mock-refresh-token' }),
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Authenticated Requests', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'mock-access-token');
    });

    test('應該在請求中包含認證標頭', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1, username: 'testuser' }),
      });

      await api.getProfile();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-access-token',
        },
      });
    });

    test('應該處理 401 未授權錯誤', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Token expired' }),
      });

      await expect(api.getProfile()).rejects.toEqual({
        status: 401,
        message: 'Token expired',
        data: { message: 'Token expired' },
      });
    });
  });

  describe('Posts API', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'mock-access-token');
    });

    test('應該獲取文章列表', async () => {
      const mockPosts = [
        { id: 1, title: 'Post 1', content: 'Content 1' },
        { id: 2, title: 'Post 2', content: 'Content 2' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ posts: mockPosts, total: 2 }),
      });

      const result = await api.getPosts({ page: 1, limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/posts?page=1&limit=10',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-access-token',
          }),
        }),
      );

      expect(result).toEqual({ posts: mockPosts, total: 2 });
    });

    test('應該創建新文章', async () => {
      const newPost = { title: 'New Post', content: 'New Content' };
      const mockResponse = { id: 3, ...newPost, created_at: '2023-01-01' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.createPost(newPost);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-access-token',
        },
        body: JSON.stringify(newPost),
      });

      expect(result).toEqual(mockResponse);
    });

    test('應該點讚文章', async () => {
      const mockResponse = { liked: true, likes_count: 5 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.likePost(1);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/posts/1/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-access-token',
        },
        body: JSON.stringify({}),
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Friends API', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'mock-access-token');
    });

    test('應該獲取好友列表', async () => {
      const mockFriends = [
        { id: 1, username: 'friend1', status: 'accepted' },
        { id: 2, username: 'friend2', status: 'accepted' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ friends: mockFriends }),
      });

      const result = await api.getFriends();

      expect(result).toEqual({ friends: mockFriends });
    });

    test('應該發送好友請求', async () => {
      const mockResponse = { message: 'Friend request sent', request_id: 123 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.sendFriendRequest(5);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/friends/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-access-token',
        },
        body: JSON.stringify({ user_id: 5 }),
      });

      expect(result).toEqual(mockResponse);
    });

    test('應該接受好友請求', async () => {
      const mockResponse = { message: 'Friend request accepted' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.acceptFriendRequest(123);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/friends/requests/123/accept',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-access-token',
          },
          body: JSON.stringify({}),
        },
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    test('應該處理網路錯誤', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getProfile()).rejects.toEqual({
        status: null,
        message: 'Network error',
        error: expect.any(Error),
      });
    });

    test('應該處理 JSON 解析錯誤', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(api.getProfile()).rejects.toEqual({
        status: null,
        message: 'Network error',
        error: expect.any(Error),
      });
    });

    test('應該處理 HTTP 錯誤狀態', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(api.getProfile()).rejects.toEqual({
        status: 500,
        message: 'Internal server error',
        data: { message: 'Internal server error' },
      });
    });
  });

  describe('Request Configuration', () => {
    test('應該正確處理 GET 請求參數', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await api.get('/api/posts', { page: 1, limit: 10, sort: 'created_at' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/posts?page=1&limit=10&sort=created_at',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    test('應該正確處理 PUT 請求', async () => {
      localStorage.setItem('access_token', 'mock-access-token');
      const updateData = { title: 'Updated Title' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(updateData),
      });

      await api.updatePost(1, updateData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/posts/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-access-token',
        },
        body: JSON.stringify(updateData),
      });
    });

    test('應該正確處理 DELETE 請求', async () => {
      localStorage.setItem('access_token', 'mock-access-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      });

      await api.deletePost(1);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/posts/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-access-token',
        },
      });
    });
  });
});
