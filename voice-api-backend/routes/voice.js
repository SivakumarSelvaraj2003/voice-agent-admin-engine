import express from 'express';
import twilio from 'twilio';

const router = express.Router();
const { VoiceResponse } = twilio.twiml;

// This endpoint answers the call: POST /api/voice/incoming
router.post('/incoming', (req, res) => {
    console.log(`Incoming call from: ${req.body.From}`);

    const twiml = new VoiceResponse();

    const gather = twiml.gather({
        numDigits: 1,
        action: '/api/voice/handle-input',
        method: 'POST'
    });

    gather.say(
        { voice: 'Polly.Aditi' }, 
        'Welcome to the shop. Press 1 for support. Press 2 for store hours.'
    );

    twiml.say('No input received. Goodbye.');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
});

// This endpoint processes the key they pressed: POST /api/voice/handle-input
router.post('/handle-input', (req, res) => {
    const userDigit = req.body.Digits;
    const twiml = new VoiceResponse();

    if (userDigit === '1') {
        twiml.say('You pressed 1. We are routing you to support.');
    } else if (userDigit === '2') {
        twiml.say('We are open Monday to Friday, 9 AM to 6 PM.');
    } else {
        twiml.say('Invalid option.');
        twiml.redirect('/api/voice/incoming');
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

export default router;