import express from 'express';
import pool from '../config/db.js';
import { testState } from '../config/testState.js';

const router = express.Router();

// 1. Fetch all users for the Nav Pills
router.get('/users', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, phone_number FROM users');
        res.json({ 
            success: true, 
            users: users, 
            currentActive: testState.callerPhone 
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// 2. Save the selected test phone number
router.post('/set-test-phone', (req, res) => {
    const { phone } = req.body;
    
    if (phone) {
        testState.callerPhone = phone; // Update the shared memory
        res.json({ success: true, message: 'Test phone updated', activePhone: testState.callerPhone });
    } else {
        res.status(400).json({ success: false, message: 'No phone provided' });
    }
});

export default router;