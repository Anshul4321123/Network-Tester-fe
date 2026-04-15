// Home.tsx - Simplified and maintainable
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
import ServerWarming from "../components/ServerWarming";
import TrustBanner from "../components/TrustBanner";
import AllTimeBest from "../components/AllTimeBest";
import FooterMessage from "../components/FooterMessage";
import ShareButton from "../components/ShareButton";
import { useNetworkDetection } from "../hooks/useNetworkDetection";
import { useServerWarmup } from "../hooks/useServerWarmup";
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

interface RecordBreak {
  type: string;
  oldValue: number;
  newValue: number;
}

// type FirstTimeType = string;

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
  const [selectedServer, setSelectedServer] = useState(() => {
    return localStorage.getItem("selected_server") || "auto";
  });
  
  const [celebration, setCelebration] = useState<any>(null);
  const [comparisonPopup, setComparisonPopup] = useState<any>(null);
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

  const { ispInfo, ispLoading, originalIspName } = useNetworkDetection();
  const serverWarmedUp = useServerWarmup();

  const handleManualISPUpdate = (isp: string) => {
    isISPUpdatingRef.current = true;
    localStorage.setItem("manual_isp", isp);
    setTimeout(() => {
      isISPUpdatingRef.current = false;
    }, 500);
  };

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
  };

  const formatSpeed = (value: number) => {
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const handleRunTest = async () => {
    console.log("🔄 Refreshing ISP before test...");
    localStorage.removeItem("cached_isp_info");
    
    let currentOriginalIsp = originalIspName || "Unknown";
    let currentIp = "unknown";
    
    const finalNetworkType = networkType || "unknown";
    
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

  // Save test result and show popups
  useEffect(() => {
    if (isISPUpdatingRef.current) return;
    if (phase !== "complete" || score === null || download === null || upload === null || ping === null) return;
    
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
      
      const improvements = [
        { type: "download", oldValue: previousTest.download, newValue: currentTest.download, improved: currentTest.download > previousTest.download },
        { type: "upload", oldValue: previousTest.upload, newValue: currentTest.upload, improved: currentTest.upload > previousTest.upload },
        { type: "ping", oldValue: previousTest.ping, newValue: currentTest.ping, improved: currentTest.ping < previousTest.ping },
        { type: "score", oldValue: previousTest.score, newValue: currentTest.score, improved: currentTest.score > previousTest.score },
      ];
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

  if (!serverWarmedUp) {
    return <ServerWarming onComplete={() => {}} />;
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
        <TrustBanner />

        {!ispLoading && ispInfo && (
          <ISPInfo 
            ispInfo={ispInfo}
            onISPDetected={(isp) => console.log("ISP detected:", isp)}
            onISPManualSet={handleManualISPUpdate}
          />
        )}

        <AllTimeBest bestStats={bestStats} formatSpeed={formatSpeed} />

        <NetworkInfo 
          triggerRefresh={testCompleted} 
          onNetworkDetected={(type) => console.log("Network type:", type)}
          testPing={ping}
          testJitter={jitter}
          testDownload={download}
          testUpload={upload}
        />

        {timePattern && <HealthAlert pattern={timePattern} />}

        {!isTestActive && score !== null && (
          <SmartInsight 
             metrics={{ ping, download, upload, jitter, bufferbloat, networkType, score, bestDownload: bestStats?.bestDownload || 0  }} 
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

        {!isTestActive && score !== null && <ShareButton onClick={() => setShowShareCard(true)} />}

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
            onClose={() => setCelebration(null)}
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

        <FooterMessage />
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