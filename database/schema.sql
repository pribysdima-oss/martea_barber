-- This is created automatically by the Vercel API on the first request.
-- Run it manually only if you prefer to initialize PostgreSQL yourself.
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
  ON appointments (appointment_date)
  WHERE status = 'confirmed';

CREATE UNIQUE INDEX IF NOT EXISTS one_active_appointment_per_slot
  ON appointments (appointment_date, appointment_time)
  WHERE status = 'confirmed';
