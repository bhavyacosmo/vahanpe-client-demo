const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vahanpe.db');

db.serialize(() => {
    db.all("PRAGMA table_info(bookings)", (err, rows) => {
        if (err) {
            console.error("Error:", err.message);
        } else {
            console.log("Schema for bookings table:");
            rows.forEach(row => {
                console.log(`${row.name} (${row.type})`);
            });

            // Check specifically for customerName
            const hasName = rows.some(r => r.name === 'customerName');
            console.log(`\nHas customerName column: ${hasName ? 'YES' : 'NO'}`);
        }
    });
});

db.close();
