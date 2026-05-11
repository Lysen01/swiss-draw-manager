function asSafeString(value, max = 255) {
  return String(value || '').trim().slice(0, max);
}

function asLongString(value, max = 11000000) {
  return String(value || '').trim().slice(0, max);
}

function asUuidOrNull(value) {
  const text = asSafeString(value, 64).toLowerCase();
  if (!text) {
    return null;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(text) ? text : null;
}

function asRating(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return Math.max(0, Math.min(4000, Math.round(n)));
}

function asGender(value) {
  return value === 'M' || value === 'F' ? value : '';
}

function asDateOrNull(value) {
  const v = String(value || '').trim();
  if (!v) {
    return null;
  }

  // ISO date.
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return v;
  }

  // ISO datetime.
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
    return v.slice(0, 10);
  }

  // UI date format: DD.MM.YYYY or D.M.YYYY
  const dotMatch = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const day = Number(dotMatch[1]);
    const month = Number(dotMatch[2]);
    const year = Number(dotMatch[3]);
    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    const yyyy = String(year).padStart(4, '0');
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    const probe = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(probe.getTime())) {
      return null;
    }
    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) {
      return null;
    }
    return iso;
  }

  return null;
}

module.exports = {
  asSafeString,
  asLongString,
  asUuidOrNull,
  asRating,
  asGender,
  asDateOrNull,
};
