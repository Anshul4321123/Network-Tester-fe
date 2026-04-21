// graphUtils.ts

export const PING_COLORS = {
  excellent: "#10b981",
  good:      "#f59e0b",
  poor:      "#ef4444",
};

export function getPingColor(ping: number): string {
  if (ping < 30) return PING_COLORS.excellent;
  if (ping < 80) return PING_COLORS.good;
  return PING_COLORS.poor;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export function getTimeOffset(timestamp: number, startTime: number): string {
  const diff    = timestamp - startTime;
  const seconds = Math.floor(diff / 1000);
  const mins    = Math.floor(seconds / 60);
  const secs    = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

/**
 * Build deduplicated X-axis labels.
 * Falls back to "#N" index labels when timestamps share the same second.
 */
export function buildXLabels(pingTimes: number[]): string[] {
  if (pingTimes.length === 0) return [];
  const startTime = pingTimes[0];
  const raw = pingTimes.map((t) => getTimeOffset(t, startTime));
  const unique = new Set(raw);
  if (unique.size === pingTimes.length) return raw;
  return pingTimes.map((_, i) => `#${i + 1}`);
}

/**
 * Build perfectly-spaced X-axis labels from slot metadata.
 * Uses (slotIndex × interval) as the label time — zero network-jitter contamination.
 * Labels are formatted as "2s", "4s", "6s"… with "Start" for slot 0.
 *
 * @param slotIndices  - array of 0-based slot numbers for each recorded ping
 * @param intervalMs   - ms between slots (e.g. 2000 for 2s interval)
 */
export function buildSlotLabels(slotIndices: number[], intervalMs: number): string[] {
  return slotIndices.map(i => {
    const ms   = i * intervalMs;
    const secs = Math.round(ms / 1000);
    if (secs === 0) return "Start";
    const mins = Math.floor(secs / 60);
    const s    = secs % 60;
    return mins > 0 ? `${mins}m${s > 0 ? ` ${s}s` : ""}` : `${secs}s`;
  });
}

/** Compute (x, y) for one data point inside a chart area of size (chartWidth × chartHeight). */
export function computePoint(
  index: number,
  ping: number,
  total: number,
  chartWidth: number,
  chartHeight: number,
  minPing: number,
  maxPing: number,
): { x: number; y: number } {
  const range = maxPing - minPing || 1;
  const x = total <= 1 ? chartWidth / 2 : (index / (total - 1)) * chartWidth;
  const y = chartHeight - ((ping - minPing) / range) * chartHeight;
  return { x, y: Math.max(0, Math.min(chartHeight, y)) };
}

/**
 * Compute ALL point coordinates once, then derive both the polyline
 * string and the area polygon string from the same array.
 * This avoids iterating the ping array three times (once in buildPolylinePoints,
 * twice in buildAreaPoints).
 */
export function buildChartPaths(
  pings: number[],
  chartWidth: number,
  chartHeight: number,
  minPing: number,
  maxPing: number,
): {
  points: { x: number; y: number }[];
  linePoints: string;   // for <polyline points=…>
  areaPoints: string;   // for <polygon points=…>
} {
  if (pings.length === 0) return { points: [], linePoints: "", areaPoints: "" };

  // Single pass — compute all (x, y) coordinates
  const points = pings.map((ping, idx) =>
    computePoint(idx, ping, pings.length, chartWidth, chartHeight, minPing, maxPing),
  );

  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(" ");

  const first = points[0];
  const last  = points[points.length - 1];
  const areaPoints = [
    `${first.x},${chartHeight}`,
    linePoints,
    `${last.x},${chartHeight}`,
  ].join(" ");

  return { points, linePoints, areaPoints };
}

// Keep as thin wrappers for any callers that use the old API
export function buildPolylinePoints(
  pings: number[], chartWidth: number, chartHeight: number, minPing: number, maxPing: number,
): string {
  return buildChartPaths(pings, chartWidth, chartHeight, minPing, maxPing).linePoints;
}

export function buildAreaPoints(
  pings: number[], chartWidth: number, chartHeight: number, minPing: number, maxPing: number,
): string {
  return buildChartPaths(pings, chartWidth, chartHeight, minPing, maxPing).areaPoints;
}

export function computeYTicks(minPing: number, maxPing: number, count = 5): number[] {
  return Array.from({ length: count + 1 }, (_, i) =>
    Math.round(minPing + ((maxPing - minPing) * i) / count),
  );
}

/**
 * Derive tight Y-axis bounds from actual ping data.
 * Adds ~30% headroom above the max and a small buffer below the min.
 */
export function computeYBounds(pings: number[]): { yMin: number; yMax: number } {
  if (pings.length === 0) return { yMin: 0, yMax: 100 };
  const actualMax = Math.max(...pings);
  const actualMin = Math.min(...pings);
  const range     = actualMax - actualMin;
  const headroom  = Math.max(range * 0.3, 3);
  const yMax      = Math.ceil(actualMax + headroom);
  const yMin      = actualMin <= 5 ? 0 : Math.floor(actualMin - headroom * 0.5);
  return { yMin, yMax };
}