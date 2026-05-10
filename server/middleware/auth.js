const { extractBearerToken, getSessionUser } = require('../lib/auth');

function shapeUser(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    cityId: row.city_id || null,
    cityName: row.city_name || '',
    fullName: `${row.last_name || ''} ${row.first_name || ''}`.trim() || row.email,
  };
}

async function attachAuthUser(req, _res, next) {
  try {
    const token = extractBearerToken(req);
    req.authToken = token || null;
    req.user = null;
    if (!token) {
      return next();
    }
    const userRow = await getSessionUser(token);
    req.user = shapeUser(userRow);
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Потрібна авторизація' });
  }
  return next();
}

function requireRoles(roles) {
  const allowed = new Set(Array.isArray(roles) ? roles : []);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Потрібна авторизація' });
    }
    if (!allowed.has(req.user.role)) {
      return res.status(403).json({ error: 'Недостатньо прав доступу' });
    }
    return next();
  };
}

function canManageTournament(user, tournamentRow) {
  if (!user || !tournamentRow) {
    return false;
  }
  if (user.role === 'super_admin') {
    return true;
  }
  return user.role === 'admin' && tournamentRow.owner_admin_id === user.id;
}

module.exports = {
  attachAuthUser,
  requireAuth,
  requireRoles,
  canManageTournament,
};

