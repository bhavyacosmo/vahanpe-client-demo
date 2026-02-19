const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vahanpe.db');

db.all("SELECT id, name, phone, role FROM users", [], (err, rows) => {
    if (err) throw err;
    console.log("Users:", rows);
});

db.all("SELECT * FROM admins", [], (err, rows) => { // Check if there's a separate admins table
    if (err) console.log("Admins table error (might not exist):", err.message);
    else console.log("Admins Table:", rows);
});

db.close();
