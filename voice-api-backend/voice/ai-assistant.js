import express from 'express';
import pool from '../config/db.js';
import { GoogleGenAI } from '@google/genai';
import { testState } from '../config/testState.js';

const router = express.Router();

// ==========================================
// STEP 1: INITIAL AI INTENT EXTRACTION
// ==========================================
router.post('/', async (req, res) => {
    // Initialize the Gemini API client inside the route
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Capture Twilio Data
    const speechResult = req.body.SpeechResult || '';
   const callerPhone = testState.callerPhone; // Pulled dynamically from your Settings page!
    const voiceLang = req.query.lang || 'en-IN';
    const isTamil = voiceLang === 'ta-IN';
    const voiceAttr = isTamil ? 'voice="Google.ta-IN-Wavenet-A"' : '';

    res.type('text/xml');

    if (!speechResult) {
        const fallback = isTamil ? 'மன்னிக்கவும், எனக்கு எதுவும் கேட்கவில்லை.' : 'Sorry, I did not catch that.';
        return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${fallback}</Say><Hangup/></Response>`);
    }

    try {
        const prompt = `
            Analyze this speech from a customer support phone call: "${speechResult}"
            Extract the order ID (number only) and the customer's intent. 
            The intent must be exactly one of: "cancel_order", "check_status", "delivery_issue", or "unknown".
        `;

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        intent: { 
                            type: "string", 
                            description: "The user's intent. Must be 'cancel_order', 'check_status', or 'delivery_issue'." 
                        },
                        orderId: { 
                            type: "integer", 
                            description: "The numeric order ID spoken by the user." 
                        }
                    },
                    required: ["intent", "orderId"]
                }
            }
        });

        const aiData = JSON.parse(geminiResponse.text);
        const { intent, orderId } = aiData;

        if (!orderId) {
            const noIdMsg = isTamil 
                ? 'உங்கள் ஆர்டர் எண்ணை என்னால் கண்டுபிடிக்க முடியவில்லை. தயவுசெய்து மீண்டும் கூறவும்.' 
                : 'I could not find an order number in your request. Please try again.';
            return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${noIdMsg}</Say><Hangup/></Response>`);
        }

        // ==========================================
        // VALIDATION BLOCK: Protect the Database
        // ==========================================
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

        // SECURITY CHECK: Does the caller's phone number match the order owner?
        if (order.phone_number !== callerPhone) {
            const authFailedMsg = isTamil ? 'இந்த ஆர்டர் உங்கள் எண்ணுடன் இணைக்கப்படவில்லை.' : 'This order is not linked to your phone number.';
            return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${authFailedMsg}</Say><Hangup/></Response>`);
        }

        if (intent === 'cancel_order') {
            
            // Fetch specific product details for the read-back confirmation
            const [items] = await pool.query(`
                SELECT p.name AS product_name, oi.quantity 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ? LIMIT 1
            `, [orderId]);
            
            const productName = items.length > 0 ? items[0].product_name : 'Unknown Product';
            const quantity = items.length > 0 ? items[0].quantity : 1;

            // Build the confirmation prompt reading out the database facts
            const confirmPrompt = isTamil 
                ? `உங்கள் பெயர் ${order.customer_name}. பொருள் ${productName}, எண்ணிக்கை ${quantity}, மொத்த தொகை ${order.total_amount} ரூபாய். அனைத்தும் சரியாக உள்ளதா? ரத்து செய்ய, ஆம் என்று கூறவும்.`
                : `Order found for ${order.customer_name}. Product is ${productName}, quantity is ${quantity}, total amount is ${order.total_amount} rupees. Are these correct? Say yes to proceed with cancellation.`;

            // Pass the orderId in the URL to the confirm route
            return res.send(`
                <Response>
                    <Gather input="speech" action="/api/voice/ai-assistant/confirm?orderId=${orderId}&amp;lang=${voiceLang}" method="POST" speechTimeout="auto">
                        <Say ${voiceAttr} language="${voiceLang}">${confirmPrompt}</Say>
                    </Gather>
                </Response>
            `);
            
        } else {
             const featureMsg = isTamil ? 'இந்த அம்சம் இன்னும் உருவாக்கப்படவில்லை.' : 'This feature is under construction.';
             return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${featureMsg}</Say><Hangup/></Response>`);
        }

    } catch (error) {
        console.error("AI Assistant Error:", error);
        res.send('<Response><Say>Technical difficulties. Please hang up and try again.</Say></Response>');
    }
});

// ==========================================
// STEP 2: CONFIRMATION & DATABASE EXECUTION
// ==========================================
router.post('/confirm', async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const speechResult = req.body.SpeechResult || '';
    const orderId = req.query.orderId;
    const voiceLang = req.query.lang || 'en-IN';
    const isTamil = voiceLang === 'ta-IN';
    const voiceAttr = isTamil ? 'voice="Google.ta-IN-Wavenet-A"' : '';

    res.type('text/xml');

    try {
        // Evaluate user's Yes/No response using strict JSON output
        const prompt = `The user was asked if they want to cancel their order. They replied: "${speechResult}". Did they confirm/agree?`;
        
        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        confirmed: { 
                            type: "boolean", 
                            description: "True if user said yes/agreed, False if no/disagreed." 
                        }
                    },
                    required: ["confirmed"]
                }
            }
        });

        const aiData = JSON.parse(geminiResponse.text);

        if (aiData.confirmed) {
            // Re-check the database status NOW
            const [statusRows] = await pool.query("SELECT order_status FROM orders WHERE id = ?", [orderId]);
            const currentStatus = statusRows.length > 0 ? statusRows[0].order_status : '';

            if (currentStatus === 'shipped' || currentStatus === 'delivered') {
                const tooLateMsg = isTamil 
                    ? 'மன்னிக்கவும், உங்கள் ஆர்டர் ஏற்கனவே அனுப்பப்பட்டுவிட்டது. இதை இப்போது ரத்து செய்ய முடியாது. நன்றி.' 
                    : 'We are sorry, already your order has been shipped, we cannot cancel at this time. Thank you.';
                return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${tooLateMsg}</Say></Response>`);
            } else if (currentStatus === 'cancelled') {
                const alreadyMsg = isTamil 
                    ? 'இந்த ஆர்டர் ஏற்கனவே ரத்து செய்யப்பட்டுவிட்டது.' 
                    : 'This order is already cancelled.';
                return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${alreadyMsg}</Say></Response>`);
            }

            // If it passes the checks, execute the cancellation
            await pool.query("UPDATE orders SET order_status = 'cancelled', cancelled_date = NOW() WHERE id = ?", [orderId]);
            
            const successMsg = isTamil 
                ? `உங்கள் ஆர்டர் வெற்றிகரமாக ரத்து செய்யப்பட்டது. நன்றி, வணக்கம்.` 
                : `Your order has been successfully cancelled. Thank you, goodbye.`;
                
            return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${successMsg}</Say></Response>`);
        } else {
            // Abort protocol
            const abortMsg = isTamil 
                ? `ரத்து செய்யும் செயல்முறை நிறுத்தப்பட்டது. உங்கள் ஆர்டர் பாதுகாப்பாக உள்ளது.` 
                : `Cancellation aborted. Your order is safe.`;
                
            return res.send(`<Response><Say ${voiceAttr} language="${voiceLang}">${abortMsg}</Say></Response>`);
        }

    } catch (error) {
        console.error("Confirmation Error:", error);
        res.send('<Response><Say>Error processing confirmation.</Say></Response>');
    }
});

export default router;