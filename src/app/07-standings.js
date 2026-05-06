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

