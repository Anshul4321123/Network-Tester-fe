// components/SmartRedirectPopup.tsx
// 12-second auto-dismiss. Timer bar: two halves shrink from outside → center using pure CSS animation.
import { useEffect, useState, useRef } from "react";

const TIMER_MS = 12000;

export type SmartPopupType =
  | "high-latency"
  | "history"
  | "feature-highlight"
  | "achievement"
  | "try-tools";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  type: SmartPopupType;
  data?: {
    ping?: number;
    testCount?: number;
    featureName?: string;
    achievementName?: string;
  };
}

// Pure-CSS timer bar: two halves shrink from the edges toward the center.
// Left half shrinks rightward (width 50%→0), right half shrinks leftward (width 50%→0).
// Result: bar disappears symmetrically from outside-in.
function TimerBar({ running, onExpire }: { running: boolean; onExpire: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setTimeout(onExpire, TIMER_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  if (!running) return null;

  const half: React.CSSProperties = {
    position: "absolute",
    top: 0,
    height: "100%",
    background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
    animation: `timerShrink ${TIMER_MS}ms linear forwards`,
    boxShadow: "0 0 8px rgba(56,189,248,0.7)",
  };

  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "20px 20px 0 0", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        {/* Left half — shrinks from 50% → 0 from the right side */}
        <div style={{ ...half, left: 0, width: "50%", transformOrigin: "left center" }} />
        {/* Right half — shrinks from 50% → 0 from the left side */}
        <div style={{ ...half, right: 0, width: "50%", transformOrigin: "right center" }} />
      </div>
      <style>{`
        @keyframes timerShrink {
          from { width: 50%; }
          to   { width: 0%;  }
        }
        @keyframes srSlideIn  { from { opacity:0; transform:translateX(64px); } to { opacity:1; transform:translateX(0);    } }
        @keyframes srSlideOut { from { opacity:1; transform:translateX(0);    } to { opacity:0; transform:translateX(64px); } }
      `}</style>
    </>
  );
}

export default function SmartRedirectPopup({ isOpen, onClose, onAction, type, data }: Props) {
  const [visible, setVisible]   = useState(false);
  const closingRef               = useRef(false);

  useEffect(() => {
    if (isOpen) { setVisible(true); closingRef.current = false; }
  }, [isOpen]);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 280);
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
    boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
    animation: visible ? "srSlideIn 0.3s ease" : "srSlideOut 0.28s ease forwards",
  };

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 3000,
  };

  const closeBtn: React.CSSProperties = {
    position: "absolute", top: 14, right: 14,
    background: "rgba(255,255,255,0.1)", border: "none",
    borderRadius: 6, color: "#fff", fontSize: 14,
    cursor: "pointer", width: 24, height: 24,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const iconWrap: React.CSSProperties = { textAlign: "center", marginBottom: 10 };
  const title: React.CSSProperties    = { fontSize: 17, fontWeight: 700, color: "#fff", textAlign: "center", margin: "0 0 8px" };
  const desc: React.CSSProperties     = { fontSize: 12, color: "#cbd5e1", textAlign: "center", lineHeight: 1.5, marginBottom: 14 };
  const btnRow: React.CSSProperties   = { display: "flex", gap: 10 };
  const primaryBtn                    = (bg = "linear-gradient(135deg,#3b82f6,#2563eb)"): React.CSSProperties => ({
    flex: 1, padding: "10px 0", background: bg, border: "none",
    borderRadius: 40, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13,
  });
  const secondaryBtn: React.CSSProperties = {
    flex: 1, padding: "10px 0", background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 40,
    color: "#fff", cursor: "pointer", fontWeight: 500, fontSize: 13,
  };
  const pillsRow = (items: string[], color: string) => (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, justifyContent: "center", marginBottom: 14 }}>
      {items.map(t => (
        <span key={t} style={{ background: `${color}18`, border: `1px solid ${color}30`, padding: "3px 10px", borderRadius: 20, fontSize: 10, color }}>{t}</span>
      ))}
    </div>
  );

  // ── try-tools ───────────────────────────────────────────────
  if (type === "try-tools") return (
    <>
      <div style={overlay} onClick={handleClose} />
      <div style={card} onClick={e => e.stopPropagation()}>
        <TimerBar running={isOpen} onExpire={handleClose} />
        <button style={closeBtn} onClick={handleClose}>✕</button>
        <div style={iconWrap}><span style={{ fontSize: 36 }}>🛠️</span></div>
        <h3 style={title}>Want Even Better Signal?</h3>
        <p style={desc}>Use the <strong style={{ color: "#38bdf8" }}>Live Ping Scanner</strong> to walk around and find your strongest Wi-Fi spot — get real-time ping feedback!</p>
        {pillsRow(["📡 Live ping meter", "🎯 Best spot finder", "📳 Vibration alerts"], "#38bdf8")}
        <div style={btnRow}>
          <button style={primaryBtn("linear-gradient(135deg,#0ea5e9,#0284c7)")} onClick={() => handleAction("open-ping-scanner")}>🔍 Open Ping Scanner</button>
          <button style={secondaryBtn} onClick={handleClose}>Later</button>
        </div>
      </div>
    </>
  );

  // ── high-latency ────────────────────────────────────────────
  if (type === "high-latency" && data?.ping && data.ping > 100) {
    const veryHigh = data.ping > 200;
    return (
      <>
        <div style={overlay} onClick={handleClose} />
        <div style={card} onClick={e => e.stopPropagation()}>
          <TimerBar running={isOpen} onExpire={handleClose} />
          <button style={closeBtn} onClick={handleClose}>✕</button>
          <div style={iconWrap}><span style={{ fontSize: 36 }}>🚦</span></div>
          <h3 style={title}>{veryHigh ? "High Latency Detected!" : "Connection Slowing You Down?"}</h3>
          <p style={desc}>
            Your ping is <strong style={{ color: "#ef4444" }}>{Math.round(data.ping)}ms</strong>.
            {" "}{veryHigh ? "This causes lag in gaming and video calls." : "This could affect gaming and streaming."}
          </p>
          <div style={{ background: "rgba(59,130,246,0.12)", borderRadius: 10, padding: "8px 12px", marginBottom: 14, display: "flex", gap: 8, alignItems: "center", borderLeft: "3px solid #3b82f6" }}>
            <span>💡</span>
            <span style={{ fontSize: 11, color: "#93c5fd" }}>Try finding a spot with better signal!</span>
          </div>
          <div style={btnRow}>
            <button style={primaryBtn()} onClick={() => handleAction("open-ping-scanner")}>📡 Find Better Spot</button>
            <button style={secondaryBtn} onClick={handleClose}>Ignore</button>
          </div>
          <p style={{ fontSize: 9, color: "#475569", textAlign: "center", margin: "10px 0 0" }}>Find this anytime: Network Details → Ping Scanner</p>
        </div>
      </>
    );
  }

  // ── history ─────────────────────────────────────────────────
  if (type === "history" && data?.testCount && data.testCount >= 3) return (
    <>
      <div style={overlay} onClick={handleClose} />
      <div style={card} onClick={e => e.stopPropagation()}>
        <TimerBar running={isOpen} onExpire={handleClose} />
        <button style={closeBtn} onClick={handleClose}>✕</button>
        <div style={iconWrap}><span style={{ fontSize: 36 }}>📊</span></div>
        <h3 style={title}>Your Internet Story</h3>
        <p style={desc}>You've completed <strong style={{ color: "#10b981" }}>{data.testCount} tests</strong>! See how your connection performs over time.</p>
        <div style={btnRow}>
          <button style={primaryBtn()} onClick={() => handleAction("view-history")}>📈 View Trends</button>
          <button style={secondaryBtn} onClick={handleClose}>Later</button>
        </div>
      </div>
    </>
  );

  // ── feature-highlight ───────────────────────────────────────
  if (type === "feature-highlight") {
    const name = data?.featureName || "Live Ping Scanner";
    const isPing = name === "Live Ping Scanner";
    return (
      <>
        <div style={overlay} onClick={handleClose} />
        <div style={card} onClick={e => e.stopPropagation()}>
          <TimerBar running={isOpen} onExpire={handleClose} />
          <button style={closeBtn} onClick={handleClose}>✕</button>
          <div style={iconWrap}><span style={{ fontSize: 36 }}>{isPing ? "📡" : "🎉"}</span></div>
          <h3 style={title}>New Feature: {name}</h3>
          <p style={desc}>{isPing ? "Walk around while watching ping drop in real-time. Find the best gaming spot!" : "New tools to help get the most from your connection!"}</p>
          <div style={btnRow}>
            <button style={primaryBtn()} onClick={() => handleAction(isPing ? "open-ping-scanner" : "explore-feature")}>🚀 Try Now</button>
            <button style={secondaryBtn} onClick={handleClose}>Later</button>
          </div>
        </div>
      </>
    );
  }

  // ── achievement ─────────────────────────────────────────────
  if (type === "achievement") return (
    <>
      <div style={overlay} onClick={handleClose} />
      <div style={card} onClick={e => e.stopPropagation()}>
        <TimerBar running={isOpen} onExpire={handleClose} />
        <button style={closeBtn} onClick={handleClose}>✕</button>
        <div style={iconWrap}><span style={{ fontSize: 36 }}>🏆</span></div>
        <h3 style={title}>Achievement Unlocked!</h3>
        <p style={desc}>{data?.achievementName || "You're getting better at this!"}</p>
        <div style={btnRow}>
          <button style={primaryBtn()} onClick={() => handleAction("continue")}>🎉 Awesome!</button>
        </div>
      </div>
    </>
  );

  return null;
}