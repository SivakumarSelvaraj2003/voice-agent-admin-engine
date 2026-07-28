import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// READ: Get all menus
router.get('/', async (req, res) => {
    try {
        const [menus] = await pool.query('SELECT * FROM ivr_menus ORDER BY digit ASC');
        res.json({ success: true, menus });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE: Add a new menu option
router.post('/', async (req, res) => {
    const { digit, label, message, action_type, is_active } = req.body;
    try {
        await pool.query(
            'INSERT INTO ivr_menus (digit, label, message, action_type, is_active) VALUES (?, ?, ?, ?, ?)',
            [digit, label, message, action_type, is_active]
        );
        res.json({ success: true, message: 'Menu added successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Digit already exists!' });
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPDATE: Edit an existing menu option
router.put('/:id', async (req, res) => {
    const { digit, label, message, action_type, is_active } = req.body;
    try {
        await pool.query(
            'UPDATE ivr_menus SET digit=?, label=?, message=?, action_type=?, is_active=? WHERE id=?',
            [digit, label, message, action_type, is_active, req.params.id]
        );
        res.json({ success: true, message: 'Menu updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Digit already exists!' });
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE: Remove a menu option
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM ivr_menus WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Menu deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;