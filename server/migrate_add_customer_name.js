const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'vahanpe.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("ALTER TABLE bookings ADD COLUMN customerName TEXT", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("Column 'customerName' already exists.");
            } else {
                console.error("Error adding column:", err.message);
            }
        } else {
            console.log("Successfully added 'customerName' column to bookings table.");
        }
    });
});

db.close();
