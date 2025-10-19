import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/registrations - Get all registrations
// Obtain all registration records
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, e.title as event_title 
      FROM registrations r 
      LEFT JOIN events e ON r.event_id = e.id 
      ORDER BY r.registration_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /registrations error:', err);
    res.status(500).json({ 
      error: 'DATABASE_ERROR', 
      message: err.message 
    });
  }
});

// GET /api/registrations/:id - Get single registration by ID
// Obtain a single registration record based on the ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ 
        error: 'INVALID_ID', 
        message: 'Registration ID must be a positive integer' 
      });
    }

    const [rows] = await db.query(`
      SELECT r.*, e.title as event_title 
      FROM registrations r 
      LEFT JOIN events e ON r.event_id = e.id 
      WHERE r.id = ?
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ 
        error: 'REGISTRATION_NOT_FOUND', 
        message: 'Registration not found' 
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('GET /registrations/:id error:', err);
    res.status(500).json({ 
      error: 'DATABASE_ERROR', 
      message: err.message 
    });
  }
});

// POST /api/registrations - Create a new registration
// Create a new registration record
router.post('/', async (req, res) => {
  const { event_id, user_name, contact_email, num_tickets } = req.body || {};
  
  // Validate required fields

  if (!event_id || !user_name || !contact_email) {
    return res.status(400).json({ 
      error: 'MISSING_REQUIRED_FIELDS', 
      message: 'event_id, user_name, and contact_email are required' 
    });
  }
  
  // Validate ticket quantity

  const tickets = Number(num_tickets || 1);
  if (tickets <= 0) {
    return res.status(400).json({ 
      error: 'INVALID_TICKET_QUANTITY', 
      message: 'num_tickets must be greater than 0' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact_email)) {
    return res.status(400).json({ 
      error: 'INVALID_EMAIL_FORMAT', 
      message: 'Please provide a valid email address' 
    });
  }

  try {
    // Check if event exists
    const [events] = await db.query('SELECT id FROM events WHERE id = ?', [event_id]);
    if (!events.length) {
      return res.status(404).json({ 
        error: 'EVENT_NOT_FOUND', 
        message: 'Event not found' 
      });
    }

    // Create new registration
    const [result] = await db.query(
      `INSERT INTO registrations (event_id, user_name, contact_email, num_tickets)
       VALUES (?, ?, ?, ?)`,
      [event_id, user_name.trim(), contact_email.trim(), tickets]
    );

    // Return the created registration
    const [rows] = await db.query(`
      SELECT r.*, e.title as event_title 
      FROM registrations r 
      LEFT JOIN events e ON r.event_id = e.id 
      WHERE r.id = ?
    `, [result.insertId]);
    
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /registrations error:', err);
    return res.status(500).json({ 
      error: 'REGISTRATION_FAILED', 
      message: 'Failed to create registration' 
    });
  }
});

// PUT /api/registrations/:id - Update an existing registration
// Update an existing registration record
router.put('/:id', async (req, res) => {
  try {
    const registrationId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(registrationId) || registrationId <= 0) {
      return res.status(400).json({ 
        error: 'INVALID_ID', 
        message: 'Registration ID must be a positive integer' 
      });
    }

    const { user_name, contact_email, num_tickets } = req.body;

    // Check if registration exists
    const [existingRegistration] = await db.query(
      'SELECT id FROM registrations WHERE id = ?', 
      [registrationId]
    );
    if (!existingRegistration.length) {
      return res.status(404).json({ 
        error: 'REGISTRATION_NOT_FOUND', 
        message: 'Registration not found' 
      });
    }

    // Validate input data
    if (num_tickets !== undefined) {
      const tickets = Number(num_tickets);
      if (isNaN(tickets) || tickets <= 0) {
        return res.status(400).json({ 
          error: 'INVALID_TICKET_QUANTITY', 
          message: 'num_tickets must be a number greater than 0' 
        });
      }
    }

    if (contact_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact_email)) {
        return res.status(400).json({ 
          error: 'INVALID_EMAIL_FORMAT', 
          message: 'Please provide a valid email address' 
        });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    if (user_name !== undefined) {
      updateFields.push('user_name = ?');
      updateValues.push(user_name.trim());
    }
    if (contact_email !== undefined) {
      updateFields.push('contact_email = ?');
      updateValues.push(contact_email.trim());
    }
    if (num_tickets !== undefined) {
      updateFields.push('num_tickets = ?');
      updateValues.push(Number(num_tickets));
    }

    // Check if there are fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'NO_FIELDS_TO_UPDATE', 
        message: 'No valid fields provided for update' 
      });
    }

    updateValues.push(registrationId);

    // Execute update
    const updateQuery = `UPDATE registrations SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.query(updateQuery, updateValues);

    // Return updated registration
    const [updatedRegistration] = await db.query(`
      SELECT r.*, e.title as event_title 
      FROM registrations r 
      LEFT JOIN events e ON r.event_id = e.id 
      WHERE r.id = ?
    `, [registrationId]);

    res.json(updatedRegistration[0]);
  } catch (err) {
    console.error('PUT /registrations/:id error:', err);
    res.status(500).json({ 
      error: 'UPDATE_FAILED', 
      message: 'Failed to update registration' 
    });
  }
});

// DELETE /api/registrations/:id - Delete a registration
    // Delete a registration record
router.delete('/:id', async (req, res) => {
  try {
    const registrationId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(registrationId) || registrationId <= 0) {
      return res.status(400).json({ 
        error: 'INVALID_ID', 
        message: 'Registration ID must be a positive integer' 
      });
    }

    // Check if registration exists
    const [existingRegistration] = await db.query(
      'SELECT id FROM registrations WHERE id = ?', 
      [registrationId]
    );
    if (!existingRegistration.length) {
      return res.status(404).json({ 
        error: 'REGISTRATION_NOT_FOUND', 
        message: 'Registration not found' 
      });
    }

    // Delete the registration
    await db.query('DELETE FROM registrations WHERE id = ?', [registrationId]);

    res.status(200).json({
      success: true,
      message: 'Registration deleted successfully',
      deletedId: registrationId
    });
  } catch (err) {
    console.error('DELETE /registrations/:id error:', err);
    res.status(500).json({ 
      error: 'DELETE_FAILED', 
      message: 'Failed to delete registration' 
    });
  }
});

export default router;