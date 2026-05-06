const initialRawState = loadRawState();
hasStoredLocalState = Boolean(initialRawState);
state = normalizeState(initialRawState);
recalcAllBaseStats();
normalizeRoundsCountForCurrentFormat(state.currentTournament);
tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);

bindEvents();
render();
void bootstrapPersistence();
