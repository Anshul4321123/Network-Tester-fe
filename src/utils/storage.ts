export interface SpeedTestRecord {
  date: string;
  ping: number;
  jitter: number;
  download: number;
  upload: number;
  score:number;
}

const KEY = "speed_test_history";

export function saveResult(record: SpeedTestRecord) {

  const existing =
    JSON.parse(localStorage.getItem(KEY) || "[]");

  const updated = [record, ...existing].slice(0, 20);

  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function getHistory(): SpeedTestRecord[] {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}