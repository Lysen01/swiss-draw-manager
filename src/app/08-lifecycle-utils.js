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

    const preferLocalState = shouldPreferLocalStateOverRemote(state, tournamentRows);

    if (!remoteHasData && localHasData && hasStoredLocalState) {
      setPersistenceInfo({
        mode: "remote",
        status: "ready",
        message: "Render база порожня. Переношу в неї поточні локальні дані.",
        lastSyncedAt: "",
      });
      scheduleRemoteSync("bootstrap-seed");
    } else if (preferLocalState) {
      setPersistenceInfo({
        mode: "remote",
        status: "ready",
        message: "Знайдено новіші локальні зміни. Синхронізую їх у Render...",
        lastSyncedAt: "",
      });
      scheduleRemoteSync("bootstrap-local-newer");
    } else if (stateRevision === remoteBootstrapRevision) {
      state = buildStateFromApi(clubRows, coachRows, playersRows, tournamentRows);
      tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
      persistLocalState({ notifyOnError: false });
    } else {
      scheduleRemoteSync("bootstrap-catchup");
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
    birthDate: row.birth_date,
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
  return {
    id: row.id,
    name: row.name || payload.name || "Турнір",
    format: row.format === "round_robin" ? "round_robin" : "swiss",
    isMicromatch: Boolean(payload.isMicromatch),
    scoreCalculationType: payload.scoreCalculationType === "small_points" ? "small_points" : "big_points",
    eventDate: row.event_date || payload.eventDate || "",
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
      players: Array.isArray(tournament.players) ? tournament.players : [],
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
    return;
  }
  if (remoteSyncTimerId) {
    window.clearTimeout(remoteSyncTimerId);
    remoteSyncTimerId = null;
  }
  void flushRemoteSync();
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
      message: "Помилка синхронізації з Render API. Локальна копія в браузері збережена.",
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
        timeoutMs: 6000,
      });
    } else {
      await apiRequest("/api/clubs", {
        method: "POST",
        body: clubPayload,
        timeoutMs: 6000,
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
        timeoutMs: 6000,
      });
    } else {
      await apiRequest("/api/coaches", {
        method: "POST",
        body: coachPayload,
        timeoutMs: 6000,
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
        timeoutMs: 6000,
      });
    } else {
      await apiRequest("/api/players", {
        method: "POST",
        body: playerPayload,
        timeoutMs: 6000,
      });
      remoteKnownPlayerIds.add(playerPayload.id);
    }
  }

  for (const playerId of [...remoteKnownPlayerIds]) {
    if (desiredPlayerIds.has(playerId)) {
      continue;
    }
    await apiRequest(`/api/players/${playerId}`, { method: "DELETE", timeoutMs: 6000 });
    remoteKnownPlayerIds.delete(playerId);
  }

  for (const coachId of [...remoteKnownCoachIds]) {
    if (desiredCoachIds.has(coachId)) {
      continue;
    }
    await apiRequest(`/api/coaches/${coachId}`, { method: "DELETE", timeoutMs: 6000 });
    remoteKnownCoachIds.delete(coachId);
  }

  for (const clubId of [...remoteKnownClubIds]) {
    if (desiredClubIds.has(clubId)) {
      continue;
    }
    await apiRequest(`/api/clubs/${clubId}`, { method: "DELETE", timeoutMs: 6000 });
    remoteKnownClubIds.delete(clubId);
  }

  const desiredTournaments = buildTournamentsForSync(appState);
  const desiredTournamentIds = new Set(desiredTournaments.map((item) => item.id));

  for (const tournamentPayload of desiredTournaments) {
    if (remoteKnownTournamentIds.has(tournamentPayload.id)) {
      await apiRequest(`/api/tournaments/${tournamentPayload.id}`, {
        method: "PUT",
        body: tournamentPayload,
        timeoutMs: 8000,
      });
    } else {
      await apiRequest("/api/tournaments", {
        method: "POST",
        body: tournamentPayload,
        timeoutMs: 8000,
      });
      remoteKnownTournamentIds.add(tournamentPayload.id);
    }
  }

  for (const tournamentId of [...remoteKnownTournamentIds]) {
    if (desiredTournamentIds.has(tournamentId)) {
      continue;
    }
    await apiRequest(`/api/tournaments/${tournamentId}`, { method: "DELETE", timeoutMs: 8000 });
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
  snapshot.status = "archived";
  snapshot.finishedAt = new Date().toISOString();
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

  if (!validateManualPlacesForTiedScores(t)) {
    return;
  }

  archiveCurrentTournament({ notify: false });
  state.currentTournament = createDefaultTournament();
  tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
  state.activeTab = "tournament";
  state.tournamentView = "setup";
  state.archivePreviewTournamentId = null;
  saveAndRender();
  flushRemoteSyncNow("finish-tournament");
  alert("Турнір завершено і перенесено в архів.");
}

function emergencyFinishCurrentTournament() {
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
