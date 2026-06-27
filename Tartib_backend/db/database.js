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
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source     TEXT    NOT NULL,
      amount     REAL    NOT NULL,
      date       TEXT    NOT NULL,
      status     TEXT    DEFAULT 'kutilmoqda',
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
  await db.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority   TEXT DEFAULT 'medium';`);
  await db.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_time TEXT;`);
  await db.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_time   TEXT;`);
  console.log('NeonDB (PostgreSQL) bazasi tayyor');
}
