// components/StartTestButton.tsx
interface Props {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}

export default function StartTestButton({ onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 24px",
        width: "100%",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#94a3b8" : "#10b981",
        color: disabled ? "#cbd5e1" : "#fff",
        border: "none",
        borderRadius: "60px",
        fontWeight: "bold",
        fontSize: "16px",
        transition: "all 0.2s",
      }}
    >
      {disabled ? "🚀 Testing..." : "Start Test"}
    </button>
  );
}