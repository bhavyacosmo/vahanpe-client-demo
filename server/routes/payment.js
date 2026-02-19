const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

// Initialize Razorpay only if keys are present to prevent crash on deployment
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn("⚠️ Razorpay keys missing. Payment routes will not work.");
}

// 1. Create Order
router.post('/create-order', async (req, res) => {
    if (!razorpay) {
        return res.status(500).json({ error: 'Payment gateway configuration missing' });
    }
    const { amount, currency = 'INR', receipt } = req.body;

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const options = {
        amount: Math.round(amount * 100),
        currency,
        receipt,
        payment_capture: 1 // Auto capture
    };

    try {
        const response = await razorpay.orders.create(options);
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount
        });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// 2. Verify Payment Signature
router.post('/verify-payment', (req, res) => {
    if (!razorpay) {
        return res.status(500).json({ error: 'Payment gateway configuration missing' });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        res.json({ status: 'success', message: 'Payment verified' });
    } else {
        res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
});

module.exports = router;
