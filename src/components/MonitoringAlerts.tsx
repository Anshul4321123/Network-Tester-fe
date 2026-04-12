// components/MonitoringAlerts.tsx
import { useEffect, useState } from "react";

interface SpeedDrop {
  time: string;
  dropPercent: number;
  averageSpeed: number;
  dropSpeed: number;
}

interface MonitoringAlertsProps {
  history: { date: string; download: number; upload: number; ping: number }[];
}

export default function MonitoringAlerts({ history }: MonitoringAlertsProps) {
  const [alerts, setAlerts] = useState<SpeedDrop[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    if (history.length < 5) return;

    // Analyze patterns in history
    const analyzeSpeedDrops = () => {
      const drops: SpeedDrop[] = [];
      
      // Group by hour
      const hourlyData: { [hour: number]: number[] } = {};
      
      history.forEach(record => {
        const date = new Date(record.date);
        const hour = date.getHours();
        if (!hourlyData[hour]) hourlyData[hour] = [];
        hourlyData[hour].push(record.download);
      });
      
      // Find hours with significant drops
      for (const hour in hourlyData) {
        const speeds = hourlyData[parseInt(hour)];
        if (speeds.length >= 2) {
          const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
          const maxSpeed = Math.max(...speeds);
          const minSpeed = Math.min(...speeds);
          const dropPercent = ((maxSpeed - minSpeed) / maxSpeed) * 100;
          
          if (dropPercent > 30 && speeds.length >= 2) {
            const hourNum = parseInt(hour);
            const timeStr = hourNum === 0 ? "12 AM" : 
                           hourNum < 12 ? `${hourNum} AM` :
                           hourNum === 12 ? "12 PM" : `${hourNum - 12} PM`;
            
            drops.push({
              time: timeStr,
              dropPercent: Math.round(dropPercent),
              averageSpeed: Math.round(avgSpeed),
              dropSpeed: Math.round(minSpeed),
            });
          }
        }
      }
      
      setAlerts(drops.slice(0, 3));
    };
    
    analyzeSpeedDrops();
  }, [history]);

  if (alerts.length === 0) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        borderRadius: "14px",
        padding: "12px 16px",
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
      onClick={() => setShowAlerts(!showAlerts)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: showAlerts ? "12px" : "0" }}>
        <span style={{ fontSize: "20px" }}>🔔</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "#fbbf24" }}>
            Speed Drop Detected!
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>
            Your speed drops {alerts[0]?.dropPercent}% at {alerts[0]?.time}
          </div>
        </div>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{showAlerts ? "▲" : "▼"}</span>
      </div>
      
      {showAlerts && (
        <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
            📊 Pattern Analysis:
          </div>
          {alerts.map((alert, idx) => (
            <div key={idx} style={{ marginBottom: "8px", fontSize: "11px", color: "#cbd5e1" }}>
              • {alert.time}: Drops from {alert.averageSpeed} Mbps → {alert.dropSpeed} Mbps ({alert.dropPercent}% drop)
            </div>
          ))}
          <div style={{ 
            fontSize: "10px", 
            color: "#fbbf24", 
            marginTop: "8px",
            padding: "6px",
            background: "rgba(251,191,36,0.1)",
            borderRadius: "8px",
          }}>
            💡 Tip: This might be peak hours for your ISP. Try testing at different times!
          </div>
        </div>
      )}
    </div>
  );
}