const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

const notify = (user_id, title, title_ar, message, message_ar, type = 'info') =>
  db.prepare('INSERT INTO notifications (user_id, title, title_ar, message, message_ar, type) VALUES (?,?,?,?,?,?)')
    .run(user_id, title, title_ar, message, message_ar, type);

// Notifications - MUST be before /:id routes
router.get('/notifications/my', auth(), async (req, res) => {
  const notifs = await db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json(notifs);
});

router.patch('/notifications/read-all', auth(), async (req, res) => {
  await db.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.user.id);
  res.json({ message: 'All read' });
});

router.patch('/notifications/:id/read', auth(), async (req, res) => {
  await db.prepare('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?').run(parseInt(req.params.id), req.user.id);
  res.json({ message: 'Marked read' });
});

// Place order
router.post('/', auth(['retailer']), async (req, res) => {
  const { items, notes, delivery_address } = req.body;
  if (!items || !items.length) return res.status(400).json({ message: 'No items' });

  const grouped = {};
  for (const item of items) {
    const product = await db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(parseInt(item.product_id));
    if (!product) return res.status(404).json({ message: `Product ${item.product_id} not found` });
    if (item.quantity < product.min_order_qty) return res.status(400).json({ message: `Min order for ${product.name} is ${product.min_order_qty}` });
    if (!grouped[product.wholesaler_id]) grouped[product.wholesaler_id] = [];
    grouped[product.wholesaler_id].push({ ...item, product });
  }

  const orders = [];
  for (const [wholesaler_id, orderItems] of Object.entries(grouped)) {
    const total = orderItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const ord = await db.prepare('INSERT INTO orders (retailer_id, wholesaler_id, total_amount, notes, delivery_address) VALUES (?,?,?,?,?)').run(req.user.id, parseInt(wholesaler_id), total, notes || '', delivery_address || '');
    const orderId = ord.lastInsertRowid;
    for (const i of orderItems) {
      await db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?,?,?,?,?)').run(orderId, i.product.id, i.quantity, i.product.price, i.product.price * i.quantity);
    }
    await db.prepare("INSERT INTO deliveries (order_id, delivery_address, status) VALUES (?,?,'pending')").run(orderId, delivery_address || '');
    await notify(parseInt(wholesaler_id), 'New Order', 'طلب جديد', `New order #${orderId} received`, `تلقيت طلباً جديداً رقم #${orderId}`, 'order');
    orders.push(orderId);
  }

  res.status(201).json({ orders, message: 'Order placed successfully' });
});

// Get orders
router.get('/', auth(['retailer', 'wholesaler', 'admin']), async (req, res) => {
  const { status, page = 1 } = req.query;
  const limit = 20;
  const offset = (parseInt(page) - 1) * limit;

  let where = [];
  const params = [];

  if (req.user.role === 'retailer') { where.push('o.retailer_id = ?'); params.push(req.user.id); }
  if (req.user.role === 'wholesaler') { where.push('o.wholesaler_id = ?'); params.push(req.user.id); }
  if (status) { where.push('o.status = ?'); params.push(status); }

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const orders = await db.prepare(`
    SELECT o.*, r.name as retailer_name, r.phone as retailer_phone, w.name as wholesaler_name, w.business_name
    FROM orders o JOIN users r ON o.retailer_id = r.id JOIN users w ON o.wholesaler_id = w.id
    ${whereStr} ORDER BY o.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  for (const order of orders) {
    order.items = await db.prepare(`
      SELECT oi.*, p.name as product_name, p.name_ar, p.unit FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?
    `).all(order.id);
  }

  res.json(orders);
});

// Get single order - must be after specific routes
router.get('/:id', auth(), async (req, res) => {
  const order = await db.prepare(`
    SELECT o.*, r.name as retailer_name, r.phone as retailer_phone, r.address as retailer_address,
           w.name as wholesaler_name, w.business_name, w.phone as wholesaler_phone
    FROM orders o JOIN users r ON o.retailer_id = r.id JOIN users w ON o.wholesaler_id = w.id WHERE o.id = ?
  `).get(parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (req.user.role === 'retailer' && order.retailer_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (req.user.role === 'wholesaler' && order.wholesaler_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  order.items = await db.prepare(`
    SELECT oi.*, p.name as product_name, p.name_ar, p.images, p.unit FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?
  `).all(order.id);
  order.delivery = await db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(order.id);
  res.json(order);
});

// Update order status
router.patch('/:id/status', auth(['wholesaler', 'admin']), async (req, res) => {
  const { status } = req.body;
  const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'wholesaler' && order.wholesaler_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  await db.prepare("UPDATE orders SET status=?, updated_at=datetime('now') WHERE id=?").run(status, parseInt(req.params.id));
  await notify(order.retailer_id, 'Order Updated', 'تحديث الطلب', `Order #${order.id} is now ${status}`, `طلبك رقم #${order.id} أصبح ${status}`, 'order');
  res.json({ message: 'Status updated' });
});

// Cancel order
router.patch('/:id/cancel', auth(['retailer']), async (req, res) => {
  const order = await db.prepare('SELECT * FROM orders WHERE id = ? AND retailer_id = ?').get(parseInt(req.params.id), req.user.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (!['pending'].includes(order.status)) return res.status(400).json({ message: 'Cannot cancel at this stage' });
  await db.prepare("UPDATE orders SET status='cancelled', updated_at=datetime('now') WHERE id=?").run(parseInt(req.params.id));
  await notify(order.wholesaler_id, 'Order Cancelled', 'إلغاء طلب', `Order #${order.id} was cancelled`, `تم إلغاء الطلب رقم #${order.id}`, 'warning');
  res.json({ message: 'Order cancelled' });
});

module.exports = router;
