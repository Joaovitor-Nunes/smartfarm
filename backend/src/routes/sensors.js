const express = require("express");
const esp32 = require("../services/esp32Service");
const db = require("../db/sqlite");

module.exports = () => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const data = await esp32.getSensors();
      // data deve ser um objeto com vários sensores, ex: { temperature: 24.5, soil: 40, light: 120, ... }
      // Persistir leituras relevantes na tabela sensor_readings
      const now = new Date().toISOString();
      try {
        for (const [k, v] of Object.entries(data)) {
          // Apenas inserimos valores numéricos (evita inserir metadata)
          if (typeof v === "number") {
            db.prepare("INSERT INTO sensor_readings (sensor_name, value, raw, ts) VALUES (?, ?, ?, ?)")
              .run(k, v, JSON.stringify(v), now);
          }
        }
      } catch (e) {
        // log mas não falhar a resposta
        db.prepare("INSERT INTO logs (user, action, payload, result) VALUES (?, ?, ?, ?)")
          .run('system', 'persist_sensor', JSON.stringify(data), e.message);
      }

      return res.json({ ok: true, data, ts: now });
    } catch (err) {
      return res.status(502).json({ ok: false, error: err.message });
    }
  });

  return router;
};