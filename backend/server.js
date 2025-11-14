const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const nodemailer = require('nodemailer');
const { HfInference } = require('@huggingface/inference');
const { google } = require('googleapis');
const multer = require('multer');
const cron = require('node-cron');
const { exec } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Login
app.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  db.query('SELECT * FROM users WHERE username = ? AND role = ?', [username, role], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Invalid' });
    const valid = await bcrypt.compare(password, results[0].password);
    if (!valid) return res.status(401).json({ error: 'Invalid' });
    const token = jwt.sign({ id: results[0].id, role }, process.env.JWT_SECRET);
    res.json({ token });
  });
});

// New Ticket
app.post('/tickets', authenticate, (req, res) => {
  const { assignee, type, status, customer_name, phone, address, lot, gate, rv_year, make, model, miles, vin, complaint, date, time } = req.body;
  db.query('INSERT INTO tickets SET ?', { assignee, type, status, customer_name, phone, address, lot, gate, rv_year, make, model, miles, vin, complaint, date, time }, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (type === 'mobile') {
      // Stripe diag fee
      stripe.paymentIntents.create({ amount: 5000, currency: 'usd' }).then(intent => res.json({ ticket_id: result.insertId, client_secret: intent.client_secret }));
    } else {
      res.json({ ticket_id: result.insertId });
    }
  });
});

// Kanban Board
app.get('/tickets', authenticate, (req, res) => {
  db.query('SELECT * FROM tickets ORDER BY status', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Update Status (Drag-Drop)
app.put('/tickets/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  db.query('UPDATE tickets SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    // Log and notify
    twilio.messages.create({ body: `Ticket ${req.params.id} moved to ${status}`, from: process.env.TWILIO_FROM, to: process.env.JOSEPH_PHONE });
    res.json({ success: true });
  });
});

// Full Ticket View
app.get('/tickets/:id', authenticate, (req, res) => {
  db.query('SELECT * FROM tickets WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
});

// Update Ticket
app.put('/tickets/:id', authenticate, (req, res) => {
  db.query('UPDATE tickets SET ? WHERE id = ?', [req.body, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Parts/Labor
app.post('/tickets/:id/parts', authenticate, (req, res) => {
  db.query('INSERT INTO parts SET ticket_id = ?, ?', [req.params.id, req.body], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Inventory Check/Order
app.post('/inventory/check', authenticate, (req, res) => {
  const { part_number } = req.body;
  db.query('SELECT qty FROM inventory WHERE part_number = ?', [part_number], (err, results) => {
    if (results[0]?.qty > 0) {
      db.query('UPDATE inventory SET qty = qty - 1 WHERE part_number = ?', [part_number]);
      res.json({ in_stock: true });
    } else {
      // Myers/Amazon API logic (simplified)
      res.json({ options: [{ source: 'Myers', eta: '3-day' }, { source: 'Amazon', eta: 'next-day' }] });
    }
  });
});

// Voice-to-Text
app.post('/voice', authenticate, multer().single('audio'), async (req, res) => {
  const hf = new HfInference(process.env.HF_TOKEN);
  const text = await hf.automaticSpeechRecognition({ data: req.file.buffer, model: 'openai/whisper-tiny' });
  res.json({ text: text.text });
});

// Customer Portal
app.get('/portal/:id', (req, res) => {
  db.query('SELECT * FROM tickets WHERE id = ?', [req.params.id], (err, results) => {
    res.json(results[0]);
  });
});

// Payments
app.post('/pay', authenticate, (req, res) => {
  stripe.paymentIntents.create({ amount: req.body.amount * 100, currency: 'usd' }).then(intent => res.json({ client_secret: intent.client_secret }));
});

// GPS Logs
app.post('/gps', authenticate, (req, res) => {
  db.query('INSERT INTO gps_logs SET ?', req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Admin Dash
app.get('/admin/dash', authenticate, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Forbidden' });
  // Revenue, etc.
  db.query('SELECT SUM(amount) AS revenue FROM payments WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)', (err, results) => {
    res.json({ revenue: results[0].revenue });
  });
});

// Backup (Pi cron)
cron.schedule('0 20 * * *', () => {
  exec('mysqldump -u root -p rv_repair | gzip > /mnt/usb/backup.sql.gz && rclone copy /mnt/usb/backup.sql.gz gdrive:backups', (err) => {
    twilio.messages.create({ body: err ? 'Backup FAILED' : 'Backup OK', from: process.env.TWILIO_FROM, to: process.env.JOSEPH_PHONE });
  });
});

app.listen(3000);