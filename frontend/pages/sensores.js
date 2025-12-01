import { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import SensorCard from "../components/SensorCard";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

export default function Sensores() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]); // array de {t:timestamp, temperature, soil, light}
  const [status, setStatus] = useState("offline");

  useEffect(() => {
    let mounted = true;
    async function fetchSensors() {
      try {
        const res = await fetch("/api/sensors");
        const json = await res.json();
        if (!mounted) return;
        if (json.ok) {
          setData(json.data);
          setStatus("online");
          const entry = { t: Date.now(), ...json.data };
          setHistory(h => {
            const newH = [...h, entry];
            return newH.slice(-3600); // guardar até 3600 amostras
          });
        } else {
          setStatus("offline");
        }
      } catch (e) {
        setStatus("offline");
      }
    }
    fetchSensors();
    const id = setInterval(fetchSensors, 2000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const tempHistory = history.map(h => ({ x: new Date(h.t), y: h.temperature }));
  const soilHistory = history.map(h => ({ x: new Date(h.t), y: h.soil }));

  const chartData = {
    datasets: [
      { label: "Temperatura (°C)", data: tempHistory, borderWidth: 2, fill: false },
      { label: "Umidade do Solo (%)", data: soilHistory, borderWidth: 2, fill: false }
    ]
  };

  const options = { parsing: false, scales: { x: { type: 'time', time: { unit: 'minute' } } } };

  return (
    <>
      <NavBar />
      <div className="container">
        <h1>Sensores</h1>
        <p>Status da conexão: <strong>{status}</strong></p>

        {data ? (
          <>
            <SensorCard title="Temperatura" value={data.temperature} unit="°C" status={status} />
            <SensorCard title="Umidade do Solo" value={data.soil} unit="%" status={status} />
            <SensorCard title="Luminosidade" value={data.light} unit="lx" status={status} />

            <div className="card">
              <h3>Histórico (Temperatura e Umidade)</h3>
              <Line data={chartData} options={options} />
            </div>
          </>
        ) : (
          <p>Carregando leituras...</p>
        )}
      </div>
    </>
  );
}