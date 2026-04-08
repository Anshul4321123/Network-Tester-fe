// components/Hero.tsx
import StartTestButton from "./StartTestButton";
import MetricCard from "./MetricCard";

interface HeroProps {
  score: number | null;
  ping: number | null;
  download: number | null;
  upload: number | null;
  jitter: number | null;
  phase: string;
  running: boolean;
  isTestActive: boolean;
  onRunTest: () => void;
  mode: string;
  onModeChange: (mode: "gaming" | "streaming" | "work") => void;
  testSelection: { ping: boolean; jitter: boolean; download: boolean; upload: boolean };
  showLiveGraph: boolean;
  onToggleLiveGraph: () => void;
}

export default function Hero({
  score,
  ping,
  download,
  upload,
  jitter,
  phase,
  running,
  isTestActive,
  onRunTest,
  mode,
  onModeChange,
  testSelection,
  showLiveGraph,
  onToggleLiveGraph,
}: HeroProps) {
  const formatSpeed = (value: number | null) => {
    if (!value) return "--";
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const getSpeedDescription = (value: number | null, type: "download" | "upload") => {
    if (!value) return "";
    if (value > 1000) {
      const gbps = (value / 1000).toFixed(1);
      if (type === "download") {
        if (gbps > "5") return "🚀 Blazing fast";
        if (gbps > "1") return "⚡ Extremely fast";
        return "💨 Very fast";
      } else {
        if (gbps > "1") return "📤 Perfect for cloud backups";
        if (gbps > "0.5") return "👍 Great for video calls";
        return "✅ Good for everyday";
      }
    }
    if (value > 100) {
      return type === "download" ? "🎮 Great for gaming" : "📹 Perfect for video calls";
    }
    if (value > 50) {
      return type === "download" ? "📺 Good for HD streaming" : "💬 Fine for voice calls";
    }
    if (value > 25) {
      return "📱 Suitable for basic use";
    }
    return "⚠️ May struggle";
  };

  const getScoreMessage = (score: number) => {
    if (score > 80) return "Excellent connection 🚀";
    if (score > 50) return "Good connection 👍";
    return "Needs improvement ⚠️";
  };

  const getPhaseText = () => {
    switch (phase) {
      case "ping": return "📡 Testing Ping...";
      case "download": return "⬇️ Testing Download Speed...";
      case "upload": return "⬆️ Testing Upload Speed...";
      case "analyzing": return "🔍 Analyzing Results...";
      case "complete": return "✅ Test Complete!";
      default: return "";
    }
  };

  const isMetricLoading = (metricName: string) => {
    if (!running && phase !== "ping" && phase !== "download" && phase !== "upload") return false;
    if (metricName === "ping" && phase === "ping") return true;
    if (metricName === "download" && phase === "download") return true;
    if (metricName === "upload" && phase === "upload") return true;
    return false;
  };

  const shouldShowMetric = (metricName: string) => {
    return testSelection[metricName as keyof typeof testSelection];
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: "clamp(20px, 5vw, 32px)",
        padding: "clamp(16px, 4vw, 24px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}
    >
      {/* SCORE SECTION */}
      {score !== null ? (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "clamp(32px, 8vw, 48px)",
              fontWeight: "bold",
              color: score > 80 ? "#10b981" : score > 50 ? "#f59e0b" : "#ef4444",
            }}
          >
            {isTestActive ? "Testing..." : `${score}/100`}
          </div>
          {!isTestActive && (
            <div
              style={{
                fontSize: "clamp(12px, 3vw, 14px)",
                opacity: 0.7,
                marginTop: "4px",
                color: "#475569",
              }}
            >
              {getScoreMessage(score)}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "clamp(24px, 6vw, 32px)",
              fontWeight: "bold",
              color: "#64748b",
            }}
          >
            Ready to Test
          </div>
        </div>
      )}

      {/* TESTING STATUS */}
      {isTestActive && (
        <div
          style={{
            fontSize: "clamp(14px, 3.5vw, 16px)",
            fontWeight: "500",
            marginBottom: "20px",
            color: "#3b82f6",
          }}
        >
          {getPhaseText()}
        </div>
      )}

      {/* METRICS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "clamp(10px, 3vw, 16px)",
          marginBottom: "24px",
        }}
      >
        {shouldShowMetric("ping") && (
          <MetricCard 
            label="Ping" 
            value={ping !== null ? `${ping} ms` : undefined}
            icon="📡"
            isLoading={isMetricLoading("ping")}
            description={ping ? (ping < 20 ? "🎮 Excellent for gaming" : ping < 50 ? "👍 Good for most games" : "⚠️ May cause lag") : ""}
          />
        )}
        {shouldShowMetric("jitter") && (
          <MetricCard 
            label="Jitter" 
            value={jitter !== null ? `${jitter} ms` : undefined}
            icon="⚡"
            isLoading={isMetricLoading("jitter")}
            description={jitter ? (jitter < 10 ? "✅ Very stable" : jitter < 30 ? "👍 Acceptable" : "⚠️ Unstable connection") : ""}
          />
        )}
        {shouldShowMetric("download") && (
          <MetricCard
            label="Download"
            value={download !== null ? formatSpeed(download) : undefined}
            icon="⬇️"
            isLoading={isMetricLoading("download")}
            description={download ? getSpeedDescription(download, "download") : ""}
          />
        )}
        {shouldShowMetric("upload") && (
          <MetricCard
            label="Upload"
            value={upload !== null ? formatSpeed(upload) : undefined}
            icon="⬆️"
            isLoading={isMetricLoading("upload")}
            description={upload ? getSpeedDescription(upload, "upload") : ""}
          />
        )}
      </div>

      {/* START BUTTON */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "inline-block",
            width: "100%",
            maxWidth: "280px",
            animation: running ? "pulse 1.5s infinite" : "none",
          }}
        >
          <StartTestButton onClick={onRunTest} disabled={running} />
        </div>
      </div>

      {/* Toggle Switch for Live Graphs - Android Style */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "16px",
          padding: "10px 16px",
          background: "#f1f5f9",
          borderRadius: "40px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px" }}>📈</span>
          <span style={{ fontSize: "12px", fontWeight: "500", color: "#475569" }}>
            Live Speed Graphs
          </span>
        </div>
        <div
          onClick={onToggleLiveGraph}
          style={{
            width: "48px",
            height: "26px",
            background: showLiveGraph ? "#10b981" : "#94a3b8",
            borderRadius: "26px",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.3s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              width: "22px",
              height: "22px",
              background: "white",
              borderRadius: "50%",
              position: "absolute",
              top: "2px",
              left: showLiveGraph ? "24px" : "2px",
              transition: "left 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>

      {/* MODE BUTTONS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        {["gaming", "streaming", "work"].map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m as any)}
            disabled={running}
            style={{
              padding: "6px 14px",
              background: mode === m ? "#10b981" : "#f1f5f9",
              color: mode === m ? "#fff" : "#334155",
              border: mode === m ? "none" : "1px solid #e2e8f0",
              borderRadius: "40px",
              cursor: running ? "not-allowed" : "pointer",
              fontWeight: "500",
              fontSize: "clamp(11px, 3vw, 13px)",
              transition: "all 0.2s",
              opacity: running ? 0.6 : 1,
            }}
          >
            {m === "gaming" && "🎮 Gaming"}
            {m === "streaming" && "📺 Streaming"}
            {m === "work" && "💼 Work"}
          </button>
        ))}
      </div>
    </div>
  );
}