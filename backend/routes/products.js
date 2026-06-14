const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');
const { upload, storeFiles } = require('../config/uploads');
const { expandSearch } = require('../config/darja');

// NOTE: specific routes must come BEFORE /:id routes

// Search suggestions (autocomplete) - MUST be before /:id
router.get('/search/suggestions', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);
  const terms = expandSearch(q.trim());
  const likes = terms.map(t => `%${t}%`);
  // Build OR clause across all expanded terms
  const orClause = likes.map(() => '(p.name LIKE ? OR p.name_ar LIKE ? OR c.name LIKE ? OR u.business_name LIKE ?)').join(' OR ');
  const orParams = likes.flatMap(l => [l, l, l, l]);
  const rows = await db.prepare(`
    SELECT p.id, p.name, p.name_ar, c.name as category_name, c.name_ar as category_name_ar
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    JOIN users u ON p.wholesaler_id = u.id
    WHERE p.is_active = 1 AND u.is_approved = 1 AND u.is_active = 1
      AND (${orClause})
    ORDER BY
      CASE WHEN p.name LIKE ? THEN 0 ELSE 1 END,
      p.name
    LIMIT 8
  `).all(...orParams, `${q.trim()}%`);
  res.json(rows);
});

// My products (wholesaler) - MUST be before /:id
router.get('/my/list', auth(['wholesaler']), async (req, res) => {
  const products = await db.prepare(`
    SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.wholesaler_id = ? ORDER BY p.created_at DESC
  `).all(req.user.id);
  products.forEach(p => p.images = JSON.parse(p.images || '[]'));
  res.json(products);
});

// My favorites (retailer) - MUST be before /:id
router.get('/my/favorites', auth(['retailer']), async (req, res) => {
  const favs = await db.prepare(`
    SELECT p.*, u.business_name, u.wilaya FROM favorites f JOIN products p ON f.product_id = p.id JOIN users u ON p.wholesaler_id = u.id WHERE f.retailer_id = ?
  `).all(req.user.id);
  favs.forEach(p => p.images = JSON.parse(p.images || '[]'));
  res.json(favs);
});

// Get all products (public, with filters)
router.get('/', async (req, res) => {
  const { category, search, wilaya, min_price, max_price, wholesaler_id, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = ['p.is_active = 1', 'u.is_approved = 1', 'u.is_active = 1'];
  const params = [];

  // A parent category also matches products in its subcategories
  if (category) { where.push('(p.category_id = ? OR p.category_id IN (SELECT id FROM categories WHERE parent_id = ?))'); params.push(category, category); }
  if (search) {
    const searchTerms = expandSearch(search);
    const searchOr = searchTerms.map(() => '(p.name LIKE ? OR p.name_ar LIKE ? OR p.description LIKE ? OR c.name LIKE ? OR u.business_name LIKE ?)').join(' OR ');
    where.push(`(${searchOr})`);
    searchTerms.forEach(t => params.push(`%${t}%`, `%${t}%`, `%${t}%`, `%${t}%`, `%${t}%`));
  }
  if (wilaya) { where.push('u.wilaya LIKE ?'); params.push(`%${wilaya}%`); }
  if (min_price) { where.push('p.price >= ?'); params.push(parseFloat(min_price)); }
  if (max_price) { where.push('p.price <= ?'); params.push(parseFloat(max_price)); }
  if (wholesaler_id) { where.push('p.wholesaler_id = ?'); params.push(parseInt(wholesaler_id)); }

  const whereStr = 'WHERE ' + where.join(' AND ');

  const total = await db.prepare(`SELECT COUNT(*) as count FROM products p JOIN users u ON p.wholesaler_id = u.id LEFT JOIN categories c ON p.category_id = c.id ${whereStr}`).get(...params);
  const products = await db.prepare(`
    SELECT p.*, u.name as wholesaler_name, u.business_name, u.wilaya, c.name as category_name, c.name_ar as category_name_ar,
           COALESCE(rv.avg_rating, 0) as avg_rating, COALESCE(rv.rating_count, 0) as rating_count
    FROM products p
    JOIN users u ON p.wholesaler_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN (SELECT product_id, AVG(rating) as avg_rating, COUNT(*) as rating_count FROM reviews GROUP BY product_id) rv ON rv.product_id = p.id
    ${whereStr}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  products.forEach(p => p.images = JSON.parse(p.images || '[]'));
  res.json({ products, total: total.count, page: parseInt(page), pages: Math.ceil(total.count / parseInt(limit)) });
});

// Get single product
router.get('/:id', async (req, res) => {
  const product = await db.prepare(`
    SELECT p.*, u.name as wholesaler_name, u.business_name, u.business_name_ar, u.wilaya, u.phone as wholesaler_phone,
           c.name as category_name, c.name_ar as category_name_ar,
           COALESCE(rv.avg_rating, 0) as avg_rating, COALESCE(rv.rating_count, 0) as rating_count
    FROM products p
    JOIN users u ON p.wholesaler_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN (SELECT product_id, AVG(rating) as avg_rating, COUNT(*) as rating_count FROM reviews GROUP BY product_id) rv ON rv.product_id = p.id
    WHERE p.id = ?
  `).get(parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.images = JSON.parse(product.images || '[]');
  product.reviews = await db.prepare(`
    SELECT r.rating, r.comment, r.created_at, u.name as retailer_name
    FROM reviews r JOIN users u ON r.retailer_id = u.id
    WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 20
  `).all(product.id);
  const wr = await db.prepare(`
    SELECT AVG(r.rating) as avg, COUNT(*) as cnt FROM reviews r JOIN products p ON r.product_id = p.id WHERE p.wholesaler_id = ?
  `).get(product.wholesaler_id);
  product.wholesaler_rating = wr?.avg || 0;
  product.wholesaler_rating_count = wr?.cnt || 0;
  res.json(product);
});

// My rating for a product (retailer)
router.get('/:id/my-rating', auth(['retailer']), async (req, res) => {
  const r = await db.prepare('SELECT rating, comment FROM reviews WHERE product_id = ? AND retailer_id = ?').get(parseInt(req.params.id), req.user.id);
  res.json(r || null);
});

// Rate a product (retailer) — one rating per retailer, updates on re-submit
router.post('/:id/rating', auth(['retailer']), async (req, res) => {
  const rating = parseInt(req.body.rating);
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });
  const product = await db.prepare('SELECT id FROM products WHERE id = ?').get(parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await db.prepare(`
    INSERT INTO reviews (product_id, retailer_id, rating, comment) VALUES (?,?,?,?)
    ON CONFLICT(product_id, retailer_id) DO UPDATE SET rating=excluded.rating, comment=excluded.comment, created_at=datetime('now')
  `).run(product.id, req.user.id, rating, String(req.body.comment || ''));
  res.status(201).json({ message: 'Rating saved' });
});

// Safe type helpers — SQLite drivers reject undefined and boolean
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
router.post('/', auth(['wholesaler', 'admin']), upload.array('images', 5), async (req, res) => {
  if (req.user.role === 'wholesaler' && !req.user.is_approved) return res.status(403).json({ message: 'Account pending approval' });
  const wholesalerId = req.user.role === 'admin' ? toInt(req.body.wholesaler_id) : toInt(req.user.id);
  if (!wholesalerId) return res.status(400).json({ message: 'wholesaler_id is required' });
  const { name, name_ar, description, description_ar, price, min_order_qty, unit, unit_ar, stock_qty, category_id } = req.body;
  const images = await storeFiles(req.files);
  const result = await db.prepare(`
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
  res.status(201).json({ id: result.lastInsertRowid, message: 'Product created' });
});

// Update product
router.put('/:id', auth(['wholesaler', 'admin']), upload.array('images', 5), async (req, res) => {
  const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'wholesaler' && product.wholesaler_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  const { name, name_ar, description, description_ar, price, min_order_qty, unit, unit_ar, stock_qty, category_id, is_active } = req.body;

  let images;
  if (req.body.keep_images !== undefined) {
    let keepImages = [];
    try { keepImages = JSON.parse(req.body.keep_images); } catch {}
    const newFiles = await storeFiles(req.files);
    images = [...keepImages, ...newFiles];
  } else {
    images = JSON.parse(product.images || '[]');
  }

  await db.prepare(`
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
router.delete('/:id', auth(['wholesaler', 'admin']), async (req, res) => {
  const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'wholesaler' && product.wholesaler_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  await db.prepare('DELETE FROM products WHERE id = ?').run(parseInt(req.params.id));
  res.json({ message: 'Product deleted' });
});

// Favorite toggle
router.post('/:id/favorite', auth(['retailer']), async (req, res) => {
  try {
    await db.prepare('INSERT INTO favorites (retailer_id, product_id) VALUES (?,?)').run(req.user.id, parseInt(req.params.id));
    res.json({ favorited: true });
  } catch { res.json({ favorited: false, message: 'Already favorited' }); }
});

router.delete('/:id/favorite', auth(['retailer']), async (req, res) => {
  await db.prepare('DELETE FROM favorites WHERE retailer_id = ? AND product_id = ?').run(req.user.id, parseInt(req.params.id));
  res.json({ favorited: false });
});

module.exports = router;
