import '../css/style.css';
import { API_BASE_URL } from './api.js';

console.log('profile.js loaded, API_BASE_URL:', API_BASE_URL);

let currentUserData = null; // Store current user data globally on this page

// --- DOM Elements ---
const viewProfileSection = document.getElementById('view-profile-section');
const editProfileSection = document.getElementById('edit-profile-section');
const profileContainer = document.getElementById('profile-data-container');

const editProfileBtn = document.getElementById('edit-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editProfileForm = document.getElementById('edit-profile-form');

const usernameInput = document.getElementById('edit-username');
const bioInput = document.getElementById('edit-bio');
const myPostsContainer = document.getElementById('my-posts-container');

// --- Functions ---

const handleLikePost = async (event) => {
    // This function is duplicated from dashboard.js/post.js, in a real large app, this would be in a shared module.
    const button = event.currentTarget;
    const postId = button.dataset.postId;
    const token = localStorage.getItem('token');
    const isLiked = button.classList.contains('text-red-500');
    const method = isLiked ? 'DELETE' : 'POST';

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` }
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

const displayPosts = (posts) => {
    if (!myPostsContainer) return;

    if (posts.length === 0) {
        myPostsContainer.innerHTML = '<p class="text-gray-500">You have not created any posts yet.</p>';
        return;
    }

    myPostsContainer.innerHTML = posts.map(post => `
        <div class="border-b pb-4 mb-4" id="post-${post.id}">
            <div class="flex justify-between items-start mb-2">
                <a href="/post.html?id=${post.id}" class="text-lg font-semibold text-gray-800 hover:underline">${post.title}</a>
                <button data-post-id="${post.id}" class="delete-post-btn ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex-shrink-0">Delete</button>
            </div>
            <p class="text-gray-600 mt-1 mb-3 whitespace-pre-wrap">${post.body}</p>
            <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Published on ${new Date(post.created_at).toLocaleDateString()}</span>
                <div class="flex items-center space-x-4">
                    <button data-post-id="${post.id}" class="like-btn ${post.current_user_liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500">
                        ❤️ <span class="like-count">${post.likes_count}</span>
                    </button>
                    <a href="/post.html?id=${post.id}" class="text-gray-500 hover:text-gray-800">
                        💬 <span class="comment-count">${post.comments_count}</span>
                    </a>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to all delete and like buttons
    document.querySelectorAll('.delete-post-btn').forEach(button => {
        button.addEventListener('click', handleDeletePost);
    });
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', handleLikePost);
    });
};

const handleDeletePost = async (event) => {
    const postId = event.target.dataset.postId;
    if (!confirm(`Are you sure you want to delete this post?`)) {
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Post deleted successfully!');
            // Remove the post element from the DOM
            document.getElementById(`post-${postId}`).remove();
        } else {
            const result = await response.json();
            alert(`Failed to delete post: ${result.message}`);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('An error occurred while deleting the post.');
    }
};

const fetchMyPosts = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/posts/myposts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts);
        } else {
            myPostsContainer.innerHTML = '<p class="text-red-500">Failed to load posts.</p>';
        }
    } catch (error) {
        console.error('Error fetching my posts:', error);
        myPostsContainer.innerHTML = '<p class="text-red-500">An error occurred while loading posts.</p>';
    }
};

const displayProfile = (userData) => {
    console.log('displayProfile() called with userData:', userData);
    console.log('profileContainer element:', profileContainer);
    
    if (!profileContainer) {
        console.error('profileContainer element not found!');
        return;
    }
    
    profileContainer.innerHTML = `
        <div class="space-y-4">
            <div>
                <p class="text-sm font-medium text-gray-500">Username</p>
                <p class="mt-1 text-lg text-gray-900">${userData.username}</p>
            </div>
            <div>
                <p class="text-sm font-medium text-gray-500">Email Address</p>
                <p class="mt-1 text-lg text-gray-900">${userData.email}</p>
            </div>
            <div>
                <p class="text-sm font-medium text-gray-500">Bio</p>
                <p class="mt-1 text-lg text-gray-900 whitespace-pre-wrap">${userData.bio || 'You have not set a bio yet.'}</p>
            </div>
        </div>
    `;
    
    console.log('Profile HTML updated. New innerHTML:', profileContainer.innerHTML);
};

const switchToEditMode = () => {
    if (!currentUserData) return;
    
    // Populate form with current data
    usernameInput.value = currentUserData.username;
    bioInput.value = currentUserData.bio || '';

    // Switch visibility
    viewProfileSection.classList.add('hidden');
    editProfileSection.classList.remove('hidden');
};

const switchToViewMode = () => {
    viewProfileSection.classList.remove('hidden');
    editProfileSection.classList.add('hidden');
};

const fetchProfile = async () => {
    console.log('fetchProfile() called');
    const token = localStorage.getItem('token');
    console.log('Token available:', !!token);
    
    if (!token) {
        alert("You must be logged in to view this page.");
        window.location.href = '/login.html';
        return;
    }

    try {
        console.log('Making API call to:', `${API_BASE_URL}/auth/profile`);
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
            currentUserData = await response.json();
            console.log('Profile data received:', currentUserData);
            displayProfile(currentUserData);
            fetchMyPosts(); // Fetch user's posts after fetching profile
        } else {
            const errorText = await response.text();
            console.error('Profile fetch failed:', response.status, errorText);
            alert('Could not load your profile. Please try logging in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('An error occurred while fetching your profile.');
    }
};

const handleUpdateProfile = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    const updatedData = {
        username: usernameInput.value,
        bio: bioInput.value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Profile updated successfully!');
            await fetchProfile(); // Refresh profile data
            switchToViewMode();
        } else {
            alert(`Update failed: ${result.message}`);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating your profile.');
    }
};

const updateNavbar = () => {
    console.log('updateNavbar() called in profile.');
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

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired in profile.js');
    console.log('Elements found:', {
        editProfileBtn: !!editProfileBtn,
        cancelEditBtn: !!cancelEditBtn,
        editProfileForm: !!editProfileForm,
        profileContainer: !!profileContainer,
        myPostsContainer: !!myPostsContainer
    });

    if (!localStorage.getItem('token')) {
        alert("You must be logged in to view this page.");
        window.location.href = '/login.html';
        return;
    }
    
    // Update navbar to show user navigation
    updateNavbar();
    
    fetchProfile();

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', switchToEditMode);
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', switchToViewMode);
    }
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleUpdateProfile);
    }
}); 