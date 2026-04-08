// components/PingVisualizer.tsx
import { useEffect, useState } from "react";

interface PingVisualizerProps {
  ping: number | null;
  isTesting: boolean;
}

export default function PingVisualizer({ ping, isTesting }: PingVisualizerProps) {
  const [ripples, setRipples] = useState<number[]>([]);

  // Create ripple effect for each ping
  useEffect(() => {
    if (isTesting && ping) {
      const id = Date.now();
      setRipples(prev => [...prev, id]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r !== id));
      }, ping);
    }
  }, [ping, isTesting]);

  const getPingQuality = (pingMs: number) => {
    if (pingMs < 30) return { label: "Excellent", color: "#10b981", icon: "🚀" };
    if (pingMs < 60) return { label: "Good", color: "#3b82f6", icon: "👍" };
    if (pingMs < 100) return { label: "Fair", color: "#f59e0b", icon: "⚠️" };
    return { label: "Poor", color: "#ef4444", icon: "❌" };
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      borderRadius: "20px",
      padding: "20px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "12px" }}>
        📡 REAL-TIME PING SIMULATION
      </div>
      
      {/* Animated Signal Waves */}
      <div style={{ position: "relative", height: "100px", marginBottom: "20px" }}>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60px",
          height: "60px",
          background: "#3b82f6",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}>
          <span style={{ fontSize: "24px" }}>📡</span>
        </div>
        
        {/* Ripple effects */}
        {ripples.map((id) => (
          <div
            key={id}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60px",
              height: "60px",
              border: `2px solid ${ping ? getPingQuality(ping).color : "#3b82f6"}`,
              borderRadius: "50%",
              animation: "ripple 0.8s ease-out forwards",
              pointerEvents: "none",
            }}
          />
        ))}
      </div>

      {/* Ping Value Display */}
      {ping !== null && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "36px", fontWeight: "bold", color: getPingQuality(ping).color }}>
            {ping} ms
          </div>
          <div style={{ fontSize: "13px", color: getPingQuality(ping).color, marginTop: "4px" }}>
            {getPingQuality(ping).icon} {getPingQuality(ping).label}
          </div>
        </div>
      )}

      <style>{`
        @keyframes ripple {
          0% {
            width: 60px;
            height: 60px;
            opacity: 1;
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}