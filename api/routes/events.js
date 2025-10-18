const { Router } = require('express');
const { pool } = require('../db.js');

const router = Router();

// GET /api/events - Search and filter events
router.get('/', async (req, res) => {
  try {
    const { date, location, categoryId, search } = req.query;
    const where = ["e.is_active = 1 AND e.is_suspended = 0"];
    const params = [];

    if (date) {
      where.push('DATE(e.event_date) = ?');
      params.push(date);
    }

    if (location) {
      where.push('LOWER(e.location) LIKE LOWER(CONCAT("%", ?, "%"))');
      params.push(location);
    }

    if (categoryId) {
      where.push('e.category_id = ?');
      params.push(Number(categoryId));
    }

    if (search) {
      where.push('(LOWER(e.title) LIKE LOWER(CONCAT("%", ?, "%")) OR LOWER(e.description) LIKE LOWER(CONCAT("%", ?, "%")))');
      params.push(search, search);
    }

    const sql = `
      SELECT 
        e.id, e.title, e.short_description, e.event_date, e.location,
        e.venue_name, e.ticket_price, e.fundraising_goal, e.current_amount,
        e.max_attendees, e.image_url, e.registration_deadline,
        c.name AS category_name,
        o.name AS organization_name
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN organizations o ON e.organization_id = o.id
      WHERE ${where.join(' AND ')}
      ORDER BY e.event_date ASC
      LIMIT 100
    `;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /events error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// GET /api/events/:id - Get event details + registration list
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Get event details
    const eventSql = `
      SELECT 
        e.*, 
        c.name AS category_name,
        o.name AS organization_name, o.description AS organization_description,
        o.contact_email AS organization_contact, o.website_url AS organization_website
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN organizations o ON e.organization_id = o.id
      WHERE e.id = ?
      LIMIT 1
    `;
    const [eventRows] = await pool.query(eventSql, [id]);
    
    if (!eventRows.length) {
      return res.status(404).json({ error: 'EVENT_NOT_FOUND' });
    }

    // Get registration list for this event (sorted by latest date)
    const registrationsSql = `
      SELECT 
        id, user_name, user_email, registration_date, 
        tickets_purchased, contact_details, special_requirements
      FROM registrations 
      WHERE event_id = ?
      ORDER BY registration_date DESC
    `;
    const [registrationRows] = await pool.query(registrationsSql, [id]);

    // Combine response data
    const eventData = {
      ...eventRows[0],
      registrations: registrationRows,
      total_registrations: registrationRows.length,
      total_tickets: registrationRows.reduce((sum, reg) => sum + reg.tickets_purchased, 0)
    };

    res.json(eventData);
  } catch (err) {
    console.error('GET /events/:id error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// POST /api/events - Create new event (admin side)
router.post('/', async (req, res) => {
  try {
    const {
      title, description, short_description, event_date, location, venue_name,
      category_id, organization_id, ticket_price, fundraising_goal, max_attendees,
      image_url, registration_deadline
    } = req.body;

    // Validate required fields
    if (!title || !description || !event_date || !location || !category_id || !organization_id) {
      return res.status(400).json({ 
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title, description, event date, location, category, and organization are required'
      });
    }

    const sql = `
      INSERT INTO events (
        title, description, short_description, event_date, location, venue_name,
        category_id, organization_id, ticket_price, fundraising_goal, max_attendees,
        image_url, registration_deadline, is_active, is_suspended
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `;

    const [result] = await pool.query(sql, [
      title, description, short_description, event_date, location, venue_name,
      category_id, organization_id, ticket_price || null, fundraising_goal || null,
      max_attendees || null, image_url || '/images/events/default-event.jpg',
      registration_deadline || null
    ]);

    res.status(201).json({
      id: result.insertId,
      message: 'Event created successfully'
    });
  } catch (err) {
    console.error('POST /events error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// PUT /api/events/:id - Update event (admin side)
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      title, description, short_description, event_date, location, venue_name,
      category_id, organization_id, ticket_price, fundraising_goal, current_amount,
      max_attendees, image_url, is_active, is_suspended, registration_deadline
    } = req.body;

    // Check if event exists
    const [checkRows] = await pool.query('SELECT id FROM events WHERE id = ?', [id]);
    if (!checkRows.length) {
      return res.status(404).json({ error: 'EVENT_NOT_FOUND' });
    }

    const sql = `
      UPDATE events SET
        title = ?, description = ?, short_description = ?, event_date = ?, 
        location = ?, venue_name = ?, category_id = ?, organization_id = ?,
        ticket_price = ?, fundraising_goal = ?, current_amount = ?,
        max_attendees = ?, image_url = ?, is_active = ?, is_suspended = ?,
        registration_deadline = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(sql, [
      title, description, short_description, event_date, location, venue_name,
      category_id, organization_id, ticket_price, fundraising_goal, current_amount,
      max_attendees, image_url, is_active, is_suspended, registration_deadline, id
    ]);

    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('PUT /events/:id error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// DELETE /api/events/:id - Delete event (admin side)
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Check if event has registration records
    const [registrationRows] = await pool.query(
      'SELECT id FROM registrations WHERE event_id = ? LIMIT 1',
      [id]
    );

    if (registrationRows.length > 0) {
      return res.status(400).json({
        error: 'EVENT_HAS_REGISTRATIONS',
        message: 'Cannot delete event that has existing registrations'
      });
    }

    // Delete event
    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'EVENT_NOT_FOUND' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('DELETE /events/:id error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

module.exports = router;