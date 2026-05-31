const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const auth = require('../middleware/auth');

const sign = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, is_approved: user.is_approved },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// Register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('role').isIn(['wholesaler', 'retailer', 'driver']),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, name_ar, email, password, role, phone, wilaya, address, business_name, business_name_ar } = req.body;
    console.log('REGISTER ATTEMPT:', { name, email, role });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const password_hash = bcrypt.hashSync(password, 10);
    const is_approved = role === 'retailer' ? 1 : 0;

    const result = db.prepare(`
      INSERT INTO users (name, name_ar, email, password_hash, role, phone, wilaya, address, business_name, business_name_ar, is_approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name        || '',
      name_ar     || name || '',
      email       || '',
      password_hash,
      role        || '',
      phone       || '',
      wilaya      || '',
      address     || '',
      business_name    || '',
      business_name_ar || '',
      is_approved
    );

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, is_approved: user.is_approved } });
  } catch (err) {
    console.error('REGISTER ERROR:', err.message, err.stack);
    next(err);
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.is_active) return res.status(403).json({ message: 'Account suspended' });
  if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, is_approved: user.is_approved, wilaya: user.wilaya, business_name: user.business_name } });
});

// Get current user profile
router.get('/me', auth(), (req, res) => {
  const user = db.prepare('SELECT id, name, name_ar, email, role, phone, wilaya, address, business_name, business_name_ar, is_approved, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// Update profile
router.put('/profile', auth(), (req, res) => {
  const { name, name_ar, phone, wilaya, address, business_name, business_name_ar } = req.body;
  db.prepare('UPDATE users SET name=?, name_ar=?, phone=?, wilaya=?, address=?, business_name=?, business_name_ar=? WHERE id=?')
    .run(name, name_ar, phone, wilaya, address, business_name, business_name_ar, req.user.id);
  res.json({ message: 'Profile updated' });
});

module.exports = router;
