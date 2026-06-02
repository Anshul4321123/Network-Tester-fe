// pages/growth/WhyIsMyInternetSlow.tsx
import { Link } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
export default function WhyIsMyInternetSlow() {
  return (
    <HelmetProvider>
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.h1}>Why Is My Internet So Slow? 🔍</h1>
        <p style={styles.subtitle}>7 common reasons and how to fix them</p>

        {/* CTA Button - Top */}
        <Link to="/" style={styles.ctaButton}>
          🚀 Diagnose My Internet →
        </Link>

        {/* Reasons List */}
        <div style={styles.section}>
          <h2 style={styles.h2}>Common Reasons for Slow Internet</h2>
          
          <div style={styles.reasonCard}>
            <span style={styles.reasonIcon}>📡</span>
            <div>
              <h3 style={styles.h3}>1. Router Placement</h3>
              <p>Your router might be in a bad spot. Walls, furniture, and appliances can block WiFi signals.</p>
              <p style={styles.tip}>💡 Tip: Place your router in a central, elevated location away from obstacles.</p>
            </div>
          </div>

          <div style={styles.reasonCard}>
            <span style={styles.reasonIcon}>📶</span>
            <div>
              <h3 style={styles.h3}>2. Too Many Devices Connected</h3>
              <p>Every device on your network uses bandwidth. Streaming, gaming, and downloads all compete.</p>
              <p style={styles.tip}>💡 Tip: Disconnect devices you're not using or upgrade your plan.</p>
            </div>
          </div>

          <div style={styles.reasonCard}>
            <span style={styles.reasonIcon}>🕐</span>
            <div>
              <h3 style={styles.h3}>3. Peak Hours</h3>
              <p>Evenings and weekends are peak usage times when many people are online simultaneously.</p>
              <p style={styles.tip}>💡 Tip: Test your speed at different times of day to compare.</p>
            </div>
          </div>

          <div style={styles.reasonCard}>
            <span style={styles.reasonIcon}>📺</span>
            <div>
              <h3 style={styles.h3}>4. Background Apps & Updates</h3>
              <p>Windows updates, cloud backups, and app downloads run silently in the background.</p>
              <p style={styles.tip}>💡 Tip: Check Task Manager (Windows) or Activity Monitor (Mac) for bandwidth usage.</p>
            </div>
          </div>

          <div style={styles.reasonCard}>
            <span style={styles.reasonIcon}>🔌</span>
            <div>
              <h3 style={styles.h3}>5. Old Router or Modem</h3>
              <p>Routers older than 3-5 years may not support modern speeds or standards.</p>
              <p style={styles.tip}>💡 Tip: Consider upgrading to a WiFi 6 router for better performance.</p>
            </div>
          </div>

          <div style={styles.reasonCard}>
            <span style={styles.reasonIcon}>🏢</span>
            <div>
              <h3 style={styles.h3}>6. ISP Throttling</h3>
              <p>Some ISPs slow down certain types of traffic like streaming or gaming.</p>
              <p style={styles.tip}>💡 Tip: A VPN can help bypass throttling in some cases.</p>
            </div>
          </div>

          <div style={styles.reasonCard}>
            <span style={styles.reasonIcon}>🌍</span>
            <div>
              <h3 style={styles.h3}>7. Server Distance</h3>
              <p>Connecting to servers far away increases latency and reduces speed.</p>
              <p style={styles.tip}>💡 Tip: Use SpeedLab's server selector to pick the closest server.</p>
            </div>
          </div>
        </div>

        {/* Quick Fixes */}
        <div style={styles.section}>
          <h2 style={styles.h2}>Quick Fixes to Try Now</h2>
          <div style={styles.fixGrid}>
            <div style={styles.fixCard}>
              <span>🔄</span>
              <span>Restart Router</span>
            </div>
            <div style={styles.fixCard}>
              <span>🔌</span>
              <span>Check Cables</span>
            </div>
            <div style={styles.fixCard}>
              <span>📱</span>
              <span>Reduce Devices</span>
            </div>
            <div style={styles.fixCard}>
              <span>📍</span>
              <span>Move Closer</span>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div style={styles.finalCta}>
          <h2 style={{ ...styles.h2, color: "#fff" }}>Still having issues?</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "20px" }}>Run a free speed test to diagnose your connection</p>
          <Link to="/" style={styles.ctaButtonLarge}>
            📊 Run Speed Test Now
          </Link>
        </div>
      </div>
    </div>
    </HelmetProvider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)",
    padding: "clamp(20px, 5vw, 40px)",
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  h1: {
    fontSize: "clamp(28px, 6vw, 42px)",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "12px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "18px",
    color: "#64748b",
    textAlign: "center",
    marginBottom: "32px",
  },
  ctaButton: {
    display: "block",
    width: "fit-content",
    margin: "0 auto 40px",
    padding: "12px 28px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "40px",
    fontWeight: "600",
    fontSize: "16px",
    textAlign: "center",
  },
  ctaButtonLarge: {
    display: "inline-block",
    padding: "14px 32px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "40px",
    fontWeight: "600",
    fontSize: "18px",
    textAlign: "center",
  },
  section: {
    background: "white",
    borderRadius: "24px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  h2: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "20px",
  },
  reasonCard: {
    display: "flex",
    gap: "16px",
    padding: "16px",
    borderBottom: "1px solid #e2e8f0",
  },
  reasonIcon: {
    fontSize: "32px",
  },
  h3: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "8px",
  },
  tip: {
    fontSize: "13px",
    color: "#3b82f6",
    marginTop: "8px",
    background: "#eff6ff",
    padding: "6px 12px",
    borderRadius: "8px",
  },
  fixGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
  },
  fixCard: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    background: "#f1f5f9",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e293b",
  },
  finalCta: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: "24px",
    padding: "40px",
    textAlign: "center",
  },
};