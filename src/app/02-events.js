function bindEvents() {
  const adminOnlyActions = new Set([
    "edit-club",
    "delete-club",
    "open-club-manage",
    "toggle-club-player-add",
    "toggle-club-coach-add",
    "add-to-tournament",
    "edit-club-coach",
    "edit-club-player",
    "remove-player-from-club",
    "delete-base-player",
    "edit-base-player",
    "remove-tour-player",
    "edit-tour-player",
    "delete-archive",
    "confirm-auto-places",
    "finish-tournament-from-table",
    "emergency-finish-tournament",
  ]);

  const blockIfViewerAction = (action) => {
    if (!adminOnlyActions.has(String(action || ""))) {
      return false;
    }
    if (canManageAdminUi()) {
      return false;
    }
    alert("Режим перегляду: ця дія доступна тільки адміністратору.");
    return true;
  };

  if (els.authForm) {
    els.authForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = String(els.authEmail?.value || "").trim();
      const password = String(els.authPassword?.value || "");
      if (!email || !password) {
        alert("Введіть email і пароль.");
        return;
      }
      try {
        if (els.authLoginBtn) {
          els.authLoginBtn.disabled = true;
        }
        await loginAsAdmin(email, password);
        if (els.authPassword) {
          els.authPassword.value = "";
        }
        remoteBootstrapStarted = false;
        await bootstrapPersistence();
        saveAndRender();
      } catch (error) {
        alert(`Помилка входу: ${String(error.message || error)}`);
      } finally {
        if (els.authLoginBtn) {
          els.authLoginBtn.disabled = false;
        }
      }
    });
  }

  if (els.authLogoutBtn) {
    els.authLogoutBtn.addEventListener("click", async () => {
      await logoutAdmin();
      remoteBootstrapStarted = false;
      await bootstrapPersistence();
      saveAndRender();
    });
  }

  const tieBreakSelects = [els.tieBreak1, els.tieBreak2, els.tieBreak3, els.tieBreak4, els.tieBreak5];
  for (const select of tieBreakSelects) {
    select.addEventListener("change", () => {
      ensureTournamentSettingsDraftForCurrentTournament();
      tournamentSettingsDraft.tieBreakOrder = collectTieBreakOrderFromForm();
      renderTieBreakSelectors(tournamentSettingsDraft.tieBreakOrder);
    });
  }

  els.tabsNav.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-tab]");
    if (!btn) {
      return;
    }

    captureTournamentSettingsDraftFromForm();
    const nextTab = String(btn.dataset.tab || "").trim();
    if (nextTab && nextTab !== "clubs") {
      selectedClubPlayerProfileId = null;
      selectedClubPlayerProfileTab = "info";
      selectedClubDetailTab = "profile";
      selectedClubsView = "directory";
      showClubPlayerAddForms = false;
      showClubCoachAddForm = false;
    }
    if (nextTab && nextTab !== "players") {
      selectedBasePlayerProfileId = null;
      selectedBasePlayerProfileTab = "ranking";
      showBasePlayerAddForm = false;
    }
    state.activeTab = nextTab || state.activeTab;
    if (!canManageAdminUi() && state.activeTab === "tournament") {
      state.activeTab = "archive";
    }
    saveAndRender();
  });

  els.tournamentSubtabs.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-tournament-view]");
    if (!btn) {
      return;
    }

    captureTournamentSettingsDraftFromForm();
    const nextView = btn.dataset.tournamentView;
    state.tournamentView = nextView === "rounds" || nextView === "table" ? nextView : "setup";
    saveAndRender();
  });

  els.settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canManageAdminUi()) {
      alert("Режим перегляду: редагування налаштувань турніру доступне лише адміністратору.");
      return;
    }
    captureTournamentSettingsDraftFromForm();
    const t = state.currentTournament;
    ensureTournamentSettingsDraftForCurrentTournament();
    const draft = tournamentSettingsDraft;
    const isArchivePreview = t.status === "archived_view";
    const nextFormat = draft.format;
    const manualRounds = Number(draft.roundsCount);
    const requiredRoundRobinRounds = getMaxRoundsByFormat("round_robin", t.players.length);
    const nextRounds = nextFormat === "round_robin" ? requiredRoundRobinRounds : manualRounds;
    const nextEventDate = normalizeBirthDate(draft.eventDate);
    const nextTimeControl = normalizeTimeControl(draft.timeControl);
    const nextChiefJudge = normalizeChiefJudge(draft.chiefJudge);

    if (!String(draft.name || "").trim()) {
      alert("Назва турніру обов'язкова.");
      els.tournamentName?.focus();
      return;
    }

    if (!nextEventDate) {
      alert("Дата проведення обов'язкова.");
      els.tournamentDate?.focus();
      return;
    }

    if (!nextTimeControl) {
      alert("Контроль часу обов'язковий.");
      els.tournamentTimeControl?.focus();
      return;
    }

    if (!nextChiefJudge) {
      alert("Головний суддя обов'язковий.");
      els.tournamentChiefJudge?.focus();
      return;
    }

    if (isArchivePreview) {
      t.name = draft.name || "Турнір";
      t.eventDate = nextEventDate;
      t.timeControl = nextTimeControl;
      t.chiefJudge = nextChiefJudge;
      t.updatedAt = new Date().toISOString();

      const archivedIdx = state.tournamentsArchive.findIndex((item) => item.id === t.id);
      if (archivedIdx >= 0) {
        const archivedSnapshot = cloneTournament(state.tournamentsArchive[archivedIdx]);
        archivedSnapshot.name = t.name;
        archivedSnapshot.eventDate = t.eventDate;
        archivedSnapshot.timeControl = t.timeControl;
        archivedSnapshot.chiefJudge = t.chiefJudge;
        archivedSnapshot.updatedAt = t.updatedAt;
        state.tournamentsArchive[archivedIdx] = normalizeArchivedTournament(archivedSnapshot);
      }

      tournamentSettingsDraft = createTournamentSettingsDraft(t);
      saveAndRender();
      await flushRemoteSyncNow("archive-tournament-settings-save");
      return;
    }

    if (nextRounds < t.currentRound) {
      alert(`Не можна встановити менше турів, ніж уже зіграно (${t.currentRound}).`);
      return;
    }

    if (nextFormat !== t.format && t.currentRound > 0) {
      alert("Після старту турніру не можна змінити формат.");
      return;
    }

    if (Boolean(draft.isMicromatch) !== Boolean(t.isMicromatch) && t.currentRound > 0) {
      alert("Після старту турніру не можна змінити режим мікроматчів.");
      return;
    }

    if (nextFormat === "swiss") {
      const maxRounds = getMaxRoundsByFormat(nextFormat, t.players.length);
      if (maxRounds > 0 && nextRounds > maxRounds) {
        alert(`Для швейцарської системи максимум ${maxRounds} турів.`);
        return;
      }
      if (nextRounds < 1) {
        alert("Для швейцарської системи має бути щонайменше 1 тур.");
        return;
      }
    }

    const wasConfiguredBefore =
      Boolean(String(t.name || "").trim()) &&
      Boolean(normalizeBirthDate(t.eventDate)) &&
      Boolean(normalizeTimeControl(t.timeControl)) &&
      Boolean(normalizeChiefJudge(t.chiefJudge)) &&
      Number(t.players?.length || 0) > 0;

    t.name = draft.name || "Турнір";
    t.roundsCount = nextRounds;
    t.format = nextFormat;
    t.isMicromatch = Boolean(draft.isMicromatch);
    t.scoreCalculationType = t.isMicromatch && draft.scoreCalculationType === "small_points" ? "small_points" : "big_points";
    t.eventDate = nextEventDate;
    t.timeControl = nextTimeControl;
    t.chiefJudge = nextChiefJudge;
    t.setupNotified = Boolean(t.setupNotified);
    t.tieBreakOrder = normalizeTieBreakOrder(draft.tieBreakOrder, { fillDefaults: false });

    let nextPhotoDataUrl = draft.pendingPhotoDataUrl;
    const selectedPhotoFile = els.tournamentPhoto.files?.[0] || null;
    if (!nextPhotoDataUrl && selectedPhotoFile) {
      if (!isValidTournamentPhotoFile(selectedPhotoFile)) {
        return;
      }
      nextPhotoDataUrl = await readTournamentPhotoDataUrl(selectedPhotoFile);
    }

    if (nextPhotoDataUrl) {
      t.photoDataUrl = nextPhotoDataUrl;
    } else if (draft.removePhoto) {
      t.photoDataUrl = null;
    }

    normalizeRoundsCountForCurrentFormat(t);
    t.updatedAt = new Date().toISOString();

    const configuredNow =
      Boolean(String(t.name || "").trim()) &&
      Boolean(t.eventDate) &&
      Boolean(t.timeControl) &&
      Boolean(t.chiefJudge) &&
      Number(t.players?.length || 0) > 0;
    if (!isArchivePreview && !wasConfiguredBefore && configuredNow && !t.setupNotified) {
      t.setupNotified = true;
      alert("Турнір створено. Перейдіть у вкладку «Раунди» та проведіть його.");
    }

    tournamentSettingsDraft = createTournamentSettingsDraft(t);
    saveAndRender();
    await flushRemoteSyncNow("tournament-settings-save");
  });

  if (els.archiveSettingsCancelBtn) {
    els.archiveSettingsCancelBtn.addEventListener("click", () => {
      const t = state.currentTournament;
      if (!t || t.status !== "archived_view" || !canManageAdminUi()) {
        return;
      }

      const archived = state.tournamentsArchive.find((item) => item.id === t.id);
      if (archived) {
        state.currentTournament = cloneTournament(archived);
        state.currentTournament.status = "archived_view";
      }
      tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
      render();
    });
  }

  els.tournamentName.addEventListener("input", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    tournamentSettingsDraft.name = els.tournamentName.value.trim();
  });

  els.roundsCount.addEventListener("input", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    tournamentSettingsDraft.roundsCount = Number(els.roundsCount.value) || 1;
  });

  const syncTournamentDateDraft = () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    const raw = String(els.tournamentDate.value || "").trim();
    tournamentSettingsDraft.eventDate = normalizeBirthDate(raw);
    if (tournamentSettingsDraft.eventDate && state.currentTournament?.status !== "archived_view") {
      state.currentTournament.eventDate = tournamentSettingsDraft.eventDate;
    }
  };
  els.tournamentDate.addEventListener("input", syncTournamentDateDraft);
  els.tournamentDate.addEventListener("change", syncTournamentDateDraft);

  els.tournamentTimeControl.addEventListener("input", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    tournamentSettingsDraft.timeControl = normalizeTimeControl(els.tournamentTimeControl.value);
  });

  els.tournamentChiefJudge.addEventListener("input", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    tournamentSettingsDraft.chiefJudge = normalizeChiefJudge(els.tournamentChiefJudge.value);
  });

  if (els.tournamentIsMicromatch) {
    els.tournamentIsMicromatch.addEventListener("change", () => {
      ensureTournamentSettingsDraftForCurrentTournament();
      tournamentSettingsDraft.isMicromatch = Boolean(els.tournamentIsMicromatch.checked);
      if (!tournamentSettingsDraft.isMicromatch) {
        tournamentSettingsDraft.scoreCalculationType = "big_points";
      }
      renderScoreCalculationControls();
    });
  }

  if (els.scoreCalculationType) {
    els.scoreCalculationType.addEventListener("change", () => {
      ensureTournamentSettingsDraftForCurrentTournament();
      tournamentSettingsDraft.scoreCalculationType = els.scoreCalculationType.value === "small_points" ? "small_points" : "big_points";
    });
  }

  els.tournamentRemovePhoto.addEventListener("change", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    tournamentSettingsDraft.removePhoto = els.tournamentRemovePhoto.checked;
    if (tournamentSettingsDraft.removePhoto) {
      tournamentSettingsDraft.pendingPhotoDataUrl = null;
    }
  });

  els.tournamentPhoto.addEventListener("change", async () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    const photoFile = els.tournamentPhoto.files?.[0] || null;
    if (!photoFile) {
      tournamentSettingsDraft.pendingPhotoDataUrl = null;
      return;
    }
    if (!isValidTournamentPhotoFile(photoFile)) {
      els.tournamentPhoto.value = "";
      tournamentSettingsDraft.pendingPhotoDataUrl = null;
      return;
    }
    tournamentSettingsDraft.pendingPhotoDataUrl = await readTournamentPhotoDataUrl(photoFile);
    tournamentSettingsDraft.removePhoto = false;
    els.tournamentRemovePhoto.checked = false;
  });

  els.tournamentFormat.addEventListener("change", () => {
    ensureTournamentSettingsDraftForCurrentTournament();
    const nextFormat = els.tournamentFormat.value;
    const playersCount = state.currentTournament.players.length;
    const requiredRoundRobinRounds = getMaxRoundsByFormat("round_robin", playersCount);
    tournamentSettingsDraft.format = nextFormat === "round_robin" ? "round_robin" : "swiss";

    if (nextFormat === "round_robin") {
      els.roundsCount.value = requiredRoundRobinRounds;
      tournamentSettingsDraft.roundsCount = requiredRoundRobinRounds;
      els.roundsCount.disabled = true;
      renderRoundsRuleHint();
      return;
    }

    els.roundsCount.disabled = false;
    if (Number(els.roundsCount.value) < 1) {
      els.roundsCount.value = Math.max(1, state.currentTournament.roundsCount || 5);
    }
    tournamentSettingsDraft.roundsCount = Number(els.roundsCount.value) || 1;
    renderRoundsRuleHint();
  });

  els.dbPlayerSelect.addEventListener("input", () => {
    renderBaseSelect();
  });
  if (els.tournamentClubFilter) {
    els.tournamentClubFilter.addEventListener("change", () => {
      selectedBasePlayerIds.clear();
      renderBaseSelect();
    });
  }

  els.selectAllBaseBtn.addEventListener("click", () => {
    selectAllVisibleBasePlayers();
  });

  els.addFromBaseBtn.addEventListener("click", () => {
    captureTournamentSettingsDraftFromForm();
    addSelectedBasePlayersToTournament();
  });

  els.dbPlayerChecklist.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox'][data-base-player-id]");
    if (!checkbox) {
      return;
    }
    const baseId = checkbox.dataset.basePlayerId;
    if (!baseId) {
      return;
    }
    if (checkbox.checked) {
      selectedBasePlayerIds.add(baseId);
    } else {
      selectedBasePlayerIds.delete(baseId);
    }
    els.addFromBaseBtn.disabled = selectedBasePlayerIds.size === 0;
  });

  els.generateRoundBtn.addEventListener("click", () => {
    if (!canManageAdminUi()) {
      alert("Режим перегляду: генерація туру доступна лише адміністратору.");
      return;
    }
    generateNextRound();
  });
  els.manualRoundBtn.addEventListener("click", () => {
    if (!canManageAdminUi()) {
      alert("Режим перегляду: ручне формування туру доступне лише адміністратору.");
      return;
    }
    captureTournamentSettingsDraftFromForm();
    manualRoundBuilderOpen = !manualRoundBuilderOpen;
    render();
  });

  if (els.clubsSubtabs) {
    els.clubsSubtabs.addEventListener("click", (event) => {
      const btn = event.target.closest(".subtab-btn[data-club-view]");
      if (!btn) {
        return;
      }
      const nextView = btn.dataset.clubView;
      if (!nextView) {
        return;
      }
      selectedClubsView = nextView;
      if (nextView !== "profile") {
        selectedClubPlayerProfileId = null;
        selectedClubPlayerProfileTab = "info";
        selectedClubDetailTab = "profile";
      }
      renderClubsTab();
    });
  }
  els.manualPairingPanel.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    if (btn.dataset.action === "create-manual-round") {
      createManualRoundFromForm();
    }

    if (btn.dataset.action === "cancel-manual-round") {
      manualRoundBuilderOpen = false;
      render();
    }
  });
  els.printRoundBtn.addEventListener("click", () => {
    printCurrentRound();
  });

  if (els.seedDemoBtn) {
    els.seedDemoBtn.addEventListener("click", () => {
      captureTournamentSettingsDraftFromForm();
      addDemoPlayers();
    });
  }

  els.finishTournamentBtn.addEventListener("click", () => {
    if (!canManageAdminUi()) {
      alert("Режим перегляду: завершення турніру доступне лише адміністратору.");
      return;
    }
    void finishCurrentTournament();
  });

  if (els.resetBtn) {
    els.resetBtn.addEventListener("click", () => {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: створення нового турніру доступне лише адміністратору.");
        return;
      }
      captureTournamentSettingsDraftFromForm();
      createNewTournamentFlow();
    });
  }

  els.basePlayerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canManageAdminUi()) {
      alert("Режим перегляду: додавання гравців доступне лише адміністратору.");
      return;
    }
    await submitBasePlayerForm();
  });

  if (els.openBasePlayerFormBtn) {
    els.openBasePlayerFormBtn.addEventListener("click", () => {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: додавання гравців доступне лише адміністратору.");
        return;
      }
      if (showBasePlayerAddForm) {
        resetBasePlayerForm({ keepOpen: false });
        return;
      }
      showBasePlayerAddForm = true;
      syncBasePlayerFormVisibility();
      if (!editingBasePlayerId) {
        els.basePlayerLastName?.focus();
      }
    });
  }

  els.basePlayerCancelEditBtn.addEventListener("click", () => {
    resetBasePlayerForm({ keepOpen: true });
  });

  els.basePlayerClub.addEventListener("change", () => {
    renderBasePlayerOwnershipSelectors(null);
  });

  for (const control of [
    els.basePlayersSearch,
    els.basePlayersGenderFilter,
    els.basePlayersRatingFrom,
    els.basePlayersRatingTo,
    els.basePlayersClubFilter,
  ]) {
    control.addEventListener("input", () => {
      renderBasePlayersTab();
    });
    control.addEventListener("change", () => {
      renderBasePlayersTab();
    });
  }

  els.basePlayersClearFilters.addEventListener("click", () => {
    els.basePlayersSearch.value = "";
    els.basePlayersGenderFilter.value = "all";
    els.basePlayersRatingFrom.value = "";
    els.basePlayersRatingTo.value = "";
    els.basePlayersClubFilter.value = "all";
    renderBasePlayersTab();
  });

  els.clubForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canManageAdminUi()) {
      alert("Режим перегляду: редагування клубів доступне лише адміністратору.");
      return;
    }
    await submitClubForm();
  });

  els.clubCancelEditBtn.addEventListener("click", () => {
    resetClubForm();
  });

  els.coachForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canManageAdminUi()) {
      alert("Режим перегляду: редагування тренерів доступне лише адміністратору.");
      return;
    }
    await submitCoachForm();
  });

  els.coachCancelEditBtn.addEventListener("click", () => {
    resetCoachForm();
  });

  if (els.openAddClubBtn) {
    els.openAddClubBtn.addEventListener("click", () => {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: редагування клубів доступне лише адміністратору.");
        return;
      }
      resetClubForm();
      resetCoachForm();
      selectedClubsView = "manage";
      selectedClubDetailTab = "profile";
      renderClubsTab();
      els.clubName?.focus();
    });
  }

  els.clubsList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    const clubId = btn.dataset.clubId;
    const action = btn.dataset.action;
    if (blockIfViewerAction(action)) {
      return;
    }

    if (action === "view-club") {
      selectedClubProfileId = clubId || null;
      selectedClubPlayerProfileId = null;
      selectedClubPlayerProfileTab = "info";
      selectedClubDetailTab = "profile";
      showClubPlayerAddForms = false;
      showClubCoachAddForm = false;
      selectedClubsView = "profile";
      renderClubsTab();
    }

    if (action === "edit-club") {
      startEditClub(clubId);
    }

    if (action === "delete-club") {
      deleteClub(clubId);
    }

    if (action === "open-club-manage") {
      resetClubForm();
      resetCoachForm();
      selectedClubsView = "manage";
      selectedClubDetailTab = "profile";
      renderClubsTab();
      els.clubName?.focus();
    }
  });

  els.clubProfile.addEventListener("submit", async (event) => {
    const form = event.target.closest("form[data-action]");
    if (!form) {
      return;
    }
    event.preventDefault();
    if (form.dataset.action === "quick-add-club-player") {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: редагування доступне лише адміністратору.");
        return;
      }
      await submitQuickClubPlayerForm(form);
    }
    if (form.dataset.action === "attach-existing-player") {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: редагування доступне лише адміністратору.");
        return;
      }
      submitAttachExistingPlayerToClubForm(form);
    }
    if (form.dataset.action === "quick-add-club-coach") {
      if (!canManageAdminUi()) {
        alert("Режим перегляду: редагування доступне лише адміністратору.");
        return;
      }
      await submitQuickClubCoachForm(form);
    }
  });

  els.clubProfile.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }
    if (blockIfViewerAction(btn.dataset.action)) {
      return;
    }

    const playerId = btn.dataset.playerId;
    if (btn.dataset.action === "add-to-tournament") {
      addBasePlayerToTournament(playerId);
    }

    if (btn.dataset.action === "view-player-profile") {
      selectedClubPlayerProfileId = playerId || null;
      selectedClubPlayerProfileTab = "info";
      selectedClubDetailTab = "players";
      selectedClubsView = "profile";
      renderClubsTab();
    }

    if (btn.dataset.action === "set-player-profile-tab") {
      const tab = String(btn.dataset.tab || "").trim();
      if (!tab) {
        return;
      }
      selectedClubPlayerProfileTab = tab;
      selectedClubsView = "profile";
      renderClubsTab();
    }

    if (btn.dataset.action === "open-player-tournament") {
      const tournamentId = btn.dataset.tournamentId || "";
      openTournamentFromPlayerProfile(tournamentId);
    }

    if (btn.dataset.action === "edit-club") {
      startEditClub(btn.dataset.clubId);
    }

    if (btn.dataset.action === "edit-club-coach") {
      startEditCoach(btn.dataset.coachId);
    }

    if (btn.dataset.action === "select-club-profile") {
      selectedClubProfileId = btn.dataset.clubId || null;
      selectedClubPlayerProfileId = null;
      selectedClubPlayerProfileTab = "info";
      showClubPlayerAddForms = false;
      showClubCoachAddForm = false;
      selectedClubsView = "profile";
      renderClubsTab();
    }

    if (btn.dataset.action === "set-club-detail-tab") {
      const tab = String(btn.dataset.tab || "").trim();
      if (!tab) {
        return;
      }
      selectedClubDetailTab = tab;
      if (tab !== "players") {
        selectedClubPlayerProfileId = null;
        selectedClubPlayerProfileTab = "info";
        showClubPlayerAddForms = false;
      }
      if (tab !== "coaches") {
        showClubCoachAddForm = false;
      }
      renderClubsTab();
    }

    if (btn.dataset.action === "toggle-club-player-add") {
      showClubPlayerAddForms = !showClubPlayerAddForms;
      renderClubsTab();
    }

    if (btn.dataset.action === "toggle-club-coach-add") {
      showClubCoachAddForm = !showClubCoachAddForm;
      renderClubsTab();
    }

    if (btn.dataset.action === "edit-club-player") {
      editClubPlayerInBase(playerId);
    }

    if (btn.dataset.action === "remove-player-from-club") {
      removeBasePlayerFromClub(playerId);
    }
  });

  els.basePlayersList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    const playerId = btn.dataset.playerId;
    const action = btn.dataset.action;
    if (blockIfViewerAction(action)) {
      return;
    }

    if (action === "add-to-tournament") {
      addBasePlayerToTournament(playerId);
    }

    if (action === "delete-base-player") {
      deleteBasePlayer(playerId);
    }

    if (action === "edit-base-player") {
      startEditBasePlayer(playerId);
    }

    if (action === "view-base-history") {
      viewBasePlayerHistory(playerId);
    }

    if (action === "view-base-profile") {
      selectedBasePlayerProfileId = playerId || null;
      selectedBasePlayerProfileTab = "ranking";
      renderBasePlayersTab();
      if (els.basePlayerProfile && selectedBasePlayerProfileId) {
        els.basePlayerProfile.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (action === "sort-base-column") {
      const sortKey = btn.dataset.sortKey;
      if (!sortKey) {
        return;
      }
      if (basePlayersSort.key === sortKey) {
        basePlayersSort.dir = basePlayersSort.dir === "asc" ? "desc" : "asc";
      } else {
        basePlayersSort.key = sortKey;
        basePlayersSort.dir = sortKey === "rating" ? "desc" : "asc";
      }
      renderBasePlayersTab();
    }
  });

  if (els.basePlayerProfile) {
    els.basePlayerProfile.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-action]");
      if (!btn) {
        return;
      }

      if (btn.dataset.action === "set-base-player-profile-tab") {
        const tab = String(btn.dataset.tab || "").trim();
        if (!tab) {
          return;
        }
        selectedBasePlayerProfileTab = tab;
        renderBasePlayersTab();
        return;
      }

      if (btn.dataset.action === "close-base-player-profile") {
        selectedBasePlayerProfileId = null;
        selectedBasePlayerProfileTab = "ranking";
        renderBasePlayersTab();
        return;
      }

      if (btn.dataset.action === "open-player-tournament") {
        const tournamentId = btn.dataset.tournamentId || "";
        openTournamentFromPlayerProfile(tournamentId);
      }
    });
  }

  els.pairings.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn || btn.disabled) {
      return;
    }

    if (btn.dataset.action === "set-pair-result") {
      const roundIdx = Number(btn.dataset.roundIdx);
      const board = Number(btn.dataset.board);
      const currentValue = btn.dataset.current || "pending";
      const nextValue = btn.dataset.resultValue || "pending";
      updateResult(roundIdx, board, currentValue === nextValue ? "pending" : nextValue);
      return;
    }

    if (btn.dataset.action === "set-pair-game-result") {
      const roundIdx = Number(btn.dataset.roundIdx);
      const board = Number(btn.dataset.board);
      const gameIndex = Number(btn.dataset.gameIndex);
      const currentValue = btn.dataset.current || "pending";
      const nextValue = btn.dataset.resultValue || "pending";
      updateMicromatchGameResult(roundIdx, board, gameIndex, currentValue === nextValue ? "pending" : nextValue);
    }
  });

  els.standings.addEventListener("change", (event) => {
    const select = event.target.closest("select[data-action='set-manual-place']");
    if (!select) {
      return;
    }

    const playerId = String(select.dataset.playerId || "").trim();
    if (!playerId) {
      return;
    }

    const player = state.currentTournament.players.find((p) => p.id === playerId);
    if (!player) {
      return;
    }

    const rawValue = String(select.value || "").trim();
    const nextPlace = rawValue ? Number(rawValue) : null;
    player.manualPlace = Number.isInteger(nextPlace) && nextPlace > 0 ? nextPlace : null;
    state.currentTournament.updatedAt = new Date().toISOString();
    saveAndRender();
  });

  els.standings.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    const action = btn.dataset.action;
    if (blockIfViewerAction(action)) {
      return;
    }

    if (action === "confirm-auto-places") {
      applyAutoPlacesForTiedScores(state.currentTournament);
      return;
    }

    if (action === "finish-tournament-from-table") {
      void finishCurrentTournament();
      return;
    }

    if (action === "emergency-finish-tournament") {
      void emergencyFinishCurrentTournament();
    }
  });

  els.playersList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    captureTournamentSettingsDraftFromForm();
    const playerId = btn.dataset.playerId;
    const action = btn.dataset.action;
    if (blockIfViewerAction(action)) {
      return;
    }

    if (action === "edit-tour-player") {
      editTournamentPlayer(playerId);
    }

    if (action === "remove-tour-player") {
      removeTournamentPlayer(playerId);
    }
  });

  els.archiveList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    const tournamentId = btn.dataset.tournamentId;
    const action = btn.dataset.action;
    if (blockIfViewerAction(action)) {
      return;
    }

    if (action === "open-archive") {
      if (canManageAdminUi()) {
        loadTournamentFromArchive(tournamentId);
      } else {
        openArchivePreview(tournamentId);
      }
    }

    if (action === "open-ongoing") {
      openOngoingTournament(tournamentId);
    }

    if (action === "delete-archive") {
      deleteArchivedTournament(tournamentId);
    }

    if (action === "print-archive") {
      printArchivedTournament(tournamentId);
    }

    if (action === "close-archive-preview") {
      state.archivePreviewTournamentId = null;
      saveAndRender();
    }
  });

  if (els.tournamentsSearch) {
    els.tournamentsSearch.addEventListener("input", () => {
      tournamentsSearchQuery = String(els.tournamentsSearch.value || "").trim();
      renderArchiveTab();
    });
  }

  if (els.tournamentsStatusFilter) {
    els.tournamentsStatusFilter.addEventListener("change", () => {
      tournamentsStatusFilter = String(els.tournamentsStatusFilter.value || "all");
      renderArchiveTab();
    });
  }

  if (els.tournamentsDateFrom) {
    els.tournamentsDateFrom.addEventListener("change", () => {
      tournamentsDateFrom = String(els.tournamentsDateFrom.value || "").trim();
      renderArchiveTab();
    });
  }

  if (els.tournamentsDateTo) {
    els.tournamentsDateTo.addEventListener("change", () => {
      tournamentsDateTo = String(els.tournamentsDateTo.value || "").trim();
      renderArchiveTab();
    });
  }
}
