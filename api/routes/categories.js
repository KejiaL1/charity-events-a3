const { Router } = require('express');
const { pool } = require('../db.js');

const router = Router();

// GET /api/categories
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name FROM categories ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /categories error:', err);
    res.status(500).json({ error: 'DB_ERROR' });
  }
});

module.exports = router;