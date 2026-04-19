// components/SmartRedirectPopup.tsx
// Auto-dismisses after 12 s with a descending sky-blue progress bar.
// Also closes when user clicks outside or presses a button.
import { useEffect, useState, useRef } from "react";

const AUTO_DISMISS_MS = 12000;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  type: "high-latency" | "history" | "feature-highlight" | "achievement" | "try-tools";
  data?: {
    ping?: number;
    testCount?: number;
    featureName?: string;
    achievementName?: string;
  };
}

// Sky-blue descending progress bar — shown at top of every popup
function TimerBar({ durationMs, onExpire }: { durationMs: number; onExpire: () => void }) {
  const [pct, setPct] = useState(100); // 100 → 0
  const startRef = useRef(Date.now());
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 1 - elapsed / durationMs) * 100;
      setPct(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onExpire();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "20px 20px 0 0", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)",
          borderRadius: "20px 20px 0 0",
          transition: "width 0.1s linear",
          boxShadow: "0 0 6px rgba(56,189,248,0.6)",
        }}
      />
    </div>
  );
}

export default function SmartRedirectPopup({ isOpen, onClose, onAction, type, data }: Props) {
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);

  useEffect(() => {
    if (isOpen) { setVisible(true); closingRef.current = false; }
  }, [isOpen]);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(() => onClose(), 280);
  };

  const handleAction = (action: string) => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(() => { onAction(action); onClose(); }, 280);
  };

  if (!isOpen && !visible) return null;

  const card: React.CSSProperties = {
    position: "fixed",
    bottom: 24, right: 24,
    maxWidth: 360,
    width: "calc(100% - 48px)",
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: 20,
    padding: "24px 20px 18px",
    zIndex: 3001,
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
    animation: visible ? "srSlideIn 0.3s ease" : "srSlideOut 0.28s ease forwards",
    overflow: "hidden",
  };

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
    zIndex: 3000,
  };

  const closeBtn: React.CSSProperties = {
    position: "absolute", top: 14, right: 14,
    background: "rgba(255,255,255,0.1)", border: "none",
    borderRadius: 6, color: "#fff", fontSize: 14, cursor: "pointer",
    width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
  };

  const iconWrap: React.CSSProperties = { textAlign: "center", marginBottom: 10 };
  const title: React.CSSProperties    = { fontSize: 17, fontWeight: 700, color: "#fff", textAlign: "center", margin: "0 0 8px" };
  const desc: React.CSSProperties     = { fontSize: 12, color: "#cbd5e1", textAlign: "center", lineHeight: 1.5, marginBottom: 14 };
  const btnRow: React.CSSProperties   = { display: "flex", gap: 10 };
  const primary: React.CSSProperties  = { flex: 1, padding: "10px 0", background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 };
  const secondary: React.CSSProperties= { flex: 1, padding: "10px 0", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 500, fontSize: 13 };

  // ── Try Tools (always shown after comparison) ──────────────────
  if (type === "try-tools") {
    return (
      <>
        <div style={overlay} onClick={handleClose} />
        <div style={card} onClick={e => e.stopPropagation()}>
          <TimerBar durationMs={AUTO_DISMISS_MS} onExpire={handleClose} />
          <button style={closeBtn} onClick={handleClose}>✕</button>
          <div style={iconWrap}><span style={{ fontSize: 38 }}>🛠️</span></div>
          <h3 style={title}>Want Better Signal?</h3>
          <p style={desc}>
            Use the <strong style={{ color: "#38bdf8" }}>Live Ping Scanner</strong> to walk around and find your strongest Wi-Fi spot in real time!
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, justifyContent: "center", marginBottom: 14 }}>
            {["📡 Live ping meter", "🎯 Best spot finder", "📳 Phone vibration alert"].map(t => (
              <span key={t} style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", padding: "3px 10px", borderRadius: 20, fontSize: 10, color: "#7dd3fc" }}>{t}</span>
            ))}
          </div>
          <div style={btnRow}>
            <button style={{ ...primary, background: "linear-gradient(135deg,#0ea5e9,#0284c7)" }} onClick={() => handleAction("open-ping-scanner")}>
              🔍 Open Ping Scanner
            </button>
            <button style={secondary} onClick={handleClose}>Later</button>
          </div>
        </div>
      </>
    );
  }

  // ── High Latency ──────────────────────────────────────────────
  if (type === "high-latency" && data?.ping && data.ping > 100) {
    const veryHigh = data.ping > 200;
    return (
      <>
        <div style={overlay} onClick={handleClose} />
        <div style={card} onClick={e => e.stopPropagation()}>
          <TimerBar durationMs={AUTO_DISMISS_MS} onExpire={handleClose} />
          <button style={closeBtn} onClick={handleClose}>✕</button>
          <div style={iconWrap}><span style={{ fontSize: 38 }}>🚦</span></div>
          <h3 style={title}>{veryHigh ? "High Latency Detected!" : "Connection Slowing You Down?"}</h3>
          <p style={desc}>
            Your ping is <strong style={{ color: "#ef4444" }}>{Math.round(data.ping)}ms</strong>.
            {veryHigh ? " This causes lag in gaming and video calls." : " This could affect gaming and streaming."}
          </p>
          <div style={{ background: "rgba(59,130,246,0.12)", borderRadius: 10, padding: "8px 12px", marginBottom: 14, display: "flex", gap: 8, alignItems: "center", borderLeft: "3px solid #3b82f6" }}>
            <span>💡</span><span style={{ fontSize: 11, color: "#93c5fd" }}>Try finding a spot with better signal!</span>
          </div>
          <div style={btnRow}>
            <button style={primary} onClick={() => handleAction("open-ping-scanner")}>📡 Find Better Spot</button>
            <button style={secondary} onClick={handleClose}>Ignore</button>
          </div>
          <p style={{ fontSize: 9, color: "#475569", textAlign: "center", margin: "10px 0 0" }}>Find this anytime: Network Details → Ping Scanner</p>
        </div>
      </>
    );
  }

  // ── History Discovery ─────────────────────────────────────────
  if (type === "history" && data?.testCount && data.testCount >= 3) {
    return (
      <>
        <div style={overlay} onClick={handleClose} />
        <div style={card} onClick={e => e.stopPropagation()}>
          <TimerBar durationMs={AUTO_DISMISS_MS} onExpire={handleClose} />
          <button style={closeBtn} onClick={handleClose}>✕</button>
          <div style={iconWrap}><span style={{ fontSize: 38 }}>📊</span></div>
          <h3 style={title}>Your Internet Story</h3>
          <p style={desc}>
            You've completed <strong style={{ color: "#10b981" }}>{data.testCount} tests</strong>!
            See how your connection performs over time.
          </p>
          <div style={btnRow}>
            <button style={primary} onClick={() => handleAction("view-history")}>📈 View Trends</button>
            <button style={secondary} onClick={handleClose}>Later</button>
          </div>
        </div>
      </>
    );
  }

  // ── Feature Highlight ─────────────────────────────────────────
  if (type === "feature-highlight") {
    const name = data?.featureName || "Live Ping Scanner";
    const isPing = name === "Live Ping Scanner";
    return (
      <>
        <div style={overlay} onClick={handleClose} />
        <div style={card} onClick={e => e.stopPropagation()}>
          <TimerBar durationMs={AUTO_DISMISS_MS} onExpire={handleClose} />
          <button style={closeBtn} onClick={handleClose}>✕</button>
          <div style={iconWrap}><span style={{ fontSize: 38 }}>{isPing ? "📡" : "🎉"}</span></div>
          <h3 style={title}>New Feature: {name}</h3>
          <p style={desc}>{isPing ? "Walk around while watching ping drop in real-time! Find the best gaming spot." : "New tools to help you get the most from your connection!"}</p>
          <div style={btnRow}>
            <button style={primary} onClick={() => handleAction(isPing ? "open-ping-scanner" : "explore-feature")}>🚀 Try Now</button>
            <button style={secondary} onClick={handleClose}>Later</button>
          </div>
        </div>
      </>
    );
  }

  // ── Achievement ───────────────────────────────────────────────
  if (type === "achievement") {
    return (
      <>
        <div style={overlay} onClick={handleClose} />
        <div style={card} onClick={e => e.stopPropagation()}>
          <TimerBar durationMs={AUTO_DISMISS_MS} onExpire={handleClose} />
          <button style={closeBtn} onClick={handleClose}>✕</button>
          <div style={iconWrap}><span style={{ fontSize: 38 }}>🏆</span></div>
          <h3 style={title}>Achievement Unlocked!</h3>
          <p style={desc}>{data?.achievementName || "You're getting better at this!"}</p>
          <div style={btnRow}>
            <button style={primary} onClick={() => handleAction("continue")}>🎉 Awesome!</button>
          </div>
        </div>
      </>
    );
  }

  return null;
}

// Slide animations
const ss = document.createElement("style");
ss.textContent = `
  @keyframes srSlideIn  { from { opacity:0; transform:translateX(60px);  } to { opacity:1; transform:translateX(0);   } }
  @keyframes srSlideOut { from { opacity:1; transform:translateX(0);   } to { opacity:0; transform:translateX(60px);  } }
`;
document.head.appendChild(ss);