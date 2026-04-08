import { useState } from "react";
import type { TestPhase } from "../types/speedTestTypes";
import {
  analyzeConnection,
  calculateScore,
  generateInsights // ✅ IMPORT FROM UTILS
} from "../utils/connectionAnalyzer";
import type { ConnectionReport } from "../utils/connectionAnalyzer";
import { saveResult } from "../utils/storage";

const BASE_URL = import.meta.env.VITE_BASE_URL;

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

  const [running, setRunning] = useState(false);

  /*
  ----------------
  PING TEST
  ----------------
  */

  async function testPing(): Promise<{ ping: number; jitter: number }> {
    const attempts = 10;
    const values: number[] = [];

    for (let i = 0; i < attempts; i++) {
      const start = performance.now();
      await fetch(`${BASE_URL}/ping`);
      const latency = performance.now() - start;
      values.push(latency);
    }

    const avg = values.reduce((a, b) => a + b, 0) / attempts;
    const pingValue = parseFloat(avg.toFixed(2));

    const diffs: number[] = [];
    for (let i = 1; i < values.length; i++) {
      diffs.push(Math.abs(values[i] - values[i - 1]));
    }

    const jitterValue =
      diffs.reduce((a, b) => a + b, 0) / diffs.length;

    const finalJitter = parseFloat(jitterValue.toFixed(2));

    setPing(pingValue);
    setJitter(finalJitter);

    return { ping: pingValue, jitter: finalJitter };
  }

  /*
  ----------------
  DOWNLOAD TEST
  ----------------
  */

  async function testDownload(): Promise<number> {
    const streams = 8;
    const duration = 7000;

    const startTime = performance.now();
    const controller = new AbortController();
    setTimeout(() => controller.abort(), duration);

    const workerBytes = new Array(streams).fill(0);

    async function worker(index: number) {
      try {
        const response = await fetch(
          `${BASE_URL}/download?duration=10000`,
          { signal: controller.signal }
        );

        const reader = response.body?.getReader();
        if (!reader) return;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          workerBytes[index] += value.length;

          const totalBytes = workerBytes.reduce((a, b) => a + b, 0);
          const elapsed = (performance.now() - startTime) / 1000;

          const mbps =
            (totalBytes * 8) / (elapsed * 1024 * 1024);

          setDownloadHistory(prev => [
            ...prev.slice(-40),
            mbps
          ]);
        }
      } catch {}
    }

    await Promise.all(workerBytes.map((_, i) => worker(i)));

    const totalBytes = workerBytes.reduce((a, b) => a + b, 0);

    const speed =
      (totalBytes * 8) / ((duration / 1000) * 1024 * 1024);

    const final = parseFloat(speed.toFixed(2));
    setDownload(final);
    return final;
  }

  /*
  ----------------
  UPLOAD TEST
  ----------------
  */

  async function testUpload(): Promise<number> {
    const streams = 4;
    const duration = 7000;
    const warmup = 2000;

    const chunkSize = 256 * 1024;
    const payload = new Uint8Array(chunkSize);

    let totalBytes = 0;
    const startTime = performance.now();

    async function worker() {
      while (true) {
        const now = performance.now();
        if (now - startTime > duration) break;

        await fetch(`${BASE_URL}/upload`, {
          method: "POST",
          body: payload,
          headers: {
            "Content-Type": "application/octet-stream"
          }
        });

        const elapsed = performance.now() - startTime;

        if (elapsed > warmup && elapsed < duration) {
          totalBytes += chunkSize;

          const mbps =
            (totalBytes * 8) /
            ((elapsed / 1000) * 1024 * 1024);

          setUploadHistory(prev => [
            ...prev.slice(-40),
            mbps
          ]);
        }
      }
    }

    await Promise.all(Array.from({ length: streams }, worker));

    const speed =
      (totalBytes * 8) /
      (((duration - warmup) / 1000) * 1024 * 1024);

    const final = parseFloat(speed.toFixed(2));
    setUpload(final);
    return final;
  }

  /*
  ----------------
  RUN TEST
  ----------------
  */

  async function runTest() {
    if (running) return;

    setRunning(true);
    setReport(null);
    setInsights([]);

    setDownloadHistory([]);
    setUploadHistory([]);

    setPhase("ping");
    const { ping: p, jitter: j } = await testPing();

    setPhase("download");
    const d = await testDownload();

    setPhase("upload");
    const u = await testUpload();

    setPhase("analyzing");

    const result = analyzeConnection(p, d, u);
    const scoreValue = calculateScore(p, d, u);
    const insightList = generateInsights(p, d, u); // ✅ FROM UTILS

    setReport(result);
    setScore(scoreValue);
    setInsights(insightList);

    setPhase("complete");
    setRunning(false);

    saveResult({
      date: new Date().toLocaleString(),
      ping: p,
      jitter: j,
      download: d,
      upload: u,
      score: scoreValue
    });
  }

  return {
    ping,
    download,
    upload,
    jitter,
    score,
    insights, // ✅ IMPORTANT
    downloadHistory,
    uploadHistory,
    running,
    phase,
    report,
    runTest
  };
}