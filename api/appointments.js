const { handleOptions, databaseError } = require('./_helpers');
const { query } = require('../lib/vercel-db');
const { normalizeAppointment, validAppointment } = require('../lib/booking');

module.exports = async (request, response) => {
  if (handleOptions(request, response)) return;
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST, OPTIONS');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const payload = normalizeAppointment(request.body);
  if (!validAppointment(payload)) {
    return response.status(400).json({ error: 'Verifică datele introduse și încearcă din nou.' });
  }

  try {
    const { rows } = await query(
      `INSERT INTO appointments
        (appointment_date, appointment_time, service, first_name, last_name, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, appointment_date, to_char(appointment_time, 'HH24:MI') AS appointment_time, service`,
      [payload.date, payload.time, payload.service, payload.firstName, payload.lastName, payload.phone, payload.email]
    );
    return response.status(201).json({ appointment: rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return response.status(409).json({ error: 'Acest interval tocmai a fost rezervat. Alege o altă oră.' });
    }
    return databaseError(response, error);
  }
};
