// components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        color: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "24px" }}>🚀</span>
        <h3 style={{ margin: 0, fontWeight: "600" }}>SpeedTest</h3>
      </div>

      <div style={{ display: "flex", gap: "24px" }}>
        <Link
          to="/"
          style={{
            color: location.pathname === "/" ? "#10b981" : "#fff",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "14px",
            padding: "6px 12px",
            borderRadius: "8px",
            transition: "all 0.2s",
            background: location.pathname === "/" ? "rgba(16,185,129,0.2)" : "transparent",
          }}
        >
          🏠 Home
        </Link>

        <Link
          to="/history"
          style={{
            color: location.pathname === "/history" ? "#10b981" : "#fff",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "14px",
            padding: "6px 12px",
            borderRadius: "8px",
            transition: "all 0.2s",
            background: location.pathname === "/history" ? "rgba(16,185,129,0.2)" : "transparent",
          }}
        >
          📊 History
        </Link>
      </div>
    </div>
  );
}