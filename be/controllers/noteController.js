import { Note } from '../models/index.js';

const getAllNotes = async (req, res) => {
    try {
        // Get only the notes belonging to the authenticated user
        const notes = await Note.findAll({
            where: { userId: req.user.id },
            order: [['updatedAt', 'DESC']]
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findOne({
            where: {
                id,
                userId: req.user.id // Ensure the note belongs to the authenticated user
            }
        });
        
        if (note) {
            res.json(note);
        } else {
            res.status(404).json({ error: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createNote = async (req, res) => {
    try {
        const { title, content, category = 'work' } = req.body; // Default to 'work' if not provided
        const note = await Note.create({ 
            title, 
            content, 
            category: category || 'work', // Ensure a category is set
            userId: req.user.id // Associate note with the authenticated user
        });
        res.status(201).json(note);
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category = 'work' } = req.body; // Default to 'work' if not provided
        
        // Find note by id and verify it belongs to the authenticated user
        const note = await Note.findOne({
            where: {
                id,
                userId: req.user.id
            }
        });
        
        if (note) {
            note.title = title;
            note.content = content;
            note.category = category || 'work'; // Ensure a category is set
            await note.save();
            res.json(note);
        } else {
            res.status(404).json({ error: 'Note not found' });
        }
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find note by id and verify it belongs to the authenticated user
        const note = await Note.findOne({
            where: {
                id,
                userId: req.user.id
            }
        });
        
        if (note) {
            await note.destroy();
            res.json({ message: 'Note deleted' });
        } else {
            res.status(404).json({ error: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// New method to get notes by category
const getNotesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const notes = await Note.findAll({
            where: { 
                category,
                userId: req.user.id // Filter by authenticated user
            },
            order: [['updatedAt', 'DESC']]
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getAllNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    getNotesByCategory
};
