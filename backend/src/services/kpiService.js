exports.calculateDailyMoistureAvg = (history) => {
  if (!history.length) return 0;
  const sum = history.reduce((acc, h) => acc + h.soil, 0);
  return Number((sum / history.length).toFixed(2));
};

exports.calculateIrrigationHours = (history) => {
  const events = history.filter((h) => h.water === "ON");
  return Number((events.length * 2 / 3600).toFixed(2)); // polling 2s
};