const { requireAdmin } = require('../../lib/admin-auth');
const { query } = require('../../lib/vercel-db');

module.exports = async (request, response) => {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  if (!requireAdmin(request, response)) return;

  try {
    const { rows } = await query(`
      SELECT id, appointment_date,
        to_char(appointment_time, 'HH24:MI') AS appointment_time,
        service, first_name, last_name, phone, email, status, created_at
      FROM appointments
      WHERE status = 'confirmed'
      ORDER BY appointment_date ASC, appointment_time ASC
    `);
    return response.status(200).json({ appointments: rows });
  } catch (error) {
    console.error('Admin appointments error:', error.message);
    return response.status(503).json({ error: 'Nu am putut încărca programările.' });
  }
};
