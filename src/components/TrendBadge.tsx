import type { TrendType } from "../utils/trendAnalyzer";

interface Props {
  trend: TrendType;
}

export default function TrendBadge({ trend }: Props) {

  if (trend === "insufficient") return null;

  let text = "";
  let color = "";

  switch (trend) {
    case "faster":
      text = "🚀 Faster than usual";
      color = "#00ff88";
      break;

    case "slower":
      text = "⚠ Slower than usual";
      color = "#ff4444";
      break;

    case "stable":
      text = "📊 Stable connection";
      color = "#ffaa00";
      break;
  }

  return (
    <div style={{
      background: color,
      padding: "10px",
      borderRadius: "6px",
      marginBottom: "20px",
      fontWeight: "bold"
    }}>
      {text}
    </div>
  );
}