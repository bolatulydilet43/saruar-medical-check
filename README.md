# Saruar Medical Check

Санаторно-курортный медицинский центр — учёт осмотров, анализов и назначений для пациентов, врачей и медсестёр.

## Структура проекта

```
SanaCheck health management/   (имя папки проекта не переименовано, чтобы не сломать пути)
├── frontend/                 React + Vite приложение
│   ├── src/
│   │   ├── pages/            8 экранов: Login, Dashboard, Patients, PatientProfile,
│   │   │                     AnalysisEntry, DoctorReview, Appointments, Reports, Settings
│   │   ├── components/       Sidebar, Layout, StatusBadge, AnalysisCard, ProtectedRoute
│   │   ├── context/          AuthContext (роль/сессия)
│   │   ├── utils/            логика отображения результатов анализов
│   │   ├── api.js            клиент REST API (fetch-обёртка)
│   │   ├── theme.js          цвета, статусы, форматирование дат
│   │   └── App.jsx           маршрутизация (react-router-dom)
│   ├── index.html
│   └── package.json
│
├── backend/                  Express API (in-memory данные)
│   ├── src/
│   │   ├── routes/           auth, staff, patients, appointments, ranges
│   │   ├── models/           Patient, Staff, Analysis, Diagnosis, Appointment
│   │   ├── data/              seed.js (тестовые данные), store.js (in-memory хранилище), ranges.js
│   │   └── server.js
│   └── package.json
│
├── SanaCheck.dc.html         Исходный интерактивный дизайн-макет (справочно)
├── sana-data.js              Данные макета (справочно)
└── support.js                Рантайм макета (справочно)
```

## Роли

- **Admin** — управление персоналом (добавление врачей/медсестёр), пациентами (добавление/удаление), общая статистика
- **Doctor** — просмотр анализов, диагноз и назначения, добавление/удаление пациентов
- **Nurse** — внесение результатов анализов

Добавление/удаление пациентов доступно ролям Admin и Doctor; добавление врачей и медсестёр — только Admin (проверяется на backend через заголовок `x-user-role`, см. `backend/src/middleware/requireRole.js`).

## Запуск

Нужен установленный [Node.js](https://nodejs.org/) (18+). Проверить: `node --version`.

### 1. Backend (API на порту 4000)

```
cd backend
npm install
npm run dev
```

### 2. Frontend (на порту 5173, проксирует /api → backend)

```
cd frontend
npm install
npm run dev
```

Открыть http://localhost:5173. Вход — по номеру телефона и паролю (пароль обязательно на латинице). Для сотрудника, у которого в `seed.js` не заданы `phone`/`passwordHash` (демо-режим), подходит любой корректно оформленный номер и пароль — **демо-режим работает только на in-memory хранилище и отключается автоматически, как только подключён Supabase**. Для сотрудников с заданными учётными данными (например, администратор) нужен точный номер и пароль — их можно завести через экран «Настройки → + Добавить врача/медсестру» (только под ролью Admin).

## Аутентификация

- Пароли хранятся только как bcrypt-хэши (`passwordHash`), plaintext нигде не сохраняется — см. `backend/src/utils/passwords.js`.
- При входе backend выдаёт подписанный JWT (`backend/src/utils/jwt.js`), фронтенд отправляет его в заголовке `Authorization: Bearer <token>` (см. `frontend/src/api.js`). Токен живёт 12 часов и сохраняется в `localStorage`, поэтому обновление страницы не разлогинивает пользователя.
- Все эндпоинты с данными пациентов/персонала защищены `requireAuth`/`requireRole` (`backend/src/middleware/auth.js`) — прежний заголовок `x-user-role`, которому backend просто доверял, полностью убран.
- **Обязательно задайте `JWT_SECRET`** в проде (см. `backend/.env.example`) — без него сервер стартует со вставным dev-секретом и пишет предупреждение в лог.

## Данные

По умолчанию backend хранит данные в памяти (сбрасываются при перезапуске) и засеяны из `backend/src/data/seed.js`. Чтобы данные сохранялись между перезапусками/деплоями, подключите Supabase (см. ниже) — роуты и модели при этом не меняются, переключение происходит автоматически в `backend/src/data/store.js` по наличию переменных окружения.

## Деплой (Netlify + Supabase — всё бесплатно, живой пример развёрнут)

Backend работает как serverless-функция Netlify (`backend/netlify/functions/api.js`, Express через
`serverless-http`), поэтому отдельный хостинг вроде Render/Railway не нужен — фронтенд и API живут
на одном Netlify-сайте.

**Текущий боевой деплой:** https://saruar-medical-check.netlify.app (команда `temir3099's team`,
Supabase-проект `saruar-medical-check-2`, регион Singapore).

### 1. Supabase (база данных)

1. Создать проект на [supabase.com](https://supabase.com) (бесплатный тариф).
2. В SQL Editor выполнить `backend/supabase/schema.sql` — создаст таблицы `staff`, `patients`, `appointments_week`.
3. В `Project Settings → API Keys` скопировать `Project URL` и `secret`/`service_role` ключ (не `publishable`/`anon`!).
4. Перенести демо-данные: `cd backend && SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/seed-supabase.js`.

Без `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` backend продолжает работать в демо-режиме (in-memory).

> Если у свежесозданного проекта Project URL не резолвится (DNS) — подождите пару минут или
> проверьте [status.supabase.com](https://status.supabase.com): у Supabase бывают временные сбои
> провижининга по регионам. Практика показала: создание нового проекта в другом регионе (например,
> Singapore вместо Tokyo) обычно быстрее, чем ждать восстановления конкретного застрявшего проекта.

### 2. Netlify (фронтенд + API-функция)

1. `netlify login`, затем `netlify init`/`netlify link` в корне репозитория — привязать к сайту в нужной команде.
2. Настройки сборки уже заданы в `netlify.toml`: собирает `backend` и `frontend`, публикует `frontend/dist`,
   функции — из `backend/netlify/functions`.
3. Задать переменные окружения сайта (`netlify env:set NAME value` или через UI → Site settings → Environment variables):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — из шага 1.
   - `JWT_SECRET` — сгенерировать: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
4. Деплой: `netlify deploy --prod`.
5. `VITE_API_URL` задавать не нужно — фронтенд и API на одном домене, дефолтный `/api` уже работает
   (см. `frontend/src/api.js`).

### 3. Backup-политика Supabase

- **Free-тариф** Supabase не даёт автоматических бэкапов/point-in-time recovery — только то, что вы сделаете сами. Для реального клиента этого мало.
- **Pro-тариф** ($25/мес) добавляет ежедневные автобэкапы за последние 7 дней; PITR (восстановление на любую секунду) — отдельная платная опция сверху.
- Пока на free-тарифе, простой вариант — регулярный ручной/по расписанию `pg_dump`:
  ```
  pg_dump "postgresql://postgres:<пароль>@<host>:5432/postgres" > backup-$(date +%F).sql
  ```
  (connection string — в Project Settings → Database). Хранить дампы отдельно от Supabase (например, в приватном облачном хранилище).
- Перед продажей клиенту как боевого продукта — либо переход на Pro-тариф Supabase, либо настроенный cron с `pg_dump` и алертами при сбое бэкапа.
