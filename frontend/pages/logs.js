import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/logs");
        const json = await res.json();
        if (json.ok) setLogs(json.logs);
      } catch (e) {
        // ignore
      }
    }
    load();
  }, []);

  return (
    <>
      <NavBar />
      <div className="container">
        <h1>Logs</h1>
        <ProtectedRoute roles={["aluno", "professor"]}>
          <div className="card">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr><th>Usuário</th><th>Ação</th><th>Payload</th><th>Resultado</th><th>ts</th></tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.user}</td>
                    <td>{l.action}</td>
                    <td style={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.payload}</td>
                    <td style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.result}</td>
                    <td>{l.ts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ProtectedRoute>
      </div>
    </>
  );
}