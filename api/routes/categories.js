// api/routes/categories.js - CRUD operations that need to be added
const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('GET /categories error:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// POST /api/categories - Create a new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'MISSING_NAME',
        message: 'Category name is required'
      });
    }

    const categoryName = name.trim();

    // Check whether the classification already exists
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE name = ?',
      [categoryName]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'CATEGORY_EXISTS',
        message: 'Category with this name already exists'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name) VALUES (?)',
      [categoryName]
    );

    const [newCategory] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newCategory[0]);
  } catch (err) {
    console.error('POST /categories error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// PUT /api/categories/:id - Update classification
router.put('/:id', async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id, 10);
    const { name } = req.body;

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        error: 'INVALID_ID',
        message: 'Category ID must be a positive integer'
      });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'MISSING_NAME',
        message: 'Category name is required'
      });
    }

    const categoryName = name.trim();

    // Check whether the classification already exists
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    );

    if (!existing.length) {
      return res.status(404).json({
        error: 'CATEGORY_NOT_FOUND',
        message: 'Category not found'
      });
    }

    // Check whether the name is already in use by another category
    const [nameCheck] = await pool.query(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [categoryName, categoryId]
    );

    if (nameCheck.length > 0) {
      return res.status(409).json({
        error: 'CATEGORY_EXISTS',
        message: 'Category with this name already exists'
      });
    }

    await pool.query(
      'UPDATE categories SET name = ? WHERE id = ?',
      [categoryName, categoryId]
    );

    const [updated] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error('PUT /categories/:id error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// DELETE /api/categories/:id - Delete classification
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        error: 'INVALID_ID',
        message: 'Category ID must be a positive integer'
      });
    }

    // Check whether the classification exists
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    );

    if (!existing.length) {
      return res.status(404).json({
        error: 'CATEGORY_NOT_FOUND',
        message: 'Category not found'
      });
    }

    // Check if there are any events using this category
    const [eventsUsingCategory] = await pool.query(
      'SELECT COUNT(*) as event_count FROM events WHERE category_id = ?',
      [categoryId]
    );

    if (eventsUsingCategory[0].event_count > 0) {
      return res.status(409).json({
        error: 'CATEGORY_IN_USE',
        message: `Cannot delete category because it is used by ${eventsUsingCategory[0].event_count} event(s)`
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [categoryId]);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      deletedId: categoryId
    });
  } catch (err) {
    console.error('DELETE /categories/:id error:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

module.exports = router;