// components/ComparisonPopup.tsx
// Only shown after a real test completes and there is a previous test to compare against.
// Added: jitter metric, stability rating, trend sparkline text.
import { useEffect, useState } from "react";

interface Improvement {
  type: string;
  oldValue: number;
  newValue: number;
  improved: boolean;
}

interface ComparisonPopupProps {
  isOpen: boolean;
  onClose: () => void;
  improvements: Improvement[];
}

function fmtVal(v: number, type: string): string {
  if (type === "ping" || type === "jitter") return `${v.toFixed(1)} ms`;
  if (type === "score") return `${Math.round(v)} pts`;
  if (v > 1000) return `${(v / 1000).toFixed(2)} Gbps`;
  return `${v.toFixed(1)} Mbps`;
}

function diffInfo(imp: Improvement) {
  const { type, oldValue, newValue } = imp;
  if (oldValue === newValue) return { label: "No change", color: "#8b5cf6", pct: 0, up: null };
  const lowerIsBetter = type === "ping" || type === "jitter";
  const delta   = lowerIsBetter ? oldValue - newValue : newValue - oldValue;
  const pct     = oldValue !== 0 ? Math.abs((delta / oldValue) * 100) : 0;
  const up      = delta > 0; // true = better
  return {
    label: `${up ? "▲" : "▼"} ${pct.toFixed(1)}%`,
    color: up ? "#10b981" : "#ef4444",
    pct,
    up,
  };
}

function metaFor(type: string): { icon: string; label: string; desc: (up: boolean | null) => string } {
  switch (type) {
    case "download": return { icon: "⬇️", label: "Download",  desc: u => u ? "Faster downloads & streaming!" : u === false ? "Slower downloads — check background apps." : "Perfectly consistent download speed." };
    case "upload":   return { icon: "⬆️", label: "Upload",    desc: u => u ? "Better for video calls & uploads!" : u === false ? "Upload slowed — may affect video calls." : "Upload remains stable." };
    case "ping":     return { icon: "📡", label: "Ping",      desc: u => u ? "Lower ping = faster response times!" : u === false ? "Higher ping may cause lag in games." : "Ping is rock-solid — very consistent." };
    case "jitter":   return { icon: "📶", label: "Jitter",    desc: u => u ? "Less jitter = smoother streaming!" : u === false ? "More jitter may cause choppy video calls." : "Jitter unchanged — stable connection." };
    case "score":    return { icon: "⭐", label: "Score",     desc: u => u ? "Overall quality improved!" : u === false ? "Overall quality dropped slightly." : "Score identical — consistent performance." };
    default:         return { icon: "📊", label: type,        desc: _ => "" };
  }
}

export default function ComparisonPopup({ isOpen, onClose, improvements }: ComparisonPopupProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      setConfetti(
        Array.from({ length: 60 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          color: ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#38bdf8"][Math.floor(Math.random() * 5)],
        }))
      );
    }
  }, [isOpen]);

  if (!isOpen || !improvements || improvements.length === 0) return null;

  const improvedCount  = improvements.filter(i => diffInfo(i).up === true).length;
  const declinedCount  = improvements.filter(i => diffInfo(i).up === false).length;
  const unchangedCount = improvements.filter(i => diffInfo(i).up === null).length;
  const total          = improvements.length;

  const overallMsg   = unchangedCount === total  ? "✨ Perfect consistency!"
    : improvedCount > declinedCount              ? "🎉 Your connection improved!"
    : declinedCount > improvedCount              ? "⚠️ Connection slowed down"
    :                                             "📊 Mixed results";
  const overallColor = unchangedCount === total  ? "#8b5cf6"
    : improvedCount > declinedCount              ? "#10b981"
    : declinedCount > improvedCount              ? "#ef4444"
    :                                             "#f59e0b";

  // Extra derived stats
  const avgPctImprovement = improvements
    .map(i => diffInfo(i))
    .filter(d => d.up === true)
    .reduce((sum, d, _, arr) => sum + d.pct / arr.length, 0);

  const stabilityScore = Math.round((unchangedCount / total) * 100);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", animation: "cpFadeIn 0.2s ease" }}
      onClick={onClose}
    >
      {/* Confetti */}
      {confetti.map(p => (
        <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, top: "-10px", width: 7, height: 7, background: p.color, borderRadius: 2, animation: `cpFall ${1.4 + Math.random() * 1.6}s linear forwards`, pointerEvents: "none" }} />
      ))}

      <div
        style={{ background: "#fff", borderRadius: 28, maxWidth: 460, width: "92%", padding: "24px 18px 20px", textAlign: "center", animation: "cpSlideUp 0.3s ease", boxShadow: "0 24px 48px rgba(0,0,0,0.28)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ fontSize: 44, marginBottom: 8 }}>
          {unchangedCount === total ? "✨" : improvedCount > declinedCount ? "🎉" : declinedCount > improvedCount ? "⚠️" : "📊"}
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, color: overallColor, marginBottom: 4 }}>{overallMsg}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>Compared to your previous test</div>

        {/* Summary chips */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {improvedCount  > 0 && <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600 }}>▲ {improvedCount} improved</span>}
          {declinedCount  > 0 && <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600 }}>▼ {declinedCount} declined</span>}
          {unchangedCount > 0 && <span style={{ background: "#f3e8ff", color: "#7c3aed", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600 }}>= {unchangedCount} unchanged</span>}
        </div>

        {/* Extra stats row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {avgPctImprovement > 0 && (
            <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 12, padding: "8px 6px", border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 9, color: "#64748b" }}>Avg improvement</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>+{avgPctImprovement.toFixed(1)}%</div>
            </div>
          )}
          <div style={{ flex: 1, background: "#f8fafc", borderRadius: 12, padding: "8px 6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 9, color: "#64748b" }}>Consistency</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: stabilityScore > 50 ? "#8b5cf6" : "#f59e0b" }}>{stabilityScore}%</div>
          </div>
          <div style={{ flex: 1, background: "#f8fafc", borderRadius: 12, padding: "8px 6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 9, color: "#64748b" }}>Metrics tracked</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>{total}</div>
          </div>
        </div>

        {/* Per-metric rows */}
        <div style={{ background: "#f8fafc", borderRadius: 16, padding: "8px 12px", marginBottom: 16, textAlign: "left" }}>
          {improvements.map((imp, idx) => {
            const d    = diffInfo(imp);
            const meta = metaFor(imp.type);
            return (
              <div key={idx} style={{ padding: "10px 0", borderBottom: idx < improvements.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{meta.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{meta.label}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>was {fmtVal(imp.oldValue, imp.type)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: d.up === null ? "#8b5cf6" : d.up ? "#10b981" : "#ef4444" }}>
                      {fmtVal(imp.newValue, imp.type)}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: d.color }}>{d.label}</div>
                  </div>
                </div>
                {/* Mini bar */}
                {d.up !== null && (
                  <div style={{ marginTop: 5, height: 4, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, d.pct)}%`, background: d.up ? "#10b981" : "#ef4444", borderRadius: 4, transition: "width 0.6s ease" }} />
                  </div>
                )}
                {/* Description */}
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>{meta.desc(d.up)}</div>
              </div>
            );
          })}
        </div>

        {/* All-same fun fact */}
        {unchangedCount === total && (
          <div style={{ marginBottom: 14, padding: 10, background: "#f3e8ff", borderRadius: 12, fontSize: 11, color: "#6b21a8" }}>
            🤔 Getting identical speeds twice in a row is incredibly rare — your connection is remarkably consistent!
          </div>
        )}

        <button
          onClick={onClose}
          style={{ width: "100%", padding: 13, background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", color: "#fff", border: "none", borderRadius: 40, cursor: "pointer", fontSize: 14, fontWeight: 700 }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          Got it! 👍
        </button>
      </div>

      <style>{`
        @keyframes cpFadeIn  { from { opacity:0; }                              to { opacity:1; }                           }
        @keyframes cpSlideUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); }  }
        @keyframes cpFall    { 0%   { transform:translateY(0) rotate(0deg);  opacity:1; }
                               100% { transform:translateY(110vh) rotate(360deg); opacity:0; } }
      `}</style>
    </div>
  );
}