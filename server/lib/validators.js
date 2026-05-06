function asSafeString(value, max = 255) {
  return String(value || '').trim().slice(0, max);
}

function asRating(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return Math.max(0, Math.min(4000, Math.round(n)));
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
  asRating,
  asDateOrNull,
};
