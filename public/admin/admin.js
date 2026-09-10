const loginCard = document.querySelector('#login-card');
const dashboard = document.querySelector('#dashboard');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
let authorization = '';

function safeText(value) {
  return value == null ? '' : String(value);
}

function row(appointment) {
  const cells = [
    appointment.appointment_date,
    appointment.appointment_time,
    `${appointment.first_name} ${appointment.last_name}`,
    appointment.service,
    appointment.phone,
    appointment.email
  ];
  const element = document.createElement('tr');
  cells.forEach((value) => {
    const cell = document.createElement('td');
    cell.textContent = safeText(value);
    element.appendChild(cell);
  });
  return element;
}

async function loadAppointments() {
  const status = document.querySelector('#dashboard-status');
  status.textContent = 'Se încarcă…';
  const response = await fetch('/api/admin/appointments', { headers: { Authorization: authorization }, cache: 'no-store' });
  if (response.status === 401) throw new Error('Parola nu este corectă.');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Nu am putut încărca programările.');

  const body = document.querySelector('#appointments');
  body.replaceChildren();
  data.appointments.forEach((appointment) => body.appendChild(row(appointment)));
  document.querySelector('#summary').textContent = data.appointments.length
    ? `Ai ${data.appointments.length} programări confirmate.`
    : 'Încă nu există programări confirmate.';
  status.textContent = '';
}

document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.querySelector('#login-status');
  authorization = `Basic ${btoa(`${username.value}:${password.value}`)}`;
  status.textContent = 'Se verifică parola…';
  try {
    await loadAppointments();
    loginCard.hidden = true;
    dashboard.hidden = false;
    password.value = '';
  } catch (error) {
    authorization = '';
    status.textContent = error.message;
  }
});

document.querySelector('#logout').addEventListener('click', () => {
  authorization = '';
  dashboard.hidden = true;
  loginCard.hidden = false;
  password.focus();
});
