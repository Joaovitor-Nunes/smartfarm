const express = require("express");
const esp32 = require("../services/esp32Service");

module.exports = () => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const data = await esp32.getSensors();
      res.json({ ok: true, data });
    } catch (err) {
      res.status(502).json({ ok: false, error: err.message });
    }
  });

  return router;
};