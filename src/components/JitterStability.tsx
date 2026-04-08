// components/JitterStability.tsx
interface JitterStabilityProps {
  jitter: number | null;
  history: number[];
}

export default function JitterStability({ jitter, history }: JitterStabilityProps) {
  if (!jitter) return null;
  
  const avgJitter = history.length > 0 
    ? history.reduce((a, b) => a + b, 0) / history.length 
    : jitter;
  
  const maxJitter = Math.max(...history, jitter);
  const stabilityScore = Math.max(0, 100 - (avgJitter * 2));
  
  const getStability = () => {
    if (avgJitter < 10) return { label: "Very Stable", color: "#10b981", bars: 5 };
    if (avgJitter < 20) return { label: "Stable", color: "#3b82f6", bars: 4 };
    if (avgJitter < 35) return { label: "Moderate", color: "#f59e0b", bars: 3 };
    if (avgJitter < 50) return { label: "Unstable", color: "#ef4444", bars: 2 };
    return { label: "Very Unstable", color: "#dc2626", bars: 1 };
  };
  
  const stability = getStability();
  
  return (
    <div style={{
      background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      borderRadius: "20px",
      padding: "20px",
    }}>
      <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "16px", textAlign: "center" }}>
        ⚡ CONNECTION STABILITY
      </div>
      
      {/* Stability Bars */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px" }}>
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            style={{
              width: "40px",
              height: `${bar * 12}px`,
              background: bar <= stability.bars ? stability.color : "#475569",
              borderRadius: "4px",
              transition: "all 0.3s ease",
              opacity: bar <= stability.bars ? 1 : 0.3,
            }}
          />
        ))}
      </div>
      
      {/* Jitter Values */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "28px", fontWeight: "bold", color: stability.color }}>
          {jitter.toFixed(1)} ms
        </div>
        <div style={{ fontSize: "13px", color: stability.color, marginTop: "4px" }}>
          {stability.label}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        marginTop: "16px",
        padding: "12px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "12px",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Average</div>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: "#f1f5f9" }}>
            {avgJitter.toFixed(1)} ms
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Peak</div>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: "#f1f5f9" }}>
            {maxJitter.toFixed(1)} ms
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Stability</div>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: stability.color }}>
            {stabilityScore.toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* Recommendation */}
      <div style={{
        marginTop: "16px",
        padding: "10px",
        background: `rgba(${stability.color === "#10b981" ? "16,185,129" : stability.color === "#3b82f6" ? "59,130,246" : stability.color === "#f59e0b" ? "245,158,11" : "239,68,68"}, 0.1)`,
        borderRadius: "10px",
        fontSize: "11px",
        textAlign: "center",
        color: stability.color,
      }}>
        {avgJitter < 10 && "✅ Perfect for gaming, streaming, and video calls"}
        {avgJitter >= 10 && avgJitter < 20 && "👍 Good for most activities, may have minor hiccups"}
        {avgJitter >= 20 && avgJitter < 35 && "⚠️ May experience lag during gaming or video calls"}
        {avgJitter >= 35 && "❌ Not recommended for real-time applications"}
      </div>
    </div>
  );
}