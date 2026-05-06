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
