const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middlewares/auth");

const router = express.Router();

// Retorna últimos N logs
router.get("/", auth, (req, res) => {
  try {
    // professor e aluno podem ver logs
    const rows = db.prepare("SELECT id, user, action, payload, result, ts FROM logs ORDER BY ts DESC LIMIT 200").all();
    res.json({ ok: true, logs: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;