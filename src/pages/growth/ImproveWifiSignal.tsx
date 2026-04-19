// pages/growth/ImproveWifiSignal.tsx
import { Link } from "react-router-dom";

export default function ImproveWifiSignal() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.h1}>How to Improve WiFi Signal 📶</h1>
        <p style={styles.subtitle}>Boost your wireless signal strength and coverage</p>

        <Link to="/" style={styles.ctaButton}>
          📡 Find Best Signal →
        </Link>

        <div style={styles.section}>
          <h2 style={styles.h2}>1. Router Placement is Everything</h2>
          <div style={styles.placementGrid}>
            <div style={styles.placementCard}>
              <span>⬆️</span>
              <strong>Elevate Your Router</strong>
              <p>Place it on a shelf or mount high on wall</p>
            </div>
            <div style={styles.placementCard}>
              <span>📍</span>
              <strong>Central Location</strong>
              <p>Put router in the middle of your home</p>
            </div>
            <div style={styles.placementCard}>
              <span>🚫</span>
              <strong>Away from Obstacles</strong>
              <p>Avoid walls, metal, and appliances</p>
            </div>
            <div style={styles.placementCard}>
              <span>📡</span>
              <strong>Position Antennas</strong>
              <p>Point antennas vertically for horizontal coverage</p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>2. Reduce Interference</h2>
          <ul style={styles.list}>
            <li>📺 Keep router away from TVs, microwaves, and cordless phones</li>
            <li>🪞 Avoid mirrors and fish tanks (water blocks signals)</li>
            <li>🔧 Switch to 5GHz band for less interference (but shorter range)</li>
            <li>📱 Limit connected devices - each one adds noise</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>3. Optimize Router Settings</h2>
          <ul style={styles.list}>
            <li>🔄 Change WiFi channel to less congested one</li>
            <li>📶 Enable QoS (Quality of Service) for gaming/streaming</li>
            <li>🔒 Update router firmware regularly</li>
            <li>⚡ Disable older WiFi standards (802.11b/g) if possible</li>
          </ul>
        </div>

        {/* Ping Scanner Promotion */}
        <div style={styles.promoCard}>
          <span style={{ fontSize: "48px" }}>📍</span>
          <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Find Your WiFi Sweet Spot</h3>
          <p style={{ marginBottom: "16px" }}>Use our real-time ping scanner to find where in your home the signal is strongest.</p>
          <Link to="/" style={styles.promoButton}>
            🔍 Launch Ping Scanner
          </Link>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>4. Hardware Upgrades</h2>
          <div style={styles.upgradeGrid}>
            <div style={styles.upgradeCard}>
              <span>🆕</span>
              <strong>WiFi 6 Router</strong>
              <p>Faster speeds, better range, more devices</p>
            </div>
            <div style={styles.upgradeCard}>
              <span>🔁</span>
              <strong>WiFi Extender</strong>
              <p>Extend coverage to dead zones</p>
            </div>
            <div style={styles.upgradeCard}>
              <span>🌐</span>
              <strong>Mesh System</strong>
              <p>Whole-home coverage with seamless roaming</p>
            </div>
            <div style={styles.upgradeCard}>
              <span>🔌</span>
              <strong>Powerline Adapter</strong>
              <p>Use electrical wiring for stable connection</p>
            </div>
          </div>
        </div>

        <div style={styles.finalCta}>
          <h2 style={{ ...styles.h2, color: "#fff" }}>Test Your WiFi Signal Strength</h2>
          <Link to="/" style={styles.ctaButtonLarge}>
            📊 Run Speed Test
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
  list: { marginLeft: "20px", lineHeight: "1.8", color: "#475569" },
  placementGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" },
  placementCard: { background: "#f1f5f9", padding: "16px", borderRadius: "16px", textAlign: "center" },
  upgradeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" },
  upgradeCard: { background: "#f1f5f9", padding: "16px", borderRadius: "16px", textAlign: "center" },
  promoCard: { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "24px", padding: "32px", textAlign: "center", color: "#fff", marginBottom: "24px" },
  promoButton: { display: "inline-block", padding: "10px 24px", background: "#3b82f6", color: "#fff", textDecoration: "none", borderRadius: "40px", fontWeight: "500" },
  finalCta: { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "24px", padding: "40px", textAlign: "center" },
};