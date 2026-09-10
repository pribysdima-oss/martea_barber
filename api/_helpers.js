function setCors(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handleOptions(request, response) {
  setCors(response);
  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return true;
  }
  return false;
}

function methodNotAllowed(response) {
  response.setHeader('Allow', 'GET, OPTIONS');
  return response.status(405).json({ error: 'Method not allowed.' });
}

function databaseError(response, error) {
  console.error('Database error:', error.message);
  const message = error.message.includes('DATABASE_URL')
    ? 'Baza de date nu este încă conectată la proiectul Vercel.'
    : 'Serviciul de programări nu este disponibil momentan.';
  return response.status(503).json({ error: message });
}

module.exports = { handleOptions, methodNotAllowed, databaseError };
