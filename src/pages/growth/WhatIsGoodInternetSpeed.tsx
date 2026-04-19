// pages/growth/WhatIsGoodInternetSpeed.tsx
import { Link } from "react-router-dom";

export default function WhatIsGoodInternetSpeed() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.h1}>What is a Good Internet Speed? ⚡</h1>
        <p style={styles.subtitle}>Complete guide to understanding your internet speed needs</p>

        <Link to="/" style={styles.ctaButton}>
          📊 Check My Speed →
        </Link>

        <div style={styles.section}>
          <h2 style={styles.h2}>Speed Requirements by Activity</h2>
          
          <div style={styles.speedTable}>
            <div style={styles.speedRow}>
              <span>📧</span>
              <span>Email & Browsing</span>
              <span>1-5 Mbps</span>
            </div>
            <div style={styles.speedRow}>
              <span>🎵</span>
              <span>Music Streaming</span>
              <span>2-5 Mbps</span>
            </div>
            <div style={styles.speedRow}>
              <span>📺</span>
              <span>SD Video (480p)</span>
              <span>3-5 Mbps</span>
            </div>
            <div style={styles.speedRow}>
              <span>📺</span>
              <span>HD Video (1080p)</span>
              <span>5-10 Mbps</span>
            </div>
            <div style={styles.speedRow}>
              <span>📺</span>
              <span>4K Video (2160p)</span>
              <span>25-50 Mbps</span>
            </div>
            <div style={styles.speedRow}>
              <span>🎮</span>
              <span>Online Gaming</span>
              <span>10-25 Mbps</span>
            </div>
            <div style={styles.speedRow}>
              <span>📹</span>
              <span>Video Calls (Zoom/Meet)</span>
              <span>5-10 Mbps</span>
            </div>
            <div style={styles.speedRow}>
              <span>💾</span>
              <span>Large Downloads</span>
              <span>50+ Mbps</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>Speed Recommendations by Household Size</h2>
          
          <div style={styles.householdGrid}>
            <div style={styles.householdCard}>
              <span>👤</span>
              <strong>1 Person</strong>
              <p>50-100 Mbps</p>
              <small>Casual browsing, streaming</small>
            </div>
            <div style={styles.householdCard}>
              <span>👥</span>
              <strong>2-3 People</strong>
              <p>100-300 Mbps</p>
              <small>Multiple streams, gaming</small>
            </div>
            <div style={styles.householdCard}>
              <span>👨‍👩‍👧‍👦</span>
              <strong>4+ People</strong>
              <p>300-500+ Mbps</p>
              <small>Heavy usage, 4K streaming</small>
            </div>
            <div style={styles.householdCard}>
              <span>🏠</span>
              <strong>Home Office</strong>
              <p>200-500 Mbps</p>
              <small>Video calls, file transfers</small>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>Download vs Upload vs Ping</h2>
          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <span>⬇️</span>
              <strong>Download Speed</strong>
              <p>How fast data comes to you. Important for streaming, browsing, downloads.</p>
            </div>
            <div style={styles.metricCard}>
              <span>⬆️</span>
              <strong>Upload Speed</strong>
              <p>How fast you send data. Important for video calls, cloud backups.</p>
            </div>
            <div style={styles.metricCard}>
              <span>📡</span>
              <strong>Ping (Latency)</strong>
              <p>Response time. Most important for gaming and real-time apps.</p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>How SpeedLab Calculates Your Score</h2>
          <div style={styles.scoreBreakdown}>
            <div>📥 Download Speed: 40% of score</div>
            <div>📤 Upload Speed: 20% of score</div>
            <div>📡 Ping Latency: 40% of score</div>
          </div>
          <p style={{ marginTop: "12px", fontSize: "14px", color: "#64748b" }}>A score of 80+ means your connection is excellent for most activities!</p>
        </div>

        <div style={styles.finalCta}>
          <h2 style={{ ...styles.h2, color: "#fff" }}>Find Out Your Speed Score</h2>
          <Link to="/" style={styles.ctaButtonLarge}>
            📊 Run Speed Test Now
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)", padding: "clamp(20px, 5vw, 40px)" },
  content: { maxWidth: "800px", margin: "0 auto" },
  h1: { fontSize: "clamp(28px, 6vw, 42px)", fontWeight: "bold", color: "#1e293b", marginBottom: "12px", textAlign: "center" },
  subtitle: { fontSize: "18px", color: "#64748b", textAlign: "center", marginBottom: "32px" },
  ctaButton: { display: "block", width: "fit-content", margin: "0 auto 40px", padding: "12px 28px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "#fff", textDecoration: "none", borderRadius: "40px", fontWeight: "600", fontSize: "16px" },
  ctaButtonLarge: { display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", textDecoration: "none", borderRadius: "40px", fontWeight: "600", fontSize: "18px" },
  section: { background: "white", borderRadius: "24px", padding: "28px", marginBottom: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
  h2: { fontSize: "24px", fontWeight: "bold", color: "#1e293b", marginBottom: "20px" },
  speedTable: { display: "flex", flexDirection: "column", gap: "8px" },
  speedRow: { display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #e2e8f0", fontSize: "14px" },
  householdGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" },
  householdCard: { background: "#f1f5f9", padding: "16px", borderRadius: "16px", textAlign: "center" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" },
  metricCard: { background: "#f1f5f9", padding: "16px", borderRadius: "16px", textAlign: "center" },
  scoreBreakdown: { display: "flex", flexDirection: "column", gap: "8px", background: "#eff6ff", padding: "16px", borderRadius: "12px" },
  finalCta: { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "24px", padding: "40px", textAlign: "center" },
};