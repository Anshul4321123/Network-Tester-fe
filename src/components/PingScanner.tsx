// components/PingScanner.tsx
import { useState, useEffect, useRef } from "react";
import { usePingScanner } from "../hooks/usePingScanner";
import FullScreenGraph from "./Fullscreengraph";
import MiniGraph from "./Minigraph";

// ── Persisted state across accidental tab switches ────────────────────────────
let savedScanState = {
  pings:        [] as number[],
  pingTimes:    [] as number[],
  currentPing:  null as number | null,
  bestPing:     null as number | null,
  averagePing:  null as number | null,
  stability:    "stable" as "stable" | "moderate" | "unstable",
  timeRemaining: 0,
  duration:     30000,
  scanInterval: 2000,
  wasRunning:   false,
};

const EMPTY_SCAN_STATE = { ...savedScanState };

function clearSavedStateObj() {
  savedScanState = { ...EMPTY_SCAN_STATE, pings: [], pingTimes: [] };
}

// ── Duration / interval presets ───────────────────────────────────────────────
const DURATION_OPTIONS  = [
  { value: 15000,  label: "15s"  },
  { value: 30000,  label: "30s"  },
  { value: 60000,  label: "60s"  },
  { value: 120000, label: "120s" },
];

const INTERVAL_OPTIONS = [
  { value: 1000, label: "1s (Fast)"          },
  { value: 2000, label: "2s (Normal)"         },
  { value: 3000, label: "3s (Battery Saver)"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTimeRemaining(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  const mins    = Math.floor(seconds / 60);
  const secs    = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${seconds}s`;
}

function getPingDisplayColor(ping: number | null): string {
  if (ping === null) return "#64748b";
  if (ping < 30) return "#10b981";
  if (ping < 80) return "#f59e0b";
  return "#ef4444";
}

// ── Component ─────────────────────────────────────────────────────────────────
interface PingScannerProps {
  isOpen:  boolean;
  onClose: () => void;
}

export default function PingScanner({ isOpen, onClose }: PingScannerProps) {
  const { isRunning, pings, currentPing, bestPing, averagePing, stability, start, stop, reset } =
    usePingScanner();

  // Settings
  const [duration,       setDuration]       = useState(30000);
  const [scanInterval,   setScanInterval]   = useState(2000);
  const [customDuration, setCustomDuration] = useState(60);
  const [customInterval, setCustomInterval] = useState(2);
  const [showCustom,     setShowCustom]     = useState(false);

  // Scan lifecycle
  const [showResults,     setShowResults]     = useState(false);
  const [improvement,     setImprovement]     = useState<number | null>(null);
  const [timeRemaining,   setTimeRemaining]   = useState(0);
  const [scanComplete,    setScanComplete]    = useState(false);
  const [wasStoppedByTab, setWasStoppedByTab] = useState(false);
  const [wasStoppedByUser,setWasStoppedByUser]= useState(false);
  const [hasResumed,      setHasResumed]      = useState(false);
  const [isTabActive,     setIsTabActive]     = useState(true);
  const [, setInitialBest]                    = useState<number | null>(null);

  // Persistent data
  const [persistentPings,      setPersistentPings]      = useState<number[]>([]);
  const [pingTimestamps,       setPingTimestamps]       = useState<number[]>([]);

  // UI
  const [showFullGraph,   setShowFullGraph]   = useState(false);
  const [showCloseConfirm,setShowCloseConfirm]= useState(false);
  const [tooltipInfo,     setTooltipInfo]     = useState<{ index: number; value: number; time: string } | null>(null);
  const [smartMessage,    setSmartMessage]    = useState("🎯 Find your best signal spot! Walk around while watching the ping meter.");
  const [messageType,     setMessageType]     = useState<"info" | "good" | "warning" | "excellent">("info");

  const hasLoadedSaved = useRef(false);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Restore state on popup open (tab-switch recovery) ────────────────────────
  useEffect(() => {
    if (isOpen && savedScanState.wasRunning && !hasLoadedSaved.current) {
      setTimeRemaining(savedScanState.timeRemaining);
      setDuration(savedScanState.duration);
      setScanInterval(savedScanState.scanInterval);
      setPersistentPings(savedScanState.pings);
      setPingTimestamps(savedScanState.pingTimes);
      setHasResumed(true);
      setWasStoppedByTab(true);
      setWasStoppedByUser(false);
      setScanComplete(false);
      setSmartMessage(`⏸️ Scan paused. ${Math.ceil(savedScanState.timeRemaining / 1000)}s remaining. Click 'Resume Scan' to continue.`);
      setMessageType("info");
      hasLoadedSaved.current = true;
    }
    if (!isOpen) {
      hasLoadedSaved.current = false;
      setHasResumed(false);
      setShowFullGraph(false);
    }
  }, [isOpen]);

  // ── Accumulate pings with timestamps ─────────────────────────────────────────
  useEffect(() => {
    if (pings.length > 0) {
      const now = Date.now();
      setPersistentPings(prev => [...prev, ...pings].slice(-200));
      setPingTimestamps(prev  => [...prev, ...pings.map(() => now)].slice(-200));
    }
  }, [pings]);

  // ── Countdown timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isRunning && isTabActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            if (timerRef.current) clearInterval(timerRef.current);
            setScanComplete(true);
            setShowResults(true);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, isTabActive, timeRemaining]);

  // ── Tab visibility ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => {
      const active = document.visibilityState === "visible";
      setIsTabActive(active);
      if (isRunning && !active) {
        setWasStoppedByTab(true);
        setWasStoppedByUser(false);
        stop();
        // save state
        savedScanState = {
          pings:         persistentPings.length > 0 ? persistentPings : pings,
          pingTimes:     pingTimestamps,
          currentPing,
          bestPing,
          averagePing,
          stability,
          timeRemaining,
          duration,
          scanInterval,
          wasRunning:    true,
        };
      }
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [isRunning, stop, persistentPings, pings, pingTimestamps, currentPing, bestPing, averagePing, stability, timeRemaining, duration, scanInterval]);

  // ── Smart message ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning && persistentPings.length === 0 && !wasStoppedByTab && !hasResumed && !wasStoppedByUser && !scanComplete) {
      setSmartMessage("🎯 Find Your Best Signal Spot! Walk around while watching the ping meter — lower numbers = better connection!");
      setMessageType("info"); return;
    }
    if (scanComplete && persistentPings.length > 0) {
      const best    = bestPing?.toFixed(0) ?? "0";
      const impText = improvement !== null && improvement > 0 ? ` 🎉 You improved by ${improvement}%!` : "";
      setSmartMessage(`✅ Scan complete! Best latency: ${best}ms.${impText} Click 'New Scan' to test again!`);
      setMessageType("good"); return;
    }
    if (wasStoppedByUser && !isRunning && persistentPings.length > 0) {
      setSmartMessage(`⏸️ Scan stopped at ${formatTimeRemaining(timeRemaining)} remaining. Click 'Resume Scan' to continue.`);
      setMessageType("info"); return;
    }
    if (wasStoppedByTab && !isRunning) {
      setSmartMessage(`⏸️ Scan paused. ${Math.ceil(timeRemaining / 1000)}s remaining. Click 'Resume Scan' to continue.`);
      setMessageType("info"); return;
    }
    if (!isTabActive && isRunning) {
      setSmartMessage("⚠️ Tab is inactive. Scanning paused. Switch back to continue!");
      setMessageType("warning"); return;
    }
    if (currentPing !== null && isRunning) {
      if      (currentPing < 30) { setSmartMessage("🌟 Excellent! You found a premium spot! Perfect for gaming!"); setMessageType("excellent"); }
      else if (currentPing < 50) { setSmartMessage("👍 Good signal! A few steps might find even better latency."); setMessageType("good"); }
      else if (currentPing < 80) { setSmartMessage("📶 Moderate latency. Keep moving — lower numbers = faster internet!"); setMessageType("warning"); }
      else                       { setSmartMessage("🚶 High latency! Walk toward your router while watching the meter drop."); setMessageType("warning"); }
    }
  }, [currentPing, isRunning, persistentPings.length, bestPing, improvement, isTabActive, wasStoppedByTab, wasStoppedByUser, hasResumed, timeRemaining, scanComplete]);

  // ── Actions ───────────────────────────────────────────────────────────────────
  const clearLocal = () => {
    clearSavedStateObj();
    setPersistentPings([]);
    setPingTimestamps([]);
    setHasResumed(false);
    setWasStoppedByTab(false);
    setWasStoppedByUser(false);
    setScanComplete(false);
  };

  const handleStart = () => {
    if (!isTabActive) { setSmartMessage("⚠️ Please switch to this tab first."); setMessageType("warning"); return; }
    setShowResults(false); setWasStoppedByTab(false); setWasStoppedByUser(false);
    setHasResumed(false); setScanComplete(false); setInitialBest(bestPing);
    setImprovement(null); setTimeRemaining(duration);
    setPersistentPings([]); setPingTimestamps([]);
    start(duration, scanInterval);
    clearSavedStateObj();
  };

  const handleResume = () => {
    if (!isTabActive) { setSmartMessage("⚠️ Please switch to this tab first."); setMessageType("warning"); return; }
    setWasStoppedByTab(false); setWasStoppedByUser(false); setHasResumed(false);
    setScanComplete(false); setShowResults(false);
    setInitialBest(savedScanState.bestPing ?? bestPing);
    start(timeRemaining > 0 ? timeRemaining : savedScanState.timeRemaining, scanInterval);
  };

  const handleStop = () => {
    stop(); setWasStoppedByUser(true); setWasStoppedByTab(false); setHasResumed(false); setScanComplete(false); setShowResults(false);
  };

  const handleNewScan = () => {
    reset(); setShowResults(false); setImprovement(null); setInitialBest(null);
    setTimeRemaining(0);
    setSmartMessage("🎯 Find Your Best Signal Spot! Walk around while watching the ping meter — lower numbers = better connection!");
    setMessageType("info");
    clearLocal();
  };

  const handleClose = () => { isRunning ? setShowCloseConfirm(true) : (clearLocal(), stop(), onClose()); };
  const confirmClose = () => { clearLocal(); stop(); setShowCloseConfirm(false); onClose(); };

  const handlePointClick = (index: number, value: number, time: string) => {
    setTooltipInfo({ index, value, time });
    setTimeout(() => setTooltipInfo(null), 3000);
  };

  const applyCustomSettings = () => {
    const d = customDuration * 1000;
    const iv = customInterval * 1000;
    if (d <= 180000 && iv >= 1000) { setDuration(d); setScanInterval(iv); setShowCustom(false); }
  };

  // ── Derived display values ────────────────────────────────────────────────────
  const displayCurrentPing  = currentPing  ?? savedScanState.currentPing;
  const displayBestPing     = bestPing     ?? savedScanState.bestPing;
  const displayAveragePing  = averagePing  ?? savedScanState.averagePing;
  const displayPings        = persistentPings.length > 0 ? persistentPings : (pings.length > 0 ? pings : savedScanState.pings);
  const displayPingTimes    = pingTimestamps.length   > 0 ? pingTimestamps  : savedScanState.pingTimes;
  const displayTimeRemaining= timeRemaining > 0 ? timeRemaining : savedScanState.timeRemaining;
  const displayStability    = isRunning ? stability : savedScanState.stability;

  const showStartButton  = !isRunning && !wasStoppedByTab && !wasStoppedByUser && !hasResumed && persistentPings.length === 0 && !scanComplete;
  const showResumeButton = (wasStoppedByTab || wasStoppedByUser) && !isRunning && (timeRemaining > 0 || savedScanState.timeRemaining > 0) && persistentPings.length > 0;
  const showStopButton   = isRunning && isTabActive;
  const showNewScanButton= (!isRunning && (showResults || scanComplete) && persistentPings.length > 0) || (wasStoppedByUser && !isRunning && persistentPings.length > 0);

  const stabilityColor = displayStability === "stable" ? "#10b981" : displayStability === "moderate" ? "#f59e0b" : "#ef4444";
  const stabilityIcon  = displayStability === "stable" ? "✅" : displayStability === "moderate" ? "⚠️" : "❌";
  const stabilityText  = displayStability === "stable" ? "Stable" : displayStability === "moderate" ? "Moderate" : "Unstable";

  const msgBorderColor = messageType === "excellent" ? "#10b981" : messageType === "good" ? "#3b82f6" : messageType === "warning" ? "#ef4444" : "#94a3b8";
  const msgBg          = messageType === "excellent" ? "rgba(16,185,129,0.15)" : messageType === "good" ? "rgba(59,130,246,0.1)" : messageType === "warning" ? "rgba(239,68,68,0.1)" : "rgba(100,116,139,0.08)";

  if (!isOpen) return null;

  return (
    <>
      {/* ── Full-screen graph modal ── */}
      <FullScreenGraph
        isOpen={showFullGraph}
        onClose={() => setShowFullGraph(false)}
        pings={displayPings}
        pingTimes={displayPingTimes}
        onPointClick={handlePointClick}
      />

      {/* ── Backdrop ── */}
      <div
        onClick={handleClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 2000 }}
      />

      {/* ── Popup ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: 24,
          width: "calc(100% - 32px)", maxWidth: 500,
          maxHeight: "85vh", overflow: "auto",
          zIndex: 2001,
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          animation: "modalSlideUp 0.3s ease",
        }}
      >
        <div style={{ padding: 20 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "rgba(59,130,246,0.15)", padding: 8, borderRadius: 14 }}>
                <span style={{ fontSize: 24 }}>📡</span>
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Find Best Signal</h2>
                <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>Walk to find strongest spot</p>
              </div>
            </div>
            <button onClick={handleClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "#fff", fontSize: 16, cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {/* Close confirm dialog */}
          {showCloseConfirm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)", borderRadius: 20, padding: 20, maxWidth: 300, width: "85%", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Stop Scanning?</h3>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Your progress will be saved and you can resume later.</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={confirmClose} style={{ flex: 1, padding: 8, background: "#ef4444", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 500 }}>Close</button>
                  <button onClick={() => setShowCloseConfirm(false)} style={{ flex: 1, padding: 8, background: "#10b981", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 500 }}>Continue</button>
                </div>
              </div>
            </div>
          )}

          {/* Tab inactive warning */}
          {!isTabActive && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.15)", padding: 10, borderRadius: 10, marginBottom: 14, border: "1px solid rgba(239,68,68,0.3)" }}>
              <span>⚠️</span>
              <span style={{ fontSize: 11, color: "#fca5a5" }}>Scanning pauses when you leave this tab. Switch back to continue!</span>
            </div>
          )}

          {/* Timer */}
          {(isRunning || wasStoppedByTab || wasStoppedByUser) && displayTimeRemaining > 0 && (
            <div style={{ textAlign: "center", marginBottom: 14, padding: 10, background: isRunning ? "rgba(59,130,246,0.15)" : "rgba(245,158,11,0.15)", borderRadius: 10, border: `1px solid ${isRunning ? "rgba(59,130,246,0.3)" : "rgba(245,158,11,0.3)"}` }}>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{isRunning ? "Time Remaining" : "Paused"}</span>
              <div style={{ fontSize: 24, fontWeight: 700, color: isRunning ? "#3b82f6" : "#f59e0b" }}>
                {formatTimeRemaining(displayTimeRemaining)}
              </div>
            </div>
          )}

          {/* Settings (only before first scan) */}
          {showStartButton && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                {[{ label: "Duration", value: duration, setter: setDuration, options: DURATION_OPTIONS },
                  { label: "Interval", value: scanInterval, setter: setScanInterval, options: INTERVAL_OPTIONS }].map(({ label, value, setter, options }) => (
                  <div key={label} style={{ flex: 1 }}>
                    <label style={{ fontSize: 9, color: "#94a3b8", display: "block", marginBottom: 4 }}>{label}</label>
                    <select value={value} onChange={(e) => setter(Number(e.target.value))}
                      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", fontSize: 11, background: "#334155", color: "#fff", cursor: "pointer" }}>
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowCustom(!showCustom)} style={{ width: "100%", padding: 6, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, color: "#60a5fa", cursor: "pointer", fontSize: 10 }}>
                {showCustom ? "− Hide Custom" : "+ Custom Duration & Interval"}
              </button>

              {showCustom && (
                <div style={{ marginTop: 10, padding: 10, background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    {[{ label: "Custom Duration (s)", val: customDuration, set: setCustomDuration, min: 5, max: 180, note: "Max 3 minutes (180s)" },
                      { label: "Custom Interval (s)",  val: customInterval, set: setCustomInterval, min: 1, max: 10,  note: "Min 1s, Max 10s"      }].map(({ label, val, set, min, max, note }) => (
                      <div key={label} style={{ flex: 1 }}>
                        <label style={{ fontSize: 9, color: "#94a3b8", display: "block", marginBottom: 4 }}>{label}</label>
                        <input type="number" min={min} max={max} value={val}
                          onChange={(e) => set(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
                          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", fontSize: 11, background: "#334155", color: "#fff" }} />
                        <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>{note}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={applyCustomSettings} style={{ width: "100%", padding: 6, background: "#10b981", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 10 }}>Apply Custom Settings</button>
                </div>
              )}
            </div>
          )}

          {/* Smart message */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: msgBg, borderRadius: 10, padding: 12, marginBottom: 16, borderLeft: `3px solid ${msgBorderColor}` }}>
            <span style={{ fontSize: 20 }}>
              {messageType === "excellent" ? "🎯" : messageType === "good" ? "📡" : messageType === "warning" ? "⚠️" : "📍"}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#cbd5e1", flex: 1, lineHeight: 1.4 }}>{smartMessage}</span>
          </div>

          {/* Live metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
            {/* Current ping */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>Current Ping</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: getPingDisplayColor(displayCurrentPing) }}>
                {displayCurrentPing !== null ? `${Math.round(displayCurrentPing)}ms` : isRunning ? "---" : "--"}
              </div>
              {displayCurrentPing !== null && displayCurrentPing < 30 && <div style={{ fontSize: 8, color: "#10b981", marginTop: 4 }}>🎯 Perfect!</div>}
              {displayCurrentPing !== null && displayCurrentPing >= 50 && <div style={{ fontSize: 8, color: "#ef4444", marginTop: 4 }}>🚶 Move!</div>}
            </div>
            {/* Best ping */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>Best Ping</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}>
                {displayBestPing !== null ? `${Math.round(displayBestPing)}ms` : "--"}
              </div>
              <div style={{ fontSize: 8, color: "#64748b", marginTop: 4 }}>🏆 Record</div>
            </div>
            {/* Average */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>Average</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>
                {displayAveragePing !== null ? `${Math.round(displayAveragePing)}ms` : "--"}
              </div>
            </div>
            {/* Stability */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>Stability</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: stabilityColor, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <span>{stabilityIcon}</span> {stabilityText}
              </div>
            </div>
          </div>

          {/* Mini graph */}
          {displayPings.length > 0 && displayPingTimes.length > 0 && (
            <MiniGraph
              pings={displayPings}
              pingTimes={displayPingTimes}
              onExpand={() => setShowFullGraph(true)}
              onPointClick={handlePointClick}
            />
          )}

          {/* Click-point toast */}
          {tooltipInfo && (
            <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", padding: "8px 16px", borderRadius: 20, fontSize: 12, zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", border: "1px solid rgba(59,130,246,0.5)", animation: "fadeInUp 0.2s ease" }}>
              📡 Test #{tooltipInfo.index + 1}: {Math.round(tooltipInfo.value)}ms · {tooltipInfo.time}
            </div>
          )}

          {/* Test counter */}
          <div style={{ textAlign: "center", margin: "8px 0 12px", padding: 6, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
            <span style={{ fontSize: 10, color: "#64748b" }}>📊 Tests completed: {displayPings.length}</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {showStartButton && (
              <button onClick={handleStart} style={{ flex: 1, padding: 12, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span>🔍</span> Find Best Signal
              </button>
            )}
            {showResumeButton && (
              <button onClick={handleResume} style={{ flex: 1, padding: 12, background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span>🔄</span> Resume ({formatTimeRemaining(displayTimeRemaining)} left)
              </button>
            )}
            {showStopButton && (
              <button onClick={handleStop} style={{ flex: 1, padding: 12, background: "#ef4444", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span>⏹️</span> Stop
              </button>
            )}
            {showNewScanButton && (
              <button onClick={handleNewScan} style={{ flex: 1, padding: 12, background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span>🔄</span> New Scan
              </button>
            )}
          </div>

          {/* Results summary */}
          {(showNewScanButton || scanComplete) && displayBestPing !== null && (
            <div style={{ marginTop: 14, padding: 12, background: "rgba(16,185,129,0.1)", borderRadius: 10, textAlign: "center", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>🎯 Best latency: {Math.round(displayBestPing)}ms</div>
              {improvement !== null && improvement > 0 && <div style={{ fontSize: 11, color: "#34d399", marginTop: 4 }}>📈 You improved by {improvement}%!</div>}
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                {displayBestPing < 30 ? "🌟 Perfect for gaming & streaming!" : displayBestPing < 50 ? "👍 Good spot! Try another scan!" : "🚶 Try a new scan in different locations!"}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translate(-50%, -40%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </>
  );
}