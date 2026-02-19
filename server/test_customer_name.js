const axios = require('axios');

async function testBooking() {
    try {
        const booking = {
            serviceType: 'Vehicle',
            vehicleType: '4W',
            registrationNumber: 'KA01AB1234',
            registrationType: 'State',
            serviceSelected: 'Test Service',
            price: 100,
            customerPhone: '9876543210',
            customerName: 'Test User'
        };

        console.log('Creating booking with customerName: Test User');
        const res = await axios.post('http://localhost:5000/api/bookings', booking);
        console.log('Booking created:', res.data);

        // Fetch booking to verify
        const bookingId = res.data.bookingId;
        console.log(`Fetching booking ${bookingId} to verify...`);

        // Note: fetch single booking endpoint usually requires ID, but let's try to query by ID if available or check admin endpoint if auth is easy, 
        // essentially we want to check if the DB has it. 
        // Simplest is to check the response of creation if it returns the object, but it returns ID. 
        // Check `server/index.js` -> `GET /api/bookings/:id`

        const getRes = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`);
        console.log('Fetched Booking:', getRes.data);

        if (getRes.data.customerName === 'Test User') {
            console.log('SUCCESS: Customer Name was saved and retrieved correctly.');
        } else {
            console.error('FAILURE: Customer Name mismatch or missing.', getRes.data.customerName);
        }

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testBooking();
