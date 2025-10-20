const express = require('express');
const cors = require('cors');

const { pool } = require('./db');
const eventsRouter = require('./routes/events');
const categoriesRouter = require('./routes/categories');
const registrationsRouter = require('./routes/registrations');

const app = express();
// Passenger 会提供 PORT；本地默认 3000
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
);

// 建议生产移除任何调试端点
// app.get('/api/__debug_db', ...)

app.use('/api/events', eventsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/registrations', registrationsRouter);

app.listen(PORT, () => {
  console.log(`✅ API listening on port ${PORT}`);
});