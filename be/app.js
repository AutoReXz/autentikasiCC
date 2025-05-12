import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { initModels } from './models/index.js';
import noteRoutes from './routes/noteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { mysqlErrorMiddleware } from './utils/mysql-error-handler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080', // Use FRONTEND_URL from .env or default
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies to be sent with requests
}));

// Add a pre-flight handler for all routes
app.options('*', cors());

app.use(express.json());
app.use(cookieParser()); // Parse cookies in requests

// API routes
app.use('/api', noteRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint - buat dua endpoint supaya bisa diakses dengan /api/health dan /health
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route to indicate this is an API server
app.get('/', (req, res) => {
    res.json({
        message: 'Notes API Server',
        version: '1.0.0',
        endpoints: {
            notes: '/api/notes',
            auth: '/api/auth',
            health: '/health'
        }
    });
});

// MySQL error handling middleware
app.use(mysqlErrorMiddleware);

// General error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
});

const startServer = async () => {
    try {
        await initModels();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`API Server is running on http://0.0.0.0:${PORT}`);
            console.log(`Connected to MySQL database on ${process.env.DB_HOST}`);
        });
    } catch (error) {
        console.error('Unable to start the server:', error);
        process.exit(1);
    }
};

startServer();

