// components/NetworkInfo.tsx - Uses test results, no auto-refresh on triggerRefresh
import { useEffect, useState, useRef } from "react";

interface NetworkInfoProps {
  triggerRefresh?: number;
  onNetworkDetected?: (type: string) => void;
  testPing?: number | null;
  testJitter?: number | null;
  testDownload?: number | null;
  testUpload?: number | null;
}

interface NetworkInfoState {
  type: string;
  latency: number | null;
  isMeasuring: boolean;
  jitter: number | null;
  download: number | null;
  upload: number | null;
}

interface ConfigType {
  name: string;
  icon: string;
  gradient: string;
  description: string;
  speed: string;
  latency: string;
  signalText: string;
  signalBars: number;
  signalColor: string;
  qualityBadge: { text: string; color: string } | null;
  jitter: number | null;
}

export default function NetworkInfo({  
  onNetworkDetected,
  testPing,
  testJitter,
  testDownload,
  testUpload
}: NetworkInfoProps) {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoState>({
    type: "unknown",
    latency: null,
    isMeasuring: false,
    jitter: null,
    download: null,
    upload: null,
  });
  
  const hasMeasured = useRef(false);
  const measureInProgress = useRef(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getNetworkType = (latency: number, browserType: string | undefined): string => {
    if (browserType) {
      switch (browserType) {
        case "4g": return "4G";
        case "3g": return "3G";
        case "2g": return "2G";
        case "slow-2g": return "2G";
        default: break;
      }
    }
    if (latency < 40) return "5G";
    if (latency < 70) return "4G";
    if (latency < 120) return "3G";
    if (latency < 250) return "2G";
    return "1G";
  };

  // Initial quick detection (only once)
  const quickMeasure = async () => {
    if (measureInProgress.current || hasMeasured.current) return;
    measureInProgress.current = true;
    setNetworkInfo(prev => ({ ...prev, isMeasuring: true }));
    
    try {
      const start = performance.now();
      await fetch(`${BASE_URL}/ping`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const latency = performance.now() - start;
      const connection = (navigator as any).connection;
      const browserType = connection?.effectiveType;
      const type = getNetworkType(latency, browserType);
      
      setNetworkInfo(prev => ({
        ...prev,
        type,
        latency,
        isMeasuring: false,
        jitter: null,
        download: null,
        upload: null,
      }));
      
      hasMeasured.current = true;
      if (onNetworkDetected) onNetworkDetected(type.toLowerCase());
    } catch (error) {
      setNetworkInfo(prev => ({ ...prev, isMeasuring: false }));
    }
    measureInProgress.current = false;
  };

  // Manual full measurement (when user clicks refresh button)
  const fullMeasure = async () => {
    if (measureInProgress.current) return;
    measureInProgress.current = true;
    setNetworkInfo(prev => ({ ...prev, isMeasuring: true }));
    
    try {
      const pingCount = 5;
      const pingTimes: number[] = [];
      for (let i = 0; i < pingCount; i++) {
        const start = performance.now();
        await fetch(`${BASE_URL}/ping`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        pingTimes.push(performance.now() - start);
      }
      const avgLatency = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
      let jitter = 0;
      if (pingTimes.length > 1) {
        const diffs: number[] = [];
        for (let i = 1; i < pingTimes.length; i++) {
          diffs.push(Math.abs(pingTimes[i] - pingTimes[i - 1]));
        }
        jitter = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      }
      const connection = (navigator as any).connection;
      const browserType = connection?.effectiveType;
      const type = getNetworkType(avgLatency, browserType);
      
      setNetworkInfo({
        type,
        latency: avgLatency,
        isMeasuring: false,
        jitter,
        download: null,
        upload: null,
      });
      
      hasMeasured.current = true;
      if (onNetworkDetected) onNetworkDetected(type.toLowerCase());
    } catch (error) {
      setNetworkInfo(prev => ({ ...prev, isMeasuring: false }));
    }
    measureInProgress.current = false;
  };

  useEffect(() => {
    quickMeasure();
  }, []);

  // 🔥 IMPORTANT: Do NOT auto‑refresh on triggerRefresh.
  // Instead, let the test results update the display.
  // The refresh button still works.

  // When real test results arrive, override everything
  useEffect(() => {
    if (testPing !== undefined && testPing !== null) {
      setNetworkInfo(prev => ({
        ...prev,
        latency: testPing,
        jitter: testJitter ?? prev.jitter,
        download: testDownload ?? prev.download,
        upload: testUpload ?? prev.upload,
        // Keep the network type (browser-reported) unchanged
      }));
    }
  }, [testPing, testJitter, testDownload, testUpload]);

  const getConfig = (): ConfigType => {
    if (!navigator.onLine) {
      return {
        name: "Offline",
        icon: "⚠️",
        gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
        description: "No internet connection",
        speed: "0 Mbps",
        latency: "∞ ms",
        signalText: "No Signal",
        signalBars: 0,
        signalColor: "#64748b",
        qualityBadge: null,
        jitter: null,
      };
    }
    
    if (networkInfo.isMeasuring) {
      return {
        name: "Detecting...",
        icon: "🔄",
        gradient: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
        description: "Measuring connection...",
        speed: "...",
        latency: "...",
        signalText: "...",
        signalBars: 2,
        signalColor: "#94a3b8",
        qualityBadge: null,
        jitter: null,
      };
    }
    
    const latency = networkInfo.latency;
    const getSignalInfo = () => {
      if (!latency) return { bars: 2, text: "Fair", color: "#f59e0b" };
      if (latency < 35) return { bars: 4, text: "Excellent", color: "#10b981" };
      if (latency < 55) return { bars: 4, text: "Great", color: "#10b981" };
      if (latency < 80) return { bars: 3, text: "Good", color: "#3b82f6" };
      if (latency < 120) return { bars: 2, text: "Fair", color: "#f59e0b" };
      if (latency < 250) return { bars: 1, text: "Weak", color: "#ef4444" };
      return { bars: 1, text: "Very Weak", color: "#dc2626" };
    };
    const signal = getSignalInfo();
    
    const getEstimatedSpeed = () => {
      if (networkInfo.download && networkInfo.download > 0) {
        if (networkInfo.download >= 100) return "100+ Mbps";
        if (networkInfo.download >= 50) return "50-100 Mbps";
        if (networkInfo.download >= 25) return "25-50 Mbps";
        if (networkInfo.download >= 10) return "10-25 Mbps";
        if (networkInfo.download >= 5) return "5-10 Mbps";
        return "<5 Mbps";
      }
      switch (networkInfo.type) {
        case "5G": return "100+ Mbps";
        case "4G+": return "50-100 Mbps";
        case "4G": return "25-50 Mbps";
        case "3G": return "5-25 Mbps";
        case "2G": return "1-5 Mbps";
        case "1G": return "<1 Mbps";
        default: return "? Mbps";
      }
    };
    
    const getDescription = () => {
      switch (networkInfo.type) {
        case "5G": return "Ultra-fast - Perfect for 4K streaming";
        case "4G+": return "Very fast - Great for 4K streaming";
        case "4G": return "Fast - Great for HD streaming & gaming";
        case "3G": return "Moderate - Suitable for music & browsing";
        case "2G": return "Slow - Basic browsing only";
        case "1G": return "Very Slow - Text only";
        default: return "Connection detected";
      }
    };
    
    const getGradient = () => {
      switch (networkInfo.type) {
        case "5G": return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
        case "4G+": return "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)";
        case "4G": return "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
        case "3G": return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
        case "2G": return "linear-gradient(135deg, #f97316 0%, #ea580c 100%)";
        case "1G": return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        default: return "linear-gradient(135deg, #64748b 0%, #475569 100%)";
      }
    };
    
    const getQualityBadge = () => {
      if (!latency) return null;
      if (latency < 35) return { text: "EXCELLENT", color: "#10b981" };
      if (latency < 55) return { text: "GREAT", color: "#10b981" };
      if (latency < 80) return { text: "GOOD", color: "#3b82f6" };
      if (latency < 120) return { text: "FAIR", color: "#f59e0b" };
      return { text: "POOR", color: "#ef4444" };
    };
    
    return {
      name: networkInfo.type,
      icon: networkInfo.type === "5G" ? "🚀" : "📶",
      gradient: getGradient(),
      description: getDescription(),
      speed: getEstimatedSpeed(),
      latency: latency ? `${latency.toFixed(0)} ms` : "? ms",
      signalText: signal.text,
      signalBars: signal.bars,
      signalColor: signal.color,
      qualityBadge: getQualityBadge(),
      jitter: networkInfo.jitter,
    };
  };

  const config = getConfig();

  return (
    <div
      style={{
        background: config.gradient,
        borderRadius: "14px",
        padding: "12px 16px",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {config.qualityBadge && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
          <span style={{
            background: "rgba(0,0,0,0.3)",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "9px",
            fontWeight: "600",
            color: config.qualityBadge.color,
          }}>
            {config.qualityBadge.text}
          </span>
        </div>
      )}
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            animation: networkInfo.isMeasuring ? "spin 1s linear infinite" : "none",
          }}>
            {config.icon}
          </div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
              {config.name}
              {config.name === "5G" && (
                <span style={{
                  background: "rgba(255,255,255,0.3)",
                  padding: "2px 6px",
                  borderRadius: "12px",
                  fontSize: "9px",
                  fontWeight: "600",
                }}>
                  ULTRA
                </span>
              )}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.9 }}>{config.description}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold" }}>
            {config.speed}
          </div>
          <div style={{ fontSize: "10px", opacity: 0.8 }}>
            📡 {config.latency}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "20px" }}>
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              style={{
                width: "5px",
                height: `${bar * 5}px`,
                background: bar <= config.signalBars ? config.signalColor : "rgba(255,255,255,0.3)",
                borderRadius: "1px",
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: "10px", opacity: 0.8 }}>
          Signal: {config.signalText}
        </span>
      </div>
      
      {config.jitter !== null && config.jitter > 0 && (
        <div style={{ 
          marginTop: "6px", 
          fontSize: "9px", 
          opacity: 0.7,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <span>⚡</span>
          <span>Jitter: {config.jitter.toFixed(1)} ms</span>
          <span style={{ 
            color: config.jitter < 15 ? "#10b981" : config.jitter < 30 ? "#f59e0b" : "#ef4444" 
          }}>
            {config.jitter < 15 ? "Stable" : config.jitter < 30 ? "Moderate" : "Unstable"}
          </span>
        </div>
      )}
      
      <div style={{ 
        marginTop: "10px", 
        fontSize: "9px", 
        opacity: 0.6,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        justifyContent: "center",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        paddingTop: "8px",
      }}>
        <span>💡</span>
        <span>Run a speed test for accurate results</span>
      </div>
      
      <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => fullMeasure()}
          disabled={networkInfo.isMeasuring}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "16px",
            padding: "3px 10px",
            fontSize: "9px",
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.2s",
            opacity: networkInfo.isMeasuring ? 0.5 : 0.7,
          }}
          onMouseEnter={(e) => {
            if (!networkInfo.isMeasuring) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
        >
          {networkInfo.isMeasuring ? "📡 Measuring..." : "🔄 Refresh"}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}