const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/sqlite");
const { JWT_SECRET } = require("../config/env");

const router = express.Router();

router.post("/register", (req, res) => {
  const { username, password, role } = req.body;

  const hash = bcrypt.hashSync(password, 10);

  try {
    db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
      .run(username, hash, role);

    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Usuário já existe" });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

  if (!bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: "Senha incorreta" });

  const token = jwt.sign(
    { user: username, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token });
});

module.exports = router;