// components/ScoreBreakdownModal.tsx
import type { ScoreBreakdownProps } from "../types/hero.types";

const getDeductionExplanation = (
  breakdown: any,
  download: number | null,
  upload: number | null,
  ping: number | null
) => {
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
    if (download && download < 25) reason = `Very slow (${download.toFixed(0)} Mbps)`;
    else if (download && download < 50) reason = `Below average (${download.toFixed(0)} Mbps)`;
    else if (download && download < 100) reason = `Good but not max (${download.toFixed(0)} Mbps)`;
    explanations.push(`📉 Download: -${downloadDeduction} points (${reason || `need ${(100 - (download || 0)).toFixed(0)} more Mbps`}, need 100+ Mbps for full 40 points)`);
  }
  
  if (uploadDeduction > 0) {
    let reason = "";
    if (upload && upload < 5) reason = `Very slow (${upload.toFixed(0)} Mbps)`;
    else if (upload && upload < 10) reason = `Below average (${upload.toFixed(0)} Mbps)`;
    else if (upload && upload < 50) reason = `Good but not max (${upload.toFixed(0)} Mbps)`;
    explanations.push(`📉 Upload: -${uploadDeduction} points (${reason || `need ${(50 - (upload || 0)).toFixed(0)} more Mbps`}, need 50+ Mbps for full 20 points)`);
  }
  
  if (pingDeduction > 0) {
    let reason = "";
    if (ping && ping > 100) reason = `Very high latency (${ping.toFixed(0)} ms)`;
    else if (ping && ping > 50) reason = `High latency (${ping.toFixed(0)} ms)`;
    else if (ping && ping > 20) reason = `Good but not ideal (${ping.toFixed(0)} ms)`;
    explanations.push(`📉 Ping: -${pingDeduction} points (${reason || `need to reduce by ${((ping || 0) - 20).toFixed(0)}ms`}, need under 20ms for full 40 points)`);
  }
  
  if (totalDeduction === 0) {
    explanations.push("✨ Perfect score! No points deducted anywhere!");
  } else {
    explanations.push(`\n📊 Total deduction: ${totalDeduction} points`);
    explanations.push(`🎯 Final score: ${breakdown.totalScore}/100`);
  }
  
  return explanations;
};

export default function ScoreBreakdownModal({ 
  score, 
  scoreBreakdown, 
  onClose,
  download,
  upload,
  ping
}: ScoreBreakdownProps & { download?: number | null; upload?: number | null; ping?: number | null }) {
  if (!scoreBreakdown) return null;

  const deductionExplanations = getDeductionExplanation(scoreBreakdown, download || null, upload || null, ping || null);

  return (
    <>
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
        onClick={onClose}
      />
      
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          color: "#fff",
          padding: "24px",
          borderRadius: "24px",
          maxWidth: "90%",
          width: "500px",
          maxHeight: "85vh",
          overflow: "auto",
          zIndex: 1000,
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          animation: "modalSlideUp 0.3s ease",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
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
            onClick={onClose}
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

        {/* Score Circle */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              margin: "0 auto",
              background: `conic-gradient(${score && score > 80 ? "#10b981" : score && score > 50 ? "#f59e0b" : "#ef4444"} ${(score || 0) * 3.6}deg, #334155 ${(score || 0) * 3.6}deg)`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                width: "90px",
                height: "90px",
                background: "#1e293b",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                border: "2px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ fontSize: "32px", fontWeight: "bold", color: score && score > 80 ? "#10b981" : score && score > 50 ? "#f59e0b" : "#ef4444" }}>
                {score || "--"}
              </div>
              <div style={{ fontSize: "10px", opacity: 0.7 }}>/100</div>
            </div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "13px", marginBottom: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📋</span> Points Breakdown
          </h3>
          
          <div style={{ 
            background: "rgba(59,130,246,0.1)", 
            borderRadius: "12px", 
            padding: "12px", 
            marginBottom: "10px",
            borderLeft: `3px solid ${scoreBreakdown.downloadScore === 40 ? "#10b981" : scoreBreakdown.downloadScore >= 20 ? "#f59e0b" : "#ef4444"}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontWeight: "600", fontSize: "13px" }}>⬇️ Download Speed</span>
              <span style={{ fontWeight: "bold", fontSize: "13px", color: scoreBreakdown.downloadScore === 40 ? "#10b981" : scoreBreakdown.downloadScore >= 20 ? "#f59e0b" : "#ef4444" }}>
                {scoreBreakdown.downloadScore}/40
              </span>
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8, marginBottom: "6px" }}>
              {scoreBreakdown.details.download}
            </div>
          </div>

          <div style={{ 
            background: "rgba(139,92,246,0.1)", 
            borderRadius: "12px", 
            padding: "12px", 
            marginBottom: "10px",
            borderLeft: `3px solid ${scoreBreakdown.uploadScore === 20 ? "#10b981" : scoreBreakdown.uploadScore >= 10 ? "#f59e0b" : "#ef4444"}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontWeight: "600", fontSize: "13px" }}>⬆️ Upload Speed</span>
              <span style={{ fontWeight: "bold", fontSize: "13px", color: scoreBreakdown.uploadScore === 20 ? "#10b981" : scoreBreakdown.uploadScore >= 10 ? "#f59e0b" : "#ef4444" }}>
                {scoreBreakdown.uploadScore}/20
              </span>
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8, marginBottom: "6px" }}>
              {scoreBreakdown.details.upload}
            </div>
          </div>

          <div style={{ 
            background: "rgba(16,185,129,0.1)", 
            borderRadius: "12px", 
            padding: "12px", 
            marginBottom: "10px",
            borderLeft: `3px solid ${scoreBreakdown.pingScore === 40 ? "#10b981" : scoreBreakdown.pingScore >= 20 ? "#f59e0b" : "#ef4444"}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontWeight: "600", fontSize: "13px" }}>📡 Ping Latency</span>
              <span style={{ fontWeight: "bold", fontSize: "13px", color: scoreBreakdown.pingScore === 40 ? "#10b981" : scoreBreakdown.pingScore >= 20 ? "#f59e0b" : "#ef4444" }}>
                {scoreBreakdown.pingScore}/40
              </span>
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8, marginBottom: "6px" }}>
              {scoreBreakdown.details.ping}
            </div>
          </div>
        </div>

        {/* Deduction Explanation Section - NOW USING THE FUNCTION */}
        <div style={{ 
          background: "rgba(0,0,0,0.3)", 
          borderRadius: "12px", 
          padding: "14px",
          marginBottom: "20px",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ 
            fontSize: "11px", 
            fontWeight: "600", 
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#f59e0b"
          }}>
            <span>📉</span> Points Deducted
          </div>
          {deductionExplanations.map((line, idx) => (
            <div key={idx} style={{ 
              fontSize: "11px", 
              marginBottom: "6px", 
              opacity: 0.9,
              lineHeight: "1.5",
              color: line.includes("Perfect") ? "#10b981" : line.includes("Total") || line.includes("Final") ? "#f59e0b" : "#cbd5e1",
              fontWeight: line.includes("Perfect") || line.includes("Total") || line.includes("Final") ? "600" : "normal",
            }}>
              {line}
            </div>
          ))}
        </div>

        {/* Score Formula Info */}
        <div style={{ 
          fontSize: "10px", 
          opacity: 0.6, 
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "12px",
          marginBottom: "16px",
        }}>
          💡 Download (40%) • Upload (20%) • Ping (40%)
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
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
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(59,130,246,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Got it! 👌
          </button>
        </div>
      </div>

      <style>{`
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