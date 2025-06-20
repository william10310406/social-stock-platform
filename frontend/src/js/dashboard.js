// dashboard.js - Dashboard page functionality
// 使用全局 API_BASE_URL

// 獲取 API_BASE_URL 的函數
function getApiBaseUrl() {
  const baseUrl = window.API_BASE_URL || 'http://localhost:5001';
  return `${baseUrl}/api`;
}

const fetchPosts = async () => {
  const token = localStorage.getItem('token');
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
                    <a href="/src/pages/posts/detail.html?id=${post.id}" class="hover:underline">${post.title}</a>
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
                    <a href="/src/pages/posts/detail.html?id=${post.id}" class="text-gray-500 hover:text-gray-800">
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
  const token = localStorage.getItem('token');

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
  const token = localStorage.getItem('token');
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

// updateNavbar function is now handled by auth.js to avoid conflicts

const initDashboard = () => {
  // Route Protection
  if (!localStorage.getItem('token')) {
    alert('You must be logged in to view this page.');
    window.location.href = '/src/pages/auth/login.html';
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

  fetchPosts();

  const createPostForm = document.getElementById('create-post-form');
  if (createPostForm) {
    createPostForm.addEventListener('submit', handleCreatePost);
  }
  // The rest of the dashboard logic can continue here
};

document.addEventListener('DOMContentLoaded', initDashboard);
