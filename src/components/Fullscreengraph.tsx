// components/FullScreenGraph.tsx
import { useState, useRef, useEffect } from "react";
import {
  getPingColor,
  formatTime,
  computePoint,
  buildPolylinePoints,
  buildAreaPoints,
  computeYTicks,
  buildXLabels,
} from "../utils/Graphutils";

const PAD_LEFT   = 56;  // Y-axis labels
const PAD_RIGHT  = 24;
const PAD_TOP    = 24;
const PAD_BOTTOM = 56;  // X-axis labels + title
const DOT_R      = 6;
const MIN_PT_SPACING = 48;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pings: number[];
  pingTimes: number[];
  onPointClick: (index: number, value: number, time: string) => void;
}

export default function FullScreenGraph({ isOpen, onClose, pings, pingTimes, onPointClick }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef                = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(800);
  const [containerH, setContainerH] = useState(400);

  useEffect(() => {
    if (!isOpen) return;
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      setContainerW(el.clientWidth);
      setContainerH(el.clientHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  if (!isOpen || pings.length === 0) return null;

  // ── Y-axis: scale tightly to actual data with ~30% headroom above, min range 5ms ──
  const actualMax  = Math.max(...pings);
  const actualMin  = Math.min(...pings);
  const dataRange  = actualMax - actualMin;
  // Add 30% headroom above the max, rounded up to a nice number
  const headroom   = Math.max(dataRange * 0.3, 3);
  const yMax       = Math.ceil(actualMax + headroom);
  // Bottom: floor to 0 or just below actual min, whichever looks cleaner
  const yMin       = actualMin <= 5 ? 0 : Math.floor(actualMin - headroom * 0.5);

  const yTicks  = computeYTicks(yMin, yMax);
  const xLabels = buildXLabels(pingTimes);

  // ── Chart dimensions ──
  // chartHeight fills the available vertical space minus padding
  const availableH  = Math.max(containerH - 40, 200); // 40 = container's own padding
  const chartHeight = availableH - PAD_TOP - PAD_BOTTOM;

  // chartWidth fills available horizontal space; scrolls if too many points
  const availableW  = containerW - PAD_LEFT - PAD_RIGHT - 40;
  const chartWidth  = Math.max(availableW, pings.length * MIN_PT_SPACING);

  const svgW = chartWidth + PAD_LEFT + PAD_RIGHT;
  const svgH = chartHeight + PAD_TOP  + PAD_BOTTOM;

  const linePoints = buildPolylinePoints(pings, chartWidth, chartHeight, yMin, yMax);
  const areaPoints = buildAreaPoints(pings, chartWidth, chartHeight, yMin, yMax);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", zIndex: 10000 }} />

      {/* Modal */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: 24,
          width: "calc(100% - 32px)", maxWidth: 1200,
          height: "calc(100% - 80px)", maxHeight: 680,
          zIndex: 10001,
          display: "flex", flexDirection: "column",
          boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.1)",
          animation: "modalSlideUp 0.3s ease",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>📊 Ping History — Detailed View</h3>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0" }}>
              {pings.length} measurements · range {Math.round(actualMin)}–{Math.round(actualMax)}ms · lower = better
            </p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "#fff", fontSize: 20, cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* ── Scrollable graph area — flex + align-items:center so SVG is vertically centred ── */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflowX: "auto",
            overflowY: "hidden",
            padding: "20px",
            display: "flex",
            alignItems: "center",   // vertical centre
            justifyContent: "flex-start",
          }}
        >
          <svg
            width={svgW}
            height={svgH}
            style={{ display: "block", fontFamily: "monospace", overflow: "visible", flexShrink: 0 }}
          >
            <defs>
              <clipPath id="chartClip">
                <rect x={PAD_LEFT} y={PAD_TOP} width={chartWidth} height={chartHeight} />
              </clipPath>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* ── Y-axis title (rotated, left of labels) ── */}
            <text
              x={12} y={PAD_TOP + chartHeight / 2}
              textAnchor="middle" fill="#64748b" fontSize={10}
              transform={`rotate(-90, 12, ${PAD_TOP + chartHeight / 2})`}
            >
              Ping (ms)
            </text>

            {/* ── X-axis title (centred below the chart) ── */}
            <text
              x={PAD_LEFT + chartWidth / 2}
              y={svgH - 4}
              textAnchor="middle" fill="#64748b" fontSize={10}
            >
              Test #
            </text>

            {/* ── Grid lines + Y-axis labels ── */}
            {yTicks.map((tick, i) => {
              const range = yMax - yMin || 1;
              const rawY  = chartHeight - ((tick - yMin) / range) * chartHeight;
              const y     = PAD_TOP + Math.max(0, Math.min(chartHeight, rawY));
              return (
                <g key={i}>
                  <line
                    x1={PAD_LEFT} y1={y} x2={PAD_LEFT + chartWidth} y2={y}
                    stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="4 4"
                  />
                  <text x={PAD_LEFT - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize={10}>
                    {tick}ms
                  </text>
                </g>
              );
            })}

            {/* ── Chart border box ── */}
            <rect
              x={PAD_LEFT} y={PAD_TOP} width={chartWidth} height={chartHeight}
              fill="rgba(0,0,0,0.12)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} rx={4}
            />

            {/* ── Area + line (clipped) ── */}
            <g clipPath="url(#chartClip)">
              <g transform={`translate(${PAD_LEFT}, ${PAD_TOP})`}>
                <polygon points={areaPoints} fill="url(#areaGrad)" />
                <polyline
                  points={linePoints}
                  fill="none" stroke="#3b82f6" strokeWidth={2.5}
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </g>
            </g>

            {/* ── Dots + tooltips + X-axis labels (not clipped) ── */}
            <g transform={`translate(${PAD_LEFT}, ${PAD_TOP})`}>
              {pings.map((ping, idx) => {
                const { x, y } = computePoint(idx, ping, pings.length, chartWidth, chartHeight, yMin, yMax);
                const isHov    = hoveredIdx === idx;
                const color    = getPingColor(ping);
                const pingT    = pingTimes[idx] ?? Date.now();
                const label    = xLabels[idx] ?? `#${idx + 1}`;

                return (
                  <g key={idx}>
                    {/* X-axis tick label */}
                    <text
                      x={x} y={chartHeight + 14}
                      textAnchor="end" fill="#475569" fontSize={9}
                      transform={`rotate(-40, ${x}, ${chartHeight + 14})`}
                    >
                      {label}
                    </text>

                    {/* Crosshair on hover */}
                    {isHov && (
                      <line x1={x} y1={y} x2={x} y2={chartHeight} stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
                    )}

                    {/* Dot */}
                    <circle
                      cx={x} cy={y}
                      r={isHov ? DOT_R * 1.6 : DOT_R}
                      fill={color} stroke="#fff" strokeWidth={isHov ? 2 : 1.5}
                      style={{ cursor: "pointer", transition: "r 0.15s" }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      onClick={() => onPointClick(idx, ping, formatTime(pingT))}
                    />

                    {/* Value badge — always for high pings, on hover for others */}
                    {(isHov || ping > actualMax * 0.85) && (
                      <g>
                        <rect x={x - 22} y={y - 30} width={44} height={18} rx={4} fill="rgba(15,23,42,0.92)" stroke={color} strokeWidth={1} />
                        <text x={x} y={y - 17} textAnchor="middle" fill={color} fontSize={10} fontWeight={700}>
                          {Math.round(ping)}ms
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* ── Footer legend ── */}
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