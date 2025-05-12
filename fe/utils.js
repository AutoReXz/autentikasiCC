const API_CONFIG = {
  // Base URL for API calls - using relative URL for proxy
  DEFAULT_URL: '/api',
  
  // Get the API URL - always use the relative URL for proper proxy forwarding
  getApiUrl: function() {
    // Always use the relative path that will be handled by our express proxy
    console.log('Current API URL:', this.DEFAULT_URL);
    return this.DEFAULT_URL;
  },
  
  // Format dates for display
  formatDate: function(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  },
  
  // Show toast notifications
  showToast: function(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, duration);
  }
};
