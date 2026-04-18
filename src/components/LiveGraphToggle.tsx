// components/LiveGraphToggle.tsx - MOBILE OPTIMIZED
interface LiveGraphToggleProps {
  showLiveGraph: boolean;
  onToggle: () => void;
}

export default function LiveGraphToggle({ showLiveGraph, onToggle }: LiveGraphToggleProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        marginBottom: "12px",
        padding: "clamp(6px, 2vw, 8px) clamp(10px, 3vw, 12px)",
        background: "#f1f5f9",
        borderRadius: "40px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: "clamp(11px, 3vw, 13px)" }}>📈</span>
        <span style={{ fontSize: "clamp(9px, 2.5vw, 11px)", fontWeight: "500", color: "#475569" }}>
          Live Graphs
        </span>
      </div>
      <div
        onClick={onToggle}
        style={{
          width: "clamp(36px, 10vw, 44px)",
          height: "clamp(20px, 5vw, 24px)",
          background: showLiveGraph ? "#10b981" : "#94a3b8",
          borderRadius: "24px",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.3s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: "clamp(16px, 4.5vw, 20px)",
            height: "clamp(16px, 4.5vw, 20px)",
            background: "white",
            borderRadius: "50%",
            position: "absolute",
            top: "clamp(2px, 0.5vw, 2px)",
            left: showLiveGraph ? `calc(100% - clamp(18px, 5vw, 22px))` : "clamp(2px, 0.5vw, 2px)",
            transition: "left 0.3s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
  );
}