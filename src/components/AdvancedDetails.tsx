// components/AdvancedDetails.tsx - NO GRAPHS HERE
import { getBestScore, getBestStats, type SpeedTestRecord, type BestStats } from "../utils/storage";

interface AdvancedDetailsProps {
  bufferbloat: number | null;
  history: SpeedTestRecord[];
  autoRun: boolean;
  onAutoRunToggle: () => void;
  monitorPing: number | null;
  isTabVisible: boolean;
  isTestActive: boolean;
  download: number | null;
  upload: number | null;
  phase: string;
}

export default function AdvancedDetails({
  bufferbloat,
  history,
  autoRun,
  onAutoRunToggle,
  monitorPing,
  isTabVisible,
  isTestActive,
  download,
  upload,
  phase,
}: AdvancedDetailsProps) {
  const bestScore = getBestScore();
  const bestStats = getBestStats();

  const formatSpeed = (value: number) => {
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  return (
    <details
      style={{
        background: "rgba(255,255,255,0.9)",
        borderRadius: "20px",
        padding: "12px 16px",
        cursor: "pointer",
      }}
    >
      <summary
        style={{
          fontWeight: "600",
          color: "#475569",
          fontSize: "13px",
          userSelect: "none",
        }}
      >
        📊 Advanced Details
      </summary>

      <div style={{ marginTop: "16px" }}>
        {/* Bufferbloat */}
        {bufferbloat !== null && !isTestActive && (
          <div
            style={{
              fontSize: "12px",
              padding: "10px",
              background: bufferbloat < 20 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              borderRadius: "12px",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            <span>📦 Bufferbloat: {bufferbloat} ms</span>
            <span style={{ marginLeft: "8px", fontSize: "11px" }}>
              {bufferbloat < 20
                ? "✅ Good - No lag under load"
                : bufferbloat < 50
                ? "⚠️ Moderate - May experience some lag"
                : "❌ High - Significant lag under load"}
            </span>
          </div>
        )}

        {/* Best Stats Summary */}
        {bestStats !== null && (
          <div
            style={{
              fontSize: "11px",
              padding: "8px",
              background: "rgba(234,179,8,0.05)",
              borderRadius: "12px",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            <span>🏆 Best: {formatSpeed(bestStats.bestDownload)} ↓ / {formatSpeed(bestStats.bestUpload)} ↑ / {bestStats.bestPing.toFixed(2)}ms 📡</span>
          </div>
        )}

        {/* Best Score */}
        {bestScore !== null && (
          <div
            style={{
              fontSize: "11px",
              padding: "8px",
              background: "rgba(234,179,8,0.08)",
              borderRadius: "12px",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            🏆 Best Score: {bestScore}/100
          </div>
        )}

        {/* Monitoring */}
        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <button
            onClick={onAutoRunToggle}
            style={{
              padding: "8px 20px",
              background: autoRun ? "#ef4444" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "40px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "12px",
              transition: "all 0.2s",
            }}
          >
            {autoRun ? "🛑 Stop Monitoring" : "🔔 Enable Monitoring"}
          </button>
          {autoRun && (
            <div style={{ marginTop: "8px" }}>
              <p style={{ fontSize: "11px", opacity: 0.6, margin: 0, color: "#475569" }}>
                {isTabVisible ? "🔔 Monitoring active" : "⏸ Paused (tab hidden)"}
              </p>
              {monitorPing !== null && monitorPing >= 0 && isTabVisible && (
                <p style={{ fontSize: "10px", marginTop: "4px", color: "#10b981" }}>
                  Last ping: {monitorPing} ms
                </p>
              )}
            </div>
          )}
        </div>

        {/* History - Last 3 records */}
        {history.length > 0 && !isTestActive && (
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#475569",
                marginBottom: "8px",
              }}
            >
              📜 Recent Tests
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {history.slice(0, 3).map((record, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: "11px",
                    padding: "8px 10px",
                    background: "rgba(100,116,139,0.05)",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  <span style={{ color: "#64748b" }}>{record.date.slice(0, 16)}</span>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span>📡 {record.ping}ms</span>
                    <span>⬇️ {formatSpeed(record.download)}</span>
                    <span>⬆️ {formatSpeed(record.upload)}</span>
                    <span
                      style={{
                        fontWeight: "bold",
                        color:
                          record.score > 80
                            ? "#10b981"
                            : record.score > 50
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      {record.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}