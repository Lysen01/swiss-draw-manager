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
