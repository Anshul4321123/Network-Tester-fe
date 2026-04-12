// components/LiveGraph.tsx - FIXED TypeScript error
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LiveGraphProps {
  speeds: number[];
  isLive?: boolean;
  label?: string;
  graphType?: "ping" | "jitter" | "download" | "upload";
}

export default function LiveGraph({ speeds, isLive = false, label = "Speed", graphType = "download" }: LiveGraphProps) {
  const labels = speeds.map((_, i) => `${i + 1}`);

  // Configure Y-axis based on graph type
  const getYAxisConfig = () => {
    if (graphType === "jitter") {
      const maxJitter = Math.max(...speeds, 30);
      return {
        beginAtZero: true,
        max: Math.min(maxJitter + 10, 50),
        title: {
          display: true,
          text: "Jitter (ms)",
          font: { size: 10, weight: "bold" as const },
        },
        ticks: {
          stepSize: 10,
          callback: (value: any) => `${value} ms`,
          font: { size: 10 },
        },
        grid: {
          color: "rgba(139, 92, 246, 0.1)",
        },
      };
    }
    
    if (graphType === "ping") {
      const maxPing = Math.max(...speeds, 100);
      return {
        beginAtZero: true,
        max: Math.min(maxPing + 50, 300),
        title: {
          display: true,
          text: "Ping (ms)",
          font: { size: 10, weight: "bold" as const },
        },
        ticks: {
          stepSize: 50,
          callback: (value: any) => `${value} ms`,
          font: { size: 10 },
        },
        grid: {
          color: "rgba(16, 185, 129, 0.1)",
        },
      };
    }
    
    // For download/upload speeds
    // const maxSpeed = Math.max(...speeds, 100);
    return {
      beginAtZero: true,
      title: {
        display: true,
        text: "Speed (Mbps)",
        font: { size: 10, weight: "bold" as const },
      },
      ticks: {
        callback: (value: any) => {
          if (value > 1000) return `${(value / 1000).toFixed(0)}G`;
          if (value > 100) return `${value}M`;
          return value;
        },
        font: { size: 10 },
      },
      grid: {
        color: "rgba(59, 130, 246, 0.1)",
      },
    };
  };

  const getLineColor = () => {
    switch (graphType) {
      case "ping": return "#10b981";
      case "jitter": return "#8b5cf6";
      case "download": return "#3b82f6";
      case "upload": return "#f59e0b";
      default: return isLive ? "#3b82f6" : "#10b981";
    }
  };

  const getFillColor = () => {
    switch (graphType) {
      case "ping": return "rgba(16, 185, 129, 0.1)";
      case "jitter": return "rgba(139, 92, 246, 0.1)";
      case "download": return "rgba(59, 130, 246, 0.1)";
      case "upload": return "rgba(245, 158, 11, 0.1)";
      default: return isLive ? "rgba(59, 130, 246, 0.1)" : "rgba(16, 185, 129, 0.1)";
    }
  };

  const data = {
    labels,
    datasets: [
      {
        label: label,
        data: speeds,
        borderColor: getLineColor(),
        backgroundColor: getFillColor(),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: speeds.length > 50 ? 1 : 2,
        pointHoverRadius: 4,
        pointBackgroundColor: getLineColor(),
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let value = context.parsed.y;
            if (graphType === "jitter" || graphType === "ping") {
              return `${value.toFixed(1)} ms`;
            }
            if (value > 1000) {
              return `${(value / 1000).toFixed(1)} Gbps`;
            }
            return `${value.toFixed(1)} Mbps`;
          },
        },
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#e2e8f0",
        padding: 8,
        cornerRadius: 8,
      },
    },
    scales: {
      y: getYAxisConfig(),
      x: {
        title: {
          display: true,
          text: "Test #",
          font: { size: 10, weight: "bold" as const },
        },
        ticks: {
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
          font: { size: 9 },
        },
        grid: {
          display: false,
        },
      },
    },
    animation: {
      duration: isLive ? 200 : 500,
    },
  };

  return <Line data={data} options={options} />;
}