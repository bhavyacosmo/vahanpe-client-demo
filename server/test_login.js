const axios = require('axios');

const testLogin = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/admin/login', {
            username: 'admin',
            password: 'admin123'
        });
        console.log('Login Successful:', res.data);
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
};

testLogin();
