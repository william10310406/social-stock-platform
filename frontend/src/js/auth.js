// auth.js - Handles login/register, form validation, JWT storage

import '../css/style.css';

const API_BASE_URL = 'http://localhost:5001';

// Function to handle user logout
const handleLogout = async () => {
  const token = localStorage.getItem('token');

  // Call logout API to revoke refresh token
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.log('Logout API call failed, but continuing with local logout');
    }
  }

  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('tokenExpires');
  console.log('User logged out, tokens removed.');
  window.location.href = '/login.html';
};

// Function to refresh access token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    console.log('No refresh token available');
    handleLogout();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store new access token
      localStorage.setItem('token', data.access_token);

      // Calculate expiration time
      const expiresAt = new Date().getTime() + data.expires_in * 1000;
      localStorage.setItem('tokenExpires', expiresAt.toString());

      console.log('Access token refreshed successfully');
      return data.access_token;
    } else {
      console.log('Token refresh failed:', data.message);
      handleLogout();
      return null;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    handleLogout();
    return null;
  }
};

// Function to get valid token (refreshes if needed)
const getValidToken = async () => {
  const token = localStorage.getItem('token');
  const tokenExpires = localStorage.getItem('tokenExpires');

  if (!token) {
    return null;
  }

  // Check if token will expire in the next 5 minutes
  const now = new Date().getTime();
  const expiresAt = parseInt(tokenExpires) || 0;
  const fiveMinutes = 5 * 60 * 1000;

  if (expiresAt - now < fiveMinutes) {
    console.log('Token will expire soon, refreshing...');
    return await refreshAccessToken();
  }

  return token;
};

// Function to update the navbar based on login status
const updateNavbar = () => {
  console.log('updateNavbar() called.');
  const token = localStorage.getItem('token');

  const userNav = document.getElementById('nav-links-user');
  const guestNav = document.getElementById('nav-links-guest');

  if (!userNav || !guestNav) {
    // This can happen on pages without a navbar, which is fine.
    return;
  }

  if (token) {
    userNav.classList.remove('hidden');
    guestNav.classList.add('hidden');

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.replaceWith(logoutButton.cloneNode(true));
      document.getElementById('logout-button').addEventListener('click', handleLogout);
    }
  } else {
    userNav.classList.add('hidden');
    guestNav.classList.remove('hidden');
  }
};

// Main logic to run on page load
const initPage = () => {
  // This is much simpler now. It just updates the navbar.
  // Page protection is handled by inline scripts in the HTML.
  updateNavbar();
};

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', initPage);

// --- Login/Register form handlers ---

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store both access and refresh tokens
        localStorage.setItem('token', data.access_token || data.token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('userId', data.user.id);

        // Calculate and store token expiration
        const expiresAt = new Date().getTime() + data.expires_in * 1000;
        localStorage.setItem('tokenExpires', expiresAt.toString());

        window.location.href = '/dashboard.html';
      } else {
        errorDiv.textContent = data.message || 'Login failed.';
        errorDiv.style.display = 'block';
      }
    } catch (error) {
      errorDiv.textContent = 'An error occurred. Please try again.';
      errorDiv.style.display = 'block';
    }
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('register-error');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.status === 201) {
        // Store both access and refresh tokens
        localStorage.setItem('token', data.access_token || data.token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('userId', data.user.id);

        // Calculate and store token expiration
        const expiresAt = new Date().getTime() + data.expires_in * 1000;
        localStorage.setItem('tokenExpires', expiresAt.toString());

        window.location.href = '/dashboard.html';
      } else {
        errorDiv.textContent = data.message || 'Registration failed.';
        errorDiv.style.display = 'block';
      }
    } catch (error) {
      errorDiv.textContent = 'An error occurred. Please try again.';
      errorDiv.style.display = 'block';
    }
  });
}

// Enhanced fetch function with automatic token refresh
window.apiRequest = async (url, options = {}) => {
  const token = await getValidToken();

  if (!token && !options.skipAuth) {
    handleLogout();
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle token expiration
  if (response.status === 401) {
    const data = await response.json();
    if (data.error_code === 'TOKEN_EXPIRED') {
      console.log('Token expired, attempting refresh...');
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry the request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers });
      }
    }
  }

  return response;
};

// Export functions for use in other modules
window.handleLogout = handleLogout;
window.getValidToken = getValidToken;
window.refreshAccessToken = refreshAccessToken;

console.log(
  'auth.js loaded with refresh token support. Page protection is now handled by inline scripts.',
);
