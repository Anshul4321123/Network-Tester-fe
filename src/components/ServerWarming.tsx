// components/ServerWarming.tsx - With Logo component
import { useState, useEffect, useRef } from "react";
import Logo from "./Logo";

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
  "📱 The first smartphone with 5G was released in 2019!",
  "🌐 There are over 1.1 billion websites on the internet!",
  "🔒 The first SSL encryption was created in 1995!",
  "📧 The first email was sent in 1971 by Ray Tomlinson!",
  "🎥 YouTube was founded in 2005 by three former PayPal employees!",
  "📊 A good jitter score is under 10ms for competitive gaming!",
  "🏠 WiFi signals can be disrupted by microwaves and baby monitors!",
  "⚡ Fiber optic cables transmit data at the speed of light!",
  "🔄 Your IP address changes every time you reconnect to your router!",
  "📡 Ping stands for Packet Internet Groper!",
];

interface ServerWarmingProps {
  onComplete: () => void;
}

export default function ServerWarming({ onComplete }: ServerWarmingProps) {
  // Start with random fact
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * RANDOM_FACTS.length));
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("🔄 Connecting to server...");
  const [, setPingTime] = useState<number | null>(null);
  
  const factIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      if (factIntervalRef.current) clearInterval(factIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Function to cycle facts every 2 seconds
  const startFactRotation = () => {
    if (factIntervalRef.current) clearInterval(factIntervalRef.current);
    factIntervalRef.current = setInterval(() => {
      setFactIndex(prev => (prev + 1) % RANDOM_FACTS.length);
    }, 2000);
  };

  // Function to animate progress bar
  const startProgressAnimation = (duration: number) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      if (newProgress >= 100 && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }, 50);
  };

  useEffect(() => {
    const minWarmupTime = 3000;
    let isCompleted = false;

    const warmupServer = async () => {
      try {
        // Start rotating facts immediately
        startFactRotation();
        startProgressAnimation(minWarmupTime);
        
        setStatus("📡 Pinging server...");
        
        const pingStart = performance.now();
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/ping`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) throw new Error("Server not ready");
        
        const pingDuration = performance.now() - pingStart;
        setPingTime(pingDuration);
        setStatus(`✅ Server ready! (${pingDuration.toFixed(0)}ms response)`);
        
        // Wait for minimum warmup time
        const elapsed = Date.now() - pingStart;
        const remaining = Math.max(0, minWarmupTime - elapsed);
        
        timeoutRef.current = setTimeout(() => {
          if (!isCompleted) {
            isCompleted = true;
            if (factIntervalRef.current) clearInterval(factIntervalRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            onComplete();
          }
        }, remaining);
        
      } catch (error) {
        console.error("Server warmup failed:", error);
        setStatus("⚠️ Starting server... (first test may take longer)");
        
        startFactRotation();
        startProgressAnimation(4000);
        
        timeoutRef.current = setTimeout(() => {
          if (!isCompleted) {
            isCompleted = true;
            if (factIntervalRef.current) clearInterval(factIntervalRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            onComplete();
          }
        }, 4000);
      }
    };

    warmupServer();

    return () => {
      isCompleted = true;
    };
  }, [onComplete]);

  // Get status color
  const getStatusColor = () => {
    if (status.includes("ready")) return "#10b981";
    if (status.includes("Starting")) return "#f59e0b";
    return "#fff";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
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
          maxWidth: "450px",
          width: "90%",
          padding: "clamp(24px, 5vw, 32px)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
          <Logo variant="compact" size="large" />
        </div>
        
        {/* Title - Server Warming Up */}
        <h2 style={{ fontSize: "clamp(20px, 5vw, 24px)", fontWeight: "bold", marginBottom: "8px" }}>
          Server Warming Up
        </h2>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "24px" }}>
          Preparing optimal test environment
        </p>
        
        {/* Status with pulsing dot */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "20px",
            color: getStatusColor(),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              background: getStatusColor(),
              borderRadius: "50%",
              animation: "pulseDot 1.5s infinite",
            }}
          />
          {status}
        </div>
        
        {/* Linear Progress Bar - Sky Blue */}
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "rgba(56, 189, 248, 0.2)",
            borderRadius: "3px",
            margin: "20px 0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #38bdf8, #7dd3fc, #38bdf8)",
              borderRadius: "3px",
              transition: "width 0.05s linear",
              boxShadow: "0 0 8px rgba(56, 189, 248, 0.5)",
            }}
          />
        </div>
        
        {/* Fun Facts Section */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
            padding: "18px",
            marginTop: "16px",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            minHeight: "100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          key={factIndex}
        >
          <div style={{ fontSize: "11px", opacity: 0.6, marginBottom: "8px", letterSpacing: "1px", color: "#38bdf8" }}>
            ✨ FUN FACT
          </div>
          <div style={{ fontSize: "13px", fontWeight: "500", lineHeight: "1.5", color: "#cbd5e1" }}>
            {RANDOM_FACTS[factIndex]}
          </div>
        </div>
        
        {/* Tip */}
        <div
          style={{
            fontSize: "10px",
            opacity: 0.5,
            marginTop: "24px",
            color: "#94a3b8",
          }}
        >
          ⚡ First test may take slightly longer for accurate results
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
        
        @keyframes pulseDot {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}