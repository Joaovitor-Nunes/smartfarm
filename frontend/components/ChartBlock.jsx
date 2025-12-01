import { Line } from "react-chartjs-2";

export default function ChartBlock({ label, history }) {
  const data = {
    labels: history.map(h => new Date(h.t).toLocaleTimeString()),
    datasets: [
      {
        label,
        data: history.map(h => h.value),
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="card">
      <Line data={data} />
    </div>
  );
}
