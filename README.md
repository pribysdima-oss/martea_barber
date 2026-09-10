# Martea Barber

Одностраничный адаптивный лендинг барбера с онлайн-записью. Интерфейс написан на чистых HTML, CSS и JavaScript; сервер — Node.js + Express.

## Запуск

Нужен Node.js 22.5 или новее (в нём есть встроенная SQLite). Для этой папки уже добавлена портативная Node.js LTS в `tools/node`, поэтому `start.bat` не требует отдельной системной установки.

В Windows достаточно дважды открыть [`start.bat`](start.bat). Он запускает сервер и открывает сайт по адресу [http://localhost:3000](http://localhost:3000).

Или из терминала:

```bash
pnpm install
pnpm start
```

Откройте [http://localhost:3000](http://localhost:3000). Без дополнительной настройки записи хранятся в локальном файле `database/martia.sqlite`; он исключён из Git, чтобы персональные данные клиентов не попали в репозиторий.

Не открывайте `public/index.html` двойным кликом и не запускайте бронирование только через Live Server: это отображает страницу, но не запускает сервер и базу данных. Если Live Server всё же используется для вёрстки, сначала запустите `start.bat` — фронтенд автоматически подключится к API на порту 3000.

## PostgreSQL для production

1. Создайте базу PostgreSQL.
2. Выполните [`database/schema.sql`](database/schema.sql) в этой базе.
3. Скопируйте `.env.example` в `.env` и добавьте строку `DATABASE_URL=postgres://...`.
4. Перезапустите сервер.

При заданном `DATABASE_URL` приложение автоматически использует PostgreSQL вместо SQLite.

## API

- `GET /api/health` — состояние приложения и базы.
- `GET /api/services` — список услуг.
- `GET /api/availability?date=YYYY-MM-DD` — занятые и доступные интервалы.
- `POST /api/appointments` — создать запись. Сервер проверяет данные и на уровне базы запрещает двойное бронирование одного слота.

Пример тела запроса:

```json
{
  "date": "2026-09-14",
  "time": "10:00",
  "service": "Tuns clasic",
  "firstName": "Ion",
  "lastName": "Popescu",
  "phone": "+373 69 123 456",
  "email": "ion@example.com"
}
```
