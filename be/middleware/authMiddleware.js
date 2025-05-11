// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../controllers/authController.js';

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ error: 'Access token is required' });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        
        // Attach user info to request object
        req.user = decoded;
        
        // Continue to the next middleware/route handler
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Access token expired' });
        }
        
        return res.status(403).json({ error: 'Invalid access token' });
    }
};

export { authenticateToken };
