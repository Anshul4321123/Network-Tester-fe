// components/MiniGraph.tsx
import { useState } from "react";
import {
  getPingColor,
  formatTime,
  buildPolylinePoints,
  buildAreaPoints,
  computePoint,
} from "../utils/Graphutils";

const CHART_H = 90;

interface Props {
  pings: number[];
  pingTimes: number[];
   slotIndices: number[];
  intervalMs: number;
  onExpand: () => void;
  onPointClick: (index: number, value: number, time: string) => void;
}

export default function MiniGraph({ pings, pingTimes,slotIndices, intervalMs, onExpand, onPointClick }: Props) {
    void slotIndices;
  void intervalMs;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (pings.length === 0) return null;

  const maxPing    = Math.max(...pings, 100);
  const minPing    = Math.min(...pings, 0);
  // SVG viewBox width — fixed so it always fills container
  const chartWidth = 500;

  const linePoints = buildPolylinePoints(pings, chartWidth, CHART_H, minPing, maxPing);
  const areaPoints = buildAreaPoints(pings, chartWidth, CHART_H, minPing, maxPing);

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Header row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
      }}>
        <span style={{ fontSize: 9, color: "#94a3b8" }}>📊 Ping History (lower is better)</span>
        <button
          onClick={onExpand}
          style={{
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 10,
            color: "#60a5fa",
            cursor: "pointer",
          }}
        >
          🔍 Expand
        </button>
      </div>

      {/* Chart */}
      <div
        onClick={onExpand}
        style={{
          background: "rgba(0,0,0,0.25)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.07)",
          padding: "10px 10px 8px",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${CHART_H}`}
          width="100%"
          height={CHART_H}
          preserveAspectRatio="none"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}   />
            </linearGradient>
            <clipPath id="miniClip">
              <rect x={0} y={0} width={chartWidth} height={CHART_H} />
            </clipPath>
          </defs>

          {/* Area + line — clipped */}
          <g clipPath="url(#miniClip)">
            <polygon points={areaPoints} fill="url(#miniGrad)" />
            <polyline
              points={linePoints}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Dots — NOT clipped so hover circle doesn't get cut */}
          {pings.map((ping, idx) => {
            const { x, y } = computePoint(idx, ping, pings.length, chartWidth, CHART_H, minPing, maxPing);
            const isHov    = hoveredIdx === idx;
            const color    = getPingColor(ping);
            const pingT    = pingTimes[idx] ?? Date.now();

            return (
              <circle
                key={idx}
                cx={x} cy={y}
                r={isHov ? 6 : 4}
                fill={color}
                stroke="#fff"
                strokeWidth={isHov ? 2 : 1}
                style={{ cursor: "pointer", transition: "r 0.15s" }}
                onMouseEnter={(e) => { e.stopPropagation(); setHoveredIdx(idx); }}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onPointClick(idx, ping, formatTime(pingT));
                }}
              />
            );
          })}
        </svg>
      </div>

      <div style={{ fontSize: 8, color: "#475569", textAlign: "center", marginTop: 5 }}>
        💡 Click to expand · Hover dots for details · Lower = better
      </div>
    </div>
  );
}