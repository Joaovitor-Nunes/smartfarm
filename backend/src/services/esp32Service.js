const fetch = require("node-fetch");
const { ESP32_BASE } = require("../config/env");

exports.getSensors = async () => {
  const res = await fetch(`${ESP32_BASE}/sensors`, { timeout: 3000 });
  if (!res.ok) throw new Error(`ESP32 HTTP ${res.status}`);
  return await res.json();
};

exports.sendActuatorCommand = async (cmd, value) => {
  const url =
    `${ESP32_BASE}/actuator?cmd=${encodeURIComponent(cmd)}` +
    (value ? `&value=${encodeURIComponent(value)}` : "");

  const res = await fetch(url, { timeout: 3000 });
  const text = await res.text();
  return { status: res.status, text };
};