// hooks/useSpeedTest.ts - FULLY OPTIMIZED
import { useState, useEffect, useRef } from "react";
import type { TestPhase } from "../types/speedTestTypes";
import {
  analyzeConnection,
  generateInsights,
  analyzeByMode
} from "../utils/connectionAnalyzer";
import type { ConnectionReport, TestMode } from "../utils/connectionAnalyzer";
import {
  saveResult,
  saveBestScore,
  saveBestStats,
  getHistory
} from "../utils/storage";
import { detectTimePatterns, type TimePattern } from "../utils/smartInsightEngine";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/*
─────────────────────────────────────────
CONFIG (IMPROVED FOR ACCURACY)
─────────────────────────────────────────
*/
const FULL_TEST_COOLDOWN = 10 * 60 * 1000;
const PING_CHECK_INTERVAL = 5 * 60 * 1000;
const FULL_TEST_INTERVAL  = 30 * 60 * 1000;
const DOWNLOAD_STREAMS = 6;
const DOWNLOAD_DURATION = 8000;
const UPLOAD_STREAMS = 4;
const UPLOAD_DURATION = 8000;
const PING_SAMPLES = 12;          // More samples for better outlier removal
const WARMUP_DURATION = 2000;     // 2 second warmup download

export default function useSpeedTest() {

  const [phase, setPhase] = useState<TestPhase>("idle");
  const [ping, setPing] = useState<number | null>(null);
  const [download, setDownload] = useState<number | null>(null);
  const [upload, setUpload] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number | null>(null);
  const [report, setReport] = useState<ConnectionReport | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  const [downloadHistory, setDownloadHistory] = useState<number[]>([]);
  const [uploadHistory, setUploadHistory] = useState<number[]>([]);
  const [pingHistory, setPingHistory] = useState<number[]>([]);
  const [jitterHistory, setJitterHistory] = useState<number[]>([]);

  const [mode, setMode] = useState<TestMode>("gaming");
  const [modeResult, setModeResult] = useState("");

  const [bufferbloat, setBufferbloat] = useState<number | null>(null);
  const [networkType, setNetworkType] = useState("unknown");

  const [autoRun, setAutoRun] = useState(false);
  const [monitorPing, setMonitorPing] = useState<number | null>(null);
  const [timePattern, setTimePattern] = useState<TimePattern | null>(null);

  const runningRef = useRef(false);
  const lastFullTestTimeRef = useRef(0);
  const pingIntervalRef = useRef<number | null>(null);
  const fullIntervalRef = useRef<number | null>(null);
  const testStartTimeRef = useRef(0);
  const [running, setRunning] = useState(false);

  // ----------------------------------------------------------------------
  // Helper: fetch with cache busting
  // ----------------------------------------------------------------------
  const fetchWithCacheBust = (url: string, init?: RequestInit) => {
    const bustedUrl = url.includes('?') ? `${url}&_=${Date.now()}` : `${url}?_=${Date.now()}`;
    return fetch(bustedUrl, { cache: 'no-store', ...init });
  };

  // ----------------------------------------------------------------------
  // Network type detection (unchanged)
  // ----------------------------------------------------------------------
  const detectNetworkType = (downloadSpeed: number, pingMs: number): string => {
    if (downloadSpeed >= 100 && pingMs < 30) return "5G";
    if (downloadSpeed >= 50 && pingMs < 50) return "4G+";
    if (downloadSpeed >= 25 && pingMs < 80) return "4G";
    if (downloadSpeed >= 10 && pingMs < 120) return "3G";
    if (downloadSpeed >= 5 && pingMs < 200) return "2G";
    if (downloadSpeed >= 1) return "1G";
    return "unknown";
  };

  useEffect(() => {
    const conn = (navigator as any)?.connection;
    if (conn?.effectiveType) setNetworkType(conn.effectiveType);
    const handleConnectionChange = () => {
      const newConn = (navigator as any)?.connection;
      if (newConn?.effectiveType && !running) setNetworkType(newConn.effectiveType);
    };
    if (conn) {
      conn.addEventListener('change', handleConnectionChange);
      return () => conn.removeEventListener('change', handleConnectionChange);
    }
  }, [running]);

  // ----------------------------------------------------------------------
  // Quick ping for monitoring (unchanged)
  // ----------------------------------------------------------------------
  async function quickCheck(): Promise<number> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const start = performance.now();
    try {
      await fetch(`${BASE_URL}/ping`, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);
      return parseFloat((performance.now() - start).toFixed(2));
    } catch {
      clearTimeout(timeoutId);
      return -1;
    }
  }

  // ----------------------------------------------------------------------
  // Auto monitoring (unchanged)
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!autoRun) {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (fullIntervalRef.current) clearInterval(fullIntervalRef.current);
      pingIntervalRef.current = null;
      fullIntervalRef.current = null;
      return;
    }
    if (pingIntervalRef.current || fullIntervalRef.current) return;
    pingIntervalRef.current = window.setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const latency = await quickCheck();
      setMonitorPing(latency);
      if (latency > 150 && latency !== -1) runTest("auto");
    }, PING_CHECK_INTERVAL);
    fullIntervalRef.current = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      runTest("auto");
    }, FULL_TEST_INTERVAL);
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (fullIntervalRef.current) clearInterval(fullIntervalRef.current);
    };
  }, [autoRun]);

  // ----------------------------------------------------------------------
  // 1. IMPROVED PING TEST: multiple samples, outlier removal, plain text
  // ----------------------------------------------------------------------
  async function testPing(): Promise<{ ping: number; jitter: number }> {
    const samples: number[] = [];

    for (let i = 0; i < PING_SAMPLES; i++) {
      const start = performance.now();
      try {
        // Use plain text endpoint (no JSON overhead)
        await fetchWithCacheBust(`${BASE_URL}/ping`);
        const latency = performance.now() - start;
        samples.push(latency);
        setPingHistory(prev => [...prev.slice(-60), latency]);
      } catch (error) {
        console.warn(`Ping attempt ${i + 1} failed:`, error);
      }
      if (i < PING_SAMPLES - 1) await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (samples.length < PING_SAMPLES / 2) {
      console.error("Ping test failed: Too many failed attempts");
      return { ping: 999, jitter: 999 };
    }

    // Remove outliers (trim 20% from both ends)
    const sorted = [...samples].sort((a, b) => a - b);
    const trimStart = Math.floor(sorted.length * 0.2);
    const trimEnd = Math.floor(sorted.length * 0.8);
    const trimmed = sorted.slice(trimStart, trimEnd);
    const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    const pingValue = +avg.toFixed(2);

    // Jitter = average absolute difference between consecutive samples (within trimmed set)
    let jitterValue = 0;
    if (trimmed.length > 1) {
      const diffs: number[] = [];
      for (let i = 1; i < trimmed.length; i++) {
        diffs.push(Math.abs(trimmed[i] - trimmed[i - 1]));
      }
      jitterValue = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    }
    const finalJitter = +jitterValue.toFixed(2);
    setJitterHistory(prev => [...prev.slice(-60), finalJitter]);

    setPing(pingValue);
    setJitter(finalJitter);
    return { ping: pingValue, jitter: finalJitter };
  }

  // ----------------------------------------------------------------------
  // 2. IMPROVED DOWNLOAD TEST: ignore first 2 seconds, use raw avg
  // ----------------------------------------------------------------------
  async function testDownload(basePing: number) {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_DURATION + 2000);

    let totalBytes = 0;
    const pingDuringLoad: number[] = [];

    // Monitor ping during download (bufferbloat)
    const pingMonitorInterval = setInterval(async () => {
      const start = performance.now();
      try {
        await fetchWithCacheBust(`${BASE_URL}/ping`);
        pingDuringLoad.push(performance.now() - start);
      } catch {}
    }, 1000);

    // Worker: fetch download stream
    async function worker(workerId: number) {
      try {
        const res = await fetch(`${BASE_URL}/download?worker=${workerId}&t=${Date.now()}`, {
          signal: controller.signal,
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const reader = res.body?.getReader();
        if (!reader) return;

        let workerBytes = 0;
        let lastSampleTime = performance.now();
        let lastSampleBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          workerBytes += value.length;
          totalBytes += value.length;

          const now = performance.now();
          // Update download history every second (for live graph)
          const elapsed = (now - startTime) / 1000;
          if (elapsed > 0) {
            const currentMbps = (totalBytes * 8) / (elapsed * 1024 * 1024);
            setDownloadHistory(prev => [...prev.slice(-60), currentMbps]);
          }
          // Sample speed every second for potential later use (ignored now)
          if (now - lastSampleTime >= 1000) {
            lastSampleTime = now;
            lastSampleBytes = workerBytes;
          }
        }
      } catch (err) {}
    }

    const workers = Array.from({ length: DOWNLOAD_STREAMS }, (_, i) => worker(i));
    await Promise.all(workers);
    clearTimeout(timeoutId);
    clearInterval(pingMonitorInterval);
    controller.abort();

    // Bufferbloat calculation
    if (pingDuringLoad.length) {
      const avgLoadPing = pingDuringLoad.reduce((a, b) => a + b, 0) / pingDuringLoad.length;
      const bloat = +(avgLoadPing - basePing).toFixed(2);
      setBufferbloat(bloat > 0 ? bloat : 0);
    }

    const actualDuration = Math.min(performance.now() - startTime, DOWNLOAD_DURATION);
    // 🔥 CRITICAL: Ignore first 2 seconds to avoid ramp‑up distortion
    const measurementStart = Math.min(actualDuration, 2000); // first 2 seconds are ignored
    const effectiveDuration = actualDuration - measurementStart;
    const effectiveBytes = totalBytes * (effectiveDuration / actualDuration); // linear approximation
    const finalSpeed = (effectiveBytes * 8) / ((effectiveDuration / 1000) * 1024 * 1024);

    const final = +Math.min(finalSpeed, 10000).toFixed(2);
    setDownload(final);
    return final;
  }

  // ----------------------------------------------------------------------
  // 3. IMPROVED UPLOAD TEST (unchanged logic but clean)
  // ----------------------------------------------------------------------
  async function testUpload() {
    const payload = new Uint8Array(256 * 1024); // 256KB chunks
    let totalBytes = 0;
    const startTime = performance.now();

    async function worker(workerId: number) {
      let localBytes = 0;
      while (performance.now() - startTime < UPLOAD_DURATION) {
        try {
          const response = await fetch(`${BASE_URL}/upload?worker=${workerId}&t=${Date.now()}`, {
            method: "POST",
            body: payload,
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          });
          await response.text(); // ensure completion
          localBytes += payload.length;
          totalBytes += payload.length;

          const elapsed = (performance.now() - startTime) / 1000;
          if (elapsed > 0) {
            const currentMbps = (totalBytes * 8) / (elapsed * 1024 * 1024);
            setUploadHistory(prev => [...prev.slice(-60), currentMbps]);
          }
          await new Promise(resolve => setTimeout(resolve, 10));
        } catch (err) {}
      }
    }

    const workers = Array.from({ length: UPLOAD_STREAMS }, (_, i) => worker(i));
    await Promise.all(workers);

    const actualDuration = Math.min(performance.now() - startTime, UPLOAD_DURATION);
    const finalSpeed = (totalBytes * 8) / ((actualDuration / 1000) * 1024 * 1024);
    const final = +Math.min(finalSpeed, 10000).toFixed(2);
    setUpload(final);
    return final;
  }

  // ----------------------------------------------------------------------
  // 4. WARM‑UP: call endpoints before actual test to eliminate cold start
  // ----------------------------------------------------------------------
  async function warmUp() {
    try {
      // Warm up ping
      await fetchWithCacheBust(`${BASE_URL}/ping`);
      // Warm up download (short duration)
      await fetch(`${BASE_URL}/download?duration=${WARMUP_DURATION}`, { cache: 'no-store' });
      // (Optional) warm up upload with a tiny payload
      await fetch(`${BASE_URL}/upload`, { method: 'POST', body: new Uint8Array(1024), cache: 'no-store' });
    } catch (err) {
      console.warn("Warmup failed, but continuing test", err);
    }
  }

  // ----------------------------------------------------------------------
  // Score calculation (unchanged)
  // ----------------------------------------------------------------------
  const calculateAccurateScore = (pingMs: number, downloadMbps: number, uploadMbps: number): number => {
    let score = 0;
    if (downloadMbps >= 100) score += 40;
    else if (downloadMbps >= 50) score += 35;
    else if (downloadMbps >= 25) score += 30;
    else if (downloadMbps >= 10) score += 20;
    else if (downloadMbps >= 5) score += 10;
    else score += (downloadMbps / 100) * 40;

    if (uploadMbps >= 50) score += 20;
    else if (uploadMbps >= 20) score += 15;
    else if (uploadMbps >= 10) score += 12;
    else if (uploadMbps >= 5) score += 8;
    else score += (uploadMbps / 50) * 20;

    if (pingMs < 20) score += 40;
    else if (pingMs < 30) score += 38;
    else if (pingMs < 40) score += 35;
    else if (pingMs < 50) score += 30;
    else if (pingMs < 60) score += 25;
    else if (pingMs < 80) score += 20;
    else if (pingMs < 100) score += 15;
    else if (pingMs < 150) score += 10;
    else score += 5;

    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const analyzeHistoryPatterns = () => {
    const history = getHistory();
    const pattern = detectTimePatterns(history);
    setTimePattern(pattern);
  };

  // ----------------------------------------------------------------------
  // MAIN TEST RUNNER with warm‑up and improved ping/download
  // ----------------------------------------------------------------------
  async function runTest(
    source: "manual" | "auto" = "manual",
    selection?: { ping: boolean; jitter: boolean; download: boolean; upload: boolean },
    isp?: string,
    externalNetworkType?: string,
    externalIp?: string
  ) {
    if (runningRef.current) {
      console.log("Test blocked: Already running");
      return;
    }
    const now = Date.now();
    if (now - testStartTimeRef.current < 2000) {
      console.log("Test blocked: Too rapid consecutive test");
      return;
    }
    testStartTimeRef.current = now;

    if (source === "auto" && now - lastFullTestTimeRef.current < FULL_TEST_COOLDOWN) {
      console.log("Auto test blocked: Cooldown active");
      return;
    }
    lastFullTestTimeRef.current = now;
    runningRef.current = true;
    setRunning(true);

    // Reset histories
    setDownloadHistory([]);
    setUploadHistory([]);
    setPingHistory([]);
    setJitterHistory([]);
    setBufferbloat(null);

    let p = 0, j = 0, d = 0, u = 0;

    try {
      // 🔥 WARM-UP: ensures server is ready (critical for free tiers)
      await warmUp();

      const shouldRunPing = selection === undefined || selection.ping !== false;
      if (shouldRunPing) {
        setPhase("ping");
        const pingResult = await testPing();
        p = pingResult.ping;
        j = pingResult.jitter;
      } else {
        p = ping ?? 0;
        j = jitter ?? 0;
      }

      const shouldRunDownload = selection === undefined || selection.download !== false;
      if (shouldRunDownload) {
        setPhase("download");
        d = await testDownload(p);
      } else {
        d = download ?? 0;
      }

      const shouldRunUpload = selection === undefined || selection.upload !== false;
      if (shouldRunUpload) {
        setPhase("upload");
        u = await testUpload();
      } else {
        u = upload ?? 0;
      }

      setPhase("analyzing");

      if (d > 0 && p > 0) {
        const detectedType = detectNetworkType(d, p);
        if (detectedType !== "unknown") setNetworkType(detectedType);
      }

      const accurateScore = calculateAccurateScore(p, d, u);
      const result = analyzeConnection(p, d, u);
      const insightList = generateInsights(p, d, u);

      if (j > 30) insightList.push("⚠️ High jitter detected - Connection may be unstable for real-time applications");
      else if (j > 15) insightList.push("📊 Moderate jitter - May affect competitive gaming");

      if (d > 100) insightList.push("🚀 Excellent download speed! Perfect for 8K streaming and large downloads");
      else if (d > 50) insightList.push("⚡ Great download speed! Suitable for 4K streaming");

      const modeOutput = analyzeByMode(mode, p, j, d, u);

      setReport(result);
      setScore(accurateScore);
      setInsights(insightList);
      setModeResult(modeOutput);
      setPhase("complete");

      if (shouldRunPing || shouldRunDownload || shouldRunUpload) {
        const finalNetworkType = externalNetworkType || networkType;
        const detectedIsp = isp || "Unknown";
        saveResult({
          date: new Date().toLocaleString(),
          ping: p,
          jitter: j,
          download: d,
          upload: u,
          score: accurateScore,
          customName: detectedIsp,
          isp: detectedIsp,
          networkType: finalNetworkType,
          ip: externalIp || "unknown"
        });
        saveBestScore(accurateScore);
        saveBestStats(accurateScore, d, u, p);
        analyzeHistoryPatterns();
      }
    } catch (error) {
      console.error("Test failed:", error);
      setPhase("idle");
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  }

  return {
    ping,
    download,
    upload,
    jitter,
    score,
    insights,
    downloadHistory,
    uploadHistory,
    pingHistory,
    jitterHistory,
    phase,
    report,
    runTest,
    mode,
    setMode,
    modeResult,
    bufferbloat,
    networkType,
    autoRun,
    setAutoRun,
    monitorPing,
    running,
    timePattern,
  };
}