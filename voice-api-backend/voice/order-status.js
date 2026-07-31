import express from 'express';
import pool from '../config/db.js';
import { GoogleGenAI } from '@google/genai';
import { testState } from '../config/testState.js';

const router = express.Router();

// ==========================================
// STEP 1: ASK FOR KEYPAD INPUT
// ==========================================
router.post('/', (req, res) => {
    const voiceLang = req.query.lang || 'en-IN';
    const isTamil = voiceLang === 'ta-IN';
    const voiceAttr = isTamil ? 'voice="Google.ta-IN-Wavenet-A"' : '';

    // Prompt the user to use their keypad
    const promptMsg = isTamil 
        ? 'உங்கள் ஆர்டர் எண்ணை உங்கள் தொலைபேசியின் கீபேடில் தட்டச்சு செய்யவும், முடிவில் ஹாஷ் குறியீட்டை அழுத்தவும்.' 
        : 'Please enter your order ID using your phone keypad, followed by the hash key.';

    res.type('text/xml');
    
    // finishOnKey="#" tells Twilio to stop listening when they press hash
    res.send(`
        <Response>
            <Gather action="/api/voice/order-status/process?lang=${voiceLang}" method="POST" finishOnKey="#">
                <Say ${voiceAttr} language="${voiceLang}">${promptMsg}</Say>
            </Gather>
            <Say ${voiceAttr} language="${voiceLang}">${isTamil ? 'மன்னிக்கவும், எந்த எண்ணும் பதிவு செய்யப்படவில்லை.' : 'Sorry, no input was received.'}</Say>
            <Hangup/>
        </Response>
    `);
});

// ==========================================
// STEP 2: PROCESS DB & AI CONVERSATION
// ==========================================
router.post('/process', async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Twilio sends keypad presses in req.body.Digits
    const orderId = req.body.Digits; 
   const callerPhone = testState.callerPhone; // Pulled dynamically from your Settings page!
    const voiceLang = req.query.lang || 'en-IN';
    const isTamil = voiceLang === 'ta-IN';
    const voiceAttr = isTamil ? 'voice="Google.ta-IN-Wavenet-A"' : '';

    res.type('text/xml');

    try {
        // 1. Database Lookup
        // Note: Assuming you have tracking info in your DB. Adjust column names if needed.
        const [orderRows] = await pool.query(`
            SELECT o.id, o.order_status, o.total_amount, u.phone_number, u.name as customer_name
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        `, [orderId]);

        if (orderRows.length === 0) {
            const noOrderMsg = isTamil ? `ஆர்டர் எண் ${orderId} கிடைக்கவில்லை.` : `Order number ${orderId} was not found.`;
            return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${noOrderMsg}</Say><Hangup/></Response>`);
        }

        const order = orderRows[0];

        // 2. Security Check
        if (order.phone_number !== callerPhone) {
            const authFailedMsg = isTamil ? 'இந்த ஆர்டர் உங்கள் எண்ணுடன் இணைக்கப்படவில்லை.' : 'This order is not linked to your phone number.';
            return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${authFailedMsg}</Say><Hangup/></Response>`);
        }

        // 3. AI Context Generation
        // We pass the raw database facts to Gemini and ask it to write a natural sentence.
       const prompt = `
            You are a customer support voice AI. 
            Customer Name: ${order.customer_name}
            Order ID: ${order.id}
            Current Status: "${order.order_status}"
            
            Write a very short, friendly 1-2 sentence response explaining this status to the customer.
            ${isTamil 
                ? 'CRITICAL RULE: The output MUST be in Tamil. You are allowed to use common English words written in Tamil script (like "ஆர்டர்" for order). DO NOT provide an English translation at the end. Output ONLY the Tamil sentence and absolutely nothing else.' 
                : 'CRITICAL RULE: Write the response entirely in English. Output ONLY the English sentence.'}
        `;

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt
            // Notice we are NOT using JSON mode here, because we *want* natural conversational text for Twilio to speak!
        });

        const aiSpokenResponse = geminiResponse.text.trim();

        // 4. Speak the AI's answer and hang up gracefully
        res.send(`
            <Response>
                <Say ${voiceAttr} language="${voiceLang}">${aiSpokenResponse}</Say>
                <Say ${voiceAttr} language="${voiceLang}">${isTamil ? 'நன்றி, வணக்கம்.' : 'Thank you, goodbye.'}</Say>
                <Hangup/>
            </Response>
        `);

    } catch (error) {
        console.error("Order Status Error:", error);
        res.send('<Response><Say>Technical difficulties. Please try again.</Say></Response>');
    }
});

export default router;