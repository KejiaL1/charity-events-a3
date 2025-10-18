const express = require('express');
const cors = require('cors');
require('dotenv').config();

const categoriesRouter = require('./routes/categories');
const eventsRouter = require('./routes/events');
const registrationsRouter = require('./routes/registrations'); // New import

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/registrations', registrationsRouter); // New route

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'ENDPOINT_NOT_FOUND' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Charity Events API listening on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/categories');
  console.log('  GET  /api/events');
  console.log('  GET  /api/events/:id');
  console.log('  POST /api/events');
  console.log('  PUT  /api/events/:id');
  console.log('  DELETE /api/events/:id');
  console.log('  POST /api/registrations');
  console.log('  GET  /api/registrations/event/:eventId');
});