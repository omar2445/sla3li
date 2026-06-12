const express = require('express');
require('express-async-errors'); // lets async route errors reach the global handler
const cors = require('cors');
require('dotenv').config();

const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    // Allow any localhost port in development
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(require('./config/paths').uploadsDir));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.2.0', platform: 'Sla3Li', db: db.backendName }));

app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

async function start() {
  await db.ready;

  // Auto-seed on first start if no users exist
  const userCount = await db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (userCount.c === 0) {
    try { await require('./db/seed')(); } catch (e) { console.error('Seed error:', e.message); }
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Sla3Li API running on http://localhost:${PORT}`);
    console.log(`   Database: ${db.backendName} | Health: http://localhost:${PORT}/api/health\n`);
  });
}

start().catch(err => { console.error('FATAL STARTUP ERROR:', err); process.exit(1); });
