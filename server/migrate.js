// Creates the `post` database (if missing) then runs schema.sql against it.
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const base = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};
const dbName = process.env.DB_NAME || 'post';

(async () => {
  try {
    // 1) Create the database if it doesn't exist (connect to the default `postgres` db).
    const admin = new Client({ ...base, database: 'postgres' });
    await admin.connect();
    const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (!rowCount) {
      await admin.query(`CREATE DATABASE ${dbName}`); // identifier, not user input
      console.log(`✔ Created database "${dbName}".`);
    } else {
      console.log(`• Database "${dbName}" already exists.`);
    }
    await admin.end();

    // 2) Run the table DDL on the target database.
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const c = new Client({ ...base, database: dbName });
    await c.connect();
    await c.query(sql); // pg simple-query protocol allows multiple statements
    await c.end();
    console.log('✔ Tables created.');
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exitCode = 1;
  }
})();
