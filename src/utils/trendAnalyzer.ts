export type TrendType =
  | "faster"
  | "slower"
  | "stable"
  | "insufficient";

export function analyzeTrend(
  downloads: number[]
): TrendType {

  if (downloads.length < 5) return "insufficient";

  const latest = downloads[0];
  const last5 = downloads.slice(1, 6);

  const avg =
    last5.reduce((a, b) => a + b, 0) / last5.length;

  if (latest > avg * 1.2) return "faster";
  if (latest < avg * 0.7) return "slower";

  return "stable";
}