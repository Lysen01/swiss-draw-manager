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
            <button class="icon-btn" type="button" title="Історія" aria-label="Історія" data-action="view-base-history" data-player-id="${p.id}">⏱</button>
            <button class="icon-btn" type="button" title="Додати в турнір" aria-label="Додати в турнір" data-action="add-to-tournament" data-player-id="${p.id}">＋</button>
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
