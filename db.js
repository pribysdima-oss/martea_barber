const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { DatabaseSync } = require('node:sqlite');

let database;

function postgresSql(sql) {
  let number = 0;
  return sql.replace(/\?/g, () => `$${++number}`);
}

function getDb() {
  if (database) return database;

  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    database = { type: 'postgres', query: (sql, values = []) => pool.query(postgresSql(sql), values) };
    return database;
  }

  const directory = path.join(__dirname, 'database');
  fs.mkdirSync(directory, { recursive: true });
  const sqlite = new DatabaseSync(path.join(directory, 'martia.sqlite'));
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      service TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS one_active_appointment_per_slot
      ON appointments (appointment_date, appointment_time) WHERE status = 'confirmed';
  `);
  database = {
    type: 'sqlite',
    query(sql, values = []) {
      return { rows: sqlite.prepare(sql).all(...values) };
    }
  };
  return database;
}

module.exports = { getDb };
