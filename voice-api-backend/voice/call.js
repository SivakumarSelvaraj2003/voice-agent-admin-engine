import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// ==========================================
// STEP 1: The Initial Greeting (Language Selection)
// ==========================================
router.post('/incoming', (req, res) => {
    // 1 for English, 2 for Tamil
    const xmlResponse = `
        <Response>
            <Gather numDigits="1" action="/api/voice/main-menu" method="POST">
                <Say language="en-IN">For English, press 1.</Say>
                <!-- Using Google Wavenet for high-quality Tamil TTS -->
                <Say voice="Google.ta-IN-Wavenet-A" language="ta-IN">தமிழிற்கு 2 ஐ அழுத்தவும்.</Say>
            </Gather>
            <Say language="en-IN">We didn't receive any input. Goodbye!</Say>
        </Response>
    `;
    res.type('text/xml');
    res.send(xmlResponse);
});

// ==========================================
// STEP 2: Generate the Dynamic Menu based on Language
// ==========================================
router.post('/main-menu', async (req, res) => {
    const languageChoice = req.body.Digits;

    // 2 is Tamil, 1 (or anything else) is English
    let isTamil = languageChoice === '2'; 
    
    let voiceLang = isTamil ? 'ta-IN' : 'en-IN';
    // Apply Google Wavenet voice if Tamil
    let voiceAttr = isTamil ? 'voice="Google.ta-IN-Wavenet-A"' : ''; 
    let introText = isTamil ? 'வாடிக்கையாளர் சேவைக்கு நல்வரவு. ' : 'Welcome to the shop. ';

    try {
        const [menus] = await pool.query('SELECT digit, message_english, message_tamil FROM ivr_menus WHERE is_active = true ORDER BY digit ASC');

        let aiGreeting = introText;
        menus.forEach(menu => {
            aiGreeting += isTamil ? `${menu.message_tamil} ` : `${menu.message_english} `;
        });

        const xmlResponse = `
            <Response>
                <Gather numDigits="1" action="/api/voice/process-digit?lang=${voiceLang}" method="POST">
                    <Say ${voiceAttr} language="${voiceLang}">${aiGreeting}</Say>
                </Gather>
                <Say ${voiceAttr} language="${voiceLang}">Goodbye!</Say>
            </Response>
        `;
        
        res.type('text/xml');
        res.send(xmlResponse);
    } catch (error) {
        console.error("Error generating IVR menu:", error);
        res.type('text/xml');
        res.send('<Response><Say>Technical difficulties. Please try again.</Say></Response>');
    }
});

// ==========================================
// STEP 3: Process the Menu Choice & Hand off to AI
// ==========================================
router.post('/process-digit', async (req, res) => {
    const digitPressed = req.body.Digits;
    const voiceLang = req.query.lang || 'en-IN';
    const isTamil = voiceLang === 'ta-IN';
    // Apply Google Wavenet voice if Tamil
    const voiceAttr = isTamil ? 'voice="Google.ta-IN-Wavenet-A"' : ''; 

    try {
        const [menuItem] = await pool.query(
            'SELECT action_type FROM ivr_menus WHERE digit = ? AND is_active = true',
            [digitPressed]
        );

        if (menuItem.length === 0) {
            const errorMsg = isTamil
                ? 'தவறான உள்ளீடு. மீண்டும் முயற்சிக்கவும்.'
                : 'Invalid input. Please try again.';
            
            return res.send(`
                <Response>
                    <Say ${voiceAttr} language="${voiceLang}">${errorMsg}</Say>
                    <Redirect method="POST">/api/voice/main-menu</Redirect>
                </Response>
            `);
        }

        const actionType = menuItem[0].action_type;
        let xmlResponse = '';

       switch (actionType) {
            case 'check_order':
                // Redirect straight to our new DTMF (Keypad) block
                xmlResponse = `
                    <Response>
                        <Redirect method="POST">/api/voice/order-status?lang=${voiceLang}</Redirect>
                    </Response>
                `;
                break;

            case 'cancel_order':
            case 'delivery_issue':
                const aiPrompt = isTamil
                    ? 'நான் உங்கள் ஏஐ உதவியாளர். உங்கள் ஆர்டர் எண்ணை தெரிவிக்கவும்.'
                    : 'I am your AI assistant. Please tell me your order ID or how I can help you today.';
                
                xmlResponse = `
                    <Response>
                        <Gather input="speech" action="/api/voice/ai-assistant?action=${actionType}&amp;lang=${voiceLang}" method="POST" speechTimeout="auto">
                            <Say ${voiceAttr} language="${voiceLang}">${aiPrompt}</Say>
                        </Gather>
                    </Response>
                `;
                break;

            case 'product_details':
                const productPrompt = isTamil
                    ? 'தயாரிப்பு எண்ணை உள்ளிட்டு ஹேஷ் குறியீட்டை அழுத்தவும்.'
                    : 'Please enter the Product ID followed by the hash key.';
                
                xmlResponse = `
                    <Response>
                        <Gather action="/api/voice/handle-product?lang=${voiceLang}" method="POST" finishOnKey="#">
                            <Say ${voiceAttr} language="${voiceLang}">${productPrompt}</Say>
                        </Gather>
                    </Response>
                `;
                break;

           case 'transfer_agent':
                const transferMsg = isTamil
                    ? 'நீங்கள் மனித வாடிக்கையாளர் சேவையைத் தேர்ந்தெடுத்துள்ளீர்கள். எங்கள் வாடிக்கையாளர் சேவை குழுவிற்கு இணைக்கப்படுகிறது. காத்திருக்கவும்.'
                    : 'You requested human customer support. Connecting to our customer support team. Please wait.';
                
                xmlResponse = `
                    <Response>
                        <Say ${voiceAttr} language="${voiceLang}">${transferMsg}</Say>
                        <Dial>+919361343013</Dial>
                    </Response>
                `;
                break;
            
            default:
                xmlResponse = `<Response><Say ${voiceAttr} language="${voiceLang}">Thank you. Goodbye.</Say></Response>`;
        }

        res.type('text/xml');
        res.send(xmlResponse);
    } catch (error) {
        console.error("Error processing digit:", error);
        res.type('text/xml');
        res.send('<Response><Say>Technical error. Please hang up and try again.</Say></Response>');
    }
});

export default router;