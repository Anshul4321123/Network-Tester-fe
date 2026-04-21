// components/PingScanner.tsx
import { useState, useEffect, useRef } from "react";
import { usePingScanner } from "../hooks/usePingScanner";
import FullScreenGraph from "./Fullscreengraph";
import MiniGraph from "./Minigraph";

// ── Persisted state across accidental tab switches ──────────────────────────
let savedScanState = {
  pings:         [] as number[],
  pingTimes:     [] as number[],
  currentPing:   null as number | null,
  bestPing:      null as number | null,
  averagePing:   null as number | null,
  stability:     "stable" as "stable" | "moderate" | "unstable",
  timeRemaining: 0,
  duration:      30000,
  scanInterval:  2000,
  wasRunning:    false,
};
const EMPTY_SCAN_STATE = { ...savedScanState };
function clearSavedStateObj() {
  savedScanState = { ...EMPTY_SCAN_STATE, pings: [], pingTimes: [] };
}

// ── Sound file names (place these in /public/sounds/) ──────────────────────
// ping-good.mp3   → short cheerful chime, plays when ping DROPS (better signal)
// ping-alert.mp3  → short warning tone,   plays when ping SPIKES (worse signal)
const SOUND_GOOD  = "/sounds/ping-good.mp3";
const SOUND_ALERT = "/sounds/ping-alert.mp3";

// ── Audio helper ─────────────────────────────────────────────────────────────
function playSound(src: string) {
  try {
    const audio = new Audio(src);
    audio.volume = 0.6;
    audio.play().catch(() => {}); // ignore autoplay policy errors silently
  } catch {}
}

// ── Presets ──────────────────────────────────────────────────────────────────
const DURATION_OPTIONS = [
  { value: 15000,  label: "15s" },
  { value: 30000,  label: "30s" },
  { value: 60000,  label: "60s" },
  { value: 120000, label: "120s" },
];
const INTERVAL_OPTIONS = [
  { value: 1000, label: "1s (Fast)" },
  { value: 2000, label: "2s (Normal)" },
  { value: 3000, label: "3s (Battery Saver)" },
];

function formatTimeRemaining(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
function getPingDisplayColor(p: number | null): string {
  if (p === null) return "#64748b";
  if (p < 30) return "#10b981";
  if (p < 80) return "#f59e0b";
  return "#ef4444";
}

// ── Toggle switch component ───────────────────────────────────────────────────
function ToggleSwitch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      title={label}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "transparent", border: "none", cursor: "pointer", padding: 0,
      }}
    >
      <div style={{
        width: 36, height: 20, borderRadius: 10,
        background: on ? "#3b82f6" : "rgba(255,255,255,0.15)",
        position: "relative", transition: "background 0.2s",
        border: on ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.2)",
        flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 2, left: on ? 17 : 2,
          width: 14, height: 14, borderRadius: "50%",
          background: on ? "#fff" : "#94a3b8",
          transition: "left 0.2s, background 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </div>
      <span style={{ fontSize: 10, color: on ? "#60a5fa" : "#64748b", fontWeight: 500 }}>{label}</span>
    </button>
  );
}

interface PingScannerProps { isOpen: boolean; onClose: () => void; }

export default function PingScanner({ isOpen, onClose }: PingScannerProps) {
  const {
    isRunning, newPing, currentPing, bestPing, averagePing,
    stability, totalCount, start, stop, reset,
  } = usePingScanner();

  // Settings
  const [duration,        setDuration]       = useState(30000);
  const [scanInterval,    setScanInterval]   = useState(2000);
  const [customDuration,  setCustomDuration] = useState(60);
  const [customInterval,  setCustomInterval] = useState(2);
  const [showCustom,      setShowCustom]     = useState(false);
  const [soundEnabled,    setSoundEnabled]   = useState(true);

  // Scan lifecycle
  const [showResults,     setShowResults]    = useState(false);
  const [improvement,     setImprovement]    = useState<number | null>(null);
  const [timeRemaining,   setTimeRemaining]  = useState(0);
  const [scanComplete,    setScanComplete]   = useState(false);
  const [wasStoppedByTab, setWasStoppedByTab]= useState(false);
  const [wasStoppedByUser,setWasStoppedByUser]= useState(false);
  const [hasResumed,      setHasResumed]     = useState(false);
  const [isTabActive,     setIsTabActive]    = useState(true);
  const [, setInitialBest]                   = useState<number | null>(null);

  // Persistent data — built ONE entry at a time from newPing
  const [persistentPings,  setPersistentPings]  = useState<number[]>([]);
  const [pingTimestamps,   setPingTimestamps]   = useState<number[]>([]);

  // Sound tracking
  const lastSoundPingRef  = useRef<number | null>(null); // previous ping value for comparison
  const soundCooldownRef  = useRef<number>(0);           // ms timestamp of last sound
  const SOUND_COOLDOWN    = 3000; // ms between sounds

  // UI
  const [showFullGraph,    setShowFullGraph]    = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [tooltipInfo,      setTooltipInfo]      = useState<{ index: number; value: number; time: string } | null>(null);
  const [smartMessage,     setSmartMessage]     = useState("🎯 Find your best signal spot! Walk around while watching the ping meter.");
  const [messageType,      setMessageType]      = useState<"info" | "good" | "warning" | "excellent">("info");

  const hasLoadedSaved = useRef(false);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Restore state on popup open ───────────────────────────────────────────
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

  // ── Append ONE new ping per measurement + play sound ─────────────────────
  // newPing from the hook is a single fresh value each time (not the full array)
  useEffect(() => {
    if (newPing === null) return;
    const now = Date.now();

    // Append exactly one entry
    setPersistentPings(prev => [...prev, newPing].slice(-200));
    setPingTimestamps(prev  => [...prev, now].slice(-200));

    // ── Sound logic ──────────────────────────────────────────────────────────
    if (soundEnabled && lastSoundPingRef.current !== null && now - soundCooldownRef.current > SOUND_COOLDOWN) {
      const prev  = lastSoundPingRef.current;
      const delta = (prev - newPing) / prev; // positive = ping dropped (better)

      if (delta >= 0.15) {
        // Ping dropped ≥15% → good spot found
        playSound(SOUND_GOOD);
        soundCooldownRef.current = now;
      } else if (-delta >= 0.20) {
        // Ping spiked ≥20% → signal getting worse
        playSound(SOUND_ALERT);
        soundCooldownRef.current = now;
      }
    }
    lastSoundPingRef.current = newPing;
  }, [newPing, soundEnabled]);

  // ── Countdown timer ───────────────────────────────────────────────────────
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

  // ── Tab visibility ────────────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => {
      const active = document.visibilityState === "visible";
      setIsTabActive(active);
      if (isRunning && !active) {
        setWasStoppedByTab(true);
        setWasStoppedByUser(false);
        stop();
        savedScanState = {
          pings: persistentPings, pingTimes: pingTimestamps,
          currentPing, bestPing, averagePing, stability,
          timeRemaining, duration, scanInterval, wasRunning: true,
        };
      }
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [isRunning, stop, persistentPings, pingTimestamps, currentPing, bestPing, averagePing, stability, timeRemaining, duration, scanInterval]);

  // ── Smart message ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning && persistentPings.length === 0 && !wasStoppedByTab && !hasResumed && !wasStoppedByUser && !scanComplete) {
      setSmartMessage("🎯 Find Your Best Signal Spot! Walk around while watching the ping meter — lower = better!"); setMessageType("info"); return;
    }
    if (scanComplete && persistentPings.length > 0) {
      const best = bestPing?.toFixed(0) ?? "0";
      const imp  = improvement !== null && improvement > 0 ? ` 🎉 Improved by ${improvement}%!` : "";
      setSmartMessage(`✅ Scan complete! Best latency: ${best}ms.${imp} Click 'New Scan' to test again!`); setMessageType("good"); return;
    }
    if (wasStoppedByUser && !isRunning && persistentPings.length > 0) {
      setSmartMessage(`⏸️ Scan stopped at ${formatTimeRemaining(timeRemaining)} remaining. Click 'Resume Scan' to continue.`); setMessageType("info"); return;
    }
    if (wasStoppedByTab && !isRunning) {
      setSmartMessage(`⏸️ Scan paused. ${Math.ceil(timeRemaining / 1000)}s remaining. Click 'Resume Scan' to continue.`); setMessageType("info"); return;
    }
    if (!isTabActive && isRunning) {
      setSmartMessage("⚠️ Tab is inactive. Scanning paused. Switch back to continue!"); setMessageType("warning"); return;
    }
    if (currentPing !== null && isRunning) {
      if      (currentPing < 30) { setSmartMessage("🌟 Excellent! You found a premium spot! Perfect for gaming!");              setMessageType("excellent"); }
      else if (currentPing < 50) { setSmartMessage("👍 Good signal! A few steps might find even better latency.");              setMessageType("good");      }
      else if (currentPing < 80) { setSmartMessage("📶 Moderate latency. Keep moving — lower numbers = faster internet!");      setMessageType("warning");   }
      else                       { setSmartMessage("🚶 High latency! Walk toward your router while watching the meter drop.");   setMessageType("warning");   }
    }
  }, [currentPing, isRunning, persistentPings.length, bestPing, improvement, isTabActive, wasStoppedByTab, wasStoppedByUser, hasResumed, timeRemaining, scanComplete]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const clearLocal = () => {
    clearSavedStateObj();
    setPersistentPings([]); setPingTimestamps([]);
    setHasResumed(false); setWasStoppedByTab(false); setWasStoppedByUser(false); setScanComplete(false);
    lastSoundPingRef.current = null; soundCooldownRef.current = 0;
  };

  const handleStart = () => {
    if (!isTabActive) { setSmartMessage("⚠️ Please switch to this tab first."); setMessageType("warning"); return; }
    setShowResults(false); setWasStoppedByTab(false); setWasStoppedByUser(false);
    setHasResumed(false); setScanComplete(false); setInitialBest(bestPing);
    setImprovement(null); setTimeRemaining(duration);
    setPersistentPings([]); setPingTimestamps([]);
    lastSoundPingRef.current = null; soundCooldownRef.current = 0;
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

  const handleStop     = () => { stop(); setWasStoppedByUser(true); setWasStoppedByTab(false); setHasResumed(false); setScanComplete(false); setShowResults(false); };
  const handleNewScan  = () => { reset(); setShowResults(false); setImprovement(null); setInitialBest(null); setTimeRemaining(0); setSmartMessage("🎯 Find Your Best Signal Spot! Walk around while watching the ping meter — lower = better!"); setMessageType("info"); clearLocal(); };
  const handleClose    = () => { isRunning ? setShowCloseConfirm(true) : (clearLocal(), stop(), onClose()); };
  const confirmClose   = () => { clearLocal(); stop(); setShowCloseConfirm(false); onClose(); };
  const handlePointClick = (index: number, value: number, time: string) => { setTooltipInfo({ index, value, time }); setTimeout(() => setTooltipInfo(null), 3000); };
  const applyCustomSettings = () => {
    const d = customDuration * 1000, iv = customInterval * 1000;
    if (d <= 180000 && iv >= 1000) { setDuration(d); setScanInterval(iv); setShowCustom(false); }
  };

  // ── Derived display values ────────────────────────────────────────────────
  const displayCurrentPing   = currentPing  ?? savedScanState.currentPing;
  const displayBestPing      = bestPing     ?? savedScanState.bestPing;
  const displayAveragePing   = averagePing  ?? savedScanState.averagePing;
  const displayPings         = persistentPings.length > 0 ? persistentPings : savedScanState.pings;
  const displayPingTimes     = pingTimestamps.length   > 0 ? pingTimestamps  : savedScanState.pingTimes;
  const displayTimeRemaining = timeRemaining > 0 ? timeRemaining : savedScanState.timeRemaining;
  const displayStability     = isRunning ? stability : savedScanState.stability;

  const showStartButton  = !isRunning && !wasStoppedByTab && !wasStoppedByUser && !hasResumed && persistentPings.length === 0 && !scanComplete;
  const showResumeButton = (wasStoppedByTab || wasStoppedByUser) && !isRunning && (timeRemaining > 0 || savedScanState.timeRemaining > 0) && persistentPings.length > 0;
  const showStopButton   = isRunning && isTabActive;
  const showNewScanButton= (!isRunning && (showResults || scanComplete) && persistentPings.length > 0) || (wasStoppedByUser && !isRunning && persistentPings.length > 0);

  const stabilityColor = displayStability === "stable" ? "#10b981" : displayStability === "moderate" ? "#f59e0b" : "#ef4444";
  const stabilityIcon  = displayStability === "stable" ? "✅" : displayStability === "moderate" ? "⚠️" : "❌";
  const stabilityText  = displayStability === "stable" ? "Stable" : displayStability === "moderate" ? "Moderate" : "Unstable";
  const msgBorderColor = messageType === "excellent" ? "#10b981" : messageType === "good" ? "#3b82f6" : messageType === "warning" ? "#ef4444" : "#94a3b8";
  const msgBg          = messageType === "excellent" ? "rgba(16,185,129,0.15)" : messageType === "good" ? "rgba(59,130,246,0.1)" : messageType === "warning" ? "rgba(239,68,68,0.1)" : "rgba(100,116,139,0.08)";

  // Expected total measurements for the current settings
  const expectedCount = Math.floor(duration / scanInterval);

  if (!isOpen) return null;

  return (
    <>
      <FullScreenGraph isOpen={showFullGraph} onClose={() => setShowFullGraph(false)} pings={displayPings} pingTimes={displayPingTimes} onPointClick={handlePointClick} />

      {/* Backdrop */}
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 2000 }} />

      {/* Popup */}
      <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: 24, width: "calc(100% - 32px)", maxWidth: 500, maxHeight: "85vh", overflow: "auto", zIndex: 2001, boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", animation: "modalSlideUp 0.3s ease" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Sound toggle */}
              <ToggleSwitch on={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} label={soundEnabled ? "🔊 Sound" : "🔇 Sound"} />
              <button onClick={handleClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "#fff", fontSize: 16, cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          </div>

          {/* Close confirm dialog */}
          {showCloseConfirm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => e.stopPropagation()}>
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
              <span>⚠️</span><span style={{ fontSize: 11, color: "#fca5a5" }}>Scanning pauses when you leave this tab. Switch back to continue!</span>
            </div>
          )}

          {/* Timer */}
          {(isRunning || wasStoppedByTab || wasStoppedByUser) && displayTimeRemaining > 0 && (
            <div style={{ textAlign: "center", marginBottom: 14, padding: 10, background: isRunning ? "rgba(59,130,246,0.15)" : "rgba(245,158,11,0.15)", borderRadius: 10, border: `1px solid ${isRunning ? "rgba(59,130,246,0.3)" : "rgba(245,158,11,0.3)"}` }}>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{isRunning ? "Time Remaining" : "Paused"}</span>
              <div style={{ fontSize: 24, fontWeight: 700, color: isRunning ? "#3b82f6" : "#f59e0b" }}>{formatTimeRemaining(displayTimeRemaining)}</div>
            </div>
          )}

          {/* Settings (only before first scan) */}
          {showStartButton && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                {[{ label: "Duration", value: duration, setter: setDuration, options: DURATION_OPTIONS }, { label: "Interval", value: scanInterval, setter: setScanInterval, options: INTERVAL_OPTIONS }].map(({ label, value, setter, options }) => (
                  <div key={label} style={{ flex: 1 }}>
                    <label style={{ fontSize: 9, color: "#94a3b8", display: "block", marginBottom: 4 }}>{label}</label>
                    <select value={value} onChange={e => setter(Number(e.target.value))} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", fontSize: 11, background: "#334155", color: "#fff", cursor: "pointer" }}>
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {/* Expected count preview */}
              <div style={{ fontSize: 9, color: "#64748b", textAlign: "center", marginBottom: 8 }}>
                📊 Will run <strong style={{ color: "#94a3b8" }}>{expectedCount}</strong> measurements ({formatTimeRemaining(duration)} ÷ {scanInterval/1000}s intervals)
              </div>

              <button onClick={() => setShowCustom(!showCustom)} style={{ width: "100%", padding: 6, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, color: "#60a5fa", cursor: "pointer", fontSize: 10 }}>
                {showCustom ? "− Hide Custom" : "+ Custom Duration & Interval"}
              </button>

              {showCustom && (
                <div style={{ marginTop: 10, padding: 10, background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    {[{ label: "Custom Duration (s)", val: customDuration, set: setCustomDuration, min: 5, max: 180, note: "Max 3 minutes" }, { label: "Custom Interval (s)", val: customInterval, set: setCustomInterval, min: 1, max: 10, note: "Min 1s, Max 10s" }].map(({ label, val, set, min, max, note }) => (
                      <div key={label} style={{ flex: 1 }}>
                        <label style={{ fontSize: 9, color: "#94a3b8", display: "block", marginBottom: 4 }}>{label}</label>
                        <input type="number" min={min} max={max} value={val} onChange={e => set(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", fontSize: 11, background: "#334155", color: "#fff" }} />
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
            <span style={{ fontSize: 20 }}>{messageType === "excellent" ? "🎯" : messageType === "good" ? "📡" : messageType === "warning" ? "⚠️" : "📍"}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#cbd5e1", flex: 1, lineHeight: 1.4 }}>{smartMessage}</span>
          </div>

          {/* Live metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>Current Ping</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: getPingDisplayColor(displayCurrentPing) }}>{displayCurrentPing !== null ? `${Math.round(displayCurrentPing)}ms` : isRunning ? "---" : "--"}</div>
              {displayCurrentPing !== null && displayCurrentPing < 30  && <div style={{ fontSize: 8, color: "#10b981", marginTop: 4 }}>🎯 Perfect!</div>}
              {displayCurrentPing !== null && displayCurrentPing >= 50 && <div style={{ fontSize: 8, color: "#ef4444", marginTop: 4 }}>🚶 Move!</div>}
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>Best Ping</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}>{displayBestPing !== null ? `${Math.round(displayBestPing)}ms` : "--"}</div>
              <div style={{ fontSize: 8, color: "#64748b", marginTop: 4 }}>🏆 Record</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>Average</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>{displayAveragePing !== null ? `${Math.round(displayAveragePing)}ms` : "--"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>Stability</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: stabilityColor, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <span>{stabilityIcon}</span>{stabilityText}
              </div>
            </div>
          </div>

          {/* Progress while running */}
          {isRunning && (
            <div style={{ marginBottom: 12, padding: "8px 12px", background: "rgba(59,130,246,0.08)", borderRadius: 8, border: "1px solid rgba(59,130,246,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: "#64748b" }}>Measurements</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#60a5fa" }}>{totalCount} / {expectedCount}</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(totalCount / expectedCount) * 100}%`, background: "linear-gradient(90deg,#3b82f6,#60a5fa)", borderRadius: 4, transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}

          {/* Mini graph */}
          {displayPings.length > 0 && displayPingTimes.length > 0 && (
            <MiniGraph pings={displayPings} pingTimes={displayPingTimes} onExpand={() => setShowFullGraph(true)} onPointClick={handlePointClick} />
          )}

          {/* Click-point toast */}
          {tooltipInfo && (
            <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", padding: "8px 16px", borderRadius: 20, fontSize: 12, zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", border: "1px solid rgba(59,130,246,0.5)", animation: "fadeInUp 0.2s ease" }}>
              📡 Test #{tooltipInfo.index + 1}: {Math.round(tooltipInfo.value)}ms · {tooltipInfo.time}
            </div>
          )}

          {/* Test counter */}
          <div style={{ textAlign: "center", margin: "8px 0 12px", padding: 6, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
            <span style={{ fontSize: 10, color: "#64748b" }}>📊 Tests completed: {displayPings.length}{expectedCount > 0 && !isRunning && scanComplete ? ` / ${expectedCount}` : ""}</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {showStartButton  && <button onClick={handleStart}  style={{ flex: 1, padding: 12, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><span>🔍</span> Find Best Signal</button>}
            {showResumeButton && <button onClick={handleResume} style={{ flex: 1, padding: 12, background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><span>🔄</span> Resume ({formatTimeRemaining(displayTimeRemaining)} left)</button>}
            {showStopButton   && <button onClick={handleStop}   style={{ flex: 1, padding: 12, background: "#ef4444", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><span>⏹️</span> Stop</button>}
            {showNewScanButton&& <button onClick={handleNewScan}style={{ flex: 1, padding: 12, background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><span>🔄</span> New Scan</button>}
          </div>

          {/* Results summary */}
          {(showNewScanButton || scanComplete) && displayBestPing !== null && (
            <div style={{ marginTop: 14, padding: 12, background: "rgba(16,185,129,0.1)", borderRadius: 10, textAlign: "center", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>🎯 Best latency: {Math.round(displayBestPing)}ms</div>
              {improvement !== null && improvement > 0 && <div style={{ fontSize: 11, color: "#34d399", marginTop: 4 }}>📈 You improved by {improvement}%!</div>}
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{displayBestPing < 30 ? "🌟 Perfect for gaming & streaming!" : displayBestPing < 50 ? "👍 Good spot! Try another scan!" : "🚶 Try a new scan in different locations!"}</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp { from { opacity:0; transform:translate(-50%,-40%); } to { opacity:1; transform:translate(-50%,-50%); } }
        @keyframes fadeInUp     { from { opacity:0; transform:translateY(10px);    } to { opacity:1; transform:translateY(0);          } }
      `}</style>
    </>
  );
}