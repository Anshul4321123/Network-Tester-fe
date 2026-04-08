// components/PingGauge.tsx
interface PingGaugeProps {
  ping: number | null;
}

export default function PingGauge({ ping }: PingGaugeProps) {
  if (!ping) return null;
  
  // Calculate angle (0-180 degrees) - lower ping = better
  const angle = Math.min(180, (ping / 200) * 180);
  const rotation = -90 + angle;
  
  const getColor = () => {
    if (ping < 30) return "#10b981";
    if (ping < 60) return "#3b82f6";
    if (ping < 100) return "#f59e0b";
    return "#ef4444";
  };
  
  const getLabel = () => {
    if (ping < 30) return "Excellent";
    if (ping < 60) return "Good";
    if (ping < 100) return "Fair";
    return "Poor";
  };
  
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="150" height="100" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="15"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray={`${(angle / 180) * 251} 251`}
          strokeDashoffset="0"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2={100 + 70 * Math.cos((rotation * Math.PI) / 180)}
          y2={100 + 70 * Math.sin((rotation * Math.PI) / 180)}
          stroke="#1e293b"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transition: "transform 0.5s ease", transformOrigin: "100px 100px" }}
        />
        <circle cx="100" cy="100" r="6" fill="#1e293b" />
      </svg>
      <div style={{ marginTop: "8px", fontWeight: "bold", color: getColor() }}>
        {getLabel()}
      </div>
    </div>
  );
}