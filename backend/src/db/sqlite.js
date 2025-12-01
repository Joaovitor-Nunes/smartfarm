const Database = require("better-sqlite3");
const path = require("path");
const dbPath = path.resolve(__dirname, "../../data/smartfarm.db");
const db = new Database(dbPath);

// Cria tabelas se não existirem
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT
);

CREATE TABLE IF NOT EXISTS logs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  action TEXT,
  payload TEXT,
  result TEXT,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_name TEXT,
  value REAL,
  raw TEXT,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// função utilitária para seed inicial (se não existir usuário)
const row = db.prepare("SELECT COUNT(*) as c FROM users").get();
if (row.c === 0) {
  const bcrypt = require("bcryptjs");
  const alunoHash = bcrypt.hashSync("aluno123", 10);
  const profHash = bcrypt.hashSync("prof123", 10);
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
    .run("aluno", alunoHash, "aluno");
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
    .run("professor", profHash, "professor");
  console.log("Seeded default users: aluno / professor");
}

module.exports = db;