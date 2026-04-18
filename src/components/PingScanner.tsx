// components/PingScanner.tsx - FINAL COMPLETE VERSION
import { useState, useEffect, useRef } from "react";
import LiveGraph from "./LiveGraph";
import { usePingScanner } from "../hooks/usePingScanner";

interface PingScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Store scan state globally - ONLY for accidental tab switches
let savedScanState = {
  pings: [] as number[],
  currentPing: null as number | null,
  bestPing: null as number | null,
  averagePing: null as number | null,
  stability: "stable" as "stable" | "moderate" | "unstable",
  timeRemaining: 0,
  duration: 30000,
  scanInterval: 2000,
  wasRunning: false,
};

export default function PingScanner({ isOpen, onClose }: PingScannerProps) {
  const { isRunning, pings, currentPing, bestPing, averagePing, stability, start, stop, reset } = usePingScanner();
  
  // State
  const [duration, setDuration] = useState(30000);
  const [scanInterval, setScanInterval] = useState(2000);
  const [customDuration, setCustomDuration] = useState(60);
  const [customInterval, setCustomInterval] = useState(2);
  const [showCustom, setShowCustom] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [improvement, setImprovement] = useState<number | null>(null);
  const [smartMessage, setSmartMessage] = useState("🎯 Find your best signal spot! Walk around while watching the ping meter.");
  const [messageType, setMessageType] = useState<"info" | "good" | "warning" | "excellent">("info");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [, setInitialBest] = useState<number | null>(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const [wasStoppedByTab, setWasStoppedByTab] = useState(false);
  const [wasStoppedByUser, setWasStoppedByUser] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const [persistentPings, setPersistentPings] = useState<number[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  
  const hasLoadedSavedState = useRef(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Load saved scan state when popup opens (only for accidental tab switch)
  useEffect(() => {
    if (isOpen && savedScanState.wasRunning && !hasLoadedSavedState.current) {
      setTimeRemaining(savedScanState.timeRemaining);
      setDuration(savedScanState.duration);
      setScanInterval(savedScanState.scanInterval);
      setPersistentPings(savedScanState.pings);
      setHasResumed(true);
      setWasStoppedByTab(true);
      setWasStoppedByUser(false);
      setScanComplete(false);
      setSmartMessage(`⏸️ Scan paused. ${Math.ceil(savedScanState.timeRemaining / 1000)}s remaining. Click 'Resume Scan' to continue.`);
      setMessageType("info");
      hasLoadedSavedState.current = true;
    }
    
    if (!isOpen) {
      hasLoadedSavedState.current = false;
      setHasResumed(false);
    }
  }, [isOpen]);

  // Update persistent pings when new pings arrive
  useEffect(() => {
    if (pings.length > 0) {
      setPersistentPings(prev => [...prev, ...pings].slice(-200));
    }
  }, [pings]);

// Timer countdown effect
useEffect(() => {
  if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  
  if (isRunning && isTabActive && timeRemaining > 0) {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setScanComplete(true);
          setShowResults(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    timerIntervalRef.current = interval;
  }
  
  return () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };
}, [isRunning, isTabActive, timeRemaining]);

  // Save scan state before popup closes (only for accidental tab switch)
  const saveCurrentState = () => {
    if (isRunning) {
      savedScanState = {
        pings: persistentPings.length > 0 ? persistentPings : pings,
        currentPing: currentPing,
        bestPing: bestPing,
        averagePing: averagePing,
        stability: stability,
        timeRemaining: timeRemaining,
        duration: duration,
        scanInterval: scanInterval,
        wasRunning: true,
      };
    }
  };

  // Clear saved state
  const clearSavedState = () => {
    savedScanState = {
      pings: [],
      currentPing: null,
      bestPing: null,
      averagePing: null,
      stability: "stable",
      timeRemaining: 0,
      duration: 30000,
      scanInterval: 2000,
      wasRunning: false,
    };
    setPersistentPings([]);
    setHasResumed(false);
    setWasStoppedByTab(false);
    setWasStoppedByUser(false);
    setScanComplete(false);
  };

  const handleClose = () => {
    if (isRunning) {
      setShowCloseConfirm(true);
    } else {
      clearSavedState();
      stop();
      onClose();
    }
  };

  const confirmClose = () => {
    clearSavedState();
    stop();
    setShowCloseConfirm(false);
    onClose();
  };

  const cancelClose = () => {
    setShowCloseConfirm(false);
  };

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isActive = document.visibilityState === "visible";
      setIsTabActive(isActive);
      
      if (isRunning && !isActive) {
        setWasStoppedByTab(true);
        setWasStoppedByUser(false);
        stop();
        saveCurrentState();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRunning, stop]);

  // Generate smart message
  useEffect(() => {
    if (!isRunning && persistentPings.length === 0 && !wasStoppedByTab && !hasResumed && !wasStoppedByUser && !scanComplete) {
      setSmartMessage("🎯 Find Your Best Signal Spot! Walk around while watching the ping meter - lower numbers = better connection!");
      setMessageType("info");
      return;
    }
    
    if (scanComplete && persistentPings.length > 0) {
      const bestLatency = bestPing?.toFixed(0) || "0";
      const improvementText = improvement !== null && improvement > 0 ? ` 🎉 You improved by ${improvement}%!` : "";
      setSmartMessage(`✅ Scan complete! Best latency: ${bestLatency}ms.${improvementText} Click 'New Scan' to test again!`);
      setMessageType("good");
      return;
    }
    
    if (wasStoppedByUser && !isRunning && persistentPings.length > 0) {
      setSmartMessage(`⏸️ Scan stopped at ${formatTimeRemaining(timeRemaining)} remaining. Click 'Resume Scan' to continue from where you left off.`);
      setMessageType("info");
      return;
    }
    
    if (wasStoppedByTab && !isRunning) {
      setSmartMessage(`⏸️ Scan paused. ${Math.ceil(timeRemaining / 1000)}s remaining. Click 'Resume Scan' to continue.`);
      setMessageType("info");
      return;
    }
    
    if (!isTabActive && isRunning) {
      setSmartMessage("⚠️ Tab is inactive. Scanning paused. Switch back to continue!");
      setMessageType("warning");
      return;
    }
    
    if (currentPing !== null && isRunning) {
      if (currentPing < 30) {
        setSmartMessage("🌟 Excellent! You found a premium spot! This is perfect for gaming!");
        setMessageType("excellent");
      } else if (currentPing < 50) {
        setSmartMessage("👍 Good signal! A few steps might find even better latency.");
        setMessageType("good");
      } else if (currentPing < 80) {
        setSmartMessage("📶 Moderate latency. Keep moving - lower numbers = faster internet!");
        setMessageType("warning");
      } else {
        setSmartMessage("🚶 High latency! Walk toward your router while watching the meter drop.");
        setMessageType("warning");
      }
    }
  }, [currentPing, isRunning, persistentPings.length, bestPing, improvement, isTabActive, wasStoppedByTab, wasStoppedByUser, hasResumed, timeRemaining, scanComplete]);

  const applyCustomSettings = () => {
    const newDuration = customDuration * 1000;
    const newInterval = customInterval * 1000;
    if (newDuration <= 180000 && newInterval >= 1000) {
      setDuration(newDuration);
      setScanInterval(newInterval);
      setShowCustom(false);
    }
  };

  const handleStart = () => {
    if (!isTabActive) {
      setSmartMessage("⚠️ Please switch to this tab first.");
      setMessageType("warning");
      return;
    }
    setShowResults(false);
    setWasStoppedByTab(false);
    setWasStoppedByUser(false);
    setHasResumed(false);
    setScanComplete(false);
    setInitialBest(bestPing);
    setImprovement(null);
    setTimeRemaining(duration);
    setPersistentPings([]);
    start(duration, scanInterval);
    clearSavedState();
  };

  const handleResume = () => {
    if (!isTabActive) {
      setSmartMessage("⚠️ Please switch to this tab first.");
      setMessageType("warning");
      return;
    }
    setWasStoppedByTab(false);
    setWasStoppedByUser(false);
    setHasResumed(false);
    setScanComplete(false);
    setShowResults(false);
    setInitialBest(savedScanState.bestPing || bestPing);
    const remainingTime = timeRemaining > 0 ? timeRemaining : savedScanState.timeRemaining;
    start(remainingTime, scanInterval);
  };

  const handleStop = () => {
    stop();
    setWasStoppedByUser(true);
    setWasStoppedByTab(false);
    setHasResumed(false);
    setScanComplete(false);
    setShowResults(false);
    // Don't clear saved state so user can resume
  };

  const handleNewScan = () => {
    reset();
    setShowResults(false);
    setImprovement(null);
    setInitialBest(null);
    setTimeRemaining(0);
    setWasStoppedByTab(false);
    setWasStoppedByUser(false);
    setHasResumed(false);
    setScanComplete(false);
    setPersistentPings([]);
    setSmartMessage("🎯 Find Your Best Signal Spot! Walk around while watching the ping meter - lower numbers = better connection!");
    setMessageType("info");
    clearSavedState();
  };

  const getPingColor = () => {
    const ping = currentPing !== null ? currentPing : savedScanState.currentPing;
    if (ping === null) return "#64748b";
    if (ping < 30) return "#10b981";
    if (ping < 80) return "#f59e0b";
    return "#ef4444";
  };

  const getStabilityIcon = () => {
    const currentStability = isRunning ? stability : savedScanState.stability;
    switch (currentStability) {
      case "stable": return "✅";
      case "moderate": return "⚠️";
      case "unstable": return "❌";
      default: return "📊";
    }
  };

  const getStabilityText = () => {
    const currentStability = isRunning ? stability : savedScanState.stability;
    switch (currentStability) {
      case "stable": return "Stable";
      case "moderate": return "Moderate";
      case "unstable": return "Unstable";
      default: return "Analyzing...";
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${seconds}s`;
  };

  const durationOptions = [
    { value: 15000, label: "15s" },
    { value: 30000, label: "30s" },
    { value: 60000, label: "60s" },
    { value: 120000, label: "120s" },
  ];

  const intervalOptions = [
    { value: 1000, label: "1s (Fast)" },
    { value: 2000, label: "2s (Normal)" },
    { value: 3000, label: "3s (Battery Saver)" },
  ];

  // Determine which buttons to show
  const showStartButton = !isRunning && !wasStoppedByTab && !wasStoppedByUser && !hasResumed && persistentPings.length === 0 && !scanComplete;
  const showResumeButton = (wasStoppedByTab || wasStoppedByUser) && !isRunning && (timeRemaining > 0 || savedScanState.timeRemaining > 0) && persistentPings.length > 0;
  const showStopButton = isRunning && isTabActive;
  const showNewScanButton = (!isRunning && (showResults || scanComplete) && persistentPings.length > 0) || (wasStoppedByUser && !isRunning && persistentPings.length > 0);

  // Get display values
  const displayCurrentPing = currentPing !== null ? currentPing : savedScanState.currentPing;
  const displayBestPing = bestPing !== null ? bestPing : savedScanState.bestPing;
  const displayAveragePing = averagePing !== null ? averagePing : savedScanState.averagePing;
  const displayPings = persistentPings.length > 0 ? persistentPings : (pings.length > 0 ? pings : savedScanState.pings);
  const displayTimeRemaining = timeRemaining > 0 ? timeRemaining : savedScanState.timeRemaining;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
        onClick={handleClose}
      />
      
      {/* Popup Content */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: "24px",
          width: "calc(100% - 32px)",
          maxWidth: "500px",
          maxHeight: "85vh",
          overflow: "auto",
          zIndex: 2001,
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          animation: "modalSlideUp 0.3s ease",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "20px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(59,130,246,0.15)", padding: "8px", borderRadius: "14px" }}>
                <span style={{ fontSize: "24px" }}>📡</span>
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#fff", margin: 0 }}>Find Best Signal</h2>
                <p style={{ fontSize: "10px", color: "#94a3b8", margin: "2px 0 0 0" }}>Walk to find strongest spot</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)" }}
            >
              ✕
            </button>
          </div>

          {/* Close Confirmation Modal */}
          {showCloseConfirm && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(4px)",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  borderRadius: "20px",
                  padding: "20px",
                  maxWidth: "300px",
                  width: "85%",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>⚠️</div>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#fff", marginBottom: "6px" }}>Stop Scanning?</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>Your progress will be saved and you can resume later.</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={confirmClose}
                    style={{ flex: 1, padding: "8px", background: "#ef4444", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "500" }}
                  >
                    Close
                  </button>
                  <button
                    onClick={cancelClose}
                    style={{ flex: 1, padding: "8px", background: "#10b981", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "500" }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Inactive Warning Banner */}
          {!isTabActive && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(239,68,68,0.15)",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "14px",
              border: "1px solid rgba(239,68,68,0.3)",
            }}>
              <span style={{ fontSize: "16px" }}>⚠️</span>
              <span style={{ fontSize: "11px", color: "#fca5a5", flex: 1 }}>
                Scanning pauses when you leave this tab. Switch back to continue!
              </span>
            </div>
          )}

          {/* Timer Display */}
          {(isRunning || wasStoppedByTab || wasStoppedByUser) && displayTimeRemaining > 0 && (
            <div style={{
              textAlign: "center",
              marginBottom: "14px",
              padding: "10px",
              background: isRunning ? "rgba(59,130,246,0.15)" : "rgba(245,158,11,0.15)",
              borderRadius: "10px",
              border: `1px solid ${isRunning ? "rgba(59,130,246,0.3)" : "rgba(245,158,11,0.3)"}`,
            }}>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>{isRunning ? "Time Remaining" : "Paused"}</span>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: isRunning ? "#3b82f6" : "#f59e0b" }}>
                {formatTimeRemaining(displayTimeRemaining)}
              </div>
            </div>
          )}

          {/* Duration & Interval Settings */}
          {showStartButton && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "9px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.3)",
                      fontSize: "11px",
                      background: "#334155",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {durationOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "9px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Interval</label>
                  <select
                    value={scanInterval}
                    onChange={(e) => setScanInterval(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.3)",
                      fontSize: "11px",
                      background: "#334155",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {intervalOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Custom Settings Toggle */}
              <button
                onClick={() => setShowCustom(!showCustom)}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: "8px",
                  color: "#60a5fa",
                  cursor: "pointer",
                  fontSize: "10px",
                }}
              >
                {showCustom ? "− Hide Custom" : "+ Custom Duration & Interval"}
              </button>

              {showCustom && (
                <div style={{ marginTop: "10px", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "9px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Custom Duration (seconds)</label>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(Math.min(180, Math.max(5, parseInt(e.target.value) || 5)))}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.3)",
                          fontSize: "11px",
                          background: "#334155",
                          color: "#fff",
                        }}
                      />
                      <div style={{ fontSize: "8px", color: "#64748b", marginTop: "2px" }}>Max 3 minutes (180s)</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "9px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Custom Interval (seconds)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={customInterval}
                        onChange={(e) => setCustomInterval(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.3)",
                          fontSize: "11px",
                          background: "#334155",
                          color: "#fff",
                        }}
                      />
                      <div style={{ fontSize: "8px", color: "#64748b", marginTop: "2px" }}>Min 1s, Max 10s</div>
                    </div>
                  </div>
                  <button
                    onClick={applyCustomSettings}
                    style={{
                      width: "100%",
                      padding: "6px",
                      background: "#10b981",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    Apply Custom Settings
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Smart Message */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: messageType === "excellent" ? "rgba(16,185,129,0.15)" : messageType === "good" ? "rgba(59,130,246,0.1)" : messageType === "warning" ? "rgba(239,68,68,0.1)" : "rgba(100,116,139,0.08)",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "16px",
            borderLeft: `3px solid ${messageType === "excellent" ? "#10b981" : messageType === "good" ? "#3b82f6" : messageType === "warning" ? "#ef4444" : "#94a3b8"}`,
          }}>
            <span style={{ fontSize: "20px" }}>{messageType === "excellent" ? "🎯" : messageType === "good" ? "📡" : messageType === "warning" ? "⚠️" : "📍"}</span>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "#cbd5e1", flex: 1, lineHeight: "1.4" }}>{smartMessage}</span>
          </div>

          {/* Live Metrics Display */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            marginBottom: "16px",
          }}>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: "#94a3b8" }}>Current Ping</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: getPingColor() }}>
                {displayCurrentPing !== null ? `${Math.round(displayCurrentPing)}ms` : isRunning ? "---" : "--"}
              </div>
              {displayCurrentPing !== null && displayCurrentPing < 30 && <div style={{ fontSize: "8px", color: "#10b981", marginTop: "4px" }}>🎯 Perfect!</div>}
              {displayCurrentPing !== null && displayCurrentPing >= 50 && <div style={{ fontSize: "8px", color: "#ef4444", marginTop: "4px" }}>🚶 Move!</div>}
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: "#94a3b8" }}>Best Ping</div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#10b981" }}>
                {displayBestPing !== null ? `${Math.round(displayBestPing)}ms` : "--"}
              </div>
              <div style={{ fontSize: "8px", color: "#64748b", marginTop: "4px" }}>🏆 Record</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: "#94a3b8" }}>Average</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#f59e0b" }}>
                {displayAveragePing !== null ? `${Math.round(displayAveragePing)}ms` : "--"}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: "#94a3b8" }}>Stability</div>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: (isRunning ? stability : savedScanState.stability) === "stable" ? "#10b981" : (isRunning ? stability : savedScanState.stability) === "moderate" ? "#f59e0b" : "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                <span>{getStabilityIcon()}</span> {getStabilityText()}
              </div>
            </div>
          </div>

          {/* Live Graph */}
          {displayPings.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "9px", color: "#94a3b8", marginBottom: "6px" }}>📊 Ping History (lower is better)</div>
              <div style={{ height: "120px" }}>
                <LiveGraph speeds={displayPings} label="Ping (ms)" graphType="ping" />
              </div>
              <div style={{ fontSize: "8px", color: "#64748b", textAlign: "center", marginTop: "6px" }}>
                {displayPings.length} measurements • Lower line = Better signal
              </div>
            </div>
          )}

          {/* Test Counter */}
          <div style={{
            textAlign: "center",
            marginTop: "8px",
            marginBottom: "12px",
            padding: "6px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "8px",
          }}>
            <span style={{ fontSize: "10px", color: "#64748b" }}>
              📊 Tests completed: {displayPings.length}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {showStartButton && (
              <button
                onClick={handleStart}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  borderRadius: "40px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>🔍</span> Find Best Signal
              </button>
            )}

            {showResumeButton && (
              <button
                onClick={handleResume}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  border: "none",
                  borderRadius: "40px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>🔄</span> Resume ({formatTimeRemaining(displayTimeRemaining)} left)
              </button>
            )}

            {showStopButton && (
              <button
                onClick={handleStop}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: "40px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>⏹️</span> Stop
              </button>
            )}

            {showNewScanButton && (
              <button
                onClick={handleNewScan}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  border: "none",
                  borderRadius: "40px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>🔄</span> New Scan
              </button>
            )}
          </div>

          {/* Results Summary */}
          {(showNewScanButton || scanComplete) && displayBestPing !== null && (
            <div style={{
              marginTop: "14px",
              padding: "12px",
              background: "rgba(16,185,129,0.1)",
              borderRadius: "10px",
              textAlign: "center",
              border: "1px solid rgba(16,185,129,0.2)",
            }}>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#10b981" }}>
                🎯 Best latency: {Math.round(displayBestPing)}ms
              </div>
              {improvement !== null && improvement > 0 && (
                <div style={{ fontSize: "11px", color: "#34d399", marginTop: "4px" }}>
                  📈 You improved by {improvement}%!
                </div>
              )}
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                {displayBestPing < 30 ? "🌟 Perfect for gaming & streaming!" : displayBestPing < 50 ? "👍 Good spot! Try another scan!" : "🚶 Try a new scan in different locations!"}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translate(-50%, -40%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}