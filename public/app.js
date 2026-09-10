const slots = ['09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '17:00', '18:00'];
const canonicalServices = ['Tuns clasic', 'Doar barbă', 'Tuns + Barbă'];
const state = { selectedDate: null, selectedTime: null, visibleMonth: new Date(), booked: [], language: 'ro' };

// Live Server normally uses port 5500; bookings still go to the Node server.
const localPreview = location.protocol === 'file:' ||
  (['localhost', '127.0.0.1'].includes(location.hostname) && location.port !== '3000');
const apiBase = document.body.dataset.apiUrl || (localPreview ? 'http://localhost:3000' : '');
const api = (path) => `${apiBase}${path}`;

const texts = {
  ro: {
    'brand.name':'Martea', 'nav.home':'Acasă', 'nav.about':'Despre mine', 'nav.prices':'Prețuri', 'nav.booking':'Programări', 'nav.contact':'Contacte',
    'hero.eyebrow':'BARBER SHOP · CHIȘINĂU', 'hero.title':'Tunsori cu atitudine. Stilul tău, semnătura mea.', 'hero.text':'Sunt Martea, barber pasionat de ceea ce fac. Îți ofer o experiență completă, cu atenție la detalii, precizie și un stil care te reprezintă.', 'hero.cta':'Programează-te',
    'reviews.eyebrow':'CLIENȚII NOȘTRI', 'reviews.title':'Recenzii', 'reviews.first':'„Cel mai bun barber! Martea știe exact ce ți se potrivește. Tunsori impecabile și atmosferă relaxantă.”', 'reviews.second':'„Profesionalism, atenție la detalii și mereu o energie bună. Recomand cu încredere!”', 'reviews.third':'„Am fost pentru prima dată și sigur voi reveni. Tunsorile sunt moderne, iar Martea este un adevărat profesionist!”',
    'services.eyebrow':'ALEGE SERVICIUL', 'services.title':'Servicii', 'service.classic.title':'Tuns clasic', 'service.classic.text':'Tuns modern, adaptat stilului tău.', 'service.beard.title':'Doar barbă', 'service.beard.text':'Îngrijire și contur perfect pentru o barbă în look perfect.', 'service.combo.title':'Tuns + Barbă', 'service.combo.text':'Completează-ți stilul cu o tunsoare și o barbă perfectă.',
    'booking.eyebrow':'REZERVĂ ONLINE', 'booking.title':'Contacte / Programări', 'contact.address':'Adresa', 'contact.phone':'Telefon', 'calendar.title':'Alege data și ora', 'calendar.time':'Ora disponibilă',
    'day.mon':'Lu', 'day.tue':'Ma', 'day.wed':'Mi', 'day.thu':'Jo', 'day.fri':'Vi', 'day.sat':'Sâ', 'day.sun':'Du',
    'form.title':'Completează datele tale', 'form.service':'Serviciu', 'form.chooseService':'Alege serviciul', 'form.firstName':'Nume', 'form.lastName':'Prenume', 'form.phone':'Telefon', 'form.submit':'Programează-te', 'form.note':'După trimitere, vei primi o confirmare pe email sau telefon.',
    'footer':'Tunsori cu atitudine. Stilul tău, semnătura mea.', 'availability.checking':'Se verifică disponibilitatea…', 'availability.booked':'Intervalele tăiate sunt deja rezervate.', 'availability.open':'Toate intervalele sunt disponibile.', 'availability.offline':'Serverul de programări nu răspunde. Pornește start.bat și deschide http://localhost:3000.', 'form.pickSlot':'Alege mai întâi data și ora dorită.', 'form.sending':'Se trimite programarea…', 'form.success':'Gata! Programarea pentru {date}, la {time}, a fost înregistrată.', 'form.offline':'Serverul de programări nu răspunde. Deschide site-ul prin start.bat, la http://localhost:3000.'
  },
  ru: {
    'brand.name':'Martea', 'nav.home':'Главная', 'nav.about':'Обо мне', 'nav.prices':'Цены', 'nav.booking':'Запись', 'nav.contact':'Контакты',
    'hero.eyebrow':'БАРБЕР-ШОП · КИШИНЁВ', 'hero.title':'Стрижки с характером. Твой стиль — моя подпись.', 'hero.text':'Я Martea, барбер, увлечённая своим делом. Предлагаю полный сервис, внимание к деталям, точность и стиль, который подходит именно тебе.', 'hero.cta':'Записаться',
    'reviews.eyebrow':'НАШИ КЛИЕНТЫ', 'reviews.title':'Отзывы', 'reviews.first':'«Лучший барбер! Martea точно знает, что тебе подходит. Безупречные стрижки и расслабленная атмосфера.»', 'reviews.second':'«Профессионализм, внимание к деталям и всегда отличная энергия. Смело рекомендую!»', 'reviews.third':'«Пришёл впервые и точно вернусь. Современные стрижки, а Martea — настоящий профессионал!»',
    'services.eyebrow':'ВЫБЕРИТЕ УСЛУГУ', 'services.title':'Услуги', 'service.classic.title':'Классическая стрижка', 'service.classic.text':'Современная стрижка, подобранная под ваш стиль.', 'service.beard.title':'Только борода', 'service.beard.text':'Уход и идеальный контур для безупречной бороды.', 'service.combo.title':'Стрижка + борода', 'service.combo.text':'Дополните свой стиль идеальной стрижкой и бородой.',
    'booking.eyebrow':'ОНЛАЙН-ЗАПИСЬ', 'booking.title':'Контакты / Запись', 'contact.address':'Адрес', 'contact.phone':'Телефон', 'calendar.title':'Выберите дату и время', 'calendar.time':'Доступное время',
    'day.mon':'Пн', 'day.tue':'Вт', 'day.wed':'Ср', 'day.thu':'Чт', 'day.fri':'Пт', 'day.sat':'Сб', 'day.sun':'Вс',
    'form.title':'Заполните данные', 'form.service':'Услуга', 'form.chooseService':'Выберите услугу', 'form.firstName':'Имя', 'form.lastName':'Фамилия', 'form.phone':'Телефон', 'form.submit':'Записаться', 'form.note':'После отправки вы получите подтверждение по email или телефону.',
    'footer':'Стрижки с характером. Твой стиль — моя подпись.', 'availability.checking':'Проверяем доступность…', 'availability.booked':'Зачёркнутые интервалы уже заняты.', 'availability.open':'Все интервалы доступны.', 'availability.offline':'Сервер записи не отвечает. Запустите start.bat и откройте http://localhost:3000.', 'form.pickSlot':'Сначала выберите дату и время.', 'form.sending':'Запись отправляется…', 'form.success':'Готово! Запись на {date}, {time} сохранена.', 'form.offline':'Сервер записи не отвечает. Запустите start.bat и откройте http://localhost:3000.'
  }
};

const t = (key) => texts[state.language][key] || texts.ro[key] || key;
const pad = (number) => String(number).padStart(2, '0');
const isoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const today = () => { const date = new Date(); date.setHours(0, 0, 0, 0); return date; };
const isBookable = (date) => date >= today() && date.getDay() !== 0;
const friendlyError = (error) => error instanceof TypeError || /failed to fetch/i.test(error.message) ? t('form.offline') : error.message;

function renderCalendar() {
  const calendar = document.querySelector('#calendar-days');
  const label = document.querySelector('#month-label');
  const visible = new Date(state.visibleMonth.getFullYear(), state.visibleMonth.getMonth(), 1);
  label.textContent = new Intl.DateTimeFormat(state.language === 'ru' ? 'ru-RU' : 'ro-RO', { month:'long', year:'numeric' }).format(visible);
  const firstDay = (visible.getDay() + 6) % 7;
  const days = new Date(visible.getFullYear(), visible.getMonth() + 1, 0).getDate();
  calendar.innerHTML = '';
  for (let i = 0; i < firstDay; i += 1) calendar.insertAdjacentHTML('beforeend', '<span class="blank"></span>');
  for (let day = 1; day <= days; day += 1) {
    const value = new Date(visible.getFullYear(), visible.getMonth(), day);
    const date = isoDate(value);
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = day; button.dataset.date = date;
    button.disabled = !isBookable(value);
    if (date === state.selectedDate) button.classList.add('selected');
    calendar.appendChild(button);
  }
}

async function loadAvailability() {
  const message = document.querySelector('#availability-message');
  state.selectedTime = null;
  document.querySelector('#selected-time').value = '';
  message.textContent = t('availability.checking');
  try {
    const response = await fetch(api(`/api/availability?date=${encodeURIComponent(state.selectedDate)}`));
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t('availability.offline'));
    state.booked = data.booked;
    message.textContent = data.booked.length ? t('availability.booked') : t('availability.open');
  } catch (_error) {
    state.booked = [];
    message.textContent = t('availability.offline');
  }
  renderSlots();
}

function renderSlots() {
  const target = document.querySelector('#time-slots');
  target.innerHTML = '';
  slots.forEach((slot) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = slot;
    button.disabled = state.booked.includes(slot);
    if (slot === state.selectedTime) button.classList.add('selected');
    button.addEventListener('click', () => { state.selectedTime = slot; document.querySelector('#selected-time').value = slot; renderSlots(); });
    target.appendChild(button);
  });
}

function selectDate(date) {
  state.selectedDate = date;
  document.querySelector('#selected-date').value = date;
  renderCalendar();
  loadAvailability();
}

function setLanguage(language) {
  state.language = language;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-language]').forEach((node) => node.classList.toggle('selected', node.dataset.language === language));
  renderCalendar();
  renderSlots();
  if (state.selectedDate) loadAvailability();
}

document.querySelector('#calendar-days').addEventListener('click', (event) => { if (event.target.matches('button[data-date]')) selectDate(event.target.dataset.date); });
document.querySelector('#previous-month').addEventListener('click', () => { state.visibleMonth.setMonth(state.visibleMonth.getMonth() - 1); renderCalendar(); });
document.querySelector('#next-month').addEventListener('click', () => { state.visibleMonth.setMonth(state.visibleMonth.getMonth() + 1); renderCalendar(); });
document.querySelectorAll('.price-button').forEach((button) => button.addEventListener('click', () => { document.querySelector('#service').value = button.dataset.service; document.querySelector('#programari').scrollIntoView({ behavior:'smooth' }); }));

document.querySelector('#booking-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.querySelector('#form-status');
  const submit = event.currentTarget.querySelector('button[type="submit"]');
  if (!state.selectedDate || !state.selectedTime) { status.textContent = t('form.pickSlot'); status.className = 'form-status error'; return; }
  const payload = { date: state.selectedDate, time: state.selectedTime, service: document.querySelector('#service').value, firstName: document.querySelector('#first-name').value, lastName: document.querySelector('#last-name').value, phone: document.querySelector('#phone').value, email: document.querySelector('#email').value };
  if (!canonicalServices.includes(payload.service)) { status.textContent = t('form.pickSlot'); status.className = 'form-status error'; return; }
  submit.disabled = true; status.textContent = t('form.sending'); status.className = 'form-status';
  try {
    const response = await fetch(api('/api/appointments'), { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t('form.offline'));
    status.textContent = t('form.success').replace('{date}', state.selectedDate).replace('{time}', state.selectedTime);
    event.currentTarget.reset(); state.booked.push(state.selectedTime); state.selectedTime = null; renderSlots();
  } catch (error) { status.textContent = friendlyError(error); status.className = 'form-status error'; if (error.message.includes('rezervat')) loadAvailability(); }
  finally { submit.disabled = false; }
});

document.querySelector('.menu-toggle').addEventListener('click', (event) => { const menu = document.querySelector('.main-nav'); menu.classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded', menu.classList.contains('open')); });
document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => document.querySelector('.main-nav').classList.remove('open')));
document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));

const initial = today();
if (initial.getDay() === 0) initial.setDate(initial.getDate() + 1);
state.visibleMonth = new Date(initial.getFullYear(), initial.getMonth(), 1);
renderCalendar();
selectDate(isoDate(initial));
