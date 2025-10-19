// api/routes/events.js
const { Router } = require('express');
const { pool } = require('../db.js');

const router = Router();

router.get('/', async (req, res) => {
  try {
    let { date, city, categoryId, search } = req.query;

    const catId = Number.parseInt(categoryId, 10);
    const hasValidCatId = Number.isInteger(catId) && catId > 0;
    const dateOk = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
    city = (typeof city === 'string' ? city.trim() : '');
    search = (typeof search === 'string' ? search.trim() : '');

    let sql = `
      SELECT
        e.id, e.title, e.city, e.state,
        e.start_datetime, e.end_datetime,
        e.hero_image_url,
        e.ticket_price_cents, e.is_free,
        c.name AS category,
        o.name AS org_name
      FROM events e
      LEFT JOIN categories    c ON e.category_id = c.id
      LEFT JOIN organizations o ON e.org_id      = o.id
      WHERE 1=1
    `;
    const params = [];
    if (dateOk)      { sql += ` AND DATE(e.start_datetime) = ?`; params.push(date); }
    if (city)        { sql += ` AND e.city LIKE ?`;              params.push(`%${city}%`); }
    if (hasValidCatId){ sql += ` AND e.category_id = ?`;          params.push(catId); }
    if (search)      { sql += ` AND (e.title LIKE ? OR e.description LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    sql += ` ORDER BY e.start_datetime ASC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/events error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'BAD_ID', message: 'id must be a positive integer' });
    }

    const [rows] = await pool.query(`
      SELECT
        e.*,
        c.name AS category_name,
        o.name AS org_name,
        o.about AS org_about,
        o.contact_email,
        (SELECT COALESCE(SUM(r.num_tickets),0)
           FROM registrations r
          WHERE r.event_id = e.id) AS total_registrations
      FROM events e
      LEFT JOIN categories    c ON e.category_id = c.id
      LEFT JOIN organizations o ON e.org_id      = o.id
      WHERE e.id = ?
      LIMIT 1
    `, [id]);

    if (!rows.length) return res.status(404).json({ error: 'EVENT_NOT_FOUND' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/events/:id error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

module.exports = router;