# Арбітр Шашкової Ліги (Swiss Draw Manager)

Веб-застосунок для проведення шашкових турнірів з ролями доступу, базою гравців/клубів/тренерів і збереженням у PostgreSQL.

## 1. Що це за проєкт

Проєкт складається з:
- Frontend (односторінковий застосунок): `index.html`, `styles.css`, зібраний `app.js`.
- Source-модулі frontend: `src/app/*.js`.
- Backend API (Node + Express + PostgreSQL): `server/*`.

Підтримуються:
- кругова та швейцарська системи;
- мікроматчі (2 партії);
- критерії ранжування;
- ролі (super-admin/admin/viewer);
- архів завершених турнірів;
- редагування архівного турніру для адміністратора.

## 2. Швидкий старт

### 2.1 Локальна розробка

```bash
npm install
npm run build:app
DATABASE_URL=postgresql://... npm run start:api
```

Після цього:
- frontend: відкриваєш `index.html` (або URL з Render);
- API: працює на порту `10000` (якщо `PORT` не задано).

### 2.2 Збірка frontend

`app.js` не редагуємо вручну.

```bash
npm run build:app
```

## 3. Архітектура frontend (оптимізована структура)

Frontend розбитий на логічні зони:

1. Константи та глобальний стан
- `src/app/00-constants.js`
- `src/app/01-globals.js`

2. Події та зміни стану
- `src/app/02-events.js`
- `src/app/05-actions.js`

3. Нормалізація/підготовка даних
- `src/app/03-state-normalization.js`
- `src/app/07-standings.js`
- `src/app/08-lifecycle-utils.js`

4. Рендер
- Базові рендер-утиліти та спільні блоки: `src/app/04-render.js`
- Entry-point по вкладках (feature-рівень):
  - `src/app/features/10-render-active-tab.js`
  - `src/app/features/11-render-tournament-tab.js`
  - `src/app/features/12-render-players-tab.js`
  - `src/app/features/13-render-clubs-tab.js`
  - `src/app/features/14-render-archive-tab.js`

5. Ініціалізація
- `src/app/09-init.js`

### Важливо
- Дублювання entry-point рендера прибрано: `renderActiveTabPanel` тепер живе в `features/10-render-active-tab.js`.
- У `src/app/04-render.js` додано секції-коментарі:
  - CORE SHELL RENDER
  - TOURNAMENT SETTINGS DRAFT
  - TOURNAMENT PARTICIPANTS & ROUNDS UI
  - STANDINGS & TIEBREAK TABLE
  - CLUBS / COACHES / CLUB PROFILE
  - PLAYER PROFILE DATA HELPERS
  - TOURNAMENTS (ARCHIVE + ONGOING) PREVIEW HELPERS

Це робить навігацію по коду швидшою і безпечнішою.

## 4. Backend API

Основні файли:
- `server/index.js`
- `server/lib/db.js`
- `server/lib/schema.js`
- `server/lib/auth.js`
- `server/middleware/auth.js`
- `server/routes/*.js`

Базові env:
- `DATABASE_URL` (обов'язково)
- `NODE_ENV=production`
- `CORS_ORIGIN` (якщо фронтенд на іншому домені)
- `ADMIN_EMAIL` (опц.)
- `ADMIN_PASSWORD` (опц.)

## 5. Render deploy (основний сценарій)

У Web Service:
- Build Command: `npm install`
- Start Command: `npm run start:api`
- Root Directory: порожньо

Environment Variables (мінімум):
- `DATABASE_URL=postgresql://...`
- `NODE_ENV=production`
- `CORS_ORIGIN=https://...` (за потреби)

Після змін у `src/app/*`:
1. `npm run build:app`
2. commit + push
3. Render: `Manual Deploy -> Deploy latest commit`

## 6. Як працювати без хаосу (рекомендований flow)

1. Обираєш фічу.
2. Через `docs/CODEMAP.md` дивишся тільки потрібні файли.
3. Міняєш код у `src/app/*` або `server/*`.
4. Збираєш `app.js`.
5. Локальна перевірка.
6. Деплой.

Команда підбору файлів:

```bash
npm run scope -- --list
npm run scope -- tournament
npm run scope -- clubs
```

## 7. Типові проблеми і рішення

### 7.1 Зміни не видно у браузері
- Перевір, що був `npm run build:app` перед пушем.
- Перевір, що deploy завершений (`Live` у Render).
- Зроби hard refresh (`Cmd+Shift+R`).

### 7.2 Данні різні на різних пристроях
- Перевір `DATABASE_URL` у поточному сервісі.
- Перевір `GET /api/health`.
- Переконайся, що працюєш в одному конкретному URL сервісу.

### 7.3 Немає прав редагування
- Увійти під адміністратором у правому верхньому auth-блоці.
- У viewer-режимі редагування/видалення приховані або неактивні.

## 8. Документація для розробки

- Код-мапа: `/Users/admin/Documents/New project 3/docs/CODEMAP.md`
- Скрипт збірки: `/Users/admin/Documents/New project 3/scripts/build-app.js`
- Скрипт “де правити”: `/Users/admin/Documents/New project 3/scripts/scope-files.js`

## 9. Правила редагування в цьому репо

- Не редагуємо вручну `app.js` (лише через збірку).
- Основні правки тільки у `src/app/*` або `server/*`.
- Перед деплоєм завжди перевіряємо:
  - збірка ок;
  - синтаксис ок;
  - цільова вкладка UI працює.
