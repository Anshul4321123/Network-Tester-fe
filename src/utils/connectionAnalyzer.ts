// utils/connectionAnalyzer.ts - UPGRADED with throttling detection
export interface ConnectionReport {
  quality: string;
  streaming: string;
  gaming: string;
  videoCalls: string;
}

export type TestMode = "gaming" | "streaming" | "work";

export interface ScoreBreakdown {
  downloadScore: number;
  uploadScore: number;
  pingScore: number;
  totalScore: number;
  details: {
    download: string;
    upload: string;
    ping: string;
  };
}

export function analyzeConnection(
  ping: number,
  download: number,
  upload: number
): ConnectionReport {

  let quality = "Poor";

  if (download > 100 && ping < 20) quality = "Excellent";
  else if (download > 50 && ping < 40) quality = "Very Good";
  else if (download > 25) quality = "Good";
  else if (download > 10) quality = "Average";

  let streaming = "SD Only";

  if (download >= 25) streaming = "4K Ready";
  else if (download >= 10) streaming = "HD Ready";
  else if (download >= 5) streaming = "720p Streaming";

  let gaming = "Not Recommended";

  if (ping < 30 && download > 25) gaming = "Excellent";
  else if (ping < 50 && download > 10) gaming = "Good";
  else if (ping < 80) gaming = "Playable";

  let videoCalls = "Poor";

  if (upload >= 10 && download >= 10) videoCalls = "Excellent";
  else if (upload >= 5) videoCalls = "Good";
  else if (upload >= 2) videoCalls = "Basic Calls";

  return {
    quality,
    streaming,
    gaming,
    videoCalls
  };
}

// UPDATED: generateInsights with throttling detection
export function generateInsights(
  ping: number,
  download: number,
  upload: number,
  bestDownload?: number,
): string[] {

  const insights: string[] = [];

  // Ping insights
  if (ping > 80) {
    insights.push("⚠️ High ping — gaming and video calls may lag");
  } else if (ping < 30) {
    insights.push("✅ Low latency — great for gaming");
  }

  // Download insights
  if (download > 25) {
    insights.push("✅ Good for 4K streaming");
  } else if (download > 10) {
    insights.push("📺 Suitable for HD streaming");
  } else {
    insights.push("❌ Streaming quality may be limited");
  }

  // Gaming insights
  if (ping < 30 && download > 25) {
    insights.push("🎮 Excellent for competitive gaming");
  } else if (ping < 60) {
    insights.push("🎮 Casual gaming should be fine");
  } else {
    insights.push("❌ Not suitable for competitive gaming");
  }

  // Upload insights
  if (upload < 2) {
    insights.push("❌ Poor upload — video calls may lag");
  } else if (upload > 10) {
    insights.push("📞 Great for video calls & uploads");
  }

  // NEW: Throttling detection
  // Only flag if download is low (< 50% of best) AND ping is low (< 50ms) AND jitter is low (jitter not available here, but we can approximate)
  // Since we don't have jitter in this function, we'll rely on ping stability.
  // For better accuracy, we'll check if ping is low (stable) and download is significantly lower than best.
  if (bestDownload && bestDownload > 0 && download > 0) {
    const dropPercent = ((bestDownload - download) / bestDownload) * 100;
    if (dropPercent > 50 && ping < 50) {
      insights.push("⚠️ Possible ISP throttling — speed is low but latency is good");
    }
  }

  return insights;
}

export function calculateScore(
  ping: number,
  download: number,
  upload: number
): number {
  let score = 0;
  
  // Download score (max 40 points) - More granular for high speeds
  if (download >= 100) score += 40;
  else if (download >= 50) score += 35;
  else if (download >= 25) score += 30;
  else if (download >= 10) score += 20;
  else if (download >= 5) score += 10;
  else score += Math.min(download / 100, 1) * 40;
  
  // Upload score (max 20 points) - More granular for high speeds
  if (upload >= 50) score += 20;
  else if (upload >= 20) score += 15;
  else if (upload >= 10) score += 12;
  else if (upload >= 5) score += 8;
  else score += Math.min(upload / 50, 1) * 20;
  
  // Ping score (max 40 points)
  if (ping < 20) score += 40;
  else if (ping < 30) score += 38;
  else if (ping < 40) score += 35;
  else if (ping < 50) score += 30;
  else if (ping < 60) score += 25;
  else if (ping < 80) score += 20;
  else if (ping < 100) score += 15;
  else if (ping < 150) score += 10;
  else score += 5;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Get detailed score breakdown with explanations
export function getScoreBreakdown(
  ping: number,
  download: number,
  upload: number
): ScoreBreakdown {
  // Download score (max 40 points)
  let downloadScore = 0;
  let downloadDetails = "";
  
  if (download >= 100) {
    downloadScore = 40;
    downloadDetails = `✅ +40 points: Download speed ${download.toFixed(0)} Mbps (excellent, max bonus)`;
  } else if (download >= 50) {
    downloadScore = 35;
    const needed = 100 - download;
    downloadDetails = `👍 +35 points: Download speed ${download.toFixed(0)} Mbps (great, need ${needed.toFixed(0)} more Mbps for max)`;
  } else if (download >= 25) {
    downloadScore = 30;
    const needed = 100 - download;
    downloadDetails = `👍 +30 points: Download speed ${download.toFixed(0)} Mbps (good, need ${needed.toFixed(0)} more Mbps for max)`;
  } else if (download >= 10) {
    downloadScore = 20;
    const needed = 100 - download;
    downloadDetails = `⚠️ +20 points: Download speed ${download.toFixed(0)} Mbps (fair, need ${needed.toFixed(0)} more Mbps for max)`;
  } else if (download >= 5) {
    downloadScore = 10;
    const needed = 100 - download;
    downloadDetails = `⚠️ +10 points: Download speed ${download.toFixed(0)} Mbps (slow, need ${needed.toFixed(0)} more Mbps for max)`;
  } else {
    downloadScore = Math.floor((download / 100) * 40);
    downloadDetails = `❌ +${downloadScore} points: Download speed ${download.toFixed(0)} Mbps (very slow, need 100+ Mbps for max)`;
  }

  // Upload score (max 20 points)
  let uploadScore = 0;
  let uploadDetails = "";
  
  if (upload >= 50) {
    uploadScore = 20;
    uploadDetails = `✅ +20 points: Upload speed ${upload.toFixed(0)} Mbps (excellent, max bonus)`;
  } else if (upload >= 20) {
    uploadScore = 15;
    const needed = 50 - upload;
    uploadDetails = `👍 +15 points: Upload speed ${upload.toFixed(0)} Mbps (great, need ${needed.toFixed(0)} more Mbps for max)`;
  } else if (upload >= 10) {
    uploadScore = 12;
    const needed = 50 - upload;
    uploadDetails = `👍 +12 points: Upload speed ${upload.toFixed(0)} Mbps (good, need ${needed.toFixed(0)} more Mbps for max)`;
  } else if (upload >= 5) {
    uploadScore = 8;
    const needed = 50 - upload;
    uploadDetails = `⚠️ +8 points: Upload speed ${upload.toFixed(0)} Mbps (fair, need ${needed.toFixed(0)} more Mbps for max)`;
  } else {
    uploadScore = Math.floor((upload / 50) * 20);
    uploadDetails = `❌ +${uploadScore} points: Upload speed ${upload.toFixed(0)} Mbps (slow, need 50+ Mbps for max)`;
  }

  // Ping score (max 40 points)
  let pingScore = 0;
  let pingDetails = "";
  
  if (ping < 20) {
    pingScore = 40;
    pingDetails = `✅ +40 points: Ping ${ping.toFixed(0)} ms (excellent for gaming)`;
  } else if (ping < 30) {
    pingScore = 38;
    const needed = ping - 20;
    pingDetails = `👍 +38 points: Ping ${ping.toFixed(0)} ms (great, ${needed.toFixed(0)} ms above ideal)`;
  } else if (ping < 40) {
    pingScore = 35;
    const needed = ping - 20;
    pingDetails = `👍 +35 points: Ping ${ping.toFixed(0)} ms (good, ${needed.toFixed(0)} ms above ideal)`;
  } else if (ping < 50) {
    pingScore = 30;
    const needed = ping - 20;
    pingDetails = `⚠️ +30 points: Ping ${ping.toFixed(0)} ms (fair, ${needed.toFixed(0)} ms above ideal)`;
  } else if (ping < 60) {
    pingScore = 25;
    const needed = ping - 20;
    pingDetails = `⚠️ +25 points: Ping ${ping.toFixed(0)} ms (noticeable lag, ${needed.toFixed(0)} ms above ideal)`;
  } else if (ping < 80) {
    pingScore = 20;
    const needed = ping - 20;
    pingDetails = `⚠️ +20 points: Ping ${ping.toFixed(0)} ms (high latency, ${needed.toFixed(0)} ms above ideal)`;
  } else if (ping < 100) {
    pingScore = 15;
    const needed = ping - 20;
    pingDetails = `❌ +15 points: Ping ${ping.toFixed(0)} ms (poor, ${needed.toFixed(0)} ms above ideal)`;
  } else if (ping < 150) {
    pingScore = 10;
    const needed = ping - 20;
    pingDetails = `❌ +10 points: Ping ${ping.toFixed(0)} ms (very poor, ${needed.toFixed(0)} ms above ideal)`;
  } else {
    pingScore = 5;
    const needed = ping - 20;
    pingDetails = `❌ +5 points: Ping ${ping.toFixed(0)} ms (extremely poor, ${needed.toFixed(0)} ms above ideal)`;
  }

  const totalScore = downloadScore + uploadScore + pingScore;
  const finalTotal = Math.min(100, Math.max(0, totalScore));

  return {
    downloadScore: Math.round(downloadScore),
    uploadScore: Math.round(uploadScore),
    pingScore: Math.round(pingScore),
    totalScore: Math.round(finalTotal),
    details: {
      download: downloadDetails,
      upload: uploadDetails,
      ping: pingDetails,
    },
  };
}

// Updated mode-based analysis with better thresholds
export function analyzeByMode(
  mode: TestMode,
  ping: number,
  jitter: number,
  download: number,
  upload: number
): string {

  switch (mode) {
    case "gaming":
      if (ping < 30 && jitter < 20 && download >= 25)
        return "🎮 Excellent for gaming! Low latency & stable connection.";
      else if (ping < 50 && jitter < 30 && download >= 15)
        return "👍 Good for gaming. May have occasional hiccups.";
      else if (ping < 80 && download >= 10)
        return "⚠️ Playable but may experience lag. Consider using ethernet.";
      else
        return "❌ High latency - not recommended for competitive gaming.";

    case "streaming":
      if (download >= 100)
        return "📺 Perfect for 8K/4K HDR streaming on multiple devices!";
      else if (download >= 50)
        return "📺 Excellent for 4K streaming on 2-3 devices simultaneously.";
      else if (download >= 25)
        return "📺 Great for 4K streaming on 1-2 devices.";
      else if (download >= 10)
        return "📺 Good for HD (1080p) streaming.";
      else if (download >= 5)
        return "📺 Suitable for 720p streaming.";
      else
        return "❌ Streaming may buffer frequently. Consider upgrading.";

    case "work":
      if (upload >= 20 && ping < 50 && download >= 25)
        return "💼 Excellent for video conferencing & large file sharing!";
      else if (upload >= 10 && ping < 80 && download >= 10)
        return "💼 Great for Zoom/Teams calls & file sharing.";
      else if (upload >= 5 && download >= 5)
        return "💼 Adequate for voice calls and emails.";
      else
        return "⚠️ Video calls may be unstable. Check your upload speed.";

    default:
      return "";
  }
}

// New function: Get explanation for score on hover/click
export function getScoreExplanation(
  ping: number,
  download: number,
  upload: number,
  score: number
): string {
  const breakdown = getScoreBreakdown(ping, download, upload);
  
  let explanation = `🏆 Score: ${score}/100\n\n`;
  explanation += `How your score was calculated:\n`;
  explanation += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  explanation += `📊 DOWNLOAD SPEED (40% of score)\n`;
  explanation += `${breakdown.details.download}\n`;
  explanation += `💡 100+ Mbps = full 40 points\n\n`;
  
  explanation += `📤 UPLOAD SPEED (20% of score)\n`;
  explanation += `${breakdown.details.upload}\n`;
  explanation += `💡 50+ Mbps = full 20 points\n\n`;
  
  explanation += `📡 PING LATENCY (40% of score)\n`;
  explanation += `${breakdown.details.ping}\n`;
  explanation += `💡 Under 20ms = full 40 points\n\n`;
  
  explanation += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  explanation += `✨ TOTAL SCORE: ${breakdown.totalScore}/100\n`;
  
  if (score >= 90) {
    explanation += `🎉 Excellent! Your connection is top-tier!`;
  } else if (score >= 70) {
    explanation += `👍 Good! You have a solid connection.`;
  } else if (score >= 50) {
    explanation += `⚠️ Fair! Some improvements possible.`;
  } else {
    explanation += `❌ Poor! Consider upgrading your connection.`;
  }
  
  return explanation;
}

// NEW: Get deduction explanation for the UI
export function getDeductionExplanation(
  ping: number,
  download: number,
  upload: number,
  breakdown: ScoreBreakdown
): string[] {
  const maxDownloadScore = 40;
  const maxUploadScore = 20;
  const maxPingScore = 40;
  
  const downloadDeduction = maxDownloadScore - breakdown.downloadScore;
  const uploadDeduction = maxUploadScore - breakdown.uploadScore;
  const pingDeduction = maxPingScore - breakdown.pingScore;
  const totalDeduction = downloadDeduction + uploadDeduction + pingDeduction;
  
  let explanations = [];
  
  if (downloadDeduction > 0) {
    let reason = "";
    if (download < 25) reason = `Very slow (${download.toFixed(0)} Mbps)`;
    else if (download < 50) reason = `Below average (${download.toFixed(0)} Mbps)`;
    else if (download < 100) reason = `Good but not max (${download.toFixed(0)} Mbps)`;
    explanations.push(`📉 Download: -${downloadDeduction} points (${reason}, need 100+ Mbps for full 40 points)`);
  }
  
  if (uploadDeduction > 0) {
    let reason = "";
    if (upload < 5) reason = `Very slow (${upload.toFixed(0)} Mbps)`;
    else if (upload < 10) reason = `Below average (${upload.toFixed(0)} Mbps)`;
    else if (upload < 50) reason = `Good but not max (${upload.toFixed(0)} Mbps)`;
    explanations.push(`📉 Upload: -${uploadDeduction} points (${reason}, need 50+ Mbps for full 20 points)`);
  }
  
  if (pingDeduction > 0) {
    let reason = "";
    if (ping > 100) reason = `Very high latency (${ping.toFixed(0)} ms)`;
    else if (ping > 50) reason = `High latency (${ping.toFixed(0)} ms)`;
    else if (ping > 20) reason = `Good but not ideal (${ping.toFixed(0)} ms)`;
    explanations.push(`📉 Ping: -${pingDeduction} points (${reason}, need under 20ms for full 40 points)`);
  }
  
  if (totalDeduction === 0) {
    explanations.push("✨ Perfect score! No points deducted from download, upload, or ping!");
  } else {
    explanations.push(`\n📊 Total deduction: ${totalDeduction} points`);
    explanations.push(`🎯 Final score: ${breakdown.totalScore}/100`);
  }
  
  return explanations;
}