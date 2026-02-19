const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vahanpe.db');

db.all("SELECT * FROM admins", [], (err, rows) => {
    if (err) {
        console.log("Error querying admins table:", err.message);
    } else {
        console.log("Admins Table Content:", rows);
    }
    db.close();
});
