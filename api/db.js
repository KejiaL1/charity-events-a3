const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',           // 本地默认
  password: process.env.DB_PASS || 'root',       // 本地默认
  database: process.env.DB_NAME || 'charityevents_db',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = { pool };
