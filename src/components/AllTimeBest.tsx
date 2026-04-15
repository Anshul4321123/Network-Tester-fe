// components/AllTimeBest.tsx
import type { BestStats } from "../utils/storage";

interface AllTimeBestProps {
  bestStats: BestStats | null;
  formatSpeed: (value: number) => string;
}

export default function AllTimeBest({ bestStats, formatSpeed }: AllTimeBestProps) {
  if (!bestStats) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        borderRadius: "14px",
        padding: "10px 14px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "6px", letterSpacing: "1px" }}>
        ALL TIME BEST
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "9px", color: "#94a3b8", marginBottom: "2px" }}>⚡ DOWNLOAD</div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}>
            {formatSpeed(bestStats.bestDownload)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "9px", color: "#94a3b8", marginBottom: "2px" }}>🚀 UPLOAD</div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}>
            {formatSpeed(bestStats.bestUpload)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "9px", color: "#94a3b8", marginBottom: "2px" }}>📡 PING</div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}>
            {bestStats.bestPing.toFixed(2)} ms
          </div>
        </div>
      </div>
    </div>
  );
}