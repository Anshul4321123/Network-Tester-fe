// utils/storage.ts
export interface SpeedTestRecord {
  date: string;
  ping: number;
  jitter: number;
  download: number;
  upload: number;
  score: number;
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

const KEY = "speed_test_history";
const BEST_SCORE_KEY = "bestScore";
const BEST_STATS_KEY = "bestStats";
const TEST_SELECTION_KEY = "test_selection";

export function saveResult(record: SpeedTestRecord) {
  const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
  const updated = [record, ...existing].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function getHistory(): SpeedTestRecord[] {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveBestScore(score: number) {
  const best = localStorage.getItem(BEST_SCORE_KEY);
  if (!best || score > Number(best)) {
    localStorage.setItem(BEST_SCORE_KEY, score.toString());
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
}

export function getBestStats(): BestStats | null {
  const raw = localStorage.getItem(BEST_STATS_KEY);
  return raw ? JSON.parse(raw) : null;
}

// Test selection persistence
export function saveTestSelection(selection: TestSelection) {
  localStorage.setItem(TEST_SELECTION_KEY, JSON.stringify(selection));
}

export function loadTestSelection(): TestSelection {
  const saved = localStorage.getItem(TEST_SELECTION_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  // Default: all tests selected
  return {
    ping: true,
    jitter: true,
    download: true,
    upload: true,
  };
}