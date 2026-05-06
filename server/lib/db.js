const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL is not set yet');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function closePool() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  closePool,
};
