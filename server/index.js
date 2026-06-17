import express from 'express';
import cors from 'cors';
import { readdir, stat } from 'node:fs/promises';
import { join, resolve, extname, basename } from 'node:path';
import { createReadStream } from 'node:fs';
import { homedir } from 'node:os';

let Database;
try {
  Database = (await import('better-sqlite3')).default;
} catch { /* better-sqlite3 not installed, using JSON fallback */ }

let musicMetaData;
try {
  musicMetaData = (await import('music-metadata'));
} catch { /* music-metadata not installed */ }

const app = express();
const PORT = process.env.PORT || 3100;
const SAMPLES_DIR = process.env.SAMPLES_DIR || homedir() + '/Samples';

app.use(cors());
app.use(express.json());

// --- SQLite or JSON storage ---
let db = null;

function initDB() {
  if (!Database) return;
  try {
    db = new Database('samplevault.db');
    db.exec(`
      CREATE TABLE IF NOT EXISTS samples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        format TEXT,
        duration REAL,
        size INTEGER,
        bpm REAL,
        key_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sample_tags (
        sample_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (sample_id, tag_id),
        FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS favorites (
        sample_id INTEGER PRIMARY KEY,
        FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE
      );
    `);
  } catch (err) {
    console.warn('DB init failed, using in-memory store:', err.message);
    db = null;
  }
}

// JSON fallback
let jsonStore = { samples: [], tags: [], favorites: [], sample_tags: [] };
let jsonIdCounter = 1;

initDB();

// --- API Routes ---

// Scan directory for samples
app.get('/api/scan', async (req, res) => {
  const dir = req.query.dir || SAMPLES_DIR;
  try {
    const entries = await readdir(dir);
    const samples = [];
    const audioExts = new Set(['.wav', '.mp3', '.flac', '.ogg', '.aiff', '.aif']);

    for (const entry of entries) {
      const ext = extname(entry).toLowerCase();
      if (!audioExts.has(ext)) continue;

      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);
      if (!stats.isFile()) continue;

      let duration = null;
      let bpm = null;
      let keyName = null;

      if (musicMetaData) {
        try {
          const meta = await musicMetaData.parseFile(fullPath);
          duration = meta.format.duration;
          if (meta.common.key) keyName = meta.common.key;
          if (meta.common.bpm) bpm = meta.common.bpm;
        } catch { /* ignore parse errors */ }
      }

      samples.push({
        name: entry,
        path: fullPath,
        format: ext.slice(1),
        duration,
        size: stats.size,
        bpm,
        key: keyName,
      });
    }

    res.json({ samples, total: samples.length, directory: dir });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stream audio file
app.get('/api/audio', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'path required' });

  const resolvedPath = resolve(filePath);
  if (!resolvedPath.startsWith(resolve(SAMPLES_DIR))) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const ext = extname(resolvedPath).toLowerCase();
    const mimeMap = { '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.flac': 'audio/flac', '.ogg': 'audio/ogg', '.aiff': 'audio/aiff', '.aif': 'audio/aiff' };
    res.setHeader('Content-Type', mimeMap[ext] || 'audio/wav');
    createReadStream(resolvedPath).pipe(res);
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Get all samples metadata
app.get('/api/samples', (req, res) => {
  if (db) {
    const rows = db.prepare(`
      SELECT s.*, GROUP_CONCAT(t.name) as tags
      FROM samples s
      LEFT JOIN sample_tags st ON s.id = st.sample_id
      LEFT JOIN tags t ON st.tag_id = t.id
      GROUP BY s.id
    `).all();
    return res.json(rows);
  }
  res.json(jsonStore.samples);
});

// Add/edit sample
app.post('/api/samples', (req, res) => {
  const { path, name, format, duration, size, bpm, key } = req.body;
  if (db) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO samples (path, name, format, duration, size, bpm, key_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(path, name, format, duration, size, bpm, key);
    return res.json({ id: result.lastInsertRowid });
  }

  const existing = jsonStore.samples.findIndex((s) => s.path === path);
  const entry = { id: jsonIdCounter++, path, name, format, duration, size, bpm, key };
  if (existing >= 0) {
    jsonStore.samples[existing] = { ...jsonStore.samples[existing], ...entry };
  } else {
    jsonStore.samples.push(entry);
  }
  res.json(entry);
});

// Get tags
app.get('/api/tags', (req, res) => {
  if (db) {
    const rows = db.prepare('SELECT * FROM tags').all();
    return res.json(rows);
  }
  res.json(jsonStore.tags);
});

// Add tag
app.post('/api/tags', (req, res) => {
  const { name } = req.body;
  if (db) {
    const stmt = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
    stmt.run(name);
    return res.json({ name });
  }
  if (!jsonStore.tags.find((t) => t.name === name)) {
    jsonStore.tags.push({ id: jsonStore.tags.length + 1, name });
  }
  res.json({ name });
});

app.listen(PORT, () => {
  console.log(`SampleVault server running on http://localhost:${PORT}`);
  console.log(`Scanned directory: ${SAMPLES_DIR}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err.message);
  process.exit(1);
});
