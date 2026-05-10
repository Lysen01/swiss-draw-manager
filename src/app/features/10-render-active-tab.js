function renderActiveTabPanel() {
  if (state.activeTab === "tournament") {
    renderTournamentTab();
    return;
  }

  if (state.activeTab === "players") {
    renderBasePlayersTab();
    return;
  }

  if (state.activeTab === "clubs") {
    renderClubsTab();
    return;
  }

  if (state.activeTab === "archive") {
    renderArchiveTab();
    return;
  }

  renderTournamentTab();
}
