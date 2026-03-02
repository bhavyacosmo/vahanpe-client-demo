const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// 1. Create Order
router.post('/create-order', async (req, res) => {
    const { amount, customer_id, customer_email, customer_phone, return_url } = req.body;

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
        return res.status(500).json({ error: 'Cashfree API keys are missing. Please add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to your .env file.' });
    }

    try {
        const environment = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'
            ? 'api.cashfree.com'
            : 'sandbox.cashfree.com';

        // Order ID must be unique
        const order_id = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const response = await axios.post(`https://${environment}/pg/orders`, {
            order_amount: amount,
            order_currency: "INR",
            order_id: order_id,
            customer_details: {
                customer_id: customer_id ? String(customer_id) : "guest",
                customer_phone: customer_phone ? String(customer_phone) : "9999999999",
                customer_email: customer_email || "user@vahanpe.com"
            },
            order_meta: {
                // Not strictly required for Option 1 seamless, but safe to provide a fallback
                return_url: return_url || `http://localhost:5173/payment-status?order_id=${order_id}`
            }
        }, {
            headers: {
                "x-api-version": "2023-08-01",
                "x-client-id": process.env.CASHFREE_APP_ID,
                "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        res.json({
            payment_session_id: response.data.payment_session_id,
            order_id: response.data.order_id
        });
    } catch (error) {
        console.error('Cashfree Create Order Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create Cashfree order' });
    }
});

// 2. Verify Payment
router.post('/verify-payment', async (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ status: 'failure', message: 'Order ID is required' });
    }

    try {
        const environment = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'
            ? 'api.cashfree.com'
            : 'sandbox.cashfree.com';

        // Fetch all payments mapped to this exact order
        const response = await axios.get(`https://${environment}/pg/orders/${order_id}/payments`, {
            headers: {
                "x-api-version": "2023-08-01",
                "x-client-id": process.env.CASHFREE_APP_ID,
                "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        // Find if any payment attempt was successful
        const payments = response.data;
        const successfulPayment = Array.isArray(payments) ? payments.find(p => p.payment_status === "SUCCESS") : null;

        if (successfulPayment) {
            res.json({ status: 'success', message: 'Payment verified' });
        } else {
            res.status(400).json({ status: 'failure', message: 'No successful payment found for this order' });
        }
    } catch (error) {
        console.error('Cashfree Verify Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to verify Cashfree payment' });
    }
});

module.exports = router;
