const STORAGE_KEY = "swiss-manager-v2";
const LEGACY_STORAGE_KEY = "swiss-manager-v1";
const KYIV_PRESET_VERSION = "kyiv-v1";
const DEFAULT_TIEBREAK_ORDER = ["head_to_head", "buchholz", "solk_plus", "tsolk", "wins"];
const TIEBREAK_OPTIONS = [
  { value: "head_to_head", label: "Особисті зустрічі (H2H)" },
  { value: "buchholz", label: "Buchholz" },
  { value: "solk_plus", label: "SOLK+" },
  { value: "tsolk", label: "TSOLK" },
  { value: "sb", label: "Sonneborn-Berger (SB)" },
  { value: "wins", label: "Кількість перемог (Wins)" },
  { value: "rating", label: "Рейтинг" },
];
const MAX_TOURNAMENT_PHOTO_BYTES = 15 * 1024 * 1024;
const MAX_TOURNAMENT_PHOTO_STORE_BYTES = 1_600_000;
const MAX_BASE_PLAYER_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_BASE_PLAYER_PHOTO_STORE_BYTES = 320_000;

const state = normalizeState(loadRawState());
recalcAllBaseStats();
normalizeRoundsCountForCurrentFormat(state.currentTournament);
let editingBasePlayerId = null;
let tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
let tournamentBaseLookup = [];
let filteredTournamentBaseLookup = [];
let selectedBasePlayerIds = new Set();
let basePlayersSort = { key: "rating", dir: "desc" };

const els = {
  tabsNav: document.getElementById("tabsNav"),
  tabPanels: {
    tournament: document.getElementById("tab-tournament"),
    players: document.getElementById("tab-players"),
    archive: document.getElementById("tab-archive"),
  },
  tournamentSubtabs: document.getElementById("tournamentSubtabs"),
  tournamentViewPanels: document.querySelectorAll("[data-tour-view]"),
  settingsForm: document.getElementById("settingsForm"),
  tournamentName: document.getElementById("tournamentName"),
  roundsCount: document.getElementById("roundsCount"),
  roundsRuleHint: document.getElementById("roundsRuleHint"),
  tournamentFormat: document.getElementById("tournamentFormat"),
  tournamentDate: document.getElementById("tournamentDate"),
  tournamentTimeControl: document.getElementById("tournamentTimeControl"),
  tournamentChiefJudge: document.getElementById("tournamentChiefJudge"),
  tournamentPhoto: document.getElementById("tournamentPhoto"),
  tournamentRemovePhoto: document.getElementById("tournamentRemovePhoto"),
  tournamentSettingsPreview: document.getElementById("tournamentSettingsPreview"),
  tournamentSettingsPhoto: document.getElementById("tournamentSettingsPhoto"),
  tournamentSettingsDate: document.getElementById("tournamentSettingsDate"),
  tournamentSettingsControl: document.getElementById("tournamentSettingsControl"),
  tournamentSettingsChiefJudge: document.getElementById("tournamentSettingsChiefJudge"),
  tieBreak1: document.getElementById("tieBreak1"),
  tieBreak2: document.getElementById("tieBreak2"),
  tieBreak3: document.getElementById("tieBreak3"),
  tieBreak4: document.getElementById("tieBreak4"),
  tieBreak5: document.getElementById("tieBreak5"),
  dbPlayerSelect: document.getElementById("dbPlayerSelect"),
  dbPlayerChecklist: document.getElementById("dbPlayerChecklist"),
  selectAllBaseBtn: document.getElementById("selectAllBaseBtn"),
  addFromBaseBtn: document.getElementById("addFromBaseBtn"),
  playersList: document.getElementById("playersList"),
  generateRoundBtn: document.getElementById("generateRoundBtn"),
  printRoundBtn: document.getElementById("printRoundBtn"),
  roundMeta: document.getElementById("roundMeta"),
  pairings: document.getElementById("pairings"),
  standings: document.getElementById("standings"),
  seedDemoBtn: document.getElementById("seedDemoBtn"),
  finishTournamentBtn: document.getElementById("finishTournamentBtn"),
  resetBtn: document.getElementById("resetBtn"),
  basePlayerForm: document.getElementById("basePlayerForm"),
  basePlayerLastName: document.getElementById("basePlayerLastName"),
  basePlayerFirstName: document.getElementById("basePlayerFirstName"),
  basePlayerRating: document.getElementById("basePlayerRating"),
  basePlayerRank: document.getElementById("basePlayerRank"),
  basePlayerBirthDate: document.getElementById("basePlayerBirthDate"),
  basePlayerPhoto: document.getElementById("basePlayerPhoto"),
  basePlayerRemovePhoto: document.getElementById("basePlayerRemovePhoto"),
  basePlayerSubmitBtn: document.getElementById("basePlayerSubmitBtn"),
  basePlayerCancelEditBtn: document.getElementById("basePlayerCancelEditBtn"),
  baseEditHint: document.getElementById("baseEditHint"),
  basePlayersList: document.getElementById("basePlayersList"),
  archiveList: document.getElementById("archiveList"),
};

bindEvents();
render();

function bindEvents() {
  const tieBreakSelects = [els.tieBreak1, els.tieBreak2, els.tieBreak3, els.tieBreak4, els.tieBreak5];
  for (const select of tieBreakSelects) {
    select.addEventListener("change", () => {
      ensureTournamentSettingsDraftForCurrentTournament();
      tournamentSettingsDraft.tieBreakOrder = collectTieBreakOrderFromForm();
      renderTieBreakSelectors(tournamentSettingsDraft.tieBreakOrder);
    });
  }

  els.tabsNav.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-tab]");
    if (!btn) {
      return;
    }

    captureTournamentSettingsDraftFromForm();
    state.activeTab = btn.dataset.tab;
    saveAndRender();
  });

  els.tournamentSubtabs.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-tournament-view]");
    if (!btn) {
      return;
    }

    captureTournamentSettingsDraftFromForm();
    const nextView = btn.dataset.tournamentView;
    state.tournamentView = nextView === "rounds" || nextView === "table" ? nextView : "setup";
    saveAndRender();
  });

  els.settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    captureTournamentSettingsDraftFromForm();
    const t = state.currentTournament;
    ensureTournamentSettingsDraftForCurrentTournament();
    const draft = tournamentSettingsDraft;
    if (t.status === "archived_view") {
      alert("У режимі перегляду архіву редагування вимкнене.");
      return;
    }
    const nextFormat = draft.format;
    const manualRounds = Number(draft.roundsCount);
    const requiredRoundRobinRounds = getMaxRoundsByFormat("round_robin", t.players.length);
    const nextRounds = nextFormat === "round_robin" ? requiredRoundRobinRounds : manualRounds;
    const nextEventDate = normalizeBirthDate(draft.eventDate);

    if (nextRounds < t.currentRound) {
      alert(`Не можна встановити менше турів, ніж уже зіграно (${t.currentRound}).`);
      return;
    }

    if (nextFormat !== t.format && t.currentRound > 0) {
      alert("Після старту турніру не можна змінити формат.");
      return;
    }

    if (nextFormat === "swiss") {
      const maxRounds = getMaxRoundsByFormat(nextFormat, t.players.length);
      if (maxRounds > 0 && nextRounds > maxRounds) {
        alert(`Для швейцарської системи максимум ${maxRounds} турів.`);
        return;
      }
      if (nextRounds < 1) {
        alert("Для швейцарської системи має бути щонайменше 1 тур.");
        return;
      }
    }

    t.name = draft.name || "Турнір";
    t.roundsCount = nextRounds;
    t.format = nextFormat;
    t.eventDate = nextEventDate;
    t.timeControl = draft.timeControl;
    t.chiefJudge = draft.chiefJudge;
    t.tieBreakOrder = normalizeTieBreakOrder(draft.tieBreakOrder, { fillDefaults: false });

    let nextPhotoDataUrl = draft.pendingPhotoDataUrl;
    const selectedPhotoFile = els.tournamentPhoto.files?.[0] || null;
    if (!nextPhotoDataUrl && selectedPhotoFile) {
      if (!isValidTournamentPhotoFile(selectedPhotoFile)) {
        return;
      }
      nextPhotoDataUrl = await readTournamentPhotoDataUrl(selectedPhotoFile);
    }

    if (nextPhotoDataUrl) {
      t.photoDataUrl = nextPhotoDataUrl;
    } else if (draft.removePhoto) {
      t.photoDataUrl = null;
    }

    normalizeRoundsCountForCurrentFormat(t);
    t.updatedAt = new Date().toISOString();
    tournamentSettingsDraft = createTournamentSettingsDraft(t);
    saveAndRender();
  });

  els.tournamentName.addEventListener("input", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    tournamentSettingsDraft.name = els.tournamentName.value.trim();
  });

  els.roundsCount.addEventListener("input", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    tournamentSettingsDraft.roundsCount = Number(els.roundsCount.value) || 1;
  });

  const syncTournamentDateDraft = () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    const raw = String(els.tournamentDate.value || "").trim();
    tournamentSettingsDraft.eventDate = normalizeBirthDate(raw);
    if (tournamentSettingsDraft.eventDate) {
      state.currentTournament.eventDate = tournamentSettingsDraft.eventDate;
    }
  };
  els.tournamentDate.addEventListener("input", syncTournamentDateDraft);
  els.tournamentDate.addEventListener("change", syncTournamentDateDraft);

  els.tournamentTimeControl.addEventListener("input", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    tournamentSettingsDraft.timeControl = normalizeTimeControl(els.tournamentTimeControl.value);
  });

  els.tournamentChiefJudge.addEventListener("input", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    tournamentSettingsDraft.chiefJudge = normalizeChiefJudge(els.tournamentChiefJudge.value);
  });

  els.tournamentRemovePhoto.addEventListener("change", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    tournamentSettingsDraft.removePhoto = els.tournamentRemovePhoto.checked;
    if (tournamentSettingsDraft.removePhoto) {
      tournamentSettingsDraft.pendingPhotoDataUrl = null;
    }
  });

  els.tournamentPhoto.addEventListener("change", async () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    const photoFile = els.tournamentPhoto.files?.[0] || null;
    if (!photoFile) {
      tournamentSettingsDraft.pendingPhotoDataUrl = null;
      return;
    }
    if (!isValidTournamentPhotoFile(photoFile)) {
      els.tournamentPhoto.value = "";
      tournamentSettingsDraft.pendingPhotoDataUrl = null;
      return;
    }
    tournamentSettingsDraft.pendingPhotoDataUrl = await readTournamentPhotoDataUrl(photoFile);
    tournamentSettingsDraft.removePhoto = false;
    els.tournamentRemovePhoto.checked = false;
  });

  els.tournamentFormat.addEventListener("change", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    const nextFormat = els.tournamentFormat.value;
    const playersCount = state.currentTournament.players.length;
    const requiredRoundRobinRounds = getMaxRoundsByFormat("round_robin", playersCount);
    tournamentSettingsDraft.format = nextFormat === "round_robin" ? "round_robin" : "swiss";

    if (nextFormat === "round_robin") {
      els.roundsCount.value = requiredRoundRobinRounds;
      tournamentSettingsDraft.roundsCount = requiredRoundRobinRounds;
      els.roundsCount.disabled = true;
      renderRoundsRuleHint();
      return;
    }

    els.roundsCount.disabled = false;
    if (Number(els.roundsCount.value) < 1) {
      els.roundsCount.value = Math.max(1, state.currentTournament.roundsCount || 5);
    }
    tournamentSettingsDraft.roundsCount = Number(els.roundsCount.value) || 1;
    renderRoundsRuleHint();
  });

  els.dbPlayerSelect.addEventListener("input", () => {
    renderBaseSelect();
  });

  els.selectAllBaseBtn.addEventListener("click", () => {
    selectAllVisibleBasePlayers();
  });

  els.addFromBaseBtn.addEventListener("click", () => {
    captureTournamentSettingsDraftFromForm();
    addSelectedBasePlayersToTournament();
  });

  els.dbPlayerChecklist.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox'][data-base-player-id]");
    if (!checkbox) {
      return;
    }
    const baseId = checkbox.dataset.basePlayerId;
    if (!baseId) {
      return;
    }
    if (checkbox.checked) {
      selectedBasePlayerIds.add(baseId);
    } else {
      selectedBasePlayerIds.delete(baseId);
    }
    els.addFromBaseBtn.disabled = selectedBasePlayerIds.size === 0;
  });

  els.generateRoundBtn.addEventListener("click", () => {
    generateNextRound();
  });
  els.printRoundBtn.addEventListener("click", () => {
    printCurrentRound();
  });

  if (els.seedDemoBtn) {
    els.seedDemoBtn.addEventListener("click", () => {
      captureTournamentSettingsDraftFromForm();
      addDemoPlayers();
    });
  }

  els.finishTournamentBtn.addEventListener("click", () => {
    finishCurrentTournament();
  });

  els.resetBtn.addEventListener("click", () => {
    captureTournamentSettingsDraftFromForm();
    createNewTournamentFlow();
  });

  els.basePlayerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitBasePlayerForm();
  });

  els.basePlayerCancelEditBtn.addEventListener("click", () => {
    resetBasePlayerForm();
  });

  els.basePlayersList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    const playerId = btn.dataset.playerId;
    const action = btn.dataset.action;

    if (action === "add-to-tournament") {
      addBasePlayerToTournament(playerId);
    }

    if (action === "delete-base-player") {
      deleteBasePlayer(playerId);
    }

    if (action === "edit-base-player") {
      startEditBasePlayer(playerId);
    }

    if (action === "view-base-history") {
      viewBasePlayerHistory(playerId);
    }

    if (action === "sort-base-column") {
      const sortKey = btn.dataset.sortKey;
      if (!sortKey) {
        return;
      }
      if (basePlayersSort.key === sortKey) {
        basePlayersSort.dir = basePlayersSort.dir === "asc" ? "desc" : "asc";
      } else {
        basePlayersSort.key = sortKey;
        basePlayersSort.dir = sortKey === "rating" ? "desc" : "asc";
      }
      renderBasePlayersTab();
    }
  });

  els.playersList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    captureTournamentSettingsDraftFromForm();
    const playerId = btn.dataset.playerId;
    const action = btn.dataset.action;

    if (action === "edit-tour-player") {
      editTournamentPlayer(playerId);
    }

    if (action === "remove-tour-player") {
      removeTournamentPlayer(playerId);
    }
  });

  els.archiveList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    const tournamentId = btn.dataset.tournamentId;
    const action = btn.dataset.action;

    if (action === "open-archive") {
      openArchivePreview(tournamentId);
    }

    if (action === "delete-archive") {
      deleteArchivedTournament(tournamentId);
    }

    if (action === "print-archive") {
      printArchivedTournament(tournamentId);
    }

    if (action === "close-archive-preview") {
      state.archivePreviewTournamentId = null;
      saveAndRender();
    }
  });
}

function loadRawState() {
  try {
    const v2 = localStorage.getItem(STORAGE_KEY);
    if (v2) {
      return JSON.parse(v2);
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      return JSON.parse(legacy);
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeState(raw) {
  if (!raw) {
    return applyKyivPresetIfNeeded(createDefaultState());
  }

  if (raw.currentTournament && Array.isArray(raw.playerBase) && Array.isArray(raw.tournamentsArchive)) {
    const normalized = {
      activeTab: raw.activeTab || "tournament",
      tournamentView: normalizeTournamentView(raw),
      archivePreviewTournamentId: raw.archivePreviewTournamentId || null,
      kyivPresetVersion: raw.kyivPresetVersion || null,
      playerBase: raw.playerBase.map(normalizeBasePlayer),
      currentTournament: normalizeTournament(raw.currentTournament),
      tournamentsArchive: raw.tournamentsArchive.map(normalizeArchivedTournament),
    };

    ensureTournamentPlayersLinkedToBase(normalized.currentTournament, normalized.playerBase);
    return applyKyivPresetIfNeeded(normalized);
  }

  if (raw.tournamentName && Array.isArray(raw.players) && Array.isArray(raw.rounds)) {
    const migrated = createDefaultState();

    const baseMap = new Map();
    for (const p of raw.players) {
      const split = splitFullName(p.name);
      const base = createBasePlayerRecord(split.lastName, split.firstName, Number(p.rating) || 0);
      baseMap.set(p.id, base.id);
      migrated.playerBase.push(base);
    }

    migrated.currentTournament = {
      id: crypto.randomUUID(),
      name: raw.tournamentName || "Мігрований турнір",
      format: "swiss",
      tieBreakOrder: [...DEFAULT_TIEBREAK_ORDER],
      roundsCount: Number(raw.roundsCount) || 5,
      currentRound: Number(raw.currentRound) || 0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      players: raw.players.map((p, idx) => ({
        id: p.id || crypto.randomUUID(),
        basePlayerId: baseMap.get(p.id) || null,
        name: p.name,
        rating: Number(p.rating) || 0,
        startNo: Number.isInteger(p.startNo) ? p.startNo : idx + 1,
        score: Number(p.score) || 0,
        hadBye: Boolean(p.hadBye),
        opponents: Array.isArray(p.opponents) ? p.opponents : [],
        colors: Array.isArray(p.colors) ? p.colors : [],
        resultsByRound: p.resultsByRound || {},
      })),
      rounds: raw.rounds.map((r) => ({
        round: Number(r.round),
        pairings: (r.pairings || []).map((pair) => ({
          board: Number(pair.board),
          whiteId: pair.whiteId,
          blackId: pair.blackId,
          result: pair.result || "pending",
        })),
      })),
    };

    return applyKyivPresetIfNeeded(migrated);
  }

  return applyKyivPresetIfNeeded(createDefaultState());
}

function normalizeTournamentView(rawState) {
  if (rawState.tournamentView === "setup" || rawState.tournamentView === "rounds" || rawState.tournamentView === "table") {
    return rawState.tournamentView;
  }
  if (rawState.tournamentView === "play") {
    return rawState.tournamentPlayView === "table" ? "table" : "rounds";
  }
  if (rawState.tournamentPlayView === "table") {
    return "table";
  }
  return "setup";
}

function createDefaultState() {
  return {
    activeTab: "tournament",
    tournamentView: "setup",
    archivePreviewTournamentId: null,
    kyivPresetVersion: null,
    playerBase: [],
    currentTournament: createDefaultTournament(),
    tournamentsArchive: [],
  };
}

function applyKyivPresetIfNeeded(stateObj) {
  if (stateObj.kyivPresetVersion === KYIV_PRESET_VERSION) {
    return stateObj;
  }

  stateObj.playerBase = createKyivPresetPlayers();
  stateObj.currentTournament = createDefaultTournament();
  stateObj.tournamentView = "setup";
  stateObj.archivePreviewTournamentId = null;
  stateObj.kyivPresetVersion = KYIV_PRESET_VERSION;
  return stateObj;
}

function createKyivPresetPlayers() {
  const preset = [
    { lastName: "Порецький", firstName: "Лев", rating: 2380, rank: "кмс", birthDate: "2011-07-05" },
    { lastName: "Дяченко", firstName: "Андрій", rating: 2244, rank: "1", birthDate: "2011-08-04" },
    { lastName: "Єжова", firstName: "Валерія", rating: 2214, rank: "мс", birthDate: "2011-07-29" },
    { lastName: "Баркевич", firstName: "Максим", rating: 2408, rank: "кмс", birthDate: "2013-05-31" },
    { lastName: "Поплавський", firstName: "Данііл", rating: 2276, rank: "1", birthDate: "2014-02-25" },
    { lastName: "Савченко", firstName: "Макар", rating: 2250, rank: "1", birthDate: "2015-07-01" },
    { lastName: "Постой", firstName: "Роман", rating: 2250, rank: "1", birthDate: "2015-11-19" },
    { lastName: "Лисенко", firstName: "Поліна", rating: 2158, rank: "1", birthDate: "2014-12-26" },
    { lastName: "Карасьова", firstName: "Мар'яна", rating: 2150, rank: "1", birthDate: "2014-08-08" },
    { lastName: "Гавриш", firstName: "Єлизавета", rating: 1950, rank: "3", birthDate: "2015-03-23" },
    { lastName: "Діденко", firstName: "Олександр", rating: 2150, rank: "2", birthDate: "2016-12-02" },
    { lastName: "Строкін", firstName: "Владислав", rating: 2150, rank: "2", birthDate: "2017-09-10" },
    { lastName: "Сухомуд", firstName: "Святослав", rating: 2050, rank: "3", birthDate: "2016-02-02" },
    { lastName: "Надточій", firstName: "Владислав", rating: 2050, rank: "3", birthDate: "2017-08-13" },
    { lastName: "Дем'яненко", firstName: "Мар'яна", rating: 1950, rank: "3", birthDate: "2017-08-03" },
    { lastName: "Алексеєнко", firstName: "Анастасія", rating: 1850, rank: "юнацький", birthDate: "2017-09-20" },
    { lastName: "Сіфорова", firstName: "Анна", rating: 1950, rank: "3", birthDate: "2018-07-11" },
  ];

  return preset.map((p) => createBasePlayerRecord(p.lastName, p.firstName, p.rating, p));
}

function createDefaultTournament() {
  return {
    id: crypto.randomUUID(),
    name: "",
    format: "swiss",
    eventDate: "",
    timeControl: "",
    chiefJudge: "",
    tieBreakOrder: [...DEFAULT_TIEBREAK_ORDER],
    photoDataUrl: null,
    roundsCount: 1,
    currentRound: 0,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    players: [],
    rounds: [],
  };
}

function normalizeTournament(tournament) {
  const t = {
    id: tournament.id || crypto.randomUUID(),
    name: typeof tournament.name === "string" ? tournament.name : "Турнір",
    format: tournament.format === "round_robin" ? "round_robin" : "swiss",
    eventDate: normalizeBirthDate(tournament.eventDate),
    timeControl: normalizeTimeControl(tournament.timeControl),
    chiefJudge: normalizeChiefJudge(tournament.chiefJudge),
    tieBreakOrder: Array.isArray(tournament.tieBreakOrder)
      ? normalizeTieBreakOrder(tournament.tieBreakOrder, { fillDefaults: false })
      : [...DEFAULT_TIEBREAK_ORDER],
    photoDataUrl: typeof tournament.photoDataUrl === "string" && tournament.photoDataUrl ? tournament.photoDataUrl : null,
    roundsCount: Number(tournament.roundsCount) || 5,
    currentRound: Number(tournament.currentRound) || 0,
    status: tournament.status || "active",
    createdAt: tournament.createdAt || new Date().toISOString(),
    updatedAt: tournament.updatedAt || new Date().toISOString(),
    players: Array.isArray(tournament.players)
      ? tournament.players.map((p, idx) => ({
          id: p.id || crypto.randomUUID(),
          basePlayerId: p.basePlayerId || null,
          name: p.name,
          rating: Number(p.rating) || 0,
          startNo: Number.isInteger(p.startNo) ? p.startNo : idx + 1,
          score: Number(p.score) || 0,
          hadBye: Boolean(p.hadBye),
          manualPlace: Number.isInteger(p.manualPlace) ? p.manualPlace : null,
          opponents: Array.isArray(p.opponents) ? p.opponents : [],
          colors: Array.isArray(p.colors) ? p.colors : [],
          resultsByRound: p.resultsByRound || {},
        }))
      : [],
    rounds: Array.isArray(tournament.rounds)
      ? tournament.rounds.map((r) => ({
          round: Number(r.round),
          pairings: (r.pairings || []).map((pair) => ({
            board: Number(pair.board),
            whiteId: pair.whiteId,
            blackId: pair.blackId,
            result: pair.result || "pending",
          })),
        }))
      : [],
  };

  return t;
}

function normalizeArchivedTournament(tournament) {
  return {
    ...normalizeTournament(tournament),
    finishedAt: tournament.finishedAt || tournament.updatedAt || new Date().toISOString(),
  };
}

function normalizeBasePlayer(player) {
  const parsed = splitFullName(player.name || "");
  return {
    id: player.id || crypto.randomUUID(),
    firstName: player.firstName || parsed.firstName || "імені",
    lastName: player.lastName || parsed.lastName || "Без",
    rating: Number(player.rating) || 0,
    rank: normalizeRank(player.rank),
    birthDate: normalizeBirthDate(player.birthDate),
    photoDataUrl: typeof player.photoDataUrl === "string" && player.photoDataUrl ? player.photoDataUrl : null,
    createdAt: player.createdAt || new Date().toISOString(),
    history: Array.isArray(player.history) ? player.history : [],
    stats: player.stats || emptyStats(),
  };
}

function emptyStats() {
  return {
    tournaments: 0,
    games: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    bye: 0,
    totalScore: 0,
  };
}

function ensureTournamentPlayersLinkedToBase(tournament, basePlayers) {
  for (const p of tournament.players) {
    if (p.basePlayerId && basePlayers.some((bp) => bp.id === p.basePlayerId)) {
      continue;
    }

    const found = basePlayers.find((bp) => getBaseFullName(bp).toLowerCase() === p.name.toLowerCase());
    if (found) {
      p.basePlayerId = found.id;
      continue;
    }

    const split = splitFullName(p.name);
    const created = createBasePlayerRecord(split.lastName, split.firstName, p.rating);
    basePlayers.push(created);
    p.basePlayerId = created.id;
  }
}

function createBasePlayerRecord(lastName, firstName, rating, extra = {}) {
  return {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    rating,
    rank: normalizeRank(extra.rank),
    birthDate: normalizeBirthDate(extra.birthDate),
    photoDataUrl: typeof extra.photoDataUrl === "string" && extra.photoDataUrl ? extra.photoDataUrl : null,
    createdAt: new Date().toISOString(),
    history: [],
    stats: emptyStats(),
  };
}

function createTournamentPlayer(name, rating, basePlayerId, currentCount) {
  return {
    id: crypto.randomUUID(),
    basePlayerId,
    name,
    rating,
    startNo: currentCount + 1,
    score: 0,
    hadBye: false,
    manualPlace: null,
    opponents: [],
    colors: [],
    resultsByRound: {},
  };
}

function splitFullName(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return { lastName: "", firstName: "" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { lastName: parts[0], firstName: "" };
  }

  return { lastName: parts[0], firstName: parts.slice(1).join(" ") };
}

function getBaseFullName(basePlayer) {
  return `${basePlayer.lastName || ""} ${basePlayer.firstName || ""}`.trim();
}

function normalizeRank(value) {
  const allowed = new Set(["б/р", "юнацький", "3", "2", "1", "кмс", "мс", "гр"]);
  if (allowed.has(value)) {
    return value;
  }
  return "б/р";
}

function normalizeBirthDate(value) {
  if (!value) {
    return "";
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }
  const parts = text.match(/\d+/g);
  if (!parts || parts.length < 3) {
    return "";
  }

  let day;
  let month;
  let year;

  if (parts[0].length === 4) {
    year = Number(parts[0]);
    month = Number(parts[1]);
    day = Number(parts[2]);
  } else {
    day = Number(parts[0]);
    month = Number(parts[1]);
    year = Number(parts[2]);
  }

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return "";
  }
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
    return "";
  }

  const iso = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  const check = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(check.getTime())) {
    return "";
  }
  if (check.getUTCFullYear() !== year || check.getUTCMonth() + 1 !== month || check.getUTCDate() !== day) {
    return "";
  }

  return iso;
}

function getMaxRoundsByFormat(format, playersCount) {
  if (format === "round_robin") {
    if (playersCount < 2) {
      return 0;
    }
    return playersCount - 1;
  }

  return 15;
}

function normalizeRoundsCountForCurrentFormat(tournament) {
  if (tournament.format === "round_robin") {
    tournament.roundsCount = getMaxRoundsByFormat("round_robin", tournament.players.length);
    return;
  }

  const maxRounds = getMaxRoundsByFormat("swiss", tournament.players.length);
  if (!Number.isFinite(tournament.roundsCount) || tournament.roundsCount < 1) {
    tournament.roundsCount = 1;
    return;
  }
  if (maxRounds > 0 && tournament.roundsCount > maxRounds) {
    tournament.roundsCount = maxRounds;
  }
}

function formatLabel(format) {
  return format === "round_robin" ? "Кругова система" : "Швейцарська система";
}

function normalizeTimeControl(value) {
  return String(value || "").trim().slice(0, 60);
}

function normalizeChiefJudge(value) {
  return String(value || "").trim().slice(0, 120);
}

function isValidTournamentPhotoFile(file) {
  if (!file) {
    return false;
  }
  if (file.size <= MAX_TOURNAMENT_PHOTO_BYTES) {
    return true;
  }

  alert("Фото турніру занадто велике. Оберіть файл до 15 MB.");
  return false;
}

function isValidBasePlayerPhotoFile(file) {
  if (!file) {
    return false;
  }
  if (file.size <= MAX_BASE_PLAYER_PHOTO_BYTES) {
    return true;
  }

  alert("Фото гравця занадто велике. Оберіть файл до 10 MB.");
  return false;
}

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
          <span>${escapeHtml(item.token)}</span>
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

function selectAllVisibleBasePlayers() {
  if (!filteredTournamentBaseLookup.length) {
    return;
  }
  for (const item of filteredTournamentBaseLookup) {
    selectedBasePlayerIds.add(item.id);
  }
  renderBaseSelect();
}

function addSelectedBasePlayersToTournament() {
  const t = state.currentTournament;
  if (t.currentRound > 0) {
    alert("Не можна додавати гравців після старту турніру.");
    return;
  }

  const idsToAdd = [...selectedBasePlayerIds].filter((id) => !t.players.some((p) => p.basePlayerId === id));
  if (idsToAdd.length === 0) {
    alert("Відмітьте хоча б одного гравця, щоб додати у турнір.");
    return;
  }

  let added = 0;
  for (const baseId of idsToAdd) {
    const basePlayer = state.playerBase.find((p) => p.id === baseId);
    if (!basePlayer) {
      continue;
    }
    const ok = addTournamentPlayer(basePlayer.id, getBaseFullName(basePlayer), basePlayer.rating, { save: false });
    if (ok) {
      added += 1;
    }
  }

  if (!added) {
    alert("Не вдалося додати вибраних гравців.");
    return;
  }

  selectedBasePlayerIds.clear();
  els.dbPlayerSelect.value = "";
  normalizeRoundsCountForCurrentFormat(t);
  t.updatedAt = new Date().toISOString();
  saveAndRender();
}

function addBasePlayerToTournament(basePlayerId) {
  const t = state.currentTournament;
  if (t.currentRound > 0) {
    alert("Не можна додавати гравців після старту турніру.");
    return;
  }

  const basePlayer = state.playerBase.find((p) => p.id === basePlayerId);
  if (!basePlayer) {
    return;
  }

  addTournamentPlayer(basePlayer.id, getBaseFullName(basePlayer), basePlayer.rating);
}

function addTournamentPlayer(basePlayerId, name, rating, options = {}) {
  const t = state.currentTournament;
  const shouldSave = options.save !== false;

  if (t.players.some((p) => p.basePlayerId === basePlayerId)) {
    if (shouldSave) {
      alert("Цей гравець уже доданий у турнір.");
    }
    return false;
  }

  t.players.push(createTournamentPlayer(name, rating, basePlayerId, t.players.length));
  if (shouldSave) {
    normalizeRoundsCountForCurrentFormat(t);
    t.updatedAt = new Date().toISOString();
    saveAndRender();
  }
  return true;
}

async function submitBasePlayerForm() {
  const lastName = els.basePlayerLastName.value.trim();
  const firstName = els.basePlayerFirstName.value.trim();
  const rating = Number(els.basePlayerRating.value);
  const rank = els.basePlayerRank.value;
  const birthDate = normalizeBirthDate(els.basePlayerBirthDate.value);
  const removePhoto = els.basePlayerRemovePhoto.checked;
  const photoFile = els.basePlayerPhoto.files?.[0] || null;

  if (!lastName || !firstName) {
    alert("Прізвище та ім'я обов'язкові.");
    return;
  }

  if (!Number.isFinite(rating) || rating < 0) {
    alert("Рейтинг має бути невід'ємним числом.");
    return;
  }

  let photoDataUrl = null;
  if (photoFile) {
    if (!isValidBasePlayerPhotoFile(photoFile)) {
      return;
    }
    photoDataUrl = await readBasePlayerPhotoDataUrl(photoFile);
  }

  if (editingBasePlayerId) {
    const base = state.playerBase.find((p) => p.id === editingBasePlayerId);
    if (!base) {
      resetBasePlayerForm();
      return;
    }

    if (
      state.playerBase.some(
        (p) =>
          p.id !== base.id &&
          p.lastName.toLowerCase() === lastName.toLowerCase() &&
          p.firstName.toLowerCase() === firstName.toLowerCase()
      )
    ) {
      alert("Гравець з таким прізвищем та ім'ям уже є в базі.");
      return;
    }

    base.lastName = lastName;
    base.firstName = firstName;
    base.rating = Math.round(rating);
    base.rank = normalizeRank(rank);
    base.birthDate = birthDate;

    if (photoDataUrl) {
      base.photoDataUrl = photoDataUrl;
    } else if (removePhoto) {
      base.photoDataUrl = null;
    }

    syncBasePlayerChangesToCurrentTournament(base.id);
  } else {
    if (
      state.playerBase.some(
        (p) => p.lastName.toLowerCase() === lastName.toLowerCase() && p.firstName.toLowerCase() === firstName.toLowerCase()
      )
    ) {
      alert("Гравець з таким прізвищем та ім'ям уже є в базі.");
      return;
    }

    state.playerBase.push(
      createBasePlayerRecord(lastName, firstName, Math.round(rating), {
        rank,
        birthDate,
        photoDataUrl: photoDataUrl || null,
      })
    );
  }

  resetBasePlayerForm();
  saveAndRender();
}

function deleteBasePlayer(playerId) {
  if (!confirm("Видалити гравця з бази? Історія турнірів також зникне.")) {
    return;
  }

  state.playerBase = state.playerBase.filter((p) => p.id !== playerId);

  for (const tp of state.currentTournament.players) {
    if (tp.basePlayerId === playerId) {
      tp.basePlayerId = null;
    }
  }

  saveAndRender();
}

function startEditBasePlayer(playerId) {
  const base = state.playerBase.find((p) => p.id === playerId);
  if (!base) {
    return;
  }

  editingBasePlayerId = base.id;
  els.basePlayerLastName.value = base.lastName || "";
  els.basePlayerFirstName.value = base.firstName || "";
  els.basePlayerRating.value = String(base.rating ?? 0);
  els.basePlayerRank.value = normalizeRank(base.rank);
  els.basePlayerBirthDate.value = normalizeBirthDate(base.birthDate);
  els.basePlayerPhoto.value = "";
  els.basePlayerRemovePhoto.checked = false;
  els.basePlayerSubmitBtn.textContent = "Зберегти зміни";
  els.basePlayerCancelEditBtn.hidden = false;
  els.baseEditHint.hidden = false;
  els.baseEditHint.textContent = `Редагування: ${getBaseFullName(base)}. Поля: Прізвище, Ім'я, Рейтинг, Спортивне звання, Дата народження, Фото.`;
  els.basePlayerForm.scrollIntoView({ behavior: "smooth", block: "center" });
  els.basePlayerLastName.focus();
}

function resetBasePlayerForm() {
  editingBasePlayerId = null;
  els.basePlayerForm.reset();
  els.basePlayerRank.value = "б/р";
  els.basePlayerRemovePhoto.checked = false;
  els.basePlayerSubmitBtn.textContent = "Додати в базу";
  els.basePlayerCancelEditBtn.hidden = true;
  els.baseEditHint.hidden = true;
  els.baseEditHint.textContent = "";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readTournamentPhotoDataUrl(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  return optimizeImageDataUrl(rawDataUrl, {
    maxSide: 1280,
    qualityStart: 0.86,
    qualityMin: 0.52,
    targetBytes: MAX_TOURNAMENT_PHOTO_STORE_BYTES,
  });
}

async function readBasePlayerPhotoDataUrl(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  return optimizeImageDataUrl(rawDataUrl, {
    maxSide: 760,
    qualityStart: 0.82,
    qualityMin: 0.45,
    targetBytes: MAX_BASE_PLAYER_PHOTO_STORE_BYTES,
  });
}

function optimizeImageDataUrl(dataUrl, options) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = options.maxSide || 1280;
      const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * ratio));
      const height = Math.max(1, Math.round(img.naturalHeight * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = options.qualityStart || 0.86;
      const qualityMin = options.qualityMin || 0.52;
      const targetBytes = options.targetBytes || MAX_TOURNAMENT_PHOTO_STORE_BYTES;
      let output = canvas.toDataURL("image/jpeg", quality);

      while (estimateDataUrlBytes(output) > targetBytes && quality > qualityMin) {
        quality = Math.max(qualityMin, quality - 0.08);
        output = canvas.toDataURL("image/jpeg", quality);
      }

      resolve(output);
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function estimateDataUrlBytes(dataUrl) {
  const commaIdx = dataUrl.indexOf(",");
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  return Math.floor((base64.length * 3) / 4);
}

function viewBasePlayerHistory(playerId) {
  const base = state.playerBase.find((p) => p.id === playerId);
  if (!base) {
    return;
  }
  const fullName = getBaseFullName(base);

  if (!base.history.length) {
    alert(`${fullName}: поки немає історії зіграних турнірів.`);
    return;
  }

  const ordered = base.history.slice().sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
  const lines = ordered.map((h) => {
    const opponents = (h.opponents || []).length ? h.opponents.join(", ") : "без суперників";
    return `• ${h.tournamentName} | ${formatDate(h.finishedAt)} | місце ${h.place ?? "-"} | очки ${Number(h.score).toFixed(1)} | суперники: ${opponents}`;
  });

  alert(`${fullName}\n\n${lines.join("\n")}`);
}

function syncBasePlayerChangesToCurrentTournament(basePlayerId) {
  const t = state.currentTournament;
  const base = state.playerBase.find((p) => p.id === basePlayerId);
  if (!base) {
    return;
  }

  const linked = t.players.filter((p) => p.basePlayerId === basePlayerId);
  for (const tp of linked) {
    tp.name = getBaseFullName(base);
    if (t.currentRound === 0) {
      tp.rating = base.rating;
    }
  }
}

function editTournamentPlayer(playerId) {
  const t = state.currentTournament;
  if (t.currentRound > 0) {
    alert("Після старту турніру редагування учасників вимкнене.");
    return;
  }

  const player = t.players.find((p) => p.id === playerId);
  if (!player) {
    return;
  }

  const nextName = prompt("Нове ім'я гравця:", player.name);
  if (nextName === null) {
    return;
  }

  const trimmedName = nextName.trim();
  if (!trimmedName) {
    alert("Ім'я не може бути порожнім.");
    return;
  }

  const nextRatingRaw = prompt("Новий рейтинг:", String(player.rating));
  if (nextRatingRaw === null) {
    return;
  }

  const nextRating = Number(nextRatingRaw);
  if (!Number.isFinite(nextRating) || nextRating < 0) {
    alert("Рейтинг має бути невід'ємним числом.");
    return;
  }

  player.name = trimmedName;
  player.rating = Math.round(nextRating);

  if (player.basePlayerId) {
    const base = state.playerBase.find((bp) => bp.id === player.basePlayerId);
    if (base) {
      const split = splitFullName(player.name);
      base.lastName = split.lastName || base.lastName;
      base.firstName = split.firstName || base.firstName;
      base.rating = player.rating;
    }
  }

  saveAndRender();
}

function removeTournamentPlayer(playerId) {
  const t = state.currentTournament;
  if (t.currentRound > 0) {
    alert("Після старту турніру видалення учасників вимкнене.");
    return;
  }

  const player = t.players.find((p) => p.id === playerId);
  if (!player) {
    return;
  }

  if (!confirm(`Видалити ${player.name} з поточного турніру?`)) {
    return;
  }

  t.players = t.players.filter((p) => p.id !== playerId);
  normalizeRoundsCountForCurrentFormat(t);
  t.updatedAt = new Date().toISOString();
  saveAndRender();
}

function addDemoPlayers() {
  const t = state.currentTournament;
  if (t.players.length > 0 || t.currentRound > 0) {
    alert("Демо можна завантажити лише в порожній турнір.");
    return;
  }

  const demo = [
    ["Коваль", "Артем", 1650],
    ["Іванчук", "Олексій", 1590],
    ["Мельник", "Софія", 1585],
    ["Литвин", "Марко", 1540],
    ["Петренко", "Іван", 1525],
    ["Шевчук", "Вікторія", 1510],
    ["Клименко", "Ярина", 1490],
    ["Савчук", "Дмитро", 1460],
    ["Бойко", "Лев", 1440],
    ["Гончар", "Анна", 1430],
    ["Паламар", "Максим", 1400],
    ["Ткаченко", "Поліна", 1380],
  ];

  for (const [lastName, firstName, rating] of demo) {
    let base = state.playerBase.find(
      (p) => p.lastName.toLowerCase() === lastName.toLowerCase() && p.firstName.toLowerCase() === firstName.toLowerCase()
    );
    if (!base) {
      base = createBasePlayerRecord(lastName, firstName, rating);
      state.playerBase.push(base);
    }

    t.players.push(createTournamentPlayer(getBaseFullName(base), rating, base.id, t.players.length));
  }

  normalizeRoundsCountForCurrentFormat(t);
  saveAndRender();
}

function generateNextRound() {
  const t = state.currentTournament;

  if (t.players.length < 2) {
    alert("Потрібно щонайменше 2 гравці.");
    return;
  }

  if (t.currentRound >= t.roundsCount) {
    alert("Досягнуто максимальної кількості турів.");
    return;
  }

  if (!isLastRoundComplete(t)) {
    alert("Спочатку внесіть усі результати поточного туру.");
    return;
  }

  const nextRoundNumber = t.currentRound + 1;
  let pairings = [];

  if (t.format === "round_robin") {
    const maxRounds = getMaxRoundsByFormat("round_robin", t.players.length);
    if (maxRounds === 0) {
      alert("Для кругової системи потрібно щонайменше 2 гравці.");
      return;
    }

    if (nextRoundNumber > maxRounds) {
      alert(`Для цього складу кругової системи максимум ${maxRounds} турів.`);
      return;
    }

    pairings = roundRobinPairRound(t, nextRoundNumber);
  } else {
    const swissPairings = swissPairRound(t, nextRoundNumber);
    if (!swissPairings) {
      alert("Неможливо згенерувати тур без повторних пар. Зменште кількість турів або змініть склад учасників.");
      return;
    }
    pairings = swissPairings;
  }

  t.rounds.push({ round: nextRoundNumber, pairings });
  t.currentRound = nextRoundNumber;
  t.updatedAt = new Date().toISOString();

  saveAndRender();
}

function swissPairRound(tournament, roundNumber) {
  const sorted = [...tournament.players].sort(comparePlayersForPairing);
  const pairings = [];
  let byePlayer = null;
  let pairedTuples = null;

  if (sorted.length % 2 === 1) {
    const byeCandidates = getByeCandidates(sorted);
    for (const candidate of byeCandidates) {
      const remaining = sorted.filter((p) => p.id !== candidate.id);
      const attempt = buildSwissNonRepeatPairings(remaining);
      if (attempt) {
        byePlayer = candidate;
        pairedTuples = attempt;
        break;
      }
    }
  } else {
    pairedTuples = buildSwissNonRepeatPairings(sorted);
  }

  if (!pairedTuples) {
    return null;
  }

  if (byePlayer) {
    byePlayer.hadBye = true;
    byePlayer.score += 1;
    byePlayer.resultsByRound[roundNumber] = "BYE";
    pairings.push({ board: pairings.length + 1, whiteId: byePlayer.id, blackId: null, result: "1-0 BYE" });
  }

  for (const [p1, p2] of pairedTuples) {
    const colors = assignColors(p1, p2);
    pairings.push({
      board: pairings.length + 1,
      whiteId: colors.white.id,
      blackId: colors.black.id,
      result: "pending",
    });
  }

  applyPendingMetadata(tournament, pairings);
  return pairings;
}

function roundRobinPairRound(tournament, roundNumber) {
  const ids = [...tournament.players]
    .sort((a, b) => b.rating - a.rating)
    .map((p) => p.id);

  const rounds = buildRoundRobinSchedule(ids);
  const roundPairs = rounds[roundNumber - 1] || [];
  const pairings = [];

  for (const pair of roundPairs) {
    if (pair.whiteId === null || pair.blackId === null) {
      const byeId = pair.whiteId || pair.blackId;
      if (!byeId) {
        continue;
      }

      const byePlayer = tournament.players.find((p) => p.id === byeId);
      if (!byePlayer) {
        continue;
      }

      byePlayer.hadBye = true;
      byePlayer.score += 1;
      byePlayer.resultsByRound[roundNumber] = "BYE";

      pairings.push({
        board: pairings.length + 1,
        whiteId: byePlayer.id,
        blackId: null,
        result: "1-0 BYE",
      });
      continue;
    }

    pairings.push({
      board: pairings.length + 1,
      whiteId: pair.whiteId,
      blackId: pair.blackId,
      result: "pending",
    });
  }

  applyPendingMetadata(tournament, pairings);
  return pairings;
}

function buildRoundRobinSchedule(playerIds) {
  if (playerIds.length < 2) {
    return [];
  }

  const arr = [...playerIds];
  if (arr.length % 2 === 1) {
    arr.push(null);
  }

  const rounds = [];
  const n = arr.length;
  const roundsTotal = n - 1;

  for (let round = 0; round < roundsTotal; round += 1) {
    const pairs = [];

    for (let i = 0; i < n / 2; i += 1) {
      const a = arr[i];
      const b = arr[n - 1 - i];

      const evenRound = round % 2 === 0;
      const whiteId = evenRound ? a : b;
      const blackId = evenRound ? b : a;

      pairs.push({ whiteId, blackId });
    }

    rounds.push(pairs);

    const fixed = arr[0];
    const moving = arr.slice(1);
    moving.unshift(moving.pop());
    arr.splice(0, arr.length, fixed, ...moving);
  }

  return rounds;
}

function comparePlayersForPairing(a, b) {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  return b.rating - a.rating;
}

function chooseByePlayer(players) {
  const candidates = [...players]
    .filter((p) => !p.hadBye)
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }
      return a.rating - b.rating;
    });

  return candidates[0] || players[players.length - 1];
}

function getByeCandidates(players) {
  return [...players].sort((a, b) => {
    if (a.hadBye !== b.hadBye) {
      return a.hadBye ? 1 : -1;
    }
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return a.rating - b.rating;
  });
}

function buildSwissNonRepeatPairings(players) {
  if (players.length % 2 === 1) {
    return null;
  }

  function hasLegalOpponent(player, pool) {
    for (const c of pool) {
      if (c.id !== player.id && !player.opponents.includes(c.id)) {
        return true;
      }
    }
    return false;
  }

  function isPoolFeasible(pool) {
    for (const p of pool) {
      if (!hasLegalOpponent(p, pool)) {
        return false;
      }
    }
    return true;
  }

  function pairScore(a, b) {
    let score = 0;
    score -= Math.abs(a.score - b.score) * 10;
    score -= Math.abs(a.rating - b.rating) / 100;
    score += colorCompatibility(a, b);
    return score;
  }

  function search(pool) {
    if (pool.length === 0) {
      return [];
    }

    const p1 = pool[0];
    const rest = pool.slice(1);
    const candidates = rest
      .filter((c) => !p1.opponents.includes(c.id))
      .sort((a, b) => pairScore(p1, b) - pairScore(p1, a));

    for (const p2 of candidates) {
      const nextPool = rest.filter((p) => p.id !== p2.id);
      if (nextPool.length > 0 && !isPoolFeasible(nextPool)) {
        continue;
      }

      const tail = search(nextPool);
      if (tail) {
        return [[p1, p2], ...tail];
      }
    }

    return null;
  }

  return search(players);
}

function colorCompatibility(a, b) {
  const aPref = preferredColor(a);
  const bPref = preferredColor(b);

  if (aPref && bPref && aPref !== bPref) {
    return 4;
  }

  if (aPref && bPref && aPref === bPref) {
    return -3;
  }

  return 0;
}

function preferredColor(player) {
  const whites = player.colors.filter((c) => c === "W").length;
  const blacks = player.colors.filter((c) => c === "B").length;

  if (whites - blacks >= 1) {
    return "B";
  }

  if (blacks - whites >= 1) {
    return "W";
  }

  return null;
}

function hasColorStreak(player, color) {
  if (player.colors.length < 2) {
    return false;
  }

  const lastTwo = player.colors.slice(-2);
  return lastTwo[0] === color && lastTwo[1] === color;
}

function assignColors(a, b) {
  const options = [
    { white: a, black: b, score: scoreColorAssignment(a, b) },
    { white: b, black: a, score: scoreColorAssignment(b, a) },
  ];

  options.sort((x, y) => y.score - x.score);
  return { white: options[0].white, black: options[0].black };
}

function scoreColorAssignment(white, black) {
  let score = 0;
  const whitePref = preferredColor(white);
  const blackPref = preferredColor(black);

  if (whitePref === "W") {
    score += 3;
  }

  if (blackPref === "B") {
    score += 3;
  }

  if (hasColorStreak(white, "W")) {
    score -= 6;
  }

  if (hasColorStreak(black, "B")) {
    score -= 6;
  }

  return score;
}

function applyPendingMetadata(tournament, pairings) {
  for (const pair of pairings) {
    if (!pair.blackId) {
      continue;
    }

    const white = tournament.players.find((p) => p.id === pair.whiteId);
    const black = tournament.players.find((p) => p.id === pair.blackId);
    if (!white || !black) {
      continue;
    }

    white.opponents.push(black.id);
    black.opponents.push(white.id);
    white.colors.push("W");
    black.colors.push("B");
  }
}

function updateResult(roundIdx, board, value) {
  const t = state.currentTournament;
  const round = t.rounds[roundIdx];
  if (!round || round.round < t.currentRound) {
    return;
  }

  const pairing = round.pairings.find((p) => p.board === board);
  if (!pairing || !pairing.blackId) {
    return;
  }

  rollbackResultIfNeeded(t, round.round, pairing);
  pairing.result = value;

  const white = t.players.find((p) => p.id === pairing.whiteId);
  const black = t.players.find((p) => p.id === pairing.blackId);
  if (!white || !black) {
    return;
  }

  if (value === "1-0") {
    white.score += 1;
    white.resultsByRound[round.round] = "W";
    black.resultsByRound[round.round] = "L";
  } else if (value === "0-1") {
    black.score += 1;
    black.resultsByRound[round.round] = "W";
    white.resultsByRound[round.round] = "L";
  } else if (value === "0.5-0.5") {
    white.score += 0.5;
    black.score += 0.5;
    white.resultsByRound[round.round] = "D";
    black.resultsByRound[round.round] = "D";
  }

  t.updatedAt = new Date().toISOString();
  saveAndRender();
}

function rollbackResultIfNeeded(tournament, roundNumber, pairing) {
  const white = tournament.players.find((p) => p.id === pairing.whiteId);
  const black = tournament.players.find((p) => p.id === pairing.blackId);

  if (!white || !black) {
    return;
  }

  if (pairing.result === "1-0") {
    white.score -= 1;
  }

  if (pairing.result === "0-1") {
    black.score -= 1;
  }

  if (pairing.result === "0.5-0.5") {
    white.score -= 0.5;
    black.score -= 0.5;
  }

  delete white.resultsByRound[roundNumber];
  delete black.resultsByRound[roundNumber];
}

function isLastRoundComplete(tournament) {
  if (tournament.rounds.length === 0) {
    return true;
  }

  const lastRound = tournament.rounds[tournament.rounds.length - 1];
  return lastRound.pairings.every((pair) => !pair.blackId || pair.result !== "pending");
}

function getBuchholz(tournament, player) {
  return getOpponentScores(tournament, player).reduce((sum, x) => sum + x, 0);
}

function getOpponentScores(tournament, player) {
  return player.opponents
    .map((id) => tournament.players.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => Number(p.score) || 0);
}

function getSolkPlus(tournament, player) {
  const scores = getOpponentScores(tournament, player).sort((a, b) => a - b);
  if (scores.length === 0) {
    return 0;
  }
  if (scores.length === 1) {
    return scores[0];
  }
  return scores.slice(1).reduce((sum, x) => sum + x, 0);
}

function getTSolk(tournament, player) {
  const scores = getOpponentScores(tournament, player).sort((a, b) => a - b);
  if (scores.length <= 2) {
    return scores.reduce((sum, x) => sum + x, 0);
  }
  return scores.slice(1, -1).reduce((sum, x) => sum + x, 0);
}

function getSonnebornBerger(tournament, player) {
  let total = 0;

  for (const [roundNo, res] of Object.entries(player.resultsByRound)) {
    if (res === "BYE") {
      continue;
    }

    const round = tournament.rounds.find((r) => r.round === Number(roundNo));
    if (!round) {
      continue;
    }

    const game = round.pairings.find((p) => p.whiteId === player.id || p.blackId === player.id);
    if (!game || !game.blackId) {
      continue;
    }

    const oppId = game.whiteId === player.id ? game.blackId : game.whiteId;
    const opp = tournament.players.find((p) => p.id === oppId);
    if (!opp) {
      continue;
    }

    if (res === "W") {
      total += opp.score;
    }

    if (res === "D") {
      total += opp.score / 2;
    }
  }

  return total;
}

function getWins(player) {
  return Object.values(player.resultsByRound || {}).filter((r) => r === "W").length;
}

function getHeadToHeadPointsForGroup(tournament, player, tiedIdSet) {
  let total = 0;

  for (const round of tournament.rounds || []) {
    for (const game of round.pairings || []) {
      if (!game.blackId) {
        continue;
      }

      if (game.result !== "1-0" && game.result !== "0-1" && game.result !== "0.5-0.5") {
        continue;
      }

      if (game.whiteId !== player.id && game.blackId !== player.id) {
        continue;
      }

      const opponentId = game.whiteId === player.id ? game.blackId : game.whiteId;
      if (!tiedIdSet.has(opponentId)) {
        continue;
      }

      if (game.result === "0.5-0.5") {
        total += 0.5;
        continue;
      }

      const playerIsWhite = game.whiteId === player.id;
      const didPlayerWin = (playerIsWhite && game.result === "1-0") || (!playerIsWhite && game.result === "0-1");
      total += didPlayerWin ? 1 : 0;
    }
  }

  return total;
}

function getStandings(tournament) {
  const enriched = tournament.players.map((p) => ({
    ...p,
    h2h: 0,
    wins: getWins(p),
    buchholz: getBuchholz(tournament, p),
    solkPlus: getSolkPlus(tournament, p),
    tsolk: getTSolk(tournament, p),
    sb: getSonnebornBerger(tournament, p),
  }));

  const grouped = new Map();
  for (const player of enriched) {
    const key = Number(player.score).toFixed(4);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(player);
  }

  const scoreKeys = [...grouped.keys()].sort((a, b) => Number(b) - Number(a));
  const criteria = normalizeTieBreakOrder(tournament.tieBreakOrder, { fillDefaults: false }).filter((x) => x !== "none");
  const ordered = [];

  for (const key of scoreKeys) {
    const group = grouped.get(key);
    const tiedIds = new Set(group.map((p) => p.id));
    for (const player of group) {
      player.h2h = getHeadToHeadPointsForGroup(tournament, player, tiedIds);
    }

    group.sort((a, b) => {
      for (const criterion of criteria) {
        if (criterion === "head_to_head" && b.h2h !== a.h2h) {
          return b.h2h - a.h2h;
        }
        if (criterion === "buchholz" && b.buchholz !== a.buchholz) {
          return b.buchholz - a.buchholz;
        }
        if (criterion === "solk_plus" && b.solkPlus !== a.solkPlus) {
          return b.solkPlus - a.solkPlus;
        }
        if (criterion === "tsolk" && b.tsolk !== a.tsolk) {
          return b.tsolk - a.tsolk;
        }
        if (criterion === "sb" && b.sb !== a.sb) {
          return b.sb - a.sb;
        }
        if (criterion === "wins" && b.wins !== a.wins) {
          return b.wins - a.wins;
        }
        if (criterion === "rating" && b.rating !== a.rating) {
          return b.rating - a.rating;
        }
      }

      return String(a.name || "").localeCompare(String(b.name || ""), "uk");
    });

    ordered.push(...group);
  }

  return ordered;
}

function buildRoundCells(tournament, player, placeById) {
  let html = "";

  for (let roundNo = 1; roundNo <= tournament.roundsCount; roundNo += 1) {
    const round = tournament.rounds.find((r) => r.round === roundNo);
    if (!round) {
      html += '<td><span class="round-chip chip-empty">-</span></td>';
      continue;
    }

    const game = round.pairings.find((pair) => pair.whiteId === player.id || pair.blackId === player.id);
    if (!game) {
      html += '<td><span class="round-chip chip-empty">-</span></td>';
      continue;
    }

    if (!game.blackId) {
      html += '<td><span class="round-chip chip-bye">BYE</span></td>';
      continue;
    }

    const isWhite = game.whiteId === player.id;
    const oppId = isWhite ? game.blackId : game.whiteId;
    const opponent = tournament.players.find((p) => p.id === oppId);
    const oppNo = placeById[oppId] || "?";
    const color = isWhite ? "w" : "b";

    let result = "*";
    const r = player.resultsByRound[roundNo];
    if (r === "W") {
      result = "1";
    } else if (r === "D") {
      result = "0.5";
    } else if (r === "L") {
      result = "0";
    }

    const tooltip = opponent ? `Суперник: ${opponent.name} (місце ${oppNo})` : "Суперник невідомий";
    html += `<td><span class="round-chip" data-tooltip="${escapeHtml(tooltip)}">${oppNo}${color} ${result}</span></td>`;
  }

  return html;
}

function ensureStartNumbers(tournament) {
  let changed = false;
  const byRating = [...tournament.players].sort((a, b) => b.rating - a.rating);

  for (let i = 0; i < byRating.length; i += 1) {
    const p = byRating[i];
    if (!Number.isInteger(p.startNo)) {
      p.startNo = i + 1;
      changed = true;
    }
  }

  if (changed) {
    tournament.updatedAt = new Date().toISOString();
  }
}

function archiveCurrentTournament({ notify }) {
  const t = state.currentTournament;
  if (t.players.length === 0) {
    if (notify) {
      alert("Немає даних для збереження.");
    }
    return false;
  }

  const snapshot = cloneTournament(t);
  snapshot.status = "archived";
  snapshot.finishedAt = new Date().toISOString();

  const idx = state.tournamentsArchive.findIndex((x) => x.id === snapshot.id);
  if (idx >= 0) {
    state.tournamentsArchive[idx] = snapshot;
  } else {
    state.tournamentsArchive.push(snapshot);
  }

  applyTournamentResultsToPlayerBase(snapshot);

  if (notify) {
    alert("Турнір збережено в архів.");
  }

  saveAndRender();
  return true;
}

function finishCurrentTournament() {
  const t = state.currentTournament;
  if (t.players.length === 0) {
    alert("У турнірі немає учасників.");
    return;
  }

  if (t.currentRound === 0) {
    if (!confirm("Турнір ще без турів. Все одно завершити і перенести в архів?")) {
      return;
    }
  }

  if (t.currentRound > 0 && !isLastRoundComplete(t)) {
    if (!confirm("У поточному турі є невнесені результати. Завершити турнір все одно?")) {
      return;
    }
  }

  archiveCurrentTournament({ notify: false });
  state.currentTournament = createDefaultTournament();
  tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
  state.activeTab = "tournament";
  state.tournamentView = "setup";
  state.archivePreviewTournamentId = null;
  saveAndRender();
  alert("Турнір завершено і перенесено в архів.");
}

function applyTournamentResultsToPlayerBase(tournamentSnapshot) {
  const standings = getStandings(tournamentSnapshot);
  const placeById = Object.fromEntries(standings.map((p, idx) => [p.id, idx + 1]));

  for (const tp of tournamentSnapshot.players) {
    let base = null;

    if (tp.basePlayerId) {
      base = state.playerBase.find((bp) => bp.id === tp.basePlayerId);
    }

    if (!base) {
      base = state.playerBase.find((bp) => getBaseFullName(bp).toLowerCase() === tp.name.toLowerCase());
    }

    if (!base) {
      const split = splitFullName(tp.name);
      base = createBasePlayerRecord(split.lastName, split.firstName, tp.rating);
      state.playerBase.push(base);
    }

    const { games, wins, draws, losses, bye } = countPlayerStats(tp);

    const entry = {
      tournamentId: tournamentSnapshot.id,
      tournamentName: tournamentSnapshot.name,
      finishedAt: tournamentSnapshot.finishedAt,
      place: placeById[tp.id] || null,
      score: Number(tp.score) || 0,
      games,
      wins,
      draws,
      losses,
      bye,
      rounds: tournamentSnapshot.currentRound,
      opponents: collectOpponentsForPlayer(tournamentSnapshot, tp.id),
    };

    const existingIdx = base.history.findIndex((h) => h.tournamentId === tournamentSnapshot.id);
    if (existingIdx >= 0) {
      base.history[existingIdx] = entry;
    } else {
      base.history.push(entry);
    }
  }

  recalcAllBaseStats();
}

function countPlayerStats(tPlayer) {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let bye = 0;

  for (const res of Object.values(tPlayer.resultsByRound || {})) {
    if (res === "W") {
      wins += 1;
    }

    if (res === "D") {
      draws += 1;
    }

    if (res === "L") {
      losses += 1;
    }

    if (res === "BYE") {
      bye += 1;
    }
  }

  return {
    games: wins + draws + losses,
    wins,
    draws,
    losses,
    bye,
  };
}

function collectOpponentsForPlayer(tournament, playerId) {
  const result = [];

  for (const round of tournament.rounds || []) {
    const game = (round.pairings || []).find((p) => p.whiteId === playerId || p.blackId === playerId);
    if (!game || !game.blackId) {
      continue;
    }

    const oppId = game.whiteId === playerId ? game.blackId : game.whiteId;
    const opp = tournament.players.find((p) => p.id === oppId);
    if (!opp) {
      continue;
    }

    result.push(`R${round.round}: ${opp.name}`);
  }

  return result;
}

function recalcAllBaseStats() {
  for (const base of state.playerBase) {
    const stats = emptyStats();
    for (const h of base.history) {
      stats.tournaments += 1;
      stats.games += Number(h.games) || 0;
      stats.wins += Number(h.wins) || 0;
      stats.draws += Number(h.draws) || 0;
      stats.losses += Number(h.losses) || 0;
      stats.bye += Number(h.bye) || 0;
      stats.totalScore += Number(h.score) || 0;
    }

    base.stats = stats;
  }
}

function loadTournamentFromArchive(tournamentId) {
  const archived = state.tournamentsArchive.find((t) => t.id === tournamentId);
  if (!archived) {
    return;
  }

  if (state.currentTournament.players.length > 0 && !confirm("Поточний турнір буде замінено. Продовжити?")) {
    return;
  }

  state.currentTournament = cloneTournament(archived);
  state.currentTournament.status = "archived_view";
  state.currentTournament.updatedAt = new Date().toISOString();
  state.activeTab = "tournament";
  saveAndRender();
}

function deleteArchivedTournament(tournamentId) {
  if (!confirm("Видалити турнір з архіву?")) {
    return;
  }

  state.tournamentsArchive = state.tournamentsArchive.filter((t) => t.id !== tournamentId);
  if (state.archivePreviewTournamentId === tournamentId) {
    state.archivePreviewTournamentId = null;
  }

  for (const bp of state.playerBase) {
    bp.history = bp.history.filter((h) => h.tournamentId !== tournamentId);
  }

  recalcAllBaseStats();
  saveAndRender();
}

function createNewTournamentFlow() {
  const t = state.currentTournament;

  if (t.players.length > 0 || t.currentRound > 0) {
    const ok = confirm("Створити новий турнір? Незавершений поточний турнір НЕ потрапить в архів.");
    if (!ok) {
      return;
    }
  }

  state.currentTournament = createDefaultTournament();
  tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
  state.activeTab = "tournament";
  state.tournamentView = "setup";
  state.archivePreviewTournamentId = null;
  saveAndRender();
}

function cloneTournament(tournament) {
  if (typeof structuredClone === "function") {
    return structuredClone(tournament);
  }

  return JSON.parse(JSON.stringify(tournament));
}

function saveAndRender() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    if (isQuotaExceededError(error)) {
      alert("Браузерне сховище переповнене. Зменште розмір/кількість фото і спробуйте знову.");
    } else {
      alert("Не вдалося зберегти зміни в браузері. Спробуйте ще раз.");
    }
    console.error(error);
  }
  render();
}

function isQuotaExceededError(error) {
  return Boolean(
    error &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        error.code === 22 ||
        error.code === 1014)
  );
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat("uk-UA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDateOnly(isoDate) {
  if (!isoDate) {
    return "-";
  }

  const safe = `${isoDate}T00:00:00`;
  try {
    return new Intl.DateTimeFormat("uk-UA", { dateStyle: "medium" }).format(new Date(safe));
  } catch {
    return isoDate;
  }
}

function formatDateForInput(isoDate) {
  return normalizeBirthDate(isoDate);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
