import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DB_PATH || './tartib.db';

let db;

export function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDB() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT    UNIQUE NOT NULL,
      password   TEXT    NOT NULL,
      first_name TEXT    DEFAULT '',
      last_name  TEXT    DEFAULT '',
      profession TEXT    DEFAULT '',
      bio        TEXT    DEFAULT '',
      xp         INTEGER DEFAULT 0,
      level      INTEGER DEFAULT 1,
      created_at TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      text       TEXT    NOT NULL,
      completed  INTEGER DEFAULT 0,
      category   TEXT    DEFAULT 'Boshqa',
      due_date   TEXT,
      created_at TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      source     TEXT    NOT NULL,
      amount     REAL    NOT NULL,
      date       TEXT    NOT NULL,
      status     TEXT    DEFAULT 'kutilmoqda',
      created_at TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL,
      mode         TEXT    NOT NULL,
      duration_min INTEGER NOT NULL,
      completed_at TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      date       TEXT    NOT NULL,
      time       TEXT    NOT NULL DEFAULT '',
      title      TEXT    NOT NULL,
      created_at TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id             INTEGER UNIQUE NOT NULL,
      notifications       INTEGER DEFAULT 1,
      sound_alerts        INTEGER DEFAULT 1,
      auto_break          INTEGER DEFAULT 0,
      focus_mode          INTEGER DEFAULT 1,
      focus_length        INTEGER DEFAULT 25,
      short_break_length  INTEGER DEFAULT 5,
      long_break_length   INTEGER DEFAULT 15,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('SQLite bazasi tayyor:', DB_PATH);
}
