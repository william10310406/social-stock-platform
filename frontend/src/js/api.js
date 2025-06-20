export const API_BASE_URL = 'http://localhost:5001/api';

export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Token is invalid or expired, redirect to login
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        // Throw an error to stop further processing in the calling function
        throw new Error('Unauthorized');
    }

    return response;
};

export const API_ENDPOINTS = {
    // ... existing code ...
}; 