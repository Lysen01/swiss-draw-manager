require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { query, closePool } = require('./lib/db');
const { ensureSchema } = require('./lib/schema');
const playersRouter = require('./routes/players');
const tournamentsRouter = require('./routes/tournaments');

const app = express();
const PORT = Number(process.env.PORT || 10000);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS blocked'));
    },
  })
);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    const result = await query('SELECT NOW() AS now');
    return res.json({ ok: true, db: true, now: result.rows[0].now });
  } catch (error) {
    return res.status(500).json({ ok: false, db: false, error: error.message });
  }
});

app.use('/api/players', playersRouter);
app.use('/api/tournaments', tournamentsRouter);

app.use((error, _req, res, _next) => {
  console.error('[api-error]', error);
  const status = error.message === 'CORS blocked' ? 403 : 500;
  res.status(status).json({ error: status === 403 ? 'CORS blocked' : 'Внутрішня помилка сервера' });
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
