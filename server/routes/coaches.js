const express = require('express');
const { query } = require('../lib/db');
const { asSafeString, asLongString, asUuidOrNull } = require('../lib/validators');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, last_name, first_name, club_id, phone, email, bio, photo_url, created_at, updated_at
       FROM coaches
       ORDER BY last_name ASC, first_name ASC`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const id = asUuidOrNull(req.body.id);
    const lastName = asSafeString(req.body.last_name || req.body.lastName, 80);
    const firstName = asSafeString(req.body.first_name || req.body.firstName, 80);
    const clubId = asUuidOrNull(req.body.club_id || req.body.clubId);
    const phone = asSafeString(req.body.phone, 80);
    const email = asSafeString(req.body.email, 120);
    const bio = asSafeString(req.body.bio || req.body.description || req.body.info, 700);
    const photoUrl = asLongString(req.body.photo_url || req.body.photoUrl) || null;

    if (!lastName || !firstName) {
      return res.status(400).json({ error: 'last_name та first_name обовʼязкові' });
    }

    const result = await query(
      `INSERT INTO coaches (id, last_name, first_name, club_id, phone, email, bio, photo_url)
       VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, last_name, first_name, club_id, phone, email, bio, photo_url, created_at, updated_at`,
      [id, lastName, firstName, clubId, phone, email, bio, photoUrl]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);
    const lastName = asSafeString(req.body.last_name || req.body.lastName, 80);
    const firstName = asSafeString(req.body.first_name || req.body.firstName, 80);
    const clubId = asUuidOrNull(req.body.club_id || req.body.clubId);
    const phone = asSafeString(req.body.phone, 80);
    const email = asSafeString(req.body.email, 120);
    const bio = asSafeString(req.body.bio || req.body.description || req.body.info, 700);
    const photoUrl = asLongString(req.body.photo_url || req.body.photoUrl) || null;

    if (!lastName || !firstName) {
      return res.status(400).json({ error: 'last_name та first_name обовʼязкові' });
    }

    const result = await query(
      `UPDATE coaches
       SET last_name = $2,
           first_name = $3,
           club_id = $4,
           phone = $5,
           email = $6,
           bio = $7,
           photo_url = $8,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, last_name, first_name, club_id, phone, email, bio, photo_url, created_at, updated_at`,
      [id, lastName, firstName, clubId, phone, email, bio, photoUrl]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Тренера не знайдено' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);
    await query('UPDATE players SET coach_id = NULL WHERE coach_id = $1', [id]);
    const result = await query('DELETE FROM coaches WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Тренера не знайдено' });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
