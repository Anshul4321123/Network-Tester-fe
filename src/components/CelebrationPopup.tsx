// components/CelebrationPopup.tsx
import { useEffect, useState } from "react";

interface RecordBreak {
  type: "download" | "upload" | "ping" | "score";
  oldValue: number;
  newValue: number;
}

interface CelebrationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  records: RecordBreak[];
  isFirstTime?: boolean;
  firstTimeType?: "ping" | "jitter" | "download" | "upload" | "score";
}

export default function CelebrationPopup({ isOpen, onClose, records, isFirstTime = false, firstTimeType }: CelebrationPopupProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Create confetti effect
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

  if (!isOpen) return null;

  const formatValue = (value: number, type: string) => {
    if (type === "ping") return `${value.toFixed(1)} ms`;
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const getRecordConfig = (type: string) => {
    switch (type) {
      case "download":
        return { icon: "⬇️", color: "#3b82f6", label: "Download", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" };
      case "upload":
        return { icon: "⬆️", color: "#f59e0b", label: "Upload", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" };
      case "ping":
        return { icon: "📡", color: "#10b981", label: "Ping", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" };
      case "score":
        return { icon: "⭐", color: "#fbbf24", label: "Score", gradient: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" };
      default:
        return { icon: "🏆", color: "#fbbf24", label: "Record", gradient: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" };
    }
  };

  const getAchievementName = (type: string) => {
    switch (type) {
      case "ping": return "Speed of Light";
      case "jitter": return "Stability Master";
      case "download": return "First Blood • Download";
      case "upload": return "Upload Pioneer";
      case "score": return "Getting Started";
      default: return "Achievement Unlocked";
    }
  };

  const isMultipleRecords = records.length > 1;
  const mainRecord = records[0];

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
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.3s ease",
      }}
      onClick={onClose}
    >
      {/* Confetti particles */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: "absolute",
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: "8px",
            height: "8px",
            background: `hsl(${Math.random() * 360}, 100%, 50%)`,
            borderRadius: "2px",
            animation: `confettiFall ${1 + Math.random() * 2}s ease-out forwards`,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "40px",
          maxWidth: "480px",
          width: "90%",
          padding: "36px 28px",
          textAlign: "center",
          animation: "slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
          border: isFirstTime ? "2px solid #fbbf24" : "2px solid rgba(255,215,0,0.3)",
          position: "relative",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sparkle effect background */}
        <div
          style={{
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background: "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
            animation: "rotate 10s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Achievement Badge for first time */}
        {isFirstTime && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "4px 12px",
              borderRadius: "20px",
              animation: "pulse 1s infinite",
            }}
          >
            ACHIEVEMENT UNLOCKED
          </div>
        )}

        {/* Animated icon */}
        <div
          style={{
            fontSize: "72px",
            animation: "bounce 0.6s ease infinite",
            marginBottom: "16px",
          }}
        >
          {isMultipleRecords ? "🏆🎉🏆" : isFirstTime ? "🎯" : getRecordConfig(mainRecord.type).icon}
        </div>

        {/* Title */}
        <div
          style={{
            background: isMultipleRecords 
              ? "linear-gradient(135deg, #fbbf24 0%, #ef4444 50%, #3b82f6 100%)"
              : isFirstTime
              ? "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)"
              : getRecordConfig(mainRecord.type).gradient,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontSize: "clamp(22px, 5vw, 28px)",
            fontWeight: "bold",
            marginBottom: "12px",
          }}
        >
          {isMultipleRecords 
            ? "🎉 MULTIPLE RECORDS BROKEN! 🎉" 
            : isFirstTime 
            ? `🎉 FIRST ${mainRecord?.type?.toUpperCase() || "TEST"}! 🎉`
            : `🏆 NEW ${getRecordConfig(mainRecord.type).label.toUpperCase()} RECORD! 🏆`}
        </div>

        {/* Achievement name for first time */}
        {isFirstTime && firstTimeType && (
          <div
            style={{
              fontSize: "12px",
              color: "#fbbf24",
              fontWeight: "600",
              marginBottom: "12px",
              letterSpacing: "1px",
            }}
          >
            {getAchievementName(firstTimeType)}
          </div>
        )}

        {/* Message */}
        <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px", lineHeight: "1.5" }}>
          {isMultipleRecords 
            ? `Amazing performance! You've broken ${records.length} records in a single test!`
            : isFirstTime
            ? `Great start! Your first ${mainRecord?.type} test is complete.`
            : `You've smashed your ${getRecordConfig(mainRecord.type).label.toLowerCase()} record!`}
        </div>

        {/* Multiple Records Display */}
        {isMultipleRecords && (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px",
              background: "#f1f5f9",
              borderRadius: "24px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "12px" }}>
              Records Broken:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {records.map((record, idx) => {
                const config = getRecordConfig(record.type);
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "white",
                      borderRadius: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "20px" }}>{config.icon}</span>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>{config.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", textDecoration: "line-through" }}>
                        {formatValue(record.oldValue, record.type)}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: config.color }}>→</span>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: config.color }}>
                        {formatValue(record.newValue, record.type)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Single Record Display */}
        {!isMultipleRecords && !isFirstTime && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "24px",
              padding: "16px",
              background: "#f1f5f9",
              borderRadius: "24px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>Previous Best</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#64748b", textDecoration: "line-through" }}>
                {formatValue(mainRecord.oldValue, mainRecord.type)}
              </div>
            </div>
            <div style={{ fontSize: "24px", color: "#fbbf24" }}>→</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>New Record!</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: getRecordConfig(mainRecord.type).color }}>
                {formatValue(mainRecord.newValue, mainRecord.type)}
              </div>
            </div>
          </div>
        )}

        {/* First time special display */}
        {isFirstTime && !isMultipleRecords && (
          <div
            style={{
              marginBottom: "24px",
              padding: "12px",
              background: "rgba(251,191,36,0.1)",
              borderRadius: "20px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#d97706" }}>
              🎯 Achievement Progress
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
              Complete all tests to unlock more achievements!
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            padding: "12px 28px",
            background: isMultipleRecords 
              ? "linear-gradient(135deg, #fbbf24 0%, #ef4444 50%, #3b82f6 100%)"
              : isFirstTime
              ? "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)"
              : getRecordConfig(mainRecord.type).gradient,
            color: "#fff",
            border: "none",
            borderRadius: "40px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "600",
            transition: "all 0.2s",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {isMultipleRecords ? "Incredible! 🎉" : isFirstTime ? "Let's Go! 🎮" : "Awesome! 🎉"}
        </button>

        {/* Tip for user */}
        <div
          style={{
            marginTop: "12px",
            fontSize: "10px",
            color: "#94a3b8",
          }}
        >
          {isMultipleRecords 
            ? "💡 You're on fire! Keep testing to set even higher records!"
            : isFirstTime 
            ? "💡 Tip: Run more tests to improve your scores and unlock achievements!"
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
            transform: translateY(60px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
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
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}