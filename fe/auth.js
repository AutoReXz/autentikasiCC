// auth.js
// Authentication state
let currentUser = null;
let accessToken = null;

// Check if user is already logged in (from localStorage)
function checkAuthState() {
    // Try to get saved auth data
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        accessToken = savedToken;
        currentUser = JSON.parse(savedUser);
        return true;
    }
    return false;
}

// Register new user
async function register(username, email, password) {
    try {
        const response = await $.ajax({
            url: `${API_URL}/auth/register`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, email, password })
        });
        
        // Save auth data
        accessToken = response.accessToken;
        currentUser = response.user;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        return response;
    } catch (error) {
        console.error('Registration error:', error);
        throw error.responseJSON || { error: 'Registration failed' };
    }
}

// Login user
async function login(username, password) {
    try {
        const response = await $.ajax({
            url: `${API_URL}/auth/login`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password })
        });
        
        // Save auth data
        accessToken = response.accessToken;
        currentUser = response.user;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        return response;
    } catch (error) {
        console.error('Login error:', error);
        throw error.responseJSON || { error: 'Login failed' };
    }
}

// Refresh token
async function refreshToken() {
    try {
        const response = await $.ajax({
            url: `${API_URL}/auth/refresh-token`,
            method: 'POST',
            xhrFields: {
                withCredentials: true // Send cookies with request
            }
        });
        
        // Update access token
        accessToken = response.accessToken;
        localStorage.setItem('accessToken', accessToken);
        
        return response;
    } catch (error) {
        console.error('Token refresh error:', error);
        // If refresh fails, user needs to login again
        logout();
        throw error.responseJSON || { error: 'Token refresh failed' };
    }
}

// Logout user
async function logout() {
    try {
        // Call logout endpoint to invalidate refresh token
        await $.ajax({
            url: `${API_URL}/auth/logout`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            xhrFields: {
                withCredentials: true // Send cookies with request
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local auth data regardless of API success
        accessToken = null;
        currentUser = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    }
}

// Get current user info
async function getCurrentUser() {
    try {
        const response = await $.ajax({
            url: `${API_URL}/auth/me`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        currentUser = response.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        return response;
    } catch (error) {
        console.error('Get user error:', error);
        if (error.status === 401) {
            // Token expired, try to refresh
            try {
                await refreshToken();
                // Retry the request
                return getCurrentUser();
            } catch (refreshError) {
                // Refresh failed, logout
                logout();
            }
        }
        throw error.responseJSON || { error: 'Failed to get user data' };
    }
}

// Setup auth header for all AJAX requests
function setupAjaxAuth() {
    // Add Authorization header to all AJAX requests
    $.ajaxSetup({
        beforeSend: function(xhr) {
            if (accessToken) {
                xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
            }
        }
    });
}

// Handle authentication errors in AJAX requests
$(document).ajaxError(function(event, jqXHR, ajaxSettings) {
    // Skip auth-related URLs to prevent infinite loops
    if (ajaxSettings.url.includes('/auth/')) {
        return;
    }
    
    if (jqXHR.status === 401) {
        // Token expired, try to refresh
        refreshToken()
            .then(() => {
                // Retry the original request
                $.ajax({
                    url: ajaxSettings.url,
                    type: ajaxSettings.type,
                    data: ajaxSettings.data,
                    contentType: ajaxSettings.contentType,
                    success: ajaxSettings.success
                });
            })
            .catch(() => {
                // Refresh failed, show login form
                showLoginModal();
            });
    }
});
