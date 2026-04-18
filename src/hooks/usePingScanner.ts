// hooks/usePingScanner.ts - FIXED
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
  const isRunningRef = useRef(false); // Add a ref to track running state

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

  const performPing = useCallback(async (): Promise<number | null> => {
    try {
      const pingStart = performance.now();
      const response = await fetch(`${BASE_URL}/ping?ts=${Date.now()}&_=${Math.random()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      await response.text();
      const latency = performance.now() - pingStart;
      return latency;
    } catch (error) {
      console.error("Ping failed:", error);
      return null;
    }
  }, []);

  const runSinglePing = useCallback(async () => {
    if (!isRunningRef.current) return;
    
    const latency = await performPing();
    
    if (latency !== null) {
      // Ignore first ping (warm-up)
      if (!isFirstPingRef.current) {
        setPings(prev => {
          const newPings = [...prev, latency];
          const limited = newPings.slice(-100);
          setCurrentPing(Math.round(latency * 100) / 100);
          calculateStats(limited);
          return limited;
        });
      } else {
        isFirstPingRef.current = false;
        setCurrentPing(Math.round(latency * 100) / 100);
      }
    }
  }, [performPing, calculateStats]);

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
      
      // Run the ping
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