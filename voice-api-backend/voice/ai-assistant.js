import express from 'express';
import pool from '../config/db.js';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/', async (req, res) => {
    // 1. Capture Twilio Data
    const speechResult = req.body.SpeechResult || '';
    const callerPhone = req.body.From; // e.g., +919876543210
    const voiceLang = req.query.lang || 'en-IN';
    const isTamil = voiceLang === 'ta-IN';
    const voiceAttr = isTamil ? 'voice="Google.ta-IN-Wavenet-A"' : '';

    res.type('text/xml');

    if (!speechResult) {
        const fallback = isTamil ? 'மன்னிக்கவும், எனக்கு எதுவும் கேட்கவில்லை.' : 'Sorry, I did not catch that.';
        return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${fallback}</Say><Hangup/></Response>`);
    }

    try {
        // ==========================================
        // AI BLOCK: Extract Data via Gemini
        // ==========================================
        const prompt = `
            Analyze this speech from a customer support phone call: "${speechResult}"
            Extract the order ID (number only) and the customer's intent. 
            The intent must be exactly one of: "cancel_order", "check_status", "delivery_issue", or "unknown".
            If they mention a reason for cancellation or the issue, extract that as "reason".
        `;

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Lightning fast model for voice applications
            contents: prompt,
            config: {
                // Force strict JSON output so it never hallucinates conversational text
                responseMimeType: "application/json" 
            }
        });

        // Parse the JSON output from Gemini
        const aiData = JSON.parse(geminiResponse.text);
        const { intent, orderId } = aiData;

        // If AI couldn't find an order ID, gracefully ask again
        if (!orderId) {
            const noIdMsg = isTamil 
                ? 'உங்கள் ஆர்டர் எண்ணை என்னால் கண்டுபிடிக்க முடியவில்லை. தயவுசெய்து மீண்டும் கூறவும்.' 
                : 'I could not find an order number in your request. Please try again.';
            return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${noIdMsg}</Say><Hangup/></Response>`);
        }

        // ==========================================
        // VALIDATION BLOCK: Protect the Database
        // ==========================================
        
        // Lookup the order AND the user's phone number to verify ownership
        const [orderRows] = await pool.query(`
            SELECT o.id, o.order_status, u.phone_number 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        `, [orderId]);

        if (orderRows.length === 0) {
            const noOrderMsg = isTamil 
                ? `ஆர்டர் எண் ${orderId} கிடைக்கவில்லை.` 
                : `Order number ${orderId} was not found.`;
            return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${noOrderMsg}</Say><Hangup/></Response>`);
        }

        const order = orderRows[0];

        // SECURITY CHECK: Does the caller's phone number match the order owner?
        if (order.phone_number !== callerPhone) {
            const authFailedMsg = isTamil 
                ? 'மன்னிக்கவும், இந்த ஆர்டர் உங்கள் தொலைபேசி எண்ணுடன் இணைக்கப்படவில்லை.' 
                : 'Sorry, this order is not linked to your current phone number. Security check failed.';
            return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${authFailedMsg}</Say><Hangup/></Response>`);
        }

        // ==========================================
        // BUSINESS LOGIC & MYSQL EXECUTION
        // ==========================================
        let finalMessage = '';

        if (intent === 'cancel_order') {
            if (order.order_status === 'shipped' || order.order_status === 'delivered') {
                finalMessage = isTamil 
                    ? `உங்கள் ஆர்டர் ஏற்கனவே அனுப்பப்பட்டுவிட்டது. இதை இப்போது ரத்து செய்ய முடியாது.` 
                    : `Your order has already been shipped and cannot be cancelled at this time.`;
            } else if (order.order_status === 'cancelled') {
                finalMessage = isTamil 
                    ? `இந்த ஆர்டர் ஏற்கனவே ரத்து செய்யப்பட்டுவிட்டது.` 
                    : `This order is already cancelled.`;
            } else {
                // Execute the cancellation
                await pool.query("UPDATE orders SET order_status = 'cancelled', cancelled_date = NOW() WHERE id = ?", [orderId]);
                finalMessage = isTamil 
                    ? `உங்கள் ஆர்டர் எண் ${orderId} வெற்றிகரமாக ரத்து செய்யப்பட்டது.` 
                    : `Your order number ${orderId} has been successfully cancelled.`;
            }
        } else {
            // Handle other intents like 'check_status'
            finalMessage = isTamil 
                ? `உங்கள் கோரிக்கை பெறப்பட்டது, ஆனால் இந்த அம்சம் இன்னும் உருவாக்கப்படவில்லை.` 
                : `Your request was understood, but this feature is still under construction.`;
        }

        // Send the final voice confirmation back to the caller
        res.send(`
            <Response>
                <Say ${voiceAttr} language="${voiceLang}">${finalMessage}</Say>
                <Say ${voiceAttr} language="${voiceLang}">${isTamil ? 'நன்றி, வணக்கம்.' : 'Thank you, goodbye.'}</Say>
            </Response>
        `);

    } catch (error) {
        console.error("AI Assistant Error:", error);
        res.send('<Response><Say>Technical difficulties with the AI assistant. Please hang up and try again.</Say></Response>');
    }
});

export default router;