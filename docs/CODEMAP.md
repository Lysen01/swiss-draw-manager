# CODEMAP (швидка навігація по коду)

Мета: правити точково, без перегляду всього проєкту.

## 1. Загальне правило

- `app.js` — зібраний файл, **не редагувати вручну**.
- Працюємо у `src/app/*` та `server/*`.
- Після frontend-змін: `npm run build:app`.

---

## 2. Frontend модулі (по відповідальності)

### A. Каркас і стан
- `/Users/admin/Documents/New project 3/src/app/00-constants.js`
  Константи, значення за замовчуванням, перелік критеріїв.
- `/Users/admin/Documents/New project 3/src/app/01-globals.js`
  DOM-посилання, глобальні UI-флаги, runtime-стан.

### B. Події / дії
- `/Users/admin/Documents/New project 3/src/app/02-events.js`
  Центральний event-layer (кліки, input, select, submit).
- `/Users/admin/Documents/New project 3/src/app/05-actions.js`
  CRUD-доменно-логічні дії (гравці, клуби, тренери, турніри).

### C. Нормалізація даних і обчислення
- `/Users/admin/Documents/New project 3/src/app/03-state-normalization.js`
  Нормалізація вхідних структур, дефолти, backward compatibility.
- `/Users/admin/Documents/New project 3/src/app/06-pairing.js`
  Логіка парування/турів/BYE.
- `/Users/admin/Documents/New project 3/src/app/07-standings.js`
  Таблиця, місця, tie-break, сортування.
- `/Users/admin/Documents/New project 3/src/app/08-lifecycle-utils.js`
  Збереження, синхронізація, архівування, завершення турніру.

### D. Рендеринг
- `/Users/admin/Documents/New project 3/src/app/04-render.js`
  Спільні render-блоки (секціоновано коментарями).
- `/Users/admin/Documents/New project 3/src/app/features/10-render-active-tab.js`
  Єдиний entry-point маршрутизації по вкладках.
- `/Users/admin/Documents/New project 3/src/app/features/11-render-tournament-tab.js`
  Рендер вкладки "Турнір".
- `/Users/admin/Documents/New project 3/src/app/features/12-render-players-tab.js`
  Рендер вкладки "База гравців".
- `/Users/admin/Documents/New project 3/src/app/features/13-render-clubs-tab.js`
  Рендер вкладки "Клуби".
- `/Users/admin/Documents/New project 3/src/app/features/14-render-archive-tab.js`
  Рендер вкладки "Турніри" (активні + завершені).

### E. Bootstrap
- `/Users/admin/Documents/New project 3/src/app/09-init.js`
  Ініціалізація застосунку.

---

## 3. Логічні блоки всередині `04-render.js`

1. `CORE SHELL RENDER`
  Головний `render()`, футер, tab-state.
2. `TOURNAMENT SETTINGS DRAFT`
  Draft налаштувань турніру, tie-break selectors, превʼю.
3. `TOURNAMENT PARTICIPANTS & ROUNDS UI`
  Списки учасників, раунди, ручний тур, W/D/L, мікроматчі.
4. `STANDINGS & TIEBREAK TABLE`
  Таблиця результатів та швидкі дії.
5. `CLUBS / COACHES / CLUB PROFILE`
  Внутрішні вкладки клубу, привʼязки, таблиці.
6. `PLAYER PROFILE DATA HELPERS`
  Профіль гравця, історія, опоненти, sparkline.
7. `TOURNAMENTS (ARCHIVE + ONGOING) PREVIEW HELPERS`
  Картки у вкладці турнірів.

---

## 4. Де правити конкретні задачі

### Задача: не зберігається дата турніру
- `src/app/02-events.js` (submit/кнопки збереження)
- `src/app/05-actions.js` (apply/update)
- `src/app/08-lifecycle-utils.js` (persist + API sync)
- `server/routes/tournaments.js` (PATCH/PUT поля)

### Задача: не зберігається дата народження гравця
- `src/app/05-actions.js`
- `src/app/02-events.js`
- `server/routes/players.js`
- `server/lib/validators.js`

### Задача: не завершується турнір після reload
- `src/app/08-lifecycle-utils.js` (persist finalized status)
- `src/app/03-state-normalization.js` (correct restore status)
- `server/routes/tournaments.js` (архів/статус/active pointer)

Поточна логіка: звичайне завершення спочатку робить direct upsert турніру в API зі статусом `archived`, а вже після успішного запису скидає `currentTournament`. Це захищає від ситуації, коли UI очистився, але PostgreSQL після reload повернув старий active-турнір.

### Задача: проблеми в картках вкладки "Турніри"
- `src/app/features/14-render-archive-tab.js`
- `src/app/04-render.js` (archive preview helper)
- `src/app/02-events.js` (фільтри та дії)

---

## 5. Build order (важливо для уникнення дублювань)

Визначено у:
- `/Users/admin/Documents/New project 3/scripts/build-app.js`

Порядок:
1) core (`00..04`)
2) feature render entry-points (`features/10..14`)
3) actions/pairing/standings/lifecycle/init (`05..09`)

---

## 6. Backend карта

- `/Users/admin/Documents/New project 3/server/index.js` — старт API + middleware.
- `/Users/admin/Documents/New project 3/server/lib/db.js` — підключення pg.
- `/Users/admin/Documents/New project 3/server/lib/schema.js` — схема/міграційні ensure.
- `/Users/admin/Documents/New project 3/server/lib/auth.js` — auth helpers.
- `/Users/admin/Documents/New project 3/server/middleware/auth.js` — role-check.
- `/Users/admin/Documents/New project 3/server/routes/*.js` — REST endpoints.

---

## 7. Мінімальний чек перед push

1. `npm run build:app`
2. `node --check app.js`
3. smoke-test цільової вкладки
4. `git status` (переконатись, що немає зайвих файлів)
