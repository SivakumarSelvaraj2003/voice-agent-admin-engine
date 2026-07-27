import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Route to fetch all products
router.get('/', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json({ success: true, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;