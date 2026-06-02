// pages/growth/InternetSpeedForGaming.tsx
import { Link } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
export default function InternetSpeedForGaming() {
  return (
    <HelmetProvider>
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.h1}>Internet Speed for Gaming 🎮</h1>
        <p style={styles.subtitle}>What you need for smooth, lag-free gaming</p>

        <Link to="/" style={styles.ctaButton}>
          🎯 Test My Gaming Speed →
        </Link>

        <div style={styles.section}>
          <h2 style={styles.h2}>Minimum Requirements by Game Type</h2>
          
          <div style={styles.gameGrid}>
            <div style={{ ...styles.gameCard, borderTop: "4px solid #10b981" }}>
              <span style={{ fontSize: "32px" }}>🎮</span>
              <strong>Casual/Mobile Games</strong>
              <p>Download: 5 Mbps<br />Ping: &lt;100ms</p>
            </div>
            <div style={{ ...styles.gameCard, borderTop: "4px solid #f59e0b" }}>
              <span style={{ fontSize: "32px" }}>🔫</span>
              <strong>FPS (Call of Duty, Valorant)</strong>
              <p>Download: 10-25 Mbps<br />Ping: &lt;50ms</p>
            </div>
            <div style={{ ...styles.gameCard, borderTop: "4px solid #8b5cf6" }}>
              <span style={{ fontSize: "32px" }}>🌍</span>
              <strong>MMO (WoW, FFXIV)</strong>
              <p>Download: 10-20 Mbps<br />Ping: &lt;100ms</p>
            </div>
            <div style={{ ...styles.gameCard, borderTop: "4px solid #ef4444" }}>
              <span style={{ fontSize: "32px" }}>🏎️</span>
              <strong>Racing/Fighting</strong>
              <p>Download: 5-10 Mbps<br />Ping: &lt;60ms</p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>Why Ping Matters More Than Speed</h2>
          <p>For gaming, low ping is more important than high download speed. A 10ms ping feels instant; 100ms feels laggy.</p>
          
          <div style={styles.pingGuide}>
            <div style={{ ...styles.pingItem, color: "#10b981" }}>
              <span>🟢</span> &lt;20ms - Professional/Competitive
            </div>
            <div style={{ ...styles.pingItem, color: "#3b82f6" }}>
              <span>🔵</span> 20-50ms - Great for most games
            </div>
            <div style={{ ...styles.pingItem, color: "#f59e0b" }}>
              <span>🟡</span> 50-100ms - Playable but noticeable
            </div>
            <div style={{ ...styles.pingItem, color: "#ef4444" }}>
              <span>🔴</span> &gt;100ms - Laggy, frustrating experience
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>Gaming Mode in SpeedLab</h2>
          <p>SpeedLab has a dedicated Gaming Mode that analyzes your connection specifically for gaming needs.</p>
          <div style={styles.featureList}>
            <div>✅ Ping stability check</div>
            <div>✅ Jitter analysis for smooth gameplay</div>
            <div>✅ Bufferbloat test (lag under load)</div>
            <div>✅ Gaming-specific recommendations</div>
          </div>
        </div>

        <div style={styles.promoCard}>
          <span style={{ fontSize: "48px" }}>🎮</span>
          <h3>Enable Gaming Mode</h3>
          <p>Get tailored advice for your favorite games</p>
          <Link to="/" style={styles.promoButton}>
            🎯 Test in Gaming Mode
          </Link>
        </div>

        <div style={styles.finalCta}>
          <h2 style={{ ...styles.h2, color: "#fff" }}>Is Your Internet Gaming-Ready?</h2>
          <Link to="/" style={styles.ctaButtonLarge}>
            📊 Run Gaming Speed Test
          </Link>
        </div>
      </div>
    </div>
    </HelmetProvider>
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
  gameGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" },
  gameCard: { background: "#f8fafc", padding: "20px", borderRadius: "16px", textAlign: "center", lineHeight: "1.6" },
  pingGuide: { marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" },
  pingItem: { fontSize: "14px", fontWeight: "500" },
  featureList: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginTop: "16px" },
  promoCard: { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "24px", padding: "32px", textAlign: "center", color: "#fff", marginBottom: "24px" },
  promoButton: { display: "inline-block", padding: "10px 24px", background: "#8b5cf6", color: "#fff", textDecoration: "none", borderRadius: "40px", fontWeight: "500" },
  finalCta: { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "24px", padding: "40px", textAlign: "center" },
};