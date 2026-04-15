// utils/hero.utils.ts
export const formatSpeed = (value: number | null) => {
  if (!value) return "--";
  if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
  return `${value.toFixed(1)} Mbps`;
};

export const isMetricLoading = (metricName: string, phase: string, running: boolean) => {
  if (!running && phase !== "ping" && phase !== "download" && phase !== "upload") return false;
  if (metricName === "ping" && phase === "ping") return true;
  if (metricName === "download" && phase === "download") return true;
  if (metricName === "upload" && phase === "upload") return true;
  return false;
};

export const getScoreMessage = (score: number) => {
  if (score > 80) return "Excellent connection 🚀";
  if (score > 50) return "Good connection 👍";
  return "Needs improvement ⚠️";
};

// Get metric description based on value
export const getMetricDescription = (metric: string, value: number | null): string => {
  if (value === null) return "";
  
  switch (metric) {
    case "ping":
      if (value < 20) return "Excellent latency 🚀";
      if (value < 50) return "Good latency 👍";
      if (value < 100) return "Average latency 📡";
      return "High latency ⚠️";
    case "jitter":
      if (value < 10) return "Very stable connection ✨";
      if (value < 30) return "Stable connection ✅";
      if (value < 50) return "Moderate jitter 📊";
      return "Unstable connection ⚠️";
    case "download":
      if (value > 100) return "Lightning fast ⚡";
      if (value > 50) return "Very good 🚀";
      if (value > 25) return "Good enough ✅";
      return "Slow connection ⚠️";
    case "upload":
      if (value > 50) return "Excellent upload 🚀";
      if (value > 20) return "Good upload 👍";
      if (value > 10) return "Adequate upload ✅";
      return "Slow upload ⚠️";
    default:
      return "";
  }
};