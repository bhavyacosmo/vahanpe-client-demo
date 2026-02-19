const bcrypt = require('bcryptjs');
const hash = '$2b$10$ygCxdsoHGDRj5aXTBIv34.24kbqDMzO95vXXZezv5p8C9Pk8IC/tG';
const password = 'admin123';

const isMatch = bcrypt.compareSync(password, hash);
console.log(`Password '${password}' matches hash: ${isMatch}`);
