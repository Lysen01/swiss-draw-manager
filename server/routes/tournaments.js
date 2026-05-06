const express = require('express');
const { query } = require('../lib/db');
const { asSafeString, asDateOrNull } = require('../lib/validators');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, format, rounds_count, current_round, status,
              event_date, time_control, chief_judge, photo_url,
              tie_break_order, payload, created_at, updated_at, archived_at
       FROM tournaments
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);
    const result = await query(
      `SELECT id, name, format, rounds_count, current_round, status,
              event_date, time_control, chief_judge, photo_url,
              tie_break_order, payload, created_at, updated_at, archived_at
       FROM tournaments
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Турнір не знайдено' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const name = asSafeString(req.body.name, 180) || 'Новий турнір';
    const format = req.body.format === 'round_robin' ? 'round_robin' : 'swiss';
    const roundsCount = Math.max(1, Number(req.body.rounds_count || req.body.roundsCount || 1));
    const currentRound = Math.max(0, Number(req.body.current_round || req.body.currentRound || 0));
    const status = asSafeString(req.body.status || 'active', 32) || 'active';
    const eventDate = asDateOrNull(req.body.event_date || req.body.eventDate);
    const timeControl = asSafeString(req.body.time_control || req.body.timeControl, 64) || null;
    const chiefJudge = asSafeString(req.body.chief_judge || req.body.chiefJudge, 120) || null;
    const photoUrl = asSafeString(req.body.photo_url || req.body.photoUrl, 2000) || null;

    const tieBreakOrder = Array.isArray(req.body.tie_break_order || req.body.tieBreakOrder)
      ? req.body.tie_break_order || req.body.tieBreakOrder
      : [];

    const payload = req.body.payload && typeof req.body.payload === 'object' ? req.body.payload : {};

    const result = await query(
      `INSERT INTO tournaments (
        name, format, rounds_count, current_round, status,
        event_date, time_control, chief_judge, photo_url,
        tie_break_order, payload
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10::jsonb, $11::jsonb
      )
      RETURNING id, name, format, rounds_count, current_round, status,
                event_date, time_control, chief_judge, photo_url,
                tie_break_order, payload, created_at, updated_at, archived_at`,
      [
        name,
        format,
        roundsCount,
        currentRound,
        status,
        eventDate,
        timeControl,
        chiefJudge,
        photoUrl,
        JSON.stringify(tieBreakOrder),
        JSON.stringify(payload),
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);

    const current = await query('SELECT id FROM tournaments WHERE id = $1', [id]);
    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'Турнір не знайдено' });
    }

    const patch = {
      name: asSafeString(req.body.name, 180),
      format: req.body.format === 'round_robin' ? 'round_robin' : req.body.format === 'swiss' ? 'swiss' : null,
      roundsCount: Number.isFinite(Number(req.body.rounds_count || req.body.roundsCount))
        ? Math.max(1, Number(req.body.rounds_count || req.body.roundsCount))
        : null,
      currentRound: Number.isFinite(Number(req.body.current_round || req.body.currentRound))
        ? Math.max(0, Number(req.body.current_round || req.body.currentRound))
        : null,
      status: asSafeString(req.body.status, 32),
      eventDate: asDateOrNull(req.body.event_date || req.body.eventDate),
      timeControl: asSafeString(req.body.time_control || req.body.timeControl, 64),
      chiefJudge: asSafeString(req.body.chief_judge || req.body.chiefJudge, 120),
      photoUrl: asSafeString(req.body.photo_url || req.body.photoUrl, 2000),
      tieBreakOrder: Array.isArray(req.body.tie_break_order || req.body.tieBreakOrder)
        ? req.body.tie_break_order || req.body.tieBreakOrder
        : null,
      payload: req.body.payload && typeof req.body.payload === 'object' ? req.body.payload : null,
      archivedAt: req.body.archived_at || req.body.archivedAt || null,
    };

    const result = await query(
      `UPDATE tournaments
       SET name = COALESCE(NULLIF($2, ''), name),
           format = COALESCE($3, format),
           rounds_count = COALESCE($4, rounds_count),
           current_round = COALESCE($5, current_round),
           status = COALESCE(NULLIF($6, ''), status),
           event_date = COALESCE($7, event_date),
           time_control = COALESCE(NULLIF($8, ''), time_control),
           chief_judge = COALESCE(NULLIF($9, ''), chief_judge),
           photo_url = COALESCE(NULLIF($10, ''), photo_url),
           tie_break_order = COALESCE($11::jsonb, tie_break_order),
           payload = COALESCE($12::jsonb, payload),
           archived_at = COALESCE($13::timestamptz, archived_at),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, format, rounds_count, current_round, status,
                 event_date, time_control, chief_judge, photo_url,
                 tie_break_order, payload, created_at, updated_at, archived_at`,
      [
        id,
        patch.name,
        patch.format,
        patch.roundsCount,
        patch.currentRound,
        patch.status,
        patch.eventDate,
        patch.timeControl,
        patch.chiefJudge,
        patch.photoUrl,
        patch.tieBreakOrder ? JSON.stringify(patch.tieBreakOrder) : null,
        patch.payload ? JSON.stringify(patch.payload) : null,
        patch.archivedAt,
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);
    const result = await query('DELETE FROM tournaments WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Турнір не знайдено' });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
