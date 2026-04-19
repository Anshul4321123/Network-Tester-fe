// components/HighScorePopup.tsx
// Shows ALL broken personal bests as equal cards — 1 record = 1 card, 4 records = 4 cards.


export interface HighScoreRecord {
  metric: "score" | "download" | "upload" | "ping";
  oldValue: number;
  newValue: number;
  isFirstEver: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  records: HighScoreRecord[];
}

const META: Record<HighScoreRecord["metric"], { label: string; icon: string; color: string; betterIsLower: boolean }> = {
  score:    { label: "Overall Score",  icon: "🏆", color: "#f59e0b", betterIsLower: false },
  download: { label: "Download Speed", icon: "⬇️",  color: "#3b82f6", betterIsLower: false },
  upload:   { label: "Upload Speed",   icon: "⬆️",  color: "#8b5cf6", betterIsLower: false },
  ping:     { label: "Best Ping",      icon: "📡", color: "#10b981", betterIsLower: true  },
};

function fmt(metric: HighScoreRecord["metric"], v: number): string {
  if (metric === "score") return `${Math.round(v)}/100`;
  if (metric === "ping")  return `${Math.round(v)}ms`;
  return `${v.toFixed(1)} Mbps`;
}

function improvePct(r: HighScoreRecord): number | null {
  if (r.isFirstEver || r.oldValue === 0) return null;
  const delta = r.metric === "ping"
    ? (r.oldValue - r.newValue) / r.oldValue
    : (r.newValue - r.oldValue) / r.oldValue;
  return Math.round(delta * 100);
}

// Single record card
function RecordCard({ r }: { r: HighScoreRecord }) {
  const m   = META[r.metric];
  const pct = improvePct(r);
  return (
    <div style={{
      background: `linear-gradient(135deg, ${m.color}18 0%, ${m.color}08 100%)`,
      border: `1px solid ${m.color}40`,
      borderRadius: 14,
      padding: "12px 14px",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      {/* Icon */}
      <div style={{ fontSize: 28, flexShrink: 0 }}>{m.icon}</div>

      {/* Label + values */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: m.color, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 2 }}>
          {r.isFirstEver ? "First Record" : "New Best"}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{m.label}</div>
        {/* Before → After */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {!r.isFirstEver && (
            <>
              <span style={{ fontSize: 13, color: "#64748b", textDecoration: "line-through" }}>{fmt(r.metric, r.oldValue)}</span>
              <span style={{ fontSize: 11, color: "#475569" }}>→</span>
            </>
          )}
          <span style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{fmt(r.metric, r.newValue)}</span>
          {pct !== null && pct > 0 && (
            <span style={{ fontSize: 10, background: `${m.color}22`, border: `1px solid ${m.color}44`, borderRadius: 20, padding: "1px 7px", color: m.color, fontWeight: 700 }}>
              +{pct}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HighScorePopup({ isOpen, onClose, records }: Props) {
  if (!isOpen || records.length === 0) return null;

  const isFirstEver = records.every(r => r.isFirstEver);
  const count = records.length;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", zIndex: 4000 }} />

      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(160deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: 24,
          padding: "24px 20px 20px",
          width: "calc(100% - 36px)",
          maxWidth: 400,
          maxHeight: "90vh",
          overflowY: "auto",
          zIndex: 4001,
          boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.1)",
          animation: "hsPopIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "#fff", fontSize: 16, cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 6 }}>{isFirstEver ? "🎉" : "🏅"}</div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>
            {isFirstEver ? "First Test Records!" : `${count} New Personal Best${count > 1 ? "s" : ""}!`}
          </h2>
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
            {isFirstEver
              ? "You've set your baseline — run more tests to beat these!"
              : "You beat your 5-day bests in these categories:"}
          </p>
        </div>

        {/* Record cards — one per broken metric */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {records.map(r => <RecordCard key={r.metric} r={r} />)}
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
        >
          Awesome! 🎊
        </button>
      </div>

      <style>{`
        @keyframes hsPopIn {
          from { opacity:0; transform:translate(-50%,-44%) scale(0.85); }
          to   { opacity:1; transform:translate(-50%,-50%) scale(1);    }
        }
      `}</style>
    </>
  );
}