const crypto = require('crypto');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function passwordMatches(password) {
  if (!ADMIN_PASSWORD || password.length !== ADMIN_PASSWORD.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASSWORD));
}

function requireAdmin(request, response) {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    response.status(503).json({ error: 'Administratorul nu este configurat încă.' });
    return false;
  }
  const header = request.headers.authorization || '';
  const encoded = header.startsWith('Basic ') ? header.slice(6) : '';
  const [username, password] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
  if (username === ADMIN_USERNAME && password && passwordMatches(password)) return true;

  response.setHeader('WWW-Authenticate', 'Basic realm="Martea Admin", charset="UTF-8"');
  response.status(401).json({ error: 'Autorizare necesară.' });
  return false;
}

module.exports = { requireAdmin, ADMIN_USERNAME };
