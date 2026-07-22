import express from 'express';
import twilio from 'twilio';

const router = express.Router();
const { VoiceResponse } = twilio.twiml;

// BLOCK 1: Main Menu (Language Selection)
router.post('/incoming', (req, res) => {
    const twiml = new VoiceResponse();

    const gather = twiml.gather({
        numDigits: 1,
        action: '/api/voice/department-menu',
        method: 'POST'
    });

    gather.say(
        { voice: 'Polly.Aditi' }, 
        'Welcome to the shop. For English, press 1. For Tamil, press 2.'
    );

    twiml.say('No input received. Goodbye.');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
});

// BLOCK 2: Department Menu (Account, Order, Complaints)
router.post('/department-menu', (req, res) => {
    const languageDigit = req.body.Digits; // 1 = English, 2 = Tamil
    const twiml = new VoiceResponse();

    const gather = twiml.gather({
        numDigits: 1,
        action: `/api/voice/connect-call?lang=${languageDigit}`,
        method: 'POST'
    });

    if (languageDigit === '1') {
        // English Menu (Amazon Polly)
        gather.say(
            { voice: 'Polly.Aditi' }, 
            'For account verification, press 1. For order details, press 2. For any complaints, press 3.'
        );
    } else if (languageDigit === '2') {
        // Native Tamil Menu (Google Neural Voice)
        gather.say(
            { 
                voice: 'Google.ta-IN-Wavenet-A', 
                language: 'ta-IN' 
            }, 
            'கணக்கு சரிபார்ப்புக்கு, ஒன்றை அழுத்தவும். ஆர்டர் விவரங்களுக்கு, இரண்டை அழுத்தவும். புகார்களுக்கு, மூன்றை அழுத்தவும்.'
        );
    } else {
        twiml.say('Invalid option.');
        twiml.redirect('/api/voice/incoming');
        return res.type('text/xml').send(twiml.toString());
    }

    twiml.say('No input received. Goodbye.');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
});

// BLOCK 3: Final Routing (Connect to Human)
router.post('/connect-call', (req, res) => {
    const departmentDigit = req.body.Digits; // 1, 2, or 3
    const language = req.query.lang;         
    const twiml = new VoiceResponse();

    if (language === '1') {
        twiml.say({ voice: 'Polly.Aditi' }, 'Please wait while we connect you to our team.');
    } else {
        twiml.say(
            { 
                voice: 'Google.ta-IN-Wavenet-A', 
                language: 'ta-IN' 
            }, 
            'தயவுசெய்து காத்திருக்கவும், எங்கள் குழுவினரோடு இணைக்கிறோம்.'
        );
    }

    // IMPORTANT: Replace with your actual mobile phone number
    twiml.dial('+19876543210'); 

    res.type('text/xml');
    res.send(twiml.toString());
});

// BLOCK 3: Final Routing (Connect to Human)
router.post('/connect-call', (req, res) => {
    const departmentDigit = req.body.Digits; // 1, 2, or 3
    const language = req.query.lang;         // Retrieved from the URL
    const twiml = new VoiceResponse();

    // You can customize the response based on the exact department (1, 2, or 3) 
    // or just play a standard bridging message.
    if (language === '1') {
        twiml.say({ voice: 'Polly.Aditi' }, 'Please wait while we connect you to our team.');
    } else {
        twiml.say({ voice: 'Polly.Aditi' }, 'Thayavu seidhu kaathirukkavum, engal kuzhuvinarodu inaikkirom.');
    }

    // Dial your actual phone number
    // IMPORTANT: Replace this dummy number with your real cell phone!
    twiml.dial('+919361343013'); 

    res.type('text/xml');
    res.send(twiml.toString());
});

export default router;