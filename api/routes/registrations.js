// api/routes/registrations.js
import { Router } from 'express';
import { pool as db } from '../db.js';

const router = Router();

// GET /api/registrations - Get all registrations with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      event_id, 
      page = 1, 
      limit = 10,
      sort_by = 'registration_date',
      sort_order = 'DESC'
    } = req.query;

    // Parse and validate pagination parameters
    const pageNum = Math.max(1, Number.parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, Number.parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    // Validate event_id if provided
    const eventId = event_id ? Number.parseInt(event_id, 10) : null;
    const hasValidEventId = eventId && Number.isInteger(eventId) && eventId > 0;

    // Validate sort parameters
    const validSortFields = ['id', 'user_name', 'contact_email', 'registration_date', 'num_tickets'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'registration_date';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Build base SQL query
    let sql = `
      SELECT 
        r.*, 
        e.title as event_title,
        e.start_datetime as event_date,
        o.name as organization_name
      FROM registrations r 
      LEFT JOIN events e ON r.event_id = e.id
      LEFT JOIN organizations o ON e.org_id = o.id
      WHERE 1=1
    `;
    
    const params = [];

    // Add event filter if provided
    if (hasValidEventId) {
      sql += ` AND r.event_id = ?`;
      params.push(eventId);
    }

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as filtered_registrations`;
    const [countResult] = await db.query(countSql, params);
    const totalRegistrations = countResult[0].total;
    const totalPages = Math.ceil(totalRegistrations / limitNum);

    // Add sorting and pagination
    sql += ` ORDER BY r.${sortField} ${sortDirection} LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    // Execute query
    const [rows] = await db.query(sql, params);

    // Calculate summary statistics
    const totalTickets = rows.reduce((sum, reg) => sum + reg.num_tickets, 0);

    res.json({
      registrations: rows,
      summary: {
        total_registrations: totalRegistrations,
        total_tickets: totalTickets,
        average_tickets_per_registration: totalRegistrations > 0 ? (totalTickets / totalRegistrations).toFixed(2) : 0
      },
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_registrations: totalRegistrations,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1,
        page_size: limitNum
      }
    });

  } catch (err) {
    console.error('GET /registrations error:', err);
    res.status(500).json({ 
      error: 'DATABASE_ERROR', 
      message: err.message 
    });
  }
});

// GET /api/registrations/:id - Get single registration by ID
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
      SELECT 
        r.*, 
        e.title as event_title,
        e.start_datetime as event_date,
        e.venue as event_venue,
        e.city as event_city,
        e.state as event_state,
        o.name as organization_name,
        c.name as category_name
      FROM registrations r 
      LEFT JOIN events e ON r.event_id = e.id
      LEFT JOIN organizations o ON e.org_id = o.id
      LEFT JOIN categories c ON e.category_id = c.id
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
router.post('/', async (req, res) => {
  const { event_id, user_name, contact_email, num_tickets } = req.body || {};
  
  // Validate required fields
  if (!event_id || !user_name || !contact_email) {
    return res.status(400).json({ 
      error: 'MISSING_REQUIRED_FIELDS', 
      message: 'event_id, user_name, and contact_email are required' 
    });
  }
  
  // Validate event_id
  const eventId = Number.parseInt(event_id, 10);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ 
      error: 'INVALID_EVENT_ID', 
      message: 'event_id must be a positive integer' 
    });
  }

  // Validate user_name
  const userName = user_name.trim();
  if (userName.length < 2 || userName.length > 120) {
    return res.status(400).json({ 
      error: 'INVALID_USER_NAME', 
      message: 'user_name must be between 2 and 120 characters' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = contact_email.trim();
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'INVALID_EMAIL_FORMAT', 
      message: 'Please provide a valid email address' 
    });
  }

  // Validate ticket quantity
  const tickets = Number.parseInt(num_tickets || 1, 10);
  if (!Number.isInteger(tickets) || tickets <= 0 || tickets > 20) {
    return res.status(400).json({ 
      error: 'INVALID_TICKET_QUANTITY', 
      message: 'num_tickets must be an integer between 1 and 20' 
    });
  }

  try {
    // Check if event exists and is upcoming
    const [events] = await db.query(
      `SELECT id, title, status, start_datetime 
       FROM events 
       WHERE id = ? AND status = 'upcoming'`,
      [eventId]
    );
    
    if (!events.length) {
      return res.status(404).json({ 
        error: 'EVENT_NOT_FOUND_OR_NOT_UPCOMING', 
        message: 'Event not found or is not an upcoming event' 
      });
    }

    const event = events[0];

    // Check if event has already started
    const eventStartTime = new Date(event.start_datetime);
    const currentTime = new Date();
    if (eventStartTime <= currentTime) {
      return res.status(400).json({ 
        error: 'EVENT_ALREADY_STARTED', 
        message: 'Cannot register for an event that has already started' 
      });
    }

    // Check for duplicate registration (same email for same event)
    const [existingRegistrations] = await db.query(
      `SELECT id FROM registrations 
       WHERE event_id = ? AND contact_email = ?`,
      [eventId, email]
    );

    if (existingRegistrations.length > 0) {
      return res.status(409).json({ 
        error: 'DUPLICATE_REGISTRATION', 
        message: 'This email is already registered for this event' 
      });
    }

    // Create new registration
    const [result] = await db.query(
      `INSERT INTO registrations (event_id, user_name, contact_email, num_tickets)
       VALUES (?, ?, ?, ?)`,
      [eventId, userName, email, tickets]
    );

    // Return the created registration with event details
    const [newRegistration] = await db.query(`
      SELECT 
        r.*, 
        e.title as event_title,
        e.start_datetime as event_date,
        e.venue as event_venue,
        o.name as organization_name
      FROM registrations r 
      LEFT JOIN events e ON r.event_id = e.id
      LEFT JOIN organizations o ON e.org_id = o.id
      WHERE r.id = ?
    `, [result.insertId]);
    
    return res.status(201).json({
      registration: newRegistration[0],
      message: 'Registration created successfully',
      summary: {
        event_title: newRegistration[0].event_title,
        event_date: newRegistration[0].event_date,
        tickets_booked: tickets
      }
    });
  } catch (err) {
    console.error('POST /registrations error:', err);
    return res.status(500).json({ 
      error: 'REGISTRATION_FAILED', 
      message: 'Failed to create registration' 
    });
  }
});

// PUT /api/registrations/:id - Update an existing registration
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
      `SELECT r.*, e.status as event_status, e.start_datetime 
       FROM registrations r 
       LEFT JOIN events e ON r.event_id = e.id 
       WHERE r.id = ?`,
      [registrationId]
    );
    
    if (!existingRegistration.length) {
      return res.status(404).json({ 
        error: 'REGISTRATION_NOT_FOUND', 
        message: 'Registration not found' 
      });
    }

    const currentRegistration = existingRegistration[0];

    // Check if the associated event has already started
    const eventStartTime = new Date(currentRegistration.start_datetime);
    const currentTime = new Date();
    if (eventStartTime <= currentTime) {
      return res.status(400).json({ 
        error: 'EVENT_ALREADY_STARTED', 
        message: 'Cannot update registration for an event that has already started' 
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    // Validate and add user_name if provided
    if (user_name !== undefined) {
      const userName = user_name.trim();
      if (userName.length < 2 || userName.length > 120) {
        return res.status(400).json({ 
          error: 'INVALID_USER_NAME', 
          message: 'user_name must be between 2 and 120 characters' 
        });
      }
      updateFields.push('user_name = ?');
      updateValues.push(userName);
    }

    // Validate and add contact_email if provided
    if (contact_email !== undefined) {
      const email = contact_email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'INVALID_EMAIL_FORMAT', 
          message: 'Please provide a valid email address' 
        });
      }

      // Check for duplicate email (excluding current registration)
      const [duplicateCheck] = await db.query(
        `SELECT id FROM registrations 
         WHERE event_id = ? AND contact_email = ? AND id != ?`,
        [currentRegistration.event_id, email, registrationId]
      );

      if (duplicateCheck.length > 0) {
        return res.status(409).json({ 
          error: 'DUPLICATE_EMAIL', 
          message: 'This email is already registered for this event' 
        });
      }

      updateFields.push('contact_email = ?');
      updateValues.push(email);
    }

    // Validate and add num_tickets if provided
    if (num_tickets !== undefined) {
      const tickets = Number.parseInt(num_tickets, 10);
      if (!Number.isInteger(tickets) || tickets <= 0 || tickets > 20) {
        return res.status(400).json({ 
          error: 'INVALID_TICKET_QUANTITY', 
          message: 'num_tickets must be an integer between 1 and 20' 
        });
      }
      updateFields.push('num_tickets = ?');
      updateValues.push(tickets);
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
      SELECT 
        r.*, 
        e.title as event_title,
        e.start_datetime as event_date,
        o.name as organization_name
      FROM registrations r 
      LEFT JOIN events e ON r.event_id = e.id
      LEFT JOIN organizations o ON e.org_id = o.id
      WHERE r.id = ?
    `, [registrationId]);

    res.json({
      registration: updatedRegistration[0],
      message: 'Registration updated successfully'
    });
  } catch (err) {
    console.error('PUT /registrations/:id error:', err);
    res.status(500).json({ 
      error: 'UPDATE_FAILED', 
      message: 'Failed to update registration' 
    });
  }
});

// DELETE /api/registrations/:id - Delete a registration
router.delete('/:id', async (req, res) => {
  try {
    const registrationId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(registrationId) || registrationId <= 0) {
      return res.status(400).json({ 
        error: 'INVALID_ID', 
        message: 'Registration ID must be a positive integer' 
      });
    }

    // Check if registration exists and get event details
    const [existingRegistration] = await db.query(
      `SELECT r.*, e.title as event_title, e.start_datetime 
       FROM registrations r 
       LEFT JOIN events e ON r.event_id = e.id 
       WHERE r.id = ?`,
      [registrationId]
    );
    
    if (!existingRegistration.length) {
      return res.status(404).json({ 
        error: 'REGISTRATION_NOT_FOUND', 
        message: 'Registration not found' 
      });
    }

    const registration = existingRegistration[0];

    // Check if the associated event has already started
    const eventStartTime = new Date(registration.start_datetime);
    const currentTime = new Date();
    if (eventStartTime <= currentTime) {
      return res.status(400).json({ 
        error: 'EVENT_ALREADY_STARTED', 
        message: 'Cannot delete registration for an event that has already started' 
      });
    }

    // Delete the registration
    await db.query('DELETE FROM registrations WHERE id = ?', [registrationId]);

    res.status(200).json({
      success: true,
      message: 'Registration deleted successfully',
      deleted_registration: {
        id: registrationId,
        user_name: registration.user_name,
        event_title: registration.event_title,
        tickets: registration.num_tickets
      }
    });
  } catch (err) {
    console.error('DELETE /registrations/:id error:', err);
    res.status(500).json({ 
      error: 'DELETE_FAILED', 
      message: 'Failed to delete registration' 
    });
  }
});

// GET /api/registrations/stats/summary - Get registration statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_registrations,
        COALESCE(SUM(num_tickets), 0) as total_tickets,
        COUNT(DISTINCT event_id) as unique_events,
        COUNT(DISTINCT contact_email) as unique_attendees,
        AVG(num_tickets) as avg_tickets_per_registration,
        MAX(registration_date) as latest_registration
      FROM registrations
    `);

    // Get registrations by event
    const [eventStats] = await db.query(`
      SELECT 
        e.id as event_id,
        e.title as event_title,
        COUNT(r.id) as registration_count,
        COALESCE(SUM(r.num_tickets), 0) as total_tickets
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      GROUP BY e.id, e.title
      ORDER BY registration_count DESC
      LIMIT 10
    `);

    res.json({
      overall_stats: stats[0],
      top_events: eventStats
    });
  } catch (err) {
    console.error('GET /registrations/stats/summary error:', err);
    res.status(500).json({ 
      error: 'STATS_ERROR', 
      message: 'Failed to retrieve registration statistics' 
    });
  }
});

export default router;