const { Router } = require('express');
const db = require('../db.js');

const router = Router();

// POST /api/registrations
router.post('/', async (req, res) => {
  const { event_id, user_name, contact_email, num_tickets } = req.body || {};
  if (!event_id || !user_name || !contact_email) {
    return res.status(400).json({ error: 'event_id, user_name, contact_email are required' });
  }
  const tickets = Number(num_tickets || 1);
  if (tickets <= 0) {
    return res.status(400).json({ error: 'num_tickets must be > 0' });
  }

  try {
    const [ev] = await db.query('SELECT id FROM events WHERE id = ?', [event_id]);
    if (!ev.length) return res.status(404).json({ error: 'Event not found' });

    const [ret] = await db.query(
      `INSERT INTO registrations (event_id, user_name, contact_email, num_tickets)
       VALUES (?, ?, ?, ?)`,
      [event_id, user_name.trim(), contact_email.trim(), tickets]
    );

    const [row] = await db.query('SELECT * FROM registrations WHERE id = ?', [ret.insertId]);
    return res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create registration' });
  }
});

module.exports = router;