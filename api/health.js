const { handleOptions, methodNotAllowed, databaseError } = require('./_helpers');
const { ensureSchema } = require('../lib/vercel-db');

module.exports = async (request, response) => {
  if (handleOptions(request, response)) return;
  if (request.method !== 'GET') return methodNotAllowed(response);
  try {
    await ensureSchema();
    return response.status(200).json({ ok: true, database: 'postgres' });
  } catch (error) {
    return databaseError(response, error);
  }
};
