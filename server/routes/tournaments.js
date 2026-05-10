const express = require('express');
const { query } = require('../lib/db');
const { asSafeString, asLongString, asUuidOrNull, asDateOrNull } = require('../lib/validators');
const { requireRoles, canManageTournament } = require('../middleware/auth');

const router = express.Router();

const baseSelect = `SELECT id, name, format, rounds_count, current_round, status,
                           owner_admin_id, city_id, is_public,
                           event_date, time_control, chief_judge, photo_url,
                           tie_break_order, payload, created_at, updated_at, archived_at
                    FROM tournaments`;

function buildListQueryForUser(user) {
  if (!user || user.role === 'viewer') {
    return {
      sql: `${baseSelect} WHERE is_public = TRUE ORDER BY created_at DESC`,
      params: [],
    };
  }
  if (user.role === 'super_admin') {
    return {
      sql: `${baseSelect} ORDER BY created_at DESC`,
      params: [],
    };
  }
  return {
    sql: `${baseSelect} WHERE owner_admin_id = $1::uuid OR is_public = TRUE ORDER BY created_at DESC`,
    params: [user.id],
  };
}

function assertCanReadTournament(user, row) {
  if (!row) {
    return false;
  }
  if (row.is_public) {
    return true;
  }
  if (!user) {
    return false;
  }
  if (user.role === 'super_admin') {
    return true;
  }
  return user.role === 'admin' && row.owner_admin_id === user.id;
}

router.get('/', async (req, res, next) => {
  try {
    const q = buildListQueryForUser(req.user || null);
    const result = await query(q.sql, q.params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);
    const result = await query(`${baseSelect} WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Турнір не знайдено' });
    }

    const row = result.rows[0];
    if (!assertCanReadTournament(req.user || null, row)) {
      return res.status(403).json({ error: 'Немає доступу до цього турніру' });
    }

    return res.json(row);
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireRoles(['super_admin', 'admin']), async (req, res, next) => {
  try {
    const id = asUuidOrNull(req.body.id);
    const name = asSafeString(req.body.name, 180) || 'Новий турнір';
    const format = req.body.format === 'round_robin' ? 'round_robin' : 'swiss';
    const roundsCount = Math.max(1, Number(req.body.rounds_count || req.body.roundsCount || 1));
    const currentRound = Math.max(0, Number(req.body.current_round || req.body.currentRound || 0));
    const status = asSafeString(req.body.status || 'active', 32) || 'active';
    const eventDate = asDateOrNull(req.body.event_date || req.body.eventDate);
    const timeControl = asSafeString(req.body.time_control || req.body.timeControl, 64) || null;
    const chiefJudge = asSafeString(req.body.chief_judge || req.body.chiefJudge, 120) || null;
    const photoUrl = asLongString(req.body.photo_url || req.body.photoUrl) || null;
    const tieBreakOrder = Array.isArray(req.body.tie_break_order || req.body.tieBreakOrder)
      ? req.body.tie_break_order || req.body.tieBreakOrder
      : [];
    const payload = req.body.payload && typeof req.body.payload === 'object' ? req.body.payload : {};
    const rawOwnerAdminId = asUuidOrNull(req.body.owner_admin_id || req.body.ownerAdminId);
    const ownerAdminId = req.user.role === 'super_admin' ? rawOwnerAdminId || req.user.id : req.user.id;
    const cityId = asUuidOrNull(req.body.city_id || req.body.cityId) || req.user.cityId || null;
    const isPublic = req.body.is_public !== false && req.body.isPublic !== false;

    const result = await query(
      `INSERT INTO tournaments (
        id, name, format, rounds_count, current_round, status,
        owner_admin_id, city_id, is_public,
        event_date, time_control, chief_judge, photo_url,
        tie_break_order, payload
      ) VALUES (
        COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6,
        $7::uuid, $8::uuid, $9,
        $10, $11, $12, $13,
        $14::jsonb, $15::jsonb
      )
      RETURNING id, name, format, rounds_count, current_round, status,
                owner_admin_id, city_id, is_public,
                event_date, time_control, chief_judge, photo_url,
                tie_break_order, payload, created_at, updated_at, archived_at`,
      [
        id,
        name,
        format,
        roundsCount,
        currentRound,
        status,
        ownerAdminId,
        cityId,
        Boolean(isPublic),
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

router.put('/:id', requireRoles(['super_admin', 'admin']), async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);

    const current = await query(
      `SELECT id, owner_admin_id, is_public
       FROM tournaments
       WHERE id = $1`,
      [id]
    );
    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'Турнір не знайдено' });
    }
    const currentRow = current.rows[0];
    if (!canManageTournament(req.user, currentRow)) {
      return res.status(403).json({ error: 'Немає прав для редагування цього турніру' });
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
      photoUrl: asLongString(req.body.photo_url || req.body.photoUrl),
      tieBreakOrder: Array.isArray(req.body.tie_break_order || req.body.tieBreakOrder)
        ? req.body.tie_break_order || req.body.tieBreakOrder
        : null,
      payload: req.body.payload && typeof req.body.payload === 'object' ? req.body.payload : null,
      archivedAt: req.body.archived_at || req.body.archivedAt || null,
      cityId: asUuidOrNull(req.body.city_id || req.body.cityId),
      isPublic:
        req.body.is_public === undefined && req.body.isPublic === undefined
          ? null
          : req.body.is_public !== false && req.body.isPublic !== false,
      ownerAdminId:
        req.user.role === 'super_admin'
          ? asUuidOrNull(req.body.owner_admin_id || req.body.ownerAdminId)
          : req.user.id,
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
           city_id = COALESCE($14::uuid, city_id),
           is_public = COALESCE($15, is_public),
           owner_admin_id = COALESCE($16::uuid, owner_admin_id),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, format, rounds_count, current_round, status,
                 owner_admin_id, city_id, is_public,
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
        patch.cityId,
        patch.isPublic,
        patch.ownerAdminId,
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireRoles(['super_admin', 'admin']), async (req, res, next) => {
  try {
    const id = asSafeString(req.params.id, 64);
    const current = await query('SELECT id, owner_admin_id, is_public FROM tournaments WHERE id = $1', [id]);
    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'Турнір не знайдено' });
    }
    if (!canManageTournament(req.user, current.rows[0])) {
      return res.status(403).json({ error: 'Немає прав для видалення цього турніру' });
    }

    await query('DELETE FROM tournaments WHERE id = $1', [id]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

