const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vahanpe.db', (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connected to the database.');
});

db.all('SELECT * FROM bookings ORDER BY createdAt DESC LIMIT 5', [], (err, rows) => {
    if (err) {
        throw err;
    }
    console.log("Found " + rows.length + " rows.");
    rows.forEach((row) => {
        console.log(JSON.stringify(row));
    });
    db.close();
});
