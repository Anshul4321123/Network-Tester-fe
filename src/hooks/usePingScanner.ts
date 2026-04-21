// hooks/usePingScanner.ts
// Slot-based scheduler: fires exactly floor(duration/interval) requests,
// one per slot, regardless of server latency.
// Each measurement is ONE averaged result from PING_SAMPLES parallel fetches.
import { useState, useRef, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Number of parallel requests per measurement (averaged for accuracy)
const PING_SAMPLES = 3;

export interface UsePingScannerReturn {
  isRunning:   boolean;
  // newPing emits a single new value each measurement (not the whole array)
  newPing:     number | null;
  currentPing: number | null;
  bestPing:    number | null;
  averagePing: number | null;
  stability:   "stable" | "moderate" | "unstable";
  totalCount:  number; // how many measurements have fired so far
  start: (duration: number, interval: number) => void;
  stop:  () => void;
  reset: () => void;
}

export function usePingScanner(): UsePingScannerReturn {
  const [isRunning,    setIsRunning]    = useState(false);
  const [newPing,      setNewPing]      = useState<number | null>(null);
  const [currentPing,  setCurrentPing]  = useState<number | null>(null);
  const [bestPing,     setBestPing]     = useState<number | null>(null);
  const [averagePing,  setAveragePing]  = useState<number | null>(null);
  const [stability,    setStability]    = useState<"stable" | "moderate" | "unstable">("stable");
  const [totalCount,   setTotalCount]   = useState(0);

  // Internal accumulator — never exposed as state (avoids the double-append bug)
  const allPingsRef     = useRef<number[]>([]);
  const isRunningRef    = useRef(false);
  const slotTimersRef   = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Single measurement: PING_SAMPLES parallel fetches, average the results ──
  const measure = useCallback(async (): Promise<number | null> => {
    const url = BASE_URL.includes("?")
      ? `${BASE_URL}/ping&_=${Date.now()}`
      : `${BASE_URL}/ping?_=${Date.now()}`;

    const promises = Array.from({ length: PING_SAMPLES }, () => {
      const t0 = performance.now();
      return fetch(url, { cache: "no-store" })
        .then(() => performance.now() - t0)
        .catch(() => null);
    });

    const results = await Promise.all(promises);
    const valid   = results.filter((v): v is number => v !== null);

    if (valid.length === 0) return null;

    // Drop the highest outlier when we have 3+ samples
    const sorted   = [...valid].sort((a, b) => a - b);
    const trimmed  = sorted.length >= 3 ? sorted.slice(0, -1) : sorted;
    const avg      = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    return +avg.toFixed(2);
  }, []);

  // ── Update derived stats ───────────────────────────────────────────────────
  const updateStats = useCallback((list: number[]) => {
    if (list.length === 0) return;
    const best = Math.min(...list);
    const avg  = list.reduce((a, b) => a + b, 0) / list.length;
    setBestPing(+best.toFixed(2));
    setAveragePing(+avg.toFixed(2));

    if (list.length > 1) {
      const variance = list.reduce((acc, v) => acc + (v - avg) ** 2, 0) / list.length;
      const cv       = Math.sqrt(variance) / avg;
      setStability(cv < 0.15 ? "stable" : cv < 0.3 ? "moderate" : "unstable");
    }
  }, []);

  // ── start: schedule exactly N = floor(duration/interval) slots ────────────
  const start = useCallback((duration: number, interval: number) => {
    // Clear any existing timers
    slotTimersRef.current.forEach(clearTimeout);
    slotTimersRef.current = [];

    // Reset everything
    allPingsRef.current = [];
    setIsRunning(true);
    isRunningRef.current = true;
    setNewPing(null);
    setCurrentPing(null);
    setBestPing(null);
    setAveragePing(null);
    setStability("stable");
    setTotalCount(0);

    const slotCount = Math.floor(duration / interval); // e.g. 30000/2000 = 15

    for (let i = 0; i < slotCount; i++) {
      const fireAt = i * interval; // slot 0 fires at 0ms, slot 1 at 2000ms, …

      const t = setTimeout(async () => {
        if (!isRunningRef.current) return;

        const latency = await measure();
        if (latency === null || !isRunningRef.current) return;

        allPingsRef.current = [...allPingsRef.current, latency];

        setNewPing(latency);       // single new value — component appends this
        setCurrentPing(latency);
        setTotalCount(allPingsRef.current.length);
        updateStats(allPingsRef.current);

        // Last slot → mark complete
        if (i === slotCount - 1) {
          setIsRunning(false);
          isRunningRef.current = false;
        }
      }, fireAt);

      slotTimersRef.current.push(t);
    }

    // Safety: stop after duration + 500ms buffer in case the last slot is slow
    const endTimer = setTimeout(() => {
      if (isRunningRef.current) {
        setIsRunning(false);
        isRunningRef.current = false;
      }
    }, duration + 500);
    slotTimersRef.current.push(endTimer);
  }, [measure, updateStats]);

  const stop = useCallback(() => {
    slotTimersRef.current.forEach(clearTimeout);
    slotTimersRef.current = [];
    setIsRunning(false);
    isRunningRef.current = false;
  }, []);

  const reset = useCallback(() => {
    stop();
    allPingsRef.current = [];
    setNewPing(null);
    setCurrentPing(null);
    setBestPing(null);
    setAveragePing(null);
    setStability("stable");
    setTotalCount(0);
  }, [stop]);

  return { isRunning, newPing, currentPing, bestPing, averagePing, stability, totalCount, start, stop, reset };
}