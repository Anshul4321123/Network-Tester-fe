// components/SmartInsight.tsx
import { generateSmartInsight, type TestMetrics } from "../utils/smartInsightEngine";

interface SmartInsightProps {
  metrics: TestMetrics;
}

export default function SmartInsight({ metrics }: SmartInsightProps) {
  const insight = generateSmartInsight(metrics);

  const getBgColor = () => {
    switch (insight.type) {
      case "success": return "linear-gradient(135deg, #10b98115 0%, #05966908 100%)";
      case "warning": return "linear-gradient(135deg, #f59e0b15 0%, #d9770608 100%)";
      case "error": return "linear-gradient(135deg, #ef444415 0%, #dc262608 100%)";
      default: return "linear-gradient(135deg, #8b5cf615 0%, #7c3aed08 100%)";
    }
  };

  const getBorderColor = () => {
    switch (insight.type) {
      case "success": return "#10b981";
      case "warning": return "#f59e0b";
      case "error": return "#ef4444";
      default: return "#8b5cf6";
    }
  };

  return (
    <div
      style={{
        background: getBgColor(),
        borderRadius: "16px",
        padding: "14px 16px",
        borderLeft: `3px solid ${getBorderColor()}`,
        marginBottom: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span style={{ fontSize: "24px" }}>{insight.icon}</span>
        <div style={{ flex: 1 }}>
          {/* Main message */}
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "4px" }}>
            {insight.message}
          </div>
          
          {/* Detail (if exists) */}
          {insight.detail && (
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
              {insight.detail}
            </div>
          )}
          
          {/* Action (if exists) */}
          {insight.action && (
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
              💡 {insight.action}
            </div>
          )}
          
          {/* Percentile (if exists and not default) */}
          {insight.percentile && insight.percentile !== 50 && (
            <div style={{ 
              fontSize: "10px", 
              color: "#8b5cf6", 
              marginTop: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span>📊</span>
              <span>Faster than {insight.percentile}% of users</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}