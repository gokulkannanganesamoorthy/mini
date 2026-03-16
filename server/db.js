import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let db

export function getDB() {
  return db
}

export function initDB() {
  db = new Database(path.join(__dirname, '../mini.db'))
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'todo',
      bucket TEXT DEFAULT 'today',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      tag TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alarm (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT DEFAULT '07:00',
      enabled INTEGER DEFAULT 1,
      message TEXT DEFAULT 'Good morning Gokul!'
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      contact TEXT NOT NULL,
      contact_name TEXT,
      direction TEXT NOT NULL,
      body TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      read INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_number TEXT,
      from_number TEXT,
      direction TEXT,
      duration INTEGER,
      status TEXT,
      transcript TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT UNIQUE,
      title TEXT,
      start_time TEXT,
      end_time TEXT,
      account TEXT,
      color TEXT,
      location TEXT,
      description TEXT,
      synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Seed default alarm if empty
  const alarm = db.prepare('SELECT COUNT(*) as c FROM alarm').get()
  if (alarm.c === 0) {
    db.prepare('INSERT INTO alarm (time, enabled, message) VALUES (?, ?, ?)').run(
      '07:00', 1, 'Good morning Gokul! Rise and shine.'
    )
  }

  // Seed default settings
  const defaultSettings = [
    ['assistant_name', 'Mini'],
    ['user_name', 'Gokul'],
    ['auto_reply', '0'],
    ['esp32_connected', '0'],
  ]
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
  defaultSettings.forEach(([k, v]) => insertSetting.run(k, v))

  // Seed demo memories
  const memCount = db.prepare('SELECT COUNT(*) as c FROM memories').get()
  if (memCount.c === 0) {
    const seeds = [
      ['Gokul runs Luno Tech, a software agency', 'work'],
      ['Gokul studies at PSG College of Technology, B.Tech IT (2024–2027)', 'education'],
      ['Gokul wakes up at 7:00 AM', 'routine'],
      ['Gokul prefers dark-themed, modern, interactive web designs', 'preference'],
      ['Gokul rides a Suzuki Access scooter', 'personal'],
      ['Gokul composes instrumental Tamil music inspired by Govind Vasantha', 'personal'],
      ['Gokul works at Orrayson Studio as a web developer', 'work'],
      ['Gokul is building VulnScan, a web penetration testing tool', 'project'],
    ]
    const ins = db.prepare('INSERT INTO memories (content, tag) VALUES (?, ?)')
    seeds.forEach(([c, t]) => ins.run(c, t))
  }

  // Seed demo tasks
  const taskCount = db.prepare('SELECT COUNT(*) as c FROM tasks').get()
  if (taskCount.c === 0) {
    const tasks = [
      ['Work on VulnScan XSS scanner module', 'Implement XSS detection', null, 'high', 'todo', 'today'],
      ['Submit college assignment', 'IT lab assignment submission', null, 'high', 'todo', 'today'],
      ['Review Orrayson Studio project', null, null, 'medium', 'todo', 'today'],
      ['Plan social media content calendar', null, null, 'medium', 'todo', 'week'],
      ['Explore GSoC project ideas', null, null, 'low', 'todo', 'someday'],
    ]
    const ins = db.prepare('INSERT INTO tasks (title, description, due_date, priority, status, bucket) VALUES (?, ?, ?, ?, ?, ?)')
    tasks.forEach(t => ins.run(...t))
  }

  console.log('\x1b[32m✓ Database initialized\x1b[0m')
  return db
}
