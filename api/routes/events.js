// api/routes/events.js
import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/events - Get all events with optional filtering
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

// GET /api/events/:id - Get single event by ID
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

// POST /api/events - Create a new event
router.post('/', async (req, res) => {
  try {
    const {
      title,
      category_id,
      org_id,
      description,
      purpose,
      venue,
      city,
      state,
      start_datetime,
      end_datetime,
      ticket_price_cents = 0,
      is_free = false,
      target_amount_cents = 0,
      raised_amount_cents = 0,
      status = 'upcoming',
      hero_image_url = null
    } = req.body;

    // Validate required fields
    if (!title || !category_id || !org_id || !start_datetime || !end_datetime) {
      return res.status(400).json({
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'title, category_id, org_id, start_datetime, and end_datetime are required'
      });
    }

    // Validate category_id and org_id exist
    const [categoryCheck] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (!categoryCheck.length) {
      return res.status(400).json({ error: 'INVALID_CATEGORY', message: 'Category does not exist' });
    }

    const [orgCheck] = await pool.query('SELECT id FROM organizations WHERE id = ?', [org_id]);
    if (!orgCheck.length) {
      return res.status(400).json({ error: 'INVALID_ORGANIZATION', message: 'Organization does not exist' });
    }

    // Validate datetime format and logic
    const startDate = new Date(start_datetime);
    const endDate = new Date(end_datetime);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'INVALID_DATETIME', message: 'Invalid datetime format' });
    }

    if (startDate >= endDate) {
      return res.status(400).json({ error: 'INVALID_DATETIME_RANGE', message: 'start_datetime must be before end_datetime' });
    }

    // Insert new event
    const [result] = await pool.query(
      `INSERT INTO events (
        title, category_id, org_id, description, purpose, venue,
        city, state, start_datetime, end_datetime, ticket_price_cents,
        is_free, target_amount_cents, raised_amount_cents, status, hero_image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, category_id, org_id, description, purpose, venue,
        city, state, start_datetime, end_datetime, ticket_price_cents,
        is_free, target_amount_cents, raised_amount_cents, status, hero_image_url
      ]
    );

    // Return the created event
    const [newEvent] = await pool.query(`
      SELECT e.*, c.name AS category_name, o.name AS org_name 
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN organizations o ON e.org_id = o.id
      WHERE e.id = ?
    `, [result.insertId]);

    res.status(201).json(newEvent[0]);
  } catch (err) {
    console.error('POST /api/events error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// PUT /api/events/:id - Update an existing event
router.put('/:id', async (req, res) => {
  try {
    const eventId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'BAD_ID', message: 'id must be a positive integer' });
    }

    const {
      title,
      category_id,
      org_id,
      description,
      purpose,
      venue,
      city,
      state,
      start_datetime,
      end_datetime,
      ticket_price_cents,
      is_free,
      target_amount_cents,
      raised_amount_cents,
      status,
      hero_image_url
    } = req.body;

    // Check if event exists
    const [existingEvent] = await pool.query('SELECT id FROM events WHERE id = ?', [eventId]);
    if (!existingEvent.length) {
      return res.status(404).json({ error: 'EVENT_NOT_FOUND', message: 'Event not found' });
    }

    // Validate category_id if provided
    if (category_id) {
      const [categoryCheck] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
      if (!categoryCheck.length) {
        return res.status(400).json({ error: 'INVALID_CATEGORY', message: 'Category does not exist' });
      }
    }

    // Validate org_id if provided
    if (org_id) {
      const [orgCheck] = await pool.query('SELECT id FROM organizations WHERE id = ?', [org_id]);
      if (!orgCheck.length) {
        return res.status(400).json({ error: 'INVALID_ORGANIZATION', message: 'Organization does not exist' });
      }
    }

    // Validate datetime if provided
    if (start_datetime && end_datetime) {
      const startDate = new Date(start_datetime);
      const endDate = new Date(end_datetime);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'INVALID_DATETIME', message: 'Invalid datetime format' });
      }

      if (startDate >= endDate) {
        return res.status(400).json({ error: 'INVALID_DATETIME_RANGE', message: 'start_datetime must be before end_datetime' });
      }
    }

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (category_id !== undefined) { updateFields.push('category_id = ?'); updateValues.push(category_id); }
    if (org_id !== undefined) { updateFields.push('org_id = ?'); updateValues.push(org_id); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (purpose !== undefined) { updateFields.push('purpose = ?'); updateValues.push(purpose); }
    if (venue !== undefined) { updateFields.push('venue = ?'); updateValues.push(venue); }
    if (city !== undefined) { updateFields.push('city = ?'); updateValues.push(city); }
    if (state !== undefined) { updateFields.push('state = ?'); updateValues.push(state); }
    if (start_datetime !== undefined) { updateFields.push('start_datetime = ?'); updateValues.push(start_datetime); }
    if (end_datetime !== undefined) { updateFields.push('end_datetime = ?'); updateValues.push(end_datetime); }
    if (ticket_price_cents !== undefined) { updateFields.push('ticket_price_cents = ?'); updateValues.push(ticket_price_cents); }
    if (is_free !== undefined) { updateFields.push('is_free = ?'); updateValues.push(is_free); }
    if (target_amount_cents !== undefined) { updateFields.push('target_amount_cents = ?'); updateValues.push(target_amount_cents); }
    if (raised_amount_cents !== undefined) { updateFields.push('raised_amount_cents = ?'); updateValues.push(raised_amount_cents); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (hero_image_url !== undefined) { updateFields.push('hero_image_url = ?'); updateValues.push(hero_image_url); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'NO_FIELDS_TO_UPDATE', message: 'No fields provided for update' });
    }

    updateValues.push(eventId);

    const updateQuery = `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.query(updateQuery, updateValues);

    // Return updated event
    const [updatedEvent] = await pool.query(`
      SELECT e.*, c.name AS category_name, o.name AS org_name 
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN organizations o ON e.org_id = o.id
      WHERE e.id = ?
    `, [eventId]);

    res.json(updatedEvent[0]);
  } catch (err) {
    console.error('PUT /api/events/:id error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// DELETE /api/events/:id - Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const eventId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'BAD_ID', message: 'id must be a positive integer' });
    }

    // Check if event exists
    const [existingEvent] = await pool.query('SELECT id FROM events WHERE id = ?', [eventId]);
    if (!existingEvent.length) {
      return res.status(404).json({ error: 'EVENT_NOT_FOUND', message: 'Event not found' });
    }

    // Delete the event (registrations will be automatically deleted due to CASCADE constraint)
    await pool.query('DELETE FROM events WHERE id = ?', [eventId]);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      deletedId: eventId
    });
  } catch (err) {
    console.error('DELETE /api/events/:id error:', err);
    
    // Handle foreign key constraint errors
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({
        error: 'EVENT_HAS_REGISTRATIONS',
        message: 'Cannot delete event because it has existing registrations. Delete registrations first or use soft delete.'
      });
    }

    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

export default router;