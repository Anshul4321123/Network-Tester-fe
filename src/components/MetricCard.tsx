// components/MetricCard.tsx - MOBILE OPTIMIZED
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
        padding: "clamp(10px, 3vw, 16px)",
        borderRadius: "clamp(12px, 3vw, 16px)",
        textAlign: "center",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: clickable ? "pointer" : description ? "help" : "default",
        position: "relative",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
        if (description && !clickable) setShowTooltip(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
        setShowTooltip(false);
      }}
      onClick={onClick}
      title={!clickable ? description : undefined}
    >
      <div style={{ fontSize: "clamp(18px, 5vw, 24px)", marginBottom: "4px" }}>
        {icon}
      </div>
      <div
        style={{
          fontSize: "clamp(9px, 2.5vw, 11px)",
          color: "#94a3b8",
          marginBottom: "4px",
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </div>
      
      {/* Value or Loader */}
      <div
        style={{
          fontSize: "clamp(14px, 4vw, 20px)",
          fontWeight: "bold",
          color: "#f1f5f9",
          minHeight: "clamp(32px, 8vw, 45px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading ? (
          <div
            style={{
              width: "clamp(20px, 5vw, 28px)",
              height: "clamp(20px, 5vw, 28px)",
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
            fontSize: "8px",
            color: "#94a3b8",
            marginTop: "4px",
            lineHeight: "1.2",
          }}
        >
          {description}
        </div>
      )}
      
      {/* Tooltip for clickable items - responsive width */}
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
            maxWidth: "90vw",
            overflow: "hidden",
            textOverflow: "ellipsis",
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