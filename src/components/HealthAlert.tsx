// components/HealthAlert.tsx
import type { TimePattern } from "../utils/smartInsightEngine";

interface HealthAlertProps {
  pattern: TimePattern | null;
}

export default function HealthAlert({ pattern }: HealthAlertProps) {
  // Don't render if no pattern or missing data
  if (!pattern || !pattern.message) {
    return null;
  }

  // Get user-friendly message without scary numbers
  const getSimpleMessage = () => {
    if (pattern.dropPercent >= 70) {
      return "🔔 Your internet slows down significantly during peak hours";
    }
    if (pattern.dropPercent >= 40) {
      return `🔔 Your internet is slower around ${pattern.message.split('around')[1]?.trim() || 'certain times'}`;
    }
    return "🔔 We've noticed your connection varies at different times of day";
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        borderRadius: "14px",
        padding: "12px 16px",
        border: "1px solid #fbbf24",
        marginBottom: "12px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.01)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "20px" }}>🔔</span>
        <div style={{ flex: 1 }}>
          {/* Simple, non-scary message */}
          <div style={{ fontSize: "13px", fontWeight: "bold", color: "#92400e" }}>
            {getSimpleMessage()}
          </div>
          
          {/* Helpful context without being technical */}
          <div style={{ fontSize: "11px", color: "#78350f", marginTop: "4px" }}>
            💡 Try testing at different times for the best results
          </div>
        </div>
        <span style={{ fontSize: "14px" }}>📊</span>
      </div>
    </div>
  );
}