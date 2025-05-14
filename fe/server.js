const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL;

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Configure API URL based on environment
const API_URL = isProduction 
  ? process.env.BACKEND_URL || 'https://notes-app-api.example.com/api' // Gunakan URL yang disediakan atau default produksi
  : `${BACKEND_URL}/api`;

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`API URL: ${API_URL}`);

// Add CORS headers middleware 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Expose API configuration to client-side scripts
app.get('/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`window.API_CONFIG = {
    DEFAULT_URL: '${API_URL}',
    getApiUrl: function() {
      console.log('Current API URL:', this.DEFAULT_URL);
      return this.DEFAULT_URL;
    },
    formatDate: function(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    showToast: function(message, type = 'info', duration = 3000) {
      const toast = document.createElement('div');
      toast.className = \`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 \${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
      }\`;
      toast.innerHTML = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, duration);
    }
  };`);
});

// Configure proxy options with cookie handling for authentication
const proxyOptions = {
  target: BACKEND_URL,
  changeOrigin: true,
  secure: isProduction, // Only enforce HTTPS in production
  ws: true, // Support WebSockets
  pathRewrite: {
    '^/api': '/api', // Keep /api prefix, making requests go to /api on backend
    '^/auth': '/auth' // Fix auth routing to point to /auth on backend
  },
  cookieDomainRewrite: {
    '*': '' // Rewrite cookie domain to match frontend
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    console.error(`Failed to proxy request to ${BACKEND_URL}`);
    res.status(500).send('Backend service unavailable. Please try again later.');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log responses for debugging
    console.log(`Proxy: ${req.method} ${req.path} => ${proxyRes.statusCode}`);
  }
};

// Log all requests to API for debugging
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.url}`);
  next();
});

// Proxy API requests to backend
app.use('/api', createProxyMiddleware(proxyOptions));

// Proxy auth requests to backend
app.use('/auth', createProxyMiddleware(proxyOptions));

// Serve static files from current directory
app.use(express.static(__dirname));

// Provide health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Inject API URL into HTML response
app.get('*', (req, res) => {
  try {
    // Read the HTML file
    let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    // Inject the API URL
    html = html.replace('<%= process.env.API_URL || "/api" %>', API_URL);
    
    // Send the modified HTML
    res.send(html);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error loading application');
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
  console.log(`Backend proxied at: ${BACKEND_URL}`);
});
