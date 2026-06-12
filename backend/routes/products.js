const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadsDir } = require('../config/paths');

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + path.extname(file.originalname))
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// NOTE: specific routes must come BEFORE /:id routes

// Search suggestions (autocomplete) - MUST be before /:id
router.get('/search/suggestions', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);
  const like = `%${q.trim()}%`;
  const rows = db.prepare(`
    SELECT p.id, p.name, p.name_ar, c.name as category_name, c.name_ar as category_name_ar
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    JOIN users u ON p.wholesaler_id = u.id
    WHERE p.is_active = 1 AND u.is_approved = 1 AND u.is_active = 1
      AND (p.name LIKE ? OR p.name_ar LIKE ? OR c.name LIKE ? OR u.business_name LIKE ?)
    ORDER BY
      CASE WHEN p.name LIKE ? THEN 0 ELSE 1 END,
      p.name
    LIMIT 8
  `).all(like, like, like, like, `${q.trim()}%`);
  res.json(rows);
});

// My products (wholesaler) - MUST be before /:id
router.get('/my/list', auth(['wholesaler']), (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.wholesaler_id = ? ORDER BY p.created_at DESC
  `).all(req.user.id);
  products.forEach(p => p.images = JSON.parse(p.images || '[]'));
  res.json(products);
});

// My favorites (retailer) - MUST be before /:id
router.get('/my/favorites', auth(['retailer']), (req, res) => {
  const favs = db.prepare(`
    SELECT p.*, u.business_name, u.wilaya FROM favorites f JOIN products p ON f.product_id = p.id JOIN users u ON p.wholesaler_id = u.id WHERE f.retailer_id = ?
  `).all(req.user.id);
  favs.forEach(p => p.images = JSON.parse(p.images || '[]'));
  res.json(favs);
});

// Get all products (public, with filters)
router.get('/', (req, res) => {
  const { category, search, wilaya, min_price, max_price, wholesaler_id, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = ['p.is_active = 1', 'u.is_approved = 1', 'u.is_active = 1'];
  const params = [];

  if (category) { where.push('p.category_id = ?'); params.push(category); }
  if (search) { where.push('(p.name LIKE ? OR p.name_ar LIKE ? OR p.description LIKE ? OR c.name LIKE ? OR u.business_name LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
  if (wilaya) { where.push('u.wilaya LIKE ?'); params.push(`%${wilaya}%`); }
  if (min_price) { where.push('p.price >= ?'); params.push(parseFloat(min_price)); }
  if (max_price) { where.push('p.price <= ?'); params.push(parseFloat(max_price)); }
  if (wholesaler_id) { where.push('p.wholesaler_id = ?'); params.push(parseInt(wholesaler_id)); }

  const whereStr = 'WHERE ' + where.join(' AND ');

  const total = db.prepare(`SELECT COUNT(*) as count FROM products p JOIN users u ON p.wholesaler_id = u.id ${whereStr}`).get(...params);
  const products = db.prepare(`
    SELECT p.*, u.name as wholesaler_name, u.business_name, u.wilaya, c.name as category_name, c.name_ar as category_name_ar
    FROM products p
    JOIN users u ON p.wholesaler_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereStr}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  products.forEach(p => p.images = JSON.parse(p.images || '[]'));
  res.json({ products, total: total.count, page: parseInt(page), pages: Math.ceil(total.count / parseInt(limit)) });
});

// Get single product
router.get('/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, u.name as wholesaler_name, u.business_name, u.business_name_ar, u.wilaya, u.phone as wholesaler_phone,
           c.name as category_name, c.name_ar as category_name_ar
    FROM products p
    JOIN users u ON p.wholesaler_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.images = JSON.parse(product.images || '[]');
  res.json(product);
});

// Safe type helpers — node:sqlite rejects undefined and boolean
const toInt  = (v, fallback = 0) => { const n = parseInt(v);  return isNaN(n) ? fallback : n; };
const toFloat= (v, fallback = 0) => { const n = parseFloat(v);return isNaN(n) ? fallback : n; };
const toStr  = (v, fallback = '') => (v === undefined || v === null) ? fallback : String(v);
const toFlag = (v, fallback = 1) => {
  if (v === undefined || v === null) return fallback;
  if (v === true  || v === 1 || v === '1') return 1;
  if (v === false || v === 0 || v === '0') return 0;
  return fallback;
};
const toCatId = (v) => { const n = parseInt(v); return isNaN(n) || n === 0 ? null : n; };

// Create product (wholesaler or admin)
router.post('/', auth(['wholesaler', 'admin']), upload.array('images', 5), (req, res) => {
  if (req.user.role === 'wholesaler' && !req.user.is_approved) return res.status(403).json({ message: 'Account pending approval' });
  const wholesalerId = req.user.role === 'admin' ? toInt(req.body.wholesaler_id) : toInt(req.user.id);
  if (!wholesalerId) return res.status(400).json({ message: 'wholesaler_id is required' });
  console.log('POST /products body:', req.body, 'files:', req.files?.length, 'user:', req.user?.id);
  const { name, name_ar, description, description_ar, price, min_order_qty, unit, unit_ar, stock_qty, category_id } = req.body;
  const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
  const result = db.prepare(`
    INSERT INTO products (wholesaler_id, category_id, name, name_ar, description, description_ar, price, min_order_qty, unit, unit_ar, stock_qty, images)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    wholesalerId,
    toCatId(category_id),
    toStr(name, 'Unnamed'),
    toStr(name_ar),
    toStr(description),
    toStr(description_ar),
    toFloat(price),
    toInt(min_order_qty, 1),
    toStr(unit, 'piece'),
    toStr(unit_ar, 'قطعة'),
    toInt(stock_qty),
    JSON.stringify(images)
  );
  res.status(201).json({ id: Number(result.lastInsertRowid), message: 'Product created' });
});

// Update product
router.put('/:id', auth(['wholesaler', 'admin']), upload.array('images', 5), (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'wholesaler' && product.wholesaler_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  const { name, name_ar, description, description_ar, price, min_order_qty, unit, unit_ar, stock_qty, category_id, is_active } = req.body;
  console.log('PUT /products body:', req.body, 'files:', req.files?.length, 'user:', req.user?.id);

  const newFiles = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
  let images;
  if (req.body.keep_images !== undefined) {
    let keepImages = [];
    try { keepImages = JSON.parse(req.body.keep_images); } catch {}
    images = [...keepImages, ...newFiles];
  } else {
    images = JSON.parse(product.images || '[]');
  }

  db.prepare(`
    UPDATE products SET name=?, name_ar=?, description=?, description_ar=?, price=?, min_order_qty=?, unit=?, unit_ar=?, stock_qty=?, category_id=?, is_active=?, images=?, updated_at=datetime('now') WHERE id=?
  `).run(
    toStr(name,         product.name),
    toStr(name_ar,      product.name_ar || ''),
    toStr(description,  product.description || ''),
    toStr(description_ar, product.description_ar || ''),
    toFloat(price,      product.price),
    toInt(min_order_qty,product.min_order_qty),
    toStr(unit,         product.unit),
    toStr(unit_ar,      product.unit_ar || ''),
    toInt(stock_qty,    product.stock_qty),
    toCatId(category_id) ?? product.category_id ?? null,
    toFlag(is_active,   product.is_active),
    JSON.stringify(images),
    parseInt(req.params.id)
  );
  res.json({ message: 'Product updated' });
});

// Delete product
router.delete('/:id', auth(['wholesaler', 'admin']), (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'wholesaler' && product.wholesaler_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  db.prepare('DELETE FROM products WHERE id = ?').run(parseInt(req.params.id));
  res.json({ message: 'Product deleted' });
});

// Favorite toggle
router.post('/:id/favorite', auth(['retailer']), (req, res) => {
  try {
    db.prepare('INSERT INTO favorites (retailer_id, product_id) VALUES (?,?)').run(req.user.id, parseInt(req.params.id));
    res.json({ favorited: true });
  } catch { res.json({ favorited: false, message: 'Already favorited' }); }
});

router.delete('/:id/favorite', auth(['retailer']), (req, res) => {
  db.prepare('DELETE FROM favorites WHERE retailer_id = ? AND product_id = ?').run(req.user.id, parseInt(req.params.id));
  res.json({ favorited: false });
});

module.exports = router;
