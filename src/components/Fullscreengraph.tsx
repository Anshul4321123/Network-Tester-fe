// components/FullScreenGraph.tsx
import { useState, useRef, useEffect, useMemo } from "react";
import {
  getPingColor,
  formatTime,
  computeYTicks,
  buildXLabels,
  buildSlotLabels,
  buildChartPaths,
  computeYBounds,
} from "../utils/Graphutils";

const PAD_LEFT       = 56;
const PAD_RIGHT      = 24;
const PAD_TOP        = 24;
const PAD_BOTTOM     = 56;
const DOT_R          = 6;
const MIN_PT_SPACING = 48;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pings: number[];
  pingTimes: number[];
  slotIndices?: number[];  // if provided, labels use slot×interval math (jitter-free)
  intervalMs?: number;     // ms between slots, required when slotIndices is provided
  onPointClick: (index: number, value: number, time: string) => void;
}

export default function FullScreenGraph({ isOpen, onClose, pings, pingTimes, slotIndices, intervalMs = 2000, onPointClick }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef                = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(800);
  const [containerH, setContainerH] = useState(400);

  // Measure container once on open, then track resizes
  useEffect(() => {
    if (!isOpen) return;
    const el = containerRef.current;
    if (!el) return;
    const measure = () => { setContainerW(el.clientWidth); setContainerH(el.clientHeight); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  // ── All expensive derivations memoized — only recompute when data or size changes ──

  const { yMin, yMax } = useMemo(() => computeYBounds(pings), [pings]);

  const yTicks = useMemo(() => computeYTicks(yMin, yMax), [yMin, yMax]);

  // X labels only depend on pingTimes, not on hover state
  // Use slot-based labels (jitter-free) when slot metadata is available.
  // buildSlotLabels uses slotIndex×interval math — labels are always "0s, 2s, 4s..."
  // regardless of how long each measurement actually took.
  // Falls back to timestamp-based labels for backwards compatibility.
  const xLabels = useMemo(
    () =>
      slotIndices && slotIndices.length === pings.length
        ? buildSlotLabels(slotIndices, intervalMs)
        : buildXLabels(pingTimes),
    [slotIndices, intervalMs, pings.length, pingTimes],
  );

  const chartHeight = useMemo(() => {
    const availH = Math.max(containerH - 40, 200);
    return availH - PAD_TOP - PAD_BOTTOM;
  }, [containerH]);

  const chartWidth = useMemo(() => {
    const availW = containerW - PAD_LEFT - PAD_RIGHT - 40;
    return Math.max(availW, pings.length * MIN_PT_SPACING);
  }, [containerW, pings.length]);

  // Single-pass: compute all (x,y) points + both SVG path strings at once
  const { points, linePoints, areaPoints } = useMemo(
    () => buildChartPaths(pings, chartWidth, chartHeight, yMin, yMax),
    [pings, chartWidth, chartHeight, yMin, yMax],
  );

  // Y-axis grid line positions — only depend on ticks + chart dimensions
  const gridLines = useMemo(() => {
    const range = yMax - yMin || 1;
    return yTicks.map((tick) => {
      const rawY = chartHeight - ((tick - yMin) / range) * chartHeight;
      return { tick, y: PAD_TOP + Math.max(0, Math.min(chartHeight, rawY)) };
    });
  }, [yTicks, yMin, yMax, chartHeight]);

  const svgW = chartWidth + PAD_LEFT + PAD_RIGHT;
  const svgH = chartHeight + PAD_TOP  + PAD_BOTTOM;

  const actualMin = pings.length ? Math.min(...pings) : 0;
  const actualMax = pings.length ? Math.max(...pings) : 0;

  if (!isOpen || pings.length === 0) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", zIndex: 10000 }} />
      <div
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: 24, width: "calc(100% - 32px)", maxWidth: 1200, height: "calc(100% - 80px)", maxHeight: 680, zIndex: 10001, display: "flex", flexDirection: "column", boxShadow: "0 25px 50px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", animation: "modalSlideUp 0.3s ease", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>📊 Ping History — Detailed View</h3>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0" }}>
              {pings.length} measurements · range {Math.round(actualMin)}–{Math.round(actualMax)}ms · lower = better
            </p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "#fff", fontSize: 20, cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Scrollable graph — flex centering */}
        <div
          ref={containerRef}
          style={{ flex: 1, overflowX: "auto", overflowY: "hidden", padding: "20px", display: "flex", alignItems: "center", justifyContent: "flex-start" }}
        >
          <svg width={svgW} height={svgH} style={{ display: "block", fontFamily: "monospace", overflow: "visible", flexShrink: 0 }}>
            <defs>
              <clipPath id="chartClip">
                <rect x={PAD_LEFT} y={PAD_TOP} width={chartWidth} height={chartHeight} />
              </clipPath>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* Y-axis title */}
            <text x={12} y={PAD_TOP + chartHeight / 2} textAnchor="middle" fill="#64748b" fontSize={10} transform={`rotate(-90, 12, ${PAD_TOP + chartHeight / 2})`}>Ping (ms)</text>

            {/* X-axis title */}
            <text x={PAD_LEFT + chartWidth / 2} y={svgH - 4} textAnchor="middle" fill="#64748b" fontSize={10}>Test #</text>

            {/* Grid lines + Y labels — pre-computed, no inline math */}
            {gridLines.map(({ tick, y }) => (
              <g key={tick}>
                <line x1={PAD_LEFT} y1={y} x2={PAD_LEFT + chartWidth} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="4 4" />
                <text x={PAD_LEFT - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize={10}>{tick}ms</text>
              </g>
            ))}

            {/* Chart border */}
            <rect x={PAD_LEFT} y={PAD_TOP} width={chartWidth} height={chartHeight} fill="rgba(0,0,0,0.12)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} rx={4} />

            {/* Area + line — clipped, no recalculation on hover */}
            <g clipPath="url(#chartClip)">
              <g transform={`translate(${PAD_LEFT}, ${PAD_TOP})`}>
                <polygon points={areaPoints} fill="url(#areaGrad)" />
                <polyline points={linePoints} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>

            {/* Dots + labels — use pre-computed points[], no computePoint() calls here */}
            <g transform={`translate(${PAD_LEFT}, ${PAD_TOP})`}>
              {points.map(({ x, y }, idx) => {
                const ping   = pings[idx];
                const isHov  = hoveredIdx === idx;
                const color  = getPingColor(ping);
                const pingT  = pingTimes[idx] ?? Date.now();
                const label  = xLabels[idx] ?? `#${idx + 1}`;
                return (
                  <g key={idx}>
                    <text x={x} y={chartHeight + 14} textAnchor="end" fill="#475569" fontSize={9} transform={`rotate(-40, ${x}, ${chartHeight + 14})`}>{label}</text>
                    {isHov && <line x1={x} y1={y} x2={x} y2={chartHeight} stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />}
                    <circle
                      cx={x} cy={y}
                      r={isHov ? DOT_R * 1.6 : DOT_R}
                      fill={color} stroke="#fff" strokeWidth={isHov ? 2 : 1.5}
                      style={{ cursor: "pointer", transition: "r 0.15s" }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      onClick={() => onPointClick(idx, ping, formatTime(pingT))}
                    />
                    {(isHov || ping > actualMax * 0.85) && (
                      <g>
                        <rect x={x - 22} y={y - 30} width={44} height={18} rx={4} fill="rgba(15,23,42,0.92)" stroke={color} strokeWidth={1} />
                        <text x={x} y={y - 17} textAnchor="middle" fill={color} fontSize={10} fontWeight={700}>{Math.round(ping)}ms</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", fontSize: 10, color: "#64748b", flexShrink: 0 }}>
          <span>🟢 &lt;30ms — Excellent</span>
          <span>🟡 30–80ms — Good</span>
          <span>🔴 &gt;80ms — Poor</span>
          <span>💡 Click any dot for details</span>
        </div>
      </div>
    </>
  );
}