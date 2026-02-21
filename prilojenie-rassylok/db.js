const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

// Настройка таблиц
db.exec(`
  CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    body TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    channels TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    recipient_count INTEGER DEFAULT 0,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Сохранить/обновить настройку
function setSetting(key, value) {
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

// Получить настройку
function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

// Сохранить черновик
function saveDraft(title, body) {
  const existing = db.prepare('SELECT id FROM drafts LIMIT 1').get();
  if (existing) {
    db.prepare('UPDATE drafts SET title = ?, body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(title, body, existing.id);
    return existing.id;
  } else {
    const result = db.prepare('INSERT INTO drafts (title, body) VALUES (?, ?)').run(title, body);
    return result.lastInsertRowid;
  }
}

// Получить черновик
function getDraft() {
  return db.prepare('SELECT * FROM drafts LIMIT 1').get() || null;
}

// Сохранить в историю
function addHistory(title, body, channels, recipientCount) {
  const result = db.prepare(`
    INSERT INTO history (title, body, channels, recipient_count)
    VALUES (?, ?, ?, ?)
  `).run(title, body, JSON.stringify(channels), recipientCount);
  return result.lastInsertRowid;
}

// Получить историю
function getHistory(limit = 50) {
  return db.prepare('SELECT * FROM history ORDER BY sent_at DESC LIMIT ?').all(limit);
}

module.exports = { setSetting, getSetting, saveDraft, getDraft, addHistory, getHistory };
