const http = require('http');

const loginData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const req = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error('Login Failed:', res.statusCode, data);
            return;
        }

        const json = JSON.parse(data);
        const token = json.token;
        console.log('Login Successful. Token received.');

        // Now Fetch Bookings
        const fetchOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/bookings',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const fetchReq = http.request(fetchOptions, (fetchRes) => {
            let fetchData = '';
            fetchRes.on('data', (chunk) => { fetchData += chunk; });
            fetchRes.on('end', () => {
                const bookings = JSON.parse(fetchData);
                console.log(`Fetched ${bookings.length} bookings.`);
                if (bookings.length > 0) {
                    console.log('Latest Booking:', bookings[0]);
                } else {
                    console.log('No bookings found via API.');
                }
            });
        });

        fetchReq.on('error', (e) => { console.error('Fetch Error:', e); });
        fetchReq.end();
    });
});

req.on('error', (e) => {
    console.error('Login Request Error:', e);
});

req.write(loginData);
req.end();
