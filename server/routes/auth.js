const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { sendWhatsAppOTP } = require('../services/twilioService');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Store OTPs in memory for simplicity (Production: Redis/DB)
const otpStore = {};

// 1. Send OTP
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP with expiration (5 mins)
    otpStore[phone] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    // Send via Twilio
    const result = await sendWhatsAppOTP(phone, otp);

    if (result.success) {
        res.json({ message: 'OTP sent via WhatsApp', mock: false });
    } else {
        // Fallback for Sandbox/Error: Send "Mock" success but include OTP in log
        console.log(`[Available OTP] For ${phone}: ${otp}`);
        res.json({ message: 'OTP sent (Simulation)', mock: true, otp });
    }
});

// 2. Verify OTP & Login/Register User
router.post('/verify-otp', (req, res) => {
    const { phone, otp, name } = req.body;

    const record = otpStore[phone];
    if (!record) return res.status(400).json({ error: 'OTP request not found' });
    if (Date.now() > record.expires) return res.status(400).json({ error: 'OTP expired' });
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    // OTP Valid - Clear it
    delete otpStore[phone];

    // Check if user exists, else create
    db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        if (user) {
            // Existing User - Update name if provided
            let finalName = user.name;
            if (name && name.length > 0 && name !== 'New User') {
                db.run('UPDATE users SET name = ? WHERE id = ?', [name, user.id]);
                finalName = name;
            }

            const token = jwt.sign({ id: user.id, role: 'user', phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ token, user: { name: finalName, phone: user.phone, role: 'user' } });
        } else {
            // New User
            const userName = name || 'New User';
            db.run('INSERT INTO users (phone, name) VALUES (?, ?)', [phone, userName], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                const token = jwt.sign({ id: this.lastID, role: 'user', phone }, JWT_SECRET, { expiresIn: '7d' });
                res.json({ token, user: { name: userName, phone, role: 'user' } });
            });
        }
    });
});

// 3. Admin Login
router.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const cleanUsername = username.trim().toLowerCase();

    db.get('SELECT * FROM admins WHERE username = ?', [cleanUsername], (err, admin) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!admin) {
            console.log(`[Admin Login Failed] User '${cleanUsername}' not found in DB.`);
            // Fallback for hardcoded admin if DB fails/empty (Safety Net)
            if (cleanUsername === 'admin' && password === 'admin123') {
                const token = jwt.sign({ id: 1, role: 'admin', username: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
                console.log(`[Admin Login Success] Used Hardcoded fallback.`);
                return res.json({ token, user: { name: 'Admin', role: 'admin' } });
            }
            return res.status(401).json({ error: 'Invalid Credentials (User Not Found)' });
        }

        const isMatch = bcrypt.compareSync(password, admin.password_hash);
        if (!isMatch) {
            console.log(`[Admin Login Failed] Password mismatch for '${cleanUsername}'. Hash: ${admin.password_hash.substring(0, 10)}...`);
            return res.status(401).json({ error: 'Invalid Credentials (Password Mismatch)' });
        }

        console.log(`[Admin Login Success] User '${cleanUsername}' logged in.`);
        const token = jwt.sign({ id: admin.id, role: admin.role, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { name: admin.username, role: admin.role } });
    });
});

module.exports = router;
