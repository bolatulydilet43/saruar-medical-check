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

- **Admin** — управление персоналом, пациентами (добавление/удаление), общая статистика
- **Doctor** — просмотр анализов, диагноз и назначения, добавление/удаление пациентов
- **Nurse** — внесение результатов анализов

Добавление и удаление пациентов доступно только ролям Admin и Doctor (проверяется на backend через заголовок `x-user-role`, см. `backend/src/middleware/requireRole.js`).

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

Открыть http://localhost:5173 — демо-режим, для входа подходят любые email/пароль, роль выбирается на экране логина.

## Данные

Backend хранит данные в памяти (сбрасываются при перезапуске) и засеяны из `backend/src/data/seed.js` — тот же набор пациентов/персонала/записей, что и в исходном дизайн-макете. Чтобы подключить настоящую БД, замените реализацию `backend/src/data/store.js`, не меняя роуты.
