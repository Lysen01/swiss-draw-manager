const express = require('express');
const { query } = require('../lib/db');
const { asSafeString, asLongString, asUuidOrNull, asRating, asGender, asDateOrNull } = require('../lib/validators');
const { requireRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const search = asSafeString(req.query.search || '', 100);
    if (!search) {
      const result = await query(
        `SELECT id, last_name, first_name, rating, gender, club_id, coach_id, rank, birth_date, photo_url, created_at, updated_at
         FROM players
         ORDER BY last_name ASC, first_name ASC`
      );
      return res.json(result.rows);
    }

    const token = `%${search.toLowerCase()}%`;
    const result = await query(
      `SELECT id, last_name, first_name, rating, gender, club_id, coach_id, rank, birth_date, photo_url, created_at, updated_at
       FROM players
       WHERE lower(last_name) LIKE $1 OR lower(first_name) LIKE $1 OR CAST(rating AS TEXT) LIKE $1
       ORDER BY last_name ASC, first_name ASC`,
      [token]
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireRoles(['super_admin', 'admin']), async (req, res, next) => {
  try {
    const id = asUuidOrNull(req.body.id);
    const lastName = asSafeString(req.body.last_name || req.body.lastName, 120);
    const firstName = asSafeString(req.body.first_name || req.body.firstName, 120);
    const rating = asRating(req.body.rating);
    const gender = asGender(req.body.gender);
    const clubId = asUuidOrNull(req.body.club_id || req.body.clubId);
    const coachId = asUuidOrNull(req.body.coach_id || req.body.coachId);
    const rank = asSafeString(req.body.rank || 'б/р', 32) || 'б/р';
    const birthDate = asDateOrNull(req.body.birth_date || req.body.birthDate);
    const photoUrl = asLongString(req.body.photo_url || req.body.photoUrl) || null;

    if (!lastName || !firstName) {
      return res.status(400).json({ error: 'last_name та first_name обов\'язкові' });
    }

    const result = await query(
      `INSERT INTO players (id, last_name, first_name, rating, gender, club_id, coach_id, rank, birth_date, photo_url)
       VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, last_name, first_name, rating, gender, club_id, coach_id, rank, birth_date, photo_url, created_at, updated_at`,
      [id, lastName, firstName, rating, gender, clubId, coachId, rank, birthDate, photoUrl]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', requireRoles(['super_admin', 'admin']), async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);
    const lastName = asSafeString(req.body.last_name || req.body.lastName, 120);
    const firstName = asSafeString(req.body.first_name || req.body.firstName, 120);
    const rating = asRating(req.body.rating);
    const gender = asGender(req.body.gender);
    const clubId = asUuidOrNull(req.body.club_id || req.body.clubId);
    const coachId = asUuidOrNull(req.body.coach_id || req.body.coachId);
    const rank = asSafeString(req.body.rank || 'б/р', 32) || 'б/р';
    const birthDate = asDateOrNull(req.body.birth_date || req.body.birthDate);
    const photoUrl = asLongString(req.body.photo_url || req.body.photoUrl) || null;

    if (!lastName || !firstName) {
      return res.status(400).json({ error: 'last_name та first_name обов\'язкові' });
    }

    const result = await query(
      `UPDATE players
       SET last_name = $2,
           first_name = $3,
           rating = $4,
           gender = $5,
           club_id = $6,
           coach_id = $7,
           rank = $8,
           birth_date = $9,
           photo_url = $10,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, last_name, first_name, rating, gender, club_id, coach_id, rank, birth_date, photo_url, created_at, updated_at`,
      [id, lastName, firstName, rating, gender, clubId, coachId, rank, birthDate, photoUrl]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Гравця не знайдено' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireRoles(['super_admin', 'admin']), async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);
    const result = await query('DELETE FROM players WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Гравця не знайдено' });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
