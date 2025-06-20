// auth.js - Handles login/register, form validation, JWT storage

import '../css/style.css';

const API_BASE_URL = 'http://localhost:5001';

// Function to handle user logout
const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    console.log('User logged out, token removed.');
    window.location.href = '/login.html';
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
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
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
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
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

console.log("auth.js loaded. Page protection is now handled by inline scripts."); 