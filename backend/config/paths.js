const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// DATA_DIR lets the database and uploads live outside the project folder.
// Cloud-synced folders (OneDrive, Dropbox) lock and roll back SQLite files,
// causing silent data loss — point DATA_DIR somewhere unsynced, e.g. C:\sla3li-data
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, '..');

const dbDir = path.join(dataDir, 'db');
const uploadsDir = path.join(dataDir, 'uploads');

fs.mkdirSync(dbDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

module.exports = {
  dataDir,
  dbPath: path.join(dbDir, 'sla3li.db'),
  uploadsDir,
};
