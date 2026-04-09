// utils/storage.ts
export interface SpeedTestRecord {
  date: string;
  ping: number;
  jitter: number;
  download: number;
  upload: number;
  score: number;
  isp?: string;
  networkType?: string;
  originalIsp?: string;
}

export interface BestStats {
  bestDownload: number;
  bestUpload: number;
  bestPing: number;
  bestScore: number;
}

export interface TestSelection {
  ping: boolean;
  jitter: boolean;
  download: boolean;
  upload: boolean;
}

export interface Achievements {
  hasRunPing: boolean;
  hasRunJitter: boolean;
  hasRunDownload: boolean;
  hasRunUpload: boolean;
  hasRunFullTest: boolean;
}

const KEY = "speed_test_history";
const BEST_SCORE_KEY = "bestScore";
const BEST_STATS_KEY = "bestStats";
const TEST_SELECTION_KEY = "test_selection";
const ACHIEVEMENTS_KEY = "achievements";
const ISP_MAPPING_KEY = "isp_mapping";

// Save ISP mapping
export function saveISPMapping(detectedISP: string, preferredName: string) {
  const mappings = JSON.parse(localStorage.getItem(ISP_MAPPING_KEY) || "{}");
  mappings[detectedISP] = preferredName;
  localStorage.setItem(ISP_MAPPING_KEY, JSON.stringify(mappings));
}

export function getISPPreferredName(detectedISP: string): string {
  const mappings = JSON.parse(localStorage.getItem(ISP_MAPPING_KEY) || "{}");
  return mappings[detectedISP] || detectedISP;
}

export function getAllISPMappings(): Record<string, string> {
  return JSON.parse(localStorage.getItem(ISP_MAPPING_KEY) || "{}");
}

// FIXED: Properly save ISP and networkType
export function saveResult(record: SpeedTestRecord) {
  const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
  
  // Ensure ISP and networkType are preserved
  const recordToSave = {
    date: record.date,
    ping: record.ping,
    jitter: record.jitter,
    download: record.download,
    upload: record.upload,
    score: record.score,
    isp: record.isp || "Unknown",
    networkType: record.networkType || "unknown"
  };
  
  // Check for duplicate
  const isDuplicate = existing.some((r: SpeedTestRecord) => 
    r.date === recordToSave.date && 
    r.ping === recordToSave.ping && 
    r.download === recordToSave.download
  );
  
  if (!isDuplicate) {
    const updated = [recordToSave, ...existing];
    localStorage.setItem(KEY, JSON.stringify(updated));
    console.log("Saved test result with ISP:", {
      isp: recordToSave.isp,
      networkType: recordToSave.networkType
    });
  } else {
    console.log("Duplicate test result skipped");
  }
}

export function getHistory(): SpeedTestRecord[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export function updateHistoryISP(originalISP: string, newName: string) {
  const history = getHistory();
  const updatedHistory = history.map(record => {
    if (record.isp === originalISP) {
      return { ...record, isp: newName };
    }
    return record;
  });
  localStorage.setItem(KEY, JSON.stringify(updatedHistory));
}

export function getPaginatedHistory(page: number, pageSize: number = 20): { data: SpeedTestRecord[]; total: number } {
  const allHistory = getHistory();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: allHistory.slice(start, end),
    total: allHistory.length
  };
}

export function saveBestScore(score: number) {
  const best = localStorage.getItem(BEST_SCORE_KEY);
  if (!best || score > Number(best)) {
    localStorage.setItem(BEST_SCORE_KEY, score.toString());
    console.log("New best score saved:", score);
  }
}

export function getBestScore(): number | null {
  const best = localStorage.getItem(BEST_SCORE_KEY);
  return best ? Number(best) : null;
}

export function saveBestStats(score: number, download: number, upload: number, ping: number) {
  const raw = localStorage.getItem(BEST_STATS_KEY);
  const existing: BestStats = raw
    ? JSON.parse(raw)
    : { bestDownload: 0, bestUpload: 0, bestPing: Infinity, bestScore: 0 };

  const updated: BestStats = {
    bestDownload: Math.max(existing.bestDownload, download),
    bestUpload: Math.max(existing.bestUpload, upload),
    bestPing: Math.min(existing.bestPing, ping),
    bestScore: Math.max(existing.bestScore, score),
  };

  localStorage.setItem(BEST_STATS_KEY, JSON.stringify(updated));
  console.log("Best stats updated:", updated);
}

export function getBestStats(): BestStats | null {
  const raw = localStorage.getItem(BEST_STATS_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveTestSelection(selection: TestSelection) {
  localStorage.setItem(TEST_SELECTION_KEY, JSON.stringify(selection));
}

export function loadTestSelection(): TestSelection {
  const saved = localStorage.getItem(TEST_SELECTION_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    ping: true,
    jitter: true,
    download: true,
    upload: true,
  };
}

export function getAchievements(): Achievements {
  const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    hasRunPing: false,
    hasRunJitter: false,
    hasRunDownload: false,
    hasRunUpload: false,
    hasRunFullTest: false,
  };
}

export function saveAchievements(achievements: Achievements) {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
}

export function updateAchievement(type: "ping" | "jitter" | "download" | "upload" | "full") {
  const achievements = getAchievements();
  switch (type) {
    case "ping":
      achievements.hasRunPing = true;
      break;
    case "jitter":
      achievements.hasRunJitter = true;
      break;
    case "download":
      achievements.hasRunDownload = true;
      break;
    case "upload":
      achievements.hasRunUpload = true;
      break;
    case "full":
      achievements.hasRunFullTest = true;
      break;
  }
  saveAchievements(achievements);
  console.log(`Achievement unlocked: ${type}`);
  return achievements;
}

export function clearHistory() {
  localStorage.setItem(KEY, JSON.stringify([]));
  console.log("History cleared");
}