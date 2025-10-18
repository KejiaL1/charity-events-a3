import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/events?date=YYYY-MM-DD&city=San%20Jose&categoryId=1
router.get('/', async (req, res) => {
  try {
    const { date, city, categoryId } = req.query;
    const where = ["e.status <> 'paused'"];
    const params = [];

    if (date) {
      where.push('DATE(e.start_datetime) <= ? AND DATE(e.end_datetime) >= ?');
      params.push(date, date);
    } else {
      where.push('e.end_datetime >= NOW()');
    }

    if (city) {
      where.push('LOWER(e.city) LIKE LOWER(CONCAT("%", ?, "%"))');
      params.push(city);
    }

    if (categoryId) {
      where.push('e.category_id = ?');
      params.push(Number(categoryId));
    }

    const sql = `
      SELECT e.id, e.title, e.city, e.state,
             e.start_datetime, e.end_datetime, e.hero_image_url,
             c.name AS category, o.name AS org_name
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN organizations o ON e.org_id = o.id
      WHERE ${where.join(' AND ')}
      ORDER BY e.start_datetime ASC
      LIMIT 200
    `;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /events error:', err);
    res.status(500).json({ error: 'DB_ERROR' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const sql = `
      SELECT e.*, c.name AS category_name,
             o.name AS org_name, o.about AS org_about, o.contact_email
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN organizations o ON e.org_id = o.id
      WHERE e.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [id]);
    if (!rows.length) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /events/:id error:', err);
    res.status(500).json({ error: 'DB_ERROR' });
  }
});

export default router;
 
