# CODEMAP

Цей документ потрібен для швидкої точкової роботи без перегляду всього проєкту.

## Головний принцип
- `app.js` не редагуємо вручну (це зібраний файл).
- Працюємо тільки у `src/app/*.js`.
- Після змін запускаємо `npm run build:app`.

## Де що лежить
- `/Users/admin/Documents/New project 3/src/app/00-constants.js`
  Константи, ліміти, дефолти.
- `/Users/admin/Documents/New project 3/src/app/01-globals.js`
  DOM-елементи, глобальні змінні стану UI.
- `/Users/admin/Documents/New project 3/src/app/02-events.js`
  Всі обробники кліків/інпутів.
- `/Users/admin/Documents/New project 3/src/app/03-state-normalization.js`
  Нормалізація стану, фабрики сутностей, дефолтний турнір.
- `/Users/admin/Documents/New project 3/src/app/04-render.js`
  Візуальний рендер усіх вкладок і таблиць.
- `/Users/admin/Documents/New project 3/src/app/05-actions.js`
  CRUD дії для гравців/клубів/тренерів/турніру.
- `/Users/admin/Documents/New project 3/src/app/06-pairing.js`
  Генерація пар, BYE, результати турів.
- `/Users/admin/Documents/New project 3/src/app/07-standings.js`
  Підрахунок таблиці, tie-break, місця.
- `/Users/admin/Documents/New project 3/src/app/08-lifecycle-utils.js`
  Збереження, синхронізація, архівація, завершення турніру.
- `/Users/admin/Documents/New project 3/src/app/09-init.js`
  Ініціалізація застосунку.

## Маршрут змін по задачах

### 1) Налаштування турніру / формат / тури
- `02-events.js` (валідація форми, зміни полів)
- `03-state-normalization.js` (`getMaxRoundsByFormat`, дефолти)
- `04-render.js` (блок налаштувань)

### 2) Раунди / пари / результати
- `06-pairing.js` (логіка пар і результатів)
- `04-render.js` (UI раундів)
- `02-events.js` (кнопки раундів)

### 3) Таблиця / місця / tie-break
- `07-standings.js` (правила сортування)
- `04-render.js` (`buildStandingsTableHtml`, відображення місця)
- `08-lifecycle-utils.js` (перевірки перед завершенням)

### 4) База гравців
- `05-actions.js` (create/edit/delete)
- `04-render.js` (`renderBasePlayersTab`)
- `02-events.js` (фільтри/кнопки/сортування)

### 5) Клуби і тренери
- `05-actions.js` (клуби/тренери CRUD, привʼязки)
- `04-render.js` (`renderClubsTab`, `renderClubProfile`)
- `02-events.js` (вкладки профілю клубу, кнопки)

### 6) Турніри (активні + завершені), пошук і статуси
- `04-render.js` (`renderArchiveTab`)
- `02-events.js` (пошук, фільтри)
- `08-lifecycle-utils.js` (архівація/відкриття)

### 7) Синхронізація з Render API/PostgreSQL
- `08-lifecycle-utils.js`
- `server/*` (API)

## Швидкий чек-лист після змін
1. `npm run build:app`
2. `node --check app.js`
3. Перевірити тільки затронуту вкладку UI.
4. Потім пуш і деплой.
