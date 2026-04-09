// components/Hero.tsx
import { useState } from "react";
import StartTestButton from "./StartTestButton";
import MetricCard from "./MetricCard";
import { getScoreBreakdown, type ScoreBreakdown } from "../utils/connectionAnalyzer";

interface HeroProps {
  score: number | null;
  ping: number | null;
  download: number | null;
  upload: number | null;
  jitter: number | null;
  phase: string;
  running: boolean;
  isTestActive: boolean;
  onRunTest: () => void;
  mode: string;
  onModeChange: (mode: "gaming" | "streaming" | "work") => void;
  testSelection: { ping: boolean; jitter: boolean; download: boolean; upload: boolean };
  setTestSelection: (selection: any) => void;
  showLiveGraph: boolean;
  onToggleLiveGraph: () => void;
}

export default function Hero({
  score,
  ping,
  download,
  upload,
  jitter,
  phase,
  running,
  isTestActive,
  onRunTest,
  mode,
  onModeChange,
  testSelection,
  setTestSelection,
  showLiveGraph,
  onToggleLiveGraph,
}: HeroProps) {
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [showScoreExplanation, setShowScoreExplanation] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);

  const formatSpeed = (value: number | null) => {
    if (!value) return "--";
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const getSpeedDescription = (value: number | null, type: "download" | "upload") => {
    if (!value) return "";
    if (value > 1000) {
      const gbps = (value / 1000).toFixed(1);
      if (type === "download") {
        if (gbps > "5") return "🚀 Blazing fast";
        if (gbps > "1") return "⚡ Extremely fast";
        return "💨 Very fast";
      } else {
        if (gbps > "1") return "📤 Perfect for cloud backups";
        if (gbps > "0.5") return "👍 Great for video calls";
        return "✅ Good for everyday";
      }
    }
    if (value > 100) {
      return type === "download" ? "🎮 Great for gaming" : "📹 Perfect for video calls";
    }
    if (value > 50) {
      return type === "download" ? "📺 Good for HD streaming" : "💬 Fine for voice calls";
    }
    if (value > 25) {
      return "📱 Suitable for basic use";
    }
    return "⚠️ May struggle";
  };

  const getScoreMessage = (score: number) => {
    if (score > 80) return "Excellent connection 🚀 (click for details)";
    if (score > 50) return "Good connection 👍 (click for details)";
    return "Needs improvement ⚠️ (click for details)";
  };

  const getPhaseText = () => {
    switch (phase) {
      case "ping": return "📡 Testing Ping...";
      case "download": return "⬇️ Testing Download Speed...";
      case "upload": return "⬆️ Testing Upload Speed...";
      case "analyzing": return "🔍 Analyzing Results...";
      case "complete": return "✅ Test Complete!";
      default: return "";
    }
  };

  const isMetricLoading = (metricName: string) => {
    if (!running && phase !== "ping" && phase !== "download" && phase !== "upload") return false;
    if (metricName === "ping" && phase === "ping") return true;
    if (metricName === "download" && phase === "download") return true;
    if (metricName === "upload" && phase === "upload") return true;
    return false;
  };

  const handleScoreClick = () => {
    if (score !== null && ping !== null && download !== null && upload !== null) {
      const breakdown = getScoreBreakdown(ping, download, upload);
      setScoreBreakdown(breakdown);
      setShowScoreExplanation(true);
    }
  };

  const getDeductionExplanation = (breakdown: ScoreBreakdown) => {
    const maxDownloadScore = 40;
    const maxUploadScore = 20;
    const maxPingScore = 40;
    
    const downloadDeduction = maxDownloadScore - breakdown.downloadScore;
    const uploadDeduction = maxUploadScore - breakdown.uploadScore;
    const pingDeduction = maxPingScore - breakdown.pingScore;
    const totalDeduction = downloadDeduction + uploadDeduction + pingDeduction;
    
    let explanations = [];
    
    if (downloadDeduction > 0) {
      let reason = "";
      if (download && download < 100) {
        if (download < 25) reason = `Very slow (${download.toFixed(0)} Mbps)`;
        else if (download < 50) reason = `Below average (${download.toFixed(0)} Mbps)`;
        else if (download < 100) reason = `Good but not max (${download.toFixed(0)} Mbps)`;
        explanations.push(`📉 Download: -${downloadDeduction} points (${reason}, need 100+ Mbps for full 40 points)`);
      }
    }
    
    if (uploadDeduction > 0) {
      let reason = "";
      if (upload && upload < 50) {
        if (upload < 5) reason = `Very slow (${upload.toFixed(0)} Mbps)`;
        else if (upload < 10) reason = `Below average (${upload.toFixed(0)} Mbps)`;
        else if (upload < 50) reason = `Good but not max (${upload.toFixed(0)} Mbps)`;
        explanations.push(`📉 Upload: -${uploadDeduction} points (${reason}, need 50+ Mbps for full 20 points)`);
      }
    }
    
    if (pingDeduction > 0) {
      let reason = "";
      if (ping && ping > 20) {
        if (ping > 100) reason = `Very high latency (${ping.toFixed(0)} ms)`;
        else if (ping > 50) reason = `High latency (${ping.toFixed(0)} ms)`;
        else if (ping > 20) reason = `Good but not ideal (${ping.toFixed(0)} ms)`;
        explanations.push(`📉 Ping: -${pingDeduction} points (${reason}, need under 20ms for full 40 points)`);
      }
    }
    
    if (totalDeduction === 0) {
      explanations.push("✨ Perfect score! No points deducted anywhere!");
    } else {
      explanations.push(`\n📊 Total deduction: ${totalDeduction} points`);
      explanations.push(`🎯 Final score: ${breakdown.totalScore}/100`);
    }
    
    return explanations;
  };

  return (
    <>
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "clamp(20px, 5vw, 28px)",
          padding: "clamp(16px, 4vw, 24px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        {/* SCORE SECTION - Clickable */}
        {score !== null ? (
          <div 
            style={{ 
              marginBottom: "16px", 
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onClick={handleScoreClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <div
              style={{
                fontSize: "clamp(32px, 8vw, 44px)",
                fontWeight: "bold",
                color: score > 80 ? "#10b981" : score > 50 ? "#f59e0b" : "#ef4444",
              }}
            >
              {isTestActive ? "Testing..." : `${score}/100`}
            </div>
            {!isTestActive && (
              <div
                style={{
                  fontSize: "clamp(10px, 2.5vw, 12px)",
                  opacity: 0.6,
                  marginTop: "4px",
                  color: "#475569",
                }}
              >
                {getScoreMessage(score)}
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                fontSize: "clamp(24px, 6vw, 32px)",
                fontWeight: "bold",
                color: "#64748b",
              }}
            >
              Ready to Test
            </div>
          </div>
        )}

        {/* TESTING STATUS */}
        {isTestActive && (
          <div
            style={{
              fontSize: "clamp(13px, 3.5vw, 15px)",
              fontWeight: "500",
              marginBottom: "16px",
              color: "#3b82f6",
            }}
          >
            {getPhaseText()}
          </div>
        )}

        {/* METRICS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "clamp(10px, 3vw, 14px)",
            marginBottom: "20px",
          }}
        >
          {testSelection.ping && (
            <MetricCard 
              label="Ping" 
              value={ping !== null ? `${ping} ms` : undefined}
              icon="📡"
              isLoading={isMetricLoading("ping")}
              description={ping ? (ping < 20 ? "🎮 Excellent for gaming" : ping < 50 ? "👍 Good for most games" : "⚠️ May cause lag") : ""}
            />
          )}
          {testSelection.jitter && (
            <MetricCard 
              label="Jitter" 
              value={jitter !== null ? `${jitter} ms` : undefined}
              icon="⚡"
              isLoading={isMetricLoading("jitter")}
              description={jitter ? (jitter < 15 ? "✅ Very stable" : jitter < 30 ? "👍 Acceptable" : "⚠️ Unstable connection") : ""}
            />
          )}
          {testSelection.download && (
            <MetricCard
              label="Download"
              value={download !== null ? formatSpeed(download) : undefined}
              icon="⬇️"
              isLoading={isMetricLoading("download")}
              description={download ? getSpeedDescription(download, "download") : ""}
            />
          )}
          {testSelection.upload && (
            <MetricCard
              label="Upload"
              value={upload !== null ? formatSpeed(upload) : undefined}
              icon="⬆️"
              isLoading={isMetricLoading("upload")}
              description={upload ? getSpeedDescription(upload, "upload") : ""}
            />
          )}
        </div>

        {/* START BUTTON */}
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "inline-block",
              width: "100%",
              maxWidth: "280px",
              animation: running ? "pulse 1.5s infinite" : "none",
            }}
          >
            <StartTestButton onClick={onRunTest} disabled={running} />
          </div>
        </div>

        {/* TEST SELECTION - Compact Dropdown Inside Hero */}
        <div
          style={{
            marginBottom: "12px",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "12px",
          }}
        >
          <button
            onClick={() => setShowTestOptions(!showTestOptions)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              color: "#475569",
            }}
          >
            <span>🎯 Tests: {Object.values(testSelection).filter(Boolean).length}/4 selected</span>
            <span style={{ fontSize: "12px" }}>{showTestOptions ? "▲" : "▼"}</span>
          </button>

          {showTestOptions && !running && (
            <div
              style={{
                marginTop: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
                padding: "8px",
                background: "#f8fafc",
                borderRadius: "12px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  background: testSelection.ping ? "rgba(16,185,129,0.1)" : "transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                <input
                  type="checkbox"
                  checked={testSelection.ping}
                  onChange={(e) => setTestSelection({ ...testSelection, ping: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#10b981" }}
                />
                <span>📡 Ping</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  background: testSelection.jitter ? "rgba(139,92,246,0.1)" : "transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                <input
                  type="checkbox"
                  checked={testSelection.jitter}
                  onChange={(e) => setTestSelection({ ...testSelection, jitter: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#8b5cf6" }}
                />
                <span>⚡ Jitter</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  background: testSelection.download ? "rgba(59,130,246,0.1)" : "transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                <input
                  type="checkbox"
                  checked={testSelection.download}
                  onChange={(e) => setTestSelection({ ...testSelection, download: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#3b82f6" }}
                />
                <span>⬇️ Download</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  background: testSelection.upload ? "rgba(245,158,11,0.1)" : "transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                <input
                  type="checkbox"
                  checked={testSelection.upload}
                  onChange={(e) => setTestSelection({ ...testSelection, upload: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#f59e0b" }}
                />
                <span>⬆️ Upload</span>
              </label>
            </div>
          )}
        </div>

        {/* Toggle Switch for Live Graphs - Android Style */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "12px",
            padding: "8px 12px",
            background: "#f1f5f9",
            borderRadius: "40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "13px" }}>📈</span>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#475569" }}>
              Live Graphs
            </span>
          </div>
          <div
            onClick={onToggleLiveGraph}
            style={{
              width: "44px",
              height: "24px",
              background: showLiveGraph ? "#10b981" : "#94a3b8",
              borderRadius: "24px",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.3s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "white",
                borderRadius: "50%",
                position: "absolute",
                top: "2px",
                left: showLiveGraph ? "22px" : "2px",
                transition: "left 0.3s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>

        {/* MODE BUTTONS */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            justifyContent: "center",
          }}
        >
          {["gaming", "streaming", "work"].map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m as any)}
              disabled={running}
              style={{
                padding: "5px 12px",
                background: mode === m ? "#10b981" : "#f1f5f9",
                color: mode === m ? "#fff" : "#334155",
                border: mode === m ? "none" : "1px solid #e2e8f0",
                borderRadius: "40px",
                cursor: running ? "not-allowed" : "pointer",
                fontWeight: "500",
                fontSize: "clamp(10px, 2.5vw, 12px)",
                transition: "all 0.2s",
                opacity: running ? 0.6 : 1,
              }}
            >
              {m === "gaming" && "🎮 Gaming"}
              {m === "streaming" && "📺 Streaming"}
              {m === "work" && "💼 Work"}
            </button>
          ))}
        </div>
      </div>

      {/* Score Explanation Modal - Persistent, No Auto-close */}
      {showScoreExplanation && scoreBreakdown && (
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
              zIndex: 999,
            }}
            onClick={() => setShowScoreExplanation(false)}
          />
          
          {/* Modal */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#1e293b",
              color: "#fff",
              padding: "24px",
              borderRadius: "24px",
              maxWidth: "90%",
              width: "450px",
              maxHeight: "85vh",
              overflow: "auto",
              zIndex: 1000,
              boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              animation: "modalSlideUp 0.3s ease",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "2px solid rgba(255,255,255,0.1)",
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "22px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📊</span> Score Breakdown
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.7 }}>
                  {score && score > 80 ? "Excellent!" : score && score > 50 ? "Good effort!" : "Room for improvement"}
                </p>
              </div>
              <button 
                onClick={() => setShowScoreExplanation(false)}
                style={{ 
                  background: "rgba(255,255,255,0.1)", 
                  border: "none", 
                  color: "#fff", 
                  cursor: "pointer",
                  fontSize: "18px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
              >
                ✕
              </button>
            </div>

            {/* Score Circle in Modal */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  margin: "0 auto",
                  background: `conic-gradient(${score && score > 80 ? "#10b981" : score && score > 50 ? "#f59e0b" : "#ef4444"} ${(score || 0) * 3.6}deg, #334155 ${(score || 0) * 3.6}deg)`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#1e293b",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: score && score > 80 ? "#10b981" : score && score > 50 ? "#f59e0b" : "#ef4444" }}>
                    {score || "--"}
                  </div>
                  <div style={{ fontSize: "10px", opacity: 0.7 }}>/100</div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "14px", marginBottom: "12px", color: "#94a3b8" }}>Points Breakdown</h3>
              
              {/* Download Section */}
              <div style={{ 
                background: "rgba(59,130,246,0.1)", 
                borderRadius: "12px", 
                padding: "12px", 
                marginBottom: "10px",
                borderLeft: `3px solid ${scoreBreakdown.downloadScore === 40 ? "#10b981" : scoreBreakdown.downloadScore >= 20 ? "#f59e0b" : "#ef4444"}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "600" }}>⬇️ Download Speed</span>
                  <span style={{ fontWeight: "bold", color: scoreBreakdown.downloadScore === 40 ? "#10b981" : scoreBreakdown.downloadScore >= 20 ? "#f59e0b" : "#ef4444" }}>
                    {scoreBreakdown.downloadScore}/40
                  </span>
                </div>
                <div style={{ fontSize: "11px", opacity: 0.8, marginBottom: "6px" }}>
                  {scoreBreakdown.details.download}
                </div>
                {scoreBreakdown.downloadScore < 40 && (
                  <div style={{ fontSize: "10px", color: "#f59e0b", marginTop: "4px" }}>
                    💡 {download && download < 100 ? `Need ${(100 - download).toFixed(0)} more Mbps for full 40 points` : "Run faster test for max points"}
                  </div>
                )}
              </div>

              {/* Upload Section */}
              <div style={{ 
                background: "rgba(139,92,246,0.1)", 
                borderRadius: "12px", 
                padding: "12px", 
                marginBottom: "10px",
                borderLeft: `3px solid ${scoreBreakdown.uploadScore === 20 ? "#10b981" : scoreBreakdown.uploadScore >= 10 ? "#f59e0b" : "#ef4444"}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "600" }}>⬆️ Upload Speed</span>
                  <span style={{ fontWeight: "bold", color: scoreBreakdown.uploadScore === 20 ? "#10b981" : scoreBreakdown.uploadScore >= 10 ? "#f59e0b" : "#ef4444" }}>
                    {scoreBreakdown.uploadScore}/20
                  </span>
                </div>
                <div style={{ fontSize: "11px", opacity: 0.8, marginBottom: "6px" }}>
                  {scoreBreakdown.details.upload}
                </div>
                {scoreBreakdown.uploadScore < 20 && (
                  <div style={{ fontSize: "10px", color: "#f59e0b", marginTop: "4px" }}>
                    💡 {upload && upload < 50 ? `Need ${(50 - upload).toFixed(0)} more Mbps for full 20 points` : "Run faster test for max points"}
                  </div>
                )}
              </div>

              {/* Ping Section */}
              <div style={{ 
                background: "rgba(16,185,129,0.1)", 
                borderRadius: "12px", 
                padding: "12px", 
                marginBottom: "10px",
                borderLeft: `3px solid ${scoreBreakdown.pingScore === 40 ? "#10b981" : scoreBreakdown.pingScore >= 20 ? "#f59e0b" : "#ef4444"}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "600" }}>📡 Ping Latency</span>
                  <span style={{ fontWeight: "bold", color: scoreBreakdown.pingScore === 40 ? "#10b981" : scoreBreakdown.pingScore >= 20 ? "#f59e0b" : "#ef4444" }}>
                    {scoreBreakdown.pingScore}/40
                  </span>
                </div>
                <div style={{ fontSize: "11px", opacity: 0.8, marginBottom: "6px" }}>
                  {scoreBreakdown.details.ping}
                </div>
                {scoreBreakdown.pingScore < 40 && (
                  <div style={{ fontSize: "10px", color: "#f59e0b", marginTop: "4px" }}>
                    💡 {ping && ping > 20 ? `Reduce latency by ${(ping - 20).toFixed(0)}ms for full 40 points` : "Lower ping = better gaming experience"}
                  </div>
                )}
              </div>
            </div>

            {/* Deduction Summary */}
            <div style={{ 
              background: "rgba(0,0,0,0.3)", 
              borderRadius: "12px", 
              padding: "12px",
              marginBottom: "20px",
            }}>
              <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>📉 Points Deducted</div>
              {getDeductionExplanation(scoreBreakdown).map((line, idx) => (
                <div key={idx} style={{ fontSize: "11px", marginBottom: "4px", opacity: 0.8 }}>
                  {line}
                </div>
              ))}
            </div>

            {/* What affects score note */}
            <div style={{ 
              fontSize: "10px", 
              opacity: 0.6, 
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "12px",
            }}>
              💡 Download (40%) • Upload (20%) • Ping (40%)
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowScoreExplanation(false)}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "12px",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Got it!
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}