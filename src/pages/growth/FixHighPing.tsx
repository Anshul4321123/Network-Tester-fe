// pages/growth/FixHighPing.tsx
import { Link } from "react-router-dom";

export default function FixHighPing() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.h1}>How to Fix High Ping 🎯</h1>
        <p style={styles.subtitle}>Reduce lag and improve your gaming experience</p>

        <Link to="/" style={styles.ctaButton}>
          🔍 Test My Ping →
        </Link>

        {/* What is Ping */}
        <div style={styles.section}>
          <h2 style={styles.h2}>What is Ping?</h2>
          <p>Ping is the time it takes for data to travel from your device to a server and back. It's measured in milliseconds (ms).</p>
          <div style={styles.pingScale}>
            <div style={{ ...styles.pingBadge, background: "#10b981" }}>🟢 Excellent: &lt;30ms</div>
            <div style={{ ...styles.pingBadge, background: "#f59e0b" }}>🟡 Good: 30-80ms</div>
            <div style={{ ...styles.pingBadge, background: "#ef4444" }}>🔴 Poor: &gt;80ms</div>
          </div>
        </div>

        {/* Why High Ping */}
        <div style={styles.section}>
          <h2 style={styles.h2}>Why Is Your Ping High?</h2>
          
          <div style={styles.causeCard}>
            <span>🌍</span>
            <div>
              <strong>Server Distance</strong>
              <p>Playing on servers far away increases ping significantly.</p>
            </div>
          </div>
          
          <div style={styles.causeCard}>
            <span>📶</span>
            <div>
              <strong>WiFi Interference</strong>
              <p>Walls, other devices, and network congestion affect latency.</p>
            </div>
          </div>
          
          <div style={styles.causeCard}>
            <span>📥</span>
            <div>
              <strong>Bandwidth Saturation</strong>
              <p>Downloads, streams, or multiple devices using the network.</p>
            </div>
          </div>
          
          <div style={styles.causeCard}>
            <span>🏢</span>
            <div>
              <strong>ISP Routing</strong>
              <p>Your ISP's network path to the server may be inefficient.</p>
            </div>
          </div>
        </div>

        {/* Fixes */}
        <div style={styles.section}>
          <h2 style={styles.h2}>8 Ways to Fix High Ping</h2>
          
          <div style={styles.fixItem}>
            <span style={styles.fixNumber}>1</span>
            <div>
              <strong>Use Ethernet Instead of WiFi</strong>
              <p>Wired connections are more stable and have lower latency.</p>
            </div>
          </div>
          
          <div style={styles.fixItem}>
            <span style={styles.fixNumber}>2</span>
            <div>
              <strong>Close Background Apps</strong>
              <p>Stop downloads, streams, and cloud backups while gaming.</p>
            </div>
          </div>
          
          <div style={styles.fixItem}>
            <span style={styles.fixNumber}>3</span>
            <div>
              <strong>Choose Closer Servers</strong>
              <p>Select game servers geographically closer to you.</p>
            </div>
          </div>
          
          <div style={styles.fixItem}>
            <span style={styles.fixNumber}>4</span>
            <div>
              <strong>Restart Your Router</strong>
              <p>A simple reboot can clear temporary issues.</p>
            </div>
          </div>
          
          <div style={styles.fixItem}>
            <span style={styles.fixNumber}>5</span>
            <div>
              <strong>Use a Gaming VPN</strong>
              <p>Some VPNs optimize routing for better ping (ExitLag, WTFast).</p>
            </div>
          </div>
          
          <div style={styles.fixItem}>
            <span style={styles.fixNumber}>6</span>
            <div>
              <strong>Update Network Drivers</strong>
              <p>Outdated drivers can cause latency issues.</p>
            </div>
          </div>
          
          <div style={styles.fixItem}>
            <span style={styles.fixNumber}>7</span>
            <div>
              <strong>Change DNS Server</strong>
              <p>Google DNS (8.8.8.8) or Cloudflare (1.1.1.1) can be faster.</p>
            </div>
          </div>
          
          <div style={styles.fixItem}>
            <span style={styles.fixNumber}>8</span>
            <div>
              <strong>Upgrade Your Internet Plan</strong>
              <p>Higher speeds and better routing may help.</p>
            </div>
          </div>
        </div>

        {/* Ping Scanner Promotion */}
        <div style={styles.promoCard}>
          <span style={{ fontSize: "48px" }}>📡</span>
          <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Find Your Best Signal Spot</h3>
          <p style={{ marginBottom: "16px" }}>Walk around with our real-time ping scanner to find the optimal spot in your home.</p>
          <Link to="/" style={styles.promoButton}>
            🔍 Try Live Ping Scanner
          </Link>
        </div>

        {/* Final CTA */}
        <div style={styles.finalCta}>
          <h2 style={{ ...styles.h2, color: "#fff" }}>Test Your Current Ping</h2>
          <Link to="/" style={styles.ctaButtonLarge}>
            📊 Run Speed Test
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)",
    padding: "clamp(20px, 5vw, 40px)",
  },
  content: { maxWidth: "800px", margin: "0 auto" },
  h1: { fontSize: "clamp(28px, 6vw, 42px)", fontWeight: "bold", color: "#1e293b", marginBottom: "12px", textAlign: "center" },
  subtitle: { fontSize: "18px", color: "#64748b", textAlign: "center", marginBottom: "32px" },
  ctaButton: { display: "block", width: "fit-content", margin: "0 auto 40px", padding: "12px 28px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "#fff", textDecoration: "none", borderRadius: "40px", fontWeight: "600", fontSize: "16px" },
  ctaButtonLarge: { display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", textDecoration: "none", borderRadius: "40px", fontWeight: "600", fontSize: "18px" },
  section: { background: "white", borderRadius: "24px", padding: "28px", marginBottom: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
  h2: { fontSize: "24px", fontWeight: "bold", color: "#1e293b", marginBottom: "20px" },
  pingScale: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" },
  pingBadge: { padding: "8px 16px", borderRadius: "40px", color: "#fff", fontWeight: "600", fontSize: "14px" },
  causeCard: { display: "flex", gap: "12px", padding: "12px", borderBottom: "1px solid #e2e8f0" },
  fixItem: { display: "flex", gap: "16px", padding: "12px", borderBottom: "1px solid #f1f5f9" },
  fixNumber: { width: "28px", height: "28px", background: "#3b82f6", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", flexShrink: 0 },
  promoCard: { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "24px", padding: "32px", textAlign: "center", color: "#fff", marginBottom: "24px" },
  promoButton: { display: "inline-block", padding: "10px 24px", background: "#3b82f6", color: "#fff", textDecoration: "none", borderRadius: "40px", fontWeight: "500" },
  finalCta: { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "24px", padding: "40px", textAlign: "center" },
};