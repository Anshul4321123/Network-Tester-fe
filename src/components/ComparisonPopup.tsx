// components/ComparisonPopup.tsx
import { useEffect, useState } from "react";

interface ComparisonPopupProps {
  isOpen: boolean;
  onClose: () => void;
  improvements: { type: string; oldValue: number; newValue: number; improved: boolean }[];
}

export default function ComparisonPopup({ isOpen, onClose, improvements }: ComparisonPopupProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const newConfetti = [];
      for (let i = 0; i < 100; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: Math.random() > 0.5 ? "#10b981" : "#3b82f6",
        });
      }
      setConfetti(newConfetti);
    }
  }, [isOpen]);

  if (!isOpen || !improvements || improvements.length === 0) return null;

  const formatValue = (value: number, type: string) => {
    if (type === "ping") return `${value.toFixed(1)} ms`;
    if (value > 1000) return `${(value / 1000).toFixed(2)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const getRawValue = (value: number, type: string) => {
    if (type === "ping") return `${value.toFixed(1)} ms`;
    return `${value.toFixed(1)} Mbps`;
  };

  const getDifference = (oldValue: number, newValue: number, type: string) => {
    if (oldValue === newValue) {
      return { 
        text: "✨ Exactly the same! ✨", 
        color: "#8b5cf6", 
        icon: "✨", 
        percent: 0,
        description: "Your connection is perfectly consistent!"
      };
    }
    
    let difference: number;
    let percentChange: number;
    
    if (type === "ping") {
      difference = oldValue - newValue;
      percentChange = (difference / oldValue) * 100;
    } else {
      difference = newValue - oldValue;
      percentChange = (difference / oldValue) * 100;
    }
    
    const isImproved = (type === "ping" && difference > 0) || (type !== "ping" && difference > 0);
    const absDiff = Math.abs(difference);
    const absPercent = Math.abs(percentChange).toFixed(1);
    
    let formattedDiff = "";
    if (type === "ping") {
      formattedDiff = `${absDiff.toFixed(1)} ms`;
    } else {
      if (absDiff > 1000) {
        formattedDiff = `${(absDiff / 1000).toFixed(2)} Gbps`;
      } else {
        formattedDiff = `${absDiff.toFixed(1)} Mbps`;
      }
    }
    
    let description = "";
    if (type === "ping") {
      description = isImproved 
        ? "Lower latency means better responsiveness for gaming and calls!"
        : "Higher latency may cause lag in real-time applications.";
    } else {
      description = isImproved
        ? "Faster speeds mean better streaming, downloads, and uploads!"
        : "Slower speeds may affect video quality and file transfers.";
    }
    
    return {
      text: isImproved 
        ? `🚀 ${formattedDiff} FASTER (${absPercent}% improvement)` 
        : `🐌 ${formattedDiff} SLOWER (${absPercent}% drop)`,
      color: isImproved ? "#10b981" : "#ef4444",
      icon: isImproved ? "🚀" : "🐌",
      percent: percentChange,
      description,
    };
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "download": return "⬇️";
      case "upload": return "⬆️";
      case "ping": return "📡";
      case "score": return "⭐";
      default: return "📊";
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "download": return "Download Speed";
      case "upload": return "Upload Speed";
      case "ping": return "Ping Latency";
      case "score": return "Score";
      default: return type;
    }
  };

  const getEmoji = (type: string, isImproved: boolean, isUnchanged: boolean) => {
    if (isUnchanged) return "🎯";
    if (type === "ping") return isImproved ? "⚡" : "🐢";
    return isImproved ? "🚀" : "📉";
  };

  const improvedCount = improvements.filter(i => i.improved).length;
  const declinedCount = improvements.filter(i => !i.improved && i.oldValue !== i.newValue).length;
  const unchangedCount = improvements.filter(i => i.oldValue === i.newValue).length;

  const getOverallMessage = () => {
    if (unchangedCount === improvements.length) {
      return "✨ Miracle! Your connection is perfectly identical! ✨";
    }
    if (improvedCount > declinedCount) {
      return "🎉 Your connection is getting faster! Keep it up! 🎉";
    }
    if (declinedCount > improvedCount) {
      return "⚠️ Your connection slowed down. Check your network! ⚠️";
    }
    return "📊 Mixed results - some things improved, some slowed down.";
  };

  const getOverallColor = () => {
    if (unchangedCount === improvements.length) return "#8b5cf6";
    if (improvedCount > declinedCount) return "#10b981";
    if (declinedCount > improvedCount) return "#ef4444";
    return "#f59e0b";
  };

  const getOverallEmoji = () => {
    if (unchangedCount === improvements.length) return "✨";
    if (improvedCount > declinedCount) return "🎉";
    if (declinedCount > improvedCount) return "⚠️";
    return "📊";
  };

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
      {confetti.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: "6px",
            height: "6px",
            background: p.color,
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
          padding: "28px 20px",
          textAlign: "center",
          animation: "slideUp 0.3s ease",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>
          {getOverallEmoji()}
        </div>

        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: getOverallColor(),
          }}
        >
          {getOverallMessage()}
        </div>

        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>
          Compared to your previous test
        </div>

        <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "12px", marginBottom: "20px", maxHeight: "400px", overflow: "auto" }}>
          {improvements.map((imp, idx) => {
            const isImproved = imp.improved;
            const isUnchanged = imp.oldValue === imp.newValue;
            const diff = getDifference(imp.oldValue, imp.newValue, imp.type);
            const emoji = getEmoji(imp.type, isImproved, isUnchanged);
            
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 0",
                  borderBottom: idx < improvements.length - 1 ? "1px solid #e2e8f0" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>{getIcon(imp.type)}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "14px" }}>{getLabel(imp.type)}</div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>
                        Previous: {getRawValue(imp.oldValue, imp.type)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: isUnchanged ? "#8b5cf6" : isImproved ? "#10b981" : "#ef4444" }}>
                      {formatValue(imp.newValue, imp.type)}
                    </div>
                    {!isUnchanged && (
                      <div style={{ fontSize: "11px", color: diff.color, display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                        <span>{emoji}</span> {diff.text}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Description for each metric */}
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", paddingLeft: "34px" }}>
                  {isUnchanged ? (
                    <span>🎯 Perfect consistency! Your connection is very stable.</span>
                  ) : (
                    <span>{diff.description}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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
            fontSize: "14px",
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
          Got it
        </button>
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