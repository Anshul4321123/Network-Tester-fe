// Home.tsx - Update the LiveGraphPopup props
import { useEffect, useState } from "react";
import useSpeedTest from "../hooks/useSpeedTest";
import Hero from "../components/Hero";
import Insights from "../components/Insights";
import AdvancedDetails from "../components/AdvancedDetails";
import LiveGraphPopup from "../components/LiveGraphPopup";
import { getHistory, getBestScore, getBestStats, saveTestSelection, loadTestSelection, type SpeedTestRecord, type BestStats } from "../utils/storage";

export default function Home() {
  const [history, setHistory] = useState<SpeedTestRecord[]>(getHistory());
  const [bestScore, setBestScore] = useState<number | null>(getBestScore());
  const [bestStats, setBestStats] = useState<BestStats | null>(getBestStats());
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [showLiveGraph, setShowLiveGraph] = useState(true);
  const [showGraphPopup, setShowGraphPopup] = useState(false);
  const [testSelection, setTestSelection] = useState(() => loadTestSelection());
  const [networkInfo, setNetworkInfo] = useState({
    type: "unknown",
    effectiveType: "unknown",
    downlink: null as number | null,
    rtt: null as number | null,
  });

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
    pingHistory,
    jitterHistory,
    score,
    insights,
    mode,
    setMode,
    modeResult,
    bufferbloat,
    networkType,
    running,
    autoRun,
    setAutoRun,
    monitorPing,
  } = useSpeedTest();

  // Detect network information
  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      setNetworkInfo({
        type: connection.type || "unknown",
        effectiveType: connection.effectiveType || "unknown",
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
      });
    }
  }, []);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Auto-show popup when test starts (only if toggle is ON)
  useEffect(() => {
    if (showLiveGraph && (running || phase === "download" || phase === "upload" || phase === "ping")) {
      setShowGraphPopup(true);
    }
  }, [running, phase, showLiveGraph]);

  // Save test selection to localStorage whenever it changes
  useEffect(() => {
    saveTestSelection(testSelection);
  }, [testSelection]);

  // Update best stats when test completes
  useEffect(() => {
    if (score !== null && score > (bestScore || 0)) {
      setBestScore(score);
    }
    const newBestStats = getBestStats();
    if (newBestStats) {
      setBestStats(newBestStats);
    }
  }, [score, download, upload, ping]);

  // History sync and best stats update
  useEffect(() => {
    const interval = setInterval(() => {
      const newHistory = getHistory();
      setHistory(newHistory);
      setBestScore(getBestScore());
      setBestStats(getBestStats());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const isTestActive = running || (phase !== "idle" && phase !== "complete");

  const formatSpeed = (value: number) => {
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  // Custom test runner that respects selection
  const handleRunTest = () => {
    runTest("manual", testSelection);
  };

  // Get network recommendation
  const getNetworkRecommendation = () => {
    if (networkInfo.effectiveType === "4g") {
      return "✅ 4G detected - Good for streaming & video calls";
    }
    if (networkInfo.effectiveType === "3g") {
      return "⚠️ 3G detected - May struggle with HD video";
    }
    if (networkInfo.effectiveType === "2g") {
      return "❌ 2G detected - Very slow, only basic browsing";
    }
    if (networkInfo.downlink && networkInfo.downlink > 50) {
      return "🚀 Excellent WiFi - Great for 4K streaming & gaming";
    }
    if (networkInfo.downlink && networkInfo.downlink > 20) {
      return "👍 Good WiFi - Suitable for HD streaming";
    }
    return "📡 Connected - Run a test to check your speed";
  };

  // Background based on test state
  const getBackgroundStyle = () => {
    if (running) {
      return {
        background: "linear-gradient(135deg, #e0f2fe 0%, #fae8ff 50%, #dbeafe 100%)",
        transition: "background 0.5s ease",
        minHeight: "100vh",
      };
    }
    return {
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)",
      transition: "background 0.5s ease",
      minHeight: "100vh",
    };
  };

  return (
    <div style={getBackgroundStyle()}>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "clamp(12px, 4vw, 24px)",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Best Stats Banner - Always visible */}
        {bestStats !== null && (
          <div
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              borderRadius: "16px",
              padding: "12px 16px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px", letterSpacing: "1px" }}>
              ALL TIME BEST
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>⚡ FASTEST DOWNLOAD</div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fbbf24" }}>
                  {formatSpeed(bestStats.bestDownload)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>🚀 FASTEST UPLOAD</div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fbbf24" }}>
                  {formatSpeed(bestStats.bestUpload)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>📡 BEST PING</div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fbbf24" }}>
                  {bestStats.bestPing.toFixed(2)} ms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network Information Banner */}
        <div
          style={{
            background: "rgba(59,130,246,0.1)",
            borderRadius: "16px",
            padding: "12px 16px",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "16px" }}>📶</span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
              Network: {networkInfo.effectiveType?.toUpperCase() || "Unknown"}
              {networkInfo.type && networkInfo.type !== "unknown" && ` (${networkInfo.type})`}
            </span>
            {networkInfo.downlink && (
              <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "auto" }}>
                📡 {networkInfo.downlink} Mbps
              </span>
            )}
          </div>
          <div style={{ fontSize: "11px", color: "#475569" }}>
            {getNetworkRecommendation()}
          </div>
        </div>

        {/* Test Selection Dropdown with localStorage persistence */}
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "16px",
            padding: "12px 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <details>
            <summary
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                cursor: "pointer",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>🎯 Select Tests to Run</span>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                {Object.values(testSelection).filter(Boolean).length} selected
              </span>
            </summary>
            <div style={{ marginTop: "12px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                <input
                  type="checkbox"
                  checked={testSelection.ping}
                  onChange={(e) => setTestSelection({ ...testSelection, ping: e.target.checked })}
                  disabled={running}
                />
                📡 Ping
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                <input
                  type="checkbox"
                  checked={testSelection.jitter}
                  onChange={(e) => setTestSelection({ ...testSelection, jitter: e.target.checked })}
                  disabled={running}
                />
                ⚡ Jitter
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                <input
                  type="checkbox"
                  checked={testSelection.download}
                  onChange={(e) => setTestSelection({ ...testSelection, download: e.target.checked })}
                  disabled={running}
                />
                ⬇️ Download
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                <input
                  type="checkbox"
                  checked={testSelection.upload}
                  onChange={(e) => setTestSelection({ ...testSelection, upload: e.target.checked })}
                  disabled={running}
                />
                ⬆️ Upload
              </label>
            </div>
          </details>
        </div>

        {/* SECTION 1: HERO */}
        <Hero
          score={score}
          ping={ping}
          download={download}
          upload={upload}
          jitter={jitter}
          phase={phase}
          running={running}
          isTestActive={isTestActive}
          onRunTest={handleRunTest}
          mode={mode}
          onModeChange={setMode}
          testSelection={testSelection}
          showLiveGraph={showLiveGraph}
          onToggleLiveGraph={() => setShowLiveGraph(!showLiveGraph)}
        />

        {/* SECTION 2: INSIGHTS */}
        {!isTestActive && (insights.length > 0 || modeResult || report) && (
          <Insights
            insights={insights}
            modeResult={modeResult}
            report={report}
            networkType={networkType}
          />
        )}

        {/* SECTION 3: ADVANCED (COLLAPSIBLE) */}
        <AdvancedDetails
          bufferbloat={bufferbloat}
          history={history}
          autoRun={autoRun}
          onAutoRunToggle={() => setAutoRun(!autoRun)}
          monitorPing={monitorPing}
          isTabVisible={isTabVisible}
          isTestActive={isTestActive}
          download={download}
          upload={upload}
          phase={phase}
        />

        {/* Live Graph Popup - Now includes Ping and Jitter graphs */}
        <LiveGraphPopup
          isOpen={showGraphPopup}
          onClose={() => setShowGraphPopup(false)}
          downloadHistory={downloadHistory}
          uploadHistory={uploadHistory}
          pingHistory={pingHistory}
          jitterHistory={jitterHistory}
          download={download}
          upload={upload}
          ping={ping}
          jitter={jitter}
          phase={phase}
          running={running}
          testSelection={testSelection}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        details > summary {
          list-style: none;
        }
        details > summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </div>
  );
}