// components/ScoreSection.tsx
interface ScoreSectionProps {
  score: number | null;
  isTestActive: boolean;
  onClick: () => void;
}

const getScoreMessage = (score: number) => {
  if (score > 80) return "Excellent connection 🚀";
  if (score > 50) return "Good connection 👍";
  return "Needs improvement ⚠️";
};

export default function ScoreSection({ score, isTestActive, onClick }: ScoreSectionProps) {
  if (score !== null) {
    return (
      <div 
        style={{ 
          marginBottom: "20px", 
          cursor: "pointer",
          transition: "transform 0.2s",
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <div
          style={{
            fontSize: "clamp(36px, 8vw, 48px)",
            fontWeight: "bold",
            color: score > 80 ? "#10b981" : score > 50 ? "#f59e0b" : "#ef4444",
          }}
        >
          {isTestActive ? "Testing..." : `${score}/100`}
        </div>
        {!isTestActive && (
          <div
            style={{
              fontSize: "clamp(10px, 2.5vw, 12px)",
              opacity: 0.6,
              marginTop: "4px",
              color: "#475569",
            }}
          >
            {getScoreMessage(score)} (click for details)
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          fontSize: "clamp(24px, 6vw, 32px)",
          fontWeight: "bold",
          color: "#64748b",
        }}
      >
        Ready to Test
      </div>
    </div>
  );
}