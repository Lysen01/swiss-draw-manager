const express = require('express');
const { query } = require('../lib/db');
const { asSafeString, asUuidOrNull } = require('../lib/validators');
const { normalizeEmail, hashPassword, verifyPassword, createSessionForUser, removeSessionByToken } = require('../lib/auth');
const { requireAuth, requireRoles } = require('../middleware/auth');

const router = express.Router();

function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    cityId: row.city_id || null,
    cityName: row.city_name || '',
    fullName: `${row.last_name || ''} ${row.first_name || ''}`.trim() || row.email,
    isActive: Boolean(row.is_active),
  };
}

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'Email та пароль обовʼязкові' });
    }

    const result = await query(
      `SELECT
         u.id, u.email, u.password_hash, u.password_salt, u.role, u.first_name, u.last_name, u.city_id, u.is_active,
         c.name AS city_name
       FROM users u
       LEFT JOIN cities c ON c.id = u.city_id
       WHERE lower(u.email) = $1
       LIMIT 1`,
      [email]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    const user = result.rows[0];
    if (!user.is_active || !verifyPassword(password, user.password_salt, user.password_hash)) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    const session = await createSessionForUser(user.id);
    return res.json({
      token: session.token,
      expiresAt: session.expiresAt,
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await removeSessionByToken(req.authToken);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

router.get('/users', requireRoles(['super_admin']), async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT
         u.id, u.email, u.role, u.first_name, u.last_name, u.city_id, u.is_active, u.created_at, u.updated_at,
         c.name AS city_name
       FROM users u
       LEFT JOIN cities c ON c.id = u.city_id
       ORDER BY u.created_at DESC`
    );
    return res.json(result.rows.map(toPublicUser));
  } catch (error) {
    return next(error);
  }
});

router.post('/users', requireRoles(['super_admin']), async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const roleRaw = asSafeString(req.body.role, 24);
    const role = roleRaw === 'super_admin' || roleRaw === 'admin' || roleRaw === 'viewer' ? roleRaw : 'admin';
    const firstName = asSafeString(req.body.first_name || req.body.firstName, 80);
    const lastName = asSafeString(req.body.last_name || req.body.lastName, 80);
    const cityId = asUuidOrNull(req.body.city_id || req.body.cityId);
    const isActive = req.body.is_active !== false;

    if (!email || !password || password.length < 8) {
      return res.status(400).json({ error: 'Потрібні email та пароль (мінімум 8 символів)' });
    }

    const salt = require('crypto').randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const result = await query(
      `INSERT INTO users (email, password_hash, password_salt, role, first_name, last_name, city_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7::uuid, $8)
       RETURNING id, email, role, first_name, last_name, city_id, is_active`,
      [email, passwordHash, salt, role, firstName, lastName, cityId, Boolean(isActive)]
    );

    return res.status(201).json(toPublicUser(result.rows[0]));
  } catch (error) {
    if (String(error.message || '').includes('duplicate key')) {
      return res.status(409).json({ error: 'Користувач з таким email вже існує' });
    }
    return next(error);
  }
});

module.exports = router;

