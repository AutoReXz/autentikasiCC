window.API_CONFIG = {
  DEFAULT_URL: 'https://notes-app-263444552508.us-central1.run.app',
  getApiUrl: function() { 
    // Remove trailing slash if exists to ensure consistent URL format
    return this.DEFAULT_URL.replace(/\/$/, '');
  },
  formatDate: function(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  },
  showToast: function(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, duration);
  }
};
