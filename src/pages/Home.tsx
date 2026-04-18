// Home.tsx - With cross icons on dropdown items
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
import SmartInsight from "../components/SmartInsight";
import HealthAlert from "../components/HealthAlert";
import RealServerSelector from "../components/RealServerSelector";
import ServerWarming from "../components/ServerWarming";
import TrustBanner from "../components/TrustBanner";
import AllTimeBest from "../components/AllTimeBest";
import FooterMessage from "../components/FooterMessage";
import ShareButton from "../components/ShareButton";
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

// Predefined network options (without emojis)
const DEFAULT_NETWORKS = [
  "Home Network",
  "Office Network",
  "Cafe WiFi",
  "Mobile Data",
  "Gaming Network",
  "Streaming Network",
];

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
  
  // Network name management
  const [networkName, setNetworkName] = useState(() => {
    return localStorage.getItem("network_name") || "Home Network";
  });
  const [savedNetworks, setSavedNetworks] = useState<string[]>(() => {
    const saved = localStorage.getItem("saved_networks");
    if (saved) {
      return JSON.parse(saved);
    }
    return [...DEFAULT_NETWORKS];
  });
  const [showAddNetwork, setShowAddNetwork] = useState(false);
  const [newNetworkName, setNewNetworkName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [celebration, setCelebration] = useState<any>(null);
  const [comparisonPopup, setComparisonPopup] = useState<any>(null);
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
    timePattern,
  } = useSpeedTest();

  const serverWarmedUp = useServerWarmup();

  // Save network name to localStorage
  useEffect(() => {
    if (networkName) {
      localStorage.setItem("network_name", networkName);
    }
  }, [networkName]);

  // Save networks list to localStorage
  useEffect(() => {
    localStorage.setItem("saved_networks", JSON.stringify(savedNetworks));
  }, [savedNetworks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.network-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAddNetwork = () => {
    if (newNetworkName.trim() && !savedNetworks.includes(newNetworkName.trim())) {
      const updatedNetworks = [...savedNetworks, newNetworkName.trim()];
      setSavedNetworks(updatedNetworks);
      setNetworkName(newNetworkName.trim());
      setNewNetworkName("");
      setShowAddNetwork(false);
    } else if (newNetworkName.trim() && savedNetworks.includes(newNetworkName.trim())) {
      alert("This network name already exists!");
    }
  };

  const handleDeleteNetwork = (networkToDelete: string) => {
    // Don't allow deleting if it's the last network
    if (savedNetworks.length <= 1) {
      alert("You need at least one network name. Add a new one first.");
      setShowDeleteConfirm(null);
      return;
    }
    
    const updatedNetworks = savedNetworks.filter(n => n !== networkToDelete);
    setSavedNetworks(updatedNetworks);
    
    // If the deleted network was selected, select the first available
    if (networkName === networkToDelete && updatedNetworks.length > 0) {
      setNetworkName(updatedNetworks[0]);
    }
    setShowDeleteConfirm(null);
    setIsDropdownOpen(false);
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
    console.log("🚀 Starting speed test...");
    
    const finalNetworkType = networkType || "unknown";
    const currentNetworkName = networkName || "Home Network";
    
    console.log("📡 TEST USING Network Name:", currentNetworkName);
    console.log("🌐 TEST USING Network Type:", finalNetworkType);
    
    // Store the network name used for this test
    localStorage.setItem("test_network_name", currentNetworkName);
    localStorage.setItem("test_start_time", Date.now().toString());
    
    runTest("manual", testSelection, currentNetworkName, finalNetworkType);
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
    const testNetworkName = localStorage.getItem("test_network_name");
    const finalNetworkName = testNetworkName || networkName || "Home Network";
    const finalNetworkType = networkType || "unknown";

    // Clear test start data after use
    localStorage.removeItem("test_network_name");
    localStorage.removeItem("test_start_time");
    
    const testResult: SpeedTestRecord = {
      date: new Date().toLocaleString(),
      ping: ping,
      jitter: jitter || 0,
      download: download,
      upload: upload,
      score: score,
      networkName: finalNetworkName, 
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
    
  }, [phase, score, download, upload, ping, jitter, networkType, running]);

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

        {/* Network Name Dropdown Selector with Cross Icons */}
        <div className="network-dropdown" style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderRadius: "12px",
          padding: "12px 14px",
          border: "1px solid #e2e8f0",
          position: "relative",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontSize: "16px" }}>🏷️</span>
            <div style={{ fontSize: "10px", color: "#64748b", flex: 1 }}>Network Name</div>
            <button
              onClick={() => setShowAddNetwork(true)}
              style={{
                padding: "4px 8px",
                background: "#10b981",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "10px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              + Add New
            </button>
          </div>

          {/* Custom Dropdown Button */}
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "#fff",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#1e293b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{networkName}</span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{isDropdownOpen ? "▲" : "▼"}</span>
          </div>

          {/* Dropdown Menu with Cross Icons */}
          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% - 8px)",
                left: "14px",
                right: "14px",
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 100,
                maxHeight: "250px",
                overflowY: "auto",
              }}
            >
              {savedNetworks.map((net) => (
                <div
                  key={net}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderBottom: "1px solid #f1f5f9",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    onClick={() => {
                      setNetworkName(net);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      color: "#1e293b",
                    }}
                  >
                    {net}
                  </span>
                  {savedNetworks.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(net);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#94a3b8",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#ef4444";
                        e.currentTarget.style.background = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#94a3b8";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Network Modal */}
        {showAddNetwork && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowAddNetwork(false)}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                maxWidth: "350px",
                width: "90%",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>➕</div>
              <h3 style={{ marginBottom: "8px", fontSize: "18px" }}>Add Network Name</h3>
              <p style={{ color: "#64748b", marginBottom: "16px", fontSize: "12px" }}>
                Enter a name for this network (e.g., Home WiFi, Office, Cafe)
              </p>
              <input
                type="text"
                value={newNetworkName}
                onChange={(e) => setNewNetworkName(e.target.value)}
                placeholder="e.g., Home WiFi"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  marginBottom: "16px",
                  outline: "none",
                }}
                autoFocus
              />
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleAddNetwork}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#10b981",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddNetwork(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "10px",
                    color: "#64748b",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                maxWidth: "350px",
                width: "90%",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
              <h3 style={{ marginBottom: "8px", fontSize: "18px" }}>Delete Network?</h3>
              <p style={{ color: "#64748b", marginBottom: "16px", fontSize: "12px" }}>
                Are you sure you want to delete "{showDeleteConfirm}"?
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleDeleteNetwork(showDeleteConfirm)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#ef4444",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "10px",
                    color: "#64748b",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
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