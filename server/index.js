require('dotenv').config();

const express = require('express');
const path = require('path');
const { query, closePool } = require('./lib/db');
const { ensureSchema } = require('./lib/schema');
const playersRouter = require('./routes/players');
const clubsRouter = require('./routes/clubs');
const coachesRouter = require('./routes/coaches');
const tournamentsRouter = require('./routes/tournaments');

const app = express();
const PORT = Number(process.env.PORT || 10000);
const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_ENTRY = path.join(ROOT_DIR, 'index.html');
app.set('trust proxy', true);

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set(
    [
      'https://swiss-draw-manager.onrender.com',
      process.env.RENDER_EXTERNAL_URL,
      ...configuredOrigins,
    ].filter(Boolean)
  )
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const requestProtocol = req.headers['x-forwarded-proto'] || req.protocol;
  const requestOrigin = `${requestProtocol}://${req.get('host')}`;
  const allowOrigin =
    !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || origin === requestOrigin;

  if (!allowOrigin) {
    return next(new Error('CORS blocked'));
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json({ limit: '12mb' }));
app.use(express.static(ROOT_DIR, { index: false }));

app.get('/api/health', async (_req, res) => {
  try {
    const result = await query('SELECT NOW() AS now');
    return res.json({ ok: true, db: true, now: result.rows[0].now });
  } catch (error) {
    return res.status(500).json({ ok: false, db: false, error: error.message });
  }
});

app.use('/api/players', playersRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/coaches', coachesRouter);
app.use('/api/tournaments', tournamentsRouter);
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

const sendFrontend = (_req, res) => {
  res.sendFile(FRONTEND_ENTRY);
};

app.get('/', sendFrontend);
app.get('*', sendFrontend);

app.use((error, req, res, _next) => {
  console.error('[api-error]', error);
  const status = error.message === 'CORS blocked' ? 403 : 500;
  const message = status === 403 ? 'CORS blocked' : 'Внутрішня помилка сервера';

  if (req.path.startsWith('/api')) {
    return res.status(status).json({ error: message });
  }

  return res.status(status).send(message);
});

async function start() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  await ensureSchema();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[api] listening on :${PORT}`);
  });
}

start().catch((error) => {
  console.error('[startup-error]', error);
  closePool().finally(() => process.exit(1));
});
