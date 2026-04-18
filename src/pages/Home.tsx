// Home.tsx - Share button moved to dedicated section
import { useEffect, useState} from "react";
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
// import ShareButton from "../components/ShareButton";
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
import PingScanner from "../components/PingScanner";
import SmartRedirectPopup from "../components/SmartRedirectPopup";

// ============================================
// ENHANCED COLLAPSIBLE SECTION COMPONENT
// ============================================

interface SectionConfig {
  icon: string;
  title: string;
  description: string;
  hoverInfo: string[];
  features?: string[];
  highlight?: boolean;
}

const SECTIONS: Record<string, SectionConfig> = {
  network: {
    icon: "🌐",
    title: "Network Details",
    description: "Manage your networks and connection settings",
    hoverInfo: ["🏷️ Name your networks", "📡 Detect connection type", "🌍 Select test server"],
    features: ["Custom network names", "Auto-detection", "Server selector"]
  },
  tools: {
    icon: "🛠️",
    title: "Tools",
    description: "Extra tools to optimize your connection",
    hoverInfo: ["📡 Live ping scanner", "📤 Find best signal spot", "📍 Signal strength meter"],
    features: ["Ping Scanner", "Signal Finder", "Real-time monitoring"],
    highlight: true
  },
  insights: {
    icon: "🧠",
    title: "Insights & Analysis",
    description: "Smart analysis of your connection quality",
    hoverInfo: ["📊 Performance trends", "🎮 Gaming analysis", "📺 Streaming insights"],
    features: ["Trend analysis", "Mode-specific tips", "Health alerts"]
  },
  advanced: {
    icon: "⚙️",
    title: "Advanced",
    description: "Detailed metrics and monitoring",
    hoverInfo: ["📦 Bufferbloat measurement", "🔔 Auto monitoring", "📜 Test history"],
    features: ["Bufferbloat", "Auto tests", "History export"]
  }
};

function EnhancedCollapsibleSection({ 
  sectionKey, 
  children, 
  defaultOpen = false,
  onToggle,
  isHighlighted = false
}: { 
  sectionKey: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  isHighlighted?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showTooltip, setShowTooltip] = useState(false);
  const section = SECTIONS[sectionKey];
  
  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };
  
  return (
    <div 
      style={{
        background: isHighlighted 
          ? "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)"
          : "rgba(255,255,255,0.7)",
        borderRadius: "16px",
        padding: "12px",
        border: isHighlighted 
          ? "1px solid rgba(59,130,246,0.3)"
          : "1px solid rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
        position: "relative",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Hover Tooltip */}
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          left: "0",
          marginBottom: "8px",
          background: "#1e293b",
          borderRadius: "12px",
          padding: "10px 14px",
          minWidth: "200px",
          zIndex: 200,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.1)",
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#fff", marginBottom: "6px" }}>
            {section.icon} {section.title}
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "8px" }}>
            {section.description}
          </div>
          <div style={{ fontSize: "9px", color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "6px" }}>
            {section.hoverInfo.map((info, i) => (
              <div key={i} style={{ marginBottom: "2px" }}>{info}</div>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={handleToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          <span style={{ fontSize: "18px" }}>{section.icon}</span>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{section.title}</span>
              {isHighlighted && (
                <span style={{ 
                  fontSize: "9px", 
                  background: "#3b82f6", 
                  color: "#fff", 
                  padding: "2px 8px", 
                  borderRadius: "20px",
                  fontWeight: "500"
                }}>
                  NEW
                </span>
              )}
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
              {section.description}
            </div>
          </div>
        </div>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{isOpen ? "▼" : "▶"}</span>
      </button>
      
      {/* Feature Preview (when closed) */}
      {!isOpen && (
        <div style={{ 
          display: "flex", 
          gap: "6px", 
          marginTop: "8px", 
          paddingTop: "8px", 
          borderTop: "1px solid rgba(0,0,0,0.05)",
          flexWrap: "wrap"
        }}>
          {section.features?.slice(0, 3).map((feature, i) => (
            <span key={i} style={{ 
              fontSize: "9px", 
              background: "rgba(0,0,0,0.04)", 
              padding: "2px 8px", 
              borderRadius: "12px",
              color: "#64748b"
            }}>
              {feature}
            </span>
          ))}
          {section.features && section.features.length > 3 && (
            <span style={{ fontSize: "9px", color: "#94a3b8" }}>+{section.features.length - 3} more</span>
          )}
        </div>
      )}
      
      {isOpen && <div style={{ marginTop: "12px" }}>{children}</div>}
    </div>
  );
}

// Quick Stats Bar Component
function QuickStatsBar({ bestStats, formatSpeed }: { bestStats: any; formatSpeed: (v: number) => string }) {
  if (!bestStats) return null;
  
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-around",
      padding: "8px",
      background: "rgba(16,185,129,0.08)",
      borderRadius: "12px",
      marginBottom: "12px",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "10px", color: "#64748b" }}>🏆 Best Score</div>
        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#10b981" }}>{bestStats.bestScore}/100</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "10px", color: "#64748b" }}>⚡ Best Download</div>
        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#3b82f6" }}>{formatSpeed(bestStats.bestDownload)}</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "10px", color: "#64748b" }}>📡 Best Ping</div>
        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#10b981" }}>{bestStats.bestPing.toFixed(0)}ms</div>
      </div>
    </div>
  );
}

// Share Card Component (Dedicated)
function ShareResultCard({ score, onClick, isVisible }: { score: number | null; onClick: () => void; isVisible: boolean }) {
  if (!isVisible || score === null) return null;
  
  return (
    <div style={{
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      borderRadius: "16px",
      padding: "12px 16px",
      border: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "24px" }}>📤</span>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#1e293b" }}>Share Your Results</div>
          <div style={{ fontSize: "9px", color: "#64748b" }}>Show off your speed!</div>
        </div>
      </div>
      <button
        onClick={onClick}
        style={{
          padding: "8px 20px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "none",
          borderRadius: "40px",
          color: "#fff",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "500",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)" }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)" }}
      >
        Share Now →
      </button>
    </div>
  );
}

// Network Selector Component
const DEFAULT_NETWORKS = [
  "Home Network",
  "Office Network",
  "Cafe WiFi",
  "Mobile Data",
  "Gaming Network",
  "Streaming Network",
];

function NetworkSelector({ networkName, setNetworkName, savedNetworks, setSavedNetworks }: any) {
  const [showAddNetwork, setShowAddNetwork] = useState(false);
  const [newNetworkName, setNewNetworkName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAddNetwork = () => {
    if (newNetworkName.trim() && !savedNetworks.includes(newNetworkName.trim())) {
      const updatedNetworks = [...savedNetworks, newNetworkName.trim()];
      setSavedNetworks(updatedNetworks);
      setNetworkName(newNetworkName.trim());
      setNewNetworkName("");
      setShowAddNetwork(false);
    }
  };

  const handleDeleteNetwork = (networkToDelete: string) => {
    if (savedNetworks.length <= 1) {
      alert("You need at least one network name.");
      return;
    }
    const updatedNetworks = savedNetworks.filter((n:String) => n !== networkToDelete);
    setSavedNetworks(updatedNetworks);
    if (networkName === networkToDelete && updatedNetworks.length > 0) {
      setNetworkName(updatedNetworks[0]);
    }
    setShowDeleteConfirm(null);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.network-dropdown')) setIsDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="network-dropdown" style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>🏷️</span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Network</span>
        </div>
        <button onClick={() => setShowAddNetwork(true)} style={{ fontSize: "10px", color: "#10b981", background: "none", border: "none", cursor: "pointer" }}>
          + Add
        </button>
      </div>
      
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        style={{
          padding: "8px 12px",
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          fontSize: "13px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{networkName}</span>
        <span>{isDropdownOpen ? "▲" : "▼"}</span>
      </div>

      {isDropdownOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 100,
          maxHeight: "200px",
          overflowY: "auto",
        }}>
          {savedNetworks.map((net: string) => (
            <div key={net} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px" }}>
              <span onClick={() => { setNetworkName(net); setIsDropdownOpen(false); }} style={{ flex: 1, cursor: "pointer" }}>{net}</span>
              {savedNetworks.length > 1 && (
                <button onClick={() => setShowDeleteConfirm(net)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddNetwork && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowAddNetwork(false)}>
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", width: "280px" }} onClick={e => e.stopPropagation()}>
            <h4 style={{ marginBottom: "12px" }}>Add Network</h4>
            <input type="text" value={newNetworkName} onChange={e => setNewNetworkName(e.target.value)} placeholder="Network name" style={{ width: "100%", padding: "8px", marginBottom: "12px", border: "1px solid #e2e8f0", borderRadius: "8px" }} autoFocus />
            <button onClick={handleAddNetwork} style={{ width: "100%", padding: "8px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Add</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowDeleteConfirm(null)}>
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", width: "260px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <p>Delete "{showDeleteConfirm}"?</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={() => handleDeleteNetwork(showDeleteConfirm)} style={{ flex: 1, padding: "8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Delete</button>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, padding: "8px", background: "#e2e8f0", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN HOME COMPONENT
// ============================================

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
  const [selectedServer, setSelectedServer] = useState(() => localStorage.getItem("selected_server") || "auto");
  const [networkName, setNetworkName] = useState(() => localStorage.getItem("network_name") || "Home Network");
  const [savedNetworks, setSavedNetworks] = useState<string[]>(() => {
    const saved = localStorage.getItem("saved_networks");
    return saved ? JSON.parse(saved) : [...DEFAULT_NETWORKS];
  });
  const [celebration, setCelebration] = useState<any>(null);
  const [comparisonPopup, setComparisonPopup] = useState<any>(null);
  const [lastProcessedTestId, setLastProcessedTestId] = useState<string>("");
  const [showPingScanner, setShowPingScanner] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  
  // Smart Popup State
  const [smartPopup, setSmartPopup] = useState<{
    isOpen: boolean;
    type: "high-latency" | "history" | "feature-highlight" | "achievement";
    data?: any;
  }>({ isOpen: false, type: "high-latency" });
  
  const [hasSeenFeaturePopup, setHasSeenFeaturePopup] = useState(() => {
    return localStorage.getItem("has_seen_ping_feature") === "true";
  });

  const {
    ping, download, upload, jitter, phase, report, runTest,
    downloadHistory, uploadHistory, pingHistory, jitterHistory,
    score, insights, mode, setMode, modeResult, bufferbloat,
    networkType, running, autoRun, setAutoRun, monitorPing, timePattern,
  } = useSpeedTest();

  const serverWarmedUp = useServerWarmup();

  // Smart Popup Triggers
  useEffect(() => {
    if (phase === "complete" && ping && ping > 100 && !smartPopup.isOpen) {
      const lastShown = localStorage.getItem("last_latency_popup");
      const now = Date.now();
      if (!lastShown || now - parseInt(lastShown) > 3600000) {
        setTimeout(() => {
          setSmartPopup({ isOpen: true, type: "high-latency", data: { ping } });
          localStorage.setItem("last_latency_popup", now.toString());
        }, 1000);
      }
    }
  }, [phase, ping]);

  useEffect(() => {
    const testCount = history.length;
    const hasSeenHistoryPopup = localStorage.getItem("has_seen_history_popup");
    if (testCount >= 3 && !hasSeenHistoryPopup && !smartPopup.isOpen && phase === "complete") {
      setTimeout(() => {
        setSmartPopup({ isOpen: true, type: "history", data: { testCount } });
        localStorage.setItem("has_seen_history_popup", "true");
      }, 2000);
    }
  }, [history.length, phase]);

  useEffect(() => {
    if (!hasSeenFeaturePopup && phase === "complete" && score !== null && !smartPopup.isOpen) {
      setTimeout(() => {
        setSmartPopup({ isOpen: true, type: "feature-highlight", data: { featureName: "Live Ping Scanner" } });
        setHasSeenFeaturePopup(true);
        localStorage.setItem("has_seen_ping_feature", "true");
      }, 3000);
    }
  }, [phase, score]);

  const handleSmartPopupAction = (action: string) => {
    if (action === "open-ping-scanner") {
      setShowPingScanner(true);
      setOpenSections(prev => ({ ...prev, tools: true }));
      setTimeout(() => {
        const pingScannerElement = document.getElementById("ping-scanner-card");
        if (pingScannerElement) {
          pingScannerElement.style.boxShadow = "0 0 0 3px #3b82f6";
          pingScannerElement.style.transition = "box-shadow 0.3s ease";
          setTimeout(() => { pingScannerElement.style.boxShadow = ""; }, 3000);
        }
      }, 300);
    } else if (action === "view-history") {
      window.location.href = "/history";
    }
  };

  // Save to localStorage
  useEffect(() => {
    if (networkName) localStorage.setItem("network_name", networkName);
  }, [networkName]);
  useEffect(() => {
    localStorage.setItem("saved_networks", JSON.stringify(savedNetworks));
  }, [savedNetworks]);
  useEffect(() => {
    const handleVisibilityChange = () => setIsTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
  useEffect(() => {
    if (showLiveGraph && (running || phase === "download" || phase === "upload" || phase === "ping")) {
      setShowGraphPopup(true);
    }
  }, [running, phase, showLiveGraph]);
  useEffect(() => {
    if (phase === "complete") setTestCompleted(prev => prev + 1);
  }, [phase]);
  useEffect(() => {
    saveTestSelection(testSelection);
  }, [testSelection]);

  const handleComparisonClose = () => setComparisonPopup(null);
  const handleServerChange = (serverId: string, baseUrl: string) => {
    setSelectedServer(serverId);
    localStorage.setItem("selected_server", serverId);
    localStorage.setItem("selected_server_url", baseUrl);
  };
  const formatSpeed = (value: number) => value > 1000 ? `${(value / 1000).toFixed(1)} Gbps` : `${value.toFixed(1)} Mbps`;

  const handleRunTest = async () => {
    const finalNetworkType = networkType || "unknown";
    const currentNetworkName = networkName || "Home Network";
    localStorage.setItem("test_network_name", currentNetworkName);
    localStorage.setItem("test_start_time", Date.now().toString());
    runTest("manual", testSelection, currentNetworkName, finalNetworkType);
  };

  const getBackgroundStyle = () => running ? {
    background: "linear-gradient(135deg, #e0f2fe 0%, #fae8ff 50%, #dbeafe 100%)",
    transition: "background 0.5s ease",
    minHeight: "100vh",
  } : {
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)",
    transition: "background 0.5s ease",
    minHeight: "100vh",
  };

  // Save test result
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
    localStorage.removeItem("test_network_name");
    localStorage.removeItem("test_start_time");
    
    const testResult: SpeedTestRecord = {
      date: new Date().toLocaleString(),
      ping, jitter: jitter || 0, download, upload, score,
      networkName: finalNetworkName, networkType: finalNetworkType, hour: new Date().getHours(),
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
    if (!currentAchievements.hasRunPing && ping > 0) { newAchievements.push({ type: "ping", value: ping }); updateAchievement("ping"); }
    if (!currentAchievements.hasRunJitter && jitter !== null && jitter >= 0) { newAchievements.push({ type: "jitter", value: jitter }); updateAchievement("jitter"); }
    if (!currentAchievements.hasRunDownload && download > 0) { newAchievements.push({ type: "download", value: download }); updateAchievement("download"); }
    if (!currentAchievements.hasRunUpload && upload > 0) { newAchievements.push({ type: "upload", value: upload }); updateAchievement("upload"); }
    
    setBestScore(getBestScore());
    setBestStats(getBestStats());
    setHistory(getHistory());
    setAchievements(getAchievements());
    
    if (newAchievements.length > 0) {
      const achievementRecords = newAchievements.map(a => ({ type: a.type === "jitter" ? "ping" : a.type, oldValue: a.value, newValue: a.value }));
      setCelebration({ show: true, records: achievementRecords, isFirstTime: true, firstTimeType: newAchievements[0]?.type });
      setLastProcessedTestId(testId);
    } else if (comparisonData && historyList.length >= 2) {
      setComparisonPopup({ show: true, improvements: comparisonData.improvements });
      setLastProcessedTestId(testId);
    }
  }, [phase, score, download, upload, ping, jitter, networkType, running]);

  // History sync
  useEffect(() => {
    const interval = setInterval(() => {
      const newHistory = getHistory();
      if (JSON.stringify(newHistory) !== JSON.stringify(history)) setHistory(newHistory);
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
  const isMainTestRunning = running || (phase !== "idle" && phase !== "complete");

  if (!serverWarmedUp) return <ServerWarming onComplete={() => {}} />;

  const showMetrics = score !== null && phase === "complete";
  const showSmartInsight = !isTestActive && score !== null;
  const showHealthAlert = timePattern && !isTestActive;
  const showNetworkInfo = !isTestActive;

  return (
    <div style={getBackgroundStyle()}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "clamp(12px, 4vw, 24px)", display: "flex", flexDirection: "column", gap: "12px" }}>
        
        {/* ========== ABOVE THE FOLD ========== */}
        
        <TrustBanner />
        
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

        {bestStats && <QuickStatsBar bestStats={bestStats} formatSpeed={formatSpeed} />}

        {/* ========== SHARE SECTION (Dedicated, right below Hero after test) ========== */}
        <ShareResultCard 
          score={score}
          isVisible={!isTestActive && score !== null}
          onClick={() => setShowShareCard(true)}
        />

        {/* ========== AFTER TEST (Progressive Reveal) ========== */}
        
        {showMetrics && (
          <>
            {showSmartInsight && (
              <div style={{ animation: "fadeInUp 0.4s ease" }}>
                <SmartInsight 
                  metrics={{ ping, download, upload, jitter, bufferbloat, networkType, score, bestDownload: bestStats?.bestDownload || 0 }} 
                />
              </div>
            )}
            {showHealthAlert && <HealthAlert pattern={timePattern} />}
          </>
        )}



        {/* ========== ENHANCED COLLAPSIBLE SECTIONS ========== */}
        
        {/* Section 1: Network Details */}
        <EnhancedCollapsibleSection 
          sectionKey="network"
          defaultOpen={openSections.network || false}
          onToggle={(isOpen) => setOpenSections(prev => ({ ...prev, network: isOpen }))}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <NetworkSelector 
              networkName={networkName}
              setNetworkName={setNetworkName}
              savedNetworks={savedNetworks}
              setSavedNetworks={setSavedNetworks}
            />
            {showNetworkInfo && (
              <NetworkInfo 
                triggerRefresh={testCompleted} 
                onNetworkDetected={(type) => console.log("Network type:", type)}
                testPing={ping}
                testJitter={jitter}
                testDownload={download}
                testUpload={upload}
              />
            )}
            <RealServerSelector onServerChange={handleServerChange} currentServerId={selectedServer} />
          </div>
        </EnhancedCollapsibleSection>

        {/* Section 2: Tools (Ping Scanner - HIGHLIGHTED) - Share button removed from here */}
        <EnhancedCollapsibleSection 
          sectionKey="tools"
          defaultOpen={openSections.tools || false}
          onToggle={(isOpen) => setOpenSections(prev => ({ ...prev, tools: isOpen }))}
          isHighlighted={true}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div id="ping-scanner-card" style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)",
              borderRadius: "12px",
              padding: "12px",
              border: "1px solid rgba(59,130,246,0.3)",
              transition: "box-shadow 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "20px" }}>📡</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Live Ping Scanner</div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>Find your best signal spot by walking around</div>
                </div>
              </div>
              <button
                onClick={() => setShowPingScanner(true)}
                disabled={isMainTestRunning}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: isMainTestRunning ? "#94a3b8" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  border: "none",
                  borderRadius: "40px",
                  color: "#fff",
                  cursor: isMainTestRunning ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                  opacity: isMainTestRunning ? 0.6 : 1,
                }}
              >
                🔍 Open Ping Scanner
              </button>
            </div>
          </div>
        </EnhancedCollapsibleSection>

        {/* Section 3: Insights & Analysis */}
        <EnhancedCollapsibleSection 
          sectionKey="insights"
          defaultOpen={openSections.insights || false}
          onToggle={(isOpen) => setOpenSections(prev => ({ ...prev, insights: isOpen }))}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {!isTestActive && (insights.length > 0 || modeResult || report) && (
              <Insights insights={insights} modeResult={modeResult} report={report} networkType={networkType} />
            )}
            <AllTimeBest bestStats={bestStats} formatSpeed={formatSpeed} />
          </div>
        </EnhancedCollapsibleSection>

        {/* Section 4: Advanced Details */}
        <EnhancedCollapsibleSection 
          sectionKey="advanced"
          defaultOpen={openSections.advanced || false}
          onToggle={(isOpen) => setOpenSections(prev => ({ ...prev, advanced: isOpen }))}
        >
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
        </EnhancedCollapsibleSection>

        <FooterMessage />
      </div>

      {/* Popups */}
      <PingScanner isOpen={showPingScanner} onClose={() => setShowPingScanner(false)} />
      
      <SmartRedirectPopup 
        isOpen={smartPopup.isOpen}
        onClose={() => setSmartPopup({ isOpen: false, type: "high-latency" })}
        onAction={handleSmartPopupAction}
        type={smartPopup.type}
        data={smartPopup.data}
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
        <CelebrationPopup isOpen={celebration.show} onClose={() => setCelebration(null)} records={celebration.records} isFirstTime={celebration.isFirstTime} firstTimeType={celebration.firstTimeType} />
      )}
      
      {comparisonPopup && comparisonPopup.show && (
        <ComparisonPopup isOpen={comparisonPopup.show} onClose={handleComparisonClose} improvements={comparisonPopup.improvements} />
      )}
      
      {showShareCard && (
        <ShareableResultCard score={score} ping={ping} download={download} upload={upload} jitter={jitter} networkType={networkType} mode={mode} modeResult={modeResult} onClose={() => setShowShareCard(false)} />
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}