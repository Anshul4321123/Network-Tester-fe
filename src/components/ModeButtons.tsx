// components/ModeButtons.tsx
interface ModeButtonsProps {
  mode: string;
  running: boolean;
  onModeChange: (mode: "gaming" | "streaming" | "work") => void;
}

const MODES = [
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "streaming", label: "Streaming", icon: "📺" },
  { id: "work", label: "Work", icon: "💼" },
] as const;

export default function ModeButtons({ mode, running, onModeChange }: ModeButtonsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        justifyContent: "center",
      }}
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          disabled={running}
          style={{
            padding: "6px 14px",
            background: mode === m.id ? "#10b981" : "#f1f5f9",
            color: mode === m.id ? "#fff" : "#334155",
            border: mode === m.id ? "none" : "1px solid #e2e8f0",
            borderRadius: "40px",
            cursor: running ? "not-allowed" : "pointer",
            fontWeight: "500",
            fontSize: "clamp(11px, 2.5vw, 13px)",
            transition: "all 0.2s",
            opacity: running ? 0.6 : 1,
          }}
        >
          {m.icon} {m.label}
        </button>
      ))}
    </div>
  );
}