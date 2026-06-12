const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const auth = require('../middleware/auth');

const { uploadsDir } = require('../config/paths');

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + path.extname(file.originalname)),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});

const sign = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, is_approved: user.is_approved },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// Register
router.post('/register',
  upload.fields([
    { name: 'id_image', maxCount: 1 },
    { name: 'license_image', maxCount: 1 },
    { name: 'gray_card_image', maxCount: 1 },
  ]),
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty(),
    body('role').isIn(['wholesaler', 'retailer', 'driver']),
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, name_ar, email, password, role, phone, wilaya, address, business_name, business_name_ar } = req.body;
      console.log('REGISTER ATTEMPT:', { name, email, role });

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) return res.status(409).json({ message: 'Email already registered' });

      const password_hash = bcrypt.hashSync(password, 10);
      const is_approved = role === 'retailer' ? 1 : 0;

      const id_image       = req.files?.id_image?.[0]       ? `/uploads/${req.files.id_image[0].filename}`       : '';
      const license_image  = req.files?.license_image?.[0]  ? `/uploads/${req.files.license_image[0].filename}`  : '';
      const gray_card_image = req.files?.gray_card_image?.[0] ? `/uploads/${req.files.gray_card_image[0].filename}` : '';

      const result = db.prepare(`
        INSERT INTO users (name, name_ar, email, password_hash, role, phone, wilaya, address, business_name, business_name_ar, is_approved, id_image, license_image, gray_card_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        is_approved,
        id_image,
        license_image,
        gray_card_image
      );

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
      res.status(201).json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, is_approved: user.is_approved } });
    } catch (err) {
      console.error('REGISTER ERROR:', err.message, err.stack);
      next(err);
    }
  }
);

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
  const user = db.prepare('SELECT id, name, name_ar, email, role, phone, wilaya, address, business_name, business_name_ar, is_approved, avatar, id_image, license_image, gray_card_image, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// Update profile
router.put('/profile', auth(), (req, res) => {
  const { name, name_ar, phone, wilaya, address, business_name, business_name_ar } = req.body;
  db.prepare('UPDATE users SET name=?, name_ar=?, phone=?, wilaya=?, address=?, business_name=?, business_name_ar=? WHERE id=?')
    .run(name || '', name_ar || '', phone || '', wilaya || '', address || '', business_name || '', business_name_ar || '', req.user.id);
  res.json({ message: 'Profile updated' });
});

// Update avatar
router.put('/avatar', auth(),
  upload.single('avatar'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const path = `/uploads/${req.file.filename}`;
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(path, req.user.id);
    res.json({ avatar: path });
  }
);

// Change password
router.put('/password', auth(), (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, row.password_hash))
    return res.status(401).json({ message: 'Current password is incorrect' });
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(new_password, 10), req.user.id);
  res.json({ message: 'Password changed successfully' });
});

// Update documents (ID / licence / gray card)
router.put('/documents', auth(),
  upload.fields([
    { name: 'id_image', maxCount: 1 },
    { name: 'license_image', maxCount: 1 },
    { name: 'gray_card_image', maxCount: 1 },
  ]),
  (req, res) => {
    const sets = [];
    const params = [];
    if (req.files?.id_image?.[0])       { sets.push('id_image = ?');        params.push(`/uploads/${req.files.id_image[0].filename}`); }
    if (req.files?.license_image?.[0])  { sets.push('license_image = ?');   params.push(`/uploads/${req.files.license_image[0].filename}`); }
    if (req.files?.gray_card_image?.[0]){ sets.push('gray_card_image = ?'); params.push(`/uploads/${req.files.gray_card_image[0].filename}`); }
    if (sets.length === 0) return res.status(400).json({ message: 'No files provided' });
    params.push(req.user.id);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    res.json({ message: 'Documents updated' });
  }
);

module.exports = router;
