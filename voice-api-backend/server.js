import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './admin/auth.js';
import voiceRoutes from './routes/voice.js'; // The .js extension is mandatory in ESM

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mount the route block
app.use('/api/auth', authRoutes);
app.use('/api/voice', voiceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Voice API Backend (ESM) is running on http://localhost:${PORT}`);
});