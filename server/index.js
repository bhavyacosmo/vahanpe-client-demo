const express = require('express');
const cors = require('cors');
const { db, generateBookingId } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const { authenticateToken, isAdmin } = require('./middleware/authMiddleware');

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// 1. Create Booking
app.post('/api/bookings', (req, res) => {
    const {
        serviceType, vehicleType, registrationNumber, registrationType,
        licenceIssuedFrom, licenceClass, serviceSelected, serviceDescription,
        customerPhone, customerName, price
    } = req.body;

    generateBookingId((err, bookingId) => {
        if (err) return res.status(500).json({ error: 'Failed to generate Booking ID' });

        const stmt = db.prepare(`
      INSERT INTO bookings (
        bookingId, serviceType, vehicleType, registrationNumber, registrationType,
        licenceIssuedFrom, licenceClass, serviceSelected, serviceDescription,
        customerPhone, customerName, price, status, feasibilityStatus, refundStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmation Fee Paid', 'Pending', 'Pending')
    `);

        stmt.run(
            bookingId, serviceType, vehicleType, registrationNumber, registrationType,
            licenceIssuedFrom, licenceClass, serviceSelected, serviceDescription,
            customerPhone, customerName, price,
            function (err) {
                if (err) return res.status(500).json({ error: err.message });

                // Send WhatsApp Confirmation
                const { sendWhatsAppMessage } = require('./services/twilioService');
                const message = `🚗 *Booking Received*\n\nHi, we have received your request for *${serviceSelected}*.\nBooking ID: *${bookingId}*\n\nWe will process it shortly. Track status: http://localhost:5173/my-services`;
                sendWhatsAppMessage(customerPhone, message);

                res.status(201).json({ id: this.lastID, bookingId, message: 'Booking created successfully' });
            }
        );
        stmt.finalize();
    });
});

// 2. Get All Bookings (Admin)
app.get('/api/bookings', authenticateToken, isAdmin, (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2a. Get User Bookings (Public/Consumer)
app.get('/api/bookings/user/:phone', (req, res) => {
    const { phone } = req.params;
    db.all('SELECT * FROM bookings WHERE customerPhone = ? ORDER BY createdAt DESC', [phone], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. Get Single Booking
app.get('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const isUUID = id.startsWith('VH-');
    const query = isUUID ? 'SELECT * FROM bookings WHERE bookingId = ?' : 'SELECT * FROM bookings WHERE id = ?';

    db.get(query, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Booking not found' });
        res.json(row);
    });
});

// 4. Update Booking Status (Admin) & WhatsApp Logic
app.patch('/api/bookings/:id/status', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const { status, feasibilityStatus, refundStatus } = req.body;

    // Retrieve current booking to check for changes
    db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, booking) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        let newStatus = status || booking.status;
        let newFeasibility = feasibilityStatus || booking.feasibilityStatus;
        let newRefund = refundStatus || booking.refundStatus;
        let whatsappSent = booking.last_whatsapp_status_sent;

        // Feasibility Logic: If marked 'Not Doable', force Cancelled & Refund Processed
        if (feasibilityStatus === 'Not Doable') {
            newStatus = 'Not Serviceable'; // Or 'Cancelled'
            newRefund = 'Processed';
        } else if (feasibilityStatus === 'Doable' && booking.feasibilityStatus === 'Pending') {
            newStatus = 'Service Booked';
        }

        // WhatsApp Logic (Real)
        if (newStatus !== booking.status && newStatus !== whatsappSent) {
            console.log(`[WhatsApp] Sending update to ${booking.customerPhone}: Status changed to ${newStatus}`);

            const { sendWhatsAppMessage } = require('./services/twilioService');
            // Template message for status update
            const message = `🚗 *VahanPe Update*\n\nYour application (${booking.serviceSelected}) status has been updated to: *${newStatus}*.\n\n${newStatus === 'Service Booked' ? 'We have received your request and will process it shortly.' : ''}${newStatus === 'Documents Picked Up' ? 'Our agent has picked up your documents.' : ''}\n\nTrack here: http://localhost:5173/my-services`;

            sendWhatsAppMessage(booking.customerPhone, message);
            whatsappSent = newStatus;
        }

        const updateStmt = db.prepare(`
      UPDATE bookings SET status = ?, feasibilityStatus = ?, refundStatus = ?, last_whatsapp_status_sent = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);

        updateStmt.run(newStatus, newFeasibility, newRefund, whatsappSent, id, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Booking updated', status: newStatus, feasibilityStatus: newFeasibility, refundStatus: newRefund });
        });
        updateStmt.finalize();
    });
});

// 5. Get All Services (Public)
app.get('/api/services', (req, res) => {
    db.all('SELECT * FROM services', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 6. Update Service Price (Admin)
app.patch('/api/services/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || isNaN(price)) {
        return res.status(400).json({ error: 'Valid price is required' });
    }

    const stmt = db.prepare('UPDATE services SET price = ? WHERE id = ?');
    stmt.run(price, id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Service not found' });
        res.json({ message: 'Service price updated', id, price });
    });
    stmt.finalize();
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
