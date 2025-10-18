import { Router } from 'express';
import { pool } from '../db.js';

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

export default router;
 
