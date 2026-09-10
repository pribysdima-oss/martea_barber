require('dotenv').config();

const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const { getDb } = require('./db');

const app = express();
const port = Number(process.env.PORT) || 3000;
const slots = ['09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '17:00', '18:00'];
const services = [
  { id: 'tuns-clasic', name: 'Tuns clasic', price: 200 },
  { id: 'doar-barba', name: 'Doar barbă', price: 150 },
  { id: 'tuns-barba', name: 'Tuns + Barbă', price: 400 }
];

app.use(express.json({ limit: '32kb' }));
// Allows the page to be previewed through VS Code Live Server or directly from
// a file while its booking API continues to run locally on port 3000.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});
app.use(express.static(path.join(__dirname, 'public')));

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function futureBusinessDay(value) {
  if (!validDate(value)) return false;
  const day = new Date(`${value}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return day >= today && day.getDay() !== 0;
}

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

app.get('/api/health', async (_req, res) => {
  try {
    const db = getDb();
    await db.query('SELECT 1');
    res.json({ ok: true, database: db.type });
  } catch (_error) {
    res.status(503).json({ ok: false, database: 'unavailable' });
  }
});

app.get('/api/services', (_req, res) => res.json(services));

app.get('/api/availability', async (req, res) => {
  const date = clean(req.query.date, 10);
  if (!validDate(date)) return res.status(400).json({ error: 'Data nu este validă.' });

  try {
    const { rows } = await getDb().query(
      `SELECT appointment_time
       FROM appointments
       WHERE appointment_date = ? AND status = 'confirmed'`,
      [date]
    );
    const booked = rows.map((row) => String(row.appointment_time).slice(0, 5));
    res.json({ date, slots, booked, available: slots.filter((slot) => !booked.includes(slot)) });
  } catch (error) {
    console.error('Availability error:', error.message);
    res.status(503).json({ error: 'Calendarul nu este disponibil momentan.' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const payload = {
    date: clean(req.body.date, 10),
    time: clean(req.body.time, 5),
    service: clean(req.body.service, 80),
    firstName: clean(req.body.firstName, 80),
    lastName: clean(req.body.lastName, 80),
    phone: clean(req.body.phone, 40),
    email: clean(req.body.email, 254).toLowerCase()
  };

  const allowedServices = services.map((service) => service.name);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
  if (!futureBusinessDay(payload.date) || !slots.includes(payload.time) || !allowedServices.includes(payload.service) ||
      payload.firstName.length < 2 || payload.lastName.length < 2 || payload.phone.length < 7 || !emailOk) {
    return res.status(400).json({ error: 'Verifică datele introduse și încearcă din nou.' });
  }

  try {
    const { rows } = await getDb().query(
      `INSERT INTO appointments
        (appointment_date, appointment_time, service, first_name, last_name, phone, email)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING id, appointment_date, appointment_time, service`,
      [payload.date, payload.time, payload.service, payload.firstName, payload.lastName, payload.phone, payload.email]
    );
    rows[0].appointment_time = String(rows[0].appointment_time).slice(0, 5);
    res.status(201).json({ appointment: rows[0] });
  } catch (error) {
    if (error.code === '23505' || /unique constraint/i.test(error.message)) {
      return res.status(409).json({ error: 'Acest interval tocmai a fost rezervat. Alege o altă oră.' });
    }
    console.error('Booking error:', error.message);
    res.status(503).json({ error: 'Nu am putut salva programarea. Încearcă din nou.' });
  }
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(port, () => {
  const address = `http://localhost:${port}`;
  console.log(`Martea Barber is running at ${address}`);
  if (process.env.OPEN_BROWSER === '1' && process.platform === 'win32') {
    exec(`start "" "${address}"`);
  }
});
