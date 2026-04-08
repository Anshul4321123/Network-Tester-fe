import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  type ChartOptions
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

interface Props {
  speeds: number[];
  label?: string;
}

export default function LiveGraph({
  speeds,
  label = "Speed"
}: Props) {

  const data = {
    labels: speeds.map((_, i) => i + 1),
    datasets: [
      {
        label,
        data: speeds,
        borderColor: "#00e5ff",
        backgroundColor: "rgba(0,229,255,0.2)",
        tension: 0.3,
        pointRadius: 2
      }
    ]
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    animation: {
      duration: 0 // ✅ FIXED
    },
    plugins: {
      legend: {
        labels: {
          color: "#fff"
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#aaa" }
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#aaa" }
      }
    }
  };

  return <Line data={data} options={options} />;
}