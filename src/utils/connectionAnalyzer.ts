// utils/connectionAnalyzer.ts
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

export function generateInsights(
  ping: number,
  download: number,
  upload: number
): string[] {

  const insights: string[] = [];

  if (ping > 80) {
    insights.push("⚠️ High ping — gaming and video calls may lag");
  } else if (ping < 30) {
    insights.push("✅ Low latency — great for gaming");
  }

  if (download > 25) {
    insights.push("✅ Good for 4K streaming");
  } else if (download > 10) {
    insights.push("📺 Suitable for HD streaming");
  } else {
    insights.push("❌ Streaming quality may be limited");
  }

  if (ping < 30 && download > 25) {
    insights.push("🎮 Excellent for competitive gaming");
  } else if (ping < 60) {
    insights.push("🎮 Casual gaming should be fine");
  } else {
    insights.push("❌ Not suitable for competitive gaming");
  }

  if (upload < 2) {
    insights.push("❌ Poor upload — video calls may lag");
  } else if (upload > 10) {
    insights.push("📞 Great for video calls & uploads");
  }

  return insights;
}

export function calculateScore(
  ping: number,
  download: number,
  upload: number
): number {
  let score = 0;
  score += Math.min(download / 100, 1) * 40;
  score += Math.min(upload / 50, 1) * 20;
  score += ping < 20 ? 40 : ping < 50 ? 30 : 15;
  return Math.round(score);
}

// Get detailed score breakdown with explanations
export function getScoreBreakdown(
  ping: number,
  download: number,
  upload: number
): ScoreBreakdown {
  // Download score (max 40 points)
  let downloadScore = Math.min(download / 100, 1) * 40;
  let downloadDetails = "";
  
  if (download >= 100) {
    downloadDetails = `✅ +${downloadScore.toFixed(0)} points: Download speed ${download.toFixed(0)} Mbps (excellent, max bonus)`;
  } else if (download >= 50) {
    downloadDetails = `✅ +${downloadScore.toFixed(0)} points: Download speed ${download.toFixed(0)} Mbps (good)`;
  } else if (download >= 25) {
    downloadDetails = `👍 +${downloadScore.toFixed(0)} points: Download speed ${download.toFixed(0)} Mbps (decent)`;
  } else if (download >= 10) {
    downloadDetails = `⚠️ +${downloadScore.toFixed(0)} points: Download speed ${download.toFixed(0)} Mbps (average)`;
  } else {
    downloadDetails = `❌ +${downloadScore.toFixed(0)} points: Download speed ${download.toFixed(0)} Mbps (slow, max 40 points needs 100+ Mbps)`;
  }

  // Upload score (max 20 points)
  let uploadScore = Math.min(upload / 50, 1) * 20;
  let uploadDetails = "";
  
  if (upload >= 50) {
    uploadDetails = `✅ +${uploadScore.toFixed(0)} points: Upload speed ${upload.toFixed(0)} Mbps (excellent, max bonus)`;
  } else if (upload >= 25) {
    uploadDetails = `✅ +${uploadScore.toFixed(0)} points: Upload speed ${upload.toFixed(0)} Mbps (great)`;
  } else if (upload >= 10) {
    uploadDetails = `👍 +${uploadScore.toFixed(0)} points: Upload speed ${upload.toFixed(0)} Mbps (good for video calls)`;
  } else if (upload >= 5) {
    uploadDetails = `⚠️ +${uploadScore.toFixed(0)} points: Upload speed ${upload.toFixed(0)} Mbps (adequate)`;
  } else {
    uploadDetails = `❌ +${uploadScore.toFixed(0)} points: Upload speed ${upload.toFixed(0)} Mbps (slow, max 20 points needs 50+ Mbps)`;
  }

  // Ping score (max 40 points)
  let pingScore = 0;
  let pingDetails = "";
  
  if (ping < 20) {
    pingScore = 40;
    pingDetails = `✅ +40 points: Ping ${ping.toFixed(0)} ms (excellent for gaming)`;
  } else if (ping < 50) {
    pingScore = 30;
    pingDetails = `👍 +30 points: Ping ${ping.toFixed(0)} ms (good for most games)`;
  } else {
    pingScore = 15;
    pingDetails = `⚠️ +15 points: Ping ${ping.toFixed(0)} ms (may cause lag in games)`;
  }

  const totalScore = downloadScore + uploadScore + pingScore;

  return {
    downloadScore: Math.round(downloadScore),
    uploadScore: Math.round(uploadScore),
    pingScore: Math.round(pingScore),
    totalScore: Math.round(totalScore),
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
      // More realistic thresholds for gaming
      if (ping < 30 && jitter < 20)  // Increased jitter threshold from 10 to 20
        return "🎮 Excellent for gaming! Low latency & stable connection.";
      else if (ping < 50 && jitter < 30)
        return "👍 Good for gaming. May have occasional hiccups.";
      else if (ping < 80)
        return "⚠️ Playable but may experience lag. Consider using ethernet.";
      else
        return "❌ High latency - not recommended for competitive gaming.";

    case "streaming":
      if (download >= 50)
        return "📺 Perfect for 4K/8K streaming on multiple devices!";
      else if (download >= 25)
        return "📺 Great for 4K streaming on 1-2 devices.";
      else if (download >= 10)
        return "📺 Good for HD (1080p) streaming.";
      else if (download >= 5)
        return "📺 Suitable for 720p streaming.";
      else
        return "❌ Streaming may buffer frequently. Consider upgrading.";

    case "work":
      if (upload >= 20 && ping < 50)
        return "💼 Excellent for video conferencing & large file sharing!";
      else if (upload >= 10 && ping < 80)
        return "💼 Great for Zoom/Teams calls & file sharing.";
      else if (upload >= 5)
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