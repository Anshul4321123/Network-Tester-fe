// types/hero.types.ts
export interface HeroProps {
  score: number | null;
  ping: number | null;
  download: number | null;
  upload: number | null;
  jitter: number | null;
  phase: string;
  running: boolean;
  isTestActive: boolean;
  onRunTest: () => void;
  mode: string;
  onModeChange: (mode: "gaming" | "streaming" | "work") => void;
  testSelection: { ping: boolean; jitter: boolean; download: boolean; upload: boolean };
  setTestSelection: (selection: any) => void;
  showLiveGraph: boolean;
  onToggleLiveGraph: () => void;
}

export interface ScoreBreakdownProps {
  score: number | null;
  scoreBreakdown: {
    downloadScore: number;
    uploadScore: number;
    pingScore: number;
    totalScore: number;
    details: {
      download: string;
      upload: string;
      ping: string;
    };
  } | null;
  onClose: () => void;
}