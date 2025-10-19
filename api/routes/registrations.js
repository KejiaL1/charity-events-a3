import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.post('/', async (req, res) => {
  const { event_id, user_name, contact_email, num_tickets } = req.body || {};
  
  if (!event_id || !user_name || !contact_email) {
    return res.status(400).json({ 
      error: 'MISSING_FIELDS', 
      message: 'event_id, user_name, contact_email are required' 
    });
  }
  
  const tickets = Number(num_tickets || 1);
  if (tickets <= 0) {
    return res.status(400).json({ 
      error: 'INVALID_TICKETS', 
      message: 'num_tickets must be > 0' 
    });
  }

  try {
    const [events] = await db.query('SELECT id FROM events WHERE id = ?', [event_id]);
    if (!events.length) {
      return res.status(404).json({ 
        error: 'EVENT_NOT_FOUND', 
        message: 'Event not found' 
      });
    }

    const [result] = await db.query(
      `INSERT INTO registrations (event_id, user_name, contact_email, num_tickets)
       VALUES (?, ?, ?, ?)`,
      [event_id, user_name.trim(), contact_email.trim(), tickets]
    );

    const [rows] = await db.query('SELECT * FROM registrations WHERE id = ?', [result.insertId]);
    
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ 
      error: 'REGISTRATION_FAILED', 
      message: 'Failed to create registration' 
    });
  }
});

export default router;