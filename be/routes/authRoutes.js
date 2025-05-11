// routes/authRoutes.js
import express from 'express';
import { 
    register, 
    login, 
    refreshToken, 
    logout, 
    getCurrentUser 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
