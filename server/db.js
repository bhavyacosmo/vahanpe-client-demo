const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'vahanpe.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create Tables: Bookings, Users, Admins
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookingId TEXT UNIQUE NOT NULL,
    serviceType TEXT CHECK(serviceType IN ('Vehicle', 'Driving Licence')) NOT NULL,
    vehicleType TEXT CHECK(vehicleType IN ('2W', '4W', '2W+4W')),
    registrationNumber TEXT,
    registrationType TEXT,
    licenceIssuedFrom TEXT,
    licenceClass TEXT,
    serviceSelected TEXT NOT NULL,
    serviceDescription TEXT,
    status TEXT CHECK(status IN ('Confirmation Fee Paid', 'Service Booked', 'Documents Picked Up', 'Processing', 'Last Stage', 'Delivered', 'Cancelled', 'Not Serviceable')) NOT NULL DEFAULT 'Confirmation Fee Paid',
    feasibilityStatus TEXT CHECK(feasibilityStatus IN ('Pending', 'Doable', 'Not Doable')) NOT NULL DEFAULT 'Pending',
    refundStatus TEXT CHECK(refundStatus IN ('Pending', 'Processed', 'N/A')) NOT NULL DEFAULT 'Pending',
    last_whatsapp_status_sent TEXT,
    customerPhone TEXT NOT NULL,
    customerName TEXT,
    price REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    name TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
      CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    type TEXT,
    category TEXT CHECK(category IN ('Vehicle', 'Driving Licence')),
    iconName TEXT
  );
`;

const bcrypt = require('bcryptjs');

// Initial Services Data for Seeding
const INITIAL_SERVICES = [
  // Vehicle Services
  { id: 'transfer_ownership', title: 'Transfer of Ownership', description: 'RC transfer support for vehicle sale or purchase.', price: 1500, type: 'KA', category: 'Vehicle', iconName: 'Car' },
  { id: 'hypothecation_termination', title: 'Hypothecation Termination', description: 'Remove bank/finance hypothecation after loan closure.', price: 1200, type: 'KA', category: 'Vehicle', iconName: 'Shield' },
  { id: 'address_change', title: 'Address Change in RC', description: 'Update RC address within the same state registration.', price: 800, type: 'KA', category: 'Vehicle', iconName: 'FileText' },
  { id: 'mobile_update_rc', title: 'Mobile Number Update (RC)', description: 'Link or update the registered mobile number in vehicle records.', price: 500, type: 'KA', category: 'Vehicle', iconName: 'Smartphone' },
  { id: 'duplicate_rc', title: 'Duplicate RC', description: 'Assistance if RC is lost, damaged, or misplaced.', price: 1800, type: 'KA', category: 'Vehicle', iconName: 'Copy' },
  { id: 'rc_renewal', title: 'RC Renewal (15+ Years)', description: 'Documentation support for registration renewal (subject to Fitness/RTO approval).', price: 2500, type: 'KA', category: 'Vehicle', iconName: 'Clock' },
  { id: 're_registration', title: 'Re-Registration to Bangalore RTO', description: 'Support for vehicles relocating to Karnataka.', price: 3000, type: 'NON_KA', category: 'Vehicle', iconName: 'Truck' },

  // Driving Licence Services
  { id: 'dl_renewal', title: 'DL Renewal', description: 'For licences expired within 6 months. We handle filing and follow-ups.', price: 1200, type: 'KA', category: 'Driving Licence', iconName: 'RotateCw' },
  { id: 'address_update_dl', title: 'Address Update in DL', description: 'Moved homes? Update your DL address easily.', price: 800, type: 'KA', category: 'Driving Licence', iconName: 'MapPin' },
  { id: 'mobile_update_dl', title: 'Mobile Number Update', description: 'Link or update your registered mobile number.', price: 500, type: 'KA', category: 'Driving Licence', iconName: 'Smartphone' },
  { id: 'duplicate_dl', title: 'Duplicate DL', description: 'Lost or damaged licence? Get a replacement with our support.', price: 1500, type: 'KA', category: 'Driving Licence', iconName: 'Copy' },
  { id: 'dl_extract', title: 'DL Extract', description: 'Download your official DL extract for verification or compliance.', price: 300, type: 'KA', category: 'Driving Licence', iconName: 'Download' },
  { id: 'idp', title: 'International Driving Permit (IDP)', description: 'Complete documentation support for IDP application.', price: 2500, type: 'KA', category: 'Driving Licence', iconName: 'Globe' },
  { id: 'other_state_transfer', title: 'Other State DL -> Bangalore', description: 'Seamless assistance to migrate your Driving Licence to Karnataka.', price: 3000, type: 'NON_KA', category: 'Driving Licence', iconName: 'Map' }
];

db.serialize(() => {
  db.exec(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating tables:', err.message);
    } else {
      console.log('Database tables (Bookings, Users, Admins, Services) ready.');

      // Seed Default Admin (admin/admin123) if not exists
      db.get("SELECT count(*) as count FROM admins", [], (err, row) => {
        if (err) return console.error(err.message);
        if (row.count === 0) {
          const adminUser = 'admin';
          const adminPass = 'admin123';
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(adminPass, salt);

          db.run(`INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)`, [adminUser, hash, 'admin'], (err) => {
            if (err) console.error(err.message);
            else console.log('Default Admin Account Created: admin / admin123');
          });
        }
      });

      // Seed Services if table is empty
      db.get("SELECT count(*) as count FROM services", [], (err, row) => {
        if (err) return console.error(err.message);
        if (row.count === 0) {
          const stmt = db.prepare("INSERT INTO services (id, title, description, price, type, category, iconName) VALUES (?, ?, ?, ?, ?, ?, ?)");
          INITIAL_SERVICES.forEach(service => {
            stmt.run(service.id, service.title, service.description, service.price, service.type, service.category, service.iconName);
          });
          stmt.finalize();
          console.log('Services table seeded with default data.');
        }
      });
    }
  });
});

// Helper: Generate Booking ID (VH-YYYYMM-XXXX)
const generateBookingId = (callback) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `VH-${year}${month}-`;

  db.get(`SELECT bookingId FROM bookings WHERE bookingId LIKE ? ORDER BY id DESC LIMIT 1`, [`${prefix}%`], (err, row) => {
    if (err) {
      return callback(err);
    }
    let sequence = 1;
    if (row && row.bookingId) {
      const lastSeq = parseInt(row.bookingId.split('-')[2], 10);
      sequence = lastSeq + 1;
    }
    const newId = `${prefix}${String(sequence).padStart(4, '0')}`;
    callback(null, newId);
  });
};

module.exports = { db, generateBookingId };
