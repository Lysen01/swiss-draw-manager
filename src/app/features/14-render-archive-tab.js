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
