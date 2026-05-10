function renderTournamentTab() {
  const t = state.currentTournament;
  const archiveView = t.status === "archived_view";
  ensureTournamentSettingsDraftForCurrentTournament();
  const draft = tournamentSettingsDraft;
  if (draft.format === "round_robin") {
    draft.roundsCount = getMaxRoundsByFormat("round_robin", t.players.length);
  }

  els.tournamentName.value = draft.name;
  els.roundsCount.value = draft.roundsCount;
  els.tournamentFormat.value = draft.format;
  els.roundsCount.disabled = draft.format === "round_robin" || archiveView;
  renderRoundsRuleHint();
  els.tournamentDate.value = formatDateForInput(draft.eventDate || t.eventDate);
  els.tournamentTimeControl.value = normalizeTimeControl(draft.timeControl);
  els.tournamentChiefJudge.value = normalizeChiefJudge(draft.chiefJudge);
  renderTieBreakSelectors(draft.tieBreakOrder);
  els.tournamentRemovePhoto.checked = draft.removePhoto;
  els.tournamentPhoto.value = "";

  const eventDateText = t.eventDate ? formatDateOnly(t.eventDate) : "дата не вказана";
  const timeControlText = t.timeControl || "не вказано";
  const chiefJudgeText = t.chiefJudge || "не вказано";
  const tournamentTitle = t.name || "Новий турнір";
  els.roundMeta.textContent = `${tournamentTitle} | ${formatLabel(t.format)} | Тур ${t.currentRound} з ${t.roundsCount} | Дата: ${eventDateText} | Контроль: ${timeControlText} | Суддя: ${chiefJudgeText}${archiveView ? " | Архів (read-only)" : ""}`;

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
  if (archiveView) {
    els.dbPlayerSelect.disabled = true;
    els.selectAllBaseBtn.disabled = true;
    els.addFromBaseBtn.disabled = true;
    for (const checkbox of els.dbPlayerChecklist.querySelectorAll("input[type='checkbox']")) {
      checkbox.disabled = true;
    }
  }

  renderTournamentSubtabs();
  renderTournamentPlayers();
  renderManualPairingPanel();
  renderRounds();
  renderStandings();
}
