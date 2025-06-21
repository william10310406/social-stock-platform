// dashboard.js - Dashboard page functionality
// 使用全局路徑配置 (由 pathManager 設置)

// 獲取 API_BASE_URL 的函數
function getApiBaseUrl() {
  const apiBase = window.ROUTES ? window.ROUTES.api.base : '';
  return `${apiBase}/api`;
}

const fetchPosts = async () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (!token) return;

  try {
    const response = await fetch(`${getApiBaseUrl()}/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const posts = await response.json();
      displayPosts(posts);
    } else {
      console.error('Failed to fetch posts:', await response.text());
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};

const displayPosts = (posts) => {
  const postsContainer = document.getElementById('posts-container');
  if (!postsContainer) return;

  postsContainer.innerHTML = ''; // Clear existing posts

  if (posts.length === 0) {
    postsContainer.innerHTML = '<p>No posts yet. Be the first to create one!</p>';
    return;
  }

  posts.forEach((post) => {
    const postElement = document.createElement('div');
    postElement.className = 'post-item bg-white p-6 rounded-lg shadow mb-6';
    postElement.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-bold text-xl">
                    <a href="${window.RouteUtils ? window.RouteUtils.getPagePath('posts', 'detail') : '/src/pages/posts/detail.html'}?id=${post.id}" class="hover:underline">${post.title}</a>
                </h3>
                <span class="text-sm text-gray-600">By ${post.author}</span>
            </div>
            <p class="text-gray-800 text-base mb-4">${post.body}</p>
            <div class="flex items-center justify-between text-sm text-gray-600">
                <span>${new Date(post.created_at).toLocaleString()}</span>
                <div class="flex items-center space-x-4">
                    <button data-post-id="${post.id}" class="like-btn ${post.current_user_liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500">
                        ❤️ <span class="like-count">${post.likes_count}</span>
                    </button>
                    <a href="${window.RouteUtils ? window.RouteUtils.getPagePath('posts', 'detail') : '/src/pages/posts/detail.html'}?id=${post.id}" class="text-gray-500 hover:text-gray-800">
                        💬 <span class="comment-count">${post.comments_count}</span>
                    </a>
                </div>
            </div>
        `;
    postsContainer.appendChild(postElement);
  });

  // Add event listeners for like buttons
  document.querySelectorAll('.like-btn').forEach((button) => {
    button.addEventListener('click', handleLikePost);
  });
};

const handleLikePost = async (event) => {
  const button = event.currentTarget;
  const postId = button.dataset.postId;
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');

  // Determine if we are liking or unliking
  const isLiked = button.classList.contains('text-red-500');
  const method = isLiked ? 'DELETE' : 'POST';

  try {
    const response = await fetch(`${getApiBaseUrl()}/posts/${postId}/like`, {
      method: method,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      // Toggle like state visually
      const likeCountSpan = button.querySelector('.like-count');
      let likeCount = parseInt(likeCountSpan.textContent);
      if (isLiked) {
        button.classList.remove('text-red-500');
        button.classList.add('text-gray-500');
        likeCount--;
      } else {
        button.classList.add('text-red-500');
        button.classList.remove('text-gray-500');
        likeCount++;
      }
      likeCountSpan.textContent = likeCount;
    } else {
      const result = await response.json();
      alert(`Action failed: ${result.message}`);
    }
  } catch (error) {
    console.error('Like/Unlike error:', error);
  }
};

const handleCreatePost = async (event) => {
  event.preventDefault();
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (!token) return;

  const titleInput = document.getElementById('post-title');
  const bodyInput = document.getElementById('post-body');

  const postData = {
    title: titleInput.value,
    body: bodyInput.value,
  };

  try {
    const response = await fetch(`${getApiBaseUrl()}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    if (response.ok) {
      titleInput.value = '';
      bodyInput.value = '';
      fetchPosts(); // Refresh the posts list
    } else {
      const errorData = await response.json();
      alert(`Failed to create post: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error creating post:', error);
    alert('An error occurred while creating the post.');
  }
};

// Fetch stock data for dashboard
const fetchHotStocks = async () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (!token) return;

  try {
    const response = await fetch(`${getApiBaseUrl()}/stocks?per_page=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      displayHotStocks(data.stocks || []);
    } else {
      console.error('Failed to fetch stocks:', await response.text());
    }
  } catch (error) {
    console.error('Error fetching stocks:', error);
    document.getElementById('hot-stocks').innerHTML =
      '<div class="text-center text-red-500 py-4">載入股票數據失敗</div>';
  }
};

const displayHotStocks = (stocks) => {
  const container = document.getElementById('hot-stocks');
  if (!container) return;

  if (!stocks || stocks.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-4">暫無股票資料</div>';
    return;
  }

  container.innerHTML = stocks
    .map((stock) => {
      const latestPrice = stock.latest_price;
      const price = latestPrice ? parseFloat(latestPrice.close_price) : 0;
      const change = latestPrice ? parseFloat(latestPrice.change_amount) : 0;
      const changeClass =
        change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600';
      const changeSymbol = change > 0 ? '+' : '';

      return `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div class="flex-1">
          <div class="flex items-center space-x-3">
            <div>
              <h4 class="font-semibold text-gray-900">${stock.symbol}</h4>
              <p class="text-sm text-gray-600">${stock.name}</p>
            </div>
            <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${stock.exchange || '-'}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="font-semibold text-gray-900">${price ? price.toFixed(2) : '-'}</div>
          <div class="text-sm ${changeClass}">
            ${change ? `${changeSymbol}${change.toFixed(2)}` : '-'}
          </div>
        </div>
      </div>
    `;
    })
    .join('');
};

const fetchMarketOverview = async () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (!token) return;

  try {
    const response = await fetch(`${getApiBaseUrl()}/stocks/statistics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      displayMarketOverview(data);
    } else {
      console.error('Failed to fetch market stats:', await response.text());
    }
  } catch (error) {
    console.error('Error fetching market stats:', error);
    document.getElementById('market-overview').innerHTML =
      '<div class="text-center text-red-500 py-4 col-span-2">載入市場統計失敗</div>';
  }
};

const displayMarketOverview = (stats) => {
  const container = document.getElementById('market-overview');
  if (!container) return;

  container.innerHTML = `
    <div class="text-center p-3 bg-blue-50 rounded-lg">
      <div class="text-xl font-bold text-blue-600">${stats.total_stocks || 0}</div>
      <div class="text-xs text-gray-600">總股票數</div>
    </div>
    <div class="text-center p-3 bg-green-50 rounded-lg">
      <div class="text-xl font-bold text-green-600">${stats.listed_stocks || 0}</div>
      <div class="text-xs text-gray-600">上市股票</div>
    </div>
    <div class="text-center p-3 bg-purple-50 rounded-lg">
      <div class="text-xl font-bold text-purple-600">${stats.otc_stocks || 0}</div>
      <div class="text-xs text-gray-600">上櫃股票</div>
    </div>
    <div class="text-center p-3 bg-yellow-50 rounded-lg">
      <div class="text-xl font-bold text-yellow-600">${stats.total_records || 0}</div>
      <div class="text-xs text-gray-600">價格記錄</div>
    </div>
  `;
};

// updateNavbar function is now handled by auth.js to avoid conflicts

const initDashboard = () => {
  // Route Protection
  if (!localStorage.getItem('token') && !localStorage.getItem('access_token')) {
    alert('You must be logged in to view this page.');
    if (window.RouteUtils) {
      window.RouteUtils.redirectToLogin();
    } else {
      if (window.RouteUtils) {
        window.RouteUtils.redirectToLogin();
      } else {
        console.warn('RouteUtils not available, using fallback');
        window.location.href = '/src/pages/auth/login.html';
      }
    }
    return; // Stop further execution
  }

  console.log('dashboard.js loaded');

  // Update navbar to show user navigation (wait for auth.js if needed)
  const tryUpdateNavbar = () => {
    if (typeof updateNavbar === 'function') {
      updateNavbar();
    } else {
      // Wait a bit for auth.js to load and try again
      setTimeout(tryUpdateNavbar, 50);
    }
  };
  tryUpdateNavbar();

  // Load dashboard data
  fetchPosts();
  fetchHotStocks();
  fetchMarketOverview();

  const createPostForm = document.getElementById('create-post-form');
  if (createPostForm) {
    createPostForm.addEventListener('submit', handleCreatePost);
  }
  // The rest of the dashboard logic can continue here
};

document.addEventListener('DOMContentLoaded', initDashboard);
