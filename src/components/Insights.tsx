// components/Insights.tsx
import type { ConnectionReport } from "../utils/connectionAnalyzer";

interface InsightsProps {
  insights: string[];
  modeResult: string;
  report: ConnectionReport | null;
  networkType: string;
}

export default function Insights({
  insights,
  modeResult,
  report,
  networkType,
}: InsightsProps) {
  // Map network type to user-friendly label
  const getNetworkLabel = (type: string) => {
    const map: Record<string, string> = {
      "slow-2g": "Very Slow",
      "2g": "Slow",
      "3g": "Moderate",
      "4g": "Fast",
      "5g": "Very Fast",
    };
    return map[type.toLowerCase()] || type;
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.9)",
        borderRadius: "20px",
        padding: "16px",
        border: "1px solid rgba(203,213,225,0.5)",
      }}
    >
      {/* Mode Result */}
      {modeResult && (
        <div
          style={{
            fontSize: "13px",
            fontWeight: "500",
            color: "#8b5cf6",
            marginBottom: "12px",
            padding: "8px",
            background: "rgba(139,92,246,0.1)",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          {modeResult}
        </div>
      )}

      {/* Connection Report */}
      {report && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
            marginBottom: "12px",
            padding: "8px",
            background: "rgba(59,130,246,0.05)",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontSize: "11px", textAlign: "center" }}>
            <div style={{ color: "#64748b" }}>Quality</div>
            <div style={{ fontWeight: "600", color: "#3b82f6" }}>
              {report.quality}
            </div>
          </div>
          <div style={{ fontSize: "11px", textAlign: "center" }}>
            <div style={{ color: "#64748b" }}>Streaming</div>
            <div style={{ fontWeight: "600", color: "#3b82f6" }}>
              {report.streaming}
            </div>
          </div>
          <div style={{ fontSize: "11px", textAlign: "center" }}>
            <div style={{ color: "#64748b" }}>Gaming</div>
            <div style={{ fontWeight: "600", color: "#3b82f6" }}>
              {report.gaming}
            </div>
          </div>
          <div style={{ fontSize: "11px", textAlign: "center" }}>
            <div style={{ color: "#64748b" }}>Video Calls</div>
            <div style={{ fontWeight: "600", color: "#3b82f6" }}>
              {report.videoCalls}
            </div>
          </div>
        </div>
      )}

      {/* Network Type (User-friendly) */}
      {networkType !== "unknown" && (
        <div
          style={{
            fontSize: "11px",
            color: "#64748b",
            textAlign: "center",
            marginBottom: insights.length > 0 ? "12px" : 0,
            padding: "4px",
          }}
        >
          📡 Network: {getNetworkLabel(networkType)} ({networkType.toUpperCase()})
        </div>
      )}

      {/* Insights - Max 3 */}
      {insights.length > 0 && (
        <div>
          {insights.slice(0, 3).map((msg, i) => (
            <p
              key={i}
              style={{
                margin: "6px 0",
                fontSize: "12px",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>💡</span> {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}