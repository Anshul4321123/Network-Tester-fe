// Home.tsx
// Post-test popup sequence: HighScore → Comparison → SmartRedirect (one, no auto-dismiss)
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
import SmartInsight from "../components/SmartInsight";
import HealthAlert from "../components/HealthAlert";
import RealServerSelector from "../components/RealServerSelector";
import ServerWarming from "../components/ServerWarming";
import TrustBanner from "../components/TrustBanner";
import AllTimeBest from "../components/AllTimeBest";
import FooterMessage from "../components/FooterMessage";
import { useServerWarmup } from "../hooks/useServerWarmup";
import {
  getHistory, getBestScore, getBestStats,
  saveTestSelection, loadTestSelection,
  getAchievements, updateAchievement,
  saveResult, saveBestScore, saveBestStats,
  type SpeedTestRecord, type BestStats, type Achievements,
} from "../utils/storage";
import PingScanner from "../components/PingScanner";
import SmartRedirectPopup from "../components/SmartRedirectPopup";
import HighScorePopup, { type HighScoreRecord } from "../components/HighScorePopup";

// ─────────────────────────────────────────────────────────────
// Smart-redirect popup priority queue
// ─────────────────────────────────────────────────────────────
type SmartPopupType = "high-latency" | "history" | "feature-highlight" | "achievement" | "try-tools";
interface PendingSmartPopup { priority: number; type: SmartPopupType; data?: any; }
const SMART_PRIORITY: Record<SmartPopupType, number> = {
  "high-latency": 1, "achievement": 2, "feature-highlight": 3, "history": 4, "try-tools": 5,
};

// ─────────────────────────────────────────────────────────────
// Post-test popup chain
// Sequence: highscore → comparison → smart (one only)
// Each stage calls advanceChain() when it closes.
// ─────────────────────────────────────────────────────────────
type ChainStage = "highscore" | "comparison" | "smart" | "done";

// ─────────────────────────────────────────────────────────────
// High-score detection helpers
// ─────────────────────────────────────────────────────────────
const HS_KEY = "best_stats_5d"; // localStorage key

interface BestStats5d {
  score: number;
  download: number;
  upload: number;
  ping: number;
  updatedAt: number; // timestamp
}

function load5dBest(): BestStats5d | null {
  try {
    const raw = localStorage.getItem(HS_KEY);
    if (!raw) return null;
    const v: BestStats5d = JSON.parse(raw);
    // Expire after 5 days
    if (Date.now() - v.updatedAt > 5 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(HS_KEY);
      return null;
    }
    return v;
  } catch { return null; }
}

function save5dBest(score: number, download: number, upload: number, ping: number) {
  const existing = load5dBest();
  const updated: BestStats5d = {
    score:    existing ? Math.max(existing.score,    score)    : score,
    download: existing ? Math.max(existing.download, download) : download,
    upload:   existing ? Math.max(existing.upload,   upload)   : upload,
    ping:     existing ? Math.min(existing.ping,     ping)     : ping, // lower is better
    updatedAt: Date.now(),
  };
  localStorage.setItem(HS_KEY, JSON.stringify(updated));
}

/**
 * Compare current test results against the 5-day best.
 * Returns an array of broken records, sorted by "impressiveness"
 * (biggest % improvement first), or empty if nothing was beaten.
 */
function detectHighScores(
  score: number, download: number, upload: number, ping: number,
): HighScoreRecord[] {
  const prev = load5dBest();
  const records: HighScoreRecord[] = [];

  if (!prev) {
    // First-ever record — everything is a "first"
    records.push(
      { metric: "score",    oldValue: 0, newValue: score,    isFirstEver: true },
      { metric: "download", oldValue: 0, newValue: download, isFirstEver: true },
      { metric: "upload",   oldValue: 0, newValue: upload,   isFirstEver: true },
      { metric: "ping",     oldValue: 0, newValue: ping,     isFirstEver: true },
    );
    return records;
  }

  if (score    > prev.score)    records.push({ metric: "score",    oldValue: prev.score,    newValue: score,    isFirstEver: false });
  if (download > prev.download) records.push({ metric: "download", oldValue: prev.download, newValue: download, isFirstEver: false });
  if (upload   > prev.upload)   records.push({ metric: "upload",   oldValue: prev.upload,   newValue: upload,   isFirstEver: false });
  if (ping     < prev.ping)     records.push({ metric: "ping",     oldValue: prev.ping,     newValue: ping,     isFirstEver: false });

  // Sort by biggest relative improvement first
  records.sort((a, b) => {
    const pctA = a.metric === "ping"
      ? (a.oldValue - a.newValue) / (a.oldValue || 1)
      : (a.newValue - a.oldValue) / (a.oldValue || 1);
    const pctB = b.metric === "ping"
      ? (b.oldValue - b.newValue) / (b.oldValue || 1)
      : (b.newValue - b.oldValue) / (b.oldValue || 1);
    return pctB - pctA;
  });

  return records;
}

// ─────────────────────────────────────────────────────────────
// Collapsible section config (matches provided Home.tsx)
// ─────────────────────────────────────────────────────────────
interface SectionConfig {
  icon: string; title: string; description: string;
  hoverInfo: string[]; features?: string[]; highlight?: boolean;
}
const SECTIONS: Record<string, SectionConfig> = {
  network: {
    icon: "🌐", title: "Network Details",
    description: "Manage your networks, find best signal, and connection settings",
    hoverInfo: ["🏷️ Name your networks", "📡 Live Ping Scanner", "🌍 Select test server", "📡 Detect connection type"],
    features: ["Custom network names", "Ping Scanner", "Server selector", "Auto-detection"],
    highlight: true,
  },
  insights: {
    icon: "🧠", title: "Insights & Analysis",
    description: "Smart analysis of your connection quality",
    hoverInfo: ["📊 Performance trends", "🎮 Gaming analysis", "📺 Streaming insights"],
    features: ["Trend analysis", "Mode-specific tips", "Health alerts"],
  },
  advanced: {
    icon: "⚙️", title: "Advanced",
    description: "Detailed metrics and monitoring",
    hoverInfo: ["📦 Bufferbloat measurement", "🔔 Auto monitoring", "📜 Test history"],
    features: ["Bufferbloat", "Auto tests", "History export"],
  },
};

function EnhancedCollapsibleSection({ sectionKey, children, defaultOpen = false, onToggle, isHighlighted = false }: {
  sectionKey: string; children: React.ReactNode; defaultOpen?: boolean;
  onToggle?: (o: boolean) => void; isHighlighted?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showTip, setShowTip]   = useState(false);
  const s = SECTIONS[sectionKey];
  const toggle = () => { const n = !isOpen; setIsOpen(n); onToggle?.(n); };
  return (
    <div
      style={{ background: isHighlighted ? "linear-gradient(135deg,rgba(59,130,246,0.08) 0%,rgba(139,92,246,0.08) 100%)" : "rgba(255,255,255,0.7)", borderRadius: 16, padding: 12, border: isHighlighted ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(0,0,0,0.05)", transition: "all 0.2s", position: "relative" }}
      onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}
    >
      {showTip && (
        <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 8, background: "#1e293b", borderRadius: 12, padding: "10px 14px", minWidth: 200, zIndex: 200, boxShadow: "0 10px 25px rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{s.icon} {s.title}</div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>{s.description}</div>
          <div style={{ fontSize: 9, color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 6 }}>
            {s.hoverInfo.map((h, i) => <div key={i} style={{ marginBottom: 2 }}>{h}</div>)}
          </div>
        </div>
      )}
      <button onClick={toggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer", padding: "4px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <span style={{ fontSize: 18 }}>{s.icon}</span>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{s.title}</span>
              {isHighlighted && <span style={{ fontSize: 9, background: "#3b82f6", color: "#fff", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>NEW</span>}
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{s.description}</div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{isOpen ? "▼" : "▶"}</span>
      </button>
      {!isOpen && (
        <div style={{ display: "flex", gap: 6, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.05)", flexWrap: "wrap" as const }}>
          {s.features?.slice(0, 3).map((f, i) => <span key={i} style={{ fontSize: 9, background: "rgba(0,0,0,0.04)", padding: "2px 8px", borderRadius: 12, color: "#64748b" }}>{f}</span>)}
          {s.features && s.features.length > 3 && <span style={{ fontSize: 9, color: "#94a3b8" }}>+{s.features.length - 3} more</span>}
        </div>
      )}
      {isOpen && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

function QuickStatsBar({ bestStats, formatSpeed }: { bestStats: any; formatSpeed: (v: number) => string }) {
  if (!bestStats) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: 8, background: "rgba(16,185,129,0.08)", borderRadius: 12, marginBottom: 12 }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#64748b" }}>🏆 Best Score</div><div style={{ fontSize: 16, fontWeight: "bold", color: "#10b981" }}>{bestStats.bestScore}/100</div></div>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#64748b" }}>⚡ Best Download</div><div style={{ fontSize: 14, fontWeight: "bold", color: "#3b82f6" }}>{formatSpeed(bestStats.bestDownload)}</div></div>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#64748b" }}>📡 Best Ping</div><div style={{ fontSize: 14, fontWeight: "bold", color: "#10b981" }}>{bestStats.bestPing.toFixed(0)}ms</div></div>
    </div>
  );
}

function ShareResultCard({ score, onClick, isVisible }: { score: number | null; onClick: () => void; isVisible: boolean }) {
  if (!isVisible || score === null) return null;
  return (
    <div style={{ background: "linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)", borderRadius: 16, padding: "12px 16px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>📤</span>
        <div><div style={{ fontSize: 11, fontWeight: 600, color: "#1e293b" }}>Share Your Results</div><div style={{ fontSize: 9, color: "#64748b" }}>Show off your speed!</div></div>
      </div>
      <button onClick={onClick} style={{ padding: "8px 20px", background: "linear-gradient(135deg,#10b981 0%,#059669 100%)", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>Share Now →</button>
    </div>
  );
}

const DEFAULT_NETWORKS = ["Home Network","Office Network","Cafe WiFi","Mobile Data","Gaming Network","Streaming Network"];

function NetworkSelector({ networkName, setNetworkName, savedNetworks, setSavedNetworks }: any) {
  const [showAdd, setShowAdd]           = useState(false);
  const [newName, setNewName]           = useState("");
  const [delConfirm, setDelConfirm]     = useState<string | null>(null);
  const [dropOpen, setDropOpen]         = useState(false);

  const add = () => {
    if (newName.trim() && !savedNetworks.includes(newName.trim())) {
      const u = [...savedNetworks, newName.trim()];
      setSavedNetworks(u); setNetworkName(newName.trim()); setNewName(""); setShowAdd(false);
    }
  };
  const del = (name: string) => {
    if (savedNetworks.length <= 1) { alert("You need at least one network name."); return; }
    const u = savedNetworks.filter((n: string) => n !== name);
    setSavedNetworks(u);
    if (networkName === name) setNetworkName(u[0]);
    setDelConfirm(null); setDropOpen(false);
  };
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest(".net-dd")) setDropOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  return (
    <div className="net-dd" style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14 }}>🏷️</span><span style={{ fontSize: 11, color: "#64748b" }}>Network</span></div>
        <button onClick={() => setShowAdd(true)} style={{ fontSize: 10, color: "#10b981", background: "none", border: "none", cursor: "pointer" }}>+ Add</button>
      </div>
      <div onClick={() => setDropOpen(!dropOpen)} style={{ padding: "8px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
        <span>{networkName}</span><span>{dropOpen ? "▲" : "▼"}</span>
      </div>
      {dropOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, maxHeight: 200, overflowY: "auto" }}>
          {savedNetworks.map((net: string) => (
            <div key={net} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px" }}>
              <span onClick={() => { setNetworkName(net); setDropOpen(false); }} style={{ flex: 1, cursor: "pointer" }}>{net}</span>
              {savedNetworks.length > 1 && <button onClick={() => setDelConfirm(net)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>✕</button>}
            </div>
          ))}
        </div>
      )}
      {showAdd && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowAdd(false)}>
    <div style={{ background: "white", borderRadius: 16, padding: 20, width: 280 }} onClick={e => e.stopPropagation()}>
      <h4 style={{ marginBottom: 12, color: "#1e293b" }}>Add Network</h4>
      <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Add a custom name for your Network.</p>
      <p style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>
        Press <span style={{ color: "#3b82f6", fontWeight: "500", background: "#eff6ff", padding: "2px 6px", borderRadius: 4 }}>🪟 + .</span> to add emoji for better context
      </p>
      <input 
        type="text" 
        value={newName} 
        onChange={e => setNewName(e.target.value)} 
        placeholder="e.g., 🏠 Home WiFi" 
        style={{ width: "100%", padding: 8, marginBottom: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b" }} 
        autoFocus 
      />
      <button 
        onClick={add} 
        style={{ width: "100%", padding: 8, background: "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}
      >
        Add Network
      </button>
    </div>
  </div>
)}
      {delConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDelConfirm(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 20, width: 260, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <p>Delete "{delConfirm}"?</p>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => del(delConfirm)} style={{ flex: 1, padding: 8, background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Delete</button>
              <button onClick={() => setDelConfirm(null)} style={{ flex: 1, padding: 8, background: "#e2e8f0", border: "none", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN HOME COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Home() {
  const [history,      setHistory]      = useState<SpeedTestRecord[]>(getHistory());
  const [bestScore,    setBestScore]    = useState<number | null>(getBestScore());
  const [bestStats,    setBestStats]    = useState<BestStats | null>(getBestStats());
  const [achievements, setAchievements] = useState<Achievements>(getAchievements());
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [showLiveGraph,setShowLiveGraph]= useState(true);
  const [showGraphPopup,setShowGraphPopup]= useState(false);
  const [testSelection, setTestSelection] = useState(() => loadTestSelection());
  const [testCompleted, setTestCompleted] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);
  const [selectedServer, setSelectedServer] = useState(() => localStorage.getItem("selected_server") || "auto");
  const [networkName, setNetworkName]   = useState(() => localStorage.getItem("network_name") || "Home Network");
  const [savedNetworks, setSavedNetworks] = useState<string[]>(() => {
    const s = localStorage.getItem("saved_networks");
    return s ? JSON.parse(s) : [...DEFAULT_NETWORKS];
  });
  const [lastProcessedTestId, setLastProcessedTestId] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showPingScanner, setShowPingScanner] = useState(false);

  // ── Post-test popup chain state ───────────────────────────────
  // Tracks where we are in: highscore → comparison → smart → done
  const [chainStage, setChainStage]     = useState<ChainStage>("done");

  // HighScore popup
  const [highScorePopup, setHighScorePopup] = useState<{ show: boolean; records: HighScoreRecord[] }>({ show: false, records: [] });

  // Comparison popup (existing)
  const [comparisonPopup, setComparisonPopup] = useState<any>(null);

  // CelebrationPopup (first-time achievements — shown independently, not in main chain)
  const [celebration, setCelebration]   = useState<any>(null);

  // Smart redirect popup (one only per test, no auto-dismiss)
  const [smartPopup, setSmartPopup]     = useState<{ isOpen: boolean; type: SmartPopupType; data?: any }>({ isOpen: false, type: "high-latency" });
  const pendingSmartRef                 = useRef<PendingSmartPopup[]>([]);
  const pendingComparisonRef            = useRef<any>(null);   // hold comparison data until chain reaches it
  const pendingSmartCandidatesRef       = useRef<PendingSmartPopup[]>([]); // hold smart candidates

  const [hasSeenFeaturePopup, setHasSeenFeaturePopup] = useState(
    () => localStorage.getItem("has_seen_ping_feature") === "true"
  );

  const {
    ping, download, upload, jitter, phase, report, runTest,
    downloadHistory, uploadHistory, pingHistory, jitterHistory,
    score, insights, mode, setMode, modeResult, bufferbloat,
    networkType, running, autoRun, setAutoRun, monitorPing, timePattern,
  } = useSpeedTest();

  const serverWarmedUp = useServerWarmup();

  // ── Chain advancement ─────────────────────────────────────────
  // Called when any popup in the chain closes.
  // Advances to the next stage in order.
  const advanceChain = (fromStage: ChainStage) => {
    if (fromStage === "highscore") {
      // Next: comparison (if any)
      const comp = pendingComparisonRef.current;
      if (comp) {
        pendingComparisonRef.current = null;
        setTimeout(() => {
          setComparisonPopup({ show: true, improvements: comp.improvements });
          setChainStage("comparison");
        }, 350);
      } else {
        advanceChain("comparison"); // skip comparison
      }
    } else if (fromStage === "comparison") {
      // Next: smart redirect (one only, highest priority)
      const candidates = pendingSmartCandidatesRef.current;
      pendingSmartCandidatesRef.current = [];
      if (candidates.length > 0) {
        candidates.sort((a, b) => a.priority - b.priority);
        const first = candidates[0];
        setTimeout(() => {
          setSmartPopup({ isOpen: true, type: first.type, data: first.data });
          setChainStage("smart");
        }, 350);
      } else {
        setChainStage("done");
      }
    } else {
      setChainStage("done");
    }
  };

  // ── Save test result + build popup chain ──────────────────────
  useEffect(() => {
    if (phase !== "complete" || score === null || download === null || upload === null || ping === null) return;
    const testId = `${score}-${download}-${upload}-${ping}-${Date.now()}`;
    if (lastProcessedTestId === testId) return;
    if (running) { setCelebration(null); setComparisonPopup(null); setLastProcessedTestId(""); return; }

    const currentAchievements = getAchievements();
    const testNetworkName = localStorage.getItem("test_network_name");
    const finalNetworkName = testNetworkName || networkName || "Home Network";
    const finalNetworkType = networkType || "unknown";
    localStorage.removeItem("test_network_name");
    localStorage.removeItem("test_start_time");

    // ── 1. Detect high scores BEFORE saving, so we compare against old best ──
    const hsRecords = detectHighScores(score, download, upload, ping);

    // ── 2. Save results ──
    const testResult: SpeedTestRecord = {
      date: new Date().toLocaleString(), ping, jitter: jitter || 0, download, upload, score,
      networkName: finalNetworkName, networkType: finalNetworkType, hour: new Date().getHours(),
    };
    saveResult(testResult);
    saveBestScore(score);
    saveBestStats(score, download, upload, ping);
    save5dBest(score, download, upload, ping); // update 5-day rolling best

    // ── 3. Build comparison data ──
    const historyList = getHistory();
    let compData: any = null;
    if (historyList.length >= 2) {
      const prev = historyList[1], curr = historyList[0];
      compData = {
        improvements: [
          { type: "download", oldValue: prev.download, newValue: curr.download, improved: curr.download > prev.download },
          { type: "upload",   oldValue: prev.upload,   newValue: curr.upload,   improved: curr.upload   > prev.upload   },
          { type: "ping",     oldValue: prev.ping,     newValue: curr.ping,     improved: curr.ping     < prev.ping     },
          { type: "score",    oldValue: prev.score,    newValue: curr.score,    improved: curr.score    > prev.score    },
        ],
      };
    }

    // ── 4. Build smart-redirect candidates (highest priority wins; try-tools is always the fallback) ──
    const smartCandidates: PendingSmartPopup[] = [];

    // High-latency: ping > 100ms and not shown in the last hour
    if (ping > 100) {
      const lastShown = localStorage.getItem("last_latency_popup");
      const now = Date.now();
      if (!lastShown || now - parseInt(lastShown) > 3_600_000) {
        smartCandidates.push({ priority: SMART_PRIORITY["high-latency"], type: "high-latency", data: { ping } });
        localStorage.setItem("last_latency_popup", now.toString());
      }
    }
    // History: first time after 3+ tests
    if (historyList.length >= 3 && !localStorage.getItem("has_seen_history_popup")) {
      smartCandidates.push({ priority: SMART_PRIORITY["history"], type: "history", data: { testCount: historyList.length } });
      localStorage.setItem("has_seen_history_popup", "true");
    }
    // Feature highlight: first time only
    if (!hasSeenFeaturePopup) {
      smartCandidates.push({ priority: SMART_PRIORITY["feature-highlight"], type: "feature-highlight", data: { featureName: "Live Ping Scanner" } });
      setHasSeenFeaturePopup(true);
      localStorage.setItem("has_seen_ping_feature", "true");
    }
    // ── Try-tools: ALWAYS shown (fallback when nothing else qualifies, but also present every time).
    // Sort puts higher-priority items first; try-tools priority=5 so it only shows if nothing more urgent exists.
    // We always push it so the smart popup ALWAYS fires after comparison.
    smartCandidates.push({ priority: SMART_PRIORITY["try-tools"], type: "try-tools", data: {} });

    // ── 5. First-time achievement celebration (independent — shown immediately, not chained) ──
    const newAchievements: { type: string; value: number }[] = [];
    if (!currentAchievements.hasRunPing     && ping > 0)                       { newAchievements.push({ type: "ping",     value: ping });     updateAchievement("ping");     }
    if (!currentAchievements.hasRunJitter   && jitter !== null && jitter >= 0) { newAchievements.push({ type: "jitter",   value: jitter });   updateAchievement("jitter");   }
    if (!currentAchievements.hasRunDownload && download > 0)                   { newAchievements.push({ type: "download", value: download }); updateAchievement("download"); }
    if (!currentAchievements.hasRunUpload   && upload > 0)                     { newAchievements.push({ type: "upload",   value: upload });   updateAchievement("upload");   }

    setBestScore(getBestScore());
    setBestStats(getBestStats());
    setHistory(getHistory());
    setAchievements(getAchievements());
    setLastProcessedTestId(testId);

    // ── 6. Launch popup chain ──────────────────────────────────
    // Store comparison and smart candidates for advanceChain() to consume
    pendingComparisonRef.current       = compData;
    pendingSmartCandidatesRef.current  = smartCandidates;

    // CelebrationPopup fires independently (first-time achievement, very rare)
    if (newAchievements.length > 0) {
      const records = newAchievements.map(a => ({ type: a.type === "jitter" ? "ping" : a.type, oldValue: a.value, newValue: a.value }));
      setCelebration({ show: true, records, isFirstTime: true, firstTimeType: newAchievements[0]?.type });
      // Don't start main chain yet — wait for celebration to close? Actually celebration is separate, let chain start normally.
    }

    // Start chain: show HighScore first (if any records broken)
    setTimeout(() => {
      if (hsRecords.length > 0) {
        setHighScorePopup({ show: true, records: hsRecords });
        setChainStage("highscore");
      } else {
        // No high score — skip to comparison
        advanceChain("highscore");
      }
    }, 800);

  }, [phase, score, download, upload, ping, jitter, networkType, running]);

  // ── Smart popup drain (for any leftovers from previous sessions) ──
  const drainSmartQueue = () => {
    if (pendingSmartRef.current.length === 0) return;
    const [next, ...rest] = pendingSmartRef.current;
    pendingSmartRef.current = rest;
    setTimeout(() => setSmartPopup({ isOpen: true, type: next.type, data: next.data }), 400);
  };

  // ── Smart popup action handler ────────────────────────────────
  const handleSmartPopupAction = (action: string) => {
    if (action === "open-ping-scanner") {
      setShowPingScanner(true);
      setOpenSections(prev => ({ ...prev, network: true }));
      setTimeout(() => {
        const el = document.getElementById("ping-scanner-card");
        if (el) { el.style.boxShadow = "0 0 0 3px #3b82f6"; el.style.transition = "box-shadow 0.3s ease"; setTimeout(() => { el.style.boxShadow = ""; }, 3000); }
      }, 300);
    } else if (action === "view-history") {
      window.location.href = "/history";
    }
  };

  // ── Misc effects ──────────────────────────────────────────────
  useEffect(() => { if (networkName) localStorage.setItem("network_name", networkName); }, [networkName]);
  useEffect(() => { localStorage.setItem("saved_networks", JSON.stringify(savedNetworks)); }, [savedNetworks]);
  useEffect(() => {
    const h = () => setIsTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", h);
    return () => document.removeEventListener("visibilitychange", h);
  }, []);
  useEffect(() => {
    if (showLiveGraph && (running || phase === "download" || phase === "upload" || phase === "ping")) setShowGraphPopup(true);
  }, [running, phase, showLiveGraph]);
  useEffect(() => { if (phase === "complete") setTestCompleted(p => p + 1); }, [phase]);
  useEffect(() => { saveTestSelection(testSelection); }, [testSelection]);

  const handleServerChange = (serverId: string, baseUrl: string) => {
    setSelectedServer(serverId);
    localStorage.setItem("selected_server", serverId);
    localStorage.setItem("selected_server_url", baseUrl);
  };
  const formatSpeed = (v: number) => v > 1000 ? `${(v / 1000).toFixed(1)} Gbps` : `${v.toFixed(1)} Mbps`;

  const handleRunTest = async () => {
    const nt = networkType || "unknown";
    const nn = networkName || "Home Network";
    localStorage.setItem("test_network_name", nn);
    localStorage.setItem("test_start_time", Date.now().toString());
    runTest("manual", testSelection, nn, nt);
  };

  const getBg = () => running ? {
    background: "linear-gradient(135deg,#e0f2fe 0%,#fae8ff 50%,#dbeafe 100%)", transition: "background 0.5s ease", minHeight: "100vh",
  } : {
    background: "linear-gradient(135deg,#f8fafc 0%,#f1f5f9 50%,#eef2ff 100%)", transition: "background 0.5s ease", minHeight: "100vh",
  };

  // ── History sync ──────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      const h = getHistory();          if (JSON.stringify(h)   !== JSON.stringify(history))      setHistory(h);
      const bs = getBestScore();       if (bs !== bestScore)                                      setBestScore(bs);
      const bst = getBestStats();      if (JSON.stringify(bst) !== JSON.stringify(bestStats))     setBestStats(bst);
      const ac = getAchievements();    if (JSON.stringify(ac)  !== JSON.stringify(achievements))  setAchievements(ac);
    }, 2000);
    return () => clearInterval(iv);
  }, [history, bestScore, bestStats, achievements]);

  const isTestActive      = running || (phase !== "idle" && phase !== "complete");
  const isMainTestRunning = isTestActive;

  if (!serverWarmedUp) return <ServerWarming onComplete={() => {}} />;

  const showMetrics      = score !== null && phase === "complete";
  const showSmartInsight = !isTestActive && score !== null;
  const showHealthAlert  = timePattern && !isTestActive;
  const showNetworkInfo  = !isTestActive;

  return (
    <div style={getBg()}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "clamp(12px,4vw,24px)", display: "flex", flexDirection: "column", gap: 12 }}>

        <TrustBanner />

        <Hero
          score={score} ping={ping} download={download} upload={upload} jitter={jitter}
          phase={phase} running={running} isTestActive={isTestActive} onRunTest={handleRunTest}
          mode={mode} onModeChange={setMode} testSelection={testSelection} setTestSelection={setTestSelection}
          showLiveGraph={showLiveGraph} onToggleLiveGraph={() => setShowLiveGraph(!showLiveGraph)}
        />

        {bestStats && <QuickStatsBar bestStats={bestStats} formatSpeed={formatSpeed} />}

        <ShareResultCard score={score} isVisible={!isTestActive && score !== null} onClick={() => setShowShareCard(true)} />

        {showMetrics && (
          <>
            {showSmartInsight && (
              <div style={{ animation: "fadeInUp 0.4s ease" }}>
                <SmartInsight metrics={{ ping, download, upload, jitter, bufferbloat, networkType, score, bestDownload: bestStats?.bestDownload || 0 }} />
              </div>
            )}
            {showHealthAlert && <HealthAlert pattern={timePattern} />}
          </>
        )}

        {/* Section 1: Network Details (includes Ping Scanner) */}
        <EnhancedCollapsibleSection sectionKey="network" defaultOpen={openSections.network || false} onToggle={o => setOpenSections(p => ({ ...p, network: o }))} isHighlighted>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <NetworkSelector networkName={networkName} setNetworkName={setNetworkName} savedNetworks={savedNetworks} setSavedNetworks={setSavedNetworks} />
            <div id="ping-scanner-card" style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.1) 0%,rgba(139,92,246,0.1) 100%)", borderRadius: 12, padding: 12, border: "1px solid rgba(59,130,246,0.3)", transition: "box-shadow 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>📡</span>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Live Ping Scanner</div><div style={{ fontSize: 10, color: "#64748b" }}>Find your best signal spot by walking around</div></div>
              </div>
              <button onClick={() => setShowPingScanner(true)} disabled={isMainTestRunning} style={{ width: "100%", padding: 10, background: isMainTestRunning ? "#94a3b8" : "linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)", border: "none", borderRadius: 40, color: "#fff", cursor: isMainTestRunning ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 500, opacity: isMainTestRunning ? 0.6 : 1 }}>
                🔍 Open Ping Scanner
              </button>
            </div>
            {showNetworkInfo && <NetworkInfo triggerRefresh={testCompleted} onNetworkDetected={t => console.log("Network:", t)} testPing={ping} testJitter={jitter} testDownload={download} testUpload={upload} />}
            <RealServerSelector onServerChange={handleServerChange} currentServerId={selectedServer} />
          </div>
        </EnhancedCollapsibleSection>

        {/* Section 2: Insights */}
        <EnhancedCollapsibleSection sectionKey="insights" defaultOpen={openSections.insights || false} onToggle={o => setOpenSections(p => ({ ...p, insights: o }))}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!isTestActive && (insights.length > 0 || modeResult || report) && <Insights insights={insights} modeResult={modeResult} report={report} networkType={networkType} />}
            <AllTimeBest bestStats={bestStats} formatSpeed={formatSpeed} />
          </div>
        </EnhancedCollapsibleSection>

        {/* Section 3: Advanced */}
        <EnhancedCollapsibleSection sectionKey="advanced" defaultOpen={openSections.advanced || false} onToggle={o => setOpenSections(p => ({ ...p, advanced: o }))}>
          <AdvancedDetails bufferbloat={bufferbloat} history={history} autoRun={autoRun} onAutoRunToggle={() => setAutoRun(!autoRun)} monitorPing={monitorPing} isTabVisible={isTabVisible} isTestActive={isTestActive} download={download} upload={upload} phase={phase} />
        </EnhancedCollapsibleSection>

        <FooterMessage />
      </div>

      {/* ── Popup chain: HighScore → Comparison → SmartRedirect ── */}

      {/* Stage 1: High Score */}
      <HighScorePopup
        isOpen={highScorePopup.show}
        records={highScorePopup.records}
        onClose={() => {
          setHighScorePopup({ show: false, records: [] });
          advanceChain("highscore");
        }}
      />

      {/* Stage 2: Comparison */}
      {comparisonPopup?.show && (
        <ComparisonPopup
          isOpen={comparisonPopup.show}
          onClose={() => {
            setComparisonPopup(null);
            if (chainStage === "comparison") advanceChain("comparison");
          }}
          improvements={comparisonPopup.improvements}
        />
      )}

      {/* Stage 3: Smart redirect — one only, no auto-dismiss */}
      <SmartRedirectPopup
        isOpen={smartPopup.isOpen}
        onClose={() => {
          setSmartPopup({ isOpen: false, type: "high-latency" });
          setChainStage("done");
          drainSmartQueue();
        }}
        onAction={handleSmartPopupAction}
        type={smartPopup.type}
        data={smartPopup.data}
      />

      {/* Independent: first-time achievement celebration */}
      {celebration?.show && (
        <CelebrationPopup isOpen={celebration.show} onClose={() => setCelebration(null)} records={celebration.records} isFirstTime={celebration.isFirstTime} firstTimeType={celebration.firstTimeType} />
      )}

      {/* Other */}
      <PingScanner isOpen={showPingScanner} onClose={() => setShowPingScanner(false)} />

      <LiveGraphPopup isOpen={showGraphPopup} onClose={() => setShowGraphPopup(false)} downloadHistory={downloadHistory} uploadHistory={uploadHistory} pingHistory={pingHistory} jitterHistory={jitterHistory} download={download} upload={upload} ping={ping} jitter={jitter} phase={phase} running={running} testSelection={testSelection} />

      {showShareCard && <ShareableResultCard score={score} ping={ping} download={download} upload={upload} jitter={jitter} networkType={networkType} mode={mode} modeResult={modeResult} onClose={() => setShowShareCard(false)} />}

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}