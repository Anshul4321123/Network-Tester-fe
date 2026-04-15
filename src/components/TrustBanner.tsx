// components/TrustBanner.tsx
export default function TrustBanner() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        borderRadius: "12px",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "11px",
        color: "#92400e",
        border: "1px solid #fbbf24",
      }}
    >
      <span style={{ fontSize: "16px" }}>📍</span>
      <div style={{ flex: 1 }}>
        <strong>ℹ️ Single-Region Test</strong> — Results may vary based on your distance from our test server.
        <span style={{ fontSize: "10px", opacity: 0.8, display: "block", marginTop: "2px" }}>
          For best results, test multiple times at different hours.
        </span>
      </div>
    </div>
  );
}