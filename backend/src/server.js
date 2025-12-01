// backend/src/server.js
const express = require("express");
const cors = require("cors");
const { PORT } = require("./config/env");

// Rotas
const authRoutes = require("./routes/auth");
const sensorsRoutes = require("./routes/sensors");
const actuatorsRoutes = require("./routes/actuators");
const logsRoutes = require("./routes/logs");
const indicatorsRoutes = require("./routes/indicators");

// Inicialização
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas públicas
app.use("/auth", authRoutes);

// Rotas protegidas (middlewares de autenticação são internos às rotas)
app.use("/api/sensors", sensorsRoutes());
app.use("/api/actuator", actuatorsRoutes());
app.use("/api/logs", logsRoutes);
app.use("/api/indicators", indicatorsRoutes);

// Rota simples para testar backend
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "SmartFarm Backend Online" });
});

// Inicializar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});