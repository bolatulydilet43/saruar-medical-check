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
└── netlify.toml               Конфигурация сборки/деплоя Netlify
```

## Роли

- **Admin** — управление персоналом (добавление врачей/медсестёр), пациентами (добавление/удаление), общая статистика
- **Doctor** — просмотр анализов, диагноз и назначения, добавление/удаление пациентов
- **Nurse** — внесение результатов анализов

Добавление/удаление пациентов доступно ролям Admin и Doctor; добавление врачей и медсестёр — только Admin (проверяется на backend через JWT в `Authorization: Bearer <token>`, см. `requireAuth`/`requireRole` в `backend/src/middleware/auth.js`).

## Локализация

Переключатель RU/ҚАЗ (`frontend/src/components/LanguageSwitcher.jsx`) есть на экране логина и в сайдборе,
выбор сохраняется в `localStorage`. Переведён общий "каркас" — навигация, роли, статусы анализов,
форма логина, общие кнопки (`frontend/src/locales/ru.json` / `kk.json`, i18next).

**Важно:** казахский перевод — черновой (мой машинный/собственный перевод, не вычитан носителем языка) —
не выкладывайте как готовую казахскую версию для клиента без проверки, особенно медицинских терминов
("Требует внимания", "Небольшое отклонение" и т.п.). Контент конкретных страниц (Пациенты, Настройки,
Отчёты и т.д.) при переключении языка **остаётся на русском** — переведён только общий каркас, каждую
страницу нужно переводить по тому же паттерну (`useTranslation()` + ключ в обоих json) как отдельная задача.

## Запуск

Нужен установленный [Node.js](https://nodejs.org/) (18+). Проверить: `node --version`.

### 1. Backend (API на порту 4000)

```
cd backend
npm install
npm run dev
```

Тесты (встроенный `node --test`, без внешних зависимостей): `cd backend && npm test`. CI (`.github/workflows/ci.yml`) гоняет их на каждый push/PR в `main`, плюс собирает фронтенд.

### 2. Frontend (на порту 5173, проксирует /api → backend)

```
cd frontend
npm install
npm run dev
```

Открыть http://localhost:5173. Вход — по точному номеру телефона и паролю (пароль обязательно на латинице, не короче 8 символов); демо-режима нет — сотрудник без заданных `phone`/`passwordHash` в `seed.js` войти не может. Локальные dev-аккаунты (демо-персонал) и их тестовый пароль см. в `backend/src/data/seed.js`. Новых сотрудников с реальными учётными данными заводят через экран «Настройки → + Добавить врача/медсестру» (только под ролью Admin).

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

Без `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` backend работает на in-memory сторе (данные сбрасываются при перезапуске) — удобно для локальной разработки, но для реального клиента нужен Supabase.

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

## Развёртывание для нового клиента (санатория/клиники)

Сейчас каждый клиент — отдельная копия: свой Supabase-проект, свой Netlify-сайт, свой бренд. Это
осознанный выбор на стадии продаж вручную нескольким первым клиентам — мультитенантность (общая
инфраструктура на всех) имеет смысл только когда клиентов станет много, и станет тяжело руками
поддерживать N отдельных копий кода.

**Чек-лист под нового клиента:**

1. Форкнуть/склонировать репозиторий под клиента (или завести отдельную ветку — но отдельный репозиторий
   надёжнее, чтобы точно не перепутать, в чей прод пушишь).
2. Пройти [Supabase](#1-supabase-база-данных) — новый проект, применить `schema.sql`.
3. Отредактировать `backend/src/data/seed.js` — реальный персонал клиента (админ с настоящим
   телефоном/паролем, остальные по необходимости) вместо демо-данных Saruar. Засеять через
   `seed-supabase.js`.
4. Задать бренд клиента — либо через `.env`/переменные окружения Netlify (`VITE_BRAND_*`, см.
   `frontend/.env.example`), либо просто отредактировать дефолты в `frontend/src/brandConfig.js`.
   Заменить `frontend/public/logo.png` на логотип клиента (то же имя файла).
5. Пройти [Netlify](#2-netlify-фронтенд--api-функция) — новый сайт, свои переменные окружения
   (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET` — **свой**, не копировать между клиентами).
6. Проверить вход под новым админом, что бренд/логотип/адрес в шапке и в печатных отчётах — клиента,
   а не Saruar.
7. Договориться с клиентом о бэкап-политике (см. выше) — на free-тарифе Supabase это целиком на вас.

**Известное ограничение:** баг-фиксы и новые фичи после этого нужно переносить в каждую копию отдельно
(cherry-pick / merge из "эталонного" репозитория) — это нормально для нескольких клиентов, но не
масштабируется на десятки. Если дойдёт до этого — тогда обсуждать переход на мультитенантную архитектуру
(общая база с `organization_id`, один деплой на всех).
