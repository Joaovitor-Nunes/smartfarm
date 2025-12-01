const Database = require('better-sqlite3');
const db = new Database(__dirname + '/../../data/smartfarm.db');

// Inicializar tabelas (execute uma vez)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT
);
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  action TEXT,
  payload TEXT,
  result TEXT,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// create default user (aluno / professor) — faça hash na criação real
module.exports = db;
