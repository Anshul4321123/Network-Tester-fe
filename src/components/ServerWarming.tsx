// components/ServerWarming.tsx
import { useState, useEffect } from "react";

const RANDOM_FACTS = [
  "💡 Did you know? The first internet speed test was created in 1996!",
  "⚡ The fastest internet speed ever recorded is 319 Tbps (Terabits per second)!",
  "🌊 The first underwater internet cable was laid in 1858 (for telegraph)!",
  "🎮 Gaming requires less than 50ms ping for a smooth experience!",
  "📺 Streaming 4K Netflix needs about 25 Mbps download speed!",
  "🐌 The average global internet speed is around 90 Mbps!",
  "🚀 5G can be up to 100x faster than 4G!",
  "💾 The first website ever created is still online (info.cern.ch)!",
  "🌍 There are over 5 billion internet users worldwide!",
  "🔌 The first WiFi network was called 'WaveLAN' and ran at 2 Mbps!",
  "📡 Ping measures the time data takes to travel to the server and back!",
  "🎯 Jitter is the variation in ping - lower is better for gaming!",
  "🏆 SpeedLab's scoring system considers download (40%), upload (20%), and ping (40%)!",
  "💪 Your internet speed can be affected by your router, devices, and even weather!",
  "🔄 Speed tests use multiple parallel connections for accuracy!",
];

interface ServerWarmingProps {
  onComplete: () => void;
}

export default function ServerWarming({ onComplete }: ServerWarmingProps) {
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("🔄 Connecting to server...");

  useEffect(() => {
    const startTime = Date.now();
    const minWarmupTime = 2000;
    let interval: ReturnType<typeof setInterval> | null = null;

    const warmupServer = async () => {
      try {
        setStatus("📡 Pinging server...");
        const pingStart = performance.now();
        await fetch(`${import.meta.env.VITE_BASE_URL}/ping`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const pingTime = performance.now() - pingStart;
        setStatus(`✅ Server responded in ${pingTime.toFixed(0)}ms!`);
        
        interval = setInterval(() => {
          setFactIndex(prev => (prev + 1) % RANDOM_FACTS.length);
          setProgress(prev => Math.min(prev + 10, 100));
        }, 200);
        
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minWarmupTime - elapsed);
        
        setTimeout(() => {
          if (interval) clearInterval(interval);
          onComplete();
        }, remaining);
        
      } catch (error) {
        console.error("Server warmup failed:", error);
        setStatus("⚠️ Server starting up... (first test may take longer)");
        
        setTimeout(() => {
          if (interval) clearInterval(interval);
          onComplete();
        }, 3000);
      }
    };

    warmupServer();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "#fff",
          maxWidth: "400px",
          padding: "32px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            border: "4px solid rgba(255,255,255,0.2)",
            borderTop: "4px solid #fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        
        <div
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          {status}
        </div>
        
        <div
          style={{
            width: "100%",
            height: "4px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "2px",
            margin: "16px 0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#fff",
              borderRadius: "2px",
              transition: "width 0.2s ease",
            }}
          />
        </div>
        
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: "16px",
            padding: "16px",
            marginTop: "16px",
            animation: "slideUp 0.3s ease",
          }}
        >
          <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "8px" }}>
            ✨ Did you know?
          </div>
          <div style={{ fontSize: "14px", fontWeight: "500", lineHeight: "1.5" }}>
            {RANDOM_FACTS[factIndex]}
          </div>
        </div>
        
        <div
          style={{
            fontSize: "11px",
            opacity: 0.6,
            marginTop: "24px",
          }}
        >
          Warming up server for best performance...
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}