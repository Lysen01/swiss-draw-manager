function renderTournamentTab() {
  const t = state.currentTournament;
  const archiveView = t.status === "archived_view";
  const canManage = canManageAdminUi();
  const archiveAdminEditMode = archiveView && canManage;
  const readOnlyArchive = archiveView && !canManage;
  ensureTournamentSettingsDraftForCurrentTournament();
  const draft = tournamentSettingsDraft;
  if (draft.format === "round_robin") {
    draft.roundsCount = getMaxRoundsByFormat("round_robin", t.players.length);
  }

  els.tournamentName.value = draft.name;
  els.roundsCount.value = draft.roundsCount;
  els.tournamentFormat.value = draft.format;
  if (els.tournamentIsMicromatch) {
    els.tournamentIsMicromatch.checked = Boolean(draft.isMicromatch);
  }
  if (els.scoreCalculationType) {
    els.scoreCalculationType.value = draft.scoreCalculationType === "small_points" ? "small_points" : "big_points";
  }
  renderScoreCalculationControls();
  els.roundsCount.disabled = draft.format === "round_robin" || archiveView || readOnlyArchive;
  renderRoundsRuleHint();
  els.tournamentDate.value = formatDateForInput(draft.eventDate || t.eventDate);
  els.tournamentTimeControl.value = normalizeTimeControl(draft.timeControl);
  els.tournamentChiefJudge.value = normalizeChiefJudge(draft.chiefJudge);
  renderTieBreakSelectors(draft.tieBreakOrder);
  els.tournamentRemovePhoto.checked = draft.removePhoto;
  els.tournamentPhoto.value = "";

  els.tournamentName.disabled = readOnlyArchive;
  els.tournamentDate.disabled = readOnlyArchive;
  els.tournamentTimeControl.disabled = readOnlyArchive;
  els.tournamentChiefJudge.disabled = readOnlyArchive;
  els.tournamentFormat.disabled = archiveView || readOnlyArchive;
  if (els.tournamentIsMicromatch) {
    els.tournamentIsMicromatch.disabled = archiveView || readOnlyArchive;
  }
  if (els.scoreCalculationType) {
    els.scoreCalculationType.disabled = archiveView || readOnlyArchive;
  }
  if (els.tournamentPhoto) {
    els.tournamentPhoto.disabled = archiveView || readOnlyArchive;
  }
  if (els.tournamentRemovePhoto) {
    els.tournamentRemovePhoto.disabled = archiveView || readOnlyArchive;
  }
  for (const select of [els.tieBreak1, els.tieBreak2, els.tieBreak3, els.tieBreak4, els.tieBreak5]) {
    if (select) {
      select.disabled = archiveView || readOnlyArchive;
    }
  }
  if (els.settingsSubmitBtn) {
    els.settingsSubmitBtn.hidden = readOnlyArchive;
    els.settingsSubmitBtn.textContent = archiveAdminEditMode ? "Підтвердити зміни" : "Створити турнір";
  }
  if (els.archiveSettingsCancelBtn) {
    els.archiveSettingsCancelBtn.hidden = !archiveAdminEditMode;
  }

  const eventDateText = t.eventDate ? formatDateOnly(t.eventDate) : "дата не вказана";
  const timeControlText = t.timeControl || "не вказано";
  const chiefJudgeText = t.chiefJudge || "не вказано";
  const tournamentTitle = t.name || "Новий турнір";
  const archiveHint = archiveView ? (readOnlyArchive ? " | Архів (read-only)" : " | Архів (редагування для адміністратора)") : "";
  els.roundMeta.textContent = `${tournamentTitle} | ${formatLabel(t.format)} | Тур ${t.currentRound} з ${t.roundsCount} | Дата: ${eventDateText} | Контроль: ${timeControlText} | Суддя: ${chiefJudgeText}${archiveHint}`;

  renderTournamentSettingsPreview();

  renderBaseSelect();
  els.generateRoundBtn.disabled = archiveView;
  els.manualRoundBtn.disabled = archiveView;
  els.manualRoundBtn.textContent = manualRoundBuilderOpen ? "Закрити ручний тур" : "Додати тур вручну";
  els.printRoundBtn.disabled = archiveView || t.rounds.length === 0;
  els.finishTournamentBtn.disabled = archiveView;
  if (els.seedDemoBtn) {
    els.seedDemoBtn.disabled = archiveView;
  }
  if (archiveView || readOnlyArchive) {
    els.dbPlayerSelect.disabled = true;
    if (els.tournamentClubFilter) {
      els.tournamentClubFilter.disabled = true;
    }
    els.selectAllBaseBtn.disabled = true;
    els.addFromBaseBtn.disabled = true;
    for (const checkbox of els.dbPlayerChecklist.querySelectorAll("input[type='checkbox']")) {
      checkbox.disabled = true;
    }
  } else {
    els.dbPlayerSelect.disabled = false;
    if (els.tournamentClubFilter) {
      els.tournamentClubFilter.disabled = false;
    }
    els.selectAllBaseBtn.disabled = false;
    els.addFromBaseBtn.disabled = selectedBasePlayerIds.size === 0;
    for (const checkbox of els.dbPlayerChecklist.querySelectorAll("input[type='checkbox']")) {
      checkbox.disabled = false;
    }
  }

  renderTournamentSubtabs();
  renderTournamentPlayers();
  renderManualPairingPanel();
  renderRounds();
  renderStandings();
}
