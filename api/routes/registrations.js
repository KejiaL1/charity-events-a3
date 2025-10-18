import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// POST /api/registrations - Create new registration
router.post('/', async (req, res) => {
  try {
    const {
      event_id, user_name, user_email, tickets_purchased, 
      contact_details, special_requirements
    } = req.body;

    // Validate required fields
    if (!event_id || !user_name || !user_email || !tickets_purchased) {
      return res.status(400).json({
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Event ID, user name, user email, and tickets purchased are required'
      });
    }

    // Validate event exists and is active
    const [eventRows] = await pool.query(
      'SELECT id, title, max_attendees FROM events WHERE id = ? AND is_active = 1 AND is_suspended = 0',
      [event_id]
    );

    if (!eventRows.length) {
      return res.status(404).json({
        error: 'EVENT_NOT_AVAILABLE',
        message: 'Event not found or not available for registration'
      });
    }

    // Check maximum attendees limit
    const event = eventRows[0];
    if (event.max_attendees) {
      const [attendanceRows] = await pool.query(
        'SELECT SUM(tickets_purchased) as total_tickets FROM registrations WHERE event_id = ?',
        [event_id]
      );
      
      const totalTickets = attendanceRows[0].total_tickets || 0;
      if (totalTickets + tickets_purchased > event.max_attendees) {
        return res.status(400).json({
          error: 'EVENT_FULL',
          message: `Not enough tickets available. Only ${event.max_attendees - totalTickets} tickets left.`
        });
      }
    }

    // Create registration
    const sql = `
      INSERT INTO registrations (
        event_id, user_name, user_email, tickets_purchased,
        contact_details, special_requirements
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      event_id, user_name, user_email, tickets_purchased,
      contact_details, special_requirements
    ]);

    res.status(201).json({
      id: result.insertId,
      message: 'Registration completed successfully',
      event_title: event.title
    });
  } catch (err) {
    console.error('POST /registrations error:', err);
    
    // Handle unique constraint violation (duplicate registration)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        error: 'DUPLICATE_REGISTRATION',
        message: 'You have already registered for this event'
      });
    }
    
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// GET /api/registrations/event/:eventId - Get all registrations for specific event
router.get('/event/:eventId', async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    
    const sql = `
      SELECT 
        r.*,
        e.title as event_title
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.event_id = ?
      ORDER BY r.registration_date DESC
    `;
    
    const [rows] = await pool.query(sql, [eventId]);
    res.json(rows);
  } catch (err) {
    console.error('GET /registrations/event/:eventId error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

export default router;