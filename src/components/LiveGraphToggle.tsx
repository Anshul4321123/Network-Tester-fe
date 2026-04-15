// components/LiveGraphToggle.tsx
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
        gap: "12px",
        marginBottom: "12px",
        padding: "8px 12px",
        background: "#f1f5f9",
        borderRadius: "40px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "13px" }}>📈</span>
        <span style={{ fontSize: "11px", fontWeight: "500", color: "#475569" }}>
          Live Graphs
        </span>
      </div>
      <div
        onClick={onToggle}
        style={{
          width: "44px",
          height: "24px",
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
            width: "20px",
            height: "20px",
            background: "white",
            borderRadius: "50%",
            position: "absolute",
            top: "2px",
            left: showLiveGraph ? "22px" : "2px",
            transition: "left 0.3s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
  );
}