const { Pool, types } = require('pg');
require('dotenv').config();

types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
// BIGINT (oid 20, e.g. COUNT(*)) -> number.
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10)));

const connectionString = [
  process.env.pos_DATABASE_URL,
  process.env.pos_POSTGRES_URL,
  process.env.pos_PRISMA_DATABASE_URL
].find((u) => u && /^postgres(ql)?:\/\//.test(u));

if (!connectionString) {
  throw new Error(
    'No Postgres connection string found. Set DATABASE_URL (or pos_POSTGRES_URL) ' +
    'to a postgres:// URL in your environment / Vercel project settings.'
  );
}

// Single shared pool, reused across requests.
const pool = new Pool({
  connectionString,
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
