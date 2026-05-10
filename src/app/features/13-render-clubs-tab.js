function renderClubsTab() {
  renderCoachClubSelector();
  if (!els.clubsList || !els.clubProfile) {
    return;
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
    els.clubsList.innerHTML = '<div class="club-card">Клубів поки немає. Натисніть "Додати клуб".</div>';
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
            <button type="button" data-action="edit-club" data-club-id="${club.id}">Редагувати</button>
            <button type="button" class="danger" data-action="delete-club" data-club-id="${club.id}">Видалити</button>
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
