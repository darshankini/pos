const { Pool, types } = require('pg');
require('dotenv').config();

// --- Type parsers: make Postgres return JS numbers like mysql2 did ---
// NUMERIC/DECIMAL (oid 1700) -> float, so price/total are numbers not strings.
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
// BIGINT (oid 20, e.g. COUNT(*)) -> number.
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10)));

// Single shared pool, reused across requests.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pos',
  max: 10,
});



// Convert mysql-style "?" placeholders to Postgres "$1, $2, ...".
function toPgPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// mysql2-compatible query: returns [rows] so `const [rows] = await query(...)` works.
async function query(sql, params = []) {
  const res = await pool.query(toPgPlaceholders(sql), params);
  return [res.rows];
}

module.exports = {
  query,
  pool,               // raw pg pool (used for transactions in orders route)
  end: () => pool.end(),
};
