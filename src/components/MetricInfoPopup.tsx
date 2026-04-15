// components/MetricInfoPopup.tsx
interface MetricInfoPopupProps {
  metric: "ping" | "download" | "upload" | "jitter" | null;
  onClose: () => void;
}

const METRIC_INFO = {
  ping: {
    title: "📡 Ping (Latency)",
    emoji: "🏓",
    description: "Time for data to travel from your device to server and back.",
    measurement: "Measured in milliseconds (ms)",
    impact: "Lower ping = better for gaming & video calls",
    goodRange: "< 20 ms (Excellent) • < 50 ms (Good) • > 100 ms (Poor)",
    tip: "For gaming, aim for < 30ms. For browsing, < 100ms is fine.",
  },
  jitter: {
    title: "⚡ Jitter (Stability)",
    emoji: "📊",
    description: "Variation in ping over time - measures connection consistency.",
    measurement: "Measured in milliseconds (ms) deviation",
    impact: "Low jitter = smooth streaming & clear calls",
    goodRange: "< 10 ms (Excellent) • < 30 ms (Good) • > 50 ms (Poor)",
    tip: "High jitter causes lag spikes. Stable connections have jitter under 10ms.",
  },
  download: {
    title: "⬇️ Download Speed",
    emoji: "💾",
    description: "How fast data downloads from internet to your device.",
    measurement: "Measured in Megabits per second (Mbps)",
    impact: "Higher speed = faster loading & streaming",
    goodRange: "> 100 Mbps (Excellent) • > 50 Mbps (Good) • < 25 Mbps (Poor)",
    tip: "4K streaming needs ~25Mbps. Gaming needs ~10-25Mbps.",
  },
  upload: {
    title: "⬆️ Upload Speed",
    emoji: "☁️",
    description: "How fast data uploads from your device to the internet.",
    measurement: "Measured in Megabits per second (Mbps)",
    impact: "Higher speed = better video calls & file sharing",
    goodRange: "> 50 Mbps (Excellent) • > 20 Mbps (Good) • < 10 Mbps (Poor)",
    tip: "Video calls need ~5-10Mbps. Cloud backups need higher speeds.",
  },
};

export default function MetricInfoPopup({ metric, onClose }: MetricInfoPopupProps) {
  if (!metric) return null;

  const info = METRIC_INFO[metric];

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 999,
        }}
        onClick={onClose}
      />
      
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          color: "#fff",
          padding: "24px",
          borderRadius: "24px",
          maxWidth: "90%",
          width: "400px",
          zIndex: 1000,
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          animation: "popupSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              fontSize: "36px",
              background: "rgba(16,185,129,0.1)",
              padding: "8px",
              borderRadius: "16px",
            }}>
              {info.emoji}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#f1f5f9" }}>
                {info.title}
              </h2>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                Connection Metric
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "18px",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Animated Visualization */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "20px",
          padding: "20px",
          background: "rgba(0,0,0,0.2)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ 
            fontSize: "52px", 
            display: "inline-block",
            animation: "bounce 2s ease-in-out infinite",
          }}>
            {metric === "ping" && "🏓"}
            {metric === "jitter" && "📊"}
            {metric === "download" && "⬇️"}
            {metric === "upload" && "⬆️"}
          </div>
          <div style={{ 
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}>
            {metric === "ping" && (
              <>
                <span style={{ fontSize: "20px", animation: "slideRight 1s infinite" }}>📱</span>
                <span style={{ fontSize: "20px", animation: "pulse 1s infinite" }}>→</span>
                <span style={{ fontSize: "20px", animation: "slideLeft 1s infinite" }}>🖥️</span>
                <span style={{ fontSize: "20px", animation: "pulse 1s infinite 0.5s" }}>←</span>
                <span style={{ fontSize: "20px", animation: "slideRight 1s infinite 0.5s" }}>📱</span>
              </>
            )}
            {metric === "jitter" && (
              <>
                <span style={{ fontSize: "20px", animation: "wave 1.5s infinite" }}>~~~~</span>
                <span style={{ fontSize: "20px" }}>📈</span>
                <span style={{ fontSize: "20px", animation: "wave 1.5s infinite reverse" }}>~~~~</span>
              </>
            )}
            {metric === "download" && (
              <>
                <span style={{ fontSize: "20px", animation: "flowDown 1s infinite" }}>☁️</span>
                <span style={{ fontSize: "20px", animation: "arrowRight 1s infinite" }}>→→→</span>
                <span style={{ fontSize: "20px", animation: "bounce 1s infinite" }}>📱</span>
              </>
            )}
            {metric === "upload" && (
              <>
                <span style={{ fontSize: "20px", animation: "bounce 1s infinite" }}>📱</span>
                <span style={{ fontSize: "20px", animation: "arrowLeft 1s infinite" }}>←←←</span>
                <span style={{ fontSize: "20px", animation: "flowUp 1s infinite" }}>☁️</span>
              </>
            )}
          </div>
          <div style={{ fontSize: "10px", marginTop: "12px", color: "#94a3b8" }}>
            {metric === "ping" && "Round trip: Device → Server → Device"}
            {metric === "jitter" && "Consistency of your connection over time"}
            {metric === "download" && "Data flowing from internet to you"}
            {metric === "upload" && "Data flowing from you to internet"}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "13px", lineHeight: "1.5", margin: 0, color: "#cbd5e1" }}>
            {info.description}
          </p>
        </div>

        {/* Measurement & Impact Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "12px",
          marginBottom: "16px",
        }}>
          <div style={{ 
            background: "rgba(59,130,246,0.1)", 
            padding: "12px", 
            borderRadius: "12px",
            borderLeft: "3px solid #3b82f6",
          }}>
            <div style={{ fontSize: "9px", opacity: 0.6, marginBottom: "6px", letterSpacing: "0.5px" }}>
              📏 HOW IT'S MEASURED
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: "#f1f5f9" }}>
              {info.measurement}
            </div>
          </div>
          <div style={{ 
            background: "rgba(139,92,246,0.1)", 
            padding: "12px", 
            borderRadius: "12px",
            borderLeft: "3px solid #8b5cf6",
          }}>
            <div style={{ fontSize: "9px", opacity: 0.6, marginBottom: "6px", letterSpacing: "0.5px" }}>
              💡 WHAT IT IMPACTS
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: "#f1f5f9" }}>
              {info.impact}
            </div>
          </div>
        </div>

        {/* Good Range & Tip */}
        <div style={{ 
          background: "rgba(16,185,129,0.1)", 
          padding: "14px", 
          borderRadius: "12px",
          border: "1px solid rgba(16,185,129,0.2)",
          marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span>✅</span>
            <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.5px", color: "#10b981" }}>
              GOOD RANGE
            </span>
          </div>
          <div style={{ fontSize: "11px", lineHeight: "1.4", color: "#cbd5e1" }}>
            {info.goodRange}
          </div>
        </div>

        <div style={{ 
          background: "rgba(245,158,11,0.1)", 
          padding: "10px 14px", 
          borderRadius: "12px",
          border: "1px solid rgba(245,158,11,0.2)",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>💡</span>
            <span style={{ fontSize: "11px", color: "#f59e0b" }}>Pro Tip</span>
          </div>
          <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "4px" }}>
            {info.tip}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Got it! 👌
        </button>
      </div>

      <style>{`
        @keyframes popupSlideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes slideRight {
          0% { transform: translateX(0); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(0); }
        }
        
        @keyframes slideLeft {
          0% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(0); opacity: 0.5; }
          50% { transform: translateX(5px); opacity: 1; }
        }
        
        @keyframes flowDown {
          0% { transform: translateY(0); }
          50% { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes flowUp {
          0% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes arrowRight {
          0% { transform: translateX(0); opacity: 0.5; }
          50% { transform: translateX(8px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.5; }
        }
        
        @keyframes arrowLeft {
          0% { transform: translateX(0); opacity: 0.5; }
          50% { transform: translateX(-8px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.5; }
        }
      `}</style>
    </>
  );
}