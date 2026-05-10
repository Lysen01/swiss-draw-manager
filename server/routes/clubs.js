const express = require('express');
const { query } = require('../lib/db');
const { asSafeString, asLongString, asUuidOrNull } = require('../lib/validators');
const { requireRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, city, contact, description, logo_url, created_at, updated_at
       FROM clubs
       ORDER BY name ASC`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireRoles(['super_admin', 'admin']), async (req, res, next) => {
  try {
    const id = asUuidOrNull(req.body.id);
    const name = asSafeString(req.body.name, 140);
    const city = asSafeString(req.body.city, 80);
    const contact = asSafeString(req.body.contact, 180);
    const description = asSafeString(req.body.description || req.body.info, 700);
    const logoUrl = asLongString(req.body.logo_url || req.body.logoUrl) || null;

    if (!name) {
      return res.status(400).json({ error: 'name обовʼязковий' });
    }

    const result = await query(
      `INSERT INTO clubs (id, name, city, contact, description, logo_url)
       VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6)
       RETURNING id, name, city, contact, description, logo_url, created_at, updated_at`,
      [id, name, city, contact, description, logoUrl]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', requireRoles(['super_admin', 'admin']), async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);
    const name = asSafeString(req.body.name, 140);
    const city = asSafeString(req.body.city, 80);
    const contact = asSafeString(req.body.contact, 180);
    const description = asSafeString(req.body.description || req.body.info, 700);
    const logoUrl = asLongString(req.body.logo_url || req.body.logoUrl) || null;

    if (!name) {
      return res.status(400).json({ error: 'name обовʼязковий' });
    }

    const result = await query(
      `UPDATE clubs
       SET name = $2, city = $3, contact = $4, description = $5, logo_url = $6, updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, city, contact, description, logo_url, created_at, updated_at`,
      [id, name, city, contact, description, logoUrl]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Клуб не знайдено' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireRoles(['super_admin', 'admin']), async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);
    await query('UPDATE players SET club_id = NULL, coach_id = NULL WHERE club_id = $1', [id]);
    await query('UPDATE coaches SET club_id = NULL WHERE club_id = $1', [id]);
    const result = await query('DELETE FROM clubs WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Клуб не знайдено' });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
