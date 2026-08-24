import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

let pool;
export function getDB() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function initDB() {
  const db = getDB();
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      email      TEXT    UNIQUE NOT NULL,
      password   TEXT    NOT NULL,
      first_name TEXT    DEFAULT '',
      last_name  TEXT    DEFAULT '',
      profession TEXT    DEFAULT '',
      bio        TEXT    DEFAULT '',
      xp         INTEGER DEFAULT 0,
      level      INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      reason TEXT DEFAULT '',
      start_date TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
      progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
      estimated_hours NUMERIC(6,2) DEFAULT 0,
      current_state TEXT DEFAULT '',
      target_state TEXT DEFAULT '',
      daily_minutes INTEGER DEFAULT 60,
      weekly_days INTEGER DEFAULT 5,
      ai_generated BOOLEAN DEFAULT FALSE,
      duration_minutes INTEGER DEFAULT 0,
      strategy TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS goal_milestones (
      id SERIAL PRIMARY KEY,
      goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
      deadline TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS goal_daily_plans (
      id SERIAL PRIMARY KEY,
      goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_date TEXT NOT NULL,
      available_minutes INTEGER NOT NULL,
      planned_minutes INTEGER DEFAULT 0,
      summary TEXT DEFAULT '',
      tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
      status TEXT DEFAULT 'preview' CHECK (status IN ('preview', 'confirmed', 'replaced')),
      ai_generated BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(goal_id, plan_date)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text       TEXT    NOT NULL,
      completed  BOOLEAN DEFAULT FALSE,
      category   TEXT    DEFAULT 'Boshqa',
      due_date   TEXT,
      priority   TEXT    DEFAULT 'medium',
      start_time TEXT,
      end_time   TEXT,
      goal_id    INTEGER REFERENCES goals(id) ON DELETE SET NULL,
      milestone_id INTEGER,
      ai_generated BOOLEAN DEFAULT FALSE,

      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source     TEXT    NOT NULL,
      amount     REAL    NOT NULL,
      date       TEXT    NOT NULL,
      type       TEXT    DEFAULT 'kirim',
      status     TEXT    DEFAULT 'bajarildi',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mode         TEXT    NOT NULL,
      duration_min INTEGER NOT NULL,
      completed_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date       TEXT    NOT NULL,
      time       TEXT    NOT NULL DEFAULT '',
      title      TEXT    NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS habits (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      emoji      TEXT DEFAULT '⭐',
      color      TEXT DEFAULT '#6366f1',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS habit_checkins (
      id       SERIAL PRIMARY KEY,
      habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date     TEXT NOT NULL,
      UNIQUE(habit_id, date)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id                  SERIAL PRIMARY KEY,
      user_id             INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      notifications       BOOLEAN DEFAULT TRUE,
      sound_alerts        BOOLEAN DEFAULT TRUE,
      auto_break          BOOLEAN DEFAULT FALSE,
      focus_mode          BOOLEAN DEFAULT TRUE,
      focus_length        INTEGER DEFAULT 25,
      short_break_length  INTEGER DEFAULT 5,
      long_break_length   INTEGER DEFAULT 15
    );
  `);
  // Mavjud jadvalga priority ustuni qo'shish (agar yo'q bo'lsa)
  await db.query(`ALTER TABLE tasks         ADD COLUMN IF NOT EXISTS priority   TEXT DEFAULT 'medium';`);
  await db.query(`ALTER TABLE transactions  ADD COLUMN IF NOT EXISTS type       TEXT DEFAULT 'kirim';`);
  await db.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_time TEXT;`);
  await db.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_time   TEXT;`);
  await db.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS goal_id INTEGER;`);
  await db.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id INTEGER;`);
  await db.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;`);
  await db.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;`);
  await db.query(`ALTER TABLE goal_milestones ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(6,2) DEFAULT 0;`);
  await db.query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS strategy TEXT DEFAULT '';`);
  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan             TEXT DEFAULT 'free';`);
  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at  TIMESTAMPTZ;`);
  console.log('NeonDB (PostgreSQL) bazasi tayyor');
}
