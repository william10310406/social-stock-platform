// friends.js - Friends management functionality
// 使用全局 API_BASE_URL

// 導入路徑配置
import { RouteUtils } from './config/routes.js';

// 獲取 API_BASE_URL 的函數
function getApiBaseUrl() {
  const baseUrl = window.API_BASE_URL || 'http://localhost:5001';
  return `${baseUrl}/api`;
}

// --- DOM Elements ---
const friendsListContainer = document.getElementById('friends-list');
const pendingRequestsContainer = document.getElementById('pending-requests-list');
const userSearchInput = document.getElementById('user-search-input');
const userSearchResultsContainer = document.getElementById('user-search-results');

const token = localStorage.getItem('token');

// --- API Calls ---
const apiFetch = (endpoint, options = {}) => {
  options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  return fetch(`${getApiBaseUrl()}${endpoint}`, options);
};

// --- Rendering Functions ---
const renderFriendsList = async () => {
  const response = await apiFetch('/friends');
  const friends = await response.json();
  friendsListContainer.innerHTML = friends.length
    ? friends.map((f) => `<p>${f.username}</p>`).join('')
    : '<p class="text-gray-500">You have no friends yet.</p>';
};

const renderPendingRequests = async () => {
  const response = await apiFetch('/friends/requests/pending');
  const requests = await response.json();
  pendingRequestsContainer.innerHTML = requests.length
    ? requests
        .map(
          (req) => `
            <div class="flex justify-between items-center">
                <span>${req.requester_username}</span>
                <div>
                    <button data-id="${req.requester_id}" class="accept-btn px-2 py-1 bg-green-500 text-white rounded-md text-sm">Accept</button>
                    <button data-id="${req.requester_id}" class="decline-btn px-2 py-1 bg-red-500 text-white rounded-md text-sm ml-2">Decline</button>
                </div>
            </div>
        `,
        )
        .join('')
    : '<p class="text-gray-500">No pending requests.</p>';

  document
    .querySelectorAll('.accept-btn')
    .forEach((b) => b.addEventListener('click', () => respondToRequest(b.dataset.id, 'accepted')));
  document
    .querySelectorAll('.decline-btn')
    .forEach((b) => b.addEventListener('click', () => respondToRequest(b.dataset.id, 'declined')));
};

const renderSearchResults = (users) => {
  userSearchResultsContainer.innerHTML = users.length
    ? users
        .map(
          (user) => `
            <div class="flex justify-between items-center">
                <span>${user.username}</span>
                <button data-id="${user.id}" class="add-friend-btn px-2 py-1 bg-blue-500 text-white rounded-md text-sm">Add Friend</button>
            </div>
        `,
        )
        .join('')
    : '<p class="text-gray-500">No users found.</p>';

  document
    .querySelectorAll('.add-friend-btn')
    .forEach((b) => b.addEventListener('click', () => sendRequest(b.dataset.id)));
};

// --- Action Functions ---
const respondToRequest = async (requesterId, status) => {
  await apiFetch(`/friends/requests/${requesterId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  renderAll();
};

const sendRequest = async (addresseeId) => {
  const response = await apiFetch('/friends/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addressee_id: addresseeId }),
  });
  const result = await response.json();
  alert(result.message);
};

const searchUsers = async () => {
  const query = userSearchInput.value;
  if (query.length < 2) {
    userSearchResultsContainer.innerHTML = '';
    return;
  }
  const response = await apiFetch(`/friends/search?username=${query}`);
  const users = await response.json();
  renderSearchResults(users);
};

const renderAll = () => {
  renderFriendsList();
  renderPendingRequests();
};

// updateNavbar function is now handled by auth.js to avoid conflicts

// --- Initialization ---
const initFriends = () => {
  // Route Protection
  if (!localStorage.getItem('token')) {
    alert('You must be logged in to view this page.');
    RouteUtils.redirectToLogin();
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

  renderAll();
  userSearchInput.addEventListener('input', searchUsers);
};

document.addEventListener('DOMContentLoaded', initFriends);
