// components/TrendBadge.tsx
import type { TrendType } from "../utils/trendAnalyzer";

interface Props {
  trend: TrendType;
}

export default function TrendBadge({ trend }: Props) {
  if (trend === "insufficient") return null;

  let text = "";
  let color = "";
  let bgColor = "";

  switch (trend) {
    case "faster":
      text = "🚀 Faster than usual";
      color = "#065f46";
      bgColor = "#d1fae5";
      break;
    case "slower":
      text = "⚠️ Slower than usual";
      color = "#991b1b";
      bgColor = "#fee2e2";
      break;
    case "stable":
      text = "📊 Stable connection";
      color = "#92400e";
      bgColor = "#fef3c7";
      break;
  }

  return (
    <div
      style={{
        background: bgColor,
        color: color,
        padding: "8px 16px",
        borderRadius: "12px",
        marginBottom: "16px",
        fontWeight: "600",
        fontSize: "13px",
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
}