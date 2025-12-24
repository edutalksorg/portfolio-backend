const express = require('express');
const router = express.Router();

// In-memory storage for newsletter subscribers (replace with database in production)
const subscribers = new Set();

// POST /api/newsletter - Subscribe to newsletter
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Check if already subscribed
        if (subscribers.has(email.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed to our newsletter'
            });
        }

        // Add to subscribers
        subscribers.add(email.toLowerCase());

        // TODO: In production, save to database and send confirmation email
        console.log(`New newsletter subscriber: ${email}`);

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to newsletter!'
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again later.'
        });
    }
});

// GET /api/newsletter/count - Get subscriber count (optional, for admin)
router.get('/count', (req, res) => {
    res.status(200).json({
        success: true,
        count: subscribers.size
    });
});

module.exports = router;
