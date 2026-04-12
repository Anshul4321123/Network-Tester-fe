// components/ProblemDiagnosis.tsx
import { useEffect, useState } from "react";

interface Diagnosis {
  type: "isp" | "wifi" | "device" | "congestion" | "throttling";
  message: string;
  suggestion: string;
  severity: "high" | "medium" | "low";
}

interface ProblemDiagnosisProps {
  ping: number | null;
  download: number | null;
  upload: number | null;
  jitter: number | null;
  bufferbloat: number | null;
  networkType: string;
}

export default function ProblemDiagnosis({ 
  ping, download, upload, jitter, bufferbloat, networkType 
}: ProblemDiagnosisProps) {
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);

  useEffect(() => {
    if (download === null || ping === null) return;

    const analyzeProblems = () => {
      // ISP Throttling detection
      if (bufferbloat && bufferbloat > 50 && download && download < 50) {
        return {
          type: "throttling" as const,
          message: "Your ISP may be throttling your connection",
          suggestion: "Try using a VPN to see if speeds improve. Some ISPs limit streaming/gaming traffic.",
          severity: "high" as const,
        };
      }
      
      // WiFi bottleneck detection
      if (networkType === "wifi" && download && download < 50 && ping && ping > 50) {
        return {
          type: "wifi" as const,
          message: "Your WiFi is likely the bottleneck",
          suggestion: "Try moving closer to your router, switching to 5GHz band, or using an Ethernet cable.",
          severity: "high" as const,
        };
      }
      
      // Network congestion
      if (jitter && jitter > 20 && download && download < 50) {
        return {
          type: "congestion" as const,
          message: "Network congestion detected",
          suggestion: "Other devices might be using bandwidth. Check for background downloads/streams.",
          severity: "medium" as const,
        };
      }
      
      // Device limitation
      if (download && download < 25 && ping && ping < 50 && upload && upload < 10) {
        return {
          type: "device" as const,
          message: "Your device might be limiting speeds",
          suggestion: "Close background apps, update network drivers, or test on another device.",
          severity: "medium" as const,
        };
      }
      
      // ISP congestion (peak hours)
      if (download && download > 25 && download < 50 && new Date().getHours() > 18) {
        return {
          type: "congestion" as const,
          message: "ISP congestion during peak hours",
          suggestion: "Test again in the morning. Evening speeds are often slower due to neighborhood usage.",
          severity: "low" as const,
        };
      }
      
      return null;
    };
    
    const result = analyzeProblems();
    setDiagnosis(result);
  }, [ping, download, upload, jitter, bufferbloat, networkType]);

  if (!diagnosis) return null;

  const getSeverityColor = () => {
    switch (diagnosis.severity) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
    }
  };

  const getIcon = () => {
    switch (diagnosis.type) {
      case "isp": return "🏢";
      case "wifi": return "📡";
      case "device": return "📱";
      case "congestion": return "🚦";
      case "throttling": return "⛔";
      default: return "🔍";
    }
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${getSeverityColor()}15 0%, ${getSeverityColor()}08 100%)`,
        borderRadius: "14px",
        padding: "12px 16px",
        borderLeft: `3px solid ${getSeverityColor()}`,
        marginBottom: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <span style={{ fontSize: "20px" }}>{getIcon()}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", color: getSeverityColor() }}>
            {diagnosis.message}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            💡 {diagnosis.suggestion}
          </div>
        </div>
      </div>
    </div>
  );
}