import express from 'express';
import { 
    getAllNotes, 
    getNoteById, 
    createNote, 
    updateNote, 
    deleteNote, 
    getNotesByCategory 
} from '../controllers/noteController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected note routes - all routes require authentication
router.get('/notes/category/:category', authenticateToken, getNotesByCategory);  // This specific route must come before the generic :id route
router.get('/notes', authenticateToken, getAllNotes);
router.post('/notes', authenticateToken, createNote);
router.get('/notes/:id', authenticateToken, getNoteById);
router.put('/notes/:id', authenticateToken, updateNote);
router.delete('/notes/:id', authenticateToken, deleteNote);

export default router;
