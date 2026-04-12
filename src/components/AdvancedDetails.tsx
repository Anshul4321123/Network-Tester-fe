// components/AdvancedDetails.tsx - Fixed with separate columns for Your Name and Original ISP
import { getBestScore, getBestStats, type SpeedTestRecord } from "../utils/storage";
import { useState, useEffect } from "react";

interface AdvancedDetailsProps {
  bufferbloat: number | null;
  history: SpeedTestRecord[];
  autoRun: boolean;
  onAutoRunToggle: () => void;
  monitorPing: number | null;
  isTabVisible: boolean;
  isTestActive: boolean;
  download: number | null;
  upload: number | null;
  phase: string;
}

// Helper function to parse date string
const parseDate = (dateStr: string): { date: string; time: string } => {
  const parts = dateStr.split(", ");
  if (parts.length === 2) {
    return { date: parts[0], time: parts[1] };
  }
  return { date: dateStr, time: "" };
};

// Calculate trend based on recent history
const calculateTrend = (history: SpeedTestRecord[]): { 
  trend: "Improving" | "Degrading" | "Stable";
  icon: string;
  color: string;
  percentChange: number;
} => {
  if (history.length < 3) {
    return { trend: "Stable", icon: "📊", color: "#64748b", percentChange: 0 };
  }

  const recentTests = history.slice(0, Math.min(5, history.length));
  const oldestScore = recentTests[recentTests.length - 1]?.score || 0;
  const newestScore = recentTests[0]?.score || 0;
  
  const percentChange = ((newestScore - oldestScore) / oldestScore) * 100;
  
  if (percentChange > 10) {
    return { trend: "Improving", icon: "📈", color: "#10b981", percentChange: Math.round(percentChange) };
  } else if (percentChange < -10) {
    return { trend: "Degrading", icon: "📉", color: "#ef4444", percentChange: Math.abs(Math.round(percentChange)) };
  } else {
    return { trend: "Stable", icon: "📊", color: "#f59e0b", percentChange: 0 };
  }
};

export default function AdvancedDetails({
  bufferbloat,
  history,
  autoRun,
  onAutoRunToggle,
  monitorPing,
  isTabVisible,
  isTestActive,
}: AdvancedDetailsProps) {
  const bestScore = getBestScore();
  const bestStats = getBestStats();
  const [showToggleFeedback, setShowToggleFeedback] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<number | null>(null);
  const [timeUntilNextPing, setTimeUntilNextPing] = useState<number>(300);
  const [timeUntilNextFullTest, setTimeUntilNextFullTest] = useState<number>(1800);
  const [, setShowMonitoringInfo] = useState(false);
  
  const trendData = calculateTrend(history);

  const formatSpeed = (value: number) => {
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const handleToggle = () => {
    onAutoRunToggle();
    setShowToggleFeedback(true);
    setLastActionTime(Date.now());
    setTimeout(() => setShowToggleFeedback(false), 3000);
  };

  useEffect(() => {
    if (!autoRun || !isTabVisible) return;

    const interval = setInterval(() => {
      setTimeUntilNextPing(prev => {
        if (prev <= 1) return 300;
        return prev - 1;
      });
      setTimeUntilNextFullTest(prev => {
        if (prev <= 1) return 1800;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRun, isTabVisible]);

  useEffect(() => {
    if (autoRun && isTabVisible) {
      setTimeUntilNextPing(300);
      setTimeUntilNextFullTest(1800);
    }
  }, [autoRun, isTabVisible]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getMonitoringStatus = () => {
    if (!autoRun) {
      return {
        icon: "⏹️",
        text: "Monitoring is OFF",
        color: "#64748b",
        bgColor: "rgba(100,116,139,0.1)",
        details: "Automatic speed tests are disabled",
        action: "Click 'Enable Monitoring' to start",
        suggestion: "Monitoring helps track your connection quality over time",
      };
    }
    
    if (!isTabVisible) {
      return {
        icon: "😴",
        text: "Monitoring Paused",
        color: "#f59e0b",
        bgColor: "rgba(245,158,11,0.1)",
        details: "Tab is hidden • Tests are paused to save resources",
        action: "Switch back to this tab to resume",
        suggestion: "Monitoring only works when this tab is visible",
      };
    }
    
    if (monitorPing !== null && monitorPing >= 0 && monitorPing > 150) {
      return {
        icon: "⚠️",
        text: "High Latency Detected",
        color: "#ef4444",
        bgColor: "rgba(239,68,68,0.1)",
        details: `Current ping: ${monitorPing} ms • Connection may be unstable`,
        action: "Auto-test may trigger soon",
        suggestion: "Consider checking your network connection",
      };
    }
    
    return {
      icon: "🔔",
      text: "Monitoring Active",
      color: "#10b981",
      bgColor: "rgba(16,185,129,0.1)",
      details: "Actively tracking your connection",
      action: "Tests run automatically",
      suggestion: "Keep this tab open for continuous monitoring",
    };
  };

  const status = getMonitoringStatus();

  // Helper to check if ISP is customized
  const isCustomized = (record: SpeedTestRecord) => {
    return record.originalIsp && record.originalIsp !== (record.customName || record.isp);
  };

  return (
    <details
      style={{
        background: "rgba(255,255,255,0.9)",
        borderRadius: "20px",
        padding: "12px 16px",
        cursor: "pointer",
      }}
      onToggle={(e) => {
        if ((e.target as HTMLDetailsElement).open) {
          setShowMonitoringInfo(true);
        }
      }}
    >
      <summary
        style={{
          fontWeight: "600",
          color: "#475569",
          fontSize: "13px",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>📊 Advanced Details</span>
        {autoRun && isTabVisible && (
          <span
            style={{
              fontSize: "10px",
              background: "#10b981",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "20px",
              animation: "pulse 1.5s infinite",
            }}
          >
            LIVE
          </span>
        )}
      </summary>

      <div style={{ marginTop: "16px" }}>
        {/* Bufferbloat */}
        {bufferbloat !== null && !isTestActive && (
          <div
            style={{
              fontSize: "12px",
              padding: "10px",
              background: bufferbloat < 20 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              borderRadius: "12px",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            <span>📦 Bufferbloat: {bufferbloat} ms</span>
            <span style={{ marginLeft: "8px", fontSize: "11px" }}>
              {bufferbloat < 20
                ? "✅ Good - No lag under load"
                : bufferbloat < 50
                ? "⚠️ Moderate - May experience some lag"
                : "❌ High - Significant lag under load"}
            </span>
          </div>
        )}

        {/* Best Stats Summary */}
        {bestStats !== null && (
          <div
            style={{
              fontSize: "11px",
              padding: "8px",
              background: "rgba(234,179,8,0.05)",
              borderRadius: "12px",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            <span>🏆 Best: {formatSpeed(bestStats.bestDownload)} ↓ / {formatSpeed(bestStats.bestUpload)} ↑ / {bestStats.bestPing.toFixed(2)}ms 📡</span>
          </div>
        )}

        {/* Best Score */}
        {bestScore !== null && (
          <div
            style={{
              fontSize: "11px",
              padding: "8px",
              background: "rgba(234,179,8,0.08)",
              borderRadius: "12px",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            🏆 Best Score: {bestScore}/100
          </div>
        )}

        {/* Enhanced Monitoring Section */}
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              background: "rgba(59,130,246,0.08)",
              borderRadius: "12px",
              padding: "10px",
              marginBottom: "12px",
              fontSize: "10px",
              color: "#475569",
              borderLeft: "3px solid #3b82f6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span>🔔</span>
              <span style={{ fontWeight: "600" }}>Monitoring tracks your internet quality</span>
            </div>
            <div style={{ lineHeight: "1.4" }}>
              We'll alert you when your connection drops or has issues
            </div>
          </div>

          {/* Status Card */}
          <div
            style={{
              background: status.bgColor,
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "12px",
              border: `1px solid ${status.color}30`,
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "20px" }}>{status.icon}</span>
              <div>
                <div style={{ fontWeight: "600", fontSize: "13px", color: status.color }}>
                  {status.text}
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                  {status.details}
                </div>
              </div>
            </div>
            
            {autoRun && isTabVisible && (
              <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: "10px", fontWeight: "600", marginBottom: "8px", color: "#1e293b" }}>⏱️ Next Tests In:</div>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ background: "rgba(0,0,0,0.05)", padding: "6px 12px", borderRadius: "8px", flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#64748b" }}>📡 Ping Check</div>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#3b82f6" }}>{formatTime(timeUntilNextPing)}</div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.05)", padding: "6px 12px", borderRadius: "8px", flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#64748b" }}>🔬 Full Test</div>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#8b5cf6" }}>{formatTime(timeUntilNextFullTest)}</div>
                  </div>
                </div>
              </div>
            )}
            
            {autoRun && !isTabVisible && (
              <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <div style={{ background: "rgba(245,158,11,0.15)", padding: "8px", borderRadius: "8px", fontSize: "10px", color: "#92400e" }}>
                  ⏸ Monitoring pauses when you leave this tab. Resume when you return.
                </div>
              </div>
            )}

            <div style={{ marginTop: "8px", fontSize: "9px", color: "#64748b", fontStyle: "italic" }}>
              💡 {status.suggestion}
            </div>
          </div>

          {/* Toggle Button */}
          <div style={{ textAlign: "center", position: "relative", marginTop: "12px" }}>
            <button
              onClick={handleToggle}
              style={{
                padding: "10px 24px",
                background: autoRun ? "#ef4444" : "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "40px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "13px",
                transition: "all 0.2s",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <span>{autoRun ? "🛑" : "🔔"}</span>
              {autoRun ? "Stop Monitoring" : "Enable Monitoring"}
            </button>

            {showToggleFeedback && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  marginBottom: "10px",
                  background: autoRun ? "#ef4444" : "#10b981",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  animation: "fadeInUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards",
                  pointerEvents: "none",
                  zIndex: 100,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {autoRun ? "✅ Monitoring Started" : "✅ Monitoring Stopped"}
              </div>
            )}
          </div>

          {lastActionTime && (
            <div style={{ textAlign: "center", fontSize: "9px", color: "#94a3b8", marginTop: "8px", opacity: 0.6 }}>
              Last change: {new Date(lastActionTime).toLocaleTimeString()}
            </div>
          )}

          {autoRun && isTabVisible && monitorPing !== null && monitorPing >= 0 && (
            <div style={{ marginTop: "10px", padding: "8px", background: "rgba(16,185,129,0.08)", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#64748b" }}>📡 Current Ping: </span>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: monitorPing < 50 ? "#10b981" : monitorPing < 100 ? "#f59e0b" : "#ef4444" }}>
                {monitorPing} ms
              </span>
            </div>
          )}
        </div>

        {/* History - Last 5 records with separate columns for Your Name and Original ISP */}
        {history.length > 0 && !isTestActive && (
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#475569",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>📜 Recent Tests</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  color: trendData.color,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: `${trendData.color}15`,
                  padding: "4px 8px",
                  borderRadius: "20px",
                }}
              >
                {trendData.icon} {trendData.trend}
                {trendData.percentChange > 0 && ` +${trendData.percentChange}%`}
                {trendData.percentChange < 0 && ` -${trendData.percentChange}%`}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {history.slice(0, 5).map((record, idx) => {
                const { date, time } = parseDate(record.date);
                const customized = isCustomized(record);
                const customName = record.customName || record.isp || "Unknown";
                const originalISP = record.originalIsp || "Unknown";
                
                return (
                  <div
                    key={idx}
                    style={{
                      fontSize: "11px",
                      padding: "8px 10px",
                      background: "rgba(100,116,139,0.05)",
                      borderRadius: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {/* Row 1: Date, Time, and Metrics */}
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ color: "#64748b" }}>{date}</span>
                        <span style={{ color: "#94a3b8", fontSize: "9px" }}>{time}</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <span>📡 {record.ping}ms</span>
                        <span>⬇️ {formatSpeed(record.download)}</span>
                        <span>⬆️ {formatSpeed(record.upload)}</span>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: record.score > 80 ? "#10b981" : record.score > 50 ? "#f59e0b" : "#ef4444",
                          }}
                        >
                          {record.score}
                        </span>
                      </div>
                    </div>
                    
                    {/* Row 2: Your Name and Original ISP */}
                    <div style={{ 
                      display: "flex", 
                      gap: "16px", 
                      fontSize: "10px", 
                      color: "#64748b",
                      borderTop: "1px solid rgba(0,0,0,0.05)",
                      paddingTop: "6px",
                      flexWrap: "wrap",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>🏷️</span>
                        <span style={{ fontWeight: customized ? "600" : "400", color: "#1e293b" }}>
                          {customName}
                        </span>
                        {customized && <span style={{ fontSize: "9px", color: "#10b981" }}>✏️</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>🏢</span>
                        <span style={{ color: "#94a3b8" }}>{originalISP}</span>
                      </div>
                      {record.networkType && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>📶</span>
                          <span>{record.networkType.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </details>
  );
}