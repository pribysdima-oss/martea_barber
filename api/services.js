const { handleOptions, methodNotAllowed } = require('./_helpers');
const { services } = require('../lib/booking');

module.exports = (request, response) => {
  if (handleOptions(request, response)) return;
  if (request.method !== 'GET') return methodNotAllowed(response);
  return response.status(200).json(services);
};
