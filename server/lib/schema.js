const { query } = require('./db');

async function ensureSchema() {
  await query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS players (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 0,
      gender TEXT NOT NULL DEFAULT '',
      rank TEXT NOT NULL DEFAULT 'б/р',
      birth_date DATE,
      photo_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_players_last_first ON players (last_name, first_name);

    ALTER TABLE players ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT '';
    ALTER TABLE players ADD COLUMN IF NOT EXISTS club_id UUID;
    ALTER TABLE players ADD COLUMN IF NOT EXISTS coach_id UUID;

    CREATE TABLE IF NOT EXISTS clubs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '',
      contact TEXT NOT NULL DEFAULT '',
      logo_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE clubs ADD COLUMN IF NOT EXISTS logo_url TEXT;

    CREATE TABLE IF NOT EXISTS coaches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs (name);
    CREATE INDEX IF NOT EXISTS idx_coaches_club_id ON coaches (club_id);
    CREATE INDEX IF NOT EXISTS idx_players_club_id ON players (club_id);
    CREATE INDEX IF NOT EXISTS idx_players_coach_id ON players (coach_id);

    CREATE TABLE IF NOT EXISTS tournaments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      format TEXT NOT NULL DEFAULT 'swiss',
      rounds_count INTEGER NOT NULL DEFAULT 1,
      current_round INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      event_date DATE,
      time_control TEXT,
      chief_judge TEXT,
      photo_url TEXT,
      tie_break_order JSONB NOT NULL DEFAULT '[]'::jsonb,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      archived_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments (status);
    CREATE INDEX IF NOT EXISTS idx_tournaments_created_at ON tournaments (created_at DESC);
  `);
}

module.exports = { ensureSchema };
