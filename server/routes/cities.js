const express = require('express');
const { query } = require('../lib/db');
const { asSafeString, asUuidOrNull } = require('../lib/validators');
const { requireRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, region, is_active, created_at, updated_at
       FROM cities
       WHERE is_active = TRUE
       ORDER BY name ASC`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireRoles(['super_admin']), async (req, res, next) => {
  try {
    const id = asUuidOrNull(req.body.id);
    const name = asSafeString(req.body.name, 120);
    const region = asSafeString(req.body.region, 120);

    if (!name) {
      return res.status(400).json({ error: 'Назва міста обовʼязкова' });
    }

    const result = await query(
      `INSERT INTO cities (id, name, region)
       VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3)
       RETURNING id, name, region, is_active, created_at, updated_at`,
      [id, name, region]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (String(error.message || '').includes('duplicate key')) {
      return res.status(409).json({ error: 'Таке місто вже існує' });
    }
    return next(error);
  }
});

module.exports = router;

