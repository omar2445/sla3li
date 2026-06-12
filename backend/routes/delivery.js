const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// Get available deliveries (unassigned)
router.get('/available', auth(['driver']), async (req, res) => {
  const deliveries = await db.prepare(`
    SELECT d.*, o.total_amount, o.delivery_address, r.name as retailer_name, r.phone as retailer_phone,
           w.name as wholesaler_name, w.address as pickup_address_auto
    FROM deliveries d
    JOIN orders o ON d.order_id = o.id
    JOIN users r ON o.retailer_id = r.id
    JOIN users w ON o.wholesaler_id = w.id
    WHERE d.driver_id IS NULL AND d.status = 'pending' AND o.status = 'processing'
    ORDER BY d.created_at DESC
  `).all();
  res.json(deliveries);
});

// My deliveries (driver)
router.get('/my', auth(['driver']), async (req, res) => {
  const deliveries = await db.prepare(`
    SELECT d.*, o.total_amount, o.delivery_address, r.name as retailer_name, r.phone as retailer_phone, r.address as retailer_address,
           w.name as wholesaler_name, w.business_name, w.address as wholesaler_address, w.phone as wholesaler_phone
    FROM deliveries d
    JOIN orders o ON d.order_id = o.id
    JOIN users r ON o.retailer_id = r.id
    JOIN users w ON o.wholesaler_id = w.id
    WHERE d.driver_id = ?
    ORDER BY d.updated_at DESC
  `).all(req.user.id);
  res.json(deliveries);
});

// Accept delivery
router.patch('/:id/accept', auth(['driver']), async (req, res) => {
  const d = await db.prepare('SELECT * FROM deliveries WHERE id = ?').get(req.params.id);
  if (!d) return res.status(404).json({ message: 'Not found' });
  if (d.driver_id) return res.status(400).json({ message: 'Already taken' });
  await db.prepare("UPDATE deliveries SET driver_id=?, status='assigned', updated_at=datetime('now') WHERE id=?").run(req.user.id, req.params.id);
  res.json({ message: 'Delivery accepted' });
});

// Update delivery status
router.patch('/:id/status', auth(['driver', 'admin']), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['picked_up', 'in_transit', 'delivered', 'failed'];
  if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const d = await db.prepare('SELECT * FROM deliveries WHERE id = ?').get(req.params.id);
  if (!d) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'driver' && d.driver_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  await db.prepare("UPDATE deliveries SET status=?, updated_at=datetime('now') WHERE id=?").run(status, req.params.id);

  if (status === 'delivered') {
    await db.prepare("UPDATE orders SET status='delivered', updated_at=datetime('now') WHERE id=?").run(d.order_id);
    const order = await db.prepare('SELECT * FROM orders WHERE id=?').get(d.order_id);
    await db.prepare('INSERT INTO notifications (user_id, title, title_ar, message, message_ar, type) VALUES (?,?,?,?,?,?)')
      .run(order.retailer_id, 'Order Delivered', 'تم التوصيل', `Your order #${d.order_id} has been delivered!`, `تم توصيل طلبك رقم #${d.order_id}!`, 'success');
  }

  res.json({ message: 'Status updated' });
});

// Track delivery by order ID (retailer)
router.get('/track/:order_id', auth(), async (req, res) => {
  const delivery = await db.prepare(`
    SELECT d.*, u.name as driver_name, u.phone as driver_phone FROM deliveries d LEFT JOIN users u ON d.driver_id = u.id WHERE d.order_id = ?
  `).get(req.params.order_id);
  if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
  res.json(delivery);
});

module.exports = router;
