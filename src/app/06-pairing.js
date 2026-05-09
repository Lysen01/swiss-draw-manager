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
    pairings.push({ board, whiteId, blackId, result: "pending" });
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
    byePlayer.score += 1;
    byePlayer.resultsByRound[nextRoundNumber] = "BYE";
    pairings.push({ board: pairings.length + 1, whiteId: byePlayer.id, blackId: null, result: "1-0 BYE" });
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
