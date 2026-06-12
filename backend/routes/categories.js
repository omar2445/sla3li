const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const categories = await db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

router.post('/', auth(['admin']), async (req, res) => {
  const { name, name_ar, icon, parent_id } = req.body;
  const result = await db.prepare('INSERT INTO categories (name, name_ar, icon, parent_id) VALUES (?,?,?,?)').run(name || '', name_ar || '', icon || '📦', parent_id || null);
  res.status(201).json({ id: result.lastInsertRowid, name, name_ar, icon });
});

router.delete('/:id', auth(['admin']), async (req, res) => {
  await db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
