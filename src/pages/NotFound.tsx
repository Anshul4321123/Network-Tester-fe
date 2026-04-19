// pages/NotFound.tsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        {/* Animated 404 */}
        <div
          style={{
            fontSize: "120px",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: "20px",
            animation: "bounce 1s ease-in-out infinite",
          }}
        >
          404
        </div>

        {/* Icon */}
        <div
          style={{
            fontSize: "80px",
            marginBottom: "20px",
            animation: "spin 4s linear infinite",
          }}
        >
          🔍
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: "12px",
          }}
        >
          Oops! Page Not Found
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: "16px",
            color: "#64748b",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          <br />
          Let's get you back on track!
        </p>

        {/* Suggestions */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "12px" }}>
            💡 You might be looking for:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link to="/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "13px" }}>
              🏠 Home - Run a speed test
            </Link>
            <Link to="/history" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "13px" }}>
              📊 History - View your test results
            </Link>
            <Link to="/info" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "13px" }}>
              ℹ️ Info - About SpeedLab
            </Link>
            <Link to="/why-is-my-internet-slow" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "13px" }}>
              🔧 Why is my internet slow?
            </Link>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/"
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "40px",
              fontWeight: "600",
              fontSize: "14px",
              transition: "transform 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            🏠 Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "12px 24px",
              background: "white",
              color: "#64748b",
              border: "1px solid #cbd5e1",
              borderRadius: "40px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            ← Go Back
          </button>
        </div>

        {/* Fun Fact */}
        <div
          style={{
            marginTop: "40px",
            padding: "12px",
            background: "rgba(59,130,246,0.08)",
            borderRadius: "12px",
            fontSize: "11px",
            color: "#64748b",
          }}
        >
          💡 Fun Fact: The first 404 error was reported in 1993 when the World Wide Web was just 2 years old!
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}