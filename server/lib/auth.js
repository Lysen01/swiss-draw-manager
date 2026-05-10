const crypto = require('crypto');
const { query } = require('./db');

const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || 30);
const PBKDF2_ITERATIONS = 120000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || ''), 'utf8').digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), String(salt || ''), PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString('hex');
}

function verifyPassword(password, salt, expectedHash) {
  const actual = hashPassword(password, salt);
  const actualBuf = Buffer.from(actual, 'hex');
  const expectedBuf = Buffer.from(String(expectedHash || ''), 'hex');
  if (actualBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

function extractBearerToken(req) {
  const raw = String(req.headers.authorization || '').trim();
  if (!raw) {
    return null;
  }
  const [scheme, token] = raw.split(/\s+/, 2);
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }
  return token;
}

async function createSessionForUser(userId) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const result = await query(
    `INSERT INTO user_sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2::uuid, NOW() + ($3::text || ' days')::interval)
     RETURNING expires_at`,
    [tokenHash, userId, String(SESSION_TTL_DAYS)]
  );
  return {
    token,
    expiresAt: result.rows[0]?.expires_at || null,
  };
}

async function removeSessionByToken(token) {
  if (!token) {
    return;
  }
  await query('DELETE FROM user_sessions WHERE token_hash = $1', [hashToken(token)]);
}

async function getSessionUser(token) {
  if (!token) {
    return null;
  }
  const tokenHash = hashToken(token);
  const result = await query(
    `SELECT
       s.token_hash,
       u.id,
       u.email,
       u.role,
       u.first_name,
       u.last_name,
       u.city_id,
       c.name AS city_name
     FROM user_sessions s
     INNER JOIN users u ON u.id = s.user_id
     LEFT JOIN cities c ON c.id = u.city_id
     WHERE s.token_hash = $1
       AND s.expires_at > NOW()
       AND u.is_active = TRUE
     LIMIT 1`,
    [tokenHash]
  );
  if (result.rowCount === 0) {
    return null;
  }
  await query('UPDATE user_sessions SET last_seen_at = NOW() WHERE token_hash = $1', [tokenHash]);
  return result.rows[0];
}

async function ensureDefaultSuperAdmin() {
  const existingUsers = await query('SELECT id FROM users LIMIT 1');
  if (existingUsers.rowCount > 0) {
    return;
  }

  const cityResult = await query(
    `INSERT INTO cities (name, region)
     VALUES ('Київ', 'м. Київ')
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`
  );
  const cityId = cityResult.rows[0]?.id || null;
  const email = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@arbiter.local');
  const password = String(process.env.ADMIN_PASSWORD || 'admin12345');
  const firstName = String(process.env.ADMIN_FIRST_NAME || 'Головний');
  const lastName = String(process.env.ADMIN_LAST_NAME || 'Адміністратор');
  const salt = generateSalt();
  const hash = hashPassword(password, salt);

  await query(
    `INSERT INTO users (email, password_hash, password_salt, role, first_name, last_name, city_id, is_active)
     VALUES ($1, $2, $3, 'super_admin', $4, $5, $6::uuid, TRUE)`,
    [email, hash, salt, firstName, lastName, cityId]
  );
  // eslint-disable-next-line no-console
  console.log(`[auth] default super admin created: ${email}`);
}

module.exports = {
  normalizeEmail,
  hashPassword,
  verifyPassword,
  extractBearerToken,
  createSessionForUser,
  removeSessionByToken,
  getSessionUser,
  ensureDefaultSuperAdmin,
};

