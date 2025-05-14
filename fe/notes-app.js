// Global variables for state management
let API_URL = '/api'; // Default value
let BACKEND_URL = ''; // Will be extracted from API_URL
let allNotes = [];
let currentCategory = 'all';
let currentView = 'grid'; // grid or list
let connectionAttempts = 0;

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    API_CONFIG.showToast(message, type);
}

// Document ready function
$(document).ready(function() {
    // Initialize API_URL from utils
    API_URL = API_CONFIG.getApiUrl();
    // Extract BACKEND_URL from API_URL by removing '/api' suffix if present
    BACKEND_URL = API_URL.endsWith('/api') ? API_URL.substring(0, API_URL.length - 4) : API_URL;
    console.log('Notes app initialized with API_URL:', API_URL);
    console.log('Backend URL extracted as:', BACKEND_URL);
    
    // Auto connect with a slight delay
    setTimeout(() => {
        connectToBackend();
    }, 500);

    // Setup event listeners
    setupEventListeners();
    setupSidebar();
});

/**
 * Connect to the backend API
 */
function connectToBackend() {
    // Show loading
    $('#notesList').html(`
        <div class="flex items-center justify-center col-span-full py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    `);
    
    // Get API URL using the consistent method
    const apiUrl = API_CONFIG.getApiUrl();
    
    // Extract BACKEND_URL from API_URL
    BACKEND_URL = apiUrl.endsWith('/api') ? apiUrl.substring(0, apiUrl.length - 4) : apiUrl;
    
    // Debug message (added more detailed logging)
    console.log('------ CONNECTION ATTEMPT LOG ------');
    console.log('Attempting to connect to API at:', apiUrl);
    console.log('Backend URL extracted as:', BACKEND_URL);
    console.log('API_CONFIG:', JSON.stringify(API_CONFIG));
    console.log('Using browser:', navigator.userAgent);
    console.log('----------------------------------');
    
    // Test connection and load notes if authenticated
    testConnection().then((response) => {
            console.log('Connection successful, response:', response);
            // Update status
            $('#connectionStatus').text('Connected').removeClass('text-red-400').addClass('text-green-400');
            showToast('Connected to backend successfully', 'success');
            
            // Check if user is authenticated
            if (checkAuthState()) {
                // User is authenticated, load notes
                setupAjaxAuth(); // Set auth headers for all AJAX requests
                getListNotes();
                showAuthenticatedUI();
            } else {
                // User is not authenticated, show login/register UI
                showUnauthenticatedUI();
            }
            
            // Reset connection attempts
            connectionAttempts = 0;
        })
        .catch(err => {
            console.error('Connection error details:', err);
            connectionAttempts++;
            console.error('Connection failed:', err);
            if (connectionAttempts < 3) {
                showToast(`Connection failed. Retrying (${connectionAttempts}/3)...`, 'error');
                setTimeout(connectToBackend, 1000);
            } else {
                showToast('Could not connect to backend. Please check the backend server.', 'error');
                $('#connectionStatus').text('Disconnected').removeClass('text-green-400').addClass('text-red-400');                $('#notesList').html(`
                    <div class="col-span-full p-8 bg-red-50 rounded-lg border border-red-200 text-center">                        <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                        <h3 class="text-xl font-bold text-red-700 mb-2">Connection Failed</h3>
                        <p class="text-red-600 mb-4">Could not connect to backend server at: <span class="font-mono font-bold">${BACKEND_URL || 'Unknown'}</span></p>
                        <p class="text-red-600 mb-4">API endpoint attempted: <span class="font-mono font-bold">${API_CONFIG.getApiUrl()}/health</span></p>
                        <div class="text-left bg-gray-100 p-3 rounded mb-4 overflow-auto max-h-48 text-sm font-mono">
                            <p class="font-bold">Praktis Troubleshooting:</p>
                            <ol class="list-decimal list-inside">
                                <li>Pastikan server backend aktif dan berjalan di <span class="font-bold">${BACKEND_URL || 'localhost:3000'}</span></li>
                                <li>Cek apakah endpoint health dapat diakses di browser: <a href="${BACKEND_URL}/health" target="_blank" class="text-blue-600 hover:underline">${BACKEND_URL}/health</a></li>
                                <li>Buka Developer Console (F12) dan lihat bagian Network untuk detail error</li>
                                <li>Periksa apakah ada masalah CORS yang memblokir request (lihat Console)</li>
                            </ol>
                        </div>
                        <button id="retryConnection" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                            Retry Connection
                        </button>
                    </div>
                `);
                $('#retryConnection').on('click', () => {
                    connectionAttempts = 0;
                    connectToBackend();
                });
            }
        });
}

/**
 * Test connection to the backend
 */
function testConnection() {
    // Parse API_URL to handle endpoints correctly
    const baseUrl = API_CONFIG.getApiUrl();
    // Try multiple health endpoints to increase chance of success
    // For Cloud Run, the health endpoint might be at root, /health, or /api/health
    const healthEndpoints = [
        baseUrl,
        `${baseUrl}/health`,
        baseUrl.endsWith('/api') ? `${baseUrl}/health` : `${baseUrl}/api/health`
    ];
    
    console.log('Will try these health endpoints in sequence:', healthEndpoints);
    
    // Try endpoints in sequence
    return tryEndpoints(healthEndpoints, 0);
}

// Helper function to try health endpoints in sequence
function tryEndpoints(endpoints, index) {
    if (index >= endpoints.length) {
        return Promise.reject({ message: 'All endpoints failed' });
    }
    
    const endpoint = endpoints[index];
    console.log(`Testing connection attempt ${index + 1}/${endpoints.length} to: ${endpoint}`);
    
    return $.ajax({
        url: endpoint,
        method: 'GET',
        timeout: 10000, // Increase timeout to 10 seconds
        beforeSend: function() {
            console.log(`Sending health check request to ${endpoint}...`);
        },
        headers: {
            'Accept': 'application/json',
        }
    })
    .then(response => {
        console.log(`Connection successful to ${endpoint}:`, response);
        return response;
    })
    .catch(error => {
        console.error(`Endpoint ${endpoint} failed:`, error);
        // Try next endpoint
        return tryEndpoints(endpoints, index + 1);
    });
}

/**
 * Setup event listeners for the application
 */
function setupEventListeners() {
    // New Note Buttons
    $('#newNoteBtnTop, #newNoteBtnSidebar, #newNoteBtnEmpty').on('click', function() {
        showNoteModal('add');
    });
    
    // Cancel note modal
    $('#cancelBtn').on('click', function() {
        $('#noteModal').addClass('hidden').removeClass('flex');
        $('body').removeClass('modal-open');
    });
    
    // Save note (create or update)
    $('#noteForm').on('submit', function(e) {
        e.preventDefault();
        
        const noteId = $('#noteId').val();
        const isEdit = noteId !== '';
        
        if (isEdit) {
            updateNote(noteId);
        } else {
            createNote();
        }
    });
    
    // Cancel delete
    $('#cancelDeleteBtn').on('click', function() {
        $('#deleteModal').addClass('hidden').removeClass('flex');
        $('body').removeClass('modal-open');
    });
    
    // Confirm delete
    $('#confirmDeleteBtn').on('click', function() {
        const noteId = $('#deleteNoteId').val();
        deleteNote(noteId);
    });
    
    // Search functionality
    $('#searchNotes, #searchNotesTop').on('input', function() {
        const query = $(this).val().toLowerCase();
        if (this.id === 'searchNotes') {
            $('#searchNotesTop').val(query);
        } else {
            $('#searchNotes').val(query);
        }
        filterNotes(query);
    });
    
    // Toggle view (grid/list)
    $('#viewToggleBtn').on('click', function() {
        toggleView();
    });
    
    // Category filters
    $('.category-filter').on('click', function(e) {
        e.preventDefault();
        const category = $(this).data('category');
        filterByCategory(category);
    });
    
    // Sidebar toggle (mobile)
    $('#sidebarToggleTop').on('click', function() {
        $('#sidebar').toggleClass('sidebar-hidden sidebar-visible');
    });
}

/**
 * Setup sidebar functionality
 */
function setupSidebar() {
    // Active category handling
    $('.category-filter').on('click', function() {
        $('.category-filter').removeClass('active bg-gray-700').addClass('hover:bg-gray-700');
        $(this).addClass('active bg-gray-700').removeClass('hover:bg-gray-700');
    });
    
    // Toggle sidebar on mobile
    $('#sidebarToggleTop').on('click', function() {
        $('#sidebar').toggleClass('sidebar-hidden sidebar-visible');
        $('#sidebar').toggleClass('-translate-x-full');
    });
    
    // Make sure the sidebar shows the current user info
    if (checkAuthState()) {
        $('#sidebarUsername').text(currentUser.username);
        $('#userInitial').text(currentUser.username.charAt(0).toUpperCase());
        $('#sidebarLogoutBtn').removeClass('hidden');
    } else {
        $('#sidebarUsername').text('Guest');
        $('#userInitial').text('G');
        $('#sidebarLogoutBtn').addClass('hidden');
    }
}

/**
 * Get all notes from the API
 */
async function getListNotes() {
    try {
        const response = await $.ajax({
            url: `${API_CONFIG.getApiUrl()}/notes`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        // Store notes globally
        allNotes = response;
          // Update UI
        updateNotesUI();
        updateCategoryCounts();
        
        // Hide any authentication required messages if present
        $('#emptyState').addClass('hidden');
        
    } catch (error) {
        console.error('Error getting notes:', error);
        if (error.status === 401) {
            // Handle authentication error
            showToast('Authentication required. Please login again.', 'error');
        } else {
            showToast('Failed to load notes. Please try again.', 'error');
        }
    }
}

/**
 * Get notes by category
 */
async function getNotesByCategory(category) {
    if (category === 'all') {
        return getListNotes();
    }
      try {
        const response = await $.ajax({
            url: `${API_CONFIG.getApiUrl()}/notes/category/${category}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        // Store filtered notes
        allNotes = response;
        
        // Update UI
        updateNotesUI();
        
    } catch (error) {
        console.error(`Error getting ${category} notes:`, error);
        showToast(`Failed to load ${category} notes. Please try again.`, 'error');
    }
}

/**
 * Get a single note by ID
 */
async function getNoteById(id) {
    try {
        return await $.ajax({
            url: `${API_CONFIG.getApiUrl()}/notes/${id}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    } catch (error) {
        console.error('Error getting note:', error);
        showToast('Failed to load note. Please try again.', 'error');
        throw error;
    }
}

/**
 * Create a new note
 */
async function createNote() {
    const title = $('#title').val();
    const content = $('#content').val();
    const category = $('#category').val();
    
    try {
        // Show loading
        $('#saveBtn').html('<i class="fas fa-spinner fa-spin"></i> Saving...').prop('disabled', true);
          const response = await $.ajax({
            url: `${API_CONFIG.getApiUrl()}/notes`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            data: JSON.stringify({ title, content, category })
        });
        
        // Close modal
        $('#noteModal').addClass('hidden').removeClass('flex');
        $('body').removeClass('modal-open');
        
        // Reset form
        $('#noteForm')[0].reset();
        
        // Refresh notes list
        getListNotes();
        
        // Show success message
        showToast('Note created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating note:', error);
        showToast('Failed to create note. Please try again.', 'error');
    } finally {
        // Reset button
        $('#saveBtn').html('Save Note').prop('disabled', false);
    }
}

/**
 * Update an existing note
 */
async function updateNote(id) {
    const title = $('#title').val();
    const content = $('#content').val();
    const category = $('#category').val();
    
    try {
        // Show loading
        $('#saveBtn').html('<i class="fas fa-spinner fa-spin"></i> Saving...').prop('disabled', true);
        
        const response = await $.ajax({
            url: `${API_CONFIG.getApiUrl()}/notes/${id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            data: JSON.stringify({ title, content, category })
        });
        
        // Close modal
        $('#noteModal').addClass('hidden').removeClass('flex');
        $('body').removeClass('modal-open');
        
        // Reset form
        $('#noteForm')[0].reset();
        
        // Refresh notes list
        getListNotes();
        
        // Show success message
        showToast('Note updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating note:', error);
        showToast('Failed to update note. Please try again.', 'error');
    } finally {
        // Reset button
        $('#saveBtn').html('Save Note').prop('disabled', false);
    }
}

/**
 * Delete a note
 */
async function deleteNote(id) {
    try {
        // Show loading
        $('#confirmDeleteBtn').html('<i class="fas fa-spinner fa-spin"></i> Deleting...').prop('disabled', true);
        
        await $.ajax({
            url: `${API_CONFIG.getApiUrl()}/notes/${id}`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        // Close modal
        $('#deleteModal').addClass('hidden').removeClass('flex');
        $('body').removeClass('modal-open');
        
        // Refresh notes list
        getListNotes();
        
        // Show success message
        showToast('Note deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting note:', error);
        showToast('Failed to delete note. Please try again.', 'error');
    } finally {
        // Reset button
        $('#confirmDeleteBtn').html('Delete').prop('disabled', false);
    }
}

/**
 * Show add/edit note modal
 */
function showNoteModal(mode, noteId) {
    // Reset form
    $('#noteForm')[0].reset();
    $('#noteId').val('');
    
    if (mode === 'edit' && noteId) {
        // Set modal title
        $('#modalTitle').text('Edit Note');
        
        // Get note data
        getNoteById(noteId)
            .then(note => {
                // Fill form with note data
                $('#noteId').val(note.id);
                $('#title').val(note.title);
                $('#content').val(note.content);
                $('#category').val(note.category || 'work');
                
                // Show modal
                $('#noteModal').removeClass('hidden').addClass('flex');
                $('body').addClass('modal-open');
            })
            .catch(error => {
                console.error('Error loading note for editing:', error);
            });
    } else {
        // Set modal title for new note
        $('#modalTitle').text('Add New Note');
        
        // Show modal
        $('#noteModal').removeClass('hidden').addClass('flex');
        $('body').addClass('modal-open');
    }
}

/**
 * Show delete confirmation modal
 */
function showDeleteModal(noteId) {
    $('#deleteNoteId').val(noteId);
    $('#deleteModal').removeClass('hidden').addClass('flex');
    $('body').addClass('modal-open');
}

/**
 * Update the notes UI with current notes
 */
function updateNotesUI() {
    const notesList = $('#notesList');
    
    // Clear existing notes
    notesList.empty();
    
    // Update counts
    $('#totalNotesCount').text(allNotes.length);
      // Check if we have notes
    if (allNotes.length > 0) {
        // Hide empty state, including "Authentication Required" message if it's showing
        $('#emptyState').addClass('hidden');
        
        // Calculate recent updates (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const recentUpdates = allNotes.filter(note => new Date(note.updatedAt) > oneDayAgo).length;
        $('#recentUpdatesCount').text(recentUpdates);
        
        // Display notes
        allNotes.forEach(note => {
            const cardHtml = generateNoteCard(note);
            notesList.append(cardHtml);
        });
        
        // Setup event listeners for the new note cards
        setupNoteCardEvents();    } else {
        // Show empty state - but only if user is authenticated
        if (checkAuthState()) {
            // User is logged in but has no notes
            $('#emptyState').removeClass('hidden').html(`
                <div class="flex flex-col items-center justify-center py-12">
                    <div class="text-gray-400 mb-4">
                        <i class="fas fa-sticky-note text-6xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">No notes found</h3>
                    <p class="text-gray-500 mb-6">Get started by creating your first note</p>
                    <button id="newNoteBtnEmpty" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2">
                        <i class="fas fa-plus"></i>
                        <span>New Note</span>
                    </button>
                </div>
            `);
            
            // Re-attach event listener to the new button
            $('#newNoteBtnEmpty').on('click', function() {
                showNoteModal();
            });
        } else {
            // User is not logged in
            $('#emptyState').removeClass('hidden');
        }
        $('#recentUpdatesCount').text('0');
    }
}

/**
 * Generate HTML for a note card
 */
function generateNoteCard(note) {
    // Format the date
    const formattedDate = API_CONFIG.formatDate(note.updatedAt);
    
    // Set category icon
    let categoryIcon = 'fa-briefcase'; // default for work
    if (note.category === 'personal') {
        categoryIcon = 'fa-user';
    } else if (note.category === 'study') {
        categoryIcon = 'fa-book';
    }
    
    return `
        <div class="note-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg fade-in" data-id="${note.id}" data-category="${note.category || 'work'}">
            <div class="p-5">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-lg font-semibold text-gray-800">${note.title}</h3>
                    <div class="flex items-center">
                        <span class="text-xs px-2 py-1 rounded-full ${
                            note.category === 'work' ? 'bg-blue-100 text-blue-800' : 
                            note.category === 'personal' ? 'bg-green-100 text-green-800' : 
                            'bg-purple-100 text-purple-800'
                        } flex items-center">
                            <i class="fas ${categoryIcon} mr-1"></i>
                            ${note.category || 'work'}
                        </span>
                    </div>
                </div>
                <p class="text-gray-600 text-sm mb-4 note-content">${note.content}</p>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">${formattedDate}</span>
                    <div class="flex space-x-2">
                        <button class="edit-note-btn text-gray-600 hover:text-blue-600" data-id="${note.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-note-btn text-gray-600 hover:text-red-600" data-id="${note.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Setup event listeners for note cards
 */
function setupNoteCardEvents() {
    // Edit note
    $('.edit-note-btn').on('click', function() {
        const noteId = $(this).data('id');
        showNoteModal('edit', noteId);
    });
    
    // Delete note
    $('.delete-note-btn').on('click', function() {
        const noteId = $(this).data('id');
        showDeleteModal(noteId);
    });
}

/**
 * Filter notes by search query
 */
function filterNotes(query) {
    if (!query) {
        // If no query, restore category filter
        filterByCategory(currentCategory, false);
        return;
    }
    
    // Filter displayed notes based on query
    $('.note-card').each(function() {
        const title = $(this).find('h3').text().toLowerCase();
        const content = $(this).find('.note-content').text().toLowerCase();
        
        if (title.includes(query) || content.includes(query)) {
            $(this).removeClass('hidden');
        } else {
            $(this).addClass('hidden');
        }
    });
    
    // Check if we have any visible notes
    const hasVisibleNotes = $('#notesList').children(':not(.hidden)').length > 0;
    if (!hasVisibleNotes) {
        // No matching notes found
        $('#emptyState')
            .removeClass('hidden')
            .html(`
                <div class="flex flex-col items-center justify-center py-12">
                    <div class="text-gray-400 mb-4">
                        <i class="fas fa-search text-6xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">No notes found</h3>
                    <p class="text-gray-500">Try a different search term</p>
                </div>
            `);
    } else {
        // We have matching notes
        $('#emptyState').addClass('hidden');
    }
}

/**
 * Filter notes by category
 */
function filterByCategory(category, updateUI = true) {
    currentCategory = category;
    
    // Update UI for selected category
    $('.category-filter').removeClass('active bg-gray-700').addClass('hover:bg-gray-700');
    $(`.category-filter[data-category="${category}"]`).addClass('active bg-gray-700').removeClass('hover:bg-gray-700');
    
    // Update header
    if (category === 'all') {
        $('#currentCategory').text('All Notes');
    } else {
        $('#currentCategory').text(`${category.charAt(0).toUpperCase() + category.slice(1)} Notes`);
    }
    
    if (updateUI) {
        // Either get all notes or fetch by category
        if (category === 'all') {
            getListNotes();
        } else {
            getNotesByCategory(category);
        }
    } else if (category !== 'all') {
        // Just filter the already loaded notes
        $('.note-card').each(function() {
            const noteCategory = $(this).data('category');
            if (noteCategory === category || category === 'all') {
                $(this).removeClass('hidden');
            } else {
                $(this).addClass('hidden');
            }
        });
        
        // Check if we have any visible notes
        const hasVisibleNotes = $('#notesList').children(':not(.hidden)').length > 0;
        if (!hasVisibleNotes) {
            // No matching notes
            $('#emptyState')
                .removeClass('hidden')
                .html(`
                    <div class="flex flex-col items-center justify-center py-12">
                        <div class="text-gray-400 mb-4">
                            <i class="fas fa-sticky-note text-6xl"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">No ${category} notes found</h3>
                        <p class="text-gray-500 mb-6">Get started by creating your first ${category} note</p>
                        <button id="newNoteBtnEmpty" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2">
                            <i class="fas fa-plus"></i>
                            <span>New ${category} Note</span>
                        </button>
                    </div>
                `);
                
            // Setup event listener for empty state button
            $('#newNoteBtnEmpty').on('click', function() {
                // Pre-select the category
                $('#category').val(category);
                showNoteModal('add');
            });
        } else {
            // We have matching notes
            $('#emptyState').addClass('hidden');
        }
    }
}

/**
 * Toggle view between grid and list
 */
function toggleView() {
    if (currentView === 'grid') {
        $('#notesList').addClass('list-view');
        $('#viewToggleBtn i').removeClass('fa-th-large').addClass('fa-list');
        currentView = 'list';
    } else {
        $('#notesList').removeClass('list-view');
        $('#viewToggleBtn i').removeClass('fa-list').addClass('fa-th-large');
        currentView = 'grid';
    }
}

/**
 * Update category counts
 */
function updateCategoryCounts() {
    // Count notes by category
    const workCount = allNotes.filter(note => note.category === 'work').length;
    const personalCount = allNotes.filter(note => note.category === 'personal').length;
    const studyCount = allNotes.filter(note => note.category === 'study').length;
    
    // Update the counts
    $('#all-count').text(allNotes.length);
    $('#work-count').text(workCount);
    $('#personal-count').text(personalCount);
    $('#study-count').text(studyCount);
    
    // Update categories count
    const uniqueCategories = [...new Set(allNotes.map(note => note.category || 'work'))].length;
    $('#categoriesCount').text(uniqueCategories);
}
