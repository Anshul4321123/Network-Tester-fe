// SpeedDisplay.tsx
import type { TestPhase } from "../types/speedTestTypes";
import type { ConnectionReport } from "../utils/connectionAnalyzer";

interface Props {
  ping: number | null;
  jitter: number | null;
  download: number | null;
  upload: number | null;
  phase: TestPhase;
  report: ConnectionReport | null;
  score: number | null;
  insights?: string[];
  modeResult?: string;
  bufferbloat?: number | null;
  networkType?: string;
}

export default function SpeedDisplay({
  ping,
  jitter,
  download,
  upload,
  phase,
  report,
  score,
  insights = [],
  modeResult = "",
  bufferbloat = null,
  networkType = "unknown"
}: Props) {

  function format(value: number | null) {
    return value !== null ? value.toFixed(2) : "--";
  }

  function getPhaseLabel(phase: TestPhase) {
    switch (phase) {
      case "idle": return "Ready";
      case "ping": return "Testing Ping...";
      case "download": return "Testing Download...";
      case "upload": return "Testing Upload...";
      case "analyzing": return "Analyzing Connection...";
      case "complete": return "Test Complete";
      default: return "";
    }
  }

  function getScoreColor(score: number) {
    if (score > 80) return "#10b981";
    if (score > 50) return "#f59e0b";
    return "#ef4444";
  }

  function getBufferbloatLabel(value: number): string {
    if (value < 20) return "✅ No bufferbloat";
    if (value < 50) return "⚠️ Moderate bufferbloat";
    return "❌ Severe bufferbloat (network may lag under load)";
  }

  const isTestActive = phase !== "idle" && phase !== "complete";
  const showSkeleton = isTestActive && ping === null;

  return (
    <div
      style={{
        background: "#0f172a",
        color: "#f1f5f9",
        padding: "30px",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "500px",
        margin: "auto",
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Loading Skeleton for Active Test */}
      {showSkeleton ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            margin: "0 auto 20px",
            border: "3px solid #334155",
            borderTopColor: "#10b981",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{ color: "#94a3b8" }}>{getPhaseLabel(phase)}</p>
        </div>
      ) : (
        <>
          {/* SCORE */}
          {score !== null && phase === "complete" && (
            <div
              style={{
                fontSize: "42px",
                fontWeight: "bold",
                marginBottom: "24px",
                color: getScoreColor(score),
                textAlign: "center",
                animation: "fadeInUp 0.5s ease",
              }}
            >
              Internet Score: {score} / 100
            </div>
          )}

          {/* NETWORK TYPE */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "12px",
            borderBottom: "1px solid #334155",
          }}>
            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Network Type</span>
            <span style={{ fontWeight: "600", color: "#38bdf8" }}>{networkType.toUpperCase()}</span>
          </div>

          {/* SPEED METRICS GRID */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}>
            <MetricCard label="Ping" value={`${format(ping)} ms`} icon="📡" />
            <MetricCard label="Jitter" value={`${format(jitter)} ms`} icon="⚡" />
            <MetricCard label="Download" value={`${format(download)} Mbps`} icon="⬇️" />
            <MetricCard label="Upload" value={`${format(upload)} Mbps`} icon="⬆️" />
          </div>

          {/* BUFFERBLOAT */}
          {bufferbloat !== null && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "rgba(16,185,129,0.1)",
                borderRadius: "16px",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Bufferbloat</span>
                <span style={{ fontWeight: "600", color: bufferbloat < 20 ? "#10b981" : bufferbloat < 50 ? "#f59e0b" : "#ef4444" }}>
                  {bufferbloat} ms
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#cbd5e1" }}>
                {getBufferbloatLabel(bufferbloat)}
              </p>
            </div>
          )}

          {/* STATUS */}
          <p
            style={{
              marginTop: "16px",
              color: phase === "complete" ? "#10b981" : "#38bdf8",
              fontWeight: "500",
              textAlign: "center",
              fontSize: "0.9rem",
            }}
          >
            {getPhaseLabel(phase)}
          </p>

          {/* MODE RESULT */}
          {modeResult && phase === "complete" && (
            <div
              style={{
                marginTop: "16px",
                fontWeight: "bold",
                fontSize: "16px",
                textAlign: "center",
                padding: "12px",
                background: "rgba(139,92,246,0.1)",
                borderRadius: "16px",
                color: "#a78bfa",
                animation: "fadeInUp 0.5s ease",
              }}
            >
              {modeResult}
            </div>
          )}

          {/* REPORT */}
          {report && phase === "complete" && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "16px",
                animation: "fadeInUp 0.5s ease",
              }}
            >
              <h3 style={{ margin: "0 0 12px 0", fontSize: "1rem", color: "#f1f5f9" }}>Connection Report</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", fontSize: "0.85rem" }}>
                <span>Quality: <span style={{ color: "#38bdf8" }}>{report.quality}</span></span>
                <span>Streaming: <span style={{ color: "#38bdf8" }}>{report.streaming}</span></span>
                <span>Gaming: <span style={{ color: "#38bdf8" }}>{report.gaming}</span></span>
                <span>Video Calls: <span style={{ color: "#38bdf8" }}>{report.videoCalls}</span></span>
              </div>
            </div>
          )}

          {/* INSIGHTS - Only show when test is complete */}
          {insights.length > 0 && phase === "complete" && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "rgba(16,185,129,0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(16,185,129,0.1)",
                animation: "fadeInUp 0.5s ease",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#f1f5f9" }}>💡 Insights</h3>
              {insights.map((msg, i) => (
                <p key={i} style={{ margin: "4px 0", fontSize: "0.8rem", color: "#cbd5e1" }}>• {msg}</p>
              ))}
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Helper component for metric cards
function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div
      style={{
        background: "rgba(30,41,59,0.6)",
        padding: "12px",
        borderRadius: "16px",
        textAlign: "center",
        transition: "transform 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.background = "rgba(30,41,59,0.8)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = "rgba(30,41,59,0.6)";
      }}
    >
      <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{icon}</div>
      <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: "600", color: "#f1f5f9" }}>{value}</div>
    </div>
  );
}