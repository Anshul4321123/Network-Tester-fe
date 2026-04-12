// utils/smartInsightEngine.ts - Complete with proper interface
export interface TestMetrics {
  ping: number | null;
  download: number | null;
  upload: number | null;
  jitter: number | null;
  bufferbloat: number | null;
  networkType: string;
  score: number | null;
}

export interface SmartInsight {
  message: string;
  type: "success" | "warning" | "error" | "info";
  icon: string;
  action?: string;
  detail?: string;
  percentile?: number;
}

// Calculate what percentile the user is in (estimated)
export function calculatePercentile(download: number | null): number {
  if (!download) return 50;
  // Rough estimates based on global averages
  if (download >= 500) return 98;
  if (download >= 250) return 95;
  if (download >= 100) return 88;
  if (download >= 50) return 75;
  if (download >= 25) return 55;
  if (download >= 10) return 35;
  if (download >= 5) return 20;
  return 10;
}

export function generateSmartInsight(metrics: TestMetrics): SmartInsight {
  const { ping, download, upload, jitter, bufferbloat, networkType, score } = metrics;
  const percentile = calculatePercentile(download);

  if (!ping || !download || !upload) {
    return {
      message: "Run a speed test to see how your internet compares",
      type: "info",
      icon: "💡",
      percentile: 50,
    };
  }

  // Contradiction handler (Fast speed + High latency)
  if (download > 100 && ping > 150) {
    return {
      message: "⚠️ Fast speeds but high latency — great for streaming, not for gaming",
      type: "warning",
      icon: "🎬",
      detail: "Your download is excellent for 4K, but the delay will affect competitive games",
      percentile,
    };
  }

  if (download > 50 && ping > 100) {
    return {
      message: "📡 Good speed with noticeable delay — streaming works well, gaming may lag",
      type: "warning",
      icon: "📺",
      detail: "Consider wired connection or closer server for better response times",
      percentile,
    };
  }

  // Priority 1: Bufferbloat
  if (bufferbloat && bufferbloat > 100) {
    return {
      message: "🚦 Network congestion detected — your router is struggling under load",
      type: "error",
      icon: "⚠️",
      detail: "Try Ethernet or enable QoS in your router settings",
      percentile,
    };
  }

  if (bufferbloat && bufferbloat > 50) {
    return {
      message: "📡 Your connection slows down under load — may affect gaming and calls",
      type: "warning",
      icon: "⚠️",
      detail: "Upgrading your router or using wired connection can help",
      percentile,
    };
  }

  // Priority 2: ISP Throttling
  if (download < 20 && upload > 20 && networkType !== "wifi") {
    return {
      message: "🔒 Possible ISP throttling — upload is faster than download",
      type: "error",
      icon: "⛔",
      detail: "Try a VPN to test if speeds improve, or contact your ISP",
      percentile,
    };
  }

  // Priority 3: High Latency
  if (ping > 150) {
    return {
      message: "🌍 High latency detected — your connection has significant delay",
      type: "error",
      icon: "📡",
      detail: "Distance from server or routing issue. Try a different server location",
      percentile,
    };
  }

  if (ping > 80) {
    return {
      message: "⚠️ Noticeable delay — okay for browsing, may affect gaming and calls",
      type: "warning",
      icon: "🎮",
      detail: "Wired connection can help reduce latency",
      percentile,
    };
  }

  // Priority 4: WiFi bottleneck
  if (networkType === "wifi" && download && download < 50 && ping && ping > 40) {
    return {
      message: "📶 Your WiFi is the bottleneck — signal interference detected",
      type: "warning",
      icon: "📡",
      detail: "Move closer to router, use 5GHz band, or try Ethernet",
      percentile,
    };
  }

  // Priority 5: Unstable connection (Jitter)
  if (jitter && jitter > 30) {
    return {
      message: "⚡ Very unstable connection — high jitter causes lag spikes",
      type: "error",
      icon: "📊",
      detail: "Check for interference or close background apps using bandwidth",
      percentile,
    };
  }

  if (jitter && jitter > 15) {
    return {
      message: "📉 Moderate instability — may cause occasional stutters",
      type: "warning",
      icon: "⚠️",
      detail: "Reduce network congestion for smoother experience",
      percentile,
    };
  }

  // Priority 6: Speed issues
  if (download < 10) {
    return {
      message: "🐌 Very slow connection — basic browsing only",
      type: "error",
      icon: "⚠️",
      detail: "Check your internet plan or contact your ISP",
      percentile,
    };
  }

  if (download < 25) {
    return {
      message: "📺 Moderate speed — good for HD streaming, 4K may buffer",
      type: "warning",
      icon: "📺",
      detail: "Close background apps to free up bandwidth",
      percentile,
    };
  }

  // Priority 7: Upload issues
  if (upload && upload < 5) {
    return {
      message: "📤 Slow upload — video calls and backups may suffer",
      type: "warning",
      icon: "⬆️",
      detail: "Upgrade your plan or reduce simultaneous uploads",
      percentile,
    };
  }

  // Priority 8: Excellent connection
  if (download > 200 && ping < 20 && jitter && jitter < 5) {
    return {
      message: `🚀 Blazing fast! Your internet is faster than ${percentile}% of users`,
      type: "success",
      icon: "🏆",
      detail: "Perfect for gaming, 8K streaming, and heavy workloads",
      percentile,
    };
  }

  if (download > 100 && ping < 30) {
    return {
      message: `⚡ Excellent connection — faster than ${percentile}% of users`,
      type: "success",
      icon: "✅",
      detail: "Great for 4K streaming and competitive gaming",
      percentile,
    };
  }

  if (download > 50 && ping < 50) {
    return {
      message: `👍 Good connection — faster than ${percentile}% of users`,
      type: "success",
      icon: "✅",
      detail: "Suitable for most online activities",
      percentile,
    };
  }

  // Default insight
  return {
    message: `📊 Your connection is functional — faster than ${percentile}% of users`,
    type: "info",
    icon: "💡",
    detail: "Run tests at different times for better insights",
    percentile,
  };
}

// Pattern detection for alerts
export interface TimePattern {
  hour: number;
  averageSpeed: number;
  dropPercent: number;
  message: string;
}

export function detectTimePatterns(history: any[]): TimePattern | null {
  if (!history || !Array.isArray(history) || history.length < 3) {
    return null;
  }

  const buckets = Array.from({ length: 24 }, () => [] as number[]);

  for (const record of history) {
    if (!record || typeof record !== 'object') continue;
    
    let hour = record.hour;
    if (hour === undefined && record.date) {
      try {
        hour = new Date(record.date).getHours();
      } catch (e) {
        continue;
      }
    }
    
    if (hour !== undefined && typeof hour === 'number' && hour >= 0 && hour <= 23) {
      const download = record.download;
      if (download !== undefined && typeof download === 'number' && download > 0) {
        buckets[hour].push(download);
      }
    }
  }

  const avgByHour = buckets.map(arr => {
    if (arr.length === 0) return null;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  });

  const validAverages = avgByHour.filter((v): v is number => v !== null);
  if (validAverages.length === 0) return null;

  const maxAvg = Math.max(...validAverages);
  if (maxAvg === 0) return null;

  let worstHour = -1;
  let worstAvg = Infinity;
  
  for (let i = 0; i < avgByHour.length; i++) {
    const avg = avgByHour[i];
    if (avg !== null && avg < worstAvg) {
      worstAvg = avg;
      worstHour = i;
    }
  }

  if (worstHour === -1) return null;
  
  let dropPercent = Math.round(((maxAvg - worstAvg) / maxAvg) * 100);
  dropPercent = Math.min(dropPercent, 90);
  
  if (dropPercent < 25) return null;

  let hourStr: string;
  if (worstHour === 0) {
    hourStr = "midnight";
  } else if (worstHour < 12) {
    hourStr = `${worstHour} AM`;
  } else if (worstHour === 12) {
    hourStr = "noon";
  } else {
    hourStr = `${worstHour - 12} PM`;
  }

  let message: string;
  if (dropPercent >= 70) {
    message = `📉 Significant speed drop around ${hourStr} — possible network congestion`;
  } else if (dropPercent >= 50) {
    message = `📉 Your speed drops noticeably around ${hourStr} — peak hour congestion likely`;
  } else {
    message = `📉 Your speed drops around ${hourStr} — consider testing at different times`;
  }

  return {
    hour: worstHour,
    averageSpeed: Math.round(worstAvg),
    dropPercent: dropPercent,
    message: message,
  };
}