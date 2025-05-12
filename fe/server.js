const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080; // Frontend pada port 8080
const API_PORT = process.env.API_PORT || 3000; // Backend pada port 3000
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${API_PORT}`;

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Configure API URL based on environment
const API_URL = isProduction 
  ? 'https://notes-app-api.example.com/api' // Gunakan URL produksi jika diperlukan
  : `${BACKEND_URL}/api`;

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
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

// Configure proxy options with cookie handling for authentication
const proxyOptions = {
  target: BACKEND_URL,
  changeOrigin: true,
  secure: isProduction, // Only enforce HTTPS in production
  ws: true, // Support WebSockets
  pathRewrite: {
    '^/api': '/api' // Keep /api prefix
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
  console.log(`API proxy configured to: ${API_URL}`);
});
