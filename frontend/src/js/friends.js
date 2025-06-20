import '../css/style.css';
import { API_BASE_URL } from './api.js';

// --- DOM Elements ---
const friendsListContainer = document.getElementById('friends-list');
const pendingRequestsContainer = document.getElementById('pending-requests-list');
const userSearchInput = document.getElementById('user-search-input');
const userSearchResultsContainer = document.getElementById('user-search-results');

    const token = localStorage.getItem('token');

// --- API Calls ---
const apiFetch = (endpoint, options = {}) => {
    options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    return fetch(`${API_BASE_URL}${endpoint}`, options);
};

// --- Rendering Functions ---
const renderFriendsList = async () => {
    const response = await apiFetch('/friends');
    const friends = await response.json();
    friendsListContainer.innerHTML = friends.length ? 
        friends.map(f => `<p>${f.username}</p>`).join('') : 
        '<p class="text-gray-500">You have no friends yet.</p>';
};

const renderPendingRequests = async () => {
    const response = await apiFetch('/friends/requests/pending');
    const requests = await response.json();
    pendingRequestsContainer.innerHTML = requests.length ? 
        requests.map(req => `
            <div class="flex justify-between items-center">
                <span>${req.requester_username}</span>
                <div>
                    <button data-id="${req.requester_id}" class="accept-btn px-2 py-1 bg-green-500 text-white rounded-md text-sm">Accept</button>
                    <button data-id="${req.requester_id}" class="decline-btn px-2 py-1 bg-red-500 text-white rounded-md text-sm ml-2">Decline</button>
                </div>
            </div>
        `).join('') : 
        '<p class="text-gray-500">No pending requests.</p>';
    
    document.querySelectorAll('.accept-btn').forEach(b => b.addEventListener('click', () => respondToRequest(b.dataset.id, 'accepted')));
    document.querySelectorAll('.decline-btn').forEach(b => b.addEventListener('click', () => respondToRequest(b.dataset.id, 'declined')));
};

const renderSearchResults = (users) => {
    userSearchResultsContainer.innerHTML = users.length ?
        users.map(user => `
            <div class="flex justify-between items-center">
                <span>${user.username}</span>
                <button data-id="${user.id}" class="add-friend-btn px-2 py-1 bg-blue-500 text-white rounded-md text-sm">Add Friend</button>
            </div>
        `).join('') :
        '<p class="text-gray-500">No users found.</p>';

    document.querySelectorAll('.add-friend-btn').forEach(b => b.addEventListener('click', () => sendRequest(b.dataset.id)));
};

// --- Action Functions ---
const respondToRequest = async (requesterId, status) => {
    await apiFetch(`/friends/requests/${requesterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    renderAll();
};

const sendRequest = async (addresseeId) => {
    const response = await apiFetch('/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressee_id: addresseeId })
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

const updateNavbar = () => {
    console.log('updateNavbar() called in friends.');
    const token = localStorage.getItem('token');
    
    const userNav = document.getElementById('nav-links-user');
    const guestNav = document.getElementById('nav-links-guest');

    if (!userNav || !guestNav) {
        console.log('Nav elements not found');
        return;
    }

    if (token) {
        userNav.classList.remove('hidden');
        guestNav.classList.add('hidden');

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.replaceWith(logoutButton.cloneNode(true));
            document.getElementById('logout-button').addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                console.log('User logged out, token removed.');
                window.location.href = '/login.html';
            });
        }
    } else {
        userNav.classList.add('hidden');
        guestNav.classList.remove('hidden');
    }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    // Update navbar to show user navigation
    updateNavbar();
    
    renderAll();
    userSearchInput.addEventListener('input', searchUsers);
}); 