// hooks/useSpeedTest.ts
import { useState, useEffect, useRef } from "react";
import type { TestPhase } from "../types/speedTestTypes";
import {
  analyzeConnection,
  calculateScore,
  generateInsights,
  analyzeByMode
} from "../utils/connectionAnalyzer";
import type { ConnectionReport, TestMode } from "../utils/connectionAnalyzer";
import {
  saveResult,
  saveBestScore,
  saveBestStats
} from "../utils/storage";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/*
─────────────────────────────────────────
CONFIG (COST OPTIMIZED)
─────────────────────────────────────────
*/
const FULL_TEST_COOLDOWN = 10 * 60 * 1000;
const PING_CHECK_INTERVAL = 5 * 60 * 1000;
const FULL_TEST_INTERVAL  = 30 * 60 * 1000;
const DOWNLOAD_STREAMS = 4;
const DOWNLOAD_DURATION = 5000;
const UPLOAD_STREAMS = 3;
const UPLOAD_DURATION = 5000;

export default function useSpeedTest() {

  /*
  ─────────────────────────────────────────
  STATE
  ─────────────────────────────────────────
  */
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

  /*
  ─────────────────────────────────────────
  REFS (NO STALE STATE BUGS)
  ─────────────────────────────────────────
  */
  const runningRef = useRef(false);
  const lastFullTestTimeRef = useRef(0);
  const pingIntervalRef = useRef<number | null>(null);
  const fullIntervalRef = useRef<number | null>(null);
  const testStartTimeRef = useRef(0);
  const [running, setRunning] = useState(false);

  /*
  ─────────────────────────────────────────
  NETWORK TYPE DETECTION
  ─────────────────────────────────────────
  */
  useEffect(() => {
    const conn = (navigator as any)?.connection;
    if (conn?.effectiveType) {
      setNetworkType(conn.effectiveType);
    }
  }, []);

  /*
  ─────────────────────────────────────────
  QUICK PING (CHEAP)
  ─────────────────────────────────────────
  */
  async function quickCheck(): Promise<number> {
    const start = performance.now();
    try {
      await fetch(`${BASE_URL}/ping`);
      return parseFloat((performance.now() - start).toFixed(2));
    } catch {
      return -1;
    }
  }

  /*
  ─────────────────────────────────────────
  SMART AUTO MONITORING
  ─────────────────────────────────────────
  */
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
      if (latency > 150) {
        runTest("auto");
      }
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

  /*
  ─────────────────────────────────────────
  PING TEST
  ─────────────────────────────────────────
  */
  async function testPing() {
    const values: number[] = [];

    for (let i = 0; i < 8; i++) {
      const start = performance.now();
      await fetch(`${BASE_URL}/ping`);
      const latency = performance.now() - start;
      values.push(latency);
      setPingHistory(prev => [...prev.slice(-40), latency]);
    }

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const pingValue = +avg.toFixed(2);

    const jitterValue =
      values.slice(1).reduce((sum, v, i) =>
        sum + Math.abs(v - values[i]), 0
      ) / (values.length - 1);

    const finalJitter = +jitterValue.toFixed(2);
    setJitterHistory(prev => [...prev.slice(-40), finalJitter]);

    setPing(pingValue);
    setJitter(finalJitter);

    return { ping: pingValue, jitter: finalJitter };
  }

  /*
  ─────────────────────────────────────────
  DOWNLOAD TEST (OPTIMIZED)
  ─────────────────────────────────────────
  */
  async function testDownload(basePing: number) {
    const startTime = performance.now();
    const controller = new AbortController();
    setTimeout(() => controller.abort(), DOWNLOAD_DURATION);

    let totalBytes = 0;
    const pingDuringLoad: number[] = [];

    const interval = setInterval(async () => {
      const start = performance.now();
      try {
        await fetch(`${BASE_URL}/ping`);
        pingDuringLoad.push(performance.now() - start);
      } catch {}
    }, 500);

    async function worker() {
      try {
        const res = await fetch(`${BASE_URL}/download`, {
          signal: controller.signal
        });

        const reader = res.body?.getReader();
        if (!reader) return;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          totalBytes += value.length;

          const elapsed = (performance.now() - startTime) / 1000;
          const mbps = (totalBytes * 8) / (elapsed * 1024 * 1024);

          setDownloadHistory(prev => [...prev.slice(-40), mbps]);
        }

      } catch {}
    }

    await Promise.all(Array.from({ length: DOWNLOAD_STREAMS }, worker));
    clearInterval(interval);

    if (pingDuringLoad.length) {
      const avg = pingDuringLoad.reduce((a, b) => a + b, 0) / pingDuringLoad.length;
      setBufferbloat(+(avg - basePing).toFixed(2));
    }

    const speed = (totalBytes * 8) / ((DOWNLOAD_DURATION / 1000) * 1024 * 1024);
    const final = +speed.toFixed(2);

    setDownload(final);
    return final;
  }

  /*
  ─────────────────────────────────────────
  UPLOAD TEST (OPTIMIZED)
  ─────────────────────────────────────────
  */
  async function testUpload() {
    const payload = new Uint8Array(128 * 1024);
    let totalBytes = 0;
    const startTime = performance.now();

    async function worker() {
      while (performance.now() - startTime < UPLOAD_DURATION) {
        await fetch(`${BASE_URL}/upload`, {
          method: "POST",
          body: payload
        });

        totalBytes += payload.length;

        const elapsed = (performance.now() - startTime) / 1000;
        const mbps = (totalBytes * 8) / (elapsed * 1024 * 1024);

        setUploadHistory(prev => [...prev.slice(-40), mbps]);
      }
    }

    await Promise.all(Array.from({ length: UPLOAD_STREAMS }, worker));

    const speed = (totalBytes * 8) / ((UPLOAD_DURATION / 1000) * 1024 * 1024);
    const final = +speed.toFixed(2);

    setUpload(final);
    return final;
  }

  /*
  ─────────────────────────────────────────
  MAIN TEST RUNNER
  source: "manual" | "auto"
  ─────────────────────────────────────────
  */
  async function runTest(
    source: "manual" | "auto" = "manual", 
    selection?: { ping: boolean; jitter: boolean; download: boolean; upload: boolean },
    isp?: string,
    networkType?: string
  ) {
    // Prevent multiple simultaneous test runs
    if (runningRef.current) return;

    // Prevent rapid consecutive test runs (debounce - 1 second)
    const now = Date.now();
    if (now - testStartTimeRef.current < 1000) {
      console.log("Test blocked: Too rapid consecutive test");
      return;
    }
    testStartTimeRef.current = now;

    if (source === "auto" && now - lastFullTestTimeRef.current < FULL_TEST_COOLDOWN) return;

    lastFullTestTimeRef.current = now;

    runningRef.current = true;
    setRunning(true);

    // Reset histories
    setDownloadHistory([]);
    setUploadHistory([]);
    setPingHistory([]);
    setJitterHistory([]);
    setBufferbloat(null);
    
    // Reset values that will be tested
    if (selection?.ping === false) {
      setPing(null);
    }
    if (selection?.jitter === false) {
      setJitter(null);
    }
    if (selection?.download === false) {
      setDownload(null);
    }
    if (selection?.upload === false) {
      setUpload(null);
    }

    // Default values if tests are skipped
    let p: number = 0;
    let j: number = 0;
    let d: number = 0;
    let u: number = 0;

    // Run ping test if selected (or if no selection provided, run all)
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

    // Run download test if selected
    const shouldRunDownload = selection === undefined || selection.download !== false;
    if (shouldRunDownload) {
      setPhase("download");
      d = await testDownload(p);
    } else {
      d = download ?? 0;
    }

    // Run upload test if selected
    const shouldRunUpload = selection === undefined || selection.upload !== false;
    if (shouldRunUpload) {
      setPhase("upload");
      u = await testUpload();
    } else {
      u = upload ?? 0;
    }

    setPhase("analyzing");

    const result = analyzeConnection(p, d, u);
    const scoreValue = calculateScore(p, d, u);
    const insightList = generateInsights(p, d, u);
    const modeOutput = analyzeByMode(mode, p, j, d, u);

    setReport(result);
    setScore(scoreValue);
    setInsights(insightList);
    setModeResult(modeOutput);

    setPhase("complete");

    runningRef.current = false;
    setRunning(false);

    // Only save if we have actual data
    if (shouldRunPing || shouldRunDownload || shouldRunUpload) {
      saveResult({
        date: new Date().toLocaleString(),
        ping: p,
        jitter: j,
        download: d,
        upload: u,
        score: scoreValue,
        isp: isp || "Unknown",
        networkType: networkType || "unknown"
      });

      saveBestScore(scoreValue);
      saveBestStats(scoreValue, d, u, p);
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
    running
  };
}