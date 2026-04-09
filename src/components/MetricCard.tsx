// components/MetricCard.tsx
import { useState } from "react";

interface MetricCardProps {
  label: string;
  value?: string;
  icon: string;
  isLoading?: boolean;
  description?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export default function MetricCard({ 
  label, 
  value, 
  icon, 
  isLoading = false, 
  description, 
  onClick,
  clickable = false 
}: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        padding: "clamp(12px, 3vw, 16px)",
        borderRadius: "16px",
        textAlign: "center",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: clickable ? "pointer" : description ? "help" : "default",
        position: "relative",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
        if (description && !clickable) setShowTooltip(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        setShowTooltip(false);
      }}
      onClick={onClick}
      title={!clickable ? description : undefined}
    >
      <div style={{ fontSize: "clamp(20px, 5vw, 24px)", marginBottom: "6px" }}>
        {icon}
      </div>
      <div
        style={{
          fontSize: "clamp(10px, 2.5vw, 11px)",
          color: "#94a3b8",
          marginBottom: "6px",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
      
      {/* Value or Loader */}
      <div
        style={{
          fontSize: "clamp(16px, 4vw, 20px)",
          fontWeight: "bold",
          color: "#f1f5f9",
          minHeight: "45px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading ? (
          <div
            style={{
              width: "28px",
              height: "28px",
              border: "2px solid #475569",
              borderTopColor: "#10b981",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        ) : (
          value || "--"
        )}
      </div>
      
      {description && !isLoading && !clickable && (
        <div
          style={{
            fontSize: "9px",
            color: "#94a3b8",
            marginTop: "6px",
            lineHeight: "1.3",
          }}
        >
          {description}
        </div>
      )}
      
      {/* Tooltip for clickable items */}
      {showTooltip && clickable && description && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "8px",
            background: "#0f172a",
            color: "#f1f5f9",
            fontSize: "10px",
            padding: "6px 10px",
            borderRadius: "8px",
            whiteSpace: "nowrap",
            zIndex: 100,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            pointerEvents: "none",
          }}
        >
          {description}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "5px",
              borderStyle: "solid",
              borderColor: "#0f172a transparent transparent transparent",
            }}
          />
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}