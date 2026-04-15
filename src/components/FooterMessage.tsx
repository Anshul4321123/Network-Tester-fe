// components/FooterMessage.tsx
export default function FooterMessage() {
  return (
    <div
      style={{
        marginTop: "8px",
        marginBottom: "16px",
        padding: "10px 12px",
        background: "rgba(139,92,246,0.08)",
        borderRadius: "10px",
        border: "1px solid rgba(139,92,246,0.15)",
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px" }}>🔬</span>
        <span style={{ fontSize: "11px", fontWeight: "500", color: "#6d28d9" }}>
          Early Access Feature
        </span>
        <span style={{ fontSize: "12px" }}>💡</span>
      </div>
      <p style={{ fontSize: "10px", color: "#4c1d95", margin: 0, opacity: 0.8 }}>
        We're constantly improving accuracy and adding features. 
        Your feedback helps us build a better speed test! 
        <span style={{ display: "block", fontSize: "9px", marginTop: "3px", opacity: 0.7 }}>
          🚀 More servers, advanced analytics, and detailed reports coming soon.
        </span>
      </p>
    </div>
  );
}