const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middlewares/auth");

const router = express.Router();

/**
 * GET / => { ok: true, kpis: { avg_soil_last_24h, irrigation_hours_last_24h } }
 */
router.get("/", auth, (req, res) => {
  try {
    // Média de umidade do solo nas últimas 24 horas
    const avgSoil = db.prepare(`
      SELECT AVG(value) as avg FROM sensor_readings
      WHERE sensor_name = 'soil' AND ts >= datetime('now', '-24 hours')
    `).get().avg || 0;

    // Contar eventos de irrigação: assumimos que atuador WATER liga e gera log em logs (ACTUATOR) com payload.
    // Como alternativa, podemos inferir por leituras de 'water' se existir.
    // Vamos contar logs de comandos WATER ON nas últimas 24h e multiplicar por um tempo médio (ex: 5 min) — 
    // Ideal: se houver timestamps de ON/OFF, computar duracao, mas aqui simplificamos.

    const waterOnCount = db.prepare(`
      SELECT COUNT(*) as c FROM logs
      WHERE action = 'ACTUATOR' AND payload LIKE '%"cmd":"WATER"%' AND ts >= datetime('now','-24 hours')
    `).get().c || 0;

    // Assumimos 5 minutos por evento como estimativa (0.0833 horas)
    const irrigation_hours = Number((waterOnCount * 5 / 60).toFixed(2));

    res.json({ ok: true, kpis: { avg_soil_last_24h: Number(avgSoil.toFixed(2)), irrigation_hours } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;