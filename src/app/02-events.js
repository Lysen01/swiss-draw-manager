function bindEvents() {
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
    }
    state.activeTab = nextTab || state.activeTab;
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
    captureTournamentSettingsDraftFromForm();
    const t = state.currentTournament;
    ensureTournamentSettingsDraftForCurrentTournament();
    const draft = tournamentSettingsDraft;
    if (t.status === "archived_view") {
      alert("У режимі перегляду архіву редагування вимкнене.");
      return;
    }
    const nextFormat = draft.format;
    const manualRounds = Number(draft.roundsCount);
    const requiredRoundRobinRounds = getMaxRoundsByFormat("round_robin", t.players.length);
    const nextRounds = nextFormat === "round_robin" ? requiredRoundRobinRounds : manualRounds;
    const nextEventDate = normalizeBirthDate(draft.eventDate);

    if (nextRounds < t.currentRound) {
      alert(`Не можна встановити менше турів, ніж уже зіграно (${t.currentRound}).`);
      return;
    }

    if (nextFormat !== t.format && t.currentRound > 0) {
      alert("Після старту турніру не можна змінити формат.");
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

    t.name = draft.name || "Турнір";
    t.roundsCount = nextRounds;
    t.format = nextFormat;
    t.eventDate = nextEventDate;
    t.timeControl = draft.timeControl;
    t.chiefJudge = draft.chiefJudge;
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
    tournamentSettingsDraft = createTournamentSettingsDraft(t);
    saveAndRender();
  });

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
    if (tournamentSettingsDraft.eventDate) {
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
    generateNextRound();
  });
  els.manualRoundBtn.addEventListener("click", () => {
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
    finishCurrentTournament();
  });

  els.resetBtn.addEventListener("click", () => {
    captureTournamentSettingsDraftFromForm();
    createNewTournamentFlow();
  });

  els.basePlayerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitBasePlayerForm();
  });

  els.basePlayerCancelEditBtn.addEventListener("click", () => {
    resetBasePlayerForm();
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
    await submitClubForm();
  });

  els.clubCancelEditBtn.addEventListener("click", () => {
    resetClubForm();
  });

  els.coachForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitCoachForm();
  });

  els.clubsList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    const clubId = btn.dataset.clubId;
    const action = btn.dataset.action;

    if (action === "view-club") {
      selectedClubProfileId = clubId || null;
      selectedClubPlayerProfileId = null;
      selectedClubPlayerProfileTab = "info";
      selectedClubDetailTab = "profile";
      selectedClubsView = "profile";
      renderClubsTab();
    }

    if (action === "edit-club") {
      startEditClub(clubId);
    }

    if (action === "delete-club") {
      deleteClub(clubId);
    }
  });

  els.clubProfile.addEventListener("submit", async (event) => {
    const form = event.target.closest("form[data-action]");
    if (!form) {
      return;
    }
    event.preventDefault();
    if (form.dataset.action === "quick-add-club-player") {
      await submitQuickClubPlayerForm(form);
    }
    if (form.dataset.action === "attach-existing-player") {
      submitAttachExistingPlayerToClubForm(form);
    }
    if (form.dataset.action === "quick-add-club-coach") {
      await submitQuickClubCoachForm(form);
    }
  });

  els.clubProfile.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
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

    if (btn.dataset.action === "select-club-profile") {
      selectedClubProfileId = btn.dataset.clubId || null;
      selectedClubPlayerProfileId = null;
      selectedClubPlayerProfileTab = "info";
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
      }
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

  els.pairings.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action='set-pair-result']");
    if (!btn || btn.disabled) {
      return;
    }

    const roundIdx = Number(btn.dataset.roundIdx);
    const board = Number(btn.dataset.board);
    const currentValue = btn.dataset.current || "pending";
    const nextValue = btn.dataset.resultValue || "pending";
    updateResult(roundIdx, board, currentValue === nextValue ? "pending" : nextValue);
  });

  els.playersList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }

    captureTournamentSettingsDraftFromForm();
    const playerId = btn.dataset.playerId;
    const action = btn.dataset.action;

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

    if (action === "open-archive") {
      openArchivePreview(tournamentId);
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
}
