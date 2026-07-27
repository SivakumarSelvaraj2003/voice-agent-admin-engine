import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // 1. Fetch all core users
        const [users] = await pool.query('SELECT id, name, phone_number, DATE_FORMAT(created_at, "%Y-%m-%d") as join_date FROM users ORDER BY id DESC');
        
        // 2. Fetch all addresses
        const [addresses] = await pool.query('SELECT id, user_id, address_text, is_default FROM addresses');

        // 3. Snap the addresses perfectly into their matching user
        const usersWithAddresses = users.map(user => {
            return {
                ...user,
                addresses: addresses.filter(address => address.user_id === user.id)
            };
        });

        res.json({ success: true, users: usersWithAddresses });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;