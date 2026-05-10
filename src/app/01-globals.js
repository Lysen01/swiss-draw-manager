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
