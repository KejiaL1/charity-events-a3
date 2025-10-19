const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const eventsRouter = require('./routes/events.js');
const categoriesRouter = require('./routes/categories.js');
const registrationsRouter = require('./routes/registrations.js');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/__debug_db', async (req, res) => {
  const [dbName] = await db.query('SELECT DATABASE() AS db');
  const [cnt] = await db.query('SELECT COUNT(*) AS total FROM events');
  res.json({ database: dbName[0].db, events_total: cnt[0].total });
});

app.use('/api/events', eventsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/registrations', registrationsRouter);

app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});

module.exports = app;