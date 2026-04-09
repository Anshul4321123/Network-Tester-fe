// Home.tsx - Complete with Shareable Result Card
import { useEffect, useState } from "react";
import useSpeedTest from "../hooks/useSpeedTest";
import Hero from "../components/Hero";
import Insights from "../components/Insights";
import AdvancedDetails from "../components/AdvancedDetails";
import LiveGraphPopup from "../components/LiveGraphPopup";
import CelebrationPopup from "../components/CelebrationPopup";
import NetworkInfo from "../components/NetworkInfo";
import ShareableResultCard from "../components/ShareableResultCard";
import { 
  getHistory, 
  getBestScore, 
  getBestStats, 
  saveTestSelection, 
  loadTestSelection, 
  getAchievements,
  updateAchievement,
  type SpeedTestRecord, 
  type BestStats,
  type Achievements 
} from "../utils/storage";

interface RecordBreak {
  type: "download" | "upload" | "ping" | "score";
  oldValue: number;
  newValue: number;
}

export default function Home() {
  const [history, setHistory] = useState<SpeedTestRecord[]>(getHistory());
  const [bestScore, setBestScore] = useState<number | null>(getBestScore());
  const [bestStats, setBestStats] = useState<BestStats | null>(getBestStats());
  const [achievements, setAchievements] = useState<Achievements>(getAchievements());
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [showLiveGraph, setShowLiveGraph] = useState(true);
  const [showGraphPopup, setShowGraphPopup] = useState(false);
  const [testSelection, setTestSelection] = useState(() => loadTestSelection());
  const [testCompleted, setTestCompleted] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);
  
  // Celebration state - Updated to support multiple records
  const [celebration, setCelebration] = useState<{
    show: boolean;
    records: RecordBreak[];
    isFirstTime?: boolean;
    firstTimeType?: "ping" | "jitter" | "download" | "upload" | "score";
  } | null>(null);

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

  // Track test completion for network refresh
  useEffect(() => {
    if (phase === "complete") {
      setTestCompleted(prev => prev + 1);
    }
  }, [phase]);

  // Save test selection to localStorage whenever it changes
  useEffect(() => {
    saveTestSelection(testSelection);
  }, [testSelection]);

  // Check for first-time achievements and new records when test completes
  useEffect(() => {
    if (phase === "complete" && score !== null && download !== null && upload !== null && ping !== null) {
      const brokenRecords: RecordBreak[] = [];
      
      // Check for first-time achievements (priority)
      if (!achievements.hasRunPing && ping > 0) {
        updateAchievement("ping");
        setAchievements(getAchievements());
        setCelebration({
          show: true,
          records: [{ type: "ping", oldValue: ping, newValue: ping }],
          isFirstTime: true,
          firstTimeType: "ping",
        });
        return;
      }
      else if (!achievements.hasRunJitter && jitter !== null && jitter > 0) {
        updateAchievement("jitter");
        setAchievements(getAchievements());
        setCelebration({
          show: true,
          records: [{ type: "ping", oldValue: jitter, newValue: jitter }],
          isFirstTime: true,
          firstTimeType: "jitter",
        });
        return;
      }
      else if (!achievements.hasRunDownload && download > 0) {
        updateAchievement("download");
        setAchievements(getAchievements());
        setCelebration({
          show: true,
          records: [{ type: "download", oldValue: download, newValue: download }],
          isFirstTime: true,
          firstTimeType: "download",
        });
        return;
      }
      else if (!achievements.hasRunUpload && upload > 0) {
        updateAchievement("upload");
        setAchievements(getAchievements());
        setCelebration({
          show: true,
          records: [{ type: "upload", oldValue: upload, newValue: upload }],
          isFirstTime: true,
          firstTimeType: "upload",
        });
        return;
      }
      
      // Check for new records (only if not first time)
      // Check for new best score
      if (bestScore !== null && score > bestScore) {
        brokenRecords.push({
          type: "score",
          oldValue: bestScore,
          newValue: score,
        });
      }
      
      // Check for new best download
      if (bestStats && download > bestStats.bestDownload) {
        brokenRecords.push({
          type: "download",
          oldValue: bestStats.bestDownload,
          newValue: download,
        });
      }
      
      // Check for new best upload
      if (bestStats && upload > bestStats.bestUpload) {
        brokenRecords.push({
          type: "upload",
          oldValue: bestStats.bestUpload,
          newValue: upload,
        });
      }
      
      // Check for new best ping (lower is better)
      if (bestStats && ping < bestStats.bestPing) {
        brokenRecords.push({
          type: "ping",
          oldValue: bestStats.bestPing,
          newValue: ping,
        });
      }
      
      // Show celebration if any records were broken
      if (brokenRecords.length > 0) {
        setCelebration({
          show: true,
          records: brokenRecords,
          isFirstTime: false,
        });
      }
    }
  }, [phase, score, download, upload, ping, jitter, bestScore, bestStats, achievements]);

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
      setAchievements(getAchievements());
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
          gap: "12px",
        }}
      >
        {/* Best Stats Banner - Always visible */}
        {bestStats !== null && (
          <div
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              borderRadius: "14px",
              padding: "10px 14px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "6px", letterSpacing: "1px" }}>
              ALL TIME BEST
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
              }}
            >
              <div>
                <div style={{ fontSize: "9px", color: "#94a3b8", marginBottom: "2px" }}>⚡ DOWNLOAD</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}>
                  {formatSpeed(bestStats.bestDownload)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "9px", color: "#94a3b8", marginBottom: "2px" }}>🚀 UPLOAD</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}>
                  {formatSpeed(bestStats.bestUpload)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "9px", color: "#94a3b8", marginBottom: "2px" }}>📡 PING</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}>
                  {bestStats.bestPing.toFixed(2)} ms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Network Information Component */}
        <NetworkInfo 
          triggerRefresh={testCompleted}
          onNetworkDetected={(type) => {
            console.log("Network type:", type);
          }}
        />

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
          setTestSelection={setTestSelection}
          showLiveGraph={showLiveGraph}
          onToggleLiveGraph={() => setShowLiveGraph(!showLiveGraph)}
        />

        {/* Share Button - Shows after test completes */}
{!isTestActive && score !== null && (
  <button
    onClick={() => setShowShareCard(true)}
    style={{
      padding: "12px 20px",
      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      border: "none",
      borderRadius: "40px",
      color: "#fff",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      width: "100%",
      transition: "all 0.2s",
      boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.02)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
    }}
  >
    <span>📤</span>
    Share Your Result
  </button>
)}

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

        {/* Live Graph Popup */}
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

        {/* Celebration Popup - User must click to close, supports multiple records */}
        {celebration && (
          <CelebrationPopup
            isOpen={celebration.show}
            onClose={() => setCelebration(null)}
            records={celebration.records}
            isFirstTime={celebration.isFirstTime}
            firstTimeType={celebration.firstTimeType}
          />
        )}

        {/* Shareable Result Card */}
        {showShareCard && (
          <ShareableResultCard
            score={score}
            ping={ping}
            download={download}
            upload={upload}
            jitter={jitter}
            networkType={networkType}
            mode={mode}
            modeResult={modeResult}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}