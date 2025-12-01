const express = require('express');
const db = require('../db/sqlite');
module.exports = (ESP32_BASE) => {
  const router = express.Router();

  // exemplo: POST { cmd: "LED", value: "ON" }
  router.post('/', async (req, res) => {
    const { cmd, value, user } = req.body;
    if (!cmd) return res.status(400).json({ error: 'cmd required' });

    const url = `${ESP32_BASE}/actuator?cmd=${encodeURIComponent(cmd)}${value ? '&value='+encodeURIComponent(value) : ''}`;

    const maxRetries = 3;
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      try {
        attempt++;
        const resp = await fetch(url, { timeout: 3000 });
        const text = await resp.text();
        // salvar log
        db.prepare('INSERT INTO logs (user, action, payload, result) VALUES (?, ?, ?, ?)')
          .run(user || 'anon', 'actuator', JSON.stringify({cmd, value}), text);
        return res.json({ ok: true, status: resp.status, result: text });
      } catch (e) {
        lastError = e;
        // backoff simples
        await new Promise(r => setTimeout(r, 200 * attempt));
      }
    }

    db.prepare('INSERT INTO logs (user, action, payload, result) VALUES (?, ?, ?, ?)')
      .run(user || 'anon', 'actuator_error', JSON.stringify({cmd, value}), lastError.message);
    return res.status(504).json({ ok: false, error: lastError.message });
  });

  return router;
};
