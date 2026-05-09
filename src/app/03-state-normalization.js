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
