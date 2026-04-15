// components/ShareButton.tsx
interface ShareButtonProps {
  onClick: () => void;
}

export default function ShareButton({ onClick }: ShareButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 20px",
        background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        border: "none",
        borderRadius: "40px",
        color: "#fff",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: "100%",
        transition: "all 0.2s",
        boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
    >
      <span>📤</span> Share Your Result
    </button>
  );
}