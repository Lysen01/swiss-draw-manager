// Auto-generated file. Do not edit directly.
// Source: src/app/*.js
// ===== 00-constants.js =====
const STORAGE_KEY = "swiss-manager-v2";
const LEGACY_STORAGE_KEY = "swiss-manager-v1";
const KYIV_PRESET_VERSION = "kyiv-v1";
const API_BASE_URL_STORAGE_KEY = "arbiter-api-origin";
const AUTH_TOKEN_STORAGE_KEY = "arbiter-auth-token";
const REMOTE_SYNC_DEBOUNCE_MS = 400;
const DEFAULT_TOURNAMENT_COVER_URL = "/assets/default-tournament-cover.png";
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
const GENDER_OPTIONS = [
  { value: "", label: "Не вказано" },
  { value: "M", label: "М" },
  { value: "F", label: "Ж" },
];
const MAX_TOURNAMENT_PHOTO_BYTES = 15 * 1024 * 1024;
const MAX_TOURNAMENT_PHOTO_STORE_BYTES = 1_600_000;
const MAX_BASE_PLAYER_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_BASE_PLAYER_PHOTO_STORE_BYTES = 320_000;
const MAX_CLUB_LOGO_BYTES = 8 * 1024 * 1024;
const MAX_CLUB_LOGO_STORE_BYTES = 260_000;
const MAX_COACH_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_COACH_PHOTO_STORE_BYTES = 260_000;
const INTERNAL_RATING_K = 10;
const INTERNAL_RATING_DELTA_CAP = 80;
const INTERNAL_RATING_EXPECTED_TABLE = [
  { min: 0, max: 3, betterPercent: 50 },
  { min: 4, max: 10, betterPercent: 51 },
  { min: 11, max: 17, betterPercent: 52 },
  { min: 18, max: 25, betterPercent: 53 },
  { min: 26, max: 32, betterPercent: 54 },
  { min: 33, max: 39, betterPercent: 55 },
  { min: 40, max: 46, betterPercent: 56 },
  { min: 47, max: 53, betterPercent: 57 },
  { min: 54, max: 61, betterPercent: 58 },
  { min: 62, max: 68, betterPercent: 59 },
  { min: 69, max: 76, betterPercent: 60 },
  { min: 77, max: 83, betterPercent: 61 },
  { min: 84, max: 91, betterPercent: 62 },
  { min: 92, max: 98, betterPercent: 63 },
  { min: 99, max: 106, betterPercent: 64 },
  { min: 107, max: 113, betterPercent: 65 },
  { min: 114, max: 121, betterPercent: 66 },
  { min: 122, max: 129, betterPercent: 67 },
  { min: 130, max: 137, betterPercent: 68 },
  { min: 138, max: 145, betterPercent: 69 },
  { min: 146, max: 153, betterPercent: 70 },
  { min: 154, max: 162, betterPercent: 71 },
  { min: 163, max: 170, betterPercent: 72 },
  { min: 171, max: 179, betterPercent: 73 },
  { min: 180, max: 188, betterPercent: 74 },
  { min: 189, max: 197, betterPercent: 75 },
  { min: 198, max: 206, betterPercent: 76 },
  { min: 207, max: 215, betterPercent: 77 },
  { min: 216, max: 225, betterPercent: 78 },
  { min: 226, max: 235, betterPercent: 79 },
  { min: 236, max: 245, betterPercent: 80 },
  { min: 246, max: 256, betterPercent: 81 },
  { min: 257, max: 267, betterPercent: 82 },
  { min: 268, max: 278, betterPercent: 83 },
  { min: 279, max: 290, betterPercent: 84 },
  { min: 291, max: 302, betterPercent: 85 },
  { min: 303, max: 315, betterPercent: 86 },
  { min: 316, max: 328, betterPercent: 87 },
  { min: 329, max: 344, betterPercent: 88 },
  { min: 345, max: 357, betterPercent: 89 },
  { min: 358, max: 374, betterPercent: 90 },
  { min: 375, max: 391, betterPercent: 91 },
  { min: 392, max: 411, betterPercent: 92 },
  { min: 412, max: 432, betterPercent: 93 },
  { min: 433, max: 456, betterPercent: 94 },
  { min: 457, max: 484, betterPercent: 95 },
  { min: 485, max: 517, betterPercent: 96 },
  { min: 518, max: 559, betterPercent: 97 },
  { min: 560, max: 619, betterPercent: 98 },
  { min: 620, max: 735, betterPercent: 99 },
  { min: 736, max: Number.POSITIVE_INFINITY, betterPercent: 100 },
];

// ===== 01-globals.js =====
let state;
let stateRevision = 0;
let hasStoredLocalState = false;
let editingBasePlayerId = null;
let editingClubId = null;
let editingCoachId = null;
let tournamentSettingsDraft = null;
let tournamentBaseLookup = [];
let filteredTournamentBaseLookup = [];
let selectedBasePlayerIds = new Set();
let basePlayersSort = { key: "rating", dir: "desc" };
let manualRoundBuilderOpen = false;
let selectedClubProfileId = null;
let selectedClubPlayerProfileId = null;
let selectedClubPlayerProfileTab = "info";
let selectedClubsView = "directory";
let selectedClubDetailTab = "profile";
let showClubPlayerAddForms = false;
let showClubCoachAddForm = false;
let selectedBasePlayerProfileId = null;
let selectedBasePlayerProfileTab = "ranking";
let showBasePlayerAddForm = false;
let tournamentsSearchQuery = "";
let tournamentsStatusFilter = "all";
let tournamentsDateFrom = "";
let tournamentsDateTo = "";
let remoteApiBaseUrl = null;
let remoteKnownClubIds = new Set();
let remoteKnownCoachIds = new Set();
let remoteKnownPlayerIds = new Set();
let remoteKnownTournamentIds = new Set();
let remoteSyncTimerId = null;
let remoteSyncInFlight = false;
let remoteSyncQueued = false;
let remoteBootstrapStarted = false;
let remoteBootstrapRevision = 0;
let authToken = "";
let authUser = null;
let persistenceInfo = {
  mode: "local",
  status: "idle",
  message: "Автономний режим: збереження лише в браузері.",
  lastSyncedAt: "",
};

const els = {
  authMenu: document.querySelector(".auth-menu"),
  authForm: document.getElementById("authForm"),
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  authLoginBtn: document.getElementById("authLoginBtn"),
  authUserWrap: document.getElementById("authUserWrap"),
  authUserLabel: document.getElementById("authUserLabel"),
  authLogoutBtn: document.getElementById("authLogoutBtn"),
  authStatus: document.getElementById("authStatus"),
  tabsNav: document.getElementById("tabsNav"),
  tabPanels: {
    tournament: document.getElementById("tab-tournament"),
    players: document.getElementById("tab-players"),
    clubs: document.getElementById("tab-clubs"),
    archive: document.getElementById("tab-archive"),
  },
  tournamentSubtabs: document.getElementById("tournamentSubtabs"),
  tournamentViewPanels: document.querySelectorAll("[data-tour-view]"),
  clubsSubtabs: document.getElementById("clubsSubtabs"),
  clubsViewPanels: document.querySelectorAll("#tab-clubs section[data-club-view]"),
  settingsForm: document.getElementById("settingsForm"),
  tournamentName: document.getElementById("tournamentName"),
  roundsCount: document.getElementById("roundsCount"),
  roundsRuleHint: document.getElementById("roundsRuleHint"),
  tournamentFormat: document.getElementById("tournamentFormat"),
  tournamentDate: document.getElementById("tournamentDate"),
  tournamentTimeControl: document.getElementById("tournamentTimeControl"),
  tournamentChiefJudge: document.getElementById("tournamentChiefJudge"),
  tournamentIsMicromatch: document.getElementById("tournamentIsMicromatch"),
  scoreCalculationWrap: document.getElementById("scoreCalculationWrap"),
  scoreCalculationType: document.getElementById("scoreCalculationType"),
  tournamentPhoto: document.getElementById("tournamentPhoto"),
  tournamentRemovePhoto: document.getElementById("tournamentRemovePhoto"),
  tournamentSettingsPreview: document.getElementById("tournamentSettingsPreview"),
  tournamentSettingsPhoto: document.getElementById("tournamentSettingsPhoto"),
  tournamentSettingsDate: document.getElementById("tournamentSettingsDate"),
  tournamentSettingsControl: document.getElementById("tournamentSettingsControl"),
  tournamentSettingsChiefJudge: document.getElementById("tournamentSettingsChiefJudge"),
  settingsSubmitBtn: document.getElementById("settingsSubmitBtn"),
  archiveSettingsCancelBtn: document.getElementById("archiveSettingsCancelBtn"),
  tieBreak1: document.getElementById("tieBreak1"),
  tieBreak2: document.getElementById("tieBreak2"),
  tieBreak3: document.getElementById("tieBreak3"),
  tieBreak4: document.getElementById("tieBreak4"),
  tieBreak5: document.getElementById("tieBreak5"),
  dbPlayerSelect: document.getElementById("dbPlayerSelect"),
  tournamentClubFilter: document.getElementById("tournamentClubFilter"),
  dbPlayerChecklist: document.getElementById("dbPlayerChecklist"),
  selectAllBaseBtn: document.getElementById("selectAllBaseBtn"),
  addFromBaseBtn: document.getElementById("addFromBaseBtn"),
  playersList: document.getElementById("playersList"),
  generateRoundBtn: document.getElementById("generateRoundBtn"),
  manualRoundBtn: document.getElementById("manualRoundBtn"),
  manualPairingPanel: document.getElementById("manualPairingPanel"),
  printRoundBtn: document.getElementById("printRoundBtn"),
  roundMeta: document.getElementById("roundMeta"),
  pairings: document.getElementById("pairings"),
  standings: document.getElementById("standings"),
  seedDemoBtn: document.getElementById("seedDemoBtn"),
  finishTournamentBtn: document.getElementById("finishTournamentBtn"),
  resetBtn: document.getElementById("resetBtn"),
  basePlayerForm: document.getElementById("basePlayerForm"),
  openBasePlayerFormBtn: document.getElementById("openBasePlayerFormBtn"),
  basePlayerFormWrap: document.getElementById("basePlayerFormWrap"),
  basePlayerLastName: document.getElementById("basePlayerLastName"),
  basePlayerFirstName: document.getElementById("basePlayerFirstName"),
  basePlayerRating: document.getElementById("basePlayerRating"),
  basePlayerGender: document.getElementById("basePlayerGender"),
  basePlayerRank: document.getElementById("basePlayerRank"),
  basePlayerBirthDate: document.getElementById("basePlayerBirthDate"),
  basePlayerClub: document.getElementById("basePlayerClub"),
  basePlayerCoach: document.getElementById("basePlayerCoach"),
  basePlayerPhoto: document.getElementById("basePlayerPhoto"),
  basePlayerRemovePhoto: document.getElementById("basePlayerRemovePhoto"),
  basePlayerSubmitBtn: document.getElementById("basePlayerSubmitBtn"),
  basePlayerCancelEditBtn: document.getElementById("basePlayerCancelEditBtn"),
  baseEditHint: document.getElementById("baseEditHint"),
  basePlayersSearch: document.getElementById("basePlayersSearch"),
  basePlayersGenderFilter: document.getElementById("basePlayersGenderFilter"),
  basePlayersRatingFrom: document.getElementById("basePlayersRatingFrom"),
  basePlayersRatingTo: document.getElementById("basePlayersRatingTo"),
  basePlayersClubFilter: document.getElementById("basePlayersClubFilter"),
  basePlayersClearFilters: document.getElementById("basePlayersClearFilters"),
  basePlayersSummary: document.getElementById("basePlayersSummary"),
  basePlayersList: document.getElementById("basePlayersList"),
  basePlayerProfile: document.getElementById("basePlayerProfile"),
  clubForm: document.getElementById("clubForm"),
  clubName: document.getElementById("clubName"),
  clubCity: document.getElementById("clubCity"),
  clubContact: document.getElementById("clubContact"),
  clubLogo: document.getElementById("clubLogo"),
  clubDescription: document.getElementById("clubDescription"),
  clubRemoveLogo: document.getElementById("clubRemoveLogo"),
  clubSubmitBtn: document.getElementById("clubSubmitBtn"),
  clubCancelEditBtn: document.getElementById("clubCancelEditBtn"),
  clubEditHint: document.getElementById("clubEditHint"),
  coachForm: document.getElementById("coachForm"),
  coachLastName: document.getElementById("coachLastName"),
  coachFirstName: document.getElementById("coachFirstName"),
  coachClub: document.getElementById("coachClub"),
  coachPhone: document.getElementById("coachPhone"),
  coachEmail: document.getElementById("coachEmail"),
  coachPhoto: document.getElementById("coachPhoto"),
  coachBio: document.getElementById("coachBio"),
  coachRemovePhoto: document.getElementById("coachRemovePhoto"),
  coachSubmitBtn: document.getElementById("coachSubmitBtn"),
  coachCancelEditBtn: document.getElementById("coachCancelEditBtn"),
  coachEditHint: document.getElementById("coachEditHint"),
  clubsList: document.getElementById("clubsList"),
  openAddClubBtn: document.getElementById("openAddClubBtn"),
  clubProfile: document.getElementById("clubProfile"),
  tournamentsSearch: document.getElementById("tournamentsSearch"),
  tournamentsStatusFilter: document.getElementById("tournamentsStatusFilter"),
  tournamentsDateFrom: document.getElementById("tournamentsDateFrom"),
  tournamentsDateTo: document.getElementById("tournamentsDateTo"),
  archiveList: document.getElementById("archiveList"),
  storageModeLabel: document.getElementById("storageModeLabel"),
  syncStatus: document.getElementById("syncStatus"),
};

// ===== 02-events.js =====
function bindEvents() {
  const closeAuthMenu = () => {
    if (!els.authMenu || !els.authMenu.open) {
      return;
    }
    els.authMenu.open = false;
    els.authMenu.querySelector("summary")?.blur();
  };

  const exitArchiveEditModeToArchiveTab = () => {
    state.currentTournament = createDefaultTournament();
    tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
    state.tournamentView = "setup";
    state.activeTab = "archive";
    state.archivePreviewTournamentId = null;
    manualRoundBuilderOpen = false;
    selectedBasePlayerIds.clear();
    if (els.dbPlayerSelect) {
      els.dbPlayerSelect.value = "";
    }
    if (els.tournamentClubFilter) {
      els.tournamentClubFilter.value = "all";
    }
  };

  const adminOnlyActions = new Set([
    "edit-club",
    "delete-club",
    "open-club-manage",
    "toggle-club-player-add",
    "toggle-club-coach-add",
    "add-to-tournament",
    "edit-club-coach",
    "edit-club-player",
    "remove-player-from-club",
    "delete-base-player",
    "edit-base-player",
    "remove-tour-player",
    "edit-tour-player",
    "edit-archive",
    "delete-archive",
    "confirm-auto-places",
    "finish-tournament-from-table",
    "emergency-finish-tournament",
  ]);

  const blockIfViewerAction = (action) => {
    if (!adminOnlyActions.has(String(action || ""))) {
      return false;
    }
    if (canManageAdminUi()) {
      return false;
    }
    alert("Режим перегляду: ця дія доступна тільки адміністратору.");
    return true;
  };

  if (els.authForm) {
    els.authForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = String(els.authEmail?.value || "").trim();
      const password = String(els.authPassword?.value || "");
      if (!email || !password) {
        alert("Введіть email і пароль.");
        return;
      }
      try {
        if (els.authLoginBtn) {
          els.authLoginBtn.disabled = true;
        }
        await loginAsAdmin(email, password);
        if (els.authPassword) {
          els.authPassword.value = "";
        }
        remoteBootstrapStarted = false;
        await bootstrapPersistence();
        saveAndRender();
        closeAuthMenu();
      } catch (error) {
        alert(`Помилка входу: ${String(error.message || error)}`);
      } finally {
        if (els.authLoginBtn) {
          els.authLoginBtn.disabled = false;
        }
      }
    });
  }

  if (els.authLogoutBtn) {
    els.authLogoutBtn.addEventListener("click", async () => {
      await logoutAdmin();
      remoteBootstrapStarted = false;
      await bootstrapPersistence();
      saveAndRender();
      closeAuthMenu();
    });
  }

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
    const nextTab = String(btn.dataset.tab || "").trim();
    if (nextTab && nextTab !== "clubs") {
      selectedClubPlayerProfileId = null;
      selectedClubPlayerProfileTab = "info";
      selectedClubDetailTab = "profile";
      selectedClubsView = "directory";
      showClubPlayerAddForms = false;
      showClubCoachAddForm = false;
    }
    if (nextTab && nextTab !== "players") {
      selectedBasePlayerProfileId = null;
      selectedBasePlayerProfileTab = "ranking";
      showBasePlayerAddForm = false;
    }
    state.activeTab = nextTab || state.activeTab;
    if (!canManageAdminUi() && state.activeTab === "tournament") {
      state.activeTab = "archive";
    }
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
    if (!canManageAdminUi()) {
      alert("Режим перегляду: редагування налаштувань турніру доступне лише адміністратору.");
      return;
    }
    captureTournamentSettingsDraftFromForm();
    const t = state.currentTournament;
    ensureTournamentSettingsDraftForCurrentTournament();
    const draft = tournamentSettingsDraft;
    const isArchivePreview = t.status === "archived_view";
    const nextFormat = draft.format;
    const manualRounds = Number(draft.roundsCount);
    const requiredRoundRobinRounds = getMaxRoundsByFormat("round_robin", t.players.length);
    const nextRounds = nextFormat === "round_robin" ? requiredRoundRobinRounds : manualRounds;
    const nextEventDate = normalizeBirthDate(draft.eventDate);
    const nextTimeControl = normalizeTimeControl(draft.timeControl);
    const nextChiefJudge = normalizeChiefJudge(draft.chiefJudge);

    if (!String(draft.name || "").trim()) {
      alert("Назва турніру обов'язкова.");
      els.tournamentName?.focus();
      return;
    }

    if (!nextEventDate) {
      alert("Дата проведення обов'язкова.");
      els.tournamentDate?.focus();
      return;
    }

    if (!nextTimeControl) {
      alert("Контроль часу обов'язковий.");
      els.tournamentTimeControl?.focus();
      return;
    }

    if (!nextChiefJudge) {
      alert("Головний суддя обов'язковий.");
      els.tournamentChiefJudge?.focus();
      return;
    }

    if (isArchivePreview) {
      t.name = draft.name || "Турнір";
      t.eventDate = nextEventDate;
      t.timeControl = nextTimeControl;
      t.chiefJudge = nextChiefJudge;
      t.updatedAt = new Date().toISOString();

      const archivedIdx = state.tournamentsArchive.findIndex((item) => item.id === t.id);
      if (archivedIdx >= 0) {
        const archivedSnapshot = cloneTournament(state.tournamentsArchive[archivedIdx]);
        archivedSnapshot.name = t.name;
        archivedSnapshot.eventDate = t.eventDate;
        archivedSnapshot.timeControl = t.timeControl;
        archivedSnapshot.chiefJudge = t.chiefJudge;
        archivedSnapshot.updatedAt = t.updatedAt;
        state.tournamentsArchive[archivedIdx] = normalizeArchivedTournament(archivedSnapshot);
      }

      exitArchiveEditModeToArchiveTab();
      saveAndRender();
      await flushRemoteSyncNow("archive-tournament-settings-save");
      return;
    }

    if (nextRounds < t.currentRound) {
      alert(`Не можна встановити менше турів, ніж уже зіграно (${t.currentRound}).`);
      return;
    }

    if (nextFormat !== t.format && t.currentRound > 0) {
      alert("Після старту турніру не можна змінити формат.");
      return;
    }

    if (Boolean(draft.isMicromatch) !== Boolean(t.isMicromatch) && t.currentRound > 0) {
      alert("Після старту турніру не можна змінити режим мікроматчів.");
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

    const wasConfiguredBefore =
      Boolean(String(t.name || "").trim()) &&
      Boolean(normalizeBirthDate(t.eventDate)) &&
      Boolean(normalizeTimeControl(t.timeControl)) &&
      Boolean(normalizeChiefJudge(t.chiefJudge)) &&
      Number(t.players?.length || 0) > 0;

    t.name = draft.name || "Турнір";
    t.roundsCount = nextRounds;
    t.format = nextFormat;
    t.isMicromatch = Boolean(draft.isMicromatch);
    t.scoreCalculationType = t.isMicromatch && draft.scoreCalculationType === "small_points" ? "small_points" : "big_points";
    t.eventDate = nextEventDate;
    t.timeControl = nextTimeControl;
    t.chiefJudge = nextChiefJudge;
    t.setupNotified = Boolean(t.setupNotified);
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

    const configuredNow =
      Boolean(String(t.name || "").trim()) &&
      Boolean(t.eventDate) &&
      Boolean(t.timeControl) &&
      Boolean(t.chiefJudge) &&
      Number(t.players?.length || 0) > 0;
    if (!isArchivePreview && !wasConfiguredBefore && configuredNow && !t.setupNotified) {
      t.setupNotified = true;
      alert("Турнір створено. Перейдіть у вкладку «Раунди» та проведіть його.");
    }

    tournamentSettingsDraft = createTournamentSettingsDraft(t);
    saveAndRender();
    await flushRemoteSyncNow("tournament-settings-save");
  });

  if (els.archiveSettingsCancelBtn) {
    els.archiveSettingsCancelBtn.addEventListener("click", () => {
      const t = state.currentTournament;
      if (!t || t.status !== "archived_view" || !canManageAdminUi()) {
        return;
      }

      exitArchiveEditModeToArchiveTab();
      saveAndRender();
    });
  }

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
    if (tournamentSettingsDraft.eventDate && state.currentTournament?.status !== "archived_view") {
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

  if (els.tournamentIsMicromatch) {
    els.tournamentIsMicromatch.addEventListener("change", () => {
      ensureTournamentSettingsDraftForCurrentTournament();
      tournamentSettingsDraft.isMicromatch = Boolean(els.tournamentIsMicromatch.checked);
      if (!tournamentSettingsDraft.isMicromatch) {
        tournamentSettingsDraft.scoreCalculationType = "big_points";
      }
      renderScoreCalculationControls();
    });
  }

  if (els.scoreCalculationType) {
    els.scoreCalculationType.addEventListener("change", () => {
      ensureTournamentSettingsDraftForCurrentTournament();
      tournamentSettingsDraft.scoreCalculationType = els.scoreCalculationType.value === "small_points" ? "small_points" : "big_points";
    });
  }

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
  if (els.tournamentClubFilter) {
    els.tournamentClubFilter.addEventListener("change", () => {
      selectedBasePlayerIds.clear();
      renderBaseSelect();
    });
  }

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
    if (!canManageAdminUi()) {
      alert("Режим перегляду: генерація туру доступна лише адміністратору.");
      return;
    }
    generateNextRound();
  });
  els.manualRoundBtn.addEventListener("click", () => {
    if (!canManageAdminUi()) {
      alert("Режим перегляду: ручне формування туру доступне лише адміністратору.");
      return;
    }
    captureTournamentSettingsDraftFromForm();
    manualRoundBuilderOpen = !manualRoundBuilderOpen;
    render();
  });

  if (els.clubsSubtabs) {
    els.clubsSubtabs.addEventListener("click", (event) => {
      const btn = event.target.closest(".subtab-btn[data-club-view]");
      if (!btn) {
        return;
      }
      const nextView = btn.dataset.clubView;
      if (!nextView) {
        return;
      }
      selectedClubsView = nextView;
      if (nextView !== "profile") {
        selectedClubPlayerProfileId = null;
        selectedClubPlayerProfileTab = "info";
        selectedClubDetailTab = "profile";
      }
      renderClubsTab();
    });
  }
  els.manualPairingPanel.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    if (btn.dataset.action === "create-manual-round") {
      createManualRoundFromForm();
    }

    if (btn.dataset.action === "cancel-manual-round") {
      manualRoundBuilderOpen = false;
      render();
    }
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
    if (!canManageAdminUi()) {
      alert("Режим перегляду: завершення турніру доступне лише адміністратору.");
      return;
    }
    void finishCurrentTournament();
  });

  if (els.resetBtn) {
    els.resetBtn.addEventListener("click", () => {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: створення нового турніру доступне лише адміністратору.");
        return;
      }
      captureTournamentSettingsDraftFromForm();
      createNewTournamentFlow();
    });
  }

  els.basePlayerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canManageAdminUi()) {
      alert("Режим перегляду: додавання гравців доступне лише адміністратору.");
      return;
    }
    await submitBasePlayerForm();
  });

  if (els.openBasePlayerFormBtn) {
    els.openBasePlayerFormBtn.addEventListener("click", () => {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: додавання гравців доступне лише адміністратору.");
        return;
      }
      if (showBasePlayerAddForm) {
        resetBasePlayerForm({ keepOpen: false });
        return;
      }
      showBasePlayerAddForm = true;
      syncBasePlayerFormVisibility();
      if (!editingBasePlayerId) {
        els.basePlayerLastName?.focus();
      }
    });
  }

  els.basePlayerCancelEditBtn.addEventListener("click", () => {
    resetBasePlayerForm({ keepOpen: true });
  });

  els.basePlayerClub.addEventListener("change", () => {
    renderBasePlayerOwnershipSelectors(null);
  });

  for (const control of [
    els.basePlayersSearch,
    els.basePlayersGenderFilter,
    els.basePlayersRatingFrom,
    els.basePlayersRatingTo,
    els.basePlayersClubFilter,
  ]) {
    control.addEventListener("input", () => {
      renderBasePlayersTab();
    });
    control.addEventListener("change", () => {
      renderBasePlayersTab();
    });
  }

  els.basePlayersClearFilters.addEventListener("click", () => {
    els.basePlayersSearch.value = "";
    els.basePlayersGenderFilter.value = "all";
    els.basePlayersRatingFrom.value = "";
    els.basePlayersRatingTo.value = "";
    els.basePlayersClubFilter.value = "all";
    renderBasePlayersTab();
  });

  els.clubForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canManageAdminUi()) {
      alert("Режим перегляду: редагування клубів доступне лише адміністратору.");
      return;
    }
    await submitClubForm();
  });

  els.clubCancelEditBtn.addEventListener("click", () => {
    resetClubForm();
  });

  els.coachForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canManageAdminUi()) {
      alert("Режим перегляду: редагування тренерів доступне лише адміністратору.");
      return;
    }
    await submitCoachForm();
  });

  els.coachCancelEditBtn.addEventListener("click", () => {
    resetCoachForm();
  });

  if (els.openAddClubBtn) {
    els.openAddClubBtn.addEventListener("click", () => {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: редагування клубів доступне лише адміністратору.");
        return;
      }
      resetClubForm();
      resetCoachForm();
      selectedClubsView = "manage";
      selectedClubDetailTab = "profile";
      renderClubsTab();
      els.clubName?.focus();
    });
  }

  els.clubsList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    const clubId = btn.dataset.clubId;
    const action = btn.dataset.action;
    if (blockIfViewerAction(action)) {
      return;
    }

    if (action === "view-club") {
      selectedClubProfileId = clubId || null;
      selectedClubPlayerProfileId = null;
      selectedClubPlayerProfileTab = "info";
      selectedClubDetailTab = "profile";
      showClubPlayerAddForms = false;
      showClubCoachAddForm = false;
      selectedClubsView = "profile";
      renderClubsTab();
    }

    if (action === "edit-club") {
      startEditClub(clubId);
    }

    if (action === "delete-club") {
      deleteClub(clubId);
    }

    if (action === "open-club-manage") {
      resetClubForm();
      resetCoachForm();
      selectedClubsView = "manage";
      selectedClubDetailTab = "profile";
      renderClubsTab();
      els.clubName?.focus();
    }
  });

  els.clubProfile.addEventListener("submit", async (event) => {
    const form = event.target.closest("form[data-action]");
    if (!form) {
      return;
    }
    event.preventDefault();
    if (form.dataset.action === "quick-add-club-player") {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: редагування доступне лише адміністратору.");
        return;
      }
      await submitQuickClubPlayerForm(form);
    }
    if (form.dataset.action === "attach-existing-player") {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: редагування доступне лише адміністратору.");
        return;
      }
      submitAttachExistingPlayerToClubForm(form);
    }
    if (form.dataset.action === "quick-add-club-coach") {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: редагування доступне лише адміністратору.");
        return;
      }
      await submitQuickClubCoachForm(form);
    }
  });

  els.clubProfile.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }
    if (blockIfViewerAction(btn.dataset.action)) {
      return;
    }

    const playerId = btn.dataset.playerId;
    if (btn.dataset.action === "add-to-tournament") {
      addBasePlayerToTournament(playerId);
    }

    if (btn.dataset.action === "view-player-profile") {
      selectedClubPlayerProfileId = playerId || null;
      selectedClubPlayerProfileTab = "info";
      selectedClubDetailTab = "players";
      selectedClubsView = "profile";
      renderClubsTab();
    }

    if (btn.dataset.action === "set-player-profile-tab") {
      const tab = String(btn.dataset.tab || "").trim();
      if (!tab) {
        return;
      }
      selectedClubPlayerProfileTab = tab;
      selectedClubsView = "profile";
      renderClubsTab();
    }

    if (btn.dataset.action === "open-player-tournament") {
      const tournamentId = btn.dataset.tournamentId || "";
      openTournamentFromPlayerProfile(tournamentId);
    }

    if (btn.dataset.action === "edit-club") {
      startEditClub(btn.dataset.clubId);
    }

    if (btn.dataset.action === "edit-club-coach") {
      startEditCoach(btn.dataset.coachId);
    }

    if (btn.dataset.action === "select-club-profile") {
      selectedClubProfileId = btn.dataset.clubId || null;
      selectedClubPlayerProfileId = null;
      selectedClubPlayerProfileTab = "info";
      showClubPlayerAddForms = false;
      showClubCoachAddForm = false;
      selectedClubsView = "profile";
      renderClubsTab();
    }

    if (btn.dataset.action === "set-club-detail-tab") {
      const tab = String(btn.dataset.tab || "").trim();
      if (!tab) {
        return;
      }
      selectedClubDetailTab = tab;
      if (tab !== "players") {
        selectedClubPlayerProfileId = null;
        selectedClubPlayerProfileTab = "info";
        showClubPlayerAddForms = false;
      }
      if (tab !== "coaches") {
        showClubCoachAddForm = false;
      }
      renderClubsTab();
    }

    if (btn.dataset.action === "toggle-club-player-add") {
      showClubPlayerAddForms = !showClubPlayerAddForms;
      renderClubsTab();
    }

    if (btn.dataset.action === "toggle-club-coach-add") {
      showClubCoachAddForm = !showClubCoachAddForm;
      renderClubsTab();
    }

    if (btn.dataset.action === "edit-club-player") {
      editClubPlayerInBase(playerId);
    }

    if (btn.dataset.action === "remove-player-from-club") {
      removeBasePlayerFromClub(playerId);
    }
  });

  els.basePlayersList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    const playerId = btn.dataset.playerId;
    const action = btn.dataset.action;
    if (blockIfViewerAction(action)) {
      return;
    }

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

    if (action === "view-base-profile") {
      selectedBasePlayerProfileId = playerId || null;
      selectedBasePlayerProfileTab = "ranking";
      renderBasePlayersTab();
      if (els.basePlayerProfile && selectedBasePlayerProfileId) {
        els.basePlayerProfile.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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

  if (els.basePlayerProfile) {
    els.basePlayerProfile.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-action]");
      if (!btn) {
        return;
      }

      if (btn.dataset.action === "set-base-player-profile-tab") {
        const tab = String(btn.dataset.tab || "").trim();
        if (!tab) {
          return;
        }
        selectedBasePlayerProfileTab = tab;
        renderBasePlayersTab();
        return;
      }

      if (btn.dataset.action === "close-base-player-profile") {
        selectedBasePlayerProfileId = null;
        selectedBasePlayerProfileTab = "ranking";
        renderBasePlayersTab();
        return;
      }

      if (btn.dataset.action === "open-player-tournament") {
        const tournamentId = btn.dataset.tournamentId || "";
        openTournamentFromPlayerProfile(tournamentId);
      }
    });
  }

  els.pairings.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn || btn.disabled) {
      return;
    }

    if (btn.dataset.action === "set-pair-result") {
      const roundIdx = Number(btn.dataset.roundIdx);
      const board = Number(btn.dataset.board);
      const currentValue = btn.dataset.current || "pending";
      const nextValue = btn.dataset.resultValue || "pending";
      updateResult(roundIdx, board, currentValue === nextValue ? "pending" : nextValue);
      return;
    }

    if (btn.dataset.action === "set-pair-game-result") {
      const roundIdx = Number(btn.dataset.roundIdx);
      const board = Number(btn.dataset.board);
      const gameIndex = Number(btn.dataset.gameIndex);
      const currentValue = btn.dataset.current || "pending";
      const nextValue = btn.dataset.resultValue || "pending";
      updateMicromatchGameResult(roundIdx, board, gameIndex, currentValue === nextValue ? "pending" : nextValue);
    }
  });

  els.standings.addEventListener("change", (event) => {
    const select = event.target.closest("select[data-action='set-manual-place']");
    if (!select) {
      return;
    }

    const playerId = String(select.dataset.playerId || "").trim();
    if (!playerId) {
      return;
    }

    const player = state.currentTournament.players.find((p) => p.id === playerId);
    if (!player) {
      return;
    }

    const rawValue = String(select.value || "").trim();
    const nextPlace = rawValue ? Number(rawValue) : null;
    player.manualPlace = Number.isInteger(nextPlace) && nextPlace > 0 ? nextPlace : null;
    state.currentTournament.updatedAt = new Date().toISOString();
    saveAndRender();
  });

  els.standings.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    const action = btn.dataset.action;
    if (blockIfViewerAction(action)) {
      return;
    }

    if (action === "confirm-auto-places") {
      applyAutoPlacesForTiedScores(state.currentTournament);
      return;
    }

    if (action === "finish-tournament-from-table") {
      void finishCurrentTournament();
      return;
    }

    if (action === "emergency-finish-tournament") {
      void emergencyFinishCurrentTournament();
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
    if (blockIfViewerAction(action)) {
      return;
    }

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
    if (blockIfViewerAction(action)) {
      return;
    }

    if (action === "open-archive") {
      openArchivePreview(tournamentId);
    }

    if (action === "edit-archive") {
      loadTournamentFromArchive(tournamentId);
    }

    if (action === "open-ongoing") {
      openOngoingTournament(tournamentId);
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

  if (els.tournamentsSearch) {
    els.tournamentsSearch.addEventListener("input", () => {
      tournamentsSearchQuery = String(els.tournamentsSearch.value || "").trim();
      renderArchiveTab();
    });
  }

  if (els.tournamentsStatusFilter) {
    els.tournamentsStatusFilter.addEventListener("change", () => {
      tournamentsStatusFilter = String(els.tournamentsStatusFilter.value || "all");
      renderArchiveTab();
    });
  }

  if (els.tournamentsDateFrom) {
    els.tournamentsDateFrom.addEventListener("change", () => {
      tournamentsDateFrom = String(els.tournamentsDateFrom.value || "").trim();
      renderArchiveTab();
    });
  }

  if (els.tournamentsDateTo) {
    els.tournamentsDateTo.addEventListener("change", () => {
      tournamentsDateTo = String(els.tournamentsDateTo.value || "").trim();
      renderArchiveTab();
    });
  }
}

// ===== 03-state-normalization.js =====
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
      clubs: Array.isArray(raw.clubs) ? raw.clubs.map(normalizeClub) : [],
      coaches: Array.isArray(raw.coaches) ? raw.coaches.map(normalizeCoach) : [],
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
      isMicromatch: false,
      scoreCalculationType: "big_points",
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
          isMicromatch: false,
          gameResults: null,
          smallPointsWhite: null,
          smallPointsBlack: null,
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
    clubs: [],
    coaches: [],
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
    { lastName: "Порецький", firstName: "Лев", rating: 2380, gender: "M", rank: "кмс", birthDate: "2011-07-05" },
    { lastName: "Дяченко", firstName: "Андрій", rating: 2244, gender: "M", rank: "1", birthDate: "2011-08-04" },
    { lastName: "Єжова", firstName: "Валерія", rating: 2214, gender: "F", rank: "мс", birthDate: "2011-07-29" },
    { lastName: "Баркевич", firstName: "Максим", rating: 2408, gender: "M", rank: "кмс", birthDate: "2013-05-31" },
    { lastName: "Поплавський", firstName: "Данііл", rating: 2276, gender: "M", rank: "1", birthDate: "2014-02-25" },
    { lastName: "Савченко", firstName: "Макар", rating: 2250, gender: "M", rank: "1", birthDate: "2015-07-01" },
    { lastName: "Постой", firstName: "Роман", rating: 2250, gender: "M", rank: "1", birthDate: "2015-11-19" },
    { lastName: "Лисенко", firstName: "Поліна", rating: 2158, gender: "F", rank: "1", birthDate: "2014-12-26" },
    { lastName: "Карасьова", firstName: "Мар'яна", rating: 2150, gender: "F", rank: "1", birthDate: "2014-08-08" },
    { lastName: "Гавриш", firstName: "Єлизавета", rating: 1950, gender: "F", rank: "3", birthDate: "2015-03-23" },
    { lastName: "Діденко", firstName: "Олександр", rating: 2150, gender: "M", rank: "2", birthDate: "2016-12-02" },
    { lastName: "Строкін", firstName: "Владислав", rating: 2150, gender: "M", rank: "2", birthDate: "2017-09-10" },
    { lastName: "Сухомуд", firstName: "Святослав", rating: 2050, gender: "M", rank: "3", birthDate: "2016-02-02" },
    { lastName: "Надточій", firstName: "Владислав", rating: 2050, gender: "M", rank: "3", birthDate: "2017-08-13" },
    { lastName: "Дем'яненко", firstName: "Мар'яна", rating: 1950, gender: "F", rank: "3", birthDate: "2017-08-03" },
    { lastName: "Алексеєнко", firstName: "Анастасія", rating: 1850, gender: "F", rank: "юнацький", birthDate: "2017-09-20" },
    { lastName: "Сіфорова", firstName: "Анна", rating: 1950, gender: "F", rank: "3", birthDate: "2018-07-11" },
  ];

  return preset.map((p) => createBasePlayerRecord(p.lastName, p.firstName, p.rating, p));
}

function createDefaultTournament() {
  return {
    id: crypto.randomUUID(),
    name: "",
    format: "swiss",
    isMicromatch: false,
    scoreCalculationType: "big_points",
    eventDate: "",
    timeControl: "",
    chiefJudge: "",
    tieBreakOrder: [...DEFAULT_TIEBREAK_ORDER],
    photoDataUrl: null,
    roundsCount: 1,
    currentRound: 0,
    status: "active",
    ownerAdminId: null,
    cityId: null,
    isPublic: true,
    setupNotified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ratingDeltas: [],
    players: [],
    rounds: [],
  };
}

function normalizeTournament(tournament) {
  const t = {
    id: tournament.id || crypto.randomUUID(),
    name: typeof tournament.name === "string" ? tournament.name : "Турнір",
    format: tournament.format === "round_robin" ? "round_robin" : "swiss",
    isMicromatch: Boolean(tournament.isMicromatch),
    scoreCalculationType:
      Boolean(tournament.isMicromatch) && tournament.scoreCalculationType === "small_points" ? "small_points" : "big_points",
    eventDate: normalizeBirthDate(tournament.eventDate),
    timeControl: normalizeTimeControl(tournament.timeControl),
    chiefJudge: normalizeChiefJudge(tournament.chiefJudge),
    tieBreakOrder: Array.isArray(tournament.tieBreakOrder)
      ? normalizeTieBreakOrder(tournament.tieBreakOrder, { fillDefaults: false })
      : [...DEFAULT_TIEBREAK_ORDER],
    photoDataUrl: normalizeImageDataUrl(tournament.photoDataUrl),
    roundsCount: Number(tournament.roundsCount) || 5,
    currentRound: Number(tournament.currentRound) || 0,
    status: tournament.status || "active",
    ownerAdminId: normalizeEntityId(tournament.ownerAdminId),
    cityId: normalizeEntityId(tournament.cityId),
    isPublic: tournament.isPublic !== false,
    setupNotified: Boolean(tournament.setupNotified),
    createdAt: tournament.createdAt || new Date().toISOString(),
    updatedAt: tournament.updatedAt || new Date().toISOString(),
    ratingDeltas: normalizeTournamentRatingDeltas(tournament.ratingDeltas),
    players: Array.isArray(tournament.players)
      ? tournament.players.map((p, idx) => ({
          id: p.id || crypto.randomUUID(),
          basePlayerId: p.basePlayerId || null,
          name: p.name,
          rating: Number(p.rating) || 0,
          gender: normalizeGender(p.gender),
          clubId: normalizeEntityId(p.clubId),
          coachId: normalizeEntityId(p.coachId),
          photoDataUrl: normalizeImageDataUrl(p.photoDataUrl),
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
            isMicromatch: Boolean(pair.isMicromatch ?? tournament.isMicromatch),
            board: Number(pair.board),
            whiteId: pair.whiteId,
            blackId: pair.blackId,
            result: pair.result || "pending",
            gameResults: Boolean(pair.isMicromatch ?? tournament.isMicromatch)
              ? Array.isArray(pair.gameResults) && pair.gameResults.length === 2
                ? pair.gameResults.slice(0, 2).map((x) => String(x || "pending"))
                : ["pending", "pending"]
              : null,
            smallPointsWhite: Number.isFinite(Number(pair.smallPointsWhite)) ? Number(pair.smallPointsWhite) : null,
            smallPointsBlack: Number.isFinite(Number(pair.smallPointsBlack)) ? Number(pair.smallPointsBlack) : null,
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
    gender: normalizeGender(player.gender),
    clubId: normalizeEntityId(player.clubId),
    coachId: normalizeEntityId(player.coachId),
    rank: normalizeRank(player.rank),
    birthDate: normalizeBirthDate(player.birthDate),
    photoDataUrl: normalizeImageDataUrl(player.photoDataUrl),
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
    const created = createBasePlayerRecord(split.lastName, split.firstName, p.rating, {
      gender: p.gender,
      photoDataUrl: p.photoDataUrl,
      clubId: p.clubId,
      coachId: p.coachId,
    });
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
    gender: normalizeGender(extra.gender),
    clubId: normalizeEntityId(extra.clubId),
    coachId: normalizeEntityId(extra.coachId),
    rank: normalizeRank(extra.rank),
    birthDate: normalizeBirthDate(extra.birthDate),
    photoDataUrl: normalizeImageDataUrl(extra.photoDataUrl),
    createdAt: new Date().toISOString(),
    history: [],
    stats: emptyStats(),
  };
}

function createTournamentPlayer(name, rating, basePlayerId, currentCount, extra = {}) {
  return {
    id: crypto.randomUUID(),
    basePlayerId,
    name,
    rating,
    gender: normalizeGender(extra.gender),
    clubId: normalizeEntityId(extra.clubId),
    coachId: normalizeEntityId(extra.coachId),
    photoDataUrl: normalizeImageDataUrl(extra.photoDataUrl),
    startNo: currentCount + 1,
    score: 0,
    hadBye: false,
    manualPlace: null,
    opponents: [],
    colors: [],
    resultsByRound: {},
  };
}

function normalizeClub(club) {
  return {
    id: normalizeEntityId(club.id) || crypto.randomUUID(),
    name: String(club.name || "").trim().slice(0, 140) || "Без назви",
    city: String(club.city || "").trim().slice(0, 80),
    contact: String(club.contact || club.contacts || "").trim().slice(0, 180),
    description: String(club.description || club.info || "").trim().slice(0, 700),
    logoDataUrl: normalizeImageDataUrl(club.logoDataUrl || club.logo_url),
    createdAt: club.createdAt || club.created_at || new Date().toISOString(),
  };
}

function normalizeCoach(coach) {
  return {
    id: normalizeEntityId(coach.id) || crypto.randomUUID(),
    firstName: String(coach.firstName || coach.first_name || "").trim().slice(0, 80),
    lastName: String(coach.lastName || coach.last_name || "").trim().slice(0, 80),
    clubId: normalizeEntityId(coach.clubId || coach.club_id),
    phone: String(coach.phone || "").trim().slice(0, 80),
    email: String(coach.email || "").trim().slice(0, 120),
    bio: String(coach.bio || coach.description || coach.info || "").trim().slice(0, 700),
    photoDataUrl: normalizeImageDataUrl(coach.photoDataUrl || coach.photo_url),
    createdAt: coach.createdAt || coach.created_at || new Date().toISOString(),
  };
}

function createClubRecord(name, city, contact, extra = {}) {
  return normalizeClub({
    id: crypto.randomUUID(),
    name,
    city,
    contact,
    description: extra.description,
    logoDataUrl: extra.logoDataUrl,
    createdAt: new Date().toISOString(),
  });
}

function createCoachRecord(lastName, firstName, clubId, extra = {}) {
  return normalizeCoach({
    id: crypto.randomUUID(),
    firstName,
    lastName,
    clubId,
    phone: extra.phone,
    email: extra.email,
    bio: extra.bio,
    photoDataUrl: extra.photoDataUrl,
    createdAt: new Date().toISOString(),
  });
}

function normalizeEntityId(value) {
  return String(value || "").trim();
}

function normalizeTournamentRatingDeltas(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      playerId: normalizeEntityId(item?.playerId),
      basePlayerId: normalizeEntityId(item?.basePlayerId),
      ratingBefore: Number(item?.ratingBefore) || 0,
      ratingDelta: Number(item?.ratingDelta) || 0,
      ratingAfter: Number(item?.ratingAfter) || 0,
      gamesRated: Number(item?.gamesRated) || 0,
      pointsRated: Number(item?.pointsRated) || 0,
      expectedPoints: Number(item?.expectedPoints) || 0,
      expectedPercent: Number(item?.expectedPercent) || 0,
      averageOpponentRating: Number(item?.averageOpponentRating) || 0,
    }))
    .filter((item) => item.basePlayerId || item.playerId);
}

function normalizeImageDataUrl(value) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  if (!/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(text)) {
    return null;
  }

  // Old API versions cut image data at 2000 chars. Those values look like
  // data URLs but render as broken images, so treat them as missing media.
  if (text.length === 2000) {
    return null;
  }

  return text;
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

function getCoachFullName(coach) {
  return `${coach?.lastName || ""} ${coach?.firstName || ""}`.trim();
}

function getClubName(clubId) {
  const club = state?.clubs?.find((item) => item.id === clubId);
  return club ? club.name : "";
}

function getCoachName(coachId) {
  const coach = state?.coaches?.find((item) => item.id === coachId);
  return coach ? getCoachFullName(coach) : "";
}

function normalizeRank(value) {
  const allowed = new Set(["б/р", "юнацький", "3", "2", "1", "кмс", "мс", "гр"]);
  if (allowed.has(value)) {
    return value;
  }
  return "б/р";
}

function normalizeGender(value) {
  return value === "M" || value === "F" ? value : "";
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
  const check = new Date(Date.UTC(year, month - 1, day));
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
    // For odd number of players we add BYE, so total rounds equals players count.
    // For even number of players classic round-robin is N-1 rounds.
    return playersCount % 2 === 1 ? playersCount : playersCount - 1;
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

function isValidClubLogoFile(file) {
  if (!file) {
    return false;
  }
  if (file.size <= MAX_CLUB_LOGO_BYTES) {
    return true;
  }

  alert("Логотип клубу занадто великий. Оберіть файл до 8 MB.");
  return false;
}

function isValidCoachPhotoFile(file) {
  if (!file) {
    return false;
  }
  if (!file.type.startsWith("image/")) {
    alert("Фото тренера має бути зображенням.");
    return false;
  }
  if (file.size <= MAX_COACH_PHOTO_BYTES) {
    return true;
  }
  alert("Фото тренера завелике. Оберіть файл до 8 МБ.");
  return false;
}

// ===== 04-render.js =====
// -----------------------------
// CORE SHELL RENDER
// -----------------------------
function render() {
  renderAuthPanel();
  renderTabs();
  renderActiveTabPanel();
  renderPersistenceFooter();
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
  const canManage = canManageAdminUi();
  const tournamentTabBtn = els.tabsNav?.querySelector(".tab-btn[data-tab='tournament']");
  if (tournamentTabBtn) {
    tournamentTabBtn.hidden = !canManage;
  }
  if (!canManage && state.activeTab === "tournament") {
    state.activeTab = "archive";
  }

  for (const btn of els.tabsNav.querySelectorAll(".tab-btn")) {
    btn.classList.toggle("active", btn.dataset.tab === state.activeTab);
  }

  for (const [tabName, panel] of Object.entries(els.tabPanels)) {
    panel.classList.toggle("active", tabName === state.activeTab);
  }
}

// -----------------------------
// TOURNAMENT SETTINGS DRAFT
// -----------------------------
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
  const photoUrl = getTournamentDisplayPhotoUrl(t);
  const hasPhoto = Boolean(photoUrl);
  const hasDate = Boolean(t.eventDate);
  const hasControl = Boolean(t.timeControl);
  const hasChiefJudge = Boolean(t.chiefJudge);
  const hasAnyMeta = hasPhoto || hasDate || hasControl || hasChiefJudge;

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
    els.tournamentSettingsPhoto.src = photoUrl;
    els.tournamentSettingsPhoto.hidden = false;
  } else {
    els.tournamentSettingsPhoto.src = "";
    els.tournamentSettingsPhoto.hidden = true;
  }

  els.tournamentSettingsDate.textContent = `Дата: ${hasDate ? formatDateOnly(t.eventDate) : "не вказана"}`;
  els.tournamentSettingsControl.textContent = `Контроль часу: ${hasControl ? t.timeControl : "не вказано"}`;
  els.tournamentSettingsChiefJudge.textContent = `Головний суддя: ${hasChiefJudge ? t.chiefJudge : "не вказано"}`;
}

function getTournamentDisplayPhotoUrl(tournament) {
  const custom = String(tournament?.photoDataUrl || "").trim();
  return custom || DEFAULT_TOURNAMENT_COVER_URL;
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

// -----------------------------
// TOURNAMENT PARTICIPANTS & ROUNDS UI
// -----------------------------
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
  const canManage = canManageAdminUi();
  const resultsEditable = canManage && t.status === "active" && !archiveView;

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
      const roundLocked = !resultsEditable;
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

// -----------------------------
// STANDINGS & TIEBREAK TABLE
// -----------------------------
function renderStandings() {
  const t = state.currentTournament;
  const showRoundDetails = t.status !== "archived_view";
  const tieGroups = getScoreTieGroupsForDisplay(t);
  const quickActions = buildStandingsQuickActions(t, tieGroups);
  const manualHint =
    t.status === "active" && tieGroups.length > 0
      ? '<div class="manual-place-hint">Є гравці з однаковими очками. У колонці "Місце" оберіть підсумкові місця перед завершенням турніру.</div>'
      : "";
  els.standings.innerHTML = `${quickActions}${manualHint}${buildStandingsTableHtml(t, { showRoundDetails })}`;
}

function buildStandingsQuickActions(tournament, tieGroups) {
  if (!tournament || tournament.status !== "active") {
    return "";
  }

  const hasTies = tieGroups.length > 0;
  return `
    <details class="standings-quick-actions" open>
      <summary>Швидкі дії таблиці</summary>
      <div class="standings-quick-actions__body">
        <button type="button" data-action="confirm-auto-places"${hasTies ? "" : " disabled"}>Погодитися з авто-місцями</button>
        <button type="button" data-action="finish-tournament-from-table">Завершити турнір</button>
        <button type="button" data-action="emergency-finish-tournament">Екстрено завершити без архіву</button>
      </div>
    </details>`;
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

// -----------------------------
// CLUBS / COACHES / CLUB PROFILE
// -----------------------------
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
  const canManage = canManageAdminUi();
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
      ${
        canManage
          ? `<div class="row-actions">
        <button type="button" data-action="toggle-club-player-add">${playerAddToggleButtonLabel}</button>
      </div>`
          : ""
      }
      ${
        canManage && showClubPlayerAddForms
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
      ${
        canManage
          ? `<div class="row-actions">
        <button type="button" data-action="toggle-club-coach-add">${coachAddToggleButtonLabel}</button>
      </div>`
          : ""
      }
      ${
        canManage && showClubCoachAddForm
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
            ${canManage ? `<button type="button" data-action="edit-club" data-club-id="${club.id}">Редагувати</button>` : ""}
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
  const canManage = canManageAdminUi();
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
        ${canManage ? `<td><button type="button" data-action="edit-club-coach" data-coach-id="${coach.id}">Редагувати</button></td>` : ""}
      </tr>`
    )
    .join("");

  return `
    <div class="scroll">
      <table class="table">
        <thead><tr><th>Фото</th><th>Тренер</th><th>Телефон</th><th>Email</th><th>Інфо</th>${canManage ? "<th>Дії</th>" : ""}</tr></thead>
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
  const canManage = canManageAdminUi();
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
              ${canManage ? `<button type="button" data-action="edit-club-player" data-player-id="${player.id}">Ред.</button>` : ""}
              ${canManage ? `<button type="button" data-action="add-to-tournament" data-player-id="${player.id}">У турнір</button>` : ""}
              ${
                canManage && player.clubId && !compactActions
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
  const history = Array.isArray(player.history) ? player.history.slice().sort((a, b) => getPlayerHistorySortTimestamp(b) - getPlayerHistorySortTimestamp(a)) : [];
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

function resolvePlayerHistoryEventDate(item) {
  const direct = normalizeBirthDate(item?.eventDate);
  if (direct) {
    return direct;
  }

  if (item?.tournamentId) {
    const archived = (state.tournamentsArchive || []).find((t) => t.id === item.tournamentId);
    const archivedEventDate = normalizeBirthDate(archived?.eventDate);
    if (archivedEventDate) {
      return archivedEventDate;
    }
  }

  return "";
}

function getPlayerHistorySortTimestamp(item) {
  const eventDate = resolvePlayerHistoryEventDate(item);
  if (eventDate) {
    const value = new Date(`${eventDate}T00:00:00`).getTime();
    if (Number.isFinite(value)) {
      return value;
    }
  }
  const fallback = new Date(item?.finishedAt || 0).getTime();
  return Number.isFinite(fallback) ? fallback : 0;
}

function formatPlayerHistoryDate(item) {
  const eventDate = resolvePlayerHistoryEventDate(item);
  if (eventDate) {
    return formatDateOnly(eventDate);
  }
  if (item?.finishedAt) {
    return formatDate(item.finishedAt);
  }
  return "-";
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
      return `<tr><td>${renderTournamentJumpButton(item.tournamentId, item.tournamentName || "-")}</td><td>${formatPlayerHistoryDate(item)}</td><td>${deltaText}</td><td>${Number(item.ratingAfter) || "-"}</td></tr>`;
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
        <td>${formatPlayerHistoryDate(item)}</td>
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
    .map((item) => {
      const winRate = Number(item.winRateRounded) || 0;
      const tone = winRate <= 35 ? "low" : winRate <= 65 ? "mid" : "high";
      return `
      <article class="opponent-mini-card opponent-mini-card--${tone}">
        <div class="opponent-mini-card__name">${escapeHtml(item.name)}</div>
        <div class="meta">${item.games} партій</div>
        <div class="meta">W/D/L: ${item.wins}/${item.draws}/${item.losses}</div>
        <div class="opponent-mini-card__rate opponent-mini-card__rate--${tone}">Вінрейт: <strong>${winRate}%</strong></div>
      </article>`;
    })
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
        <td>${formatPlayerHistoryDate(item)}</td>
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

// -----------------------------
// PLAYER PROFILE DATA HELPERS
// -----------------------------
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

  return [...map.values()]
    .map((item) => {
      const games = Number(item.games) || 0;
      const wins = Number(item.wins) || 0;
      const winRate = games > 0 ? (wins / games) * 100 : 0;
      return {
        ...item,
        winRate,
        winRateRounded: Math.round(winRate),
      };
    })
    .sort((a, b) => b.games - a.games || a.name.localeCompare(b.name, "uk"));
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

function isTournamentInDateRange(entry, fromDate, toDate) {
  const filterDate = getTournamentFilterDate(entry);
  if (!filterDate) {
    return !fromDate && !toDate;
  }
  if (fromDate && filterDate < fromDate) {
    return false;
  }
  if (toDate && filterDate > toDate) {
    return false;
  }
  return true;
}

function getTournamentFilterDate(entry) {
  const t = entry?.tournament;
  if (!t) {
    return "";
  }
  if (t.eventDate) {
    return normalizeBirthDate(t.eventDate);
  }
  const fallbackIso = entry.kind === "finished" ? t.finishedAt || t.updatedAt : t.updatedAt || t.createdAt;
  const parsed = normalizeBirthDate(fallbackIso);
  return parsed || "";
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
    <div class="media"><img src="${getTournamentDisplayPhotoUrl(archived)}" alt="Фото ${escapeHtml(archived.name)}" /></div>
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

// -----------------------------
// TOURNAMENTS (ARCHIVE + ONGOING) PREVIEW HELPERS
// -----------------------------
function buildArchivePreviewHtml(archived) {
  const standingsTable = buildStandingsTableHtml(archived, { showRoundDetails: true });

  return `
    <hr />
    <h3>${escapeHtml(archived.name)} — підсумкова таблиця</h3>
    <div class="archive-meta">${formatDate(archived.finishedAt)} | Турів: ${archived.currentRound}/${archived.roundsCount}</div>
    <div class="archive-media" style="margin-top:8px;">
      ${
        `<img class="archive-photo" src="${getTournamentDisplayPhotoUrl(archived)}" alt="Фото ${escapeHtml(archived.name)}" />`
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

// ===== features/10-render-active-tab.js =====
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

// ===== features/11-render-tournament-tab.js =====
function renderTournamentTab() {
  const t = state.currentTournament;
  const archiveView = t.status === "archived_view";
  const canManage = canManageAdminUi();
  const archiveAdminEditMode = archiveView && canManage;
  const readOnlyArchive = archiveView && !canManage;
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
  els.roundsCount.disabled = draft.format === "round_robin" || archiveView || readOnlyArchive;
  renderRoundsRuleHint();
  els.tournamentDate.value = formatDateForInput(draft.eventDate || t.eventDate);
  els.tournamentTimeControl.value = normalizeTimeControl(draft.timeControl);
  els.tournamentChiefJudge.value = normalizeChiefJudge(draft.chiefJudge);
  renderTieBreakSelectors(draft.tieBreakOrder);
  els.tournamentRemovePhoto.checked = draft.removePhoto;
  els.tournamentPhoto.value = "";

  els.tournamentName.disabled = readOnlyArchive;
  els.tournamentDate.disabled = readOnlyArchive;
  els.tournamentTimeControl.disabled = readOnlyArchive;
  els.tournamentChiefJudge.disabled = readOnlyArchive;
  els.tournamentFormat.disabled = archiveView || readOnlyArchive;
  if (els.tournamentIsMicromatch) {
    els.tournamentIsMicromatch.disabled = archiveView || readOnlyArchive;
  }
  if (els.scoreCalculationType) {
    els.scoreCalculationType.disabled = archiveView || readOnlyArchive;
  }
  if (els.tournamentPhoto) {
    els.tournamentPhoto.disabled = archiveView || readOnlyArchive;
  }
  if (els.tournamentRemovePhoto) {
    els.tournamentRemovePhoto.disabled = archiveView || readOnlyArchive;
  }
  for (const select of [els.tieBreak1, els.tieBreak2, els.tieBreak3, els.tieBreak4, els.tieBreak5]) {
    if (select) {
      select.disabled = archiveView || readOnlyArchive;
    }
  }
  if (els.settingsSubmitBtn) {
    els.settingsSubmitBtn.hidden = readOnlyArchive;
    els.settingsSubmitBtn.textContent = archiveAdminEditMode ? "Підтвердити зміни" : "Створити турнір";
  }
  if (els.archiveSettingsCancelBtn) {
    els.archiveSettingsCancelBtn.hidden = !archiveAdminEditMode;
  }

  const eventDateText = t.eventDate ? formatDateOnly(t.eventDate) : "дата не вказана";
  const timeControlText = t.timeControl || "не вказано";
  const chiefJudgeText = t.chiefJudge || "не вказано";
  const tournamentTitle = t.name || "Новий турнір";
  const archiveHint = archiveView ? (readOnlyArchive ? " | Архів (read-only)" : " | Архів (редагування для адміністратора)") : "";
  els.roundMeta.textContent = `${tournamentTitle} | ${formatLabel(t.format)} | Тур ${t.currentRound} з ${t.roundsCount} | Дата: ${eventDateText} | Контроль: ${timeControlText} | Суддя: ${chiefJudgeText}${archiveHint}`;

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
  if (archiveView || readOnlyArchive) {
    els.dbPlayerSelect.disabled = true;
    if (els.tournamentClubFilter) {
      els.tournamentClubFilter.disabled = true;
    }
    els.selectAllBaseBtn.disabled = true;
    els.addFromBaseBtn.disabled = true;
    for (const checkbox of els.dbPlayerChecklist.querySelectorAll("input[type='checkbox']")) {
      checkbox.disabled = true;
    }
  } else {
    els.dbPlayerSelect.disabled = false;
    if (els.tournamentClubFilter) {
      els.tournamentClubFilter.disabled = false;
    }
    els.selectAllBaseBtn.disabled = false;
    els.addFromBaseBtn.disabled = selectedBasePlayerIds.size === 0;
    for (const checkbox of els.dbPlayerChecklist.querySelectorAll("input[type='checkbox']")) {
      checkbox.disabled = false;
    }
  }

  renderTournamentSubtabs();
  renderTournamentPlayers();
  renderManualPairingPanel();
  renderRounds();
  renderStandings();
}

// ===== features/12-render-players-tab.js =====
function renderBasePlayerActionIcon(iconKey) {
  const icons = {
    edit: `
      <svg class="icon-btn__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
      </svg>
    `,
    profile: `
      <svg class="icon-btn__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 19V5"></path>
        <path d="M4 19h16"></path>
        <path d="M8 17v-5"></path>
        <path d="M12 17v-8"></path>
        <path d="M16 17v-3"></path>
        <path d="M7 9l3-3 3 2 3-3"></path>
      </svg>
    `,
    delete: `
      <svg class="icon-btn__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 6h18"></path>
        <path d="M8 6V4h8v2"></path>
        <path d="M19 6l-1 14H6L5 6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
      </svg>
    `,
  };

  return icons[iconKey] || "";
}

function renderBasePlayersTab() {
  const canManage = canManageAdminUi();
  if (els.openBasePlayerFormBtn) {
    els.openBasePlayerFormBtn.hidden = !canManage;
  }
  if (!canManage) {
    showBasePlayerAddForm = false;
    editingBasePlayerId = null;
  }
  syncBasePlayerFormVisibility();
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
      const actionsHtml = canManage
        ? `
            <button class="icon-btn" type="button" title="Редагувати" aria-label="Редагувати" data-action="edit-base-player" data-player-id="${p.id}">${renderBasePlayerActionIcon("edit")}</button>
            <button class="icon-btn" type="button" title="Профіль і статистика" aria-label="Профіль і статистика" data-action="view-base-profile" data-player-id="${p.id}">${renderBasePlayerActionIcon("profile")}</button>
            <button class="icon-btn danger" type="button" title="Видалити" aria-label="Видалити" data-action="delete-base-player" data-player-id="${p.id}">${renderBasePlayerActionIcon("delete")}</button>
          `
        : `
            <button class="icon-btn" type="button" title="Профіль і статистика" aria-label="Профіль і статистика" data-action="view-base-profile" data-player-id="${p.id}">${renderBasePlayerActionIcon("profile")}</button>
          `;
      return `
      <tr>
        <td>
          <div class="row-actions">
            ${actionsHtml}
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

  if (!els.basePlayerProfile) {
    return;
  }

  const selectedPlayer = state.playerBase.find((player) => player.id === selectedBasePlayerProfileId) || null;
  if (!selectedPlayer) {
    selectedBasePlayerProfileId = null;
    selectedBasePlayerProfileTab = "ranking";
    els.basePlayerProfile.innerHTML = "";
    return;
  }

  els.basePlayerProfile.innerHTML = renderBasePlayerProfileCard(selectedPlayer.id);
}

function renderBasePlayerProfileCard(playerId) {
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
  const activeTab = tabs.some((tab) => tab.key === selectedBasePlayerProfileTab) ? selectedBasePlayerProfileTab : "ranking";
  const stats = player.stats || emptyStats();
  const history = Array.isArray(player.history) ? player.history.slice().sort((a, b) => getPlayerHistorySortTimestamp(b) - getPlayerHistorySortTimestamp(a)) : [];
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
        `<button type="button" class="player-profile-tab-btn${activeTab === tab.key ? " active" : ""}" data-action="set-base-player-profile-tab" data-tab="${tab.key}">${tab.label}</button>`
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
    <section class="club-profile-card player-profile-shell base-player-profile-shell">
      <div class="player-profile-tabbar">
        ${tabsHtml}
        <button type="button" class="pill" data-action="close-base-player-profile">Закрити</button>
      </div>
      <div class="player-profile-breadcrumb">База гравців > ${escapeHtml(getBaseFullName(player))} > ${activeTab.toUpperCase()}</div>
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

// ===== features/13-render-clubs-tab.js =====
function renderClubsTab() {
  const canManage = canManageAdminUi();
  renderCoachClubSelector();
  if (!els.clubsList || !els.clubProfile) {
    return;
  }
  if (els.openAddClubBtn) {
    els.openAddClubBtn.hidden = !canManage;
  }
  if (!canManage && selectedClubsView === "manage") {
    selectedClubsView = "directory";
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
    els.clubsList.innerHTML = `<div class="club-card">Клубів поки немає.${canManage ? ' Натисніть "Додати клуб".' : ""}</div>`;
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
            ${
              canManage
                ? `
            <button type="button" data-action="edit-club" data-club-id="${club.id}">Редагувати</button>
            <button type="button" class="danger" data-action="delete-club" data-club-id="${club.id}">Видалити</button>`
                : ""
            }
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

// ===== features/14-render-archive-tab.js =====
function renderArchiveTab() {
  const canManage = canManageAdminUi();
  if (els.tournamentsSearch) {
    els.tournamentsSearch.value = tournamentsSearchQuery;
  }
  if (els.tournamentsStatusFilter) {
    const nextStatusFilter = ["all", "ongoing", "finished"].includes(tournamentsStatusFilter) ? tournamentsStatusFilter : "all";
    tournamentsStatusFilter = nextStatusFilter;
    els.tournamentsStatusFilter.value = nextStatusFilter;
  }
  if (els.tournamentsDateFrom) {
    els.tournamentsDateFrom.value = tournamentsDateFrom;
  }
  if (els.tournamentsDateTo) {
    els.tournamentsDateTo.value = tournamentsDateTo;
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
      if (!isTournamentInDateRange(entry, tournamentsDateFrom, tournamentsDateTo)) {
        return false;
      }

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
      const statusMeta = isFinished
        ? `Турів: ${t.currentRound}/${t.roundsCount} | Учасників: ${t.players.length}`
        : `Триває: оновлено ${formatDate(t.updatedAt || t.createdAt || new Date().toISOString())} | Турів: ${t.currentRound}/${t.roundsCount} | Учасників: ${t.players.length}`;
      const actionsHtml = isFinished
        ? `
            <button type="button" data-action="open-archive" data-tournament-id="${t.id}">Відкрити</button>
            ${canManage ? `<button type="button" data-action="edit-archive" data-tournament-id="${t.id}">Змінити</button>` : ""}
            <button type="button" data-action="print-archive" data-tournament-id="${t.id}">Друк</button>
            ${canManage ? `<button type="button" data-action="delete-archive" data-tournament-id="${t.id}" class="danger">Видалити</button>` : ""}`
        : `<button type="button" data-action="open-ongoing" data-tournament-id="${t.id}">Відкрити</button>`;

      return `
      <article class="archive-card${isOpen ? " archive-card--open" : ""}">
        <div class="archive-head">
          <strong>${escapeHtml(t.name)}</strong>
          <div class="toolbar">
            ${actionsHtml}
          </div>
        </div>
        <div class="archive-meta">
          <span class="status-chip ${isFinished ? "status-chip--finished" : "status-chip--ongoing"}">${isFinished ? "Завершений" : "Триває"}</span>
          ${statusMeta}
        </div>
        <div class="archive-media">
          <img class="archive-photo" src="${getTournamentDisplayPhotoUrl(t)}" alt="Фото ${escapeHtml(t.name)}" />
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

// ===== 05-actions.js =====
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
  const basePlayer = basePlayerId ? state.playerBase.find((p) => p.id === basePlayerId) : null;

  if (t.players.some((p) => p.basePlayerId === basePlayerId)) {
    if (shouldSave) {
      alert("Цей гравець уже доданий у турнір.");
    }
    return false;
  }

  t.players.push(
    createTournamentPlayer(name, rating, basePlayerId, t.players.length, {
      gender: basePlayer?.gender,
      photoDataUrl: basePlayer?.photoDataUrl,
      clubId: basePlayer?.clubId,
      coachId: basePlayer?.coachId,
    })
  );
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
  const gender = normalizeGender(els.basePlayerGender.value);
  const rank = els.basePlayerRank.value;
  const birthDate = normalizeBirthDate(els.basePlayerBirthDate.value);
  const clubId = normalizeEntityId(els.basePlayerClub.value);
  const coachId = normalizeEntityId(els.basePlayerCoach.value);
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
    base.gender = gender;
    base.clubId = clubId;
    base.coachId = coachId;
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
        gender,
        clubId,
        coachId,
        rank,
        birthDate,
        photoDataUrl: photoDataUrl || null,
      })
    );
  }

  resetBasePlayerForm({ keepOpen: true });
  saveAndRender();
  await flushRemoteSyncNow("base-player-save");
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
  els.basePlayerGender.value = normalizeGender(base.gender);
  els.basePlayerRank.value = normalizeRank(base.rank);
  els.basePlayerBirthDate.value = normalizeBirthDate(base.birthDate);
  renderBasePlayerOwnershipSelectors(base);
  els.basePlayerPhoto.value = "";
  els.basePlayerRemovePhoto.checked = false;
  els.basePlayerSubmitBtn.textContent = "Зберегти зміни";
  els.basePlayerCancelEditBtn.hidden = false;
  els.baseEditHint.hidden = false;
  els.baseEditHint.textContent = `Редагування: ${getBaseFullName(base)}. Поля: Прізвище, Ім'я, Рейтинг, Стать, Спортивне звання, Дата народження, Фото.`;
  showBasePlayerAddForm = true;
  syncBasePlayerFormVisibility();
  els.basePlayerForm.scrollIntoView({ behavior: "smooth", block: "center" });
  els.basePlayerLastName.focus();
}

function resetBasePlayerForm(options = {}) {
  const keepOpen = Boolean(options.keepOpen);
  editingBasePlayerId = null;
  els.basePlayerForm.reset();
  els.basePlayerGender.value = "";
  els.basePlayerRank.value = "б/р";
  renderBasePlayerOwnershipSelectors(null);
  els.basePlayerRemovePhoto.checked = false;
  els.basePlayerSubmitBtn.textContent = "Додати в базу";
  els.basePlayerCancelEditBtn.hidden = true;
  els.baseEditHint.hidden = true;
  els.baseEditHint.textContent = "";
  showBasePlayerAddForm = keepOpen;
  syncBasePlayerFormVisibility();
}

function syncBasePlayerFormVisibility() {
  if (!els.basePlayerFormWrap || !els.openBasePlayerFormBtn) {
    return;
  }

  const canManage = canManageAdminUi();
  const shouldShow = canManage && Boolean(showBasePlayerAddForm || editingBasePlayerId);
  els.basePlayerFormWrap.classList.toggle("tour-view-hidden", !shouldShow);
  els.openBasePlayerFormBtn.hidden = !canManage;
  els.openBasePlayerFormBtn.textContent = shouldShow ? "Сховати форму" : "Додати гравця";
  els.openBasePlayerFormBtn.setAttribute("aria-expanded", shouldShow ? "true" : "false");
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

async function readClubLogoDataUrl(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  return optimizeImageDataUrl(rawDataUrl, {
    maxSide: 520,
    qualityStart: 0.84,
    qualityMin: 0.48,
    targetBytes: MAX_CLUB_LOGO_STORE_BYTES,
  });
}

async function readCoachPhotoDataUrl(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  return optimizeImageDataUrl(rawDataUrl, {
    maxSide: 620,
    qualityStart: 0.82,
    qualityMin: 0.45,
    targetBytes: MAX_COACH_PHOTO_STORE_BYTES,
  });
}

function optimizeImageDataUrl(dataUrl, options) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = options.maxSide || 1280;
      const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const targetBytes = options.targetBytes || MAX_TOURNAMENT_PHOTO_STORE_BYTES;
      const qualityStart = options.qualityStart || 0.86;
      const qualityMin = options.qualityMin || 0.52;

      let width = Math.max(1, Math.round(img.naturalWidth * ratio));
      let height = Math.max(1, Math.round(img.naturalHeight * ratio));
      let output = dataUrl;

      for (let scaleAttempt = 0; scaleAttempt < 6; scaleAttempt += 1) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = qualityStart;
        output = canvas.toDataURL("image/jpeg", quality);
        while (estimateDataUrlBytes(output) > targetBytes && quality > qualityMin) {
          quality = Math.max(qualityMin, quality - 0.08);
          output = canvas.toDataURL("image/jpeg", quality);
        }

        if (estimateDataUrlBytes(output) <= targetBytes) {
          resolve(output);
          return;
        }

        width = Math.max(1, Math.round(width * 0.85));
        height = Math.max(1, Math.round(height * 0.85));
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

  const ordered = base.history.slice().sort((a, b) => getPlayerHistorySortTimestamp(b) - getPlayerHistorySortTimestamp(a));
  const lines = ordered.map((h) => {
    const opponents = (h.opponents || []).length ? h.opponents.join(", ") : "без суперників";
    const ratingDelta = Number.isFinite(Number(h.ratingDelta))
      ? `${Number(h.ratingDelta) > 0 ? "+" : ""}${Number(h.ratingDelta)}`
      : "-";
    const ratingAfter = Number.isFinite(Number(h.ratingAfter)) ? Math.round(Number(h.ratingAfter)) : "-";
    return `• ${h.tournamentName} | ${formatPlayerHistoryDate(h)} | місце ${h.place ?? "-"} | очки ${Number(h.score).toFixed(1)} | Δрейтинг ${ratingDelta} | новий ${ratingAfter} | суперники: ${opponents}`;
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
    tp.gender = normalizeGender(base.gender);
    tp.photoDataUrl = base.photoDataUrl || null;
    tp.clubId = normalizeEntityId(base.clubId);
    tp.coachId = normalizeEntityId(base.coachId);
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

    t.players.push(
      createTournamentPlayer(getBaseFullName(base), rating, base.id, t.players.length, {
        gender: base.gender,
        photoDataUrl: base.photoDataUrl,
        clubId: base.clubId,
        coachId: base.coachId,
      })
    );
  }

  normalizeRoundsCountForCurrentFormat(t);
  saveAndRender();
}

async function submitClubForm() {
  const wasEditing = Boolean(editingClubId);
  const name = els.clubName.value.trim();
  const city = els.clubCity.value.trim();
  const contact = els.clubContact.value.trim();
  const description = els.clubDescription.value.trim();
  const removeLogo = els.clubRemoveLogo.checked;
  const logoFile = els.clubLogo.files?.[0] || null;

  if (!name) {
    alert("Назва клубу обов'язкова.");
    return;
  }

  if (state.clubs.some((club) => club.id !== editingClubId && club.name.toLowerCase() === name.toLowerCase())) {
    alert("Клуб з такою назвою вже є.");
    return;
  }

  let logoDataUrl = null;
  if (logoFile) {
    if (!isValidClubLogoFile(logoFile)) {
      return;
    }
    logoDataUrl = await readClubLogoDataUrl(logoFile);
  }

  let club = editingClubId ? state.clubs.find((item) => item.id === editingClubId) : null;
  if (club) {
    club.name = name;
    club.city = city;
    club.contact = contact;
    club.description = description;
    if (logoDataUrl) {
      club.logoDataUrl = logoDataUrl;
    } else if (removeLogo) {
      club.logoDataUrl = null;
    }
  } else {
    club = createClubRecord(name, city, contact, { description, logoDataUrl });
    state.clubs.push(club);
  }

  selectedClubProfileId = club.id;
  if (wasEditing) {
    selectedClubsView = "profile";
    selectedClubDetailTab = "profile";
  }
  resetClubForm();
  saveAndRender();
}

function startEditClub(clubId) {
  const club = state.clubs.find((item) => item.id === clubId);
  if (!club) {
    return;
  }

  selectedClubsView = "manage";
  selectedClubDetailTab = "profile";
  editingClubId = club.id;
  selectedClubProfileId = club.id;
  els.clubName.value = club.name || "";
  els.clubCity.value = club.city || "";
  els.clubContact.value = club.contact || "";
  els.clubDescription.value = club.description || "";
  els.clubLogo.value = "";
  els.clubRemoveLogo.checked = false;
  els.clubSubmitBtn.textContent = "Зберегти клуб";
  els.clubCancelEditBtn.hidden = false;
  els.clubEditHint.hidden = false;
  els.clubEditHint.textContent = `Редагування клубу: ${club.name}. Можна змінити назву, місто, контакти і логотип.`;
  els.clubForm.scrollIntoView({ behavior: "smooth", block: "center" });
  els.clubName.focus();
  renderClubsTab();
}

function resetClubForm() {
  editingClubId = null;
  els.clubForm.reset();
  els.clubRemoveLogo.checked = false;
  els.clubSubmitBtn.textContent = "Додати клуб";
  els.clubCancelEditBtn.hidden = true;
  els.clubEditHint.hidden = true;
  els.clubEditHint.textContent = "";
}

async function submitQuickClubPlayerForm(form) {
  const clubId = normalizeEntityId(form.dataset.clubId);
  const club = state.clubs.find((item) => item.id === clubId);
  if (!club) {
    alert("Клуб не знайдено.");
    return;
  }

  const lastName = form.querySelector("[name='lastName']")?.value.trim() || "";
  const firstName = form.querySelector("[name='firstName']")?.value.trim() || "";
  const rating = Number(form.querySelector("[name='rating']")?.value || 0);
  const gender = normalizeGender(form.querySelector("[name='gender']")?.value || "");
  const rank = normalizeRank(form.querySelector("[name='rank']")?.value || "б/р");
  const birthDate = normalizeBirthDate(form.querySelector("[name='birthDate']")?.value || "");
  const coachId = normalizeEntityId(form.querySelector("[name='coachId']")?.value || "");
  const photoFile = form.querySelector("[name='photo']")?.files?.[0] || null;

  if (!lastName || !firstName) {
    alert("Прізвище та ім'я гравця обов'язкові.");
    return;
  }

  if (!Number.isFinite(rating) || rating < 0) {
    alert("Рейтинг має бути невід'ємним числом.");
    return;
  }

  if (
    state.playerBase.some(
      (player) =>
        player.lastName.toLowerCase() === lastName.toLowerCase() &&
        player.firstName.toLowerCase() === firstName.toLowerCase()
    )
  ) {
    alert("Гравець з таким прізвищем та ім'ям уже є в базі.");
    return;
  }

  let photoDataUrl = null;
  if (photoFile) {
    if (!isValidBasePlayerPhotoFile(photoFile)) {
      return;
    }
    photoDataUrl = await readBasePlayerPhotoDataUrl(photoFile);
  }

  const player = createBasePlayerRecord(lastName, firstName, Math.round(rating), {
    gender,
    rank,
    birthDate,
    photoDataUrl,
    clubId,
    coachId,
  });
  state.playerBase.push(player);
  selectedClubDetailTab = "players";
  selectedClubPlayerProfileId = player.id;
  form.reset();
  saveAndRender();
  await flushRemoteSyncNow("club-player-save");
}

async function submitCoachForm() {
  const wasEditing = Boolean(editingCoachId);
  const lastName = els.coachLastName.value.trim();
  const firstName = els.coachFirstName.value.trim();
  const clubId = normalizeEntityId(els.coachClub.value);
  const phone = els.coachPhone.value.trim();
  const email = els.coachEmail.value.trim();
  const bio = els.coachBio.value.trim();
  const removePhoto = els.coachRemovePhoto.checked;
  const photoFile = els.coachPhoto.files?.[0] || null;

  if (!lastName || !firstName) {
    alert("Прізвище та ім'я тренера обов'язкові.");
    return;
  }

  if (!clubId) {
    alert("Оберіть клуб для тренера.");
    return;
  }

  let photoDataUrl = null;
  if (photoFile) {
    if (!isValidCoachPhotoFile(photoFile)) {
      return;
    }
    photoDataUrl = await readCoachPhotoDataUrl(photoFile);
  }

  let coach = editingCoachId ? state.coaches.find((item) => item.id === editingCoachId) : null;
  if (coach) {
    coach.lastName = lastName;
    coach.firstName = firstName;
    coach.clubId = clubId;
    coach.phone = phone;
    coach.email = email;
    coach.bio = bio;
    if (photoDataUrl) {
      coach.photoDataUrl = photoDataUrl;
    } else if (removePhoto) {
      coach.photoDataUrl = null;
    }
  } else {
    coach = createCoachRecord(lastName, firstName, clubId, { phone, email, bio, photoDataUrl });
    state.coaches.push(coach);
  }

  selectedClubDetailTab = "coaches";
  selectedClubProfileId = clubId;
  if (wasEditing) {
    selectedClubsView = "profile";
  }
  resetCoachForm();
  saveAndRender();
}

function startEditCoach(coachId) {
  const coach = state.coaches.find((item) => item.id === coachId);
  if (!coach) {
    return;
  }

  editingCoachId = coach.id;
  selectedClubsView = "manage";
  selectedClubProfileId = coach.clubId || selectedClubProfileId;
  selectedClubDetailTab = "coaches";
  renderClubsTab();

  els.coachLastName.value = coach.lastName || "";
  els.coachFirstName.value = coach.firstName || "";
  els.coachClub.value = coach.clubId || "";
  els.coachPhone.value = coach.phone || "";
  els.coachEmail.value = coach.email || "";
  els.coachBio.value = coach.bio || "";
  els.coachPhoto.value = "";
  els.coachRemovePhoto.checked = false;
  els.coachSubmitBtn.textContent = "Зберегти тренера";
  els.coachCancelEditBtn.hidden = false;
  els.coachEditHint.hidden = false;
  els.coachEditHint.textContent = `Редагування тренера: ${getCoachFullName(coach)}. Нове фото замінить поточне.`;
  els.coachForm.scrollIntoView({ behavior: "smooth", block: "center" });
  els.coachLastName.focus();
}

function resetCoachForm() {
  editingCoachId = null;
  els.coachForm.reset();
  els.coachRemovePhoto.checked = false;
  els.coachSubmitBtn.textContent = "Додати тренера";
  els.coachCancelEditBtn.hidden = true;
  els.coachEditHint.hidden = true;
  els.coachEditHint.textContent = "";
}

async function submitQuickClubCoachForm(form) {
  const clubId = normalizeEntityId(form.dataset.clubId);
  const club = state.clubs.find((item) => item.id === clubId);
  if (!club) {
    alert("Клуб не знайдено.");
    return;
  }

  const lastName = String(form.querySelector("[name='lastName']")?.value || "").trim();
  const firstName = String(form.querySelector("[name='firstName']")?.value || "").trim();
  const phone = String(form.querySelector("[name='phone']")?.value || "").trim();
  const email = String(form.querySelector("[name='email']")?.value || "").trim();
  const bio = String(form.querySelector("[name='bio']")?.value || "").trim();
  const photoFile = form.querySelector("[name='photo']")?.files?.[0] || null;

  if (!lastName || !firstName) {
    alert("Прізвище та ім'я тренера обов'язкові.");
    return;
  }

  let photoDataUrl = null;
  if (photoFile) {
    if (!isValidCoachPhotoFile(photoFile)) {
      return;
    }
    photoDataUrl = await readCoachPhotoDataUrl(photoFile);
  }

  const coach = createCoachRecord(lastName, firstName, clubId, { phone, email, bio, photoDataUrl });
  state.coaches.push(coach);
  selectedClubsView = "profile";
  selectedClubDetailTab = "coaches";
  selectedClubProfileId = clubId;
  form.reset();
  saveAndRender();
}

function deleteClub(clubId) {
  const club = state.clubs.find((item) => item.id === clubId);
  if (!club) {
    return;
  }

  const playersCount = state.playerBase.filter((player) => player.clubId === clubId).length;
  const coachesCount = state.coaches.filter((coach) => coach.clubId === clubId).length;
  const message = `Видалити клуб "${club.name}"? Гравці стануть незалежними, тренери будуть відв'язані.`;
  if ((playersCount > 0 || coachesCount > 0) && !confirm(message)) {
    return;
  }
  if (playersCount === 0 && coachesCount === 0 && !confirm(`Видалити клуб "${club.name}"?`)) {
    return;
  }

  state.clubs = state.clubs.filter((item) => item.id !== clubId);
  for (const coach of state.coaches) {
    if (coach.clubId === clubId) {
      coach.clubId = "";
    }
  }
  for (const player of state.playerBase) {
    if (player.clubId === clubId) {
      player.clubId = "";
      player.coachId = "";
      syncBasePlayerChangesToCurrentTournament(player.id);
    }
  }
  if (selectedClubProfileId === clubId) {
    selectedClubProfileId = null;
  }
  saveAndRender();
}

function submitAttachExistingPlayerToClubForm(form) {
  const clubId = normalizeEntityId(form.dataset.clubId);
  const playerId = normalizeEntityId(form.querySelector("[name='existingPlayerId']")?.value || "");
  const coachId = normalizeEntityId(form.querySelector("[name='coachId']")?.value || "");
  const club = state.clubs.find((item) => item.id === clubId);
  const player = state.playerBase.find((item) => item.id === playerId);

  if (!club) {
    alert("Клуб не знайдено.");
    return;
  }

  if (!player) {
    alert("Оберіть гравця з бази.");
    return;
  }

  player.clubId = club.id;
  player.coachId = coachId;
  syncBasePlayerChangesToCurrentTournament(player.id);
  selectedClubsView = "profile";
  selectedClubDetailTab = "players";
  selectedClubProfileId = club.id;
  selectedClubPlayerProfileId = player.id;
  form.reset();
  saveAndRender();
}

function removeBasePlayerFromClub(playerId) {
  const player = state.playerBase.find((item) => item.id === playerId);
  if (!player) {
    return;
  }

  if (!confirm(`Відв'язати ${getBaseFullName(player)} від клубу?`)) {
    return;
  }

  player.clubId = "";
  player.coachId = "";
  syncBasePlayerChangesToCurrentTournament(player.id);
  if (selectedClubPlayerProfileId === player.id) {
    selectedClubPlayerProfileId = null;
  }
  saveAndRender();
}

function editClubPlayerInBase(playerId) {
  const player = state.playerBase.find((item) => item.id === playerId);
  if (!player) {
    return;
  }

  state.activeTab = "players";
  saveAndRender();
  startEditBasePlayer(playerId);
}

function openTournamentFromPlayerProfile(tournamentId) {
  const id = normalizeEntityId(tournamentId);
  if (!id) {
    return;
  }

  if (state.currentTournament?.id === id) {
    state.activeTab = "tournament";
    state.tournamentView = "table";
    saveAndRender();
    return;
  }

  const archived = state.tournamentsArchive.find((item) => item.id === id);
  if (!archived) {
    alert("Турнір для переходу не знайдено в архіві.");
    return;
  }

  state.activeTab = "archive";
  state.archivePreviewTournamentId = id;
  saveAndRender();
}

// ===== 06-pairing.js =====
function getTournamentByeBigPoints(tournament) {
  return tournament?.format === "round_robin" ? 0 : 1;
}

function getTournamentByeSmallPoints(tournament) {
  return tournament?.format === "round_robin" ? 0 : 2;
}

function createPendingPairingForTournament(tournament, board, whiteId, blackId) {
  const isMicromatch = Boolean(tournament?.isMicromatch);
  return {
    board,
    whiteId,
    blackId,
    result: "pending",
    isMicromatch,
    gameResults: isMicromatch ? ["pending", "pending"] : null,
    smallPointsWhite: isMicromatch ? 0 : null,
    smallPointsBlack: isMicromatch ? 0 : null,
  };
}

function createByePairingForTournament(tournament, board, playerId) {
  return {
    board,
    whiteId: playerId,
    blackId: null,
    result: "BYE",
    isMicromatch: false,
    gameResults: null,
    smallPointsWhite: getTournamentByeSmallPoints(tournament),
    smallPointsBlack: 0,
  };
}

function getMicromatchGameSmallPoints(resultCode, isWhitePlayer) {
  if (resultCode === "1-0") {
    return isWhitePlayer ? 2 : 0;
  }
  if (resultCode === "0-1") {
    return isWhitePlayer ? 0 : 2;
  }
  if (resultCode === "0.5-0.5") {
    return 1;
  }
  return 0;
}

function resolveMicromatchBigResultBySmallScore(whiteSmall, blackSmall) {
  if (whiteSmall > blackSmall) {
    return "1-0";
  }
  if (blackSmall > whiteSmall) {
    return "0-1";
  }
  return "0.5-0.5";
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

function createManualRoundFromForm() {
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
  const boardsCount = Math.floor(t.players.length / 2);
  const used = new Set();
  const pairings = [];

  for (let board = 1; board <= boardsCount; board += 1) {
    const whiteId = els.manualPairingPanel.querySelector(`[data-manual-white="${board}"]`)?.value || "";
    const blackId = els.manualPairingPanel.querySelector(`[data-manual-black="${board}"]`)?.value || "";

    if (!whiteId || !blackId) {
      alert(`Заповніть обох гравців на дошці ${board}.`);
      return;
    }

    if (whiteId === blackId) {
      alert(`На дошці ${board} один гравець не може грати сам із собою.`);
      return;
    }

    if (used.has(whiteId) || used.has(blackId)) {
      alert("Один гравець не може бути в турі більше одного разу.");
      return;
    }

    if (!t.players.some((player) => player.id === whiteId) || !t.players.some((player) => player.id === blackId)) {
      alert("У ручному турі є гравець, якого немає в складі турніру.");
      return;
    }

    used.add(whiteId);
    used.add(blackId);
    pairings.push(createPendingPairingForTournament(t, board, whiteId, blackId));
  }

  if (t.players.length % 2 === 1) {
    const byeId = els.manualPairingPanel.querySelector("[data-manual-bye]")?.value || "";
    if (!byeId) {
      alert("Оберіть гравця з BYE.");
      return;
    }

    if (used.has(byeId)) {
      alert("Гравець з BYE не може одночасно грати партію в цьому турі.");
      return;
    }

    const byePlayer = t.players.find((player) => player.id === byeId);
    if (!byePlayer) {
      alert("Гравця з BYE немає в складі турніру.");
      return;
    }

    byePlayer.hadBye = true;
    byePlayer.score += getTournamentByeBigPoints(t);
    byePlayer.resultsByRound[nextRoundNumber] = "BYE";
    pairings.push(createByePairingForTournament(t, pairings.length + 1, byePlayer.id));
  }

  applyPendingMetadata(t, pairings);
  t.rounds.push({ round: nextRoundNumber, pairings, manual: true });
  t.currentRound = nextRoundNumber;
  t.updatedAt = new Date().toISOString();
  manualRoundBuilderOpen = false;

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
    byePlayer.score += getTournamentByeBigPoints(tournament);
    byePlayer.resultsByRound[roundNumber] = "BYE";
    pairings.push(createByePairingForTournament(tournament, pairings.length + 1, byePlayer.id));
  }

  for (const [p1, p2] of pairedTuples) {
    const colors = assignColors(p1, p2);
    pairings.push(createPendingPairingForTournament(tournament, pairings.length + 1, colors.white.id, colors.black.id));
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
      byePlayer.score += getTournamentByeBigPoints(tournament);
      byePlayer.resultsByRound[roundNumber] = "BYE";
      pairings.push(createByePairingForTournament(tournament, pairings.length + 1, byePlayer.id));
      continue;
    }

    pairings.push(createPendingPairingForTournament(tournament, pairings.length + 1, pair.whiteId, pair.blackId));
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
  if (!canManageAdminUi() || !t || t.status !== "active") {
    return;
  }
  const round = t.rounds[roundIdx];
  if (!round) {
    return;
  }

  const pairing = round.pairings.find((p) => p.board === board);
  if (!pairing || !pairing.blackId) {
    return;
  }

  rollbackResultIfNeeded(t, round.round, pairing);
  pairing.result = value;
  pairing.gameResults = null;
  pairing.smallPointsWhite = null;
  pairing.smallPointsBlack = null;

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

function updateMicromatchGameResult(roundIdx, board, gameIndex, value) {
  const t = state.currentTournament;
  if (!canManageAdminUi() || !t || t.status !== "active") {
    return;
  }
  const round = t.rounds[roundIdx];
  if (!round) {
    return;
  }

  const pairing = round.pairings.find((p) => p.board === board);
  if (!pairing || !pairing.blackId || !pairing.isMicromatch) {
    return;
  }

  const safeIndex = Number(gameIndex);
  if (!Number.isInteger(safeIndex) || safeIndex < 0 || safeIndex > 1) {
    return;
  }

  if (!Array.isArray(pairing.gameResults) || pairing.gameResults.length !== 2) {
    pairing.gameResults = ["pending", "pending"];
  }

  rollbackResultIfNeeded(t, round.round, pairing);
  pairing.result = "pending";
  pairing.smallPointsWhite = 0;
  pairing.smallPointsBlack = 0;

  pairing.gameResults[safeIndex] = value;
  const done = pairing.gameResults.every((x) => x === "1-0" || x === "0-1" || x === "0.5-0.5");
  if (!done) {
    const white = t.players.find((p) => p.id === pairing.whiteId);
    const black = t.players.find((p) => p.id === pairing.blackId);
    if (white && white.resultsByRound) {
      delete white.resultsByRound[round.round];
    }
    if (black && black.resultsByRound) {
      delete black.resultsByRound[round.round];
    }
    t.updatedAt = new Date().toISOString();
    saveAndRender();
    return;
  }

  const white = t.players.find((p) => p.id === pairing.whiteId);
  const black = t.players.find((p) => p.id === pairing.blackId);
  if (!white || !black) {
    return;
  }

  const whiteSmall = pairing.gameResults.reduce((sum, r) => sum + getMicromatchGameSmallPoints(r, true), 0);
  const blackSmall = pairing.gameResults.reduce((sum, r) => sum + getMicromatchGameSmallPoints(r, false), 0);
  pairing.smallPointsWhite = whiteSmall;
  pairing.smallPointsBlack = blackSmall;
  pairing.result = resolveMicromatchBigResultBySmallScore(whiteSmall, blackSmall);

  if (pairing.result === "1-0") {
    white.score += 2;
    white.resultsByRound[round.round] = "W";
    black.resultsByRound[round.round] = "L";
  } else if (pairing.result === "0-1") {
    black.score += 2;
    black.resultsByRound[round.round] = "W";
    white.resultsByRound[round.round] = "L";
  } else {
    white.score += 1;
    black.score += 1;
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
    if (pairing.isMicromatch) {
      white.score -= 2;
    } else {
      white.score -= 1;
    }
  }

  if (pairing.result === "0-1") {
    if (pairing.isMicromatch) {
      black.score -= 2;
    } else {
      black.score -= 1;
    }
  }

  if (pairing.result === "0.5-0.5") {
    if (pairing.isMicromatch) {
      white.score -= 1;
      black.score -= 1;
    } else {
      white.score -= 0.5;
      black.score -= 0.5;
    }
  }

  delete white.resultsByRound[roundNumber];
  delete black.resultsByRound[roundNumber];
}

// ===== 07-standings.js =====
function isLastRoundComplete(tournament) {
  if (tournament.rounds.length === 0) {
    return true;
  }

  const lastRound = tournament.rounds[tournament.rounds.length - 1];
  return lastRound.pairings.every((pair) => {
    if (!pair.blackId) {
      return true;
    }
    if (!pair.isMicromatch) {
      return pair.result !== "pending";
    }
    return Array.isArray(pair.gameResults) && pair.gameResults.length === 2 && pair.gameResults.every((x) => x !== "pending");
  });
}

function getPairSmallPointsForPlayer(pair, playerId) {
  if (!pair || !pair.blackId) {
    return 0;
  }

  const playerIsWhite = pair.whiteId === playerId;
  if (!playerIsWhite && pair.blackId !== playerId) {
    return 0;
  }

  if (pair.isMicromatch && Array.isArray(pair.gameResults) && pair.gameResults.length === 2) {
    return pair.gameResults.reduce((sum, resultValue) => sum + getMicromatchGameSmallPoints(resultValue, playerIsWhite), 0);
  }

  const result = String(pair.result || "");
  if (result === "1-0") {
    return playerIsWhite ? 2 : 0;
  }
  if (result === "0-1") {
    return playerIsWhite ? 0 : 2;
  }
  if (result === "0.5-0.5") {
    return 1;
  }
  return 0;
}

function getTotalSmallPoints(tournament, player) {
  const byeSmall = getTournamentByeSmallPoints(tournament);
  let total = 0;

  for (const round of tournament.rounds || []) {
    const game = (round.pairings || []).find((pair) => pair.whiteId === player.id || pair.blackId === player.id);
    if (!game) {
      continue;
    }

    if (!game.blackId) {
      total += byeSmall;
      continue;
    }

    total += getPairSmallPointsForPlayer(game, player.id);
  }

  return total;
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

      if (tournament.isMicromatch) {
        if (game.result === "0.5-0.5") {
          total += 1;
          continue;
        }

        const playerIsWhite = game.whiteId === player.id;
        const didPlayerWin = (playerIsWhite && game.result === "1-0") || (!playerIsWhite && game.result === "0-1");
        total += didPlayerWin ? 2 : 0;
      } else {
        if (game.result === "0.5-0.5") {
          total += 0.5;
          continue;
        }

        const playerIsWhite = game.whiteId === player.id;
        const didPlayerWin = (playerIsWhite && game.result === "1-0") || (!playerIsWhite && game.result === "0-1");
        total += didPlayerWin ? 1 : 0;
      }
    }
  }

  return total;
}

function getStandings(tournament) {
  const enriched = tournament.players.map((p) => ({
    ...p,
    h2h: 0,
    smallPoints: getTotalSmallPoints(tournament, p),
    wins: getWins(p),
    buchholz: getBuchholz(tournament, p),
    solkPlus: getSolkPlus(tournament, p),
    tsolk: getTSolk(tournament, p),
    sb: getSonnebornBerger(tournament, p),
  }));

  const grouped = new Map();
  const primaryMetric = tournament.isMicromatch && tournament.scoreCalculationType === "small_points" ? "smallPoints" : "score";
  for (const player of enriched) {
    const key = Number(player[primaryMetric]).toFixed(4);
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
      const aManual = Number.isInteger(a.manualPlace) ? a.manualPlace : null;
      const bManual = Number.isInteger(b.manualPlace) ? b.manualPlace : null;
      if (aManual !== null || bManual !== null) {
        if (aManual !== null && bManual !== null && aManual !== bManual) {
          return aManual - bManual;
        }
        if (aManual !== null && bManual === null) {
          return -1;
        }
        if (aManual === null && bManual !== null) {
          return 1;
        }
      }

      if (primaryMetric === "smallPoints" && b.smallPoints !== a.smallPoints) {
        return b.smallPoints - a.smallPoints;
      }
      if (primaryMetric === "score" && b.score !== a.score) {
        return b.score - a.score;
      }
      if (tournament.isMicromatch && tournament.scoreCalculationType === "big_points" && b.smallPoints !== a.smallPoints) {
        return b.smallPoints - a.smallPoints;
      }

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
    let toneClass = "chip-empty";
    if (r === "W") {
      result = "1";
      toneClass = "chip-win";
    } else if (r === "D") {
      result = "0.5";
      toneClass = "chip-draw";
    } else if (r === "L") {
      result = "0";
      toneClass = "chip-loss";
    }

    const tooltip = opponent ? `Суперник: ${opponent.name} (місце ${oppNo})` : "Суперник невідомий";
    html += `<td><span class="round-chip ${toneClass}" data-tooltip="${escapeHtml(tooltip)}">${oppNo}${color} ${result}</span></td>`;
  }

  return html;
}

// ===== 08-lifecycle-utils.js =====
function setPersistenceInfo(next) {
  persistenceInfo = {
    ...persistenceInfo,
    ...next,
  };
}

function loadStoredAuthToken() {
  try {
    return String(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function storeAuthToken(token) {
  authToken = String(token || "").trim();
  try {
    if (authToken) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures, auth still works for current session.
  }
}

function getRoleLabel(role) {
  if (role === "super_admin") {
    return "Супер-адміністратор";
  }
  if (role === "admin") {
    return "Адміністратор";
  }
  return "Перегляд";
}

function canManageAdminUi() {
  if (persistenceInfo.mode !== "remote") {
    return true;
  }

  const role = String(authUser?.role || "");
  return role === "admin" || role === "super_admin";
}

function renderAuthPanel() {
  if (!els.authStatus) {
    return;
  }
  const isLoggedIn = Boolean(authUser);
  if (els.authForm) {
    els.authForm.hidden = isLoggedIn;
  }
  if (els.authUserWrap) {
    els.authUserWrap.hidden = !isLoggedIn;
  }
  if (els.authUserLabel) {
    els.authUserLabel.textContent = isLoggedIn
      ? `${authUser.fullName || authUser.email} · ${getRoleLabel(authUser.role)}`
      : "";
  }
  if (isLoggedIn) {
    els.authStatus.textContent = `Ви увійшли як ${getRoleLabel(authUser.role)}.`;
  } else {
    els.authStatus.textContent = "Режим перегляду. Для редагування увійдіть як адміністратор.";
  }
}

function persistLocalState(options = {}) {
  const { notifyOnError = true } = options;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    if (notifyOnError) {
      if (isQuotaExceededError(error)) {
        alert("Браузерне сховище переповнене. Зменште розмір/кількість фото і спробуйте знову.");
      } else {
        alert("Не вдалося зберегти зміни в браузері. Спробуйте ще раз.");
      }
    }
    console.error(error);
    return false;
  }
}

function normalizeApiBaseUrl(value) {
  const text = String(value || "").trim();
  if (!text || text === "same-origin") {
    return "";
  }

  try {
    const url = new URL(text);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function resolveApiBaseUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get("api");
  if (queryValue) {
    const normalized = normalizeApiBaseUrl(queryValue);
    if (normalized !== null) {
      try {
        localStorage.setItem(API_BASE_URL_STORAGE_KEY, normalized);
      } catch {
        // Ignore storage failures here; local fallback still works.
      }
      return normalized;
    }
  }

  try {
    const stored = normalizeApiBaseUrl(localStorage.getItem(API_BASE_URL_STORAGE_KEY));
    if (stored !== null && stored !== "") {
      return stored;
    }
  } catch {
    // Ignore and continue with auto-detection.
  }

  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return "";
  }

  return null;
}

function buildApiUrl(path) {
  return `${remoteApiBaseUrl || ""}${path}`;
}

async function apiRequest(path, options = {}) {
  const { method = "GET", body = undefined, timeoutMs = 5000 } = options;
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId =
    controller && Number.isFinite(timeoutMs) && timeoutMs > 0
      ? window.setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const headers = {};
    if (body) {
      headers["Content-Type"] = "application/json";
    }
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(buildApiUrl(path), {
      method,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller ? controller.signal : undefined,
    });

    if (response.status === 204) {
      return null;
    }

    const contentType = String(response.headers.get("content-type") || "");
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401 && path !== "/api/auth/login") {
        authUser = null;
        storeAuthToken("");
        renderAuthPanel();
      }
      const errorMessage =
        payload && typeof payload === "object" && payload.error
          ? payload.error
          : isJson
            ? `HTTP ${response.status}`
            : String(payload || `HTTP ${response.status}`).slice(0, 140);
      throw new Error(errorMessage);
    }

    return payload;
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

async function bootstrapPersistence() {
  if (remoteBootstrapStarted) {
    return;
  }

  remoteBootstrapStarted = true;
  remoteBootstrapRevision = stateRevision;
  remoteApiBaseUrl = resolveApiBaseUrl();

  if (remoteApiBaseUrl === null) {
    setPersistenceInfo({
      mode: "local",
      status: "idle",
      message: "Відкрито без вебсервера: працюю лише з localStorage.",
      lastSyncedAt: "",
    });
    render();
    return;
  }

  setPersistenceInfo({
    mode: "local",
    status: "checking",
    message: remoteApiBaseUrl ? "Перевіряю Render API..." : "Перевіряю вбудований API...",
    lastSyncedAt: "",
  });
  render();

  try {
    authToken = loadStoredAuthToken();
    if (authToken) {
      try {
        const me = await apiRequest("/api/auth/me", { timeoutMs: 5000 });
        authUser = me?.user || null;
      } catch {
        authUser = null;
        storeAuthToken("");
      }
    } else {
      authUser = null;
    }

    const { clubRows, coachRows, playersRows, tournamentRows } = await fetchRemoteBootstrapPayload();
    remoteKnownClubIds = new Set(clubRows.map((item) => item.id).filter(Boolean));
    remoteKnownCoachIds = new Set(coachRows.map((item) => item.id).filter(Boolean));
    remoteKnownPlayerIds = new Set(playersRows.map((item) => item.id).filter(Boolean));
    remoteKnownTournamentIds = new Set(tournamentRows.map((item) => item.id).filter(Boolean));
    const remoteHasData = clubRows.length > 0 || coachRows.length > 0 || playersRows.length > 0 || tournamentRows.length > 0;
    const localHasData = hasMeaningfulAppState(state);

    setPersistenceInfo({
      mode: "remote",
      status: "ready",
      message: "Підключено до Render API. Зміни синхронізуються з PostgreSQL.",
      lastSyncedAt: new Date().toISOString(),
    });

    if (!remoteHasData && localHasData && hasStoredLocalState) {
      setPersistenceInfo({
        mode: "remote",
        status: "ready",
        message: "Render база порожня. Переношу в неї поточні локальні дані.",
        lastSyncedAt: "",
      });
      scheduleRemoteSync("bootstrap-seed");
    } else {
      // Render/PostgreSQL is the source of truth whenever it already has data.
      // This prevents stale browser localStorage from overwriting cross-device fields
      // such as tournament dates and player birth dates.
      state = buildStateFromApi(clubRows, coachRows, playersRows, tournamentRows);
      tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
      persistLocalState({ notifyOnError: false });
    }
  } catch (error) {
    console.error("[bootstrapPersistence]", error);
    setPersistenceInfo({
      mode: "local",
      status: "error",
      message: "Render API недоступний. Працюю локально через localStorage.",
      lastSyncedAt: "",
    });
  }

  render();
}

async function loginAsAdmin(email, password) {
  const payload = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
    timeoutMs: 6000,
  });
  if (!payload?.token || !payload?.user) {
    throw new Error("Не вдалося виконати вхід");
  }
  storeAuthToken(payload.token);
  authUser = payload.user;
  renderAuthPanel();
}

async function logoutAdmin() {
  if (authToken) {
    try {
      await apiRequest("/api/auth/logout", { method: "POST", timeoutMs: 5000 });
    } catch {
      // Ignore logout failures, token will be removed locally.
    }
  }
  authUser = null;
  storeAuthToken("");
  renderAuthPanel();
}

async function fetchRemoteBootstrapPayload() {
  await apiRequest("/api/health", { timeoutMs: 3500 });
  const [playersRows, tournamentRows] = await Promise.all([
    apiRequest("/api/players", { timeoutMs: 5000 }),
    apiRequest("/api/tournaments", { timeoutMs: 5000 }),
  ]);
  const [clubRows, coachRows] = await Promise.all([
    apiRequest("/api/clubs", { timeoutMs: 5000 }),
    apiRequest("/api/coaches", { timeoutMs: 5000 }),
  ]);

  return {
    clubRows: Array.isArray(clubRows) ? clubRows : [],
    coachRows: Array.isArray(coachRows) ? coachRows : [],
    playersRows: Array.isArray(playersRows) ? playersRows : [],
    tournamentRows: Array.isArray(tournamentRows) ? tournamentRows : [],
  };
}

function buildStateFromApi(clubRows, coachRows, playersRows, tournamentRows) {
  const clubs = clubRows.map(mapApiClubToState);
  const coaches = coachRows.map(mapApiCoachToState);
  const basePlayers = playersRows.map(mapApiPlayerToBasePlayer);
  const mappedTournaments = tournamentRows.map(mapApiTournamentToState);
  const archivedTournaments = mappedTournaments
    .filter((item) => item.status === "archived")
    .map((item) => normalizeArchivedTournament(item));

  const activeTournament =
    mappedTournaments
      .filter((item) => item.status !== "archived" && item.status !== "archived_view")
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0] ||
    createDefaultTournament();

  const nextState = normalizeState({
    activeTab: state?.activeTab || "tournament",
    tournamentView: state?.tournamentView || "setup",
    archivePreviewTournamentId: null,
    kyivPresetVersion: KYIV_PRESET_VERSION,
    clubs,
    coaches,
    playerBase: basePlayers,
    currentTournament: activeTournament,
    tournamentsArchive: archivedTournaments,
  });

  ensureTournamentPlayersLinkedToBase(nextState.currentTournament, nextState.playerBase);
  for (const tournament of nextState.tournamentsArchive) {
    ensureTournamentPlayersLinkedToBase(tournament, nextState.playerBase);
  }
  rebuildPlayerBaseHistoryForState(nextState);

  return nextState;
}

function getTournamentStateFreshnessTimestamp(tournament) {
  if (!tournament) {
    return 0;
  }
  const iso = tournament.finishedAt || tournament.updatedAt || tournament.createdAt || null;
  const value = iso ? new Date(iso).getTime() : 0;
  return Number.isFinite(value) ? value : 0;
}

function getAppStateFreshnessTimestamp(appState) {
  if (!appState) {
    return 0;
  }
  let latest = 0;
  latest = Math.max(latest, getTournamentStateFreshnessTimestamp(appState.currentTournament));
  for (const archived of appState.tournamentsArchive || []) {
    latest = Math.max(latest, getTournamentStateFreshnessTimestamp(archived));
  }
  return latest;
}

function getRemoteTournamentFreshnessTimestamp(tournamentRows) {
  if (!Array.isArray(tournamentRows) || tournamentRows.length === 0) {
    return 0;
  }
  let latest = 0;
  for (const row of tournamentRows) {
    const iso = row?.archived_at || row?.updated_at || row?.created_at || null;
    const ts = iso ? new Date(iso).getTime() : 0;
    if (Number.isFinite(ts)) {
      latest = Math.max(latest, ts);
    }
  }
  return latest;
}

function shouldPreferLocalStateOverRemote(localState, remoteTournamentRows) {
  if (!hasStoredLocalState || !hasMeaningfulAppState(localState) || !Array.isArray(remoteTournamentRows) || remoteTournamentRows.length === 0) {
    return false;
  }
  const localTs = getAppStateFreshnessTimestamp(localState);
  const remoteTs = getRemoteTournamentFreshnessTimestamp(remoteTournamentRows);
  if (!localTs || !remoteTs) {
    return false;
  }
  return localTs > remoteTs;
}

function mapApiPlayerToBasePlayer(row) {
  return normalizeBasePlayer({
    id: row.id,
    lastName: row.last_name,
    firstName: row.first_name,
    rating: row.rating,
    gender: row.gender,
    clubId: row.club_id,
    coachId: row.coach_id,
    rank: row.rank,
    birthDate: normalizeBirthDate(row.birth_date),
    photoDataUrl: row.photo_url,
    createdAt: row.created_at,
    history: [],
    stats: emptyStats(),
  });
}

function mapApiClubToState(row) {
  return normalizeClub({
    id: row.id,
    name: row.name,
    city: row.city,
    contact: row.contact,
    description: row.description,
    logoDataUrl: row.logo_url,
    createdAt: row.created_at,
  });
}

function mapApiCoachToState(row) {
  return normalizeCoach({
    id: row.id,
    lastName: row.last_name,
    firstName: row.first_name,
    clubId: row.club_id,
    phone: row.phone,
    email: row.email,
    bio: row.bio,
    photoDataUrl: row.photo_url,
    createdAt: row.created_at,
  });
}

function mapApiTournamentToState(row) {
  const payload = row && typeof row.payload === "object" && row.payload ? row.payload : {};
  const normalizedEventDate = normalizeBirthDate(row.event_date || payload.eventDate || "");
  return {
    id: row.id,
    name: row.name || payload.name || "Турнір",
    format: row.format === "round_robin" ? "round_robin" : "swiss",
    isMicromatch: Boolean(payload.isMicromatch),
    scoreCalculationType: payload.scoreCalculationType === "small_points" ? "small_points" : "big_points",
    eventDate: normalizedEventDate,
    timeControl: row.time_control || payload.timeControl || "",
    chiefJudge: row.chief_judge || payload.chiefJudge || "",
    tieBreakOrder: Array.isArray(row.tie_break_order) ? row.tie_break_order : payload.tieBreakOrder,
    photoDataUrl: row.photo_url || payload.photoDataUrl || null,
    roundsCount: row.rounds_count || payload.roundsCount || 1,
    currentRound: row.current_round || payload.currentRound || 0,
    status: row.status || payload.status || "active",
    ownerAdminId: row.owner_admin_id || payload.ownerAdminId || null,
    cityId: row.city_id || payload.cityId || null,
    isPublic: row.is_public !== false && payload.isPublic !== false,
    setupNotified: Boolean(payload.setupNotified),
    createdAt: row.created_at || payload.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || payload.updatedAt || new Date().toISOString(),
    finishedAt: row.archived_at || payload.finishedAt || row.updated_at || new Date().toISOString(),
    ratingDeltas: normalizeTournamentRatingDeltas(payload.ratingDeltas),
    players: Array.isArray(payload.players) ? payload.players : [],
    rounds: Array.isArray(payload.rounds) ? payload.rounds : [],
  };
}

function cloneAppState(appState) {
  if (typeof structuredClone === "function") {
    return structuredClone(appState);
  }

  return JSON.parse(JSON.stringify(appState));
}

function prepareStateForPersistence(appState) {
  const snapshot = cloneAppState(appState);
  ensureTournamentPlayersLinkedToBase(snapshot.currentTournament, snapshot.playerBase);

  for (const archived of snapshot.tournamentsArchive) {
    ensureTournamentPlayersLinkedToBase(archived, snapshot.playerBase);
  }

  rebuildPlayerBaseHistoryForState(snapshot);
  return snapshot;
}

function rebuildPlayerBaseHistoryForState(appState) {
  for (const base of appState.playerBase) {
    base.history = [];
    base.stats = emptyStats();
  }

  for (const archived of appState.tournamentsArchive) {
    mergeTournamentResultsIntoPlayerBase(appState.playerBase, archived);
  }
}

function mergeTournamentResultsIntoPlayerBase(basePlayers, tournamentSnapshot) {
  const standings = getStandings(tournamentSnapshot);
  const placeById = Object.fromEntries(standings.map((p, idx) => [p.id, idx + 1]));
  const ratingMetaByBasePlayerId = new Map(
    (tournamentSnapshot.ratingDeltas || [])
      .filter((item) => item?.basePlayerId)
      .map((item) => [item.basePlayerId, item])
  );

  for (const tp of tournamentSnapshot.players) {
    const base = findOrCreateBasePlayerForTournamentPlayer(basePlayers, tp);
    const { games, wins, draws, losses, bye } = countPlayerStats(tp);
    const ratingMeta = ratingMetaByBasePlayerId.get(base.id) || null;

    const entry = {
      tournamentId: tournamentSnapshot.id,
      tournamentName: tournamentSnapshot.name,
      eventDate: normalizeBirthDate(tournamentSnapshot.eventDate),
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
      ratingBefore: ratingMeta ? Number(ratingMeta.ratingBefore) || 0 : null,
      ratingDelta: ratingMeta ? Number(ratingMeta.ratingDelta) || 0 : null,
      ratingAfter: ratingMeta ? Number(ratingMeta.ratingAfter) || 0 : null,
      gamesRated: ratingMeta ? Number(ratingMeta.gamesRated) || 0 : 0,
      pointsRated: ratingMeta ? Number(ratingMeta.pointsRated) || 0 : 0,
      expectedPoints: ratingMeta ? Number(ratingMeta.expectedPoints) || 0 : 0,
      averageOpponentRating: ratingMeta ? Number(ratingMeta.averageOpponentRating) || 0 : 0,
    };

    const existingIdx = base.history.findIndex((h) => h.tournamentId === tournamentSnapshot.id);
    if (existingIdx >= 0) {
      base.history[existingIdx] = entry;
    } else {
      base.history.push(entry);
    }
  }

  recalcBaseStatsForList(basePlayers);
}

function findOrCreateBasePlayerForTournamentPlayer(basePlayers, tournamentPlayer) {
  let base = null;

  if (tournamentPlayer.basePlayerId) {
    base = basePlayers.find((bp) => bp.id === tournamentPlayer.basePlayerId);
  }

  if (!base) {
    base = basePlayers.find((bp) => getBaseFullName(bp).toLowerCase() === tournamentPlayer.name.toLowerCase());
  }

  if (!base) {
    const split = splitFullName(tournamentPlayer.name);
    base = createBasePlayerRecord(split.lastName, split.firstName, tournamentPlayer.rating, {
      gender: tournamentPlayer.gender,
      photoDataUrl: tournamentPlayer.photoDataUrl,
      clubId: tournamentPlayer.clubId,
      coachId: tournamentPlayer.coachId,
    });
    base.id = tournamentPlayer.basePlayerId || base.id;
    basePlayers.push(base);
  }

  if (!base.gender && tournamentPlayer.gender) {
    base.gender = normalizeGender(tournamentPlayer.gender);
  }

  if (!base.photoDataUrl && tournamentPlayer.photoDataUrl) {
    base.photoDataUrl = tournamentPlayer.photoDataUrl;
  }

  if (!base.clubId && tournamentPlayer.clubId) {
    base.clubId = normalizeEntityId(tournamentPlayer.clubId);
  }

  if (!base.coachId && tournamentPlayer.coachId) {
    base.coachId = normalizeEntityId(tournamentPlayer.coachId);
  }

  return base;
}

function buildBasePlayerApiPayload(basePlayer) {
  return {
    id: basePlayer.id,
    last_name: basePlayer.lastName,
    first_name: basePlayer.firstName,
    rating: Number(basePlayer.rating) || 0,
    gender: normalizeGender(basePlayer.gender),
    club_id: normalizeEntityId(basePlayer.clubId) || null,
    coach_id: normalizeEntityId(basePlayer.coachId) || null,
    rank: normalizeRank(basePlayer.rank),
    birth_date: normalizeBirthDate(basePlayer.birthDate) || null,
    photo_url: basePlayer.photoDataUrl || null,
  };
}

function buildClubApiPayload(club) {
  return {
    id: club.id,
    name: club.name,
    city: club.city || "",
    contact: club.contact || "",
    description: club.description || "",
    logo_url: club.logoDataUrl || null,
  };
}

function buildCoachApiPayload(coach) {
  return {
    id: coach.id,
    last_name: coach.lastName,
    first_name: coach.firstName,
    club_id: normalizeEntityId(coach.clubId) || null,
    phone: coach.phone || "",
    email: coach.email || "",
    bio: coach.bio || "",
    photo_url: coach.photoDataUrl || null,
  };
}

function buildTournamentPlayersPayload(players) {
  if (!Array.isArray(players)) {
    return [];
  }

  return players.map((player) => ({
    ...player,
    // Keep tournament payload compact: player photos are synced in /api/players.
    photoDataUrl: null,
  }));
}

function buildTournamentApiPayload(tournament, status) {
  const tieBreakOrder = normalizeTieBreakOrder(tournament.tieBreakOrder, { fillDefaults: false });
  const archivedAt = status === "archived" ? tournament.finishedAt || tournament.updatedAt || new Date().toISOString() : null;

  return {
    id: tournament.id,
    name: tournament.name || "Турнір",
    format: tournament.format === "round_robin" ? "round_robin" : "swiss",
    rounds_count: Number(tournament.roundsCount) || 1,
    current_round: Number(tournament.currentRound) || 0,
    status,
    owner_admin_id: tournament.ownerAdminId || null,
    city_id: tournament.cityId || null,
    is_public: tournament.isPublic !== false,
    event_date: normalizeBirthDate(tournament.eventDate) || null,
    time_control: normalizeTimeControl(tournament.timeControl) || null,
    chief_judge: normalizeChiefJudge(tournament.chiefJudge) || null,
    photo_url: tournament.photoDataUrl || null,
    tie_break_order: tieBreakOrder,
    archived_at: archivedAt,
    payload: {
      players: buildTournamentPlayersPayload(tournament.players),
      rounds: Array.isArray(tournament.rounds) ? tournament.rounds : [],
      createdAt: tournament.createdAt || new Date().toISOString(),
      updatedAt: tournament.updatedAt || new Date().toISOString(),
      finishedAt: archivedAt,
      tieBreakOrder,
      isMicromatch: Boolean(tournament.isMicromatch),
      scoreCalculationType: tournament.scoreCalculationType === "small_points" ? "small_points" : "big_points",
      ownerAdminId: tournament.ownerAdminId || null,
      cityId: tournament.cityId || null,
      isPublic: tournament.isPublic !== false,
      setupNotified: Boolean(tournament.setupNotified),
      photoDataUrl: tournament.photoDataUrl || null,
      eventDate: normalizeBirthDate(tournament.eventDate) || "",
      timeControl: normalizeTimeControl(tournament.timeControl),
      chiefJudge: normalizeChiefJudge(tournament.chiefJudge),
      ratingDeltas: normalizeTournamentRatingDeltas(tournament.ratingDeltas),
    },
  };
}

function hasMeaningfulTournamentData(tournament) {
  if (!tournament || tournament.status === "archived_view") {
    return false;
  }

  return Boolean(
    tournament.players.length ||
      tournament.rounds.length ||
      tournament.currentRound > 0 ||
      tournament.name ||
      tournament.eventDate ||
      tournament.timeControl ||
      tournament.chiefJudge ||
      tournament.photoDataUrl
  );
}

function hasMeaningfulAppState(appState) {
  if (!appState) {
    return false;
  }

  return Boolean(
    appState.playerBase.length ||
      appState.clubs.length ||
      appState.coaches.length ||
      appState.tournamentsArchive.length ||
      hasMeaningfulTournamentData(appState.currentTournament)
  );
}

function buildTournamentsForSync(appState) {
  const payloads = [];

  if (hasMeaningfulTournamentData(appState.currentTournament)) {
    payloads.push(buildTournamentApiPayload(appState.currentTournament, "active"));
  }

  for (const archived of appState.tournamentsArchive) {
    payloads.push(buildTournamentApiPayload(archived, "archived"));
  }

  return payloads;
}

async function upsertTournamentPayload(tournamentPayload) {
  if (remoteKnownTournamentIds.has(tournamentPayload.id)) {
    try {
      await apiRequest(`/api/tournaments/${tournamentPayload.id}`, {
        method: "PUT",
        body: tournamentPayload,
        timeoutMs: 14000,
      });
    } catch (error) {
      if (!String(error instanceof Error ? error.message : error).includes("404")) {
        throw error;
      }
      await apiRequest("/api/tournaments", {
        method: "POST",
        body: tournamentPayload,
        timeoutMs: 14000,
      });
    }
    return;
  }

  try {
    await apiRequest("/api/tournaments", {
      method: "POST",
      body: tournamentPayload,
      timeoutMs: 14000,
    });
  } catch (error) {
    await apiRequest(`/api/tournaments/${tournamentPayload.id}`, {
      method: "PUT",
      body: tournamentPayload,
      timeoutMs: 14000,
    });
  }
  remoteKnownTournamentIds.add(tournamentPayload.id);
}

async function syncTournamentToApi(tournament, status) {
  await upsertTournamentPayload(buildTournamentApiPayload(tournament, status));
}

function scheduleRemoteSync(_reason = "state-change") {
  if (persistenceInfo.mode !== "remote") {
    return;
  }

  if (remoteSyncTimerId) {
    window.clearTimeout(remoteSyncTimerId);
  }

  remoteSyncTimerId = window.setTimeout(() => {
    remoteSyncTimerId = null;
    void flushRemoteSync();
  }, REMOTE_SYNC_DEBOUNCE_MS);
}

function flushRemoteSyncNow(_reason = "manual-sync") {
  if (persistenceInfo.mode !== "remote") {
    return Promise.resolve();
  }
  if (remoteSyncTimerId) {
    window.clearTimeout(remoteSyncTimerId);
    remoteSyncTimerId = null;
  }
  return flushRemoteSync().then(() => waitForRemoteSyncIdle());
}

function waitForRemoteSyncIdle(timeoutMs = 20000) {
  if (persistenceInfo.mode !== "remote") {
    return Promise.resolve();
  }

  const startedAt = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      const timedOut = Date.now() - startedAt >= timeoutMs;
      const idle = !remoteSyncInFlight && !remoteSyncQueued && !remoteSyncTimerId;
      if (idle || timedOut) {
        resolve();
        return;
      }
      window.setTimeout(tick, 120);
    };
    tick();
  });
}

async function flushRemoteSync() {
  if (persistenceInfo.mode !== "remote") {
    return;
  }

  if (remoteSyncInFlight) {
    remoteSyncQueued = true;
    return;
  }

  remoteSyncInFlight = true;
  setPersistenceInfo({
    mode: "remote",
    status: "syncing",
    message: "Синхронізую зміни з PostgreSQL...",
  });
  render();

  try {
    const snapshot = prepareStateForPersistence(state);
    await syncRemoteSnapshot(snapshot);

    setPersistenceInfo({
      mode: "remote",
      status: "ready",
      message: `Синхронізовано з PostgreSQL о ${formatSyncTime(new Date().toISOString())}.`,
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[flushRemoteSync]", error);
    setPersistenceInfo({
      mode: "remote",
      status: "error",
      message: `Помилка синхронізації з Render API: ${String(error?.message || "невідома помилка")}. Локальна копія в браузері збережена.`,
    });
  } finally {
    remoteSyncInFlight = false;
    render();
  }

  if (remoteSyncQueued) {
    remoteSyncQueued = false;
    void flushRemoteSync();
  }
}

async function syncRemoteSnapshot(appState) {
  const desiredClubs = appState.clubs.map(buildClubApiPayload);
  const desiredClubIds = new Set(desiredClubs.map((item) => item.id));

  for (const clubPayload of desiredClubs) {
    if (remoteKnownClubIds.has(clubPayload.id)) {
      await apiRequest(`/api/clubs/${clubPayload.id}`, {
        method: "PUT",
        body: clubPayload,
        timeoutMs: 12000,
      });
    } else {
      await apiRequest("/api/clubs", {
        method: "POST",
        body: clubPayload,
        timeoutMs: 12000,
      });
      remoteKnownClubIds.add(clubPayload.id);
    }
  }

  const desiredCoaches = appState.coaches.map(buildCoachApiPayload);
  const desiredCoachIds = new Set(desiredCoaches.map((item) => item.id));

  for (const coachPayload of desiredCoaches) {
    if (remoteKnownCoachIds.has(coachPayload.id)) {
      await apiRequest(`/api/coaches/${coachPayload.id}`, {
        method: "PUT",
        body: coachPayload,
        timeoutMs: 12000,
      });
    } else {
      await apiRequest("/api/coaches", {
        method: "POST",
        body: coachPayload,
        timeoutMs: 12000,
      });
      remoteKnownCoachIds.add(coachPayload.id);
    }
  }

  const desiredPlayers = appState.playerBase.map(buildBasePlayerApiPayload);
  const desiredPlayerIds = new Set(desiredPlayers.map((item) => item.id));

  for (const playerPayload of desiredPlayers) {
    if (remoteKnownPlayerIds.has(playerPayload.id)) {
      await apiRequest(`/api/players/${playerPayload.id}`, {
        method: "PUT",
        body: playerPayload,
        timeoutMs: 12000,
      });
    } else {
      await apiRequest("/api/players", {
        method: "POST",
        body: playerPayload,
        timeoutMs: 12000,
      });
      remoteKnownPlayerIds.add(playerPayload.id);
    }
  }

  for (const playerId of [...remoteKnownPlayerIds]) {
    if (desiredPlayerIds.has(playerId)) {
      continue;
    }
    await apiRequest(`/api/players/${playerId}`, { method: "DELETE", timeoutMs: 12000 });
    remoteKnownPlayerIds.delete(playerId);
  }

  for (const coachId of [...remoteKnownCoachIds]) {
    if (desiredCoachIds.has(coachId)) {
      continue;
    }
    await apiRequest(`/api/coaches/${coachId}`, { method: "DELETE", timeoutMs: 12000 });
    remoteKnownCoachIds.delete(coachId);
  }

  for (const clubId of [...remoteKnownClubIds]) {
    if (desiredClubIds.has(clubId)) {
      continue;
    }
    await apiRequest(`/api/clubs/${clubId}`, { method: "DELETE", timeoutMs: 12000 });
    remoteKnownClubIds.delete(clubId);
  }

  const desiredTournaments = buildTournamentsForSync(appState);
  const desiredTournamentIds = new Set(desiredTournaments.map((item) => item.id));

  for (const tournamentPayload of desiredTournaments) {
    await upsertTournamentPayload(tournamentPayload);
  }

  for (const tournamentId of [...remoteKnownTournamentIds]) {
    if (desiredTournamentIds.has(tournamentId)) {
      continue;
    }
    await apiRequest(`/api/tournaments/${tournamentId}`, { method: "DELETE", timeoutMs: 14000 });
    remoteKnownTournamentIds.delete(tournamentId);
  }
}

function formatSyncTime(iso) {
  try {
    return new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(iso));
  } catch {
    return iso;
  }
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
  const finishedAt = new Date().toISOString();
  snapshot.status = "archived";
  snapshot.finishedAt = finishedAt;
  snapshot.updatedAt = finishedAt;
  snapshot.ratingDeltas = [];

  const idx = state.tournamentsArchive.findIndex((x) => x.id === snapshot.id);
  if (idx >= 0) {
    rollbackTournamentRatingDeltas(state.tournamentsArchive[idx], state.playerBase);
  }

  applyInternalRatingToTournamentSnapshot(snapshot, state.playerBase);

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
  return snapshot;
}

async function finishCurrentTournament() {
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

  if (!validateManualPlacesForTiedScores(t)) {
    const shouldAutoResolve = confirm(
      "Для гравців з однаковими очками не вистачає підсумкових місць.\n\nЗастосувати авто-місця системи та завершити турнір?"
    );
    if (!shouldAutoResolve) {
      return;
    }
    applyAutoPlacesForTiedScores(t);
    if (!validateManualPlacesForTiedScores(t)) {
      return;
    }
  }

  const archivedSnapshot = archiveCurrentTournament({ notify: false });
  if (!archivedSnapshot) {
    return;
  }

  if (persistenceInfo.mode === "remote") {
    try {
      await syncTournamentToApi(archivedSnapshot, "archived");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[finishCurrentTournament]", error);
      setPersistenceInfo({
        mode: "remote",
        status: "error",
        message: `Не вдалося записати завершення турніру в PostgreSQL: ${message}`,
        lastSyncAt: new Date().toISOString(),
      });
      render();
      alert(`Не вдалося записати завершення турніру в PostgreSQL.\n\n${message}\n\nСпробуйте натиснути "Завершити турнір" ще раз.`);
      return;
    }
  }

  state.currentTournament = createDefaultTournament();
  tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
  state.activeTab = "tournament";
  state.tournamentView = "setup";
  state.archivePreviewTournamentId = null;
  saveAndRender();
  await flushRemoteSyncNow("finish-tournament");
  alert("Турнір завершено і перенесено в архів.");
}

async function emergencyFinishCurrentTournament() {
  const t = state.currentTournament;
  if (!t || t.status === "archived_view") {
    return;
  }

  const title = (t.name || "турнір").trim();
  const confirmed = confirm(
    `Екстрено завершити "${title}" без архівування?\n\nУВАГА: дані поточного турніру буде скинуто, в архів цей турнір не потрапить.`
  );
  if (!confirmed) {
    return;
  }

  state.currentTournament = createDefaultTournament();
  tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
  state.activeTab = "tournament";
  state.tournamentView = "setup";
  state.archivePreviewTournamentId = null;
  manualRoundBuilderOpen = false;
  saveAndRender();
  await flushRemoteSyncNow("emergency-finish-tournament");
  alert("Турнір екстрено завершено без архівування.");
}

function applyAutoPlacesForTiedScores(tournament) {
  if (!tournament || tournament.status !== "active") {
    return;
  }

  const standings = getStandings(tournament);
  if (!standings.length) {
    return;
  }

  const primaryMetric = tournament.isMicromatch && tournament.scoreCalculationType === "small_points" ? "smallPoints" : "score";
  let changed = false;
  let cursor = 1;
  let idx = 0;

  while (idx < standings.length) {
    const key = Number(standings[idx][primaryMetric] || 0).toFixed(4);
    let end = idx + 1;
    while (end < standings.length && Number(standings[end][primaryMetric] || 0).toFixed(4) === key) {
      end += 1;
    }

    const groupSize = end - idx;
    if (groupSize > 1) {
      for (let i = idx; i < end; i += 1) {
        const player = tournament.players.find((p) => p.id === standings[i].id);
        const place = cursor + (i - idx);
        if (player && player.manualPlace !== place) {
          player.manualPlace = place;
          changed = true;
        }
      }
    }

    cursor += groupSize;
    idx = end;
  }

  if (!changed) {
    alert("Авто-місця вже підтверджені.");
    return;
  }

  tournament.updatedAt = new Date().toISOString();
  saveAndRender();
  alert("Система підтвердила авто-місця для груп з однаковими очками.");
}

function validateManualPlacesForTiedScores(tournament) {
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
  for (const scoreKey of scoreKeys) {
    const group = grouped.get(scoreKey) || [];
    const start = cursor;
    const end = cursor + group.length - 1;
    cursor = end + 1;

    if (group.length <= 1) {
      continue;
    }

    const unresolved = group.filter((player) => !Number.isInteger(player.manualPlace));
    if (unresolved.length > 0) {
      alert(
        `Для гравців з ${Number(scoreKey).toFixed(1)} очк. потрібно вручну виставити місця ${start}-${end} у вкладці "Таблиця".`
      );
      return false;
    }

    const outOfRange = group.filter((player) => player.manualPlace < start || player.manualPlace > end);
    if (outOfRange.length > 0) {
      alert(`Ручні місця для групи ${Number(scoreKey).toFixed(1)} очк. мають бути тільки в межах ${start}-${end}.`);
      return false;
    }

    const used = new Set();
    for (const player of group) {
      if (used.has(player.manualPlace)) {
        alert(`У групі ${Number(scoreKey).toFixed(1)} очк. місця ${start}-${end} не повинні повторюватись.`);
        return false;
      }
      used.add(player.manualPlace);
    }
  }

  return true;
}

function applyTournamentResultsToPlayerBase(tournamentSnapshot) {
  mergeTournamentResultsIntoPlayerBase(state.playerBase, tournamentSnapshot);
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

function applyInternalRatingToTournamentSnapshot(tournamentSnapshot, basePlayers) {
  const ratingDeltas = [];

  for (const tournamentPlayer of tournamentSnapshot.players || []) {
    const base = findOrCreateBasePlayerForTournamentPlayer(basePlayers, tournamentPlayer);
    const startRating = Math.max(0, Math.round(Number(tournamentPlayer.rating) || Number(base.rating) || 0));
    const perf = collectRatedPerformanceForPlayer(tournamentSnapshot, tournamentPlayer);
    const expectedPercent = resolveExpectedPercentByRatings(startRating, perf.averageOpponentRating);
    const expectedPoints = perf.gamesRated * expectedPercent;
    const rawDelta = INTERNAL_RATING_K * (perf.pointsRated / 2 - expectedPoints);
    const ratingDelta = Math.round(Math.max(-INTERNAL_RATING_DELTA_CAP, Math.min(INTERNAL_RATING_DELTA_CAP, rawDelta)));
    const ratingAfter = Math.max(0, startRating + ratingDelta);

    base.rating = ratingAfter;
    ratingDeltas.push({
      playerId: normalizeEntityId(tournamentPlayer.id),
      basePlayerId: normalizeEntityId(base.id),
      ratingBefore: startRating,
      ratingDelta,
      ratingAfter,
      gamesRated: perf.gamesRated,
      pointsRated: perf.pointsRated,
      expectedPoints: Number(expectedPoints.toFixed(2)),
      expectedPercent: Number((expectedPercent * 100).toFixed(2)),
      averageOpponentRating: Math.round(perf.averageOpponentRating),
    });
  }

  tournamentSnapshot.ratingDeltas = ratingDeltas;
}

function rollbackTournamentRatingDeltas(tournamentSnapshot, basePlayers) {
  const deltas = normalizeTournamentRatingDeltas(tournamentSnapshot?.ratingDeltas);
  if (!deltas.length) {
    return;
  }

  for (const delta of deltas) {
    const base = basePlayers.find((item) => item.id === delta.basePlayerId);
    if (!base) {
      continue;
    }
    base.rating = Math.max(0, Math.round(Number(delta.ratingBefore) || 0));
  }
}

function collectRatedPerformanceForPlayer(tournamentSnapshot, tournamentPlayer) {
  let gamesRated = 0;
  let pointsRated = 0;
  let opponentsRatingSum = 0;

  for (const round of tournamentSnapshot.rounds || []) {
    const game = (round.pairings || []).find((pair) => pair.whiteId === tournamentPlayer.id || pair.blackId === tournamentPlayer.id);
    if (!game || !game.blackId) {
      continue;
    }

    const result = String(tournamentPlayer.resultsByRound?.[round.round] || "");
    if (result !== "W" && result !== "D" && result !== "L") {
      continue;
    }

    const oppId = game.whiteId === tournamentPlayer.id ? game.blackId : game.whiteId;
    const opp = tournamentSnapshot.players.find((item) => item.id === oppId);
    const oppRating = Math.max(0, Math.round(Number(opp?.rating) || 0));

    gamesRated += 1;
    opponentsRatingSum += oppRating;
    if (result === "W") {
      pointsRated += 2;
    } else if (result === "D") {
      pointsRated += 1;
    }
  }

  const fallbackRating = Math.max(0, Math.round(Number(tournamentPlayer.rating) || 0));
  const averageOpponentRating = gamesRated > 0 ? opponentsRatingSum / gamesRated : fallbackRating;

  return {
    gamesRated,
    pointsRated,
    averageOpponentRating,
  };
}

function resolveExpectedPercentByRatings(playerRating, averageOpponentRating) {
  const player = Math.max(0, Math.round(Number(playerRating) || 0));
  const opponentsAverage = Math.max(0, Math.round(Number(averageOpponentRating) || 0));
  const diff = Math.abs(player - opponentsAverage);
  const isBetterThanAverage = player >= opponentsAverage;
  const range = INTERNAL_RATING_EXPECTED_TABLE.find((item) => diff >= item.min && diff <= item.max);
  const betterPercent = range ? Number(range.betterPercent) || 50 : 50;
  const percent = isBetterThanAverage ? betterPercent : 100 - betterPercent;
  return percent / 100;
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

function recalcBaseStatsForList(basePlayers) {
  for (const base of basePlayers) {
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

function recalcAllBaseStats() {
  recalcBaseStatsForList(state.playerBase);
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
  manualRoundBuilderOpen = false;
  saveAndRender();
}

function deleteArchivedTournament(tournamentId) {
  if (!confirm("Видалити турнір з архіву?")) {
    return;
  }

  const target = state.tournamentsArchive.find((t) => t.id === tournamentId) || null;
  if (target) {
    rollbackTournamentRatingDeltas(target, state.playerBase);
  }

  state.tournamentsArchive = state.tournamentsArchive.filter((t) => t.id !== tournamentId);
  if (state.archivePreviewTournamentId === tournamentId) {
    state.archivePreviewTournamentId = null;
  }

  rebuildPlayerBaseHistoryForState(state);
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
  manualRoundBuilderOpen = false;
  state.activeTab = "tournament";
  state.tournamentView = "setup";
  state.archivePreviewTournamentId = null;
  selectedBasePlayerIds.clear();
  if (els.dbPlayerSelect) {
    els.dbPlayerSelect.value = "";
  }
  if (els.tournamentClubFilter) {
    els.tournamentClubFilter.value = "all";
  }
  saveAndRender();
}

function cloneTournament(tournament) {
  if (typeof structuredClone === "function") {
    return structuredClone(tournament);
  }

  return JSON.parse(JSON.stringify(tournament));
}

function saveAndRender() {
  stateRevision += 1;
  persistLocalState();
  render();
  renderAuthPanel();
  scheduleRemoteSync("state-change");
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

// ===== 09-init.js =====
const initialRawState = loadRawState();
hasStoredLocalState = Boolean(initialRawState);
state = normalizeState(initialRawState);
recalcAllBaseStats();
normalizeRoundsCountForCurrentFormat(state.currentTournament);
tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);

bindEvents();
render();
void bootstrapPersistence();
