export default function SensorCard({ title, value, unit, status }) {
  const statusColor = status === "online" ? "green" : "red";

  return (
    <div className="card">
      <h3>{title}</h3>
      <p><strong>Valor:</strong> {value} {unit}</p>
      <p><strong>Status:</strong> <span style={{ color: statusColor }}>{status}</span></p>
    </div>
  );
}