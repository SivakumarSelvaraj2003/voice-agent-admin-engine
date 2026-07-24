import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db.js'; // Snapping in your isolated database module

const router = express.Router();
const SECRET_KEY = 'super_secret_admin_key_123'; // We will move this to .env later

// Note: Added 'async' here because the database and bcrypt take time to process
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Ask the database for the user record
        const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
        
        // 2. Check if the user exists in the table at all
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = rows[0]; // Grab the first matching row

        // 3. Compare the typed password with the securely hashed database password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            // Generate the JWT payload if the passwords perfectly match
            const token = jwt.sign({ role: 'admin', user: username }, SECRET_KEY, { expiresIn: '2h' });
            
            return res.json({ success: true, token: token });
        } else {
            // Password was wrong
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
    } catch (error) {
        // Catch any database connection errors safely
        console.error("Login Server Error:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;