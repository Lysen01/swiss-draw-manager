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
        rank,
        birthDate,
        photoDataUrl: photoDataUrl || null,
      })
    );
  }

  resetBasePlayerForm();
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
  els.basePlayerPhoto.value = "";
  els.basePlayerRemovePhoto.checked = false;
  els.basePlayerSubmitBtn.textContent = "Зберегти зміни";
  els.basePlayerCancelEditBtn.hidden = false;
  els.baseEditHint.hidden = false;
  els.baseEditHint.textContent = `Редагування: ${getBaseFullName(base)}. Поля: Прізвище, Ім'я, Рейтинг, Стать, Спортивне звання, Дата народження, Фото.`;
  els.basePlayerForm.scrollIntoView({ behavior: "smooth", block: "center" });
  els.basePlayerLastName.focus();
}

function resetBasePlayerForm() {
  editingBasePlayerId = null;
  els.basePlayerForm.reset();
  els.basePlayerGender.value = "";
  els.basePlayerRank.value = "б/р";
  els.basePlayerRemovePhoto.checked = false;
  els.basePlayerSubmitBtn.textContent = "Додати в базу";
  els.basePlayerCancelEditBtn.hidden = true;
  els.baseEditHint.hidden = true;
  els.baseEditHint.textContent = "";
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

function optimizeImageDataUrl(dataUrl, options) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = options.maxSide || 1280;
      const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * ratio));
      const height = Math.max(1, Math.round(img.naturalHeight * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = options.qualityStart || 0.86;
      const qualityMin = options.qualityMin || 0.52;
      const targetBytes = options.targetBytes || MAX_TOURNAMENT_PHOTO_STORE_BYTES;
      let output = canvas.toDataURL("image/jpeg", quality);

      while (estimateDataUrlBytes(output) > targetBytes && quality > qualityMin) {
        quality = Math.max(qualityMin, quality - 0.08);
        output = canvas.toDataURL("image/jpeg", quality);
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
    return `• ${h.tournamentName} | ${formatDate(h.finishedAt)} | місце ${h.place ?? "-"} | очки ${Number(h.score).toFixed(1)} | суперники: ${opponents}`;
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
      })
    );
  }

  normalizeRoundsCountForCurrentFormat(t);
  saveAndRender();
}
