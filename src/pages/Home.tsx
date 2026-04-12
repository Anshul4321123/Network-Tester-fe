// Home.tsx - FULLY FIXED with server warming and random facts
import { useEffect, useState, useRef } from "react";
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
import SmartInsight from "../components/SmartInsight";
import HealthAlert from "../components/HealthAlert";
import RealServerSelector from "../components/RealServerSelector";
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
import { detectISP,  type ISPInfo as ISPInfoType } from "../utils/ispDetector";

interface RecordBreak {
  type: string;
  oldValue: number;
  newValue: number;
}

type FirstTimeType = string;

// Random facts to show while server is warming up
const RANDOM_FACTS = [
  "💡 Did you know? The first internet speed test was created in 1996!",
  "⚡ The fastest internet speed ever recorded is 319 Tbps (Terabits per second)!",
  "🌊 The first underwater internet cable was laid in 1858 (for telegraph)!",
  "🎮 Gaming requires less than 50ms ping for a smooth experience!",
  "📺 Streaming 4K Netflix needs about 25 Mbps download speed!",
  "🐌 The average global internet speed is around 90 Mbps!",
  "🚀 5G can be up to 100x faster than 4G!",
  "💾 The first website ever created is still online (info.cern.ch)!",
  "🌍 There are over 5 billion internet users worldwide!",
  "🔌 The first WiFi network was called 'WaveLAN' and ran at 2 Mbps!",
  "📡 Ping measures the time data takes to travel to the server and back!",
  "🎯 Jitter is the variation in ping - lower is better for gaming!",
  "🏆 SpeedLab's scoring system considers download (40%), upload (20%), and ping (40%)!",
  "💪 Your internet speed can be affected by your router, devices, and even weather!",
  "🔄 Speed tests use multiple parallel connections for accuracy!",
];

// Server warming component
// Server warming component - FIXED (removed NodeJS namespace reference)
const ServerWarming = ({ onComplete }: { onComplete: () => void }) => {
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("🔄 Connecting to server...");

  useEffect(() => {
    const startTime = Date.now();
    const minWarmupTime = 2000; // Minimum 2 seconds for user to see facts
    let interval: ReturnType<typeof setInterval> | null = null;

    const warmupServer = async () => {
      try {
        setStatus("📡 Pinging server...");
        const pingStart = performance.now();
        await fetch(`${import.meta.env.VITE_BASE_URL}/ping`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const pingTime = performance.now() - pingStart;
        setStatus(`✅ Server responded in ${pingTime.toFixed(0)}ms!`);
        
        // Rotate facts every 2 seconds
        interval = setInterval(() => {
          setFactIndex(prev => (prev + 1) % RANDOM_FACTS.length);
          setProgress(prev => Math.min(prev + 10, 100));
        }, 200);
        
        // Ensure minimum warmup time
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minWarmupTime - elapsed);
        
        setTimeout(() => {
          if (interval) clearInterval(interval);
          onComplete();
        }, remaining);
        
      } catch (error) {
        console.error("Server warmup failed:", error);
        setStatus("⚠️ Server starting up... (first test may take longer)");
        
        // Still proceed after warmup
        setTimeout(() => {
          if (interval) clearInterval(interval);
          onComplete();
        }, 3000);
      }
    };

    warmupServer();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "#fff",
          maxWidth: "400px",
          padding: "32px",
        }}
      >
        {/* Animated loader */}
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            border: "4px solid rgba(255,255,255,0.2)",
            borderTop: "4px solid #fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        
        {/* Status text */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          {status}
        </div>
        
        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "4px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "2px",
            margin: "16px 0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#fff",
              borderRadius: "2px",
              transition: "width 0.2s ease",
            }}
          />
        </div>
        
        {/* Random fact */}
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: "16px",
            padding: "16px",
            marginTop: "16px",
            animation: "slideUp 0.3s ease",
          }}
        >
          <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "8px" }}>
            ✨ Did you know?
          </div>
          <div style={{ fontSize: "14px", fontWeight: "500", lineHeight: "1.5" }}>
            {RANDOM_FACTS[factIndex]}
          </div>
        </div>
        
        <div
          style={{
            fontSize: "11px",
            opacity: 0.6,
            marginTop: "24px",
          }}
        >
          Warming up server for best performance...
        </div>
      </div>
    </div>
  );
};

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
  const [selectedServer, setSelectedServer] = useState(() => {
    return localStorage.getItem("selected_server") || "auto";
  });
  const [previousIp, setPreviousIp] = useState<string>("");
  const [originalIspName, setOriginalIspName] = useState<string>("");
  const [serverWarmedUp, setServerWarmedUp] = useState(false);
  
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
  
  const isISPUpdatingRef = useRef(false);

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
    timePattern,
  } = useSpeedTest();

  // ============================================
  // SERVER WARMUP - Check if server is responsive
  // ============================================

  useEffect(() => {
    const checkServer = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/ping`, {
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setServerWarmedUp(true);
        } else {
          // Still show UI but mark as warmed up after a delay
          setTimeout(() => setServerWarmedUp(true), 3000);
        }
      } catch (error) {
        // Server might be cold starting, wait a bit
        setTimeout(() => setServerWarmedUp(true), 4000);
      }
    };
    
    checkServer();
  }, []);

  // ============================================
  // ISP REFRESH FUNCTIONS
  // ============================================

  const refreshISPInfo = async () => {
    console.log("🔄 Refreshing ISP info...");
    localStorage.removeItem("cached_isp_info");
    const info = await detectISP();
    if (info) {
      console.log("✅ ISP info refreshed:", info.isp);
      setIspInfo(info);
      setPreviousIp(info.ip || "");
      setOriginalIspName(info.isp || "");
      localStorage.setItem("cached_isp_info", JSON.stringify({ ...info, timestamp: Date.now() }));
    }
  };

  // ============================================
  // NETWORK CHANGE DETECTION
  // ============================================

  useEffect(() => {
    const checkNetworkChange = async () => {
      const currentIp = ispInfo?.ip;
      if (currentIp && previousIp && currentIp !== previousIp) {
        console.log("🌐 Network changed! IP changed from", previousIp, "to", currentIp);
        localStorage.removeItem("cached_isp_info");
        await refreshISPInfo();
      }
      if (currentIp) {
        setPreviousIp(currentIp);
      }
    };
    checkNetworkChange();
  }, [ispInfo?.ip]);

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

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
    isISPUpdatingRef.current = true;
    
    localStorage.setItem("manual_isp", isp);
    if (ispInfo) {
      const updatedISP = { ...ispInfo, isp: isp, timestamp: Date.now() };
      setIspInfo(updatedISP);
      localStorage.setItem("cached_isp_info", JSON.stringify(updatedISP));
    }
    
    setTimeout(() => {
      isISPUpdatingRef.current = false;
    }, 500);
  };

  useEffect(() => {
    const loadISP = async () => {
      setIspLoading(true);
      localStorage.removeItem("cached_isp_info");
      const info = await detectISP();
      if (info) {
        setIspInfo(info);
        setPreviousIp(info.ip || "");
        setOriginalIspName(info.isp || "");
        localStorage.setItem("cached_isp_info", JSON.stringify({ ...info, timestamp: Date.now() }));
      }
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

  const handleServerChange = (serverId: string, baseUrl: string) => {
    setSelectedServer(serverId);
    localStorage.setItem("selected_server", serverId);
    localStorage.setItem("selected_server_url", baseUrl);
    console.log(`Server changed to: ${serverId} with URL: ${baseUrl}`);
  };

  // Save test result and show popups
  useEffect(() => {
    if (isISPUpdatingRef.current) {
      return;
    }
    
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
    
    const finalIsp = originalIspName || ispInfo?.isp || "Unknown";
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
      hour: new Date().getHours(),
    };
    
    saveResult(testResult);
    saveBestScore(score);
    saveBestStats(score, download, upload, ping);
    
    const historyList = getHistory();
    let comparisonData = null;
    
    if (historyList.length >= 2) {
      const previousTest = historyList[1];
      const currentTest = historyList[0];
      
      const improvements = [];
      
      improvements.push({
        type: "download",
        oldValue: previousTest.download,
        newValue: currentTest.download,
        improved: currentTest.download > previousTest.download
      });
      
      improvements.push({
        type: "upload",
        oldValue: previousTest.upload,
        newValue: currentTest.upload,
        improved: currentTest.upload > previousTest.upload
      });
      
      improvements.push({
        type: "ping",
        oldValue: previousTest.ping,
        newValue: currentTest.ping,
        improved: currentTest.ping < previousTest.ping
      });
      
      improvements.push({
        type: "score",
        oldValue: previousTest.score,
        newValue: currentTest.score,
        improved: currentTest.score > previousTest.score
      });
      
      comparisonData = { improvements };
    }
    
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
    
    setBestScore(getBestScore());
    setBestStats(getBestStats());
    setHistory(getHistory());
    setAchievements(getAchievements());
    
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
    else if (comparisonData && historyList.length >= 2) {
      setComparisonPopup({
        show: true,
        improvements: comparisonData.improvements
      });
      setLastProcessedTestId(testId);
    }
    
  }, [phase, score, download, upload, ping, jitter, networkType, ispInfo, running, originalIspName]);

  // History sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (isISPUpdatingRef.current) return;
      
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

  const handleRunTest = async () => {
    console.log("🔄 Refreshing ISP before test...");
    
    localStorage.removeItem("cached_isp_info");
    const freshInfo = await detectISP();
    
    let currentOriginalIsp = "Unknown";
    let currentIp = "unknown";
    
    if (freshInfo) {
      currentOriginalIsp = freshInfo.isp || "Unknown";
      currentIp = freshInfo.ip || "unknown";
      setOriginalIspName(currentOriginalIsp);
      setIspInfo(freshInfo);
      setPreviousIp(currentIp);
      localStorage.setItem("cached_isp_info", JSON.stringify({ ...freshInfo, timestamp: Date.now() }));
    } else {
      currentOriginalIsp = originalIspName || ispInfo?.isp || "Unknown";
      currentIp = ispInfo?.ip || "unknown";
    }
    
    const finalNetworkType = networkType || "unknown";
    
    console.log("🚀 Running test with ISP:", currentOriginalIsp);
    console.log("📡 IP:", currentIp);
    
    runTest("manual", testSelection, currentOriginalIsp, finalNetworkType, currentIp);
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

  // Show server warming screen if not warmed up yet
  if (!serverWarmedUp) {
    return <ServerWarming onComplete={() => setServerWarmedUp(true)} />;
  }

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
        <div
          style={{
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            borderRadius: "12px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "11px",
            color: "#92400e",
            border: "1px solid #fbbf24",
          }}
        >
          <span style={{ fontSize: "16px" }}>📍</span>
          <div style={{ flex: 1 }}>
            <strong>ℹ️ Single-Region Test</strong> — Results may vary based on your distance from our test server.
            <span style={{ fontSize: "10px", opacity: 0.8, display: "block", marginTop: "2px" }}>
              For best results, test multiple times at different hours.
            </span>
          </div>
        </div>

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

        {timePattern && <HealthAlert pattern={timePattern} />}

        {!isTestActive && score !== null && (
          <SmartInsight 
            metrics={{ ping, download, upload, jitter, bufferbloat, networkType, score }} 
          />
        )}

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

        <RealServerSelector onServerChange={handleServerChange} currentServerId={selectedServer} />

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

        <div
          style={{
            marginTop: "8px",
            marginBottom: "16px",
            padding: "10px 12px",
            background: "rgba(139,92,246,0.08)",
            borderRadius: "10px",
            border: "1px solid rgba(139,92,246,0.15)",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px" }}>🔬</span>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#6d28d9" }}>
              Early Access Feature
            </span>
            <span style={{ fontSize: "12px" }}>💡</span>
          </div>
          <p style={{ fontSize: "10px", color: "#4c1d95", margin: 0, opacity: 0.8 }}>
            We're constantly improving accuracy and adding features. 
            Your feedback helps us build a better speed test! 
            <span style={{ display: "block", fontSize: "9px", marginTop: "3px", opacity: 0.7 }}>
              🚀 More servers, advanced analytics, and detailed reports coming soon.
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}