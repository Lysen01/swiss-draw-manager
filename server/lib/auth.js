const crypto = require('crypto');
const { query } = require('./db');

const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || 30);
const PBKDF2_ITERATIONS = 120000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';
const COMPROMISED_DEFAULT_ADMIN_EMAIL = 'admin@arbiter.local';
const COMPROMISED_DEFAULT_ADMIN_PASSWORD = 'admin12345';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isCompromisedDefaultAdminCredentials(email, password) {
  return (
    normalizeEmail(email) === COMPROMISED_DEFAULT_ADMIN_EMAIL &&
    String(password || '') === COMPROMISED_DEFAULT_ADMIN_PASSWORD
  );
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

async function hardenCompromisedDefaultAdmin() {
  const compromisedEmail = normalizeEmail(COMPROMISED_DEFAULT_ADMIN_EMAIL);
  const result = await query(
    `SELECT id, email, password_hash, password_salt
     FROM users
     WHERE lower(email) = $1
     LIMIT 1`,
    [compromisedEmail]
  );
  if (result.rowCount === 0) {
    return;
  }

  const user = result.rows[0];
  const isCompromisedPassword = verifyPassword(COMPROMISED_DEFAULT_ADMIN_PASSWORD, user.password_salt, user.password_hash);
  if (!isCompromisedPassword) {
    return;
  }

  await query('DELETE FROM user_sessions WHERE user_id = $1::uuid', [user.id]);

  const requestedEmail = normalizeEmail(process.env.ADMIN_EMAIL || '');
  const requestedPassword = String(process.env.ADMIN_PASSWORD || '');
  const hasSecurePassword = requestedPassword.length >= 12 && requestedPassword !== COMPROMISED_DEFAULT_ADMIN_PASSWORD;

  if (!hasSecurePassword) {
    // eslint-disable-next-line no-console
    console.error(
      '[security] compromised default admin detected. Login with admin@arbiter.local/admin12345 is blocked. Set ADMIN_PASSWORD (12+ chars) and restart to rotate safely.'
    );
    return;
  }

  let nextEmail = user.email;
  if (requestedEmail && requestedEmail !== compromisedEmail) {
    const duplicate = await query('SELECT id FROM users WHERE lower(email) = $1 AND id <> $2::uuid LIMIT 1', [requestedEmail, user.id]);
    if (duplicate.rowCount === 0) {
      nextEmail = requestedEmail;
    }
  }

  const salt = generateSalt();
  const hash = hashPassword(requestedPassword, salt);
  await query(
    `UPDATE users
     SET email = $1,
         password_hash = $2,
         password_salt = $3,
         is_active = TRUE,
         updated_at = NOW()
     WHERE id = $4::uuid`,
    [nextEmail, hash, salt, user.id]
  );
  await query('DELETE FROM user_sessions WHERE user_id = $1::uuid', [user.id]);
  // eslint-disable-next-line no-console
  console.warn(`[security] rotated compromised default admin account: ${nextEmail}`);
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
  const email = normalizeEmail(process.env.ADMIN_EMAIL || '');
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to bootstrap the first super admin');
  }
  if (isCompromisedDefaultAdminCredentials(email, password)) {
    throw new Error('Refusing to bootstrap with compromised default admin credentials');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters for bootstrap');
  }
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
  isCompromisedDefaultAdminCredentials,
  extractBearerToken,
  createSessionForUser,
  removeSessionByToken,
  getSessionUser,
  hardenCompromisedDefaultAdmin,
  ensureDefaultSuperAdmin,
};
