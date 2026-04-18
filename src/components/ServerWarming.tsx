// components/ServerWarming.tsx - FIXED with proper random fact cycling
import { useState, useEffect, useRef } from "react";

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
  const [currentFact, setCurrentFact] = useState(RANDOM_FACTS[0]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("🔄 Connecting to server...");
  const [, setPingTime] = useState<number | null>(null);
  const factIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Function to get random fact (different from current)
  const getRandomFact = (currentFactText: string) => {
    let newFact = currentFactText;
    while (newFact === currentFactText && RANDOM_FACTS.length > 1) {
      const randomIndex = Math.floor(Math.random() * RANDOM_FACTS.length);
      newFact = RANDOM_FACTS[randomIndex];
    }
    return newFact;
  };

  // Start random fact rotation
  const startFactRotation = () => {
    if (factIntervalRef.current) clearInterval(factIntervalRef.current);
    
    // Change fact every 2 seconds
    factIntervalRef.current = setInterval(() => {
      setCurrentFact(prev => getRandomFact(prev));
    }, 2000);
  };

  // Start progress bar animation
  const startProgressAnimation = (duration: number) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    const startTime = Date.now();
    const stepTime = 50; // Update every 50ms for smooth animation
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, stepTime);
  };

  useEffect(() => {
    const minWarmupTime = 3000; // Minimum 3 seconds for better user experience
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
        
        setTimeout(() => {
          if (!isCompleted) {
            isCompleted = true;
            // Clear intervals
            if (factIntervalRef.current) clearInterval(factIntervalRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            onComplete();
          }
        }, remaining);
        
      } catch (error) {
        console.error("Server warmup failed:", error);
        setStatus("⚠️ Starting server... (first test may take longer)");
        
        // Still show facts while waiting
        startFactRotation();
        startProgressAnimation(4000);
        
        setTimeout(() => {
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
      if (factIntervalRef.current) clearInterval(factIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [onComplete]);

  // Get status color based on ping time
  const getStatusColor = () => {
    if (status.includes("ready")) return "#10b981";
    if (status.includes("Server")) return "#f59e0b";
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
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
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
        {/* Animated Logo */}
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: "40px" }}>⚡</span>
        </div>
        
        {/* Title */}
        <h2 style={{ fontSize: "clamp(20px, 5vw, 24px)", fontWeight: "bold", marginBottom: "8px" }}>
          SpeedLab
        </h2>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "24px" }}>
          Preparing your speed test...
        </p>
        
        {/* Status */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "16px",
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
              animation: "pulse 1.5s infinite",
            }}
          />
          {status}
        </div>
        
        {/* Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "3px",
            margin: "20px 0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981)",
              borderRadius: "3px",
              transition: "width 0.05s linear",
            }}
          />
        </div>
        
        {/* Random Fact Card - Changes every 2 seconds */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
            padding: "18px",
            marginTop: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "factFade 0.5s ease",
            minHeight: "100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          key={currentFact} // This forces re-animation when fact changes
        >
          <div style={{ fontSize: "11px", opacity: 0.6, marginBottom: "8px", letterSpacing: "1px" }}>
            ✨ DID YOU KNOW?
          </div>
          <div style={{ fontSize: "13px", fontWeight: "500", lineHeight: "1.5", color: "#cbd5e1" }}>
            {currentFact}
          </div>
        </div>
        
        {/* Tip */}
        <div
          style={{
            fontSize: "10px",
            opacity: 0.5,
            marginTop: "24px",
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
        @keyframes factFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}