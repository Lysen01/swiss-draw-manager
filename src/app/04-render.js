function render() {
  renderTabs();
  renderActiveTabPanel();
  renderPersistenceFooter();
}

function renderActiveTabPanel() {
  if (state.activeTab === "tournament") {
    renderTournamentTab();
    return;
  }

  if (state.activeTab === "players") {
    renderBasePlayersTab();
    return;
  }

  if (state.activeTab === "clubs") {
    renderClubsTab();
    return;
  }

  if (state.activeTab === "archive") {
    renderArchiveTab();
    return;
  }

  renderTournamentTab();
}

function renderPersistenceFooter() {
  if (els.storageModeLabel) {
    els.storageModeLabel.textContent =
      persistenceInfo.mode === "remote" ? "Сховище: Render API + PostgreSQL" : "Сховище: браузер (localStorage)";
  }

  if (!els.syncStatus) {
    return;
  }

  els.syncStatus.textContent = persistenceInfo.message;
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
  if (els.tournamentIsMicromatch) {
    els.tournamentIsMicromatch.checked = Boolean(draft.isMicromatch);
  }
  if (els.scoreCalculationType) {
    els.scoreCalculationType.value = draft.scoreCalculationType === "small_points" ? "small_points" : "big_points";
  }
  renderScoreCalculationControls();
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
  els.manualRoundBtn.disabled = archiveView;
  els.manualRoundBtn.textContent = manualRoundBuilderOpen ? "Закрити ручний тур" : "Додати тур вручну";
  els.printRoundBtn.disabled = archiveView || t.rounds.length === 0;
  els.finishTournamentBtn.disabled = archiveView;
  if (els.seedDemoBtn) {
    els.seedDemoBtn.disabled = archiveView;
  }
  if (archiveView) {
    els.dbPlayerSelect.disabled = true;
    if (els.tournamentClubFilter) {
      els.tournamentClubFilter.disabled = true;
    }
    els.selectAllBaseBtn.disabled = true;
    els.addFromBaseBtn.disabled = true;
    for (const checkbox of els.dbPlayerChecklist.querySelectorAll("input[type='checkbox']")) {
      checkbox.disabled = true;
    }
  }

  renderTournamentSubtabs();
  renderTournamentPlayers();
  renderManualPairingPanel();
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

function renderScoreCalculationControls() {
  ensureTournamentSettingsDraftForCurrentTournament();
  const draft = tournamentSettingsDraft;
  if (!els.scoreCalculationWrap || !els.scoreCalculationType || !els.tournamentIsMicromatch) {
    return;
  }

  const isMicromatch = Boolean(draft.isMicromatch);
  els.scoreCalculationWrap.hidden = !isMicromatch;
  els.scoreCalculationType.value = draft.scoreCalculationType === "small_points" ? "small_points" : "big_points";
  els.tournamentIsMicromatch.checked = isMicromatch;
}

function createTournamentSettingsDraft(tournament) {
  const normalizedEventDate = normalizeBirthDate(tournament.eventDate);
  return {
    tournamentId: tournament.id,
    name: typeof tournament.name === "string" ? tournament.name : "Турнір",
    roundsCount: Number(tournament.roundsCount) || 1,
    format: tournament.format === "round_robin" ? "round_robin" : "swiss",
    isMicromatch: Boolean(tournament.isMicromatch),
    scoreCalculationType:
      Boolean(tournament.isMicromatch) && tournament.scoreCalculationType === "small_points" ? "small_points" : "big_points",
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
  tournamentSettingsDraft.isMicromatch = Boolean(els.tournamentIsMicromatch?.checked);
  tournamentSettingsDraft.scoreCalculationType =
    tournamentSettingsDraft.isMicromatch && els.scoreCalculationType?.value === "small_points" ? "small_points" : "big_points";
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
  const selectedClubFilter = String(els.tournamentClubFilter?.value || "all");
  const t = state.currentTournament;
  const tournamentIds = new Set((t.players || []).map((p) => p.basePlayerId).filter(Boolean));

  if (state.playerBase.length === 0) {
    tournamentBaseLookup = [];
    filteredTournamentBaseLookup = [];
    selectedBasePlayerIds.clear();
    els.dbPlayerSelect.value = "";
    els.dbPlayerSelect.placeholder = "База гравців порожня";
    els.dbPlayerSelect.disabled = true;
    if (els.tournamentClubFilter) {
      els.tournamentClubFilter.innerHTML = '<option value="all">Усі клуби</option>';
      els.tournamentClubFilter.value = "all";
      els.tournamentClubFilter.disabled = true;
    }
    els.dbPlayerChecklist.innerHTML = '<div class="base-pick-empty">База гравців порожня.</div>';
    els.dbPlayerChecklist.classList.remove("base-pick-list");
    els.selectAllBaseBtn.disabled = true;
    els.addFromBaseBtn.disabled = true;
    return;
  }

  const lookupAll = state.playerBase
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
      token: `${getBaseFullName(p)} (${p.rating})${p.clubId ? ` | ${getClubName(p.clubId)}` : " | Без клубу"}`,
      search: `${p.lastName} ${p.firstName} ${getBaseFullName(p)} ${getClubName(p.clubId)} ${getCoachName(p.coachId)}`.toLowerCase(),
    }));

  if (els.tournamentClubFilter) {
    const clubOptions = state.clubs
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "uk"))
      .map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`);
    els.tournamentClubFilter.innerHTML = [
      '<option value="all">Усі клуби</option>',
      '<option value="independent">Без клубу</option>',
      ...clubOptions,
    ].join("");
    const hasSelectedClub = selectedClubFilter === "all" || selectedClubFilter === "independent" || state.clubs.some((club) => club.id === selectedClubFilter);
    els.tournamentClubFilter.value = hasSelectedClub ? selectedClubFilter : "all";
    els.tournamentClubFilter.disabled = false;
  }

  tournamentBaseLookup = lookupAll.filter((item) => {
    if (!els.tournamentClubFilter || els.tournamentClubFilter.value === "all") {
      return true;
    }
    if (els.tournamentClubFilter.value === "independent") {
      return !item.player.clubId;
    }
    return item.player.clubId === els.tournamentClubFilter.value;
  });

  const allowedIds = new Set(tournamentBaseLookup.map((item) => item.id));
  selectedBasePlayerIds = new Set([...selectedBasePlayerIds].filter((id) => allowedIds.has(id)));
  filteredTournamentBaseLookup =
    query.length === 0 ? tournamentBaseLookup : tournamentBaseLookup.filter((item) => item.search.includes(query));
  els.dbPlayerSelect.disabled = false;
  els.dbPlayerSelect.placeholder = "Пошук за прізвищем або ім'ям";

  if (tournamentBaseLookup.length === 0) {
    const emptyMessage =
      els.tournamentClubFilter && els.tournamentClubFilter.value !== "all"
        ? "Немає доступних гравців для обраного клубу."
        : "Усі гравці з бази вже додані в цей турнір.";
    els.dbPlayerChecklist.innerHTML = `<div class="base-pick-empty">${emptyMessage}</div>`;
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
        <td>${escapeHtml(getClubName(p.clubId) || "Без клубу")}</td>
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
          <th>Клуб</th>
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
            const byeBig = getTournamentByeBigPoints(t);
            return `
              <div class="pair-card pair-card--row">
                <div class="pair-main">
                  <span class="pair-board">Дошка ${pair.board}</span>
                  <span class="pair-vs">${escapeHtml(whiteName)} - BYE</span>
                </div>
                <div class="pair-bye-note">${byeBig.toFixed(1)} очк.</div>
              </div>`;
          }

          if (pair.isMicromatch) {
            const games = Array.isArray(pair.gameResults) && pair.gameResults.length === 2 ? pair.gameResults : ["pending", "pending"];
            const done = games.every((x) => x === "1-0" || x === "0-1" || x === "0.5-0.5");
            const whiteSmall = done ? games.reduce((sum, x) => sum + getMicromatchGameSmallPoints(x, true), 0) : 0;
            const blackSmall = done ? games.reduce((sum, x) => sum + getMicromatchGameSmallPoints(x, false), 0) : 0;
            const pairResultClass = done ? resolvePairResultClass(resolveMicromatchBigResultBySmallScore(whiteSmall, blackSmall)) : "";

            return `
              <div class="pair-card pair-card--row pair-card--micromatch">
                <div class="pair-main">
                  <span class="pair-board">Дошка ${pair.board}</span>
                  <span class="pair-vs">${escapeHtml(whiteName)} - ${escapeHtml(blackName)}</span>
                  ${roundLocked ? '<span class="pair-lock">зафіксовано</span>' : ""}
                </div>
                <div class="pair-actions pair-actions--micromatch">
                  <div class="micromatch-row">
                    <span class="micromatch-row__label">Партія 1</span>
                    <div class="result-toggle" role="group" aria-label="Результат партії 1">
                      ${buildMicromatchGameButton(index, pair.board, 0, games[0], "1-0", "W", "Білі перемогли", roundLocked)}
                      ${buildMicromatchGameButton(index, pair.board, 0, games[0], "0.5-0.5", "D", "Нічия", roundLocked)}
                      ${buildMicromatchGameButton(index, pair.board, 0, games[0], "0-1", "L", "Чорні перемогли", roundLocked)}
                    </div>
                  </div>
                  <div class="micromatch-row">
                    <span class="micromatch-row__label">Партія 2</span>
                    <div class="result-toggle" role="group" aria-label="Результат партії 2">
                      ${buildMicromatchGameButton(index, pair.board, 1, games[1], "1-0", "W", "Білі перемогли", roundLocked)}
                      ${buildMicromatchGameButton(index, pair.board, 1, games[1], "0.5-0.5", "D", "Нічия", roundLocked)}
                      ${buildMicromatchGameButton(index, pair.board, 1, games[1], "0-1", "L", "Чорні перемогли", roundLocked)}
                    </div>
                  </div>
                  <div class="micromatch-summary ${pairResultClass}">Малі очки: ( ${whiteSmall} : ${blackSmall} )</div>
                </div>
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
                <div class="result-toggle" role="group" aria-label="Результат партії">
                  ${buildPairResultButton(index, pair.board, pair.result, "1-0", "W", "Білі перемогли", roundLocked)}
                  ${buildPairResultButton(index, pair.board, pair.result, "0.5-0.5", "D", "Нічия", roundLocked)}
                  ${buildPairResultButton(index, pair.board, pair.result, "0-1", "L", "Чорні перемогли", roundLocked)}
                </div>
              </div>
            </div>`;
        })
        .join("");

      return `<h3>Тур ${round.round}</h3>${pairs}`;
    })
    .join("");

  els.pairings.innerHTML = blocks;
}

function renderManualPairingPanel() {
  const t = state.currentTournament;
  if (!els.manualPairingPanel) {
    return;
  }

  if (!manualRoundBuilderOpen || t.status === "archived_view") {
    els.manualPairingPanel.hidden = true;
    els.manualPairingPanel.innerHTML = "";
    return;
  }

  els.manualPairingPanel.hidden = false;

  if (t.players.length < 2) {
    els.manualPairingPanel.innerHTML = '<div class="manual-pairing-note">Потрібно щонайменше 2 учасники.</div>';
    return;
  }

  if (t.currentRound >= t.roundsCount) {
    els.manualPairingPanel.innerHTML = '<div class="manual-pairing-note">Досягнуто максимальної кількості турів.</div>';
    return;
  }

  if (!isLastRoundComplete(t)) {
    els.manualPairingPanel.innerHTML =
      '<div class="manual-pairing-note">Спочатку внесіть усі результати поточного туру.</div>';
    return;
  }

  const nextRound = t.currentRound + 1;
  const boardsCount = Math.floor(t.players.length / 2);
  const options = buildManualPlayerOptions();
  const rows = Array.from({ length: boardsCount }, (_, idx) => {
    const board = idx + 1;
    return `
      <div class="manual-pairing-row">
        <span class="manual-pairing-board">Дошка ${board}</span>
        <select data-manual-white="${board}">
          <option value="">Білі</option>
          ${options}
        </select>
        <select data-manual-black="${board}">
          <option value="">Чорні</option>
          ${options}
        </select>
      </div>`;
  }).join("");

  const byeSelect =
    t.players.length % 2 === 1
      ? `
        <label class="manual-pairing-bye">
          BYE
          <select data-manual-bye>
            <option value="">Оберіть гравця</option>
            ${options}
          </select>
        </label>`
      : "";

  els.manualPairingPanel.innerHTML = `
    <div class="manual-pairing-head">
      <div>
        <strong>Ручний тур ${nextRound}</strong>
        <span class="meta">Для введення минулого турніру: оберіть пари, створіть тур і внесіть результати.</span>
      </div>
      <div class="manual-pairing-actions">
        <button type="button" data-action="cancel-manual-round">Скасувати</button>
        <button type="button" data-action="create-manual-round">Створити тур</button>
      </div>
    </div>
    <div class="manual-pairing-grid">${rows}</div>
    ${byeSelect}`;
}

function buildManualPlayerOptions() {
  return [...state.currentTournament.players]
    .sort((a, b) => a.name.localeCompare(b.name, "uk"))
    .map((player) => `<option value="${escapeHtml(player.id)}">${escapeHtml(player.name)}</option>`)
    .join("");
}

function buildPairResultButton(roundIdx, board, currentResult, nextResult, label, title, disabled) {
  const active = currentResult === nextResult;
  return `
    <button
      type="button"
      class="result-btn ${active ? "active" : ""}"
      data-action="set-pair-result"
      data-round-idx="${roundIdx}"
      data-board="${board}"
      data-current="${currentResult}"
      data-result-value="${nextResult}"
      title="${escapeHtml(title)}"
      aria-pressed="${active ? "true" : "false"}"
      ${disabled ? "disabled" : ""}
    >${label}</button>
  `;
}

function buildMicromatchGameButton(roundIdx, board, gameIndex, currentValue, nextResult, label, title, disabled) {
  const active = currentValue === nextResult;
  return `
    <button
      type="button"
      class="result-btn ${active ? "active" : ""}"
      data-action="set-pair-game-result"
      data-round-idx="${roundIdx}"
      data-board="${board}"
      data-game-index="${gameIndex}"
      data-current="${currentValue}"
      data-result-value="${nextResult}"
      title="${escapeHtml(title)}"
      aria-pressed="${active ? "true" : "false"}"
      ${disabled ? "disabled" : ""}
    >${label}</button>
  `;
}

function resolvePairResultClass(result) {
  if (result === "1-0") {
    return "result-win";
  }
  if (result === "0.5-0.5") {
    return "result-draw";
  }
  if (result === "0-1") {
    return "result-loss";
  }
  return "";
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
          ? pair.isMicromatch && Number.isFinite(Number(pair.smallPointsWhite)) && Number.isFinite(Number(pair.smallPointsBlack))
            ? `${pair.result} | малі ${pair.smallPointsWhite}:${pair.smallPointsBlack}`
            : pair.result
          : black ? "—" : `BYE (${getTournamentByeBigPoints(t).toFixed(1)})`;

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
  const tieGroups = getScoreTieGroupsForDisplay(t);
  const manualHint =
    t.status === "active" && tieGroups.length > 0
      ? '<div class="manual-place-hint">Є гравці з однаковими очками. У колонці "Місце" оберіть підсумкові місця перед завершенням турніру.</div>'
      : "";
  els.standings.innerHTML = `${manualHint}${buildStandingsTableHtml(t, { showRoundDetails })}`;
}

function buildStandingsTableHtml(tournament, options = {}) {
  const { showRoundDetails = true } = options;
  ensureStartNumbers(tournament);
  const primaryMetric = tournament.isMicromatch && tournament.scoreCalculationType === "small_points" ? "smallPoints" : "score";
  const scoreLabel = primaryMetric === "smallPoints" ? "Малі очки" : "Очки";
  const tieColumns = getStandingsTieColumns(tournament, primaryMetric);

  const enriched = getStandings(tournament);
  const placeById = Object.fromEntries(enriched.map((p, idx) => [p.id, idx + 1]));
  const tieRangeById = new Map();
  let cursor = 1;
  let i = 0;
  while (i < enriched.length) {
    const scoreKey = Number(enriched[i][primaryMetric]).toFixed(4);
    let j = i;
    while (j < enriched.length && Number(enriched[j][primaryMetric]).toFixed(4) === scoreKey) {
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
        <td>${buildStandingsPlayerCell(tournament, p)}</td>
        <td>${p.rating}</td>
        ${showRoundDetails ? buildRoundCells(tournament, p, placeById) : ""}
        <td>${Number(p[primaryMetric] || 0).toFixed(1)}</td>
        ${tieColumns.map((col) => `<td>${col.render(p)}</td>`).join("")}
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
          <th>${scoreLabel}</th>
          ${tieColumns.map((col) => `<th>${col.label}</th>`).join("")}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function getStandingsTieColumns(tournament, primaryMetric) {
  const columns = [];

  if (tournament.isMicromatch && primaryMetric === "score") {
    columns.push({
      key: "small_points_auto",
      label: "Малі очки",
      render: (player) => Number(player.smallPoints || 0).toFixed(1),
    });
  }

  const criteria = normalizeTieBreakOrder(tournament.tieBreakOrder, { fillDefaults: false }).filter((x) => x !== "none");
  for (const criterion of criteria) {
    const column = getTieColumnByCriterion(criterion);
    if (!column) {
      continue;
    }
    if (columns.some((item) => item.key === column.key)) {
      continue;
    }
    columns.push(column);
  }

  return columns;
}

function getTieColumnByCriterion(criterion) {
  if (criterion === "head_to_head") {
    return {
      key: "h2h",
      label: "H2H",
      render: (player) => Number(player.h2h || 0).toFixed(1),
    };
  }
  if (criterion === "wins") {
    return {
      key: "wins",
      label: "Wins",
      render: (player) => String(Number(player.wins || 0)),
    };
  }
  if (criterion === "buchholz") {
    return {
      key: "buchholz",
      label: "Buchholz",
      render: (player) => Number(player.buchholz || 0).toFixed(1),
    };
  }
  if (criterion === "solk_plus") {
    return {
      key: "solk_plus",
      label: "SOLK+",
      render: (player) => Number(player.solkPlus || 0).toFixed(1),
    };
  }
  if (criterion === "tsolk") {
    return {
      key: "tsolk",
      label: "TSOLK",
      render: (player) => Number(player.tsolk || 0).toFixed(1),
    };
  }
  if (criterion === "sb") {
    return {
      key: "sb",
      label: "SB",
      render: (player) => Number(player.sb || 0).toFixed(2),
    };
  }
  if (criterion === "rating") {
    return {
      key: "rating_tiebreak",
      label: "Рейтинг (ТБ)",
      render: (player) => String(Number(player.rating || 0)),
    };
  }
  return null;
}

function buildPlaceCell(tournament, player, computedPlace, showRoundDetails, tieRange) {
  const manualEditable = showRoundDetails && tournament.status === "active" && tieRange && tieRange.size > 1;
  if (!manualEditable) {
    return String(computedPlace);
  }

  const selectedValue =
    Number.isInteger(player.manualPlace) && player.manualPlace >= tieRange.start && player.manualPlace <= tieRange.end
      ? String(player.manualPlace)
      : "";
  const options = [`<option value="">Авто (${computedPlace})</option>`];
  for (let place = tieRange.start; place <= tieRange.end; place += 1) {
    options.push(`<option value="${place}" ${selectedValue === String(place) ? "selected" : ""}>${place}</option>`);
  }

  return `<div class="place-edit">
    <select data-action="set-manual-place" data-player-id="${player.id}" aria-label="Виставити місце для ${escapeHtml(player.name)}">
      ${options.join("")}
    </select>
  </div>`;
}

function getScoreTieGroupsForDisplay(tournament) {
  const standings = getStandings(tournament);
  const byId = new Map(standings.map((player) => [player.id, player]));
  const primaryMetric = tournament.isMicromatch && tournament.scoreCalculationType === "small_points" ? "smallPoints" : "score";
  const grouped = new Map();
  for (const player of tournament.players || []) {
    const enrichedPlayer = byId.get(player.id) || player;
    const key = Number(enrichedPlayer[primaryMetric] || 0).toFixed(4);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(player);
  }

  const scoreKeys = [...grouped.keys()].sort((a, b) => Number(b) - Number(a));
  let cursor = 1;
  const groups = [];
  for (const key of scoreKeys) {
    const players = grouped.get(key) || [];
    const start = cursor;
    const end = cursor + players.length - 1;
    if (players.length > 1) {
      groups.push({ score: Number(key), start, end, players });
    }
    cursor = end + 1;
  }

  return groups;
}

function buildStandingsPlayerCell(tournament, player) {
  const photoDataUrl = getTournamentPlayerPhotoDataUrl(player);
  const name = escapeHtml(player.name);
  const media = photoDataUrl
    ? `<img class="standings-player__avatar" src="${photoDataUrl}" alt="${name}" />`
    : '<span class="standings-player__placeholder">Фото</span>';

  return `<div class="standings-player">${media}<span class="standings-player__name">${name}</span></div>`;
}

function getTournamentPlayerPhotoDataUrl(player) {
  if (player.photoDataUrl) {
    return player.photoDataUrl;
  }

  if (player.basePlayerId) {
    const base = state.playerBase.find((bp) => bp.id === player.basePlayerId);
    if (base?.photoDataUrl) {
      return base.photoDataUrl;
    }
  }

  const byName = state.playerBase.find((bp) => getBaseFullName(bp).toLowerCase() === String(player.name || "").toLowerCase());
  return byName?.photoDataUrl || null;
}

function renderBasePlayersTab() {
  renderBasePlayerOwnershipSelectors(editingBasePlayerId ? state.playerBase.find((p) => p.id === editingBasePlayerId) : null);
  renderBasePlayersClubFilter();
  const filteredPlayers = filterBasePlayers(state.playerBase);
  const sortedPlayers = sortBasePlayers(filteredPlayers);
  const totalPlayers = state.playerBase.length;
  const filtersActive =
    Boolean(String(els.basePlayersSearch.value || "").trim()) ||
    els.basePlayersGenderFilter.value !== "all" ||
    els.basePlayersRatingFrom.value !== "" ||
    els.basePlayersRatingTo.value !== "" ||
    els.basePlayersClubFilter.value !== "all";
  els.basePlayersSummary.textContent = `Показано ${sortedPlayers.length} з ${totalPlayers} гравців${filtersActive ? " за фільтром" : ""}.`;
  const rows = sortedPlayers
    .map((p) => {
      return `
      <tr>
        <td>
          <div class="row-actions">
            <button class="icon-btn" type="button" title="Редагувати" aria-label="Редагувати" data-action="edit-base-player" data-player-id="${p.id}">✎</button>
            <button class="icon-btn" type="button" title="Профіль і статистика" aria-label="Профіль і статистика" data-action="view-base-profile" data-player-id="${p.id}">📊</button>
            <button class="icon-btn danger" type="button" title="Видалити" aria-label="Видалити" data-action="delete-base-player" data-player-id="${p.id}">🗑</button>
          </div>
        </td>
        <td>${p.photoDataUrl ? `<img class="avatar" src="${p.photoDataUrl}" alt="${escapeHtml(getBaseFullName(p))}" />` : '<span class="avatar-placeholder">Фото</span>'}</td>
        <td class="player-name-cell">${escapeHtml(getBaseFullName(p))}</td>
        <td>${formatGenderLabel(p.gender)}</td>
        <td>${escapeHtml(getClubName(p.clubId) || "Без клубу")}</td>
        <td>${escapeHtml(getCoachName(p.coachId) || "-")}</td>
        <td>${p.rating}</td>
        <td>${escapeHtml(p.rank || "б/р")}</td>
        <td>${p.birthDate || "-"}</td>
        <td>${p.stats.tournaments}</td>
        <td>${p.stats.games}</td>
        <td>${p.stats.wins}/${p.stats.draws}/${p.stats.losses}</td>
        <td>${p.stats.totalScore.toFixed(1)}</td>
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
          <th>Дії</th>
          <th>${head("Фото", "photo")}</th>
          <th>${head("Гравець", "name")}</th>
          <th>${head("Стать", "gender")}</th>
          <th>${head("Клуб", "club")}</th>
          <th>${head("Тренер", "coach")}</th>
          <th>${head("Рейт.", "rating")}</th>
          <th>${head("Звання", "rank")}</th>
          <th>${head("Дата нар.", "birthDate")}</th>
          <th>${head("Турніри", "tournaments")}</th>
          <th>${head("Партії", "games")}</th>
          <th>${head("W/D/L", "wdl")}</th>
          <th>${head("Очки", "score")}</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="13">База порожня.</td></tr>'}</tbody>
    </table>`;
}

function renderBasePlayerOwnershipSelectors(basePlayer) {
  if (!els.basePlayerClub || !els.basePlayerCoach) {
    return;
  }

  const selectedClubId = normalizeEntityId(basePlayer?.clubId || els.basePlayerClub.value);
  const selectedCoachId = normalizeEntityId(basePlayer?.coachId || els.basePlayerCoach.value);
  els.basePlayerClub.innerHTML = [
    '<option value="">Без клубу</option>',
    ...state.clubs
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "uk"))
      .map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`),
  ].join("");
  els.basePlayerClub.value = selectedClubId;

  const coaches = state.coaches
    .filter((coach) => !selectedClubId || coach.clubId === selectedClubId)
    .slice()
    .sort((a, b) => getCoachFullName(a).localeCompare(getCoachFullName(b), "uk"));
  els.basePlayerCoach.innerHTML = [
    '<option value="">Без тренера</option>',
    ...coaches.map((coach) => `<option value="${escapeHtml(coach.id)}">${escapeHtml(getCoachFullName(coach))}</option>`),
  ].join("");
  els.basePlayerCoach.value = coaches.some((coach) => coach.id === selectedCoachId) ? selectedCoachId : "";
}

function renderBasePlayersClubFilter() {
  if (!els.basePlayersClubFilter) {
    return;
  }

  const current = els.basePlayersClubFilter.value || "all";
  els.basePlayersClubFilter.innerHTML = [
    '<option value="all">Усі клуби</option>',
    '<option value="none">Без клубу</option>',
    ...state.clubs
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "uk"))
      .map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`),
  ].join("");
  els.basePlayersClubFilter.value = [...els.basePlayersClubFilter.options].some((option) => option.value === current)
    ? current
    : "all";
}

function filterBasePlayers(players) {
  const query = String(els.basePlayersSearch.value || "").trim().toLowerCase();
  const genderFilter = els.basePlayersGenderFilter.value;
  const ratingFrom = Number(els.basePlayersRatingFrom.value);
  const ratingTo = Number(els.basePlayersRatingTo.value);
  const hasRatingFrom = Number.isFinite(ratingFrom) && els.basePlayersRatingFrom.value !== "";
  const hasRatingTo = Number.isFinite(ratingTo) && els.basePlayersRatingTo.value !== "";
  const clubFilter = els.basePlayersClubFilter.value || "all";

  return players.filter((player) => {
    const searchText =
      `${player.lastName || ""} ${player.firstName || ""} ${player.firstName || ""} ${player.lastName || ""} ${getClubName(player.clubId)} ${getCoachName(player.coachId)}`.toLowerCase();
    if (query && !searchText.includes(query)) {
      return false;
    }

    if (genderFilter !== "all" && normalizeGender(player.gender) !== genderFilter) {
      return false;
    }

    if (hasRatingFrom && Number(player.rating) < ratingFrom) {
      return false;
    }

    if (hasRatingTo && Number(player.rating) > ratingTo) {
      return false;
    }

    if (clubFilter === "none" && player.clubId) {
      return false;
    }

    if (clubFilter !== "all" && clubFilter !== "none" && player.clubId !== clubFilter) {
      return false;
    }

    return true;
  });
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
      if (key === "photo") {
        cmp = (a.photoDataUrl ? 1 : 0) - (b.photoDataUrl ? 1 : 0);
      } else if (key === "name") {
        cmp = compareText(getBaseFullName(a), getBaseFullName(b));
      } else if (key === "gender") {
        cmp = compareText(normalizeGender(a.gender), normalizeGender(b.gender));
      } else if (key === "club") {
        cmp = compareText(getClubName(a.clubId) || "яяя", getClubName(b.clubId) || "яяя");
      } else if (key === "coach") {
        cmp = compareText(getCoachName(a.coachId) || "яяя", getCoachName(b.coachId) || "яяя");
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

function formatGenderLabel(value) {
  if (value === "M") {
    return "М";
  }
  if (value === "F") {
    return "Ж";
  }
  return "-";
}

function renderClubsTab() {
  renderCoachClubSelector();
  if (!els.clubsList || !els.clubProfile) {
    return;
  }
  renderClubsSubtabs();

  const clubs = state.clubs.slice().sort((a, b) => a.name.localeCompare(b.name, "uk"));
  if (!selectedClubProfileId && clubs.length) {
    selectedClubProfileId = clubs[0].id;
  }
  if (selectedClubProfileId && !state.clubs.some((club) => club.id === selectedClubProfileId)) {
    selectedClubProfileId = clubs[0]?.id || null;
  }

  if (!clubs.length) {
    els.clubsList.innerHTML = '<div class="club-card">Клубів поки немає. Натисніть "Додати клуб".</div>';
    els.clubProfile.innerHTML = renderIndependentPlayersBlock();
    if (selectedClubsView === "profile") {
      selectedClubsView = "directory";
      renderClubsSubtabs();
    }
    return;
  }

  els.clubsList.innerHTML = clubs
    .map((club) => {
      const playersCount = state.playerBase.filter((player) => player.clubId === club.id).length;
      const coachesCount = state.coaches.filter((coach) => coach.clubId === club.id).length;
      const active = club.id === selectedClubProfileId ? " active" : "";
      const logo = club.logoDataUrl
        ? `<img class="club-card__logo" src="${club.logoDataUrl}" alt="${escapeHtml(club.name)}" />`
        : '<span class="club-card__logo club-card__logo--empty">Лого</span>';
      const description = String(club.description || "").trim();
      const descriptionHtml = description
        ? `<div class="club-card__desc">${escapeHtml(description)}</div>`
        : '<div class="club-card__desc club-card__desc--empty">Опис клубу ще не додано.</div>';
      return `
        <article class="club-card${active}">
          <div class="club-card__top">
            ${logo}
            <div>
              <div class="club-card__title">${escapeHtml(club.name)}</div>
              <div class="club-card__meta">${escapeHtml(club.city || "місто не вказано")}</div>
            </div>
          </div>
          <div class="club-card__stats">${coachesCount} тренерів | ${playersCount} гравців</div>
          ${descriptionHtml}
          <div class="row-actions">
            <button type="button" data-action="view-club" data-club-id="${club.id}">Відкрити</button>
            <button type="button" data-action="edit-club" data-club-id="${club.id}">Редагувати</button>
            <button type="button" class="danger" data-action="delete-club" data-club-id="${club.id}">Видалити</button>
          </div>
        </article>`;
    })
    .join("");

  els.clubProfile.innerHTML = renderClubProfileSwitcher(clubs) + renderClubProfile(selectedClubProfileId) + renderIndependentPlayersBlock();
  if (selectedClubDetailTab !== "players") {
    for (const profileCard of els.clubProfile.querySelectorAll(".player-profile-shell")) {
      profileCard.remove();
    }
  }
}

function renderClubsSubtabs() {
  const activeView = ["manage", "directory", "profile"].includes(selectedClubsView) ? selectedClubsView : "directory";
  selectedClubsView = activeView;

  if (els.clubsSubtabs) {
    for (const btn of els.clubsSubtabs.querySelectorAll(".subtab-btn[data-club-view]")) {
      btn.classList.toggle("active", btn.dataset.clubView === activeView);
    }
  }

  if (els.clubsViewPanels) {
    for (const panel of els.clubsViewPanels) {
      panel.classList.toggle("tour-view-hidden", panel.dataset.clubView !== activeView);
    }
  }
}

function renderCoachClubSelector() {
  if (!els.coachClub) {
    return;
  }
  const current = els.coachClub.value || "";
  els.coachClub.innerHTML = [
    '<option value="">Оберіть клуб</option>',
    ...state.clubs
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "uk"))
      .map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`),
  ].join("");
  els.coachClub.value = state.clubs.some((club) => club.id === current) ? current : "";
}

function renderClubProfileSwitcher(clubs) {
  if (clubs.length <= 1) {
    return "";
  }

  const items = clubs
    .map((club) => {
      const playersCount = state.playerBase.filter((player) => player.clubId === club.id).length;
      const coachesCount = state.coaches.filter((coach) => coach.clubId === club.id).length;
      const active = club.id === selectedClubProfileId ? " active" : "";
      const logo = club.logoDataUrl
        ? `<img class="club-profile-switcher__logo" src="${club.logoDataUrl}" alt="${escapeHtml(club.name)}" />`
        : '<span class="club-profile-switcher__logo club-profile-switcher__logo--empty">Лого</span>';

      return `
        <button type="button" class="club-profile-switcher__item${active}" data-action="select-club-profile" data-club-id="${club.id}">
          ${logo}
          <span>
            <strong>${escapeHtml(club.name)}</strong>
            <small>${coachesCount} тренерів | ${playersCount} гравців</small>
          </span>
        </button>`;
    })
    .join("");

  return `
    <div class="club-profile-switcher">
      <div class="club-profile-switcher__title">Обрати клуб</div>
      <div class="club-profile-switcher__list">${items}</div>
    </div>`;
}

function renderClubProfile(clubId) {
  const club = state.clubs.find((item) => item.id === clubId);
  if (!club) {
    return "";
  }

  const coaches = state.coaches.filter((coach) => coach.clubId === club.id);
  const players = state.playerBase
    .filter((player) => player.clubId === club.id)
    .slice()
    .sort((a, b) => b.rating - a.rating || getBaseFullName(a).localeCompare(getBaseFullName(b), "uk"));
  const coachesText = coaches.length
    ? coaches.map((coach) => `${escapeHtml(getCoachFullName(coach))}${coach.phone ? ` (${escapeHtml(coach.phone)})` : ""}`).join(", ")
    : "тренерів ще не додано";
  const descriptionHtml = club.description
    ? `<div class="club-profile-info">${escapeHtml(club.description)}</div>`
    : '<div class="club-profile-info club-profile-info--empty">Інфо про клуб ще не додано.</div>';
  const logo = club.logoDataUrl
    ? `<img class="club-profile-logo" src="${club.logoDataUrl}" alt="${escapeHtml(club.name)}" />`
    : '<span class="club-profile-logo club-profile-logo--empty">Лого</span>';
  const tabs = [
    { key: "profile", label: "Профіль" },
    { key: "players", label: "Гравці" },
    { key: "coaches", label: "Тренери" },
  ];
  const activeTab = tabs.some((tab) => tab.key === selectedClubDetailTab) ? selectedClubDetailTab : "profile";
  if (activeTab !== "players" && selectedClubPlayerProfileId) {
    selectedClubPlayerProfileId = null;
    selectedClubPlayerProfileTab = "info";
  }
  const tabButtons = tabs
    .map(
      (tab) =>
        `<button type="button" class="subtab-btn${activeTab === tab.key ? " active" : ""}" data-action="set-club-detail-tab" data-tab="${tab.key}">${tab.label}</button>`
    )
    .join("");
  const selectedClubPlayer =
    activeTab === "players" ? players.find((player) => player.id === selectedClubPlayerProfileId) || null : null;
  const selectedClubPlayerProfileCard = selectedClubPlayer ? renderClubPlayerProfileCard(selectedClubPlayer.id) : "";
  const playerAddToggleButtonLabel = showClubPlayerAddForms ? "Сховати додавання гравця" : "Додати гравця";
  const coachAddToggleButtonLabel = showClubCoachAddForm ? "Сховати додавання тренера" : "Додати тренера";
  const tabContent =
    activeTab === "players"
      ? `
      <div class="row-actions">
        <button type="button" data-action="toggle-club-player-add">${playerAddToggleButtonLabel}</button>
      </div>
      ${
        showClubPlayerAddForms
          ? `<div class="club-management-grid">
        ${renderAttachExistingPlayerForm(club, coaches)}
        ${renderQuickClubPlayerForm(club, coaches)}
      </div>`
          : ""
      }
      ${renderClubPlayersTable(players)}
      ${selectedClubPlayerProfileCard}`
      : activeTab === "coaches"
        ? `
      <div class="row-actions">
        <button type="button" data-action="toggle-club-coach-add">${coachAddToggleButtonLabel}</button>
      </div>
      ${
        showClubCoachAddForm
          ? `<div class="club-management-grid">
        ${renderQuickClubCoachForm(club)}
        ${renderClubCoachesTable(coaches)}
      </div>`
          : `${renderClubCoachesTable(coaches)}`
      }`
        : `
      <section class="club-profile-card">
        <div class="club-profile-head">
          <div class="club-profile-title">
            ${logo}
            <div>
              <h3>${escapeHtml(club.name)}</h3>
              <div class="meta">${escapeHtml(club.city || "місто не вказано")} | ${escapeHtml(club.contact || "контакти не вказані")}</div>
              <div class="meta">Тренери: ${coachesText}</div>
            </div>
          </div>
          <div class="row-actions">
            <strong>${players.length} гравців</strong>
            <button type="button" data-action="edit-club" data-club-id="${club.id}">Редагувати</button>
          </div>
        </div>
        <div class="player-stat-grid">
          <article class="player-stat-card"><div class="meta">Гравців</div><strong>${players.length}</strong></article>
          <article class="player-stat-card"><div class="meta">Тренерів</div><strong>${coaches.length}</strong></article>
          <article class="player-stat-card"><div class="meta">Місто</div><strong>${escapeHtml(club.city || "-")}</strong></article>
          <article class="player-stat-card"><div class="meta">Контакти</div><strong>${escapeHtml(club.contact || "-")}</strong></article>
        </div>
        <div class="club-profile-info-block">
          <div class="quick-player-form__title">Інфо</div>
          ${descriptionHtml}
        </div>
      </section>`;

  return `
    <section class="club-profile-card">
      <div class="subtabs subtabs--nested">${tabButtons}</div>
      ${tabContent}
    </section>`;
}

function renderAttachExistingPlayerForm(club, coaches) {
  const candidates = state.playerBase
    .filter((player) => player.clubId !== club.id)
    .slice()
    .sort((a, b) => getBaseFullName(a).localeCompare(getBaseFullName(b), "uk"));
  const coachOptions = buildCoachOptions(coaches);

  if (!candidates.length) {
    return `
      <div class="club-action-panel">
        <div class="quick-player-form__title">Існуючі гравці</div>
        <div class="club-empty">Усі гравці з бази вже привʼязані до цього клубу.</div>
      </div>`;
  }

  const playerOptions = candidates
    .map((player) => {
      const currentClub = getClubName(player.clubId) || "Без клубу";
      return `<option value="${escapeHtml(player.id)}">${escapeHtml(getBaseFullName(player))} | ${player.rating} | ${escapeHtml(currentClub)}</option>`;
    })
    .join("");

  return `
    <form class="club-action-panel" data-action="attach-existing-player" data-club-id="${club.id}">
      <div class="quick-player-form__title">Привʼязати існуючого гравця</div>
      <select name="existingPlayerId" required>
        <option value="">Оберіть гравця з бази</option>
        ${playerOptions}
      </select>
      <select name="coachId">${coachOptions}</select>
      <button type="submit">Додати в клуб</button>
    </form>`;
}

function renderQuickClubPlayerForm(club, coaches) {
  const coachOptions = buildCoachOptions(coaches);
  const rankOptions = ["б/р", "юнацький", "3", "2", "1", "кмс", "мс", "гр"]
    .map((rank) => `<option value="${escapeHtml(rank)}">${escapeHtml(rank)}</option>`)
    .join("");

  return `
    <form class="club-action-panel quick-player-form" data-action="quick-add-club-player" data-club-id="${club.id}">
      <div class="quick-player-form__title">Створити нового гравця</div>
      <input name="lastName" type="text" placeholder="Прізвище" required />
      <input name="firstName" type="text" placeholder="Ім'я" required />
      <input name="rating" type="number" min="0" max="4000" placeholder="Рейтинг" required />
      <select name="gender">
        <option value="">Стать</option>
        <option value="M">М</option>
        <option value="F">Ж</option>
      </select>
      <select name="rank">${rankOptions}</select>
      <input name="birthDate" type="date" />
      <select name="coachId">${coachOptions}</select>
      <input name="photo" type="file" accept="image/*" />
      <button type="submit">Додати</button>
    </form>`;
}

function renderQuickClubCoachForm(club) {
  return `
    <form class="club-action-panel" data-action="quick-add-club-coach" data-club-id="${club.id}">
      <div class="quick-player-form__title">Додати тренера в клуб</div>
      <input name="lastName" type="text" placeholder="Прізвище" required />
      <input name="firstName" type="text" placeholder="Ім'я" required />
      <input name="phone" type="text" placeholder="+380..." />
      <input name="email" type="email" placeholder="coach@example.com" />
      <input name="photo" type="file" accept="image/*" />
      <textarea name="bio" rows="3" placeholder="Коротко про тренера"></textarea>
      <button type="submit">Додати тренера</button>
    </form>`;
}

function renderClubCoachesTable(coaches) {
  if (!coaches.length) {
    return `
      <div class="club-action-panel">
        <div class="quick-player-form__title">Список тренерів</div>
        <div class="club-empty">Тренерів у цьому клубі поки немає.</div>
      </div>`;
  }

  const rows = coaches
    .slice()
    .sort((a, b) => getCoachFullName(a).localeCompare(getCoachFullName(b), "uk"))
    .map(
      (coach) => `
      <tr>
        <td>${coach.photoDataUrl ? `<img class="avatar" src="${coach.photoDataUrl}" alt="${escapeHtml(getCoachFullName(coach))}" />` : '<span class="avatar-placeholder">Фото</span>'}</td>
        <td>${escapeHtml(getCoachFullName(coach))}</td>
        <td>${escapeHtml(coach.phone || "-")}</td>
        <td>${escapeHtml(coach.email || "-")}</td>
        <td class="wrap-cell">${escapeHtml(coach.bio || "-")}</td>
        <td><button type="button" data-action="edit-club-coach" data-coach-id="${coach.id}">Редагувати</button></td>
      </tr>`
    )
    .join("");

  return `
    <div class="scroll">
      <table class="table">
        <thead><tr><th>Фото</th><th>Тренер</th><th>Телефон</th><th>Email</th><th>Інфо</th><th>Дії</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function buildCoachOptions(coaches) {
  return [
    '<option value="">Без тренера</option>',
    ...coaches
      .slice()
      .sort((a, b) => getCoachFullName(a).localeCompare(getCoachFullName(b), "uk"))
      .map((coach) => `<option value="${escapeHtml(coach.id)}">${escapeHtml(getCoachFullName(coach))}</option>`),
  ].join("");
}

function renderIndependentPlayersBlock() {
  const players = state.playerBase
    .filter((player) => !player.clubId)
    .slice()
    .sort((a, b) => b.rating - a.rating || getBaseFullName(a).localeCompare(getBaseFullName(b), "uk"));
  if (!players.length) {
    return "";
  }

  return `
    <section class="club-profile-card">
      <div class="club-profile-head">
        <div>
          <h3>Незалежні гравці</h3>
          <div class="meta">Гравці без клубу також можуть брати участь у турнірах.</div>
        </div>
        <strong>${players.length} гравців</strong>
      </div>
      ${renderClubPlayersTable(players, { compactActions: true })}
    </section>`;
}

function renderClubPlayersTable(players, options = {}) {
  const { compactActions = false } = options;
  if (!players.length) {
    return '<div class="club-empty">У цьому клубі поки немає гравців.</div>';
  }

  const rows = players
    .map((player) => {
      const coachName = getCoachName(player.coachId) || "-";
      const stats = player.stats || emptyStats();
      return `
        <tr>
          <td>${player.photoDataUrl ? `<img class="avatar" src="${player.photoDataUrl}" alt="${escapeHtml(getBaseFullName(player))}" />` : '<span class="avatar-placeholder">Фото</span>'}</td>
          <td class="player-name-cell">${escapeHtml(getBaseFullName(player))}</td>
          <td>${formatGenderLabel(player.gender)}</td>
          <td>${player.rating}</td>
          <td>${escapeHtml(player.rank || "б/р")}</td>
          <td>${escapeHtml(coachName)}</td>
          <td>${stats.tournaments}</td>
          <td>${stats.games}</td>
          <td>${stats.wins}/${stats.draws}/${stats.losses}</td>
          <td>
            <div class="row-actions">
              <button type="button" data-action="view-player-profile" data-player-id="${player.id}">Профіль</button>
              <button type="button" data-action="edit-club-player" data-player-id="${player.id}">Ред.</button>
              <button type="button" data-action="add-to-tournament" data-player-id="${player.id}">У турнір</button>
              ${
                player.clubId && !compactActions
                  ? `<button type="button" class="danger" data-action="remove-player-from-club" data-player-id="${player.id}">Відвʼязати</button>`
                  : ""
              }
            </div>
          </td>
        </tr>`;
    })
    .join("");

  return `
    <div class="scroll">
      <table class="table">
        <thead>
          <tr>
            <th>Фото</th>
            <th>Гравець</th>
            <th>Стать</th>
            <th>Рейт.</th>
            <th>Звання</th>
            <th>Тренер</th>
            <th>Турніри</th>
            <th>Партії</th>
            <th>W/D/L</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderClubPlayerProfileCard(playerId) {
  const player = state.playerBase.find((item) => item.id === playerId);
  if (!player) {
    return "";
  }

  const tabs = [
    { key: "info", label: "INFO" },
    { key: "skill", label: "Skill" },
    { key: "ranking", label: "Ranking" },
    { key: "matches", label: "Matches" },
    { key: "opponents", label: "Opponents" },
    { key: "events", label: "Events" },
    { key: "memberships", label: "Memberships" },
  ];
  const activeTab = tabs.some((tab) => tab.key === selectedClubPlayerProfileTab) ? selectedClubPlayerProfileTab : "info";
  const stats = player.stats || emptyStats();
  const history = Array.isArray(player.history) ? player.history.slice().sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt)) : [];
  const matches = collectArchivedMatchesForPlayer(player.id);
  const opponents = buildOpponentStatsFromMatches(matches);
  const ratingSeries = buildPlayerRatingSeries(history, player.rating);
  const bestRating = ratingSeries.reduce((max, x) => (x.rating > max ? x.rating : max), Math.round(Number(player.rating) || 0));
  const worstRating = ratingSeries.reduce((min, x) => (x.rating < min ? x.rating : min), Math.round(Number(player.rating) || 0));
  const avgDelta =
    history.filter((item) => Number.isFinite(Number(item.ratingDelta))).reduce((sum, item) => sum + Number(item.ratingDelta), 0) /
    Math.max(1, history.filter((item) => Number.isFinite(Number(item.ratingDelta))).length);
  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
  const ratingLabel = Math.round(Number(player.rating) || 0);
  const gaugePercent = Math.max(5, Math.min(100, Math.round((ratingLabel / 3000) * 100)));
  const tabsHtml = tabs
    .map(
      (tab) =>
        `<button type="button" class="player-profile-tab-btn${activeTab === tab.key ? " active" : ""}" data-action="set-player-profile-tab" data-tab="${tab.key}">${tab.label}</button>`
    )
    .join("");
  const formLine = history.slice(0, 5).map((item) => ratingDeltaToFormSymbol(item.ratingDelta)).join(" ");
  const contentHtml = renderPlayerProfileTabContent(activeTab, {
    player,
    stats,
    history,
    matches,
    opponents,
    ratingSeries,
    bestRating,
    worstRating,
    avgDelta,
    winRate,
  });

  return `
    <section class="club-profile-card player-profile-shell">
      <div class="player-profile-tabbar">${tabsHtml}</div>
      <div class="player-profile-breadcrumb">${escapeHtml(getBaseFullName(player))} > ${activeTab.toUpperCase()}</div>
      <div class="player-profile-hero">
        <div class="player-profile-head">
          ${
            player.photoDataUrl
              ? `<img class="player-profile-photo player-profile-photo--xl" src="${player.photoDataUrl}" alt="${escapeHtml(getBaseFullName(player))}" />`
              : '<span class="player-profile-photo player-profile-photo--empty player-profile-photo--xl">Фото</span>'
          }
          <div>
            <h3>${escapeHtml(getBaseFullName(player))}</h3>
            <div class="meta">Клуб: ${escapeHtml(getClubName(player.clubId) || "Без клубу")} | Тренер: ${escapeHtml(getCoachName(player.coachId) || "-")}</div>
            <div class="meta">Стать: ${formatGenderLabel(player.gender)} | Дата нар.: ${escapeHtml(player.birthDate || "-")} | Звання: ${escapeHtml(player.rank || "б/р")}</div>
            <div class="player-profile-stats">
              <span>Рейтинг: <strong>${ratingLabel}</strong></span>
              <span>Турніри: <strong>${stats.tournaments}</strong></span>
              <span>Партії: <strong>${stats.games}</strong></span>
              <span>W/D/L: <strong>${stats.wins}/${stats.draws}/${stats.losses}</strong></span>
              <span>Форма: <strong>${escapeHtml(formLine || "-")}</strong></span>
            </div>
          </div>
        </div>
        <div class="player-skill-panel">
          <div class="player-skill-ring" style="--value:${gaugePercent}%;">
            <span>${ratingLabel}</span>
          </div>
          <div class="meta">Внутрішній рейтинг платформи</div>
        </div>
      </div>
      ${contentHtml}
    </section>`;
}

function renderPlayerProfileTabContent(tab, model) {
  if (tab === "skill") {
    return renderPlayerProfileSkillTab(model);
  }
  if (tab === "ranking") {
    return renderPlayerProfileRankingTab(model);
  }
  if (tab === "matches") {
    return renderPlayerProfileMatchesTab(model);
  }
  if (tab === "opponents") {
    return renderPlayerProfileOpponentsTab(model);
  }
  if (tab === "events") {
    return renderPlayerProfileEventsTab(model);
  }
  if (tab === "memberships") {
    return renderPlayerProfileMembershipsTab(model);
  }
  return renderPlayerProfileInfoTab(model);
}

function renderPlayerProfileInfoTab(model) {
  const { player, stats, bestRating, worstRating, avgDelta, winRate, ratingSeries } = model;
  const recentSeries = ratingSeries.slice(-16);
  const chartPath = buildSimpleSparklinePath(recentSeries);
  return `
    <div class="player-profile-content">
      <section class="player-stat-grid">
        <article class="player-stat-card"><div class="meta">Поточний рейтинг</div><strong>${Math.round(Number(player.rating) || 0)}</strong></article>
        <article class="player-stat-card"><div class="meta">Найвищий</div><strong>${bestRating}</strong></article>
        <article class="player-stat-card"><div class="meta">Найнижчий</div><strong>${worstRating}</strong></article>
        <article class="player-stat-card"><div class="meta">Середня Δ</div><strong>${Number.isFinite(avgDelta) ? `${avgDelta > 0 ? "+" : ""}${avgDelta.toFixed(1)}` : "-"}</strong></article>
        <article class="player-stat-card"><div class="meta">Win rate</div><strong>${winRate}%</strong></article>
        <article class="player-stat-card"><div class="meta">Карʼєра W/D/L</div><strong>${stats.wins}/${stats.draws}/${stats.losses}</strong></article>
      </section>
      <section class="player-chart-card">
        <h4>Динаміка рейтингу</h4>
        <svg viewBox="0 0 320 90" class="player-sparkline" role="img" aria-label="Графік рейтингу">
          <path d="${chartPath}" />
        </svg>
      </section>
    </div>`;
}

function renderPlayerProfileSkillTab(model) {
  const { history, bestRating, worstRating, avgDelta } = model;
  const last = history.slice(0, 12);
  const rows = last
    .map((item) => {
      const delta = Number(item.ratingDelta);
      const deltaText = Number.isFinite(delta) ? `${delta > 0 ? "+" : ""}${delta}` : "-";
      return `<tr><td>${renderTournamentJumpButton(item.tournamentId, item.tournamentName || "-")}</td><td>${formatDate(item.finishedAt)}</td><td>${deltaText}</td><td>${Number(item.ratingAfter) || "-"}</td></tr>`;
    })
    .join("");
  return `
    <div class="player-profile-content">
      <section class="player-stat-grid">
        <article class="player-stat-card"><div class="meta">Найвищий рейтинг</div><strong>${bestRating}</strong></article>
        <article class="player-stat-card"><div class="meta">Найнижчий рейтинг</div><strong>${worstRating}</strong></article>
        <article class="player-stat-card"><div class="meta">Середня зміна за турнір</div><strong>${Number.isFinite(avgDelta) ? `${avgDelta > 0 ? "+" : ""}${avgDelta.toFixed(1)}` : "-"}</strong></article>
      </section>
      <section class="player-table-card">
        <h4>Останні зміни рейтингу</h4>
        ${
          rows
            ? `<div class="scroll"><table class="table"><thead><tr><th>Турнір</th><th>Дата</th><th>Δ</th><th>Новий</th></tr></thead><tbody>${rows}</tbody></table></div>`
            : '<div class="club-empty">Ще немає турнірів для аналізу рейтингу.</div>'
        }
      </section>
    </div>`;
}

function renderPlayerProfileRankingTab(model) {
  const { history } = model;
  const rows = history
    .map((item) => {
      const delta = Number(item.ratingDelta);
      const deltaText = Number.isFinite(delta) ? `${delta > 0 ? "+" : ""}${delta}` : "-";
      return `<tr>
        <td>${formatDate(item.finishedAt)}</td>
        <td>${renderTournamentJumpButton(item.tournamentId, item.tournamentName || "-")}</td>
        <td>${item.place ?? "-"}</td>
        <td>${Number(item.score || 0).toFixed(1)}</td>
        <td>${deltaText}</td>
        <td>${Number(item.ratingAfter) || "-"}</td>
      </tr>`;
    })
    .join("");

  return `
    <div class="player-profile-content">
      <section class="player-table-card">
        <h4>Рейтингова історія</h4>
        ${
          rows
            ? `<div class="scroll"><table class="table"><thead><tr><th>Дата</th><th>Турнір</th><th>Місце</th><th>Очки</th><th>Δ</th><th>Рейтинг</th></tr></thead><tbody>${rows}</tbody></table></div>`
            : '<div class="club-empty">Історії турнірів поки немає.</div>'
        }
      </section>
    </div>`;
}

function renderPlayerProfileMatchesTab(model) {
  const { matches } = model;
  const cards = matches
    .slice(0, 16)
    .map((match) => {
      const badgeClass = match.resultCode === "W" ? "ok" : match.resultCode === "L" ? "bad" : "draw";
      return `
        <article class="match-card-mini">
          <div class="match-card-mini__top">
            ${renderTournamentJumpButton(match.tournamentId, match.tournamentName, "pill pill--link")}
            <span class="match-card-mini__result ${badgeClass}">${match.resultText}</span>
          </div>
          <div><strong>${escapeHtml(match.playerName)}</strong> vs ${escapeHtml(match.opponentName)}</div>
          <div class="meta">${formatDate(match.date)} | тур ${match.round}</div>
        </article>`;
    })
    .join("");
  return `
    <div class="player-profile-content">
      <section class="player-table-card">
        <h4>Останні матчі</h4>
        ${cards ? `<div class="matches-mini-grid">${cards}</div>` : '<div class="club-empty">Матчів поки немає.</div>'}
      </section>
    </div>`;
}

function renderPlayerProfileOpponentsTab(model) {
  const { opponents } = model;
  const cards = opponents
    .slice(0, 16)
    .map(
      (item) => `
      <article class="opponent-mini-card">
        <div class="opponent-mini-card__name">${escapeHtml(item.name)}</div>
        <div class="meta">${item.games} партій</div>
        <div class="meta">W/D/L: ${item.wins}/${item.draws}/${item.losses}</div>
      </article>`
    )
    .join("");
  return `
    <div class="player-profile-content">
      <section class="player-table-card">
        <h4>Найчастіші суперники</h4>
        ${cards ? `<div class="opponents-mini-grid">${cards}</div>` : '<div class="club-empty">Суперників поки немає.</div>'}
      </section>
    </div>`;
}

function renderPlayerProfileEventsTab(model) {
  const { history } = model;
  const rows = history
    .map(
      (item) => `
      <tr>
        <td>${renderTournamentJumpButton(item.tournamentId, item.tournamentName || "-")}</td>
        <td>${item.place ?? "-"}</td>
        <td>${Number(item.score || 0).toFixed(1)}</td>
        <td>${item.wins}/${item.draws}/${item.losses}</td>
        <td>${formatDate(item.finishedAt)}</td>
      </tr>`
    )
    .join("");
  return `
    <div class="player-profile-content">
      <section class="player-table-card">
        <h4>Події (турніри)</h4>
        ${
          rows
            ? `<div class="scroll"><table class="table"><thead><tr><th>Назва</th><th>Місце</th><th>Очки</th><th>W/D/L</th><th>Дата</th></tr></thead><tbody>${rows}</tbody></table></div>`
            : '<div class="club-empty">Турнірів поки немає.</div>'
        }
      </section>
    </div>`;
}

function renderPlayerProfileMembershipsTab(model) {
  const { player } = model;
  return `
    <div class="player-profile-content">
      <section class="player-membership-card">
        <h4>Приналежність</h4>
        <div class="player-membership-grid">
          <div><span class="meta">Клуб</span><strong>${escapeHtml(getClubName(player.clubId) || "Незалежний гравець")}</strong></div>
          <div><span class="meta">Тренер</span><strong>${escapeHtml(getCoachName(player.coachId) || "Не вказано")}</strong></div>
          <div><span class="meta">Стать</span><strong>${formatGenderLabel(player.gender)}</strong></div>
          <div><span class="meta">Звання</span><strong>${escapeHtml(player.rank || "б/р")}</strong></div>
          <div><span class="meta">Дата народження</span><strong>${escapeHtml(player.birthDate || "-")}</strong></div>
        </div>
      </section>
    </div>`;
}

function collectArchivedMatchesForPlayer(basePlayerId) {
  const list = [];

  for (const tournament of state.tournamentsArchive || []) {
    const tournamentPlayer = (tournament.players || []).find(
      (item) => item.basePlayerId === basePlayerId || item.id === basePlayerId
    );
    if (!tournamentPlayer) {
      continue;
    }
    const tournamentPlayerId = tournamentPlayer.id;

    for (const round of tournament.rounds || []) {
      for (const pair of round.pairings || []) {
        if (!pair.blackId) {
          continue;
        }
        if (pair.whiteId !== tournamentPlayerId && pair.blackId !== tournamentPlayerId) {
          continue;
        }
        if (!pair.result || pair.result === "pending") {
          continue;
        }

        const playerIsWhite = pair.whiteId === tournamentPlayerId;
        const opponentId = playerIsWhite ? pair.blackId : pair.whiteId;
        const opponent = tournament.players.find((item) => item.id === opponentId);
        const playerObj = tournament.players.find((item) => item.id === tournamentPlayerId);
        const resultCode = resolveMatchResultCode(pair.result, playerIsWhite);
        list.push({
          tournamentId: tournament.id,
          tournamentName: tournament.name || "Турнір",
          date: tournament.finishedAt || tournament.updatedAt || tournament.createdAt || new Date().toISOString(),
          round: Number(round.round) || 0,
          opponentName: opponent?.name || "Суперник",
          playerName: playerObj?.name || "Гравець",
          resultCode,
          resultText: pair.result,
        });
      }
    }

    if (!list.some((item) => item.tournamentId === tournament.id)) {
      const roundsPlayed = Object.entries(tournamentPlayer.resultsByRound || {});
      for (const [roundKey, resultValue] of roundsPlayed) {
        if (!["W", "D", "L"].includes(resultValue)) {
          continue;
        }

        list.push({
          tournamentId: tournament.id,
          tournamentName: tournament.name || "Турнір",
          date: tournament.finishedAt || tournament.updatedAt || tournament.createdAt || new Date().toISOString(),
          round: Number(roundKey) || 0,
          opponentName: "Суперник",
          playerName: tournamentPlayer.name || "Гравець",
          resultCode: resultValue,
          resultText: resultValue === "W" ? "1-0" : resultValue === "L" ? "0-1" : "0.5-0.5",
        });
      }
    }
  }

  return list.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function resolveMatchResultCode(resultValue, playerIsWhite) {
  if (resultValue === "1-0") {
    return playerIsWhite ? "W" : "L";
  }
  if (resultValue === "0-1") {
    return playerIsWhite ? "L" : "W";
  }
  if (resultValue === "0.5-0.5") {
    return "D";
  }
  return "D";
}

function buildOpponentStatsFromMatches(matches) {
  const map = new Map();

  for (const match of matches) {
    const key = String(match.opponentName || "Суперник");
    if (!map.has(key)) {
      map.set(key, { name: key, games: 0, wins: 0, draws: 0, losses: 0 });
    }
    const item = map.get(key);
    item.games += 1;
    if (match.resultCode === "W") {
      item.wins += 1;
    } else if (match.resultCode === "L") {
      item.losses += 1;
    } else {
      item.draws += 1;
    }
  }

  return [...map.values()].sort((a, b) => b.games - a.games || a.name.localeCompare(b.name, "uk"));
}

function buildPlayerRatingSeries(history, currentRating) {
  const items = history
    .filter((item) => Number.isFinite(Number(item.ratingAfter)))
    .slice()
    .reverse()
    .map((item) => ({
      date: item.finishedAt,
      rating: Math.round(Number(item.ratingAfter) || 0),
    }));

  if (!items.length) {
    return [{ date: new Date().toISOString(), rating: Math.round(Number(currentRating) || 0) }];
  }

  return items;
}

function buildSimpleSparklinePath(points) {
  if (!points.length) {
    return "";
  }

  const width = 320;
  const height = 90;
  const padding = 8;
  const values = points.map((item) => Number(item.rating) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  return points
    .map((point, idx) => {
      const x = padding + idx * step;
      const y = height - padding - ((Number(point.rating) || 0) - min) / span * (height - padding * 2);
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function ratingDeltaToFormSymbol(deltaValue) {
  const delta = Number(deltaValue);
  if (!Number.isFinite(delta)) {
    return "-";
  }
  if (delta > 0) {
    return "W";
  }
  if (delta < 0) {
    return "L";
  }
  return "D";
}

function renderTournamentJumpButton(tournamentId, title, className = "inline-link-btn") {
  const safeTitle = escapeHtml(title || "Турнір");
  const safeId = escapeHtml(String(tournamentId || ""));
  if (!safeId) {
    return safeTitle;
  }
  return `<button type="button" class="${className}" data-action="open-player-tournament" data-tournament-id="${safeId}" title="Відкрити турнір">${safeTitle}</button>`;
}

function renderArchiveTab() {
  if (els.tournamentsSearch) {
    els.tournamentsSearch.value = tournamentsSearchQuery;
  }
  if (els.tournamentsStatusFilter) {
    const nextStatusFilter = ["all", "ongoing", "finished"].includes(tournamentsStatusFilter) ? tournamentsStatusFilter : "all";
    tournamentsStatusFilter = nextStatusFilter;
    els.tournamentsStatusFilter.value = nextStatusFilter;
  }

  const records = [];
  if (isCurrentTournamentMeaningful()) {
    records.push({
      kind: "ongoing",
      tournament: state.currentTournament,
      sortDate: new Date(state.currentTournament.updatedAt || state.currentTournament.createdAt || 0).getTime(),
    });
  }

  for (const tournament of state.tournamentsArchive || []) {
    records.push({
      kind: "finished",
      tournament,
      sortDate: new Date(tournament.finishedAt || tournament.updatedAt || 0).getTime(),
    });
  }

  if (records.length === 0) {
    els.archiveList.innerHTML = '<div class="archive-card">Турнірів поки немає.</div>';
    return;
  }

  const query = tournamentsSearchQuery.toLowerCase();
  const filtered = records
    .filter((entry) => {
      if (tournamentsStatusFilter === "ongoing") {
        return entry.kind === "ongoing";
      }
      if (tournamentsStatusFilter === "finished") {
        return entry.kind === "finished";
      }
      return true;
    })
    .filter((entry) => {
      if (!query) {
        return true;
      }
      const t = entry.tournament;
      const haystack = [
        t.name,
        t.chiefJudge,
        t.timeControl,
        t.eventDate ? formatDateOnly(t.eventDate) : "",
        entry.kind === "ongoing" ? "триває" : "завершено",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => b.sortDate - a.sortDate);

  if (filtered.length === 0) {
    els.archiveList.innerHTML = '<div class="archive-card">За фільтром нічого не знайдено.</div>';
    return;
  }

  const blocks = filtered
    .map((entry) => {
      const t = entry.tournament;
      const standings = getStandings(t).slice(0, 3);
      const top = standings.map((p, i) => `${i + 1}. ${escapeHtml(p.name)} (${p.score.toFixed(1)})`).join(" | ");
      const isFinished = entry.kind === "finished";
      const isOpen = isFinished && state.archivePreviewTournamentId === t.id;
      const statusHtml = isFinished
        ? `Завершено: ${formatDate(t.finishedAt)}`
        : `Триває: оновлено ${formatDate(t.updatedAt || t.createdAt || new Date().toISOString())}`;
      const actionsHtml = isFinished
        ? `
            <button type="button" data-action="open-archive" data-tournament-id="${t.id}">Відкрити</button>
            <button type="button" data-action="print-archive" data-tournament-id="${t.id}">Друк</button>
            <button type="button" data-action="delete-archive" data-tournament-id="${t.id}" class="danger">Видалити</button>`
        : `<button type="button" data-action="open-ongoing" data-tournament-id="${t.id}">Відкрити</button>`;

      return `
      <article class="archive-card">
        <div class="archive-head">
          <strong>${escapeHtml(t.name)}</strong>
          <div class="toolbar">
            ${actionsHtml}
          </div>
        </div>
        <div class="archive-meta">
          <span class="status-chip ${isFinished ? "status-chip--finished" : "status-chip--ongoing"}">${isFinished ? "Завершений" : "Триває"}</span>
          ${statusHtml} | Турів: ${t.currentRound}/${t.roundsCount} | Учасників: ${t.players.length}
        </div>
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

function isCurrentTournamentMeaningful() {
  const t = state.currentTournament;
  if (!t || t.status === "archived_view") {
    return false;
  }
  return Boolean(
    t.players?.length ||
      t.rounds?.length ||
      t.currentRound > 0 ||
      (t.name && String(t.name).trim()) ||
      t.eventDate ||
      t.timeControl ||
      t.chiefJudge ||
      t.photoDataUrl
  );
}

function openOngoingTournament(tournamentId) {
  if (!state.currentTournament || state.currentTournament.id !== tournamentId) {
    return;
  }
  state.activeTab = "tournament";
  state.tournamentView = "setup";
  saveAndRender();
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
      .standings-player { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .standings-player__avatar,
      .standings-player__placeholder { width: 30px; height: 30px; border-radius: 50%; flex: 0 0 30px; }
      .standings-player__avatar { object-fit: cover; border: 1px solid #c8d6eb; }
      .standings-player__placeholder { display: inline-flex; align-items: center; justify-content: center; background: #eef3fb; color: #6f7e98; font-size: 10px; font-weight: 700; }
      .standings-player__name { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
