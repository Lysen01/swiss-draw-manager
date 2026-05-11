function selectAllVisibleBasePlayers() {
  if (!filteredTournamentBaseLookup.length) {
    return;
  }
  for (const item of filteredTournamentBaseLookup) {
    selectedBasePlayerIds.add(item.id);
  }
  renderBaseSelect();
}

function addSelectedBasePlayersToTournament() {
  const t = state.currentTournament;
  if (t.currentRound > 0) {
    alert("Не можна додавати гравців після старту турніру.");
    return;
  }

  const idsToAdd = [...selectedBasePlayerIds].filter((id) => !t.players.some((p) => p.basePlayerId === id));
  if (idsToAdd.length === 0) {
    alert("Відмітьте хоча б одного гравця, щоб додати у турнір.");
    return;
  }

  let added = 0;
  for (const baseId of idsToAdd) {
    const basePlayer = state.playerBase.find((p) => p.id === baseId);
    if (!basePlayer) {
      continue;
    }
    const ok = addTournamentPlayer(basePlayer.id, getBaseFullName(basePlayer), basePlayer.rating, { save: false });
    if (ok) {
      added += 1;
    }
  }

  if (!added) {
    alert("Не вдалося додати вибраних гравців.");
    return;
  }

  selectedBasePlayerIds.clear();
  els.dbPlayerSelect.value = "";
  normalizeRoundsCountForCurrentFormat(t);
  t.updatedAt = new Date().toISOString();
  saveAndRender();
}

function addBasePlayerToTournament(basePlayerId) {
  const t = state.currentTournament;
  if (t.currentRound > 0) {
    alert("Не можна додавати гравців після старту турніру.");
    return;
  }

  const basePlayer = state.playerBase.find((p) => p.id === basePlayerId);
  if (!basePlayer) {
    return;
  }

  addTournamentPlayer(basePlayer.id, getBaseFullName(basePlayer), basePlayer.rating);
}

function addTournamentPlayer(basePlayerId, name, rating, options = {}) {
  const t = state.currentTournament;
  const shouldSave = options.save !== false;
  const basePlayer = basePlayerId ? state.playerBase.find((p) => p.id === basePlayerId) : null;

  if (t.players.some((p) => p.basePlayerId === basePlayerId)) {
    if (shouldSave) {
      alert("Цей гравець уже доданий у турнір.");
    }
    return false;
  }

  t.players.push(
    createTournamentPlayer(name, rating, basePlayerId, t.players.length, {
      gender: basePlayer?.gender,
      photoDataUrl: basePlayer?.photoDataUrl,
      clubId: basePlayer?.clubId,
      coachId: basePlayer?.coachId,
    })
  );
  if (shouldSave) {
    normalizeRoundsCountForCurrentFormat(t);
    t.updatedAt = new Date().toISOString();
    saveAndRender();
  }
  return true;
}

async function submitBasePlayerForm() {
  const lastName = els.basePlayerLastName.value.trim();
  const firstName = els.basePlayerFirstName.value.trim();
  const rating = Number(els.basePlayerRating.value);
  const gender = normalizeGender(els.basePlayerGender.value);
  const rank = els.basePlayerRank.value;
  const birthDate = normalizeBirthDate(els.basePlayerBirthDate.value);
  const clubId = normalizeEntityId(els.basePlayerClub.value);
  const coachId = normalizeEntityId(els.basePlayerCoach.value);
  const removePhoto = els.basePlayerRemovePhoto.checked;
  const photoFile = els.basePlayerPhoto.files?.[0] || null;

  if (!lastName || !firstName) {
    alert("Прізвище та ім'я обов'язкові.");
    return;
  }

  if (!Number.isFinite(rating) || rating < 0) {
    alert("Рейтинг має бути невід'ємним числом.");
    return;
  }

  let photoDataUrl = null;
  if (photoFile) {
    if (!isValidBasePlayerPhotoFile(photoFile)) {
      return;
    }
    photoDataUrl = await readBasePlayerPhotoDataUrl(photoFile);
  }

  if (editingBasePlayerId) {
    const base = state.playerBase.find((p) => p.id === editingBasePlayerId);
    if (!base) {
      resetBasePlayerForm();
      return;
    }

    if (
      state.playerBase.some(
        (p) =>
          p.id !== base.id &&
          p.lastName.toLowerCase() === lastName.toLowerCase() &&
          p.firstName.toLowerCase() === firstName.toLowerCase()
      )
    ) {
      alert("Гравець з таким прізвищем та ім'ям уже є в базі.");
      return;
    }

    base.lastName = lastName;
    base.firstName = firstName;
    base.rating = Math.round(rating);
    base.gender = gender;
    base.clubId = clubId;
    base.coachId = coachId;
    base.rank = normalizeRank(rank);
    base.birthDate = birthDate;

    if (photoDataUrl) {
      base.photoDataUrl = photoDataUrl;
    } else if (removePhoto) {
      base.photoDataUrl = null;
    }

    syncBasePlayerChangesToCurrentTournament(base.id);
  } else {
    if (
      state.playerBase.some(
        (p) => p.lastName.toLowerCase() === lastName.toLowerCase() && p.firstName.toLowerCase() === firstName.toLowerCase()
      )
    ) {
      alert("Гравець з таким прізвищем та ім'ям уже є в базі.");
      return;
    }

    state.playerBase.push(
      createBasePlayerRecord(lastName, firstName, Math.round(rating), {
        gender,
        clubId,
        coachId,
        rank,
        birthDate,
        photoDataUrl: photoDataUrl || null,
      })
    );
  }

  resetBasePlayerForm({ keepOpen: true });
  saveAndRender();
}

function deleteBasePlayer(playerId) {
  if (!confirm("Видалити гравця з бази? Історія турнірів також зникне.")) {
    return;
  }

  state.playerBase = state.playerBase.filter((p) => p.id !== playerId);

  for (const tp of state.currentTournament.players) {
    if (tp.basePlayerId === playerId) {
      tp.basePlayerId = null;
    }
  }

  saveAndRender();
}

function startEditBasePlayer(playerId) {
  const base = state.playerBase.find((p) => p.id === playerId);
  if (!base) {
    return;
  }

  editingBasePlayerId = base.id;
  els.basePlayerLastName.value = base.lastName || "";
  els.basePlayerFirstName.value = base.firstName || "";
  els.basePlayerRating.value = String(base.rating ?? 0);
  els.basePlayerGender.value = normalizeGender(base.gender);
  els.basePlayerRank.value = normalizeRank(base.rank);
  els.basePlayerBirthDate.value = normalizeBirthDate(base.birthDate);
  renderBasePlayerOwnershipSelectors(base);
  els.basePlayerPhoto.value = "";
  els.basePlayerRemovePhoto.checked = false;
  els.basePlayerSubmitBtn.textContent = "Зберегти зміни";
  els.basePlayerCancelEditBtn.hidden = false;
  els.baseEditHint.hidden = false;
  els.baseEditHint.textContent = `Редагування: ${getBaseFullName(base)}. Поля: Прізвище, Ім'я, Рейтинг, Стать, Спортивне звання, Дата народження, Фото.`;
  showBasePlayerAddForm = true;
  syncBasePlayerFormVisibility();
  els.basePlayerForm.scrollIntoView({ behavior: "smooth", block: "center" });
  els.basePlayerLastName.focus();
}

function resetBasePlayerForm(options = {}) {
  const keepOpen = Boolean(options.keepOpen);
  editingBasePlayerId = null;
  els.basePlayerForm.reset();
  els.basePlayerGender.value = "";
  els.basePlayerRank.value = "б/р";
  renderBasePlayerOwnershipSelectors(null);
  els.basePlayerRemovePhoto.checked = false;
  els.basePlayerSubmitBtn.textContent = "Додати в базу";
  els.basePlayerCancelEditBtn.hidden = true;
  els.baseEditHint.hidden = true;
  els.baseEditHint.textContent = "";
  showBasePlayerAddForm = keepOpen;
  syncBasePlayerFormVisibility();
}

function syncBasePlayerFormVisibility() {
  if (!els.basePlayerFormWrap || !els.openBasePlayerFormBtn) {
    return;
  }

  const canManage = canManageAdminUi();
  const shouldShow = canManage && Boolean(showBasePlayerAddForm || editingBasePlayerId);
  els.basePlayerFormWrap.classList.toggle("tour-view-hidden", !shouldShow);
  els.openBasePlayerFormBtn.hidden = !canManage;
  els.openBasePlayerFormBtn.textContent = shouldShow ? "Сховати форму" : "Додати гравця";
  els.openBasePlayerFormBtn.setAttribute("aria-expanded", shouldShow ? "true" : "false");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readTournamentPhotoDataUrl(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  return optimizeImageDataUrl(rawDataUrl, {
    maxSide: 1280,
    qualityStart: 0.86,
    qualityMin: 0.52,
    targetBytes: MAX_TOURNAMENT_PHOTO_STORE_BYTES,
  });
}

async function readBasePlayerPhotoDataUrl(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  return optimizeImageDataUrl(rawDataUrl, {
    maxSide: 760,
    qualityStart: 0.82,
    qualityMin: 0.45,
    targetBytes: MAX_BASE_PLAYER_PHOTO_STORE_BYTES,
  });
}

async function readClubLogoDataUrl(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  return optimizeImageDataUrl(rawDataUrl, {
    maxSide: 520,
    qualityStart: 0.84,
    qualityMin: 0.48,
    targetBytes: MAX_CLUB_LOGO_STORE_BYTES,
  });
}

async function readCoachPhotoDataUrl(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  return optimizeImageDataUrl(rawDataUrl, {
    maxSide: 620,
    qualityStart: 0.82,
    qualityMin: 0.45,
    targetBytes: MAX_COACH_PHOTO_STORE_BYTES,
  });
}

function optimizeImageDataUrl(dataUrl, options) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = options.maxSide || 1280;
      const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const targetBytes = options.targetBytes || MAX_TOURNAMENT_PHOTO_STORE_BYTES;
      const qualityStart = options.qualityStart || 0.86;
      const qualityMin = options.qualityMin || 0.52;

      let width = Math.max(1, Math.round(img.naturalWidth * ratio));
      let height = Math.max(1, Math.round(img.naturalHeight * ratio));
      let output = dataUrl;

      for (let scaleAttempt = 0; scaleAttempt < 6; scaleAttempt += 1) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = qualityStart;
        output = canvas.toDataURL("image/jpeg", quality);
        while (estimateDataUrlBytes(output) > targetBytes && quality > qualityMin) {
          quality = Math.max(qualityMin, quality - 0.08);
          output = canvas.toDataURL("image/jpeg", quality);
        }

        if (estimateDataUrlBytes(output) <= targetBytes) {
          resolve(output);
          return;
        }

        width = Math.max(1, Math.round(width * 0.85));
        height = Math.max(1, Math.round(height * 0.85));
      }

      resolve(output);
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function estimateDataUrlBytes(dataUrl) {
  const commaIdx = dataUrl.indexOf(",");
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  return Math.floor((base64.length * 3) / 4);
}

function viewBasePlayerHistory(playerId) {
  const base = state.playerBase.find((p) => p.id === playerId);
  if (!base) {
    return;
  }
  const fullName = getBaseFullName(base);

  if (!base.history.length) {
    alert(`${fullName}: поки немає історії зіграних турнірів.`);
    return;
  }

  const ordered = base.history.slice().sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
  const lines = ordered.map((h) => {
    const opponents = (h.opponents || []).length ? h.opponents.join(", ") : "без суперників";
    const ratingDelta = Number.isFinite(Number(h.ratingDelta))
      ? `${Number(h.ratingDelta) > 0 ? "+" : ""}${Number(h.ratingDelta)}`
      : "-";
    const ratingAfter = Number.isFinite(Number(h.ratingAfter)) ? Math.round(Number(h.ratingAfter)) : "-";
    return `• ${h.tournamentName} | ${formatDate(h.finishedAt)} | місце ${h.place ?? "-"} | очки ${Number(h.score).toFixed(1)} | Δрейтинг ${ratingDelta} | новий ${ratingAfter} | суперники: ${opponents}`;
  });

  alert(`${fullName}\n\n${lines.join("\n")}`);
}

function syncBasePlayerChangesToCurrentTournament(basePlayerId) {
  const t = state.currentTournament;
  const base = state.playerBase.find((p) => p.id === basePlayerId);
  if (!base) {
    return;
  }

  const linked = t.players.filter((p) => p.basePlayerId === basePlayerId);
  for (const tp of linked) {
    tp.name = getBaseFullName(base);
    tp.gender = normalizeGender(base.gender);
    tp.photoDataUrl = base.photoDataUrl || null;
    tp.clubId = normalizeEntityId(base.clubId);
    tp.coachId = normalizeEntityId(base.coachId);
    if (t.currentRound === 0) {
      tp.rating = base.rating;
    }
  }
}

function editTournamentPlayer(playerId) {
  const t = state.currentTournament;
  if (t.currentRound > 0) {
    alert("Після старту турніру редагування учасників вимкнене.");
    return;
  }

  const player = t.players.find((p) => p.id === playerId);
  if (!player) {
    return;
  }

  const nextName = prompt("Нове ім'я гравця:", player.name);
  if (nextName === null) {
    return;
  }

  const trimmedName = nextName.trim();
  if (!trimmedName) {
    alert("Ім'я не може бути порожнім.");
    return;
  }

  const nextRatingRaw = prompt("Новий рейтинг:", String(player.rating));
  if (nextRatingRaw === null) {
    return;
  }

  const nextRating = Number(nextRatingRaw);
  if (!Number.isFinite(nextRating) || nextRating < 0) {
    alert("Рейтинг має бути невід'ємним числом.");
    return;
  }

  player.name = trimmedName;
  player.rating = Math.round(nextRating);

  if (player.basePlayerId) {
    const base = state.playerBase.find((bp) => bp.id === player.basePlayerId);
    if (base) {
      const split = splitFullName(player.name);
      base.lastName = split.lastName || base.lastName;
      base.firstName = split.firstName || base.firstName;
      base.rating = player.rating;
    }
  }

  saveAndRender();
}

function removeTournamentPlayer(playerId) {
  const t = state.currentTournament;
  if (t.currentRound > 0) {
    alert("Після старту турніру видалення учасників вимкнене.");
    return;
  }

  const player = t.players.find((p) => p.id === playerId);
  if (!player) {
    return;
  }

  if (!confirm(`Видалити ${player.name} з поточного турніру?`)) {
    return;
  }

  t.players = t.players.filter((p) => p.id !== playerId);
  normalizeRoundsCountForCurrentFormat(t);
  t.updatedAt = new Date().toISOString();
  saveAndRender();
}

function addDemoPlayers() {
  const t = state.currentTournament;
  if (t.players.length > 0 || t.currentRound > 0) {
    alert("Демо можна завантажити лише в порожній турнір.");
    return;
  }

  const demo = [
    ["Коваль", "Артем", 1650],
    ["Іванчук", "Олексій", 1590],
    ["Мельник", "Софія", 1585],
    ["Литвин", "Марко", 1540],
    ["Петренко", "Іван", 1525],
    ["Шевчук", "Вікторія", 1510],
    ["Клименко", "Ярина", 1490],
    ["Савчук", "Дмитро", 1460],
    ["Бойко", "Лев", 1440],
    ["Гончар", "Анна", 1430],
    ["Паламар", "Максим", 1400],
    ["Ткаченко", "Поліна", 1380],
  ];

  for (const [lastName, firstName, rating] of demo) {
    let base = state.playerBase.find(
      (p) => p.lastName.toLowerCase() === lastName.toLowerCase() && p.firstName.toLowerCase() === firstName.toLowerCase()
    );
    if (!base) {
      base = createBasePlayerRecord(lastName, firstName, rating);
      state.playerBase.push(base);
    }

    t.players.push(
      createTournamentPlayer(getBaseFullName(base), rating, base.id, t.players.length, {
        gender: base.gender,
        photoDataUrl: base.photoDataUrl,
        clubId: base.clubId,
        coachId: base.coachId,
      })
    );
  }

  normalizeRoundsCountForCurrentFormat(t);
  saveAndRender();
}

async function submitClubForm() {
  const wasEditing = Boolean(editingClubId);
  const name = els.clubName.value.trim();
  const city = els.clubCity.value.trim();
  const contact = els.clubContact.value.trim();
  const description = els.clubDescription.value.trim();
  const removeLogo = els.clubRemoveLogo.checked;
  const logoFile = els.clubLogo.files?.[0] || null;

  if (!name) {
    alert("Назва клубу обов'язкова.");
    return;
  }

  if (state.clubs.some((club) => club.id !== editingClubId && club.name.toLowerCase() === name.toLowerCase())) {
    alert("Клуб з такою назвою вже є.");
    return;
  }

  let logoDataUrl = null;
  if (logoFile) {
    if (!isValidClubLogoFile(logoFile)) {
      return;
    }
    logoDataUrl = await readClubLogoDataUrl(logoFile);
  }

  let club = editingClubId ? state.clubs.find((item) => item.id === editingClubId) : null;
  if (club) {
    club.name = name;
    club.city = city;
    club.contact = contact;
    club.description = description;
    if (logoDataUrl) {
      club.logoDataUrl = logoDataUrl;
    } else if (removeLogo) {
      club.logoDataUrl = null;
    }
  } else {
    club = createClubRecord(name, city, contact, { description, logoDataUrl });
    state.clubs.push(club);
  }

  selectedClubProfileId = club.id;
  if (wasEditing) {
    selectedClubsView = "profile";
    selectedClubDetailTab = "profile";
  }
  resetClubForm();
  saveAndRender();
}

function startEditClub(clubId) {
  const club = state.clubs.find((item) => item.id === clubId);
  if (!club) {
    return;
  }

  selectedClubsView = "manage";
  selectedClubDetailTab = "profile";
  editingClubId = club.id;
  selectedClubProfileId = club.id;
  els.clubName.value = club.name || "";
  els.clubCity.value = club.city || "";
  els.clubContact.value = club.contact || "";
  els.clubDescription.value = club.description || "";
  els.clubLogo.value = "";
  els.clubRemoveLogo.checked = false;
  els.clubSubmitBtn.textContent = "Зберегти клуб";
  els.clubCancelEditBtn.hidden = false;
  els.clubEditHint.hidden = false;
  els.clubEditHint.textContent = `Редагування клубу: ${club.name}. Можна змінити назву, місто, контакти і логотип.`;
  els.clubForm.scrollIntoView({ behavior: "smooth", block: "center" });
  els.clubName.focus();
  renderClubsTab();
}

function resetClubForm() {
  editingClubId = null;
  els.clubForm.reset();
  els.clubRemoveLogo.checked = false;
  els.clubSubmitBtn.textContent = "Додати клуб";
  els.clubCancelEditBtn.hidden = true;
  els.clubEditHint.hidden = true;
  els.clubEditHint.textContent = "";
}

async function submitQuickClubPlayerForm(form) {
  const clubId = normalizeEntityId(form.dataset.clubId);
  const club = state.clubs.find((item) => item.id === clubId);
  if (!club) {
    alert("Клуб не знайдено.");
    return;
  }

  const lastName = form.querySelector("[name='lastName']")?.value.trim() || "";
  const firstName = form.querySelector("[name='firstName']")?.value.trim() || "";
  const rating = Number(form.querySelector("[name='rating']")?.value || 0);
  const gender = normalizeGender(form.querySelector("[name='gender']")?.value || "");
  const rank = normalizeRank(form.querySelector("[name='rank']")?.value || "б/р");
  const birthDate = normalizeBirthDate(form.querySelector("[name='birthDate']")?.value || "");
  const coachId = normalizeEntityId(form.querySelector("[name='coachId']")?.value || "");
  const photoFile = form.querySelector("[name='photo']")?.files?.[0] || null;

  if (!lastName || !firstName) {
    alert("Прізвище та ім'я гравця обов'язкові.");
    return;
  }

  if (!Number.isFinite(rating) || rating < 0) {
    alert("Рейтинг має бути невід'ємним числом.");
    return;
  }

  if (
    state.playerBase.some(
      (player) =>
        player.lastName.toLowerCase() === lastName.toLowerCase() &&
        player.firstName.toLowerCase() === firstName.toLowerCase()
    )
  ) {
    alert("Гравець з таким прізвищем та ім'ям уже є в базі.");
    return;
  }

  let photoDataUrl = null;
  if (photoFile) {
    if (!isValidBasePlayerPhotoFile(photoFile)) {
      return;
    }
    photoDataUrl = await readBasePlayerPhotoDataUrl(photoFile);
  }

  const player = createBasePlayerRecord(lastName, firstName, Math.round(rating), {
    gender,
    rank,
    birthDate,
    photoDataUrl,
    clubId,
    coachId,
  });
  state.playerBase.push(player);
  selectedClubDetailTab = "players";
  selectedClubPlayerProfileId = player.id;
  form.reset();
  saveAndRender();
}

async function submitCoachForm() {
  const wasEditing = Boolean(editingCoachId);
  const lastName = els.coachLastName.value.trim();
  const firstName = els.coachFirstName.value.trim();
  const clubId = normalizeEntityId(els.coachClub.value);
  const phone = els.coachPhone.value.trim();
  const email = els.coachEmail.value.trim();
  const bio = els.coachBio.value.trim();
  const removePhoto = els.coachRemovePhoto.checked;
  const photoFile = els.coachPhoto.files?.[0] || null;

  if (!lastName || !firstName) {
    alert("Прізвище та ім'я тренера обов'язкові.");
    return;
  }

  if (!clubId) {
    alert("Оберіть клуб для тренера.");
    return;
  }

  let photoDataUrl = null;
  if (photoFile) {
    if (!isValidCoachPhotoFile(photoFile)) {
      return;
    }
    photoDataUrl = await readCoachPhotoDataUrl(photoFile);
  }

  let coach = editingCoachId ? state.coaches.find((item) => item.id === editingCoachId) : null;
  if (coach) {
    coach.lastName = lastName;
    coach.firstName = firstName;
    coach.clubId = clubId;
    coach.phone = phone;
    coach.email = email;
    coach.bio = bio;
    if (photoDataUrl) {
      coach.photoDataUrl = photoDataUrl;
    } else if (removePhoto) {
      coach.photoDataUrl = null;
    }
  } else {
    coach = createCoachRecord(lastName, firstName, clubId, { phone, email, bio, photoDataUrl });
    state.coaches.push(coach);
  }

  selectedClubDetailTab = "coaches";
  selectedClubProfileId = clubId;
  if (wasEditing) {
    selectedClubsView = "profile";
  }
  resetCoachForm();
  saveAndRender();
}

function startEditCoach(coachId) {
  const coach = state.coaches.find((item) => item.id === coachId);
  if (!coach) {
    return;
  }

  editingCoachId = coach.id;
  selectedClubsView = "manage";
  selectedClubProfileId = coach.clubId || selectedClubProfileId;
  selectedClubDetailTab = "coaches";
  renderClubsTab();

  els.coachLastName.value = coach.lastName || "";
  els.coachFirstName.value = coach.firstName || "";
  els.coachClub.value = coach.clubId || "";
  els.coachPhone.value = coach.phone || "";
  els.coachEmail.value = coach.email || "";
  els.coachBio.value = coach.bio || "";
  els.coachPhoto.value = "";
  els.coachRemovePhoto.checked = false;
  els.coachSubmitBtn.textContent = "Зберегти тренера";
  els.coachCancelEditBtn.hidden = false;
  els.coachEditHint.hidden = false;
  els.coachEditHint.textContent = `Редагування тренера: ${getCoachFullName(coach)}. Нове фото замінить поточне.`;
  els.coachForm.scrollIntoView({ behavior: "smooth", block: "center" });
  els.coachLastName.focus();
}

function resetCoachForm() {
  editingCoachId = null;
  els.coachForm.reset();
  els.coachRemovePhoto.checked = false;
  els.coachSubmitBtn.textContent = "Додати тренера";
  els.coachCancelEditBtn.hidden = true;
  els.coachEditHint.hidden = true;
  els.coachEditHint.textContent = "";
}

async function submitQuickClubCoachForm(form) {
  const clubId = normalizeEntityId(form.dataset.clubId);
  const club = state.clubs.find((item) => item.id === clubId);
  if (!club) {
    alert("Клуб не знайдено.");
    return;
  }

  const lastName = String(form.querySelector("[name='lastName']")?.value || "").trim();
  const firstName = String(form.querySelector("[name='firstName']")?.value || "").trim();
  const phone = String(form.querySelector("[name='phone']")?.value || "").trim();
  const email = String(form.querySelector("[name='email']")?.value || "").trim();
  const bio = String(form.querySelector("[name='bio']")?.value || "").trim();
  const photoFile = form.querySelector("[name='photo']")?.files?.[0] || null;

  if (!lastName || !firstName) {
    alert("Прізвище та ім'я тренера обов'язкові.");
    return;
  }

  let photoDataUrl = null;
  if (photoFile) {
    if (!isValidCoachPhotoFile(photoFile)) {
      return;
    }
    photoDataUrl = await readCoachPhotoDataUrl(photoFile);
  }

  const coach = createCoachRecord(lastName, firstName, clubId, { phone, email, bio, photoDataUrl });
  state.coaches.push(coach);
  selectedClubsView = "profile";
  selectedClubDetailTab = "coaches";
  selectedClubProfileId = clubId;
  form.reset();
  saveAndRender();
}

function deleteClub(clubId) {
  const club = state.clubs.find((item) => item.id === clubId);
  if (!club) {
    return;
  }

  const playersCount = state.playerBase.filter((player) => player.clubId === clubId).length;
  const coachesCount = state.coaches.filter((coach) => coach.clubId === clubId).length;
  const message = `Видалити клуб "${club.name}"? Гравці стануть незалежними, тренери будуть відв'язані.`;
  if ((playersCount > 0 || coachesCount > 0) && !confirm(message)) {
    return;
  }
  if (playersCount === 0 && coachesCount === 0 && !confirm(`Видалити клуб "${club.name}"?`)) {
    return;
  }

  state.clubs = state.clubs.filter((item) => item.id !== clubId);
  for (const coach of state.coaches) {
    if (coach.clubId === clubId) {
      coach.clubId = "";
    }
  }
  for (const player of state.playerBase) {
    if (player.clubId === clubId) {
      player.clubId = "";
      player.coachId = "";
      syncBasePlayerChangesToCurrentTournament(player.id);
    }
  }
  if (selectedClubProfileId === clubId) {
    selectedClubProfileId = null;
  }
  saveAndRender();
}

function submitAttachExistingPlayerToClubForm(form) {
  const clubId = normalizeEntityId(form.dataset.clubId);
  const playerId = normalizeEntityId(form.querySelector("[name='existingPlayerId']")?.value || "");
  const coachId = normalizeEntityId(form.querySelector("[name='coachId']")?.value || "");
  const club = state.clubs.find((item) => item.id === clubId);
  const player = state.playerBase.find((item) => item.id === playerId);

  if (!club) {
    alert("Клуб не знайдено.");
    return;
  }

  if (!player) {
    alert("Оберіть гравця з бази.");
    return;
  }

  player.clubId = club.id;
  player.coachId = coachId;
  syncBasePlayerChangesToCurrentTournament(player.id);
  selectedClubsView = "profile";
  selectedClubDetailTab = "players";
  selectedClubProfileId = club.id;
  selectedClubPlayerProfileId = player.id;
  form.reset();
  saveAndRender();
}

function removeBasePlayerFromClub(playerId) {
  const player = state.playerBase.find((item) => item.id === playerId);
  if (!player) {
    return;
  }

  if (!confirm(`Відв'язати ${getBaseFullName(player)} від клубу?`)) {
    return;
  }

  player.clubId = "";
  player.coachId = "";
  syncBasePlayerChangesToCurrentTournament(player.id);
  if (selectedClubPlayerProfileId === player.id) {
    selectedClubPlayerProfileId = null;
  }
  saveAndRender();
}

function editClubPlayerInBase(playerId) {
  const player = state.playerBase.find((item) => item.id === playerId);
  if (!player) {
    return;
  }

  state.activeTab = "players";
  saveAndRender();
  startEditBasePlayer(playerId);
}

function openTournamentFromPlayerProfile(tournamentId) {
  const id = normalizeEntityId(tournamentId);
  if (!id) {
    return;
  }

  if (state.currentTournament?.id === id) {
    state.activeTab = "tournament";
    state.tournamentView = "table";
    saveAndRender();
    return;
  }

  const archived = state.tournamentsArchive.find((item) => item.id === id);
  if (!archived) {
    alert("Турнір для переходу не знайдено в архіві.");
    return;
  }

  state.activeTab = "archive";
  state.archivePreviewTournamentId = id;
  saveAndRender();
}
