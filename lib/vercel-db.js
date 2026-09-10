const { Pool } = require('pg');

let pool;
let schemaReady;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Connect a Neon PostgreSQL database to this Vercel project.');
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });
  }
  return pool;
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id BIGSERIAL PRIMARY KEY,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        service VARCHAR(80) NOT NULL,
        first_name VARCHAR(80) NOT NULL,
        last_name VARCHAR(80) NOT NULL,
        phone VARCHAR(40) NOT NULL,
        email VARCHAR(254) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
          CHECK (status IN ('confirmed', 'cancelled')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS appointments_date_idx
        ON appointments (appointment_date) WHERE status = 'confirmed';
      CREATE UNIQUE INDEX IF NOT EXISTS one_active_appointment_per_slot
        ON appointments (appointment_date, appointment_time) WHERE status = 'confirmed';
    `).catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  return schemaReady;
}

async function query(sql, values = []) {
  await ensureSchema();
  return getPool().query(sql, values);
}

module.exports = { query, ensureSchema };
