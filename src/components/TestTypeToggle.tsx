// components/TestTypeToggle.tsx - MOBILE OPTIMIZED
interface TestTypeToggleProps {
  testType: "quick" | "full";
  onChange: (type: "quick" | "full") => void;
}

export default function TestTypeToggle({ testType, onChange }: TestTypeToggleProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
        background: "#f1f5f9",
        borderRadius: "40px",
        padding: "4px",
      }}
    >
      <button
        onClick={() => onChange("quick")}
        style={{
          flex: 1,
          padding: "clamp(6px, 2vw, 8px) clamp(8px, 3vw, 12px)",
          background: testType === "quick" ? "#10b981" : "transparent",
          color: testType === "quick" ? "#fff" : "#64748b",
          border: "none",
          borderRadius: "36px",
          cursor: "pointer",
          fontSize: "clamp(11px, 3vw, 13px)",
          fontWeight: "600",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        ⚡ Quick
      </button>
      <button
        onClick={() => onChange("full")}
        style={{
          flex: 1,
          padding: "clamp(6px, 2vw, 8px) clamp(8px, 3vw, 12px)",
          background: testType === "full" ? "#8b5cf6" : "transparent",
          color: testType === "full" ? "#fff" : "#64748b",
          border: "none",
          borderRadius: "36px",
          cursor: "pointer",
          fontSize: "clamp(11px, 3vw, 13px)",
          fontWeight: "600",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        🔬 Full
      </button>
    </div>
  );
}