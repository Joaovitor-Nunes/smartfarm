export default function KPIBox({ title, value, unit }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value} {unit}</p>
    </div>
  );
}