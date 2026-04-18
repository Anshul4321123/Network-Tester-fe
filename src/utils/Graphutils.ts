// graphUtils.ts - Shared constants and helper functions for ping graph components

export const PING_COLORS = {
  excellent: "#10b981", // < 30ms
  good: "#f59e0b",      // 30-80ms
  poor: "#ef4444",      // > 80ms
};

export function getPingColor(ping: number): string {
  if (ping < 30) return PING_COLORS.excellent;
  if (ping < 80) return PING_COLORS.good;
  return PING_COLORS.poor;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getTimeOffset(timestamp: number, startTime: number): string {
  const diff = timestamp - startTime;
  const seconds = Math.floor(diff / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Build deduplicated X-axis labels for a set of timestamps.
 * Falls back to "#N" index labels when timestamps resolve to the same
 * second offset (common when pings arrive in the same batch).
 */
export function buildXLabels(pingTimes: number[]): string[] {
  if (pingTimes.length === 0) return [];
  const startTime = pingTimes[0];
  const raw = pingTimes.map((t) => getTimeOffset(t, startTime));

  // Check if all labels are unique — if not, use "#N" index labels
  const unique = new Set(raw);
  if (unique.size === pingTimes.length) return raw;

  // Hybrid: keep the time string but append index to guarantee uniqueness,
  // or simply use sequential index labels which are always clean
  return pingTimes.map((_, i) => `#${i + 1}`);
}

/**
 * Compute SVG (x, y) for a ping data point.
 * The chart area is a rect from (0,0) to (chartWidth, chartHeight).
 * Points are clamped inside [0, chartHeight].
 */
export function computePoint(
  index: number,
  ping: number,
  total: number,
  chartWidth: number,
  chartHeight: number,
  minPing: number,
  maxPing: number
): { x: number; y: number } {
  const range = maxPing - minPing || 1;
  const x = total <= 1 ? chartWidth / 2 : (index / (total - 1)) * chartWidth;
  // y=0 is TOP of chart, y=chartHeight is BOTTOM
  const y = chartHeight - ((ping - minPing) / range) * chartHeight;
  return { x, y: Math.max(0, Math.min(chartHeight, y)) };
}

export function buildPolylinePoints(
  pings: number[],
  chartWidth: number,
  chartHeight: number,
  minPing: number,
  maxPing: number
): string {
  return pings
    .map((ping, idx) =>
      computePoint(idx, ping, pings.length, chartWidth, chartHeight, minPing, maxPing)
    )
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");
}

export function buildAreaPoints(
  pings: number[],
  chartWidth: number,
  chartHeight: number,
  minPing: number,
  maxPing: number
): string {
  const linePoints = pings.map((ping, idx) =>
    computePoint(idx, ping, pings.length, chartWidth, chartHeight, minPing, maxPing)
  );
  const first = linePoints[0];
  const last = linePoints[linePoints.length - 1];
  return [
    `${first.x},${chartHeight}`,
    ...linePoints.map(({ x, y }) => `${x},${y}`),
    `${last.x},${chartHeight}`,
  ].join(" ");
}

export function computeYTicks(minPing: number, maxPing: number, count = 5): number[] {
  return Array.from({ length: count + 1 }, (_, i) =>
    Math.round(minPing + ((maxPing - minPing) * i) / count)
  );
}