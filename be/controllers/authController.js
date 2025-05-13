// controllers/authController.js
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// JWT token configuration
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Generate access token
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username }, 
        ACCESS_TOKEN_SECRET, 
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

// Generate refresh token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username }, 
        REFRESH_TOKEN_SECRET, 
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};

// Register user
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
          // Check if user already exists
        const existingUser = await User.findOne({ 
            where: { 
                [Op.or]: [{ username }, { email }]
            } 
        });
        
        if (existingUser) {
            return res.status(409).json({ 
                error: 'User already exists with this username or email' 
            });
        }
        
        // Create new user
        const user = await User.create({ 
            username, 
            email, 
            password 
        });
        
        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        // Save refresh token in database
        user.refreshToken = refreshToken;
        await user.save();
        
        // Send tokens
        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            accessToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username or email
        const user = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { username: username }, 
                    { email: username }
                ] 
            } 
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        // Validate password
        const isPasswordValid = await user.isValidPassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        // Save refresh token in database
        user.refreshToken = refreshToken;
        await user.save();
        
        // Send tokens
        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            accessToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token not found' });
        }
        
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        
        // Find user with this refresh token
        const user = await User.findOne({ 
            where: { 
                id: decoded.id, 
                refreshToken 
            } 
        });
        
        if (!user) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }
        
        // Generate new tokens
        const accessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        
        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await user.save();
        
        // Send new tokens
        res.cookie('refreshToken', newRefreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.json({
            message: 'Token refreshed successfully',
            accessToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(403).json({ error: 'Refresh token expired' });
        }
        
        res.status(403).json({ error: 'Invalid refresh token' });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        // Check if req.cookies exists before attempting to destructure
        const refreshToken = req.cookies?.refreshToken;
        
        if (refreshToken) {
            // Find user with this refresh token
            const user = await User.findOne({ where: { refreshToken } });
            
            if (user) {
                // Clear refresh token in database
                user.refreshToken = null;
                await user.save();
            }
        }
        
        // Clear cookie
        res.clearCookie('refreshToken');
        
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        // req.user is set by the auth middleware
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email']
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: error.message });
    }
};

export {
    register,
    login,
    refreshToken,
    logout,
    getCurrentUser,
    ACCESS_TOKEN_SECRET
};
