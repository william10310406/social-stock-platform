// post.js - Post detail functionality
// 使用全局 API_BASE_URL

// 導入路徑配置
// import { RouteUtils } from './config/routes.js'; // 暫時註解，未使用

// 獲取 API_BASE_URL 的函數
function getApiBaseUrl() {
  const baseUrl = window.API_BASE_URL || '';
  return `${baseUrl}/api`;
}

let currentPostId = null;
let currentUserId = null; // We need to get this from the token ideally, but we'll fetch it.

const postDetailContainer = document.getElementById('post-detail-container');
const commentsList = document.getElementById('comments-list');
const commentForm = document.getElementById('comment-form');

const fetchPost = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentPostId = urlParams.get('id');
  if (!currentPostId) {
    postDetailContainer.innerHTML =
      '<h2>Post not found.</h2><p>Please provide a valid post ID.</p>';
    return;
  }

  const token = localStorage.getItem('token');
  try {
    // Decode token to get user_id for comment deletion check
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUserId = payload.user_id;

    const response = await fetch(`${getApiBaseUrl()}/posts/${currentPostId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const post = await response.json();
      renderPost(post);
      renderComments(post.comments);
    } else {
      postDetailContainer.innerHTML = '<h2>Error loading post.</h2>';
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    postDetailContainer.innerHTML = '<h2>An error occurred.</h2>';
  }
};

const renderPost = (post) => {
  postDetailContainer.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-3xl font-bold mb-2">${post.title}</h2>
            <p class="text-sm text-gray-600 mb-4">By ${post.author} on ${new Date(post.created_at).toLocaleDateString()}</p>
            <p class="text-gray-800 text-lg whitespace-pre-wrap mb-6">${post.body}</p>
            <div class="flex items-center space-x-4">
                 <button data-post-id="${post.id}" class="like-btn ${post.current_user_liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500">
                    ❤️ <span class="like-count">${post.likes_count}</span>
                </button>
                <span class="text-gray-500">
                    💬 <span class="comment-count">${post.comments_count}</span> Comments
                </span>
            </div>
        </div>
    `;
  // Add listener to the new like button
  postDetailContainer.querySelector('.like-btn').addEventListener('click', handleLikePost);
};

const renderComments = (comments) => {
  if (comments.length === 0) {
    commentsList.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
    return;
  }
  commentsList.innerHTML = comments
    .map(
      (comment) => `
        <div class="border-t pt-4" id="comment-${comment.id}">
            <p class="text-gray-700">${comment.body}</p>
            <div class="text-sm text-gray-500 mt-2 flex justify-between">
                <span>By ${comment.author} on ${new Date(comment.created_at).toLocaleDateString()}</span>
                ${
                  comment.author_id === currentUserId
                    ? `<button data-comment-id="${comment.id}" class="delete-comment-btn text-red-500 hover:underline">Delete</button>`
                    : ''
                }
            </div>
        </div>
    `,
    )
    .join('');

  // Add listeners for delete buttons
  document.querySelectorAll('.delete-comment-btn').forEach((button) => {
    button.addEventListener('click', handleDeleteComment);
  });
};

const handleLikePost = async (event) => {
  // This function is duplicated from dashboard.js, in a real large app, this would be in a shared module.
  const button = event.currentTarget;
  const postId = button.dataset.postId;
  const token = localStorage.getItem('token');
  const isLiked = button.classList.contains('text-red-500');
  const method = isLiked ? 'DELETE' : 'POST';

  try {
    const response = await fetch(`${getApiBaseUrl()}/posts/${postId}/like`, {
      method: method,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const likeCountSpan = button.querySelector('.like-count');
      let likeCount = parseInt(likeCountSpan.textContent);
      if (isLiked) {
        button.classList.remove('text-red-500');
        likeCount--;
      } else {
        button.classList.add('text-red-500');
        likeCount++;
      }
      likeCountSpan.textContent = likeCount;
    }
  } catch (error) {
    console.error('Like/Unlike error:', error);
  }
};

const handleAddComment = async (event) => {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const commentBodyInput = document.getElementById('comment-body');
  const body = commentBodyInput.value;

  if (!body.trim()) return;

  try {
    const response = await fetch(`${getApiBaseUrl()}/posts/${currentPostId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body: body }),
    });
    if (response.ok) {
      commentBodyInput.value = '';
      fetchPost(); // Re-fetch the entire post to get updated comments list
    } else {
      alert('Failed to add comment.');
    }
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

const handleDeleteComment = async (event) => {
  const commentId = event.target.dataset.commentId;
  if (!confirm('Are you sure you want to delete this comment?')) return;

  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${getApiBaseUrl()}/posts/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      document.getElementById(`comment-${commentId}`).remove();
    } else {
      alert('Failed to delete comment.');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};

// updateNavbar function is now handled by auth.js to avoid conflicts

// 已移至 DOMContentLoaded 事件中，避免重複定義
// const initPost = () => {
//   // Route Protection
//   if (!localStorage.getItem('token')) {
//     alert('You must be logged in to view this page.');
//     RouteUtils.redirectToLogin();
//     return; // Stop further execution
//   }

//   // Update navbar to show user navigation (wait for auth.js if needed)
//   const tryUpdateNavbar = () => {
//     if (typeof updateNavbar === 'function') {
//       updateNavbar();
//     } else {
//       // Wait a bit for auth.js to load and try again
//       setTimeout(tryUpdateNavbar, 50);
//     }
//   };
//   tryUpdateNavbar();

//   fetchPost();
//   commentForm.addEventListener('submit', handleAddComment);
// };

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('token')) {
    if (window.RouteUtils) {
      window.RouteUtils.redirectToLogin();
    } else {
      console.warn('RouteUtils not available, using fallback');
      window.location.href = '/src/pages/auth/login.html';
    }
    return;
  }

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

  fetchPost();
  commentForm.addEventListener('submit', handleAddComment);
});
