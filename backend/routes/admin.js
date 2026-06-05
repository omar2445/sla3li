const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

const adminOnly = auth(['admin']);

const wrap = (fn) => (req, res, next) => {
  try { fn(req, res, next); } catch (err) {
    console.error('ADMIN ERROR:', err.message);
    next(err);
  }
};

// Dashboard stats
router.get('/stats', adminOnly, wrap((req, res) => {
  const users    = db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN role='wholesaler' THEN 1 ELSE 0 END) as wholesalers, SUM(CASE WHEN role='retailer' THEN 1 ELSE 0 END) as retailers, SUM(CASE WHEN is_approved=0 AND role!='admin' THEN 1 ELSE 0 END) as pending FROM users").get();
  const products = db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN is_active=1 THEN 1 ELSE 0 END) as active FROM products').get();
  const orders   = db.prepare("SELECT COUNT(*) as total, SUM(total_amount) as revenue, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending FROM orders").get();
  res.json({ users, products, orders });
}));

// List users
router.get('/users', adminOnly, wrap((req, res) => {
  const role        = req.query.role        || null;
  const is_approved = req.query.is_approved !== '' && req.query.is_approved !== undefined ? req.query.is_approved : null;
  const search      = req.query.search      || null;
  const page        = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit       = 20;
  const offset      = (page - 1) * limit;

  const conditions = [];
  const params     = [];

  if (role)        { conditions.push('role = ?');              params.push(role); }
  if (is_approved !== null) { conditions.push('is_approved = ?'); params.push(Number(is_approved)); }
  if (search)      { conditions.push('(name LIKE ? OR email LIKE ? OR business_name LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const listSql  = `SELECT id, name, name_ar, email, role, phone, wilaya, business_name, is_approved, is_active, id_image, license_image, gray_card_image, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const countSql = `SELECT COUNT(*) as c FROM users ${where}`;

  const users = params.length ? db.prepare(listSql).all(...params) : db.prepare(listSql).all();
  const total = params.length ? db.prepare(countSql).get(...params) : db.prepare(countSql).get();

  res.json({ users, total: total.c });
}));

// Approve/suspend user
router.patch('/users/:id/approve', adminOnly, wrap((req, res) => {
  db.prepare('UPDATE users SET is_approved=1 WHERE id=?').run(req.params.id);
  res.json({ message: 'User approved' });
}));

router.patch('/users/:id/suspend', adminOnly, wrap((req, res) => {
  db.prepare('UPDATE users SET is_active=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'User suspended' });
}));

router.patch('/users/:id/activate', adminOnly, wrap((req, res) => {
  db.prepare('UPDATE users SET is_active=1 WHERE id=?').run(req.params.id);
  res.json({ message: 'User activated' });
}));

// Delete user
router.delete('/users/:id', adminOnly, wrap((req, res) => {
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ message: 'User deleted' });
}));

// List products (for moderation)
router.get('/products', adminOnly, wrap((req, res) => {
  const products = db.prepare(`
    SELECT p.*, u.name as wholesaler_name, u.business_name, c.name as category_name
    FROM products p JOIN users u ON p.wholesaler_id = u.id LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `).all();
  products.forEach(p => { p.images = JSON.parse(p.images || '[]'); });
  res.json(products);
}));

router.patch('/products/:id/toggle', adminOnly, wrap((req, res) => {
  const p = db.prepare('SELECT is_active FROM products WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  db.prepare('UPDATE products SET is_active=? WHERE id=?').run(p.is_active ? 0 : 1, req.params.id);
  res.json({ message: 'Toggled' });
}));

// All orders
router.get('/orders', adminOnly, wrap((req, res) => {
  const status = req.query.status || null;
  const page   = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit  = 20;
  const offset = (page - 1) * limit;
  const where  = status ? 'WHERE o.status = ?' : '';
  const sql    = `SELECT o.*, r.name as retailer_name, w.name as wholesaler_name, w.business_name FROM orders o JOIN users r ON o.retailer_id=r.id JOIN users w ON o.wholesaler_id=w.id ${where} ORDER BY o.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const orders = status ? db.prepare(sql).all(status) : db.prepare(sql).all();
  res.json(orders);
}));

// Assign driver to delivery
router.patch('/deliveries/:id/assign', adminOnly, wrap((req, res) => {
  const { driver_id } = req.body;
  db.prepare("UPDATE deliveries SET driver_id=?, status='assigned', updated_at=datetime('now') WHERE id=?").run(driver_id, req.params.id);
  res.json({ message: 'Driver assigned' });
}));

module.exports = router;
