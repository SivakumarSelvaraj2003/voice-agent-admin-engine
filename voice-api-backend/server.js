import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Admin Routes
import authRoutes from './admin/auth.js';
import adminUserRoutes from './admin/users.js';
import adminProductRoutes from './admin/products.js';
import adminOrderRoutes from './admin/orders.js';
import adminIvrRoutes from './admin/ivr.js';
import aiAssistantRoutes from './voice/ai-assistant.js';
import orderStatusRoutes from './voice/order-status.js';
import settingsRoutes from './admin/settings.js'

// Import Voice Webhook
import voiceRoutes from './voice/call.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mount the Admin API Blocks
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/ivr', adminIvrRoutes);
app.use('/api/voice/ai-assistant', aiAssistantRoutes);
app.use('/api/voice/order-status', orderStatusRoutes);
app.use('/api/admin/settings', settingsRoutes);

// Mount the Public Voice API Block
app.use('/api/voice', voiceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Voice API Backend (ESM) is running on http://localhost:${PORT}`);
});