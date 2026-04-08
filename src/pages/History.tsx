// pages/History.tsx
import { useEffect, useState } from "react";
import { getHistory } from "../utils/storage";
import LiveGraph from "../components/LiveGraph";
import { analyzeTrend, type TrendType } from "../utils/trendAnalyzer";
import TrendBadge from "../components/TrendBadge";

interface SpeedTestResult {
  date: string;
  ping: number;
  jitter: number;
  download: number;
  upload: number;
  score?: number;
}

export default function History() {
  const [history, setHistory] = useState<SpeedTestResult[]>([]);
  const [trend, setTrend] = useState<TrendType>("insufficient");

  useEffect(() => {
    const data = getHistory();
    setHistory(data);
    detectTrend(data);
  }, []);

  function detectTrend(data: SpeedTestResult[]) {
    const downloads = data.map((d) => d.download);
    const trendResult = analyzeTrend(downloads);
    setTrend(trendResult);
  }

  const formatSpeed = (value: number) => {
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return "#10b981";
    if (score > 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "rgba(255,255,255,0.95)",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: "20px",
          }}
        >
          📊 History Dashboard
        </h1>

        {/* Trend Badge */}
        <TrendBadge trend={trend} />

        {/* Summary Stats */}
        {history.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px",
              marginBottom: "24px",
              padding: "16px",
              background: "#f8fafc",
              borderRadius: "16px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Total Tests</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>
                {history.length}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Avg Download</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>
                {formatSpeed(history.reduce((acc, h) => acc + h.download, 0) / history.length)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Avg Ping</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
                {(history.reduce((acc, h) => acc + h.ping, 0) / history.length).toFixed(1)} ms
              </div>
            </div>
          </div>
        )}

        {/* Graphs */}
        {history.length > 0 && (
          <>
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1e293b",
                  marginBottom: "12px",
                }}
              >
                ⬇️ Download Speed Trend
              </h2>
              <div style={{ height: "250px" }}>
                <LiveGraph speeds={history.map((h) => h.download)} label="Download Mbps" />
              </div>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1e293b",
                  marginBottom: "12px",
                }}
              >
                📡 Ping Trend
              </h2>
              <div style={{ height: "250px" }}>
                <LiveGraph speeds={history.map((h) => h.ping)} label="Ping (ms)" />
              </div>
            </div>
          </>
        )}

        {/* Table */}
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1e293b",
            marginBottom: "16px",
          }}
        >
          📜 Test History
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f1f5f9",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                <th style={{ padding: "12px", textAlign: "left", color: "#475569" }}>Date</th>
                <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Ping</th>
                <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Jitter</th>
                <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Download</th>
                <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Upload</th>
                <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#94a3b8",
                    }}
                  >
                    No data available. Run a speed test to see results!
                  </td>
                </tr>
              ) : (
                history.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={{ padding: "12px", color: "#64748b" }}>{item.date}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "500" }}>
                      {item.ping} ms
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "#64748b" }}>
                      {item.jitter} ms
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "500", color: "#3b82f6" }}>
                      {formatSpeed(item.download)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "500", color: "#f59e0b" }}>
                      {formatSpeed(item.upload)}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        fontWeight: "bold",
                        color: item.score ? getScoreColor(item.score) : "#64748b",
                      }}
                    >
                      {item.score ?? "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}