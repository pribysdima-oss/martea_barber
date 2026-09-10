const { handleOptions, methodNotAllowed, databaseError } = require('./_helpers');
const { query } = require('../lib/vercel-db');
const { slots, clean, validDate } = require('../lib/booking');

module.exports = async (request, response) => {
  if (handleOptions(request, response)) return;
  if (request.method !== 'GET') return methodNotAllowed(response);
  const date = clean(request.query.date, 10);
  if (!validDate(date)) return response.status(400).json({ error: 'Data nu este validă.' });

  try {
    const { rows } = await query(
      `SELECT to_char(appointment_time, 'HH24:MI') AS time
       FROM appointments WHERE appointment_date = $1 AND status = 'confirmed'`,
      [date]
    );
    const booked = rows.map((row) => row.time);
    return response.status(200).json({ date, slots, booked, available: slots.filter((slot) => !booked.includes(slot)) });
  } catch (error) {
    return databaseError(response, error);
  }
};
