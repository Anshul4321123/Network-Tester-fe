// components/CelebrationPopup.tsx - COMPLETE REWRITE
import { useEffect, useState } from "react";

interface RecordBreak {
  type: string;
  oldValue: number;
  newValue: number;
}

interface CelebrationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  records: RecordBreak[];
  isFirstTime?: boolean;
  firstTimeType?: string;
}

export default function CelebrationPopup({ isOpen, onClose, records, isFirstTime = false, firstTimeType }: CelebrationPopupProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const newConfetti = [];
      for (let i = 0; i < 150; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
        });
      }
      setConfetti(newConfetti);
    }
  }, [isOpen]);

  if (!isOpen || !records || records.length === 0) return null;

  const formatValue = (value: number, type: string) => {
    if (type === "ping") return `${value.toFixed(1)} ms`;
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "download": return "⬇️";
      case "upload": return "⬆️";
      case "ping": return "📡";
      case "score": return "⭐";
      default: return "🏆";
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "download": return "#3b82f6";
      case "upload": return "#f59e0b";
      case "ping": return "#10b981";
      case "score": return "#fbbf24";
      default: return "#fbbf24";
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "download": return "Download Speed";
      case "upload": return "Upload Speed";
      case "ping": return "Ping Latency";
      case "score": return "Score";
      default: return "Record";
    }
  };

  const isRecordBreak = records.some(r => r.oldValue !== r.newValue);
  const showComparison = !isFirstTime && isRecordBreak;
  
  // For first time, show completion checkmarks
  // For record breaks, show improvement arrows

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      {/* Confetti */}
      {confetti.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: "8px",
            height: "8px",
            background: `hsl(${Math.random() * 360}, 100%, 60%)`,
            borderRadius: "2px",
            animation: `confettiFall ${1 + Math.random() * 2}s linear forwards`,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          background: "white",
          borderRadius: "32px",
          maxWidth: "450px",
          width: "90%",
          padding: "32px 24px",
          textAlign: "center",
          animation: "slideUp 0.3s ease",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          border: isFirstTime ? "2px solid #fbbf24" : "2px solid rgba(255,215,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>
          {isFirstTime ? "🎉" : "🏆"}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #fbbf24 0%, #ef4444 50%, #3b82f6 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {isFirstTime 
            ? `🎉 First ${records.length} Test${records.length > 1 ? 's' : ''} Complete! 🎉`
            : `🏆 New ${records.length} Record${records.length > 1 ? 's' : ''}! 🏆`}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>
          {isFirstTime
            ? "Great start! You've completed your first tests."
            : "You've improved your connection performance!"}
        </div>

        {/* Records List */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "20px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          {records.map((record, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: idx < records.length - 1 ? "1px solid #e2e8f0" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>{getIcon(record.type)}</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>{getLabel(record.type)}</span>
              </div>
              
              {isFirstTime ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Completed!</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", textDecoration: "line-through" }}>
                    {formatValue(record.oldValue, record.type)}
                  </span>
                  <span style={{ color: getColor(record.type), fontWeight: "bold" }}>→</span>
                  <span style={{ fontSize: "14px", fontWeight: "bold", color: getColor(record.type) }}>
                    {formatValue(record.newValue, record.type)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "40px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Awesome! 🎉
        </button>

        <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "12px" }}>
          {isFirstTime
            ? "💡 Run more tests to improve your scores!"
            : "💡 Keep testing to break your own records!"}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}