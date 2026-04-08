import { useEffect, useState } from "react";
import useSpeedTest from "../hooks/useSpeedTest";
import SpeedDisplay from "../components/SpeedDisplay";
import StartTestButton from "../components/StartTestButton";
import LiveGraph from "../components/LiveGraph";
import { getHistory } from "../utils/storage";
import TrendBadge from "../components/TrendBadge";
import { analyzeTrend, type TrendType } from "../utils/trendAnalyzer";

export default function Home() {

  const [trend, setTrend] = useState<TrendType>("insufficient");

  const history = getHistory();

  const {
    ping,
    download,
    upload,
    jitter,
    phase,
    report,
    runTest,
    downloadHistory,
    uploadHistory,
    score,
    insights
  } = useSpeedTest();

  /*
  ----------------
  CALCULATE TREND (🔥 FIX)
  ----------------
  */
  useEffect(() => {
    if (history.length > 0) {
      const downloads = history.map(h => h.download);
      const result = analyzeTrend(downloads);
      setTrend(result);
    }
  }, [history]);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>

      {/* ✅ TREND BADGE NOW WORKS */}
      <TrendBadge trend={trend} />

      {/* RECENT HISTORY */}
      {history.slice(0, 2).length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Recent Tests</h3>

          {history.slice(0, 2).map((item, index) => (
            <div key={index} style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "8px"
            }}>
              <p>{item.date}</p>
              <p>Download: {item.download} Mbps</p>
              <p>Upload: {item.upload} Mbps</p>
            </div>
          ))}
        </div>
      )}

      <h1>Internet Speed Test</h1>

      <SpeedDisplay
        ping={ping}
        jitter={jitter}
        download={download}
        upload={upload}
        phase={phase}
        report={report}
        score={score}
      />

      {/* ✅ SMART INSIGHTS */}
      {insights.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Smart Insights</h3>

          {insights.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      )}

      <StartTestButton onClick={runTest} />

      {/* GRAPHS */}
      <div style={{ width: "700px", margin: "40px auto" }}>

        <h3>Download Speed</h3>
        <LiveGraph speeds={downloadHistory} />

        <h3 style={{ marginTop: "40px" }}>Upload Speed</h3>
        <LiveGraph speeds={uploadHistory} />

      </div>

    </div>
  );
}