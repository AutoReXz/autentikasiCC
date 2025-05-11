// auth-script.js
$(document).ready(function() {
    // Check authentication state on page load
    setupAuth();
    
    // Setup auth-related event listeners
    setupAuthListeners();
});

// Initialize authentication state
function setupAuth() {
    // Check if we have saved auth data
    if (checkAuthState()) {
        // User is logged in
        showAuthenticatedUI();
        // Setup AJAX with auth header
        setupAjaxAuth();
    } else {
        // User is not logged in
        showUnauthenticatedUI();
    }
}

// Setup authentication event listeners
function setupAuthListeners() {
    // Show login modal
    $('#loginBtn').on('click', function() {
        $('#loginModal').removeClass('hidden').addClass('flex');
        $('body').addClass('modal-open');
    });
    
    // Show register modal
    $('#registerBtn').on('click', function() {
        $('#registerModal').removeClass('hidden').addClass('flex');
        $('body').addClass('modal-open');
    });
    
    // Hide login modal
    $('#cancelLoginBtn').on('click', function() {
        $('#loginModal').addClass('hidden').removeClass('flex');
        $('body').removeClass('modal-open');
        $('#loginError').addClass('hidden').text('');
    });
    
    // Hide register modal
    $('#cancelRegisterBtn').on('click', function() {
        $('#registerModal').addClass('hidden').removeClass('flex');
        $('body').removeClass('modal-open');
        $('#registerError').addClass('hidden').text('');
    });
    
    // Switch to register modal
    $('#showRegisterBtn').on('click', function() {
        $('#loginModal').addClass('hidden').removeClass('flex');
        $('#registerModal').removeClass('hidden').addClass('flex');
    });
    
    // Switch to login modal
    $('#showLoginBtn').on('click', function() {
        $('#registerModal').addClass('hidden').removeClass('flex');
        $('#loginModal').removeClass('hidden').addClass('flex');
    });
    
    // Handle login form submission
    $('#loginForm').on('submit', async function(e) {
        e.preventDefault();
        
        const username = $('#loginUsername').val().trim();
        const password = $('#loginPassword').val();
        
        try {
            // Show loading state
            $('#loginForm button[type="submit"]').html('<i class="fas fa-spinner fa-spin"></i> Logging in...');
            $('#loginForm button[type="submit"]').prop('disabled', true);
            
            // Attempt login
            await login(username, password);
            
            // Close modal and update UI
            $('#loginModal').addClass('hidden').removeClass('flex');
            $('body').removeClass('modal-open');
            
            // Reset form
            $('#loginForm')[0].reset();
            
            // Update UI for authenticated user
            showAuthenticatedUI();
            
            // Load user's notes
            getListNotes();
            
            showToast('Login successful!', 'success');
        } catch (error) {
            // Show error message
            $('#loginError').removeClass('hidden').text(error.error || 'Login failed. Please try again.');
        } finally {
            // Reset button state
            $('#loginForm button[type="submit"]').html('Login');
            $('#loginForm button[type="submit"]').prop('disabled', false);
        }
    });
    
    // Handle register form submission
    $('#registerForm').on('submit', async function(e) {
        e.preventDefault();
        
        const username = $('#registerUsername').val().trim();
        const email = $('#registerEmail').val().trim();
        const password = $('#registerPassword').val();
        
        try {
            // Show loading state
            $('#registerForm button[type="submit"]').html('<i class="fas fa-spinner fa-spin"></i> Registering...');
            $('#registerForm button[type="submit"]').prop('disabled', true);
            
            // Attempt registration
            await register(username, email, password);
            
            // Close modal and update UI
            $('#registerModal').addClass('hidden').removeClass('flex');
            $('body').removeClass('modal-open');
            
            // Reset form
            $('#registerForm')[0].reset();
            
            // Update UI for authenticated user
            showAuthenticatedUI();
            
            // Load user's notes (which should be none for new user)
            getListNotes();
            
            showToast('Registration successful!', 'success');
        } catch (error) {
            // Show error message
            $('#registerError').removeClass('hidden').text(error.error || 'Registration failed. Please try again.');
        } finally {
            // Reset button state
            $('#registerForm button[type="submit"]').html('Register');
            $('#registerForm button[type="submit"]').prop('disabled', false);
        }
    });
    
    // Handle logout
    $('#logoutBtn').on('click', async function() {
        try {
            await logout();
            showUnauthenticatedUI();
            showToast('Logged out successfully', 'success');
        } catch (error) {
            showToast('Logout failed', 'error');
        }
    });
}

// Update UI for authenticated user
function showAuthenticatedUI() {
    $('#authButtons').addClass('hidden');
    $('#userProfile').removeClass('hidden').addClass('flex');
    $('#usernameDisplay').text(currentUser.username);
    $('#newNoteBtnTop, #newNoteBtnSidebar, #newNoteBtnEmpty').removeClass('hidden');
}

// Update UI for unauthenticated user
function showUnauthenticatedUI() {
    $('#authButtons').removeClass('hidden');
    $('#userProfile').removeClass('flex').addClass('hidden');
    $('#newNoteBtnTop, #newNoteBtnSidebar, #newNoteBtnEmpty').addClass('hidden');
    // Clear notes list
    $('#notesList').html('');
    $('#emptyState').removeClass('hidden').html(`
        <div class="flex flex-col items-center justify-center py-12">
            <div class="text-gray-400 mb-4">
                <i class="fas fa-user-lock text-6xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Authentication Required</h3>
            <p class="text-gray-500 mb-6">Please login or register to access your notes</p>
            <div class="flex space-x-4">
                <button id="loginBtnEmpty" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
                    Login
                </button>
                <button id="registerBtnEmpty" class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg">
                    Register
                </button>
            </div>
        </div>
    `);
    
    // Setup event listeners for empty state auth buttons
    $('#loginBtnEmpty').on('click', function() {
        $('#loginModal').removeClass('hidden').addClass('flex');
        $('body').addClass('modal-open');
    });
    
    $('#registerBtnEmpty').on('click', function() {
        $('#registerModal').removeClass('hidden').addClass('flex');
        $('body').addClass('modal-open');
    });
}

// Show login modal
function showLoginModal() {
    $('#loginModal').removeClass('hidden').addClass('flex');
    $('body').addClass('modal-open');
}
