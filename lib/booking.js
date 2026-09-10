const slots = ['09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '17:00', '18:00'];
const services = [
  { id: 'tuns-clasic', name: 'Tuns clasic', price: 200 },
  { id: 'doar-barba', name: 'Doar barbă', price: 150 },
  { id: 'tuns-barba', name: 'Tuns + Barbă', price: 400 }
];

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

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

function normalizeAppointment(body = {}) {
  return {
    date: clean(body.date, 10),
    time: clean(body.time, 5),
    service: clean(body.service, 80),
    firstName: clean(body.firstName, 80),
    lastName: clean(body.lastName, 80),
    phone: clean(body.phone, 40),
    email: clean(body.email, 254).toLowerCase()
  };
}

function validAppointment(payload) {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
  return futureBusinessDay(payload.date) && slots.includes(payload.time) &&
    services.some((service) => service.name === payload.service) &&
    payload.firstName.length >= 2 && payload.lastName.length >= 2 &&
    payload.phone.length >= 7 && emailOk;
}

module.exports = { slots, services, clean, validDate, normalizeAppointment, validAppointment };
