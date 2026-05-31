const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

router.post('/', auth(['admin']), (req, res) => {
  const { name, name_ar, icon, parent_id } = req.body;
  const result = db.prepare('INSERT INTO categories (name, name_ar, icon, parent_id) VALUES (?,?,?,?)').run(name || '', name_ar || '', icon || '📦', parent_id || null);
  res.status(201).json({ id: Number(result.lastInsertRowid), name, name_ar, icon });
});

router.delete('/:id', auth(['admin']), (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
