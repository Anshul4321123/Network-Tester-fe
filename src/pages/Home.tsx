// Home.tsx - CLEAN FINAL VERSION (No High Score)
import { useEffect, useState } from "react";
import useSpeedTest from "../hooks/useSpeedTest";
import Hero from "../components/Hero";
import Insights from "../components/Insights";
import AdvancedDetails from "../components/AdvancedDetails";
import LiveGraphPopup from "../components/LiveGraphPopup";
import CelebrationPopup from "../components/CelebrationPopup";
import ComparisonPopup from "../components/ComparisonPopup";
import NetworkInfo from "../components/NetworkInfo";
import ShareableResultCard from "../components/ShareableResultCard";
import ISPInfo from "../components/ISPInfo";
import { 
  getHistory, 
  getBestScore, 
  getBestStats, 
  saveTestSelection, 
  loadTestSelection, 
  getAchievements,
  updateAchievement,
  saveResult,
  saveBestScore,
  saveBestStats,
  type SpeedTestRecord, 
  type BestStats,
  type Achievements 
} from "../utils/storage";
import { detectISP, getCachedISP, type ISPInfo as ISPInfoType } from "../utils/ispDetector";

interface RecordBreak {
  type: string;
  oldValue: number;
  newValue: number;
}

type FirstTimeType = string;

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
  const [ispInfo, setIspInfo] = useState<ISPInfoType | null>(null);
  const [ispLoading, setIspLoading] = useState(true);
  
  const [celebration, setCelebration] = useState<{
    show: boolean;
    records: RecordBreak[];
    isFirstTime?: boolean;
    firstTimeType?: FirstTimeType;
  } | null>(null);
  
  const [comparisonPopup, setComparisonPopup] = useState<{
    show: boolean;
    improvements: { type: string; oldValue: number; newValue: number; improved: boolean }[];
  } | null>(null);
  
  const [lastProcessedTestId, setLastProcessedTestId] = useState<string>("");

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (showLiveGraph && (running || phase === "download" || phase === "upload" || phase === "ping")) {
      setShowGraphPopup(true);
    }
  }, [running, phase, showLiveGraph]);

  const handleManualISPUpdate = (isp: string) => {
    localStorage.setItem("manual_isp", isp);
    if (ispInfo) {
      const updatedISP = { ...ispInfo, isp: isp, timestamp: Date.now() };
      setIspInfo(updatedISP);
      localStorage.setItem("cached_isp_info", JSON.stringify(updatedISP));
    }
  };

  useEffect(() => {
    const loadISP = async () => {
      setIspLoading(true);
      const cached = getCachedISP();
      if (cached && cached.isp !== "Unknown" && cached.isp !== "ISP information unavailable") {
        setIspInfo(cached);
        setIspLoading(false);
        return;
      }
      const info = await detectISP();
      if (info) setIspInfo(info);
      setIspLoading(false);
    };
    loadISP();
  }, []);

  useEffect(() => {
    if (phase === "complete") {
      setTestCompleted(prev => prev + 1);
    }
  }, [phase]);

  useEffect(() => {
    saveTestSelection(testSelection);
  }, [testSelection]);

  const handleComparisonClose = () => {
    setComparisonPopup(null);
  };

  const formatValue = (value: number, type: string) => {
    if (type === "ping") return `${value.toFixed(1)} ms`;
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  useEffect(() => {
    if (phase !== "complete" || score === null || download === null || upload === null || ping === null) {
      return;
    }
    
    const testId = `${score}-${download}-${upload}-${ping}-${Date.now()}`;
    if (lastProcessedTestId === testId) return;
    
    if (running) {
      setCelebration(null);
      setComparisonPopup(null);
      setLastProcessedTestId("");
      return;
    }
    
    const currentAchievements = getAchievements();
    
    // Save the result
    const manualISP = localStorage.getItem("manual_isp");
    const finalIsp = manualISP || ispInfo?.isp || "Unknown";
    const finalNetworkType = networkType || "unknown";
    
    const testResult: SpeedTestRecord = {
      date: new Date().toLocaleString(),
      ping: ping,
      jitter: jitter || 0,
      download: download,
      upload: upload,
      score: score,
      isp: finalIsp,
      networkType: finalNetworkType,
    };
    
    saveResult(testResult);
    saveBestScore(score);
    saveBestStats(score, download, upload, ping);
    
    // Get history for comparison popup
    const historyList = getHistory();
    let comparisonData = null;
    
    if (historyList.length >= 2) {
      const previousTest = historyList[1];
      const currentTest = historyList[0];
      
      const improvements = [];
      
      if (currentTest.download !== previousTest.download) {
        improvements.push({
          type: "download",
          oldValue: previousTest.download,
          newValue: currentTest.download,
          improved: currentTest.download > previousTest.download
        });
      }
      
      if (currentTest.upload !== previousTest.upload) {
        improvements.push({
          type: "upload",
          oldValue: previousTest.upload,
          newValue: currentTest.upload,
          improved: currentTest.upload > previousTest.upload
        });
      }
      
      if (currentTest.ping !== previousTest.ping) {
        improvements.push({
          type: "ping",
          oldValue: previousTest.ping,
          newValue: currentTest.ping,
          improved: currentTest.ping < previousTest.ping
        });
      }
      
      if (currentTest.score !== previousTest.score) {
        improvements.push({
          type: "score",
          oldValue: previousTest.score,
          newValue: currentTest.score,
          improved: currentTest.score > previousTest.score
        });
      }
      
      if (improvements.length > 0) {
        comparisonData = { improvements };
      }
    }
    
    // Check for achievements
    const newAchievements: { type: string; value: number }[] = [];
    
    if (!currentAchievements.hasRunPing && ping > 0) {
      newAchievements.push({ type: "ping", value: ping });
      updateAchievement("ping");
    }
    if (!currentAchievements.hasRunJitter && jitter !== null && jitter >= 0) {
      newAchievements.push({ type: "jitter", value: jitter });
      updateAchievement("jitter");
    }
    if (!currentAchievements.hasRunDownload && download > 0) {
      newAchievements.push({ type: "download", value: download });
      updateAchievement("download");
    }
    if (!currentAchievements.hasRunUpload && upload > 0) {
      newAchievements.push({ type: "upload", value: upload });
      updateAchievement("upload");
    }
    
    // Update local state
    setBestScore(getBestScore());
    setBestStats(getBestStats());
    setHistory(getHistory());
    setAchievements(getAchievements());
    
    // Show popups
    if (newAchievements.length > 0) {
      const achievementRecords: RecordBreak[] = newAchievements.map(a => ({
        type: a.type === "jitter" ? "ping" : a.type,
        oldValue: a.value,
        newValue: a.value,
      }));
      
      setCelebration({
        show: true,
        records: achievementRecords,
        isFirstTime: true,
        firstTimeType: newAchievements[0]?.type,
      });
      setLastProcessedTestId(testId);
    } 
    else if (comparisonData) {
      setComparisonPopup({
        show: true,
        improvements: comparisonData.improvements
      });
      setLastProcessedTestId(testId);
    }
    
  }, [phase, score, download, upload, ping, jitter, networkType, ispInfo, running]);

  // History sync
  useEffect(() => {
    const interval = setInterval(() => {
      const newHistory = getHistory();
      if (JSON.stringify(newHistory) !== JSON.stringify(history)) {
        setHistory(newHistory);
      }
      const newBestScore = getBestScore();
      if (newBestScore !== bestScore) setBestScore(newBestScore);
      const newBestStats = getBestStats();
      if (JSON.stringify(newBestStats) !== JSON.stringify(bestStats)) setBestStats(newBestStats);
      const newAchievements = getAchievements();
      if (JSON.stringify(newAchievements) !== JSON.stringify(achievements)) setAchievements(newAchievements);
    }, 2000);
    return () => clearInterval(interval);
  }, [history, bestScore, bestStats, achievements]);

  const isTestActive = running || (phase !== "idle" && phase !== "complete");

  const formatSpeed = (value: number) => {
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const handleRunTest = () => {
    const finalIsp = ispInfo?.isp || "Unknown";
    const finalNetworkType = networkType || "unknown";
    runTest("manual", testSelection, finalIsp, finalNetworkType);
  };

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
        {!ispLoading && ispInfo && (
          <ISPInfo 
            ispInfo={ispInfo}
            onISPDetected={(isp) => console.log("ISP detected:", isp)}
            onISPManualSet={handleManualISPUpdate}
          />
        )}

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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
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

        <NetworkInfo triggerRefresh={testCompleted} onNetworkDetected={(type) => console.log("Network type:", type)} />

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
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <span>📤</span> Share Your Result
          </button>
        )}

        {!isTestActive && (insights.length > 0 || modeResult || report) && (
          <Insights insights={insights} modeResult={modeResult} report={report} networkType={networkType} />
        )}

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

        {celebration && celebration.show && (
          <CelebrationPopup
            isOpen={celebration.show}
            onClose={() => {
              setCelebration(null);
            }}
            records={celebration.records}
            isFirstTime={celebration.isFirstTime}
            firstTimeType={celebration.firstTimeType}
          />
        )}

        {comparisonPopup && comparisonPopup.show && (
          <ComparisonPopup
            isOpen={comparisonPopup.show}
            onClose={handleComparisonClose}
            improvements={comparisonPopup.improvements}
          />
        )}

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