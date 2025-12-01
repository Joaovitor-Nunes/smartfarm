export default function ActuatorControl({ name, command }) {
  async function sendCmd(value) {
    await fetch("http://localhost:3001/api/actuator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cmd: command, value, user: "aluno" })
    });
  }

  return (
    <div className="card">
      <h3>{name}</h3>
      <button onClick={() => sendCmd("ON")}>Ligar</button>
      <button onClick={() => sendCmd("OFF")} style={{ marginLeft: 10 }}>Desligar</button>
    </div>
  );
}