const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// Submit a suggestion (public — no login required)
router.post('/', async (req, res) => {
  const { name = '', email = '', message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });
  await db.prepare('INSERT INTO suggestions (name, email, message) VALUES (?,?,?)').run(
    String(name).trim().slice(0, 100),
    String(email).trim().slice(0, 200),
    String(message).trim().slice(0, 2000)
  );
  res.status(201).json({ message: 'Suggestion submitted, thank you!' });
});

// Get all suggestions (admin only)
router.get('/', auth(['admin']), async (req, res) => {
  const rows = await db.prepare('SELECT * FROM suggestions ORDER BY created_at DESC').all();
  res.json(rows);
});

// Mark suggestion as read (admin)
router.patch('/:id/read', auth(['admin']), async (req, res) => {
  await db.prepare('UPDATE suggestions SET is_read = 1 WHERE id = ?').run(parseInt(req.params.id));
  res.json({ message: 'Marked as read' });
});

// Delete suggestion (admin)
router.delete('/:id', auth(['admin']), async (req, res) => {
  await db.prepare('DELETE FROM suggestions WHERE id = ?').run(parseInt(req.params.id));
  res.json({ message: 'Deleted' });
});

module.exports = router;
