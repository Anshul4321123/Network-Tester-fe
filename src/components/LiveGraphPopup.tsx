// components/LiveGraphPopup.tsx - FIXED (duplicate keys)
import { useEffect, useState } from "react";
import LiveGraph from "./LiveGraph";

interface LiveGraphPopupProps {
  isOpen: boolean;
  onClose: () => void;
  downloadHistory: number[];
  uploadHistory: number[];
  pingHistory: number[];
  jitterHistory: number[];
  download: number | null;
  upload: number | null;
  ping: number | null;
  jitter: number | null;
  phase: string;
  running: boolean;
  testSelection: { ping: boolean; jitter: boolean; download: boolean; upload: boolean };
}

type GraphType = "ping" | "jitter" | "download" | "upload";

// Jitter Statistics Component
function JitterStats({ history }: { history: number[] }) {
  if (history.length === 0) return null;
  
  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const latest = history[history.length - 1];
  
  const getStability = () => {
    if (avg < 10 && max - min < 15) return { text: "Very Stable", color: "#10b981", icon: "✅" };
    if (avg < 20 && max - min < 30) return { text: "Stable", color: "#3b82f6", icon: "👍" };
    if (avg < 30) return { text: "Moderate", color: "#f59e0b", icon: "⚠️" };
    return { text: "Unstable", color: "#ef4444", icon: "❌" };
  };
  
  const stability = getStability();
  
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "8px",
      marginTop: "12px",
      padding: "12px",
      background: "rgba(139, 92, 246, 0.08)",
      borderRadius: "12px",
      fontSize: "11px",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#64748b", fontSize: "10px" }}>Latest</div>
        <div style={{ fontWeight: "bold", color: "#8b5cf6", fontSize: "13px" }}>{latest.toFixed(1)} ms</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#64748b", fontSize: "10px" }}>Average</div>
        <div style={{ fontWeight: "bold", fontSize: "13px" }}>{avg.toFixed(1)} ms</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#64748b", fontSize: "10px" }}>Range</div>
        <div style={{ fontWeight: "bold", fontSize: "13px" }}>{min.toFixed(0)} - {max.toFixed(0)} ms</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#64748b", fontSize: "10px" }}>Stability</div>
        <div style={{ fontWeight: "bold", color: stability.color, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
          <span>{stability.icon}</span> {stability.text}
        </div>
      </div>
    </div>
  );
}

// Ping Visualizer Component - FIXED duplicate keys
function PingVisualizer({ ping, isTesting, progress }: { ping: number | null; isTesting: boolean; progress: number }) {
  const getPingQuality = (pingMs: number) => {
    if (pingMs < 30) return { label: "Excellent", color: "#10b981", icon: "🚀", description: "Perfect for gaming & video calls" };
    if (pingMs < 60) return { label: "Good", color: "#3b82f6", icon: "👍", description: "Good for most activities" };
    if (pingMs < 100) return { label: "Fair", color: "#f59e0b", icon: "⚠️", description: "May experience minor lag" };
    return { label: "Poor", color: "#ef4444", icon: "❌", description: "Not recommended for real-time apps" };
  };

  const quality = ping ? getPingQuality(ping) : null;
  // FIXED: Use objects with unique id and timestamp for ripples
  const [ripples, setRipples] = useState<{ id: number; timestamp: number }[]>([]);

  // Create ripple effect for each ping during testing
  useEffect(() => {
    if (isTesting && ping && ping > 0 && ping < 500) {
      const id = Date.now();
      const timestamp = Date.now();
      setRipples(prev => [...prev.slice(-5), { id, timestamp }]);
      const timer = setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, ping);
      return () => clearTimeout(timer);
    }
  }, [ping, isTesting]);

  return (
    <div>
      {/* Animated Signal Waves */}
      <div style={{ position: "relative", height: "100px", marginBottom: "20px" }}>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70px",
          height: "70px",
          background: quality ? quality.color : "#3b82f6",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          boxShadow: `0 0 20px ${quality ? quality.color : "#3b82f6"}40`,
          transition: "all 0.3s ease",
        }}>
          <span style={{ fontSize: "28px" }}>📡</span>
        </div>
        
        {/* Ripple effects - FIXED: Use unique key combining id and timestamp */}
        {ripples.map((ripple, index) => (
          <div
            key={`ripple-${ripple.id}-${ripple.timestamp}`}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "70px",
              height: "70px",
              border: `2px solid ${quality ? quality.color : "#3b82f6"}`,
              borderRadius: "50%",
              animation: `ripple ${ping ? Math.min(ping, 500) / 1000 : 0.5}s ease-out forwards`,
              pointerEvents: "none",
              opacity: 1 - index * 0.2,
            }}
          />
        ))}
      </div>

      {/* Ping Value */}
      {ping !== null && quality && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "36px", fontWeight: "bold", color: quality.color }}>
            {ping.toFixed(1)} ms
          </div>
          <div style={{ fontSize: "13px", color: quality.color, marginTop: "4px" }}>
            {quality.icon} {quality.label}
          </div>
          <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
            {quality.description}
          </div>
        </div>
      )}

      {/* Progress Bar during test */}
      {isTesting && (
        <div style={{ marginTop: "16px" }}>
          <div style={{
            height: "4px",
            background: "#e2e8f0",
            borderRadius: "2px",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #10b981, #3b82f6)",
              transition: "width 0.1s linear",
            }} />
          </div>
          <div style={{ fontSize: "10px", color: "#64748b", marginTop: "6px", textAlign: "center" }}>
            Measuring ping... {progress.toFixed(0)}%
          </div>
        </div>
      )}

      <style>{`
        @keyframes ripple {
          0% {
            width: 70px;
            height: 70px;
            opacity: 0.8;
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Jitter Stability Meter Component (unchanged, but keep as is)
function JitterStabilityMeter({ jitter, history, isTesting }: { jitter: number | null; history: number[]; isTesting: boolean }) {
  if (!jitter && history.length === 0) return null;
  
  const currentJitter = jitter || (history.length > 0 ? history[history.length - 1] : 0);
  const avgJitter = history.length > 0 ? history.reduce((a, b) => a + b, 0) / history.length : currentJitter;
  const maxJitter = Math.max(...history, currentJitter);
  
  const getStabilityLevel = () => {
    if (currentJitter < 10) return { level: 5, text: "Very Stable", color: "#10b981", icon: "✅", bars: 5 };
    if (currentJitter < 20) return { level: 4, text: "Stable", color: "#3b82f6", icon: "👍", bars: 4 };
    if (currentJitter < 35) return { level: 3, text: "Moderate", color: "#f59e0b", icon: "⚠️", bars: 3 };
    if (currentJitter < 50) return { level: 2, text: "Unstable", color: "#ef4444", icon: "❌", bars: 2 };
    return { level: 1, text: "Very Unstable", color: "#dc2626", icon: "💀", bars: 1 };
  };
  
  const stability = getStabilityLevel();
  const stabilityScore = Math.max(0, Math.min(100, 100 - (avgJitter * 1.5)));
  
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "flex-end", height: "80px" }}>
          {[1, 2, 3, 4, 5].map((bar) => {
            const isActive = bar <= stability.bars;
            return (
              <div
                key={bar}
                style={{
                  width: "45px",
                  height: `${bar * 12}px`,
                  background: isActive ? stability.color : "#475569",
                  borderRadius: "6px",
                  transition: "all 0.3s ease",
                  opacity: isActive ? 1 : 0.3,
                  boxShadow: isActive ? `0 0 10px ${stability.color}40` : "none",
                }}
              />
            );
          })}
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", textAlign: "center", marginTop: "8px" }}>
          Connection Stability
        </div>
      </div>
      
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "36px", fontWeight: "bold", color: stability.color }}>
          {currentJitter.toFixed(1)} ms
        </div>
        <div style={{ fontSize: "13px", color: stability.color, marginTop: "4px" }}>
          {stability.icon} {stability.text}
        </div>
      </div>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        padding: "12px",
        background: "rgba(0,0,0,0.05)",
        borderRadius: "12px",
        marginBottom: "12px",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#64748b" }}>Average</div>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1e293b" }}>
            {avgJitter.toFixed(1)} ms
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#64748b" }}>Peak</div>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1e293b" }}>
            {maxJitter.toFixed(1)} ms
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#64748b" }}>Score</div>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: stability.color }}>
            {stabilityScore.toFixed(0)}%
          </div>
        </div>
      </div>
      
      <div style={{
        padding: "10px",
        background: `rgba(${stability.color === "#10b981" ? "16,185,129" : stability.color === "#3b82f6" ? "59,130,246" : stability.color === "#f59e0b" ? "245,158,11" : "239,68,68"}, 0.1)`,
        borderRadius: "10px",
        fontSize: "11px",
        textAlign: "center",
        color: stability.color,
      }}>
        {currentJitter < 10 && "✅ Perfect for gaming, streaming, and video calls"}
        {currentJitter >= 10 && currentJitter < 20 && "👍 Good for most activities, may have minor hiccups"}
        {currentJitter >= 20 && currentJitter < 35 && "⚠️ May experience lag during gaming or video calls"}
        {currentJitter >= 35 && "❌ Not recommended for real-time applications"}
      </div>
      
      {isTesting && (
        <div style={{ marginTop: "12px", fontSize: "10px", textAlign: "center", color: "#64748b" }}>
          📊 Collecting stability data...
        </div>
      )}
    </div>
  );
}

export default function LiveGraphPopup({
  isOpen,
  onClose,
  downloadHistory,
  uploadHistory,
  pingHistory,
  jitterHistory,
  download,
  upload,
  ping,
  jitter,
  phase,
  running,
  testSelection,
}: LiveGraphPopupProps) {
  const [activeGraph, setActiveGraph] = useState<GraphType>("download");
  const [pingProgress, setPingProgress] = useState(0);

  const formatSpeed = (value: number | null) => {
    if (!value) return "--";
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  // const formatLatency = (value: number | null) => {
  //   if (!value) return "--";
  //   return `${value.toFixed(1)} ms`;
  // };

  useEffect(() => {
    if (phase === "ping" && testSelection.ping) {
      setActiveGraph("ping");
    } else if (phase === "download" && testSelection.download) {
      setActiveGraph("download");
    } else if (phase === "upload" && testSelection.upload) {
      setActiveGraph("upload");
    }
  }, [phase, testSelection]);

  useEffect(() => {
    if (phase === "ping" && pingHistory.length > 0) {
      const progress = (pingHistory.length / 8) * 100;
      setPingProgress(progress);
    } else {
      setPingProgress(0);
    }
  }, [pingHistory, phase]);

  if (!isOpen) return null;

  const getCurrentValue = () => {
    switch (activeGraph) {
      case "ping":
        return pingHistory.length > 0 ? pingHistory[pingHistory.length - 1] : ping;
      case "jitter":
        return jitterHistory.length > 0 ? jitterHistory[jitterHistory.length - 1] : jitter;
      case "download":
        return downloadHistory.length > 0 ? downloadHistory[downloadHistory.length - 1] : download;
      case "upload":
        return uploadHistory.length > 0 ? uploadHistory[uploadHistory.length - 1] : upload;
      default:
        return null;
    }
  };

  const currentValue = getCurrentValue();
  const isTestActive = running || phase === "ping" || phase === "download" || phase === "upload";

  const getGraphConfig = (type: GraphType) => {
    switch (type) {
      case "ping":
        return { label: "Ping Latency", unit: "ms", icon: "📡", color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" };
      case "jitter":
        return { label: "Jitter", unit: "ms", icon: "⚡", color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" };
      case "download":
        return { label: "Download Speed", unit: "Mbps", icon: "⬇️", color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" };
      case "upload":
        return { label: "Upload Speed", unit: "Mbps", icon: "⬆️", color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" };
    }
  };

  const getGraphData = (type: GraphType) => {
    switch (type) {
      case "ping": return pingHistory;
      case "jitter": return jitterHistory;
      case "download": return downloadHistory;
      case "upload": return uploadHistory;
      default: return [];
    }
  };

  const formatValue = (type: GraphType, value: number | null) => {
    if (!value) return "--";
    if (type === "download" || type === "upload") {
      if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
      return `${value.toFixed(1)} Mbps`;
    }
    return `${value.toFixed(1)} ms`;
  };

  const isLive = (type: GraphType) => {
    return (type === "ping" && phase === "ping") ||
           (type === "download" && phase === "download") ||
           (type === "upload" && phase === "upload");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "28px",
          maxWidth: "650px",
          width: "100%",
          maxHeight: "85vh",
          overflow: "auto",
          padding: "24px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
          animation: "slideUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "12px",
            borderBottom: "2px solid #e2e8f0",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📈</span>
              Live Test Graphs
              {isTestActive && (
                <span
                  style={{
                    fontSize: "10px",
                    background: "#ef4444",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    animation: "pulse 1.5s infinite",
                  }}
                >
                  LIVE
                </span>
              )}
            </h3>
            {isTestActive && (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                Watching live data - graphs update in real-time
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "#64748b",
              padding: "8px 12px",
              borderRadius: "12px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
          >
            ✕
          </button>
        </div>

        {/* Graph Selector Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {testSelection.ping && (
            <button
              onClick={() => setActiveGraph("ping")}
              style={{
                flex: 1,
                minWidth: "80px",
                padding: "10px 12px",
                background: activeGraph === "ping" ? getGraphConfig("ping").gradient : "#f1f5f9",
                color: activeGraph === "ping" ? "#fff" : "#64748b",
                border: "none",
                borderRadius: "16px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>📡</span>
              Ping
              {phase === "ping" && (
                <span style={{ fontSize: "8px", background: "#10b981", padding: "2px 4px", borderRadius: "8px" }}>LIVE</span>
              )}
            </button>
          )}
          {testSelection.jitter && (
            <button
              onClick={() => setActiveGraph("jitter")}
              style={{
                flex: 1,
                minWidth: "80px",
                padding: "10px 12px",
                background: activeGraph === "jitter" ? getGraphConfig("jitter").gradient : "#f1f5f9",
                color: activeGraph === "jitter" ? "#fff" : "#64748b",
                border: "none",
                borderRadius: "16px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>⚡</span>
              Jitter
              {phase === "ping" && (
                <span style={{ fontSize: "8px", background: "#8b5cf6", padding: "2px 4px", borderRadius: "8px" }}>LIVE</span>
              )}
            </button>
          )}
          {testSelection.download && (
            <button
              onClick={() => setActiveGraph("download")}
              style={{
                flex: 1,
                minWidth: "80px",
                padding: "10px 12px",
                background: activeGraph === "download" ? getGraphConfig("download").gradient : "#f1f5f9",
                color: activeGraph === "download" ? "#fff" : "#64748b",
                border: "none",
                borderRadius: "16px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>⬇️</span>
              Download
              {phase === "download" && (
                <span style={{ fontSize: "8px", background: "#10b981", padding: "2px 4px", borderRadius: "8px" }}>LIVE</span>
              )}
            </button>
          )}
          {testSelection.upload && (
            <button
              onClick={() => setActiveGraph("upload")}
              style={{
                flex: 1,
                minWidth: "80px",
                padding: "10px 12px",
                background: activeGraph === "upload" ? getGraphConfig("upload").gradient : "#f1f5f9",
                color: activeGraph === "upload" ? "#fff" : "#64748b",
                border: "none",
                borderRadius: "16px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>⬆️</span>
              Upload
              {phase === "upload" && (
                <span style={{ fontSize: "8px", background: "#10b981", padding: "2px 4px", borderRadius: "8px" }}>LIVE</span>
              )}
            </button>
          )}
        </div>

        {/* Enhanced Current Value Display */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {activeGraph === "ping" && (
            <PingVisualizer 
              ping={currentValue} 
              isTesting={phase === "ping"} 
              progress={pingProgress}
            />
          )}
          
          {activeGraph === "jitter" && (
            <JitterStabilityMeter 
              jitter={currentValue}
              history={jitterHistory}
              isTesting={phase === "ping"}
            />
          )}
          
          {(activeGraph === "download" || activeGraph === "upload") && (
            <>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                CURRENT {getGraphConfig(activeGraph).label.toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: "clamp(32px, 6vw, 48px)",
                  fontWeight: "bold",
                  color: getGraphConfig(activeGraph).color,
                }}
              >
                {formatValue(activeGraph, currentValue)}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                {isTestActive ? "Updating in real-time..." : "Final result"}
              </div>
            </>
          )}
        </div>

        {(activeGraph === "download" || activeGraph === "upload") && (
          <div style={{ width: "100%", minHeight: "250px" }}>
            <LiveGraph 
              speeds={getGraphData(activeGraph)} 
              isLive={isLive(activeGraph)}
              label={getGraphConfig(activeGraph).label}
              graphType={activeGraph}
            />
            <div
              style={{
                fontSize: "11px",
                textAlign: "center",
                marginTop: "12px",
                color: "#64748b",
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <span>📊 Data points: {getGraphData(activeGraph).length}</span>
              {activeGraph === "download" && download && <span>🎯 Final: {formatSpeed(download)}</span>}
              {activeGraph === "upload" && upload && <span>🎯 Final: {formatSpeed(upload)}</span>}
              {isLive(activeGraph) && <span style={{ color: getGraphConfig(activeGraph).color }}>⚡ Recording live...</span>}
            </div>
          </div>
        )}

        {activeGraph === "jitter" && jitterHistory.length > 0 && (
          <JitterStats history={jitterHistory} />
        )}

        {activeGraph === "ping" && pingHistory.length > 0 && (
          <div style={{
            marginTop: "12px",
            padding: "12px",
            background: "rgba(16, 185, 129, 0.08)",
            borderRadius: "12px",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              fontSize: "11px",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: "10px" }}>Min Ping</div>
                <div style={{ fontWeight: "bold", color: "#10b981" }}>
                  {Math.min(...pingHistory).toFixed(1)} ms
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: "10px" }}>Max Ping</div>
                <div style={{ fontWeight: "bold", color: "#f59e0b" }}>
                  {Math.max(...pingHistory).toFixed(1)} ms
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: "10px" }}>Avg Ping</div>
                <div style={{ fontWeight: "bold", color: "#3b82f6" }}>
                  {(pingHistory.reduce((a, b) => a + b, 0) / pingHistory.length).toFixed(1)} ms
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "rgba(59,130,246,0.08)",
            borderRadius: "12px",
            textAlign: "center",
            fontSize: "12px",
            color: "#475569",
          }}
        >
          {phase === "ping" && testSelection.ping && "📡 Testing ping latency - watching signal strength..."}
          {phase === "download" && testSelection.download && "⬇️ Download test in progress - watching speed fluctuate..."}
          {phase === "upload" && testSelection.upload && "⬆️ Upload test in progress - data being sent..."}
          {phase === "analyzing" && "🔍 Analyzing results..."}
          {phase === "complete" && "✅ Test complete! Final results shown above."}
          {!running && phase === "idle" && (
            "💡 Select different tabs above to see different metrics"
          )}
        </div>

        <div
          style={{
            marginTop: "12px",
            fontSize: "10px",
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          💡 {activeGraph === "ping" ? "Watch the signal waves - each ripple represents a ping" : 
              activeGraph === "jitter" ? "Stability bars show connection quality" : 
              "Graphs update live during testing"} • Click outside or press ✕ to close
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "12px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            color: "#64748b",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e2e8f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
          }}
        >
          Close
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}