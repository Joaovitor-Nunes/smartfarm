import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";

export default function Indicadores() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/indicators" /* se no backend for /api/indicators */);
        const json = await res.json();
        if (json.ok) setKpis(json.kpis || json.kpis || json.kpis || json.kpis);
        else setKpis(null);
      } catch (e) {
        setKpis(null);
      }
    }
    load();
  }, []);

  return (
    <>
      <NavBar />
      <div className="container">
        <h1>Indicadores</h1>
        {kpis ? (
          <>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="card"><h3>Média Umidade 24h</h3><p style={{fontSize:20}}>{kpis.avg_soil_last_24h}%</p></div>
              <div className="card"><h3>Horas de Irrigação (24h)</h3><p style={{fontSize:20}}>{kpis.irrigation_hours} h</p></div>
            </div>
            {/* Gráfico simples: poderia mostrar series — deixamos como melhoria futura */}
          </>
        ) : <p>Carregando indicadores...</p>}
      </div>
    </>
  );
}