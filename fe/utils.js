const API_CONFIG = {
  // Hardcoding the API URL to always use the specified Cloud Run service
  DEFAULT_URL: 'https://notes-app-263444552508.us-central1.run.app/api',
  
  // Get the API URL
  getApiUrl: function() {
    console.log('Current API URL:', this.DEFAULT_URL);
    return this.DEFAULT_URL;
  }
};
