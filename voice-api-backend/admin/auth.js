import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SECRET_KEY = 'super_secret_admin_key_123'; // We will move this to .env later

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Hardcoded admin check (We will swap this with a MySQL query next!)
    if (username === 'admin' && password === 'shop123') {
        
        // Generate the JWT payload
        const token = jwt.sign({ role: 'admin', user: username }, SECRET_KEY, { expiresIn: '2h' });
        
        return res.json({ success: true, token: token });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

export default router;