const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const pdf = require('html-pdf');
const bcrypt = require('bcrypt');  // Import bcrypt
require('dotenv').config();

const generateInvoiceTemplate = require('./invoiceTemplate');

const app = express();
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: 'http://riankristoffersen.com' //'http://localhost:3000'  // Replace with your frontend URL
}));




app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to `true` if using HTTPS
}));

const db = mysql.createPool({
  connectionLimit: 10,
  host: 'mysql116.unoeuro.com',//'localhost', // '10.27.60.48',// 
  user:  'riankristoffersen_com', // 'kristofferseninvest_dkinvoice_sys_db', //
  password: 'Klaus1087',//klaus@
  database:  'riankristoffersen_com_db',//  'invoice_sys_db' ,// 'kristofferseninvest_dkinvoice_sys_db',
  connectTimeout: 20000 // increase timeout to 20 seconds

});

db.getConnection((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to the database.');
});

// Login route
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  const query = 'SELECT * FROM users WHERE login = ?';
  db.query(query, [login], async (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(401).send('Invalid login or password');
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);  // Compare hashed passwords

    if (!match) {
      return res.status(401).send('Invalid login or password');
    }

    req.session.user = user;
    res.send('Logged in');
  });
});


const authenticate = (req, res, next) => {
  if (!req.session.user) return res.status(401).send('Unauthorized');
  next();
};

app.use(authenticate);


// Add client route
app.post('/api/addclient', (req, res) => {
  const { name, company_name, address, zip, city, cin_patent, payment_terms, created_by } = req.body.newClient;

  if (!req.session.user || req.session.user.user_id !== created_by) {
    return res.status(403).send('Unauthorized');
  }

  const query = `
    INSERT INTO clients (name, company_name, address, zip, city, cin_patent, payment_terms, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [name, company_name, address, zip, city, cin_patent, payment_terms, created_by], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    res.send('Client added successfully');
  });
});

// Add user route
app.post('/api/adduser', async (req, res) => {
  if (!req.session.user || !req.session.user.admin_rights) {
    return res.status(403).send('Admin rights required');
  }

  const { newUser } = req.body;
  const { login, first_name, last_name, cin, address, city, email, phone, whatsapp, password, admin_rights } = newUser;

  const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password

  const query = `
    INSERT INTO users (login, first_name, last_name, cin, address, city, email, phone, whatsapp, password, admin_rights)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [login, first_name, last_name, cin, address, city, email, phone, whatsapp, hashedPassword, admin_rights], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    res.send('User added successfully');
  });
});

// Add item route
app.post('/api/additem', (req, res) => {
  const { item_number, item_text, item_cost_price, item_sales_price, created_by } = req.body.newItem;

  if (!req.session.user || req.session.user.user_id !== created_by) {
    return res.status(403).send('Unauthorized');
  }

  const query = `
    INSERT INTO items (item_number, item_text, item_cost_price, item_sales_price, created_by)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [item_number, item_text, item_cost_price, item_sales_price, created_by], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    res.send('Item added successfully');
  });
});

// Add invoice route
app.post('/api/addinvoice', (req, res) => {
  const { client_id, invoice_date, created_by, lines } = req.body.newInvoice;

  if (!req.session.user || req.session.user.user_id !== created_by) {
    return res.status(403).send('Unauthorized');
  }

  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).send('No invoice lines provided');
  }

  const query = `
    INSERT INTO invoices (client_id, invoice_date, created_by)
    VALUES (?, ?, ?)
  `;
  db.query(query, [client_id, invoice_date, created_by], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    const invoiceId = results.insertId;
    const linesQuery = `
      INSERT INTO invoice_lines (invoice_id, item_id, quantity, price)
      VALUES ?
    `;
    const linesValues = lines.map(line => [invoiceId, line.item_id, line.quantity, line.price]);

    db.query(linesQuery, [linesValues], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send('Server error');
      }

      res.json({ invoiceId });
    });
  });
});

// Get clients route
app.get('/api/clients', (req, res) => {
  const query = 'SELECT client_id, name FROM clients';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    res.json(results);
  });
});

// Get items route
app.get('/api/items', (req, res) => {
  console.log('Fetching items from the database');
  const query = 'SELECT item_id, item_text, item_cost_price, item_sales_price FROM items';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    res.json(results);
  });
});


// Get item price route
app.get('/api/itemprice/:item_id', (req, res) => {
  const itemId = req.params.item_id;
  const query = 'SELECT item_sales_price FROM items WHERE item_id = ?';
  db.query(query, [itemId], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(404).send('Item not found');
    }
    res.json({ price: results[0].item_sales_price });
  });
});

// Get the next invoice number route
app.get('/api/nextinvoicenumber', (req, res) => {
  const query = 'SELECT MAX(invoice_id) AS maxInvoiceId FROM invoices';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }
    const maxInvoiceId = results[0].maxInvoiceId || 0;
    console.log("maxInvoiceId est : " + maxInvoiceId)
    // Determine the next invoice number with a minimum constraint of 10001
    const nextInvoiceNumber = Math.max(maxInvoiceId , 10000);
    res.json({ nextInvoiceNumber: nextInvoiceNumber + 1 });
  });
});

// Get session route
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).send('Not authenticated');
  }
});

// Generate invoice PDF route
app.get('/api/invoicepdf/:invoice_id', (req, res) => {
  const invoiceId = req.params.invoice_id;

  const invoiceQuery = `
    SELECT invoices.invoice_id, invoices.invoice_date, clients.name AS client_name, clients.address AS client_address, clients.city AS client_city, clients.zip AS client_zip, clients.cin_patent, clients.payment_terms AS deadLineDate, invoice_lines.item_id, items.item_text, invoice_lines.quantity, invoice_lines.price
    FROM invoices
    JOIN clients ON invoices.client_id = clients.client_id
    JOIN invoice_lines ON invoices.invoice_id = invoice_lines.invoice_id
    JOIN items ON invoice_lines.item_id = items.item_id
    WHERE invoices.invoice_id = ?
  `;

  db.query(invoiceQuery, [invoiceId], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(404).send('Invoice not found');
    }

    const invoice = results[0];
    const lines = results.map(result => ({
      item_text: result.item_text,
      quantity: result.quantity,
      price: result.price,
      total: result.quantity * result.price
    }));

    const totalAmount = lines.reduce((sum, line) => sum + line.total, 0);

    const htmlTemplate = generateInvoiceTemplate(invoice, lines, totalAmount);

    pdf.create(htmlTemplate).toBuffer((err, buffer) => {
      if (err) {
        console.error('PDF generation error:', err);
        return res.status(500).send('Server error');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.send(buffer);
    });
  });
});


// Change password route
app.post('/api/changepassword', (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }

  const userId = req.session.user.user_id;

  const getUserQuery = 'SELECT * FROM users WHERE user_id = ?';
  db.query(getUserQuery, [userId], async (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    const user = results[0];
    const match = await bcrypt.compare(currentPassword, user.password);  // Compare hashed passwords

    if (!match) {
      return res.status(401).send('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);  // Hash the new password

    const updatePasswordQuery = 'UPDATE users SET password = ? WHERE user_id = ?';
    db.query(updatePasswordQuery, [hashedNewPassword, userId], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send('Server error');
      }

      res.send('Password changed successfully');
    });
  });
});

//change item prices and store the modification into in the database

app.post('/api/changeItemPrices', (req, res) => {
  const {
    item_id,
    previous_item_cost_price,
    current_item_cost_price,
    previous_item_sales_price,
    current_item_sales_price,
    modified_by
  } = req.body;

  const query = `INSERT INTO priceschange (item_id, previous_item_cost_price, current_item_cost_price, previous_item_sales_price, current_item_sales_price, modified_by)
                 VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(query, [item_id, previous_item_cost_price, current_item_cost_price, previous_item_sales_price, current_item_sales_price, modified_by], (err, result) => {
    if (err) {
      console.error('Error updating prices:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const updateQuery = `UPDATE items SET item_cost_price = ?, item_sales_price = ? WHERE item_id = ?`;

    db.query(updateQuery, [current_item_cost_price, current_item_sales_price, item_id], (err, result) => {
      if (err) {
        console.error('Error updating item prices:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      res.json({ message: 'Prices updated successfully' });
    });
  });
});

// Logout route
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).send('Server error');
    }
    res.send('Logged out');
  });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
