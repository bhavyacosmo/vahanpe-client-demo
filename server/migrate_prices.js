const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, '..', 'vahanpe.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    // Add columns
    db.run("ALTER TABLE services ADD COLUMN price_2W REAL DEFAULT 0", (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error("Error adding price_2W:", err.message);
        } else {
            console.log("Added price_2W column or it already exists.");
        }
    });

    db.run("ALTER TABLE services ADD COLUMN price_4W REAL DEFAULT 0", (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error("Error adding price_4W:", err.message);
        } else {
            console.log("Added price_4W column or it already exists.");
        }
    });

    db.run("ALTER TABLE services ADD COLUMN price_2W4W REAL DEFAULT 0", (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error("Error adding price_2W4W:", err.message);
        } else {
            console.log("Added price_2W4W column or it already exists.");
        }
    });

    // Populate initial values from existing price column
    db.run("UPDATE services SET price_2W = price, price_4W = price, price_2W4W = price", (err) => {
        if (err) {
            console.error("Error migrating initial prices:", err.message);
        } else {
            console.log("Successfully migrated initial prices to specific columns.");
        }
    });
});

db.close(() => {
    console.log("Migration complete.");
});
