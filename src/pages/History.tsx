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
    const downloads = data.map(d => d.download);
    const trendResult = analyzeTrend(downloads);
    setTrend(trendResult);
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>

      <h1>History Dashboard</h1>

      {/* ✅ TREND BADGE (FIXED) */}
      <TrendBadge trend={trend} />

      {/* GRAPHS */}
      <div style={{ marginBottom: "40px" }}>
        <h2>Download Speed Trend</h2>
        <LiveGraph
          speeds={history.map(h => h.download)}
          label="Download Mbps"
        />
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>Ping Trend</h2>
        <LiveGraph
          speeds={history.map(h => h.ping)}
          label="Ping (ms)"
        />
      </div>

      {/* TABLE */}
      <h2>Test History</h2>

      <table style={{
        width: "100%",
        marginTop: "20px",
        borderCollapse: "collapse"
      }}>

        <thead>
          <tr>
            <th>Date</th>
            <th>Ping</th>
            <th>Jitter</th>
            <th>Download</th>
            <th>Upload</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No data available
              </td>
            </tr>
          ) : (
            history.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.ping}</td>
                <td>{item.jitter}</td>
                <td>{item.download}</td>
                <td>{item.upload}</td>
                <td>{item.score ?? "--"}</td>
              </tr>
            ))
          )}
        </tbody>

      </table>

    </div>
  );
}