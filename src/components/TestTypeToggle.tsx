// components/TestTypeToggle.tsx
interface TestTypeToggleProps {
  testType: "quick" | "full";
  onChange: (type: "quick" | "full") => void;
}

export default function TestTypeToggle({ testType, onChange }: TestTypeToggleProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
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
          padding: "8px 12px",
          background: testType === "quick" ? "#10b981" : "transparent",
          color: testType === "quick" ? "#fff" : "#64748b",
          border: "none",
          borderRadius: "36px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          transition: "all 0.2s",
        }}
      >
        ⚡ Quick Test (5 sec)
      </button>
      <button
        onClick={() => onChange("full")}
        style={{
          flex: 1,
          padding: "8px 12px",
          background: testType === "full" ? "#8b5cf6" : "transparent",
          color: testType === "full" ? "#fff" : "#64748b",
          border: "none",
          borderRadius: "36px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          transition: "all 0.2s",
        }}
      >
        🔬 Full Test (Detailed)
      </button>
    </div>
  );
}