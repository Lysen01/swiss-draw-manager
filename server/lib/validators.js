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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return null;
  }
  return v;
}

module.exports = {
  asSafeString,
  asLongString,
  asUuidOrNull,
  asRating,
  asGender,
  asDateOrNull,
};
