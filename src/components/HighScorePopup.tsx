// components/HighScorePopup.tsx
import { useEffect, useState } from "react";

interface HighScorePopupProps {
  isOpen: boolean;
  onClose: () => void;
  records: { type: string; oldValue: number; newValue: number }[];
}

export default function HighScorePopup({ isOpen, onClose, records }: HighScorePopupProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      console.log("HighScorePopup OPEN with records:", records);
      const newConfetti = [];
      for (let i = 0; i < 200; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: `hsl(${Math.random() * 360}, 100%, 60%)`,
        });
      }
      setConfetti(newConfetti);
    }
  }, [isOpen]);

  if (!isOpen || !records || records.length === 0) {
    console.log("HighScorePopup not showing - no records");
    return null;
  }

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

  const getLabel = (type: string) => {
    switch (type) {
      case "download": return "Download Speed";
      case "upload": return "Upload Speed";
      case "ping": return "Ping Latency";
      case "score": return "Overall Score";
      default: return "Record";
    }
  };

  const getImprovementText = (type: string, oldValue: number, newValue: number) => {
    if (type === "ping") {
      const improvement = oldValue - newValue;
      const percent = ((oldValue - newValue) / oldValue) * 100;
      return `${improvement.toFixed(1)} ms lower (${percent.toFixed(1)}% better)`;
    }
    const improvement = newValue - oldValue;
    const percent = ((newValue - oldValue) / oldValue) * 100;
    if (type === "score") {
      return `${improvement.toFixed(0)} points higher (${percent.toFixed(1)}% better)`;
    }
    return `${improvement.toFixed(1)} Mbps faster (${percent.toFixed(1)}% better)`;
  };

  const getCelebrationMessage = () => {
    if (records.length === 1) {
      const record = records[0];
      if (record.type === "score") return "You've achieved your highest score ever! 🎯";
      if (record.type === "ping") return "Your lowest ping ever! Amazing connection! ⚡";
      if (record.type === "download") return "Lightning fast! New download record! 🚀";
      if (record.type === "upload") return "Upload speed champion! New record! 📤";
    }
    return `You broke ${records.length} personal records! Incredible performance! 🎉`;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.3s ease",
      }}
      onClick={onClose}
    >
      {confetti.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: "8px",
            height: "8px",
            background: p.color,
            borderRadius: "2px",
            animation: `confettiFall ${1 + Math.random() * 2}s linear forwards`,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: "48px",
          maxWidth: "480px",
          width: "90%",
          padding: "40px 28px",
          textAlign: "center",
          animation: "slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          border: "2px solid #fbbf24",
          position: "relative",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
            animation: "rotate 8s linear infinite",
            pointerEvents: "none",
          }}
        />

        <div style={{ fontSize: "80px", marginBottom: "8px", animation: "bounce 0.6s ease infinite" }}>
          🏆
        </div>

        <div
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #fbbf24 0%, #ef4444 50%, #fbbf24 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          NEW HIGH SCORE!
        </div>

        <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "24px" }}>
          {getCelebrationMessage()}
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "24px",
            padding: "20px",
            marginBottom: "28px",
          }}
        >
          {records.map((record, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: idx < records.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(251,191,36,0.2)",
                    borderRadius: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  {getIcon(record.type)}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: "bold", color: "#f1f5f9" }}>{getLabel(record.type)}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Previous: {formatValue(record.oldValue, record.type)}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#fbbf24" }}>
                  {formatValue(record.newValue, record.type)}
                </div>
                <div style={{ fontSize: "10px", color: "#10b981" }}>
                  ↑ {getImprovementText(record.type, record.oldValue, record.newValue)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
            color: "#1e293b",
            border: "none",
            borderRadius: "40px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Amazing! 🎉
        </button>

        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "16px" }}>
          🏆 This is your new personal best!
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
            transform: translateY(60px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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