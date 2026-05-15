const initialRawState = loadRawState();
hasStoredLocalState = Boolean(initialRawState);
state = normalizeState(initialRawState);
recalcAllBaseStats();
normalizeRoundsCountForCurrentFormat(state.currentTournament);
tournamentSettingsDraft = createTournamentSettingsDraft(state.currentTournament);
isSidebarCollapsed = loadSidebarCollapsedState();
applySidebarCollapsedState();

bindEvents();
render();
void bootstrapPersistence();
