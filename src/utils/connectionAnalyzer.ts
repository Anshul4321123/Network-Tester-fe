export interface ConnectionReport {
  quality: string;
  streaming: string;
  gaming: string;
  videoCalls: string;
}

// ✅ STEP 1 — MODE TYPE
export type TestMode = "gaming" | "streaming" | "work";

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

/*
🧠 HUMAN INSIGHTS
*/
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

/*
🔥 SCORE
*/
export function calculateScore(
  ping: number,
  download: number,
  upload: number
): number {

  let score = 0;

  score += Math.min(download / 100, 1) * 40;
  score += Math.min(upload / 50, 1) * 20;

  score += ping < 20 ? 40 :
           ping < 50 ? 30 : 15;

  return Math.round(score);
}

// ✅ STEP 1 — MODE-BASED ANALYSIS
export function analyzeByMode(
  mode: TestMode,
  ping: number,
  jitter: number,
  download: number,
  upload: number
): string {

  switch (mode) {

    case "gaming":
      if (ping < 30 && jitter < 10)
        return "🎮 Great for gaming";
      else
        return "⚠️ You may experience lag";

    case "streaming":
      if (download >= 25)
        return "📺 Perfect for 4K streaming";
      else if (download >= 10)
        return "📺 Good for HD streaming";
      else
        return "❌ Streaming may buffer";

    case "work":
      if (upload >= 10 && ping < 50)
        return "💼 Great for meetings & work";
      else
        return "⚠️ Calls may lag";

    default:
      return "";
  }
}