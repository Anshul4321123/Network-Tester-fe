// hooks/usePingScanner.ts
//
// Slot-based scheduler: pre-computes exactly N = floor(duration/interval) fire times
// at the start. Each slot fires independently — server latency cannot add extra slots.
//
// Key design decisions:
//   • slotIndex is emitted alongside each ping so the component can reconstruct
//     perfect wall-clock labels (startTime + slotIndex * interval) with no jitter.
//   • PING_SAMPLES parallel fetches are averaged per slot for accuracy.
//   • The last slot fires at (N-1)*interval. For 30s/2s that is slot 14 → 28s.
//     This is correct: 15 slots × 2s = 30s of coverage (0,2,4,...28 = 15 points).
import { useState, useRef, useCallback } from "react";

const BASE_URL    = import.meta.env.VITE_BASE_URL;
const PING_SAMPLES = 3; // parallel fetches per measurement

export interface PingResult {
  value:     number; // averaged latency in ms
  slotIndex: number; // 0-based slot number (0, 1, 2, …, N-1)
}

export interface UsePingScannerReturn {
  isRunning:    boolean;
  latestResult: PingResult | null; // one new result per slot — component appends this
  currentPing:  number | null;
  bestPing:     number | null;
  averagePing:  number | null;
  stability:    "stable" | "moderate" | "unstable";
  totalCount:   number;
  slotCount:    number;   // total expected slots for this scan
  scanInterval: number;   // ms between slots (needed by component for label math)
  startedAt:    number;   // Date.now() when start() was called (for label math)
  start: (duration: number, interval: number) => void;
  stop:  () => void;
  reset: () => void;
}

export function usePingScanner(): UsePingScannerReturn {
  const [isRunning,     setIsRunning]     = useState(false);
  const [latestResult,  setLatestResult]  = useState<PingResult | null>(null);
  const [currentPing,   setCurrentPing]   = useState<number | null>(null);
  const [bestPing,      setBestPing]      = useState<number | null>(null);
  const [averagePing,   setAveragePing]   = useState<number | null>(null);
  const [stability,     setStability]     = useState<"stable" | "moderate" | "unstable">("stable");
  const [totalCount,    setTotalCount]    = useState(0);
  const [slotCount,     setSlotCount]     = useState(0);
  const [scanInterval,  setScanInterval]  = useState(2000);
  const [startedAt,     setStartedAt]     = useState(0);

  const allPingsRef   = useRef<number[]>([]);
  const isRunningRef  = useRef(false);
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── One measurement: N parallel fetches → drop highest outlier → average ──
  const measure = useCallback(async (): Promise<number | null> => {
    // Unique cache-bust per measurement (not per sample) to avoid TCP reuse skewing results
    const bust = Date.now();
    const url  = `${BASE_URL}/ping?_=${bust}`;

    const results = await Promise.all(
      Array.from({ length: PING_SAMPLES }, () => {
        const t0 = performance.now();
        return fetch(url, { cache: "no-store" })
          .then(() => performance.now() - t0)
          .catch((): null => null);
      })
    );

    const valid = results.filter((v): v is number => v !== null);
    if (valid.length === 0) return null;

    const sorted  = [...valid].sort((a, b) => a - b);
    const trimmed = sorted.length >= 3 ? sorted.slice(0, -1) : sorted; // drop highest
    return +(trimmed.reduce((a, b) => a + b, 0) / trimmed.length).toFixed(2);
  }, []);

  const updateStats = useCallback((list: number[]) => {
    if (list.length === 0) return;
    const best = Math.min(...list);
    const avg  = list.reduce((a, b) => a + b, 0) / list.length;
    setBestPing(+best.toFixed(2));
    setAveragePing(+avg.toFixed(2));
    if (list.length > 1) {
      const variance = list.reduce((acc, v) => acc + (v - avg) ** 2, 0) / list.length;
      const cv = Math.sqrt(variance) / avg;
      setStability(cv < 0.15 ? "stable" : cv < 0.3 ? "moderate" : "unstable");
    }
  }, []);

  // ── start ─────────────────────────────────────────────────────────────────
  // Schedule exactly N = floor(duration/interval) slots.
  // Each slot fires at i*interval ms after start, independent of network latency.
  const start = useCallback((duration: number, interval: number) => {
    // Cancel any running scan
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const N       = Math.floor(duration / interval); // exact count, e.g. 15 for 30s/2s
    const now     = Date.now();

    // Reset state
    allPingsRef.current = [];
    isRunningRef.current = true;
    setIsRunning(true);
    setLatestResult(null);
    setCurrentPing(null);
    setBestPing(null);
    setAveragePing(null);
    setStability("stable");
    setTotalCount(0);
    setSlotCount(N);
    setScanInterval(interval);
    setStartedAt(now);

    for (let i = 0; i < N; i++) {
      const t = setTimeout(async () => {
        if (!isRunningRef.current) return;

        const latency = await measure();
        if (latency === null || !isRunningRef.current) return;

        allPingsRef.current = [...allPingsRef.current, latency];
        const newCount = allPingsRef.current.length;

        setLatestResult({ value: latency, slotIndex: i });
        setCurrentPing(latency);
        setTotalCount(newCount);
        updateStats(allPingsRef.current);

        // Mark done when the last slot resolves
        if (newCount === N) {
          setIsRunning(false);
          isRunningRef.current = false;
        }
      }, i * interval);

      timersRef.current.push(t);
    }

    // Hard stop: fires at duration + 1s to clean up if the last slot never resolves
    const guard = setTimeout(() => {
      if (isRunningRef.current) {
        setIsRunning(false);
        isRunningRef.current = false;
      }
    }, duration + 1000);
    timersRef.current.push(guard);
  }, [measure, updateStats]);

  const stop = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setIsRunning(false);
    isRunningRef.current = false;
  }, []);

  const reset = useCallback(() => {
    stop();
    allPingsRef.current = [];
    setLatestResult(null);
    setCurrentPing(null);
    setBestPing(null);
    setAveragePing(null);
    setStability("stable");
    setTotalCount(0);
    setSlotCount(0);
    setScanInterval(2000);
    setStartedAt(0);
  }, [stop]);

  return {
    isRunning, latestResult, currentPing, bestPing, averagePing,
    stability, totalCount, slotCount, scanInterval, startedAt,
    start, stop, reset,
  };
}