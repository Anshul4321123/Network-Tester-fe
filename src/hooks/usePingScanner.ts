// hooks/usePingScanner.ts - FIXED to match speed test accuracy
import { useState, useRef, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface UsePingScannerReturn {
  isRunning: boolean;
  pings: number[];
  currentPing: number | null;
  bestPing: number | null;
  averagePing: number | null;
  stability: "stable" | "moderate" | "unstable";
  start: (duration: number, interval: number) => void;
  stop: () => void;
  reset: () => void;
}

// Same ping test method as useSpeedTest
const PING_SAMPLES = 5; // Fewer samples for faster response, but still accurate

export function usePingScanner(): UsePingScannerReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [pings, setPings] = useState<number[]>([]);
  const [currentPing, setCurrentPing] = useState<number | null>(null);
  const [bestPing, setBestPing] = useState<number | null>(null);
  const [averagePing, setAveragePing] = useState<number | null>(null);
  const [stability, setStability] = useState<"stable" | "moderate" | "unstable">("stable");
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstPingRef = useRef(true);
  const startTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const calculateStats = useCallback((pingList: number[]) => {
    if (pingList.length === 0) return;
    
    const best = Math.min(...pingList);
    setBestPing(Math.round(best * 100) / 100);
    
    const avg = pingList.reduce((a, b) => a + b, 0) / pingList.length;
    setAveragePing(Math.round(avg * 100) / 100);
    
    if (pingList.length > 1) {
      const variance = pingList.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / pingList.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / avg;
      
      if (cv < 0.15) {
        setStability("stable");
      } else if (cv < 0.3) {
        setStability("moderate");
      } else {
        setStability("unstable");
      }
    }
  }, []);

  // Helper: fetch with cache busting (same as useSpeedTest)
  const fetchWithCacheBust = (url: string) => {
    const bustedUrl = url.includes('?') ? `${url}&_=${Date.now()}` : `${url}?_=${Date.now()}`;
    return fetch(bustedUrl, { cache: 'no-store' });
  };

  // Accurate ping test with multiple samples and outlier removal
  const performAccuratePing = useCallback(async (): Promise<number | null> => {
    const samples: number[] = [];

    for (let i = 0; i < PING_SAMPLES; i++) {
      const start = performance.now();
      try {
        await fetchWithCacheBust(`${BASE_URL}/ping`);
        const latency = performance.now() - start;
        samples.push(latency);
      } catch (error) {
        console.warn(`Ping attempt ${i + 1} failed:`, error);
      }
      if (i < PING_SAMPLES - 1) await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (samples.length < PING_SAMPLES / 2) {
      return null;
    }

    // Remove outliers (trim 20% from both ends) - same as speed test
    const sorted = [...samples].sort((a, b) => a - b);
    const trimStart = Math.floor(sorted.length * 0.2);
    const trimEnd = Math.floor(sorted.length * 0.8);
    const trimmed = sorted.slice(trimStart, trimEnd);
    const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    
    return +avg.toFixed(2);
  }, []);

  const runSinglePing = useCallback(async () => {
    if (!isRunningRef.current) return;
    
    const latency = await performAccuratePing();
    
    if (latency !== null) {
      if (!isFirstPingRef.current) {
        setPings(prev => {
          const newPings = [...prev, latency];
          const limited = newPings.slice(-100);
          setCurrentPing(latency);
          calculateStats(limited);
          return limited;
        });
      } else {
        isFirstPingRef.current = false;
        setCurrentPing(latency);
      }
    }
  }, [performAccuratePing, calculateStats]);

  const start = useCallback((duration: number, interval: number) => {
    // Stop any existing scan
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset state
    setIsRunning(true);
    isRunningRef.current = true;
    setPings([]);
    setCurrentPing(null);
    setBestPing(null);
    setAveragePing(null);
    setStability("stable");
    isFirstPingRef.current = true;
    startTimeRef.current = Date.now();
    
    const endTime = startTimeRef.current + duration;
    
    const scheduleNextPing = async () => {
      if (!isRunningRef.current) return;
      
      const now = Date.now();
      if (now >= endTime) {
        // Scan complete
        setIsRunning(false);
        isRunningRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }
      
      // Run the accurate ping
      await runSinglePing();
      
      // Schedule next ping
      timeoutRef.current = setTimeout(scheduleNextPing, interval);
    };
    
    // Start the first ping
    scheduleNextPing();
  }, [runSinglePing]);

  const stop = useCallback(() => {
    setIsRunning(false);
    isRunningRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setPings([]);
    setCurrentPing(null);
    setBestPing(null);
    setAveragePing(null);
    setStability("stable");
    isFirstPingRef.current = true;
    startTimeRef.current = 0;
  }, [stop]);

  return {
    isRunning,
    pings,
    currentPing,
    bestPing,
    averagePing,
    stability,
    start,
    stop,
    reset,
  };
}