// Hero.tsx - Updated to work with your MetricCard
import { useState } from "react";
import StartTestButton from "./StartTestButton";
import MetricCard from "./MetricCard";
import ScoreSection from "./ScoreSection";
import TestingStatus from "./TestingStatus";
import TestTypeToggle from "./TestTypeToggle";
import LiveGraphToggle from "./LiveGraphToggle";
import ModeButtons from "./ModeButtons";
import ScoreBreakdownModal from "./ScoreBreakdownModal";
import MetricInfoPopup from "./MetricInfoPopup";
import { getScoreBreakdown, type ScoreBreakdown } from "../utils/connectionAnalyzer";
import { formatSpeed, isMetricLoading, getMetricDescription } from "../utils/hero.utils";
import type { HeroProps } from "../types/hero.types";

export default function Hero({
  score,
  ping,
  download,
  upload,
  jitter,
  phase,
  running,
  isTestActive,
  onRunTest,
  mode,
  onModeChange,
  setTestSelection,
  showLiveGraph,
  onToggleLiveGraph,
}: HeroProps) {
  const [showScoreExplanation, setShowScoreExplanation] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [testType, setTestType] = useState<"quick" | "full">("full");
  const [selectedMetric, setSelectedMetric] = useState<"ping" | "download" | "upload" | "jitter" | null>(null);

  const handleScoreClick = () => {
    if (score !== null && ping !== null && download !== null && upload !== null) {
      const breakdown = getScoreBreakdown(ping, download, upload);
      setScoreBreakdown(breakdown);
      setShowScoreExplanation(true);
    }
  };

  const handleMetricClick = (metric: "ping" | "download" | "upload" | "jitter") => {
    setSelectedMetric(metric);
  };

  const handleTestTypeChange = (type: "quick" | "full") => {
    setTestType(type);
    if (type === "quick") {
      setTestSelection({
        ping: true,
        jitter: false,
        download: true,
        upload: false,
      });
    } else {
      setTestSelection({
        ping: true,
        jitter: true,
        download: true,
        upload: true,
      });
    }
  };

  // Get descriptions for each metric
  const pingDescription = getMetricDescription("ping", ping);
  const jitterDescription = getMetricDescription("jitter", jitter);
  const downloadDescription = getMetricDescription("download", download);
  const uploadDescription = getMetricDescription("upload", upload);

  return (
    <>
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "clamp(20px, 5vw, 28px)",
          padding: "clamp(16px, 4vw, 24px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        {/* Score Section */}
        <ScoreSection 
          score={score} 
          isTestActive={isTestActive} 
          onClick={handleScoreClick} 
        />

        {/* Testing Status */}
        <TestingStatus phase={phase} isTestActive={isTestActive} />

        {/* Metrics Grid - Using your MetricCard component */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "clamp(12px, 3vw, 16px)",
            marginBottom: "20px",
          }}
        >
          <MetricCard 
            label="PING" 
            value={ping !== null ? `${ping} ms` : undefined}
            icon="📡"
            isLoading={isMetricLoading("ping", phase, running)}
            description={pingDescription}
            clickable={true}
            onClick={() => handleMetricClick("ping")}
          />
          <MetricCard 
            label="DOWNLOAD" 
            value={download !== null ? formatSpeed(download) : undefined}
            icon="⬇️"
            isLoading={isMetricLoading("download", phase, running)}
            description={downloadDescription}
            clickable={true}
            onClick={() => handleMetricClick("download")}
          />
          <MetricCard 
            label="UPLOAD" 
            value={upload !== null ? formatSpeed(upload) : undefined}
            icon="⬆️"
            isLoading={isMetricLoading("upload", phase, running)}
            description={uploadDescription}
            clickable={true}
            onClick={() => handleMetricClick("upload")}
          />
          <MetricCard 
            label="JITTER" 
            value={jitter !== null ? `${jitter} ms` : undefined}
            icon="⚡"
            isLoading={isMetricLoading("jitter", phase, running)}
            description={jitterDescription}
            clickable={true}
            onClick={() => handleMetricClick("jitter")}
          />
        </div>

        {/* Test Type Toggle */}
        <TestTypeToggle testType={testType} onChange={handleTestTypeChange} />

        {/* Start Button */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "inline-block",
              width: "100%",
              maxWidth: "280px",
              animation: running ? "pulse 1.5s infinite" : "none",
            }}
          >
            <StartTestButton onClick={onRunTest} disabled={running} />
          </div>
        </div>

        {/* Live Graph Toggle */}
        <LiveGraphToggle showLiveGraph={showLiveGraph} onToggle={onToggleLiveGraph} />

        {/* Mode Buttons */}
        <ModeButtons mode={mode} running={running} onModeChange={onModeChange} />
      </div>

      {/* Score Explanation Modal */}
      {showScoreExplanation && scoreBreakdown && (
        <ScoreBreakdownModal
          score={score}
          scoreBreakdown={scoreBreakdown}
          download={download}
          upload={upload}
          ping={ping}
          onClose={() => setShowScoreExplanation(false)}
        />
      )}

      {/* Metric Info Popup */}
      <MetricInfoPopup 
        metric={selectedMetric}
        onClose={() => setSelectedMetric(null)}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </>
  );
}