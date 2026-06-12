// Async database adapter.
// - Turso (hosted libSQL) when TURSO_DATABASE_URL is set — survives Render
//   redeploys/restarts, whose local disk is wiped every time
// - Local SQLite file via node:sqlite otherwise — zero-setup local dev
//
// Interface (all async): db.prepare(sql).get(...args) / .all(...args) / .run(...args),
// db.exec(sql), and db.ready (promise that resolves once schema is in place).
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let backend;

if (process.env.TURSO_DATABASE_URL) {
  const { createClient } = require('@libsql/client');
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const toObjects = (rs) => rs.rows.map(row => Object.fromEntries(rs.columns.map((c, i) => [c, row[i]])));
  backend = {
    name: 'turso',
    exec: (sql) => client.executeMultiple(sql),
    get: async (sql, args) => toObjects(await client.execute({ sql, args }))[0],
    all: async (sql, args) => toObjects(await client.execute({ sql, args })),
    run: async (sql, args) => {
      const rs = await client.execute({ sql, args });
      return { lastInsertRowid: Number(rs.lastInsertRowid ?? 0), changes: rs.rowsAffected };
    },
  };
} else {
  const { DatabaseSync } = require('node:sqlite');
  const { dbPath } = require('../config/paths');
  const sqlite = new DatabaseSync(dbPath);

  sqlite.exec("PRAGMA journal_mode=WAL");
  sqlite.exec("PRAGMA foreign_keys=ON");

  // Merge WAL into the main db file regularly so data never lives only in the
  // journal — limits damage if files are copied/synced/restored externally.
  sqlite.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  setInterval(() => {
    try { sqlite.exec("PRAGMA wal_checkpoint(TRUNCATE)"); } catch {}
  }, 60_000).unref();

  backend = {
    name: 'local',
    exec: async (sql) => sqlite.exec(sql),
    get: async (sql, args) => sqlite.prepare(sql).get(...args),
    all: async (sql, args) => sqlite.prepare(sql).all(...args),
    run: async (sql, args) => {
      const r = sqlite.prepare(sql).run(...args);
      return { lastInsertRowid: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
  };
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ar TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('wholesaler','retailer','driver','admin')),
    phone TEXT,
    wilaya TEXT,
    address TEXT,
    business_name TEXT,
    business_name_ar TEXT,
    is_approved INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    avatar TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    icon TEXT DEFAULT '📦',
    parent_id INTEGER REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wholesaler_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    price REAL NOT NULL,
    min_order_qty INTEGER DEFAULT 1,
    unit TEXT DEFAULT 'piece',
    unit_ar TEXT DEFAULT 'قطعة',
    stock_qty INTEGER DEFAULT 0,
    images TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id INTEGER NOT NULL REFERENCES users(id),
    wholesaler_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT DEFAULT 'pending',
    total_amount REAL NOT NULL,
    notes TEXT,
    delivery_address TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    driver_id INTEGER REFERENCES users(id),
    pickup_address TEXT,
    delivery_address TEXT,
    status TEXT DEFAULT 'pending',
    estimated_time TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_ar TEXT,
    message TEXT NOT NULL,
    message_ar TEXT,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(retailer_id, product_id)
  );
`;

async function init() {
  await backend.exec(SCHEMA);

  // Migration: add document columns if they don't exist yet
  for (const col of ['id_image', 'license_image', 'gray_card_image']) {
    try { await backend.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT DEFAULT ''`); } catch {}
  }

  // Migration: ensure new categories exist
  for (const [name, name_ar, icon] of [
    ['Hardware & Tools', 'أدوات ومعدات', '🔧'],
    ['Accessories',      'إكسسوارات',    '👜'],
  ]) {
    const exists = await backend.get('SELECT id FROM categories WHERE name = ?', [name]);
    if (!exists) await backend.run('INSERT INTO categories (name, name_ar, icon) VALUES (?,?,?)', [name, name_ar, icon]);
  }

  console.log(`Database ready (${backend.name})`);
}

const ready = init();

module.exports = {
  ready,
  backendName: backend.name,
  prepare: (sql) => ({
    get: async (...args) => { await ready; return backend.get(sql, args); },
    all: async (...args) => { await ready; return backend.all(sql, args); },
    run: async (...args) => { await ready; return backend.run(sql, args); },
  }),
  exec: async (sql) => { await ready; return backend.exec(sql); },
};
