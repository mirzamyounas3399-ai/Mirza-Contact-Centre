import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../../data/nexus.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      avatar TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('text', 'voice', 'image', 'video', 'file')),
      timestamp INTEGER NOT NULL,
      read INTEGER DEFAULT 0,
      file_name TEXT,
      file_size TEXT,
      mime_type TEXT,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
  `);

  // Call signals table (for WebRTC signaling persistence)
  db.exec(`
    CREATE TABLE IF NOT EXISTS call_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_id TEXT NOT NULL,
      to_id TEXT NOT NULL,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      processed INTEGER DEFAULT 0,
      FOREIGN KEY (from_id) REFERENCES users(id),
      FOREIGN KEY (to_id) REFERENCES users(id)
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_call_signals_to ON call_signals(to_id, processed);
  `);

  console.log('✅ Database initialized successfully');
}

export default db;
