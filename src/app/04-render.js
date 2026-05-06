function render() {
  renderTabs();
  renderTournamentTab();
  renderBasePlayersTab();
  renderArchiveTab();
}

function renderTabs() {
  for (const btn of els.tabsNav.querySelectorAll(".tab-btn")) {
    btn.classList.toggle("active", btn.dataset.tab === state.activeTab);
  }

  for (const [tabName, panel] of Object.entries(els.tabPanels)) {
    panel.classList.toggle("active", tabName === state.activeTab);
  }
}

function renderTournamentTab() {
  const t = state.currentTournament;
  const archiveView = t.status === "archived_view";
  ensureTournamentSettingsDraftForCurrentTournament();
  const draft = tournamentSettingsDraft;
  if (draft.format === "round_robin") {
    draft.roundsCount = getMaxRoundsByFormat("round_robin", t.players.length);
  }

  els.tournamentName.value = draft.name;
  els.roundsCount.value = draft.roundsCount;
  els.tournamentFormat.value = draft.format;
  els.roundsCount.disabled = draft.format === "round_robin" || archiveView;
  renderRoundsRuleHint();
  els.tournamentDate.value = formatDateForInput(draft.eventDate || t.eventDate);
  els.tournamentTimeControl.value = normalizeTimeControl(draft.timeControl);
  els.tournamentChiefJudge.value = normalizeChiefJudge(draft.chiefJudge);
  renderTieBreakSelectors(draft.tieBreakOrder);
  els.tournamentRemovePhoto.checked = draft.removePhoto;
  els.tournamentPhoto.value = "";

  const eventDateText = t.eventDate ? formatDateOnly(t.eventDate) : "дата не вказана";
  const timeControlText = t.timeControl || "не вказано";
  const chiefJudgeText = t.chiefJudge || "не вказано";
  const tournamentTitle = t.name || "Новий турнір";
  els.roundMeta.textContent = `${tournamentTitle} | ${formatLabel(t.format)} | Тур ${t.currentRound} з ${t.roundsCount} | Дата: ${eventDateText} | Контроль: ${timeControlText} | Суддя: ${chiefJudgeText}${archiveView ? " | Архів (read-only)" : ""}`;

  renderTournamentSettingsPreview();

  renderBaseSelect();
  els.generateRoundBtn.disabled = archiveView;
  els.printRoundBtn.disabled = archiveView || t.rounds.length === 0;
  els.finishTournamentBtn.disabled = archiveView;
  if (els.seedDemoBtn) {
    els.seedDemoBtn.disabled = archiveView;
  }
  if (archiveView) {
    els.dbPlayerSelect.disabled = true;
    els.selectAllBaseBtn.disabled = true;
    els.addFromBaseBtn.disabled = true;
    for (const checkbox of els.dbPlayerChecklist.querySelectorAll("input[type='checkbox']")) {
      checkbox.disabled = true;
    }
  }

  renderTournamentSubtabs();
  renderTournamentPlayers();
  renderRounds();
  renderStandings();
}

function renderRoundsRuleHint() {
  ensureTournamentSettingsDraftForCurrentTournament();
  const draft = tournamentSettingsDraft;
  if (draft.format !== "round_robin") {
    els.roundsRuleHint.textContent = "Для швейцарської системи кількість турів задається вручну.";
    return;
  }

  const playersCount = state.currentTournament.players.length;
  const roundsCount = getMaxRoundsByFormat("round_robin", playersCount);
  els.roundsRuleHint.textContent = `Кругова: ${playersCount} гравців -> ${roundsCount} турів.`;
}

function createTournamentSettingsDraft(tournament) {
  const normalizedEventDate = normalizeBirthDate(tournament.eventDate);
  return {
    tournamentId: tournament.id,
    name: typeof tournament.name === "string" ? tournament.name : "Турнір",
    roundsCount: Number(tournament.roundsCount) || 1,
    format: tournament.format === "round_robin" ? "round_robin" : "swiss",
    eventDate: normalizedEventDate,
    timeControl: normalizeTimeControl(tournament.timeControl),
    chiefJudge: normalizeChiefJudge(tournament.chiefJudge),
    tieBreakOrder: normalizeTieBreakOrder(tournament.tieBreakOrder, { fillDefaults: false }),
    removePhoto: false,
    pendingPhotoDataUrl: null,
  };
}

function ensureTournamentSettingsDraftForCurrentTournament() {
  if (tournamentSettingsDraft && tournamentSettingsDraft.tournamentId === state.currentTournament.id) {
    return;
  }

  tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
}

function captureTournamentSettingsDraftFromForm() {
  if (state.activeTab !== "tournament") {
    return;
  }

  ensureTournamentSettingsDraftForCurrentTournament();

  tournamentSettingsDraft.name = els.tournamentName.value.trim();
  tournamentSettingsDraft.format = els.tournamentFormat.value === "round_robin" ? "round_robin" : "swiss";
  tournamentSettingsDraft.roundsCount = Number(els.roundsCount.value) || 1;
  tournamentSettingsDraft.eventDate = normalizeBirthDate(els.tournamentDate.value);
  tournamentSettingsDraft.timeControl = normalizeTimeControl(els.tournamentTimeControl.value);
  tournamentSettingsDraft.chiefJudge = normalizeChiefJudge(els.tournamentChiefJudge.value);
  tournamentSettingsDraft.tieBreakOrder = collectTieBreakOrderFromForm();
  tournamentSettingsDraft.removePhoto = els.tournamentRemovePhoto.checked;

  if (tournamentSettingsDraft.removePhoto) {
    tournamentSettingsDraft.pendingPhotoDataUrl = null;
  }
}

function collectTieBreakOrderFromForm() {
  const picked = [els.tieBreak1.value, els.tieBreak2.value, els.tieBreak3.value, els.tieBreak4.value, els.tieBreak5.value];
  return normalizeTieBreakOrder(picked, { fillDefaults: false });
}

function normalizeTieBreakOrder(input, options = {}) {
  const { fillDefaults = true } = options;
  const allowed = new Set(TIEBREAK_OPTIONS.map((x) => x.value));
  const list = Array.isArray(input) ? input : [];
  const normalized = [];
  const used = new Set();

  for (let i = 0; i < 5; i += 1) {
    const raw = String(list[i] || "").trim();
    const value = raw && raw !== "none" && allowed.has(raw) ? raw : "none";
    if (value !== "none" && used.has(value)) {
      normalized.push("none");
      continue;
    }
    normalized.push(value);
    if (value !== "none") {
      used.add(value);
    }
  }

  if (fillDefaults) {
    for (const fallback of DEFAULT_TIEBREAK_ORDER) {
      const emptyIdx = normalized.indexOf("none");
      if (emptyIdx === -1) {
        break;
      }
      if (!used.has(fallback)) {
        normalized[emptyIdx] = fallback;
        used.add(fallback);
      }
    }
  }

  return normalized.slice(0, 5);
}

function renderTieBreakSelectors(orderInput) {
  const order = normalizeTieBreakOrder(orderInput, { fillDefaults: false });
  const selects = [els.tieBreak1, els.tieBreak2, els.tieBreak3, els.tieBreak4, els.tieBreak5];

  for (let i = 0; i < selects.length; i += 1) {
    const select = selects[i];
    const current = order[i] || "none";
    const options = [
      '<option value="none">Не використовувати</option>',
      ...TIEBREAK_OPTIONS.map((item) => `<option value="${item.value}">${escapeHtml(item.label)}</option>`),
    ].join("");

    select.innerHTML = options;
    select.value = current;
  }
}

function renderTournamentSettingsPreview() {
  const t = state.currentTournament;
  const hasPlayers = Array.isArray(t.players) && t.players.length > 0;
  const hasPhoto = Boolean(t.photoDataUrl);
  const hasDate = Boolean(t.eventDate);
  const hasControl = Boolean(t.timeControl);
  const hasChiefJudge = Boolean(t.chiefJudge);
  const hasAnyMeta = hasPlayers && (hasPhoto || hasDate || hasControl || hasChiefJudge);

  els.tournamentSettingsPreview.hidden = !hasAnyMeta;
  els.tournamentSettingsPreview.style.display = hasAnyMeta ? "flex" : "none";
  if (!hasAnyMeta) {
    els.tournamentSettingsPhoto.src = "";
    els.tournamentSettingsPhoto.hidden = true;
    els.tournamentSettingsDate.textContent = "";
    els.tournamentSettingsControl.textContent = "";
    els.tournamentSettingsChiefJudge.textContent = "";
    return;
  }

  if (hasPhoto) {
    els.tournamentSettingsPhoto.src = t.photoDataUrl;
    els.tournamentSettingsPhoto.hidden = false;
  } else {
    els.tournamentSettingsPhoto.src = "";
    els.tournamentSettingsPhoto.hidden = true;
  }

  els.tournamentSettingsDate.textContent = `Дата: ${hasDate ? formatDateOnly(t.eventDate) : "не вказана"}`;
  els.tournamentSettingsControl.textContent = `Контроль часу: ${hasControl ? t.timeControl : "не вказано"}`;
  els.tournamentSettingsChiefJudge.textContent = `Головний суддя: ${hasChiefJudge ? t.chiefJudge : "не вказано"}`;
}

function renderTournamentSubtabs() {
  const activeView =
    state.tournamentView === "rounds" || state.tournamentView === "table" ? state.tournamentView : "setup";

  for (const btn of els.tournamentSubtabs.querySelectorAll(".subtab-btn")) {
    btn.classList.toggle("active", btn.dataset.tournamentView === activeView);
  }

  for (const panel of els.tournamentViewPanels) {
    panel.classList.toggle("tour-view-hidden", panel.dataset.tourView !== activeView);
  }
}

function renderBaseSelect() {
  const query = String(els.dbPlayerSelect.value || "").trim().toLowerCase();
  const t = state.currentTournament;
  const tournamentIds = new Set((t.players || []).map((p) => p.basePlayerId).filter(Boolean));

  if (state.playerBase.length === 0) {
    tournamentBaseLookup = [];
    filteredTournamentBaseLookup = [];
    selectedBasePlayerIds.clear();
    els.dbPlayerSelect.value = "";
    els.dbPlayerSelect.placeholder = "База гравців порожня";
    els.dbPlayerSelect.disabled = true;
    els.dbPlayerChecklist.innerHTML = '<div class="base-pick-empty">База гравців порожня.</div>';
    els.dbPlayerChecklist.classList.remove("base-pick-list");
    els.selectAllBaseBtn.disabled = true;
    els.addFromBaseBtn.disabled = true;
    return;
  }

  tournamentBaseLookup = state.playerBase
    .filter((p) => !tournamentIds.has(p.id))
    .slice()
    .sort((a, b) => {
      const byLast = String(a.lastName || "").localeCompare(String(b.lastName || ""), "uk");
      if (byLast !== 0) {
        return byLast;
      }
      const byFirst = String(a.firstName || "").localeCompare(String(b.firstName || ""), "uk");
      if (byFirst !== 0) {
        return byFirst;
      }
      return b.rating - a.rating;
    })
    .map((p) => ({
      player: p,
      id: p.id,
      token: `${getBaseFullName(p)} (${p.rating})`,
      search: `${p.lastName} ${p.firstName} ${getBaseFullName(p)} ${p.rating}`.toLowerCase(),
    }));

  const allowedIds = new Set(tournamentBaseLookup.map((item) => item.id));
  selectedBasePlayerIds = new Set([...selectedBasePlayerIds].filter((id) => allowedIds.has(id)));
  filteredTournamentBaseLookup =
    query.length === 0 ? tournamentBaseLookup : tournamentBaseLookup.filter((item) => item.search.includes(query));
  els.dbPlayerSelect.disabled = false;
  els.dbPlayerSelect.placeholder = "Пошук за прізвищем, ім'ям або рейтингом";

  if (tournamentBaseLookup.length === 0) {
    els.dbPlayerChecklist.innerHTML = '<div class="base-pick-empty">Усі гравці з бази вже додані в цей турнір.</div>';
    els.dbPlayerChecklist.classList.remove("base-pick-list");
    els.selectAllBaseBtn.disabled = true;
    els.addFromBaseBtn.disabled = true;
    return;
  }

  if (filteredTournamentBaseLookup.length === 0) {
    els.dbPlayerChecklist.innerHTML = '<div class="base-pick-empty">Нічого не знайдено за цим запитом.</div>';
    els.dbPlayerChecklist.classList.remove("base-pick-list");
    els.selectAllBaseBtn.disabled = true;
  } else {
    els.dbPlayerChecklist.classList.add("base-pick-list");
    els.dbPlayerChecklist.innerHTML = filteredTournamentBaseLookup
      .map((item) => {
        const checked = selectedBasePlayerIds.has(item.id) ? "checked" : "";
        return `
        <label class="base-pick-item">
          <input type="checkbox" data-base-player-id="${item.id}" ${checked} />
          <span class="base-pick-name">${escapeHtml(item.token)}</span>
        </label>`;
      })
      .join("");
    els.selectAllBaseBtn.disabled = false;
  }
  els.addFromBaseBtn.disabled = selectedBasePlayerIds.size === 0;
}

function renderTournamentPlayers() {
  const t = state.currentTournament;
  const ordered = [...t.players];
  const editable = t.currentRound === 0;

  const rows = ordered
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${p.rating}</td>
        <td>${p.score.toFixed(1)}</td>
        <td>${p.hadBye ? "Так" : "Ні"}</td>
        <td>
          <div class="toolbar">
            <button type="button" data-action="remove-tour-player" data-player-id="${p.id}" class="danger" ${editable ? "" : "disabled"}>Видалити</button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  els.playersList.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Гравець</th>
          <th>Рейтинг</th>
          <th>Очки</th>
          <th>BYE</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderRounds() {
  const t = state.currentTournament;
  const archiveView = t.status === "archived_view";

  if (archiveView) {
    els.pairings.innerHTML = '<div class="pair-card">Для архівного перегляду доступна тільки підсумкова таблиця.</div>';
    return;
  }

  if (t.rounds.length === 0) {
    els.pairings.innerHTML = '<div class="pair-card">Ще немає згенерованих турів.</div>';
    return;
  }

  const roundsWithIndex = t.rounds
    .map((round, index) => ({ round, index }))
    .sort((a, b) => b.round.round - a.round.round);

  const blocks = roundsWithIndex
    .map(({ round, index }) => {
      const roundLocked = round.round < t.currentRound;
      const pairs = round.pairings
        .map((pair) => {
          const white = t.players.find((p) => p.id === pair.whiteId);
          const black = pair.blackId ? t.players.find((p) => p.id === pair.blackId) : null;
          const whiteName = white ? white.name : `ID:${String(pair.whiteId || "-").slice(0, 8)}`;
          const blackName = black ? black.name : pair.blackId ? `ID:${String(pair.blackId).slice(0, 8)}` : null;

          if (!black) {
            return `
              <div class="pair-card pair-card--row">
                <div class="pair-main">
                  <span class="pair-board">Дошка ${pair.board}</span>
                  <span class="pair-vs">${escapeHtml(whiteName)} - BYE</span>
                </div>
                <div class="pair-bye-note">1 очко</div>
              </div>`;
          }

          return `
            <div class="pair-card pair-card--row">
              <div class="pair-main">
                <span class="pair-board">Дошка ${pair.board}</span>
                <span class="pair-vs">${escapeHtml(whiteName)} - ${escapeHtml(blackName)}</span>
                ${roundLocked ? '<span class="pair-lock">зафіксовано</span>' : ""}
              </div>
              <div class="pair-actions">
                <select data-round-idx="${index}" data-board="${pair.board}" ${roundLocked ? "disabled" : ""}>
                  <option value="pending" ${pair.result === "pending" ? "selected" : ""}>Результат не внесено</option>
                  <option value="1-0" ${pair.result === "1-0" ? "selected" : ""}>1-0</option>
                  <option value="0-1" ${pair.result === "0-1" ? "selected" : ""}>0-1</option>
                  <option value="0.5-0.5" ${pair.result === "0.5-0.5" ? "selected" : ""}>0.5-0.5</option>
                </select>
              </div>
            </div>`;
        })
        .join("");

      return `<h3>Тур ${round.round}</h3>${pairs}`;
    })
    .join("");

  els.pairings.innerHTML = blocks;

  for (const select of els.pairings.querySelectorAll("select")) {
    select.addEventListener("change", (event) => {
      const roundIdx = Number(event.target.dataset.roundIdx);
      const board = Number(event.target.dataset.board);
      updateResult(roundIdx, board, event.target.value);
    });
  }
}

function printCurrentRound() {
  const t = state.currentTournament;
  if (t.status === "archived_view") {
    alert("У режимі архіву друк туру недоступний.");
    return;
  }

  if (!Array.isArray(t.rounds) || t.rounds.length === 0) {
    alert("Ще немає згенерованих турів для друку.");
    return;
  }

  const currentRound = t.rounds[t.rounds.length - 1];
  if (!currentRound) {
    alert("Не вдалося знайти поточний тур.");
    return;
  }

  const tournamentTitle = t.name || "Турнір";
  const eventDateText = t.eventDate ? formatDateOnly(t.eventDate) : "не вказана";
  const controlText = t.timeControl || "не вказано";
  const judgeText = t.chiefJudge || "не вказано";

  const rowsHtml = (currentRound.pairings || [])
    .map((pair) => {
      const white = t.players.find((p) => p.id === pair.whiteId);
      const black = pair.blackId ? t.players.find((p) => p.id === pair.blackId) : null;
      const whiteName = white ? white.name : "Невідомо";
      const blackName = black ? black.name : "BYE";
      const resultText =
        pair.result === "1-0" || pair.result === "0-1" || pair.result === "0.5-0.5"
          ? pair.result
          : black ? "—" : "1-0 (BYE)";

      return `<tr>
        <td>${pair.board}</td>
        <td>${escapeHtml(whiteName)}</td>
        <td>${escapeHtml(blackName)}</td>
        <td>${escapeHtml(resultText)}</td>
      </tr>`;
    })
    .join("");

  const printHtml = `<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(tournamentTitle)} — Тур ${currentRound.round}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 18mm 12mm; color: #101b37; }
      h1 { margin: 0 0 10px; font-size: 28px; }
      .meta { margin: 2px 0; font-size: 15px; }
      table { width: 100%; border-collapse: collapse; margin-top: 14px; }
      th, td { border: 1px solid #b8c4d8; padding: 8px 10px; text-align: left; font-size: 14px; }
      th { background: #e8eef8; }
      @media print { body { margin: 10mm; } }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(tournamentTitle)} — Тур ${currentRound.round}</h1>
    <div class="meta"><strong>Формат:</strong> ${escapeHtml(formatLabel(t.format))}</div>
    <div class="meta"><strong>Дата:</strong> ${escapeHtml(eventDateText)}</div>
    <div class="meta"><strong>Контроль часу:</strong> ${escapeHtml(controlText)}</div>
    <div class="meta"><strong>Головний суддя:</strong> ${escapeHtml(judgeText)}</div>
    <table>
      <thead>
        <tr>
          <th>Дошка</th>
          <th>Білі</th>
          <th>Чорні</th>
          <th>Результат</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </body>
</html>`;

  const win = window.open("", "_blank", "width=1000,height=800");
  if (!win) {
    alert("Браузер заблокував вікно друку. Дозволь pop-up для цієї сторінки.");
    return;
  }

  win.document.open();
  win.document.write(printHtml);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 150);
}

function renderStandings() {
  const t = state.currentTournament;
  const showRoundDetails = t.status !== "archived_view";
  els.standings.innerHTML = buildStandingsTableHtml(t, { showRoundDetails });
}

function buildStandingsTableHtml(tournament, options = {}) {
  const { showRoundDetails = true } = options;
  ensureStartNumbers(tournament);

  const enriched = getStandings(tournament);
  const placeById = Object.fromEntries(enriched.map((p, idx) => [p.id, idx + 1]));
  const tieRangeById = new Map();
  let cursor = 1;
  let i = 0;
  while (i < enriched.length) {
    const scoreKey = Number(enriched[i].score).toFixed(4);
    let j = i;
    while (j < enriched.length && Number(enriched[j].score).toFixed(4) === scoreKey) {
      j += 1;
    }
    const start = cursor;
    const end = cursor + (j - i) - 1;
    for (let k = i; k < j; k += 1) {
      tieRangeById.set(enriched[k].id, { start, end, size: j - i });
    }
    cursor = end + 1;
    i = j;
  }

  const rows = enriched
    .map(
      (p, i) => `
      <tr>
        <td>${buildPlaceCell(tournament, p, i + 1, showRoundDetails, tieRangeById.get(p.id))}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${p.rating}</td>
        ${showRoundDetails ? buildRoundCells(tournament, p, placeById) : ""}
        <td>${p.score.toFixed(1)}</td>
        <td>${p.h2h.toFixed(1)}</td>
        <td>${p.wins}</td>
        <td>${p.buchholz.toFixed(1)}</td>
        <td>${p.solkPlus.toFixed(1)}</td>
        <td>${p.tsolk.toFixed(1)}</td>
        <td>${p.sb.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const roundHeaders = showRoundDetails
    ? Array.from({ length: tournament.roundsCount }, (_, idx) => `<th>R${idx + 1}</th>`).join("")
    : "";

  return `
    <table class="table">
      <thead>
        <tr>
          <th>Місце</th>
          <th>Гравець</th>
          <th>Рейтинг</th>
          ${roundHeaders}
          <th>Очки</th>
          <th>H2H</th>
          <th>Wins</th>
          <th>Buchholz</th>
          <th>SOLK+</th>
          <th>TSOLK</th>
          <th>SB</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function buildPlaceCell(tournament, player, computedPlace, showRoundDetails, tieRange) {
  return String(computedPlace);
}

function renderBasePlayersTab() {
  const sortedPlayers = sortBasePlayers(state.playerBase);
  const rows = sortedPlayers
    .map((p, idx) => {
      return `
      <tr>
        <td>${idx + 1}</td>
        <td>${p.photoDataUrl ? `<img class="avatar" src="${p.photoDataUrl}" alt="${escapeHtml(getBaseFullName(p))}" />` : '<span class="avatar-placeholder">Фото</span>'}</td>
        <td>${escapeHtml(p.lastName || "")}</td>
        <td>${escapeHtml(p.firstName || "")}</td>
        <td>${p.rating}</td>
        <td>${escapeHtml(p.rank || "б/р")}</td>
        <td>${p.birthDate || "-"}</td>
        <td>${p.stats.tournaments}</td>
        <td>${p.stats.games}</td>
        <td>${p.stats.wins}/${p.stats.draws}/${p.stats.losses}</td>
        <td>${p.stats.totalScore.toFixed(1)}</td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" type="button" title="Редагувати" aria-label="Редагувати" data-action="edit-base-player" data-player-id="${p.id}">✎</button>
            <button class="icon-btn" type="button" title="Історія" aria-label="Історія" data-action="view-base-history" data-player-id="${p.id}">⏱</button>
            <button class="icon-btn" type="button" title="Додати в турнір" aria-label="Додати в турнір" data-action="add-to-tournament" data-player-id="${p.id}">＋</button>
            <button class="icon-btn danger" type="button" title="Видалити" aria-label="Видалити" data-action="delete-base-player" data-player-id="${p.id}">🗑</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  const head = (label, key) => {
    const active = basePlayersSort.key === key;
    const arrow = active ? (basePlayersSort.dir === "asc" ? " ↑" : " ↓") : "";
    return `<button class="th-sort-btn ${active ? "active" : ""}" type="button" data-action="sort-base-column" data-sort-key="${key}">${label}${arrow}</button>`;
  };

  els.basePlayersList.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>${head("#", "index")}</th>
          <th>${head("Фото", "photo")}</th>
          <th>${head("Прізвище", "lastName")}</th>
          <th>${head("Ім'я", "firstName")}</th>
          <th>${head("Рейт.", "rating")}</th>
          <th>${head("Звання", "rank")}</th>
          <th>${head("Дата нар.", "birthDate")}</th>
          <th>${head("Турніри", "tournaments")}</th>
          <th>${head("Партії", "games")}</th>
          <th>${head("W/D/L", "wdl")}</th>
          <th>${head("Очки", "score")}</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="12">База порожня.</td></tr>'}</tbody>
    </table>`;
}

function sortBasePlayers(players) {
  const dir = basePlayersSort.dir === "asc" ? 1 : -1;
  const key = basePlayersSort.key;

  const list = players
    .slice()
    .map((p, idx) => ({ p, idx }))
    .sort((aWrap, bWrap) => {
      const a = aWrap.p;
      const b = bWrap.p;

      const compareText = (x, y) => String(x || "").localeCompare(String(y || ""), "uk");
      const compareNum = (x, y) => (Number(x) || 0) - (Number(y) || 0);

      let cmp = 0;
      if (key === "index") {
        cmp = aWrap.idx - bWrap.idx;
      } else if (key === "photo") {
        cmp = (a.photoDataUrl ? 1 : 0) - (b.photoDataUrl ? 1 : 0);
      } else if (key === "lastName") {
        cmp = compareText(a.lastName, b.lastName);
      } else if (key === "firstName") {
        cmp = compareText(a.firstName, b.firstName);
      } else if (key === "rating") {
        cmp = compareNum(a.rating, b.rating);
      } else if (key === "rank") {
        cmp = compareText(a.rank, b.rank);
      } else if (key === "birthDate") {
        cmp = compareText(a.birthDate || "9999-99-99", b.birthDate || "9999-99-99");
      } else if (key === "tournaments") {
        cmp = compareNum(a.stats?.tournaments, b.stats?.tournaments);
      } else if (key === "games") {
        cmp = compareNum(a.stats?.games, b.stats?.games);
      } else if (key === "wdl") {
        const aw = Number(a.stats?.wins) || 0;
        const ad = Number(a.stats?.draws) || 0;
        const al = Number(a.stats?.losses) || 0;
        const bw = Number(b.stats?.wins) || 0;
        const bd = Number(b.stats?.draws) || 0;
        const bl = Number(b.stats?.losses) || 0;
        cmp = aw - bw || ad - bd || (al - bl) * -1;
      } else if (key === "score") {
        cmp = compareNum(a.stats?.totalScore, b.stats?.totalScore);
      }

      if (cmp !== 0) {
        return cmp * dir;
      }

      return compareText(getBaseFullName(a), getBaseFullName(b));
    });

  return list.map((x) => x.p);
}

function renderArchiveTab() {
  if (state.tournamentsArchive.length === 0) {
    els.archiveList.innerHTML = '<div class="archive-card">Архів поки порожній.</div>';
    return;
  }

  const blocks = state.tournamentsArchive
    .slice()
    .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt))
    .map((t) => {
      const standings = getStandings(t).slice(0, 3);
      const top = standings.map((p, i) => `${i + 1}. ${escapeHtml(p.name)} (${p.score.toFixed(1)})`).join(" | ");
      const isOpen = state.archivePreviewTournamentId === t.id;

      return `
      <article class="archive-card">
        <div class="archive-head">
          <strong>${escapeHtml(t.name)}</strong>
          <div class="toolbar">
            <button type="button" data-action="open-archive" data-tournament-id="${t.id}">Відкрити</button>
            <button type="button" data-action="print-archive" data-tournament-id="${t.id}">Друк</button>
            <button type="button" data-action="delete-archive" data-tournament-id="${t.id}" class="danger">Видалити</button>
          </div>
        </div>
        <div class="archive-meta">Завершено: ${formatDate(t.finishedAt)} | Турів: ${t.currentRound}/${t.roundsCount} | Учасників: ${t.players.length}</div>
        <div class="archive-media">
          ${
            t.photoDataUrl
              ? `<img class="archive-photo" src="${t.photoDataUrl}" alt="Фото ${escapeHtml(t.name)}" />`
              : '<span class="archive-photo-placeholder">Фото</span>'
          }
          <div>
            <div class="archive-meta"><strong>Турнір:</strong> ${escapeHtml(t.name)}</div>
            <div class="archive-meta"><strong>Дата:</strong> ${t.eventDate ? formatDateOnly(t.eventDate) : "не вказана"}</div>
            <div class="archive-meta"><strong>Контроль:</strong> ${escapeHtml(t.timeControl || "не вказано")}</div>
            <div class="archive-meta"><strong>Головний суддя:</strong> ${escapeHtml(t.chiefJudge || "не вказано")}</div>
          </div>
        </div>
        <div class="archive-meta">Топ-3: ${top || "-"}</div>
        ${isOpen ? buildArchivePreviewHtml(t) : ""}
      </article>`;
    })
    .join("");

  els.archiveList.innerHTML = blocks;
}

function openArchivePreview(tournamentId) {
  const archived = state.tournamentsArchive.find((t) => t.id === tournamentId);
  if (!archived) {
    return;
  }

  state.archivePreviewTournamentId = tournamentId;
  state.activeTab = "archive";
  saveAndRender();
}

function printArchivedTournament(tournamentId) {
  const archived = state.tournamentsArchive.find((t) => t.id === tournamentId);
  if (!archived) {
    alert("Турнір в архіві не знайдено.");
    return;
  }

  const standingsHtml = buildStandingsTableHtml(archived, { showRoundDetails: true });
  const eventDateText = archived.eventDate ? formatDateOnly(archived.eventDate) : "не вказана";
  const controlText = archived.timeControl || "не вказано";
  const judgeText = archived.chiefJudge || "не вказано";
  const finishedText = formatDate(archived.finishedAt);

  const printHtml = `<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(archived.name)} — підсумкова таблиця</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 12mm; color: #101b37; }
      h1 { margin: 0 0 10px; font-size: 28px; }
      .meta { margin: 2px 0 0; font-size: 15px; }
      .media { display: flex; align-items: flex-start; gap: 14px; margin-top: 10px; }
      .media img { width: 110px; height: 110px; object-fit: cover; border: 1px solid #b8c4d8; border-radius: 8px; }
      .table { width: 100%; border-collapse: collapse; margin-top: 14px; }
      .table th, .table td { border: 1px solid #b8c4d8; padding: 7px 9px; text-align: left; font-size: 13px; vertical-align: middle; }
      .table th { background: #e8eef8; }
      .round-chip { border: 1px solid #2a66c5; border-radius: 8px; padding: 2px 8px; display: inline-block; font-weight: 600; }
      .chip-empty { border-color: #b8c4d8; color: #7f8ba2; }
      .chip-bye { border-color: #6c9f3d; color: #356b16; }
      @media print { body { margin: 10mm; } }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(archived.name)} — підсумкова таблиця</h1>
    <div class="meta"><strong>Завершено:</strong> ${escapeHtml(finishedText)}</div>
    <div class="meta"><strong>Дата проведення:</strong> ${escapeHtml(eventDateText)}</div>
    <div class="meta"><strong>Контроль часу:</strong> ${escapeHtml(controlText)}</div>
    <div class="meta"><strong>Головний суддя:</strong> ${escapeHtml(judgeText)}</div>
    <div class="meta"><strong>Турів:</strong> ${archived.currentRound}/${archived.roundsCount} | <strong>Учасників:</strong> ${archived.players.length}</div>
    ${
      archived.photoDataUrl
        ? `<div class="media"><img src="${archived.photoDataUrl}" alt="Фото ${escapeHtml(archived.name)}" /></div>`
        : ""
    }
    ${standingsHtml}
  </body>
</html>`;

  const win = window.open("", "_blank", "width=1200,height=900");
  if (!win) {
    alert("Браузер заблокував вікно друку. Дозволь pop-up для цієї сторінки.");
    return;
  }

  win.document.open();
  win.document.write(printHtml);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 150);
}

function buildArchivePreviewHtml(archived) {
  const standingsTable = buildStandingsTableHtml(archived, { showRoundDetails: true });

  return `
    <hr />
    <h3>${escapeHtml(archived.name)} — підсумкова таблиця</h3>
    <div class="archive-meta">${formatDate(archived.finishedAt)} | Турів: ${archived.currentRound}/${archived.roundsCount}</div>
    <div class="archive-media" style="margin-top:8px;">
      ${
        archived.photoDataUrl
          ? `<img class="archive-photo" src="${archived.photoDataUrl}" alt="Фото ${escapeHtml(archived.name)}" />`
          : '<span class="archive-photo-placeholder">Фото</span>'
      }
      <div>
        <div class="archive-meta"><strong>Дата:</strong> ${archived.eventDate ? formatDateOnly(archived.eventDate) : "не вказана"}</div>
        <div class="archive-meta"><strong>Контроль:</strong> ${escapeHtml(archived.timeControl || "не вказано")}</div>
        <div class="archive-meta"><strong>Головний суддя:</strong> ${escapeHtml(archived.chiefJudge || "не вказано")}</div>
      </div>
    </div>
    <div class="toolbar" style="margin-top:8px;">
      <button type="button" data-action="close-archive-preview" data-tournament-id="${archived.id}">Закрити перегляд</button>
    </div>
    <div class="scroll" style="margin-top:10px;">${standingsTable}</div>
  `;
}

