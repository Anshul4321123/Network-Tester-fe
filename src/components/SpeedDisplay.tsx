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
  insights?: string[]; // ✅ NEW
}

export default function SpeedDisplay({
  ping,
  jitter,
  download,
  upload,
  phase,
  report,
  score,
  insights = []
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
    if (score > 80) return "#00ff88";
    if (score > 50) return "#ffaa00";
    return "#ff4444";
  }

  return (
    <div
      style={{
        background: "#111",
        color: "#fff",
        padding: "30px",
        borderRadius: "12px",
        width: "420px",
        margin: "auto",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)"
      }}
    >

      {/* SCORE */}
      {score !== null && (
        <div style={{
          fontSize: "36px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: getScoreColor(score)
        }}>
          Internet Score: {score} / 100
        </div>
      )}

      {/* SPEED METRICS */}
      <div style={{ lineHeight: "1.8" }}>
        <div>Ping: {format(ping)} ms</div>
        <div>Jitter: {format(jitter)} ms</div>
        <div>Download: {format(download)} Mbps</div>
        <div>Upload: {format(upload)} Mbps</div>
      </div>

      {/* STATUS */}
      <p style={{ marginTop: "15px", color: "#0f0" }}>
        {getPhaseLabel(phase)}
      </p>

      {/* REPORT */}
      {report && (
        <div style={{ marginTop: "20px" }}>
          <h3>Connection Report</h3>

          <p>Quality: {report.quality}</p>
          <p>Streaming: {report.streaming}</p>
          <p>Gaming: {report.gaming}</p>
          <p>Video Calls: {report.videoCalls}</p>
        </div>
      )}

      {/* 🧠 INSIGHTS (NEW) */}
      {insights.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Insights</h3>

          {insights.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

    </div>
  );
}