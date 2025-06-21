// API 集成測試

// 模擬 API 工具
class MockApiUtils {
  constructor() {
    this.baseURL = '';
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

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
        }),
      });

      expect(result).toEqual(mockResponse);
    });

    test('應該成功刷新 token', async () => {
      localStorage.setItem('refresh_token', 'old-refresh-token');

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

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: 'old-refresh-token',
        }),
      });

      expect(result).toEqual(mockResponse);
    });

    test('應該處理登入失敗', async () => {
      const mockErrorResponse = {
        message: 'Invalid credentials',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(mockErrorResponse),
      });

      await expect(
        api.login({
          username: 'invalid',
          password: 'invalid',
        }),
      ).rejects.toEqual({
        status: 401,
        message: 'Invalid credentials',
        data: mockErrorResponse,
      });
    });
  });

  describe('User Profile Management', () => {
    test('應該成功獲取用戶資料', async () => {
      localStorage.setItem('access_token', 'valid-token');

      const mockProfile = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test bio',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockProfile),
      });

      const result = await api.getProfile();

      expect(mockFetch).toHaveBeenCalledWith('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
      });

      expect(result).toEqual(mockProfile);
    });
  });

  describe('Posts Management', () => {
    test('應該成功獲取文章列表', async () => {
      const mockPosts = [
        { id: 1, title: 'Post 1', content: 'Content 1' },
        { id: 2, title: 'Post 2', content: 'Content 2' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPosts),
      });

      const result = await api.getPosts({ page: 1, limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith('/api/posts?page=1&limit=10', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(result).toEqual(mockPosts);
    });

    test('應該成功創建文章', async () => {
      localStorage.setItem('access_token', 'valid-token');

      const newPost = { title: 'New Post', content: 'New Content' };
      const mockResponse = { id: 3, ...newPost };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.createPost(newPost);

      expect(mockFetch).toHaveBeenCalledWith('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
        body: JSON.stringify(newPost),
      });

      expect(result).toEqual(mockResponse);
    });

    test('應該成功點讚文章', async () => {
      localStorage.setItem('access_token', 'valid-token');

      const mockResponse = { message: 'Post liked successfully' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.likePost(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/posts/1/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
        body: JSON.stringify({}),
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Friends Management', () => {
    test('應該成功發送好友請求', async () => {
      localStorage.setItem('access_token', 'valid-token');

      const mockResponse = { message: 'Friend request sent' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.sendFriendRequest(123);

      expect(mockFetch).toHaveBeenCalledWith('/api/friends/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
        body: JSON.stringify({ user_id: 123 }),
      });

      expect(result).toEqual(mockResponse);
    });

    test('應該成功接受好友請求', async () => {
      localStorage.setItem('access_token', 'valid-token');

      const mockResponse = { message: 'Friend request accepted' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.acceptFriendRequest(123);

      expect(mockFetch).toHaveBeenCalledWith('/api/friends/requests/123/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
        body: JSON.stringify({}),
      });

      expect(result).toEqual(mockResponse);
    });

    test('應該處理網路錯誤', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getFriends()).rejects.toEqual({
        status: null,
        message: 'Network error',
        error: new Error('Network error'),
      });
    });
  });

  describe('Advanced Scenarios', () => {
    test('應該正確處理分頁請求', async () => {
      const mockPosts = {
        data: [{ id: 1, title: 'Post 1' }],
        pagination: { page: 1, totalPages: 5 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPosts),
      });

      const result = await api.getPosts({
        page: 1,
        limit: 10,
        sort: 'created_at',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/posts?page=1&limit=10&sort=created_at', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(result).toEqual(mockPosts);
    });

    test('應該成功獲取單篇文章', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        author: 'testuser',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPost),
      });

      const result = await api.getPost(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/posts/1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(result).toEqual(mockPost);
    });

    test('應該成功刪除文章', async () => {
      localStorage.setItem('access_token', 'valid-token');

      const mockResponse = { message: 'Post deleted successfully' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.deletePost(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/posts/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
      });

      expect(result).toEqual(mockResponse);
    });
  });
});
