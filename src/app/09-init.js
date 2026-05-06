state = normalizeState(loadRawState());
recalcAllBaseStats();
normalizeRoundsCountForCurrentFormat(state.currentTournament);
tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);

bindEvents();
render();
