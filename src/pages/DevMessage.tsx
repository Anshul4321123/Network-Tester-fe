// pages/DevMessage.tsx
import { useNavigate } from "react-router-dom";

export default function DevMessage() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <button
        onClick={() => navigate("/info")}
        style={{
          background: "none",
          border: "none",
          fontSize: "24px",
          cursor: "pointer",
          marginBottom: "20px",
          color: "#666",
        }}
      >
        ← Back to Info
      </button>

      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "24px",
        padding: "40px",
        color: "white",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "80px", marginBottom: "20px" }}>
          👨‍💻
        </div>
        <h1 style={{ fontSize: "36px", marginBottom: "16px" }}>
          About the Developer
        </h1>
        <p style={{ fontSize: "18px", lineHeight: "1.6", marginBottom: "30px" }}>
          Passionate developer creating open-source tools for the community.
          Building with React, TypeScript, and a lot of ☕.
        </p>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "16px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⚡</div>
            <h3>Speed Test</h3>
            <p style={{ fontSize: "14px", opacity: 0.9 }}>Real-time internet speed testing</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "16px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎮</div>
            <h3>Gaming Mode</h3>
            <p style={{ fontSize: "14px", opacity: 0.9 }}>Optimized for low latency</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "16px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📊</div>
            <h3>Analytics</h3>
            <p style={{ fontSize: "14px", opacity: 0.9 }}>Detailed connection insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}