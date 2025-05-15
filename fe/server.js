const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Read BACKEND_URL from .env
const envPath = path.join(__dirname, '.env');
let BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^BACKEND_URL=(.*)$/m);
  if (match) {
    BACKEND_URL = match[1].trim();
  }
}

// Generate static config.js file for frontend
const configJsContent = `window.API_CONFIG = {
  DEFAULT_URL: '${BACKEND_URL}',
  getApiUrl: function() { 
    // Remove trailing slash if exists to ensure consistent URL format
    return this.DEFAULT_URL.replace(/\\/$/, '');
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
    setTimeout(() => { toast.remove(); }, duration);
  }
};\n`;
fs.writeFileSync(path.join(__dirname, 'config.js'), configJsContent);

const app = express();
const PORT = process.env.PORT || 8080;

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Backend URL: ${BACKEND_URL}`);

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
    DEFAULT_URL: '${BACKEND_URL}',
    getApiUrl: function() {
      console.log('Current API URL:', this.DEFAULT_URL);
      // Remove trailing slash if exists to ensure consistent URL format
      return this.DEFAULT_URL.replace(/\\/$/, '');
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
    '^/auth': '/api/auth' // Fix auth routing to point to /api/auth on backend
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

// Inject BACKEND_URL into HTML response
app.get('*', (req, res) => {
  try {
    // Read the HTML file
    let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    // Inject the BACKEND_URL
    html = html.replace('<%= process.env.API_URL || "/api" %>', BACKEND_URL);
    
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
