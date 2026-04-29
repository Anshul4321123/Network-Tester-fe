// components/AIDiagnostic.tsx - FIXED API URL
import { useState, useEffect } from "react";

interface Metrics {
  ping: number | null;
  download: number | null;
  upload: number | null;
  jitter: number | null;
  score: number | null;
  networkType?: string;
}

interface DiagnosticRecord {
  date: string;
  dateLabel: string;
  diagnosis: string;
  metrics: Metrics;
}

interface AIDiagnosticProps {
  metrics: Metrics;
  history: any[];
  serverBaseUrl?: string;
}

const STORAGE_KEY = "ai_diagnostics_history";
const TODAY_KEY = "ai_diagnostic_today";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadDiagnostics(): DiagnosticRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function saveDiagnostic(record: DiagnosticRecord) {
  const existing = loadDiagnostics();
  const updated = [record, ...existing].slice(0, 30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  localStorage.setItem(TODAY_KEY, getTodayString());
}

function hasUsedTodaysDiagnostic(): boolean {
  return localStorage.getItem(TODAY_KEY) === getTodayString();
}

export default function AIDiagnostic({ metrics, history, serverBaseUrl = "" }: AIDiagnosticProps) {
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [diagnosticHistory, setDiagnosticHistory] = useState<DiagnosticRecord[]>([]);
  const [usedToday, setUsedToday] = useState(false);
  const [selectedHistoricDiag, setSelectedHistoricDiag] = useState<DiagnosticRecord | null>(null);

  // Get the correct API URL
  const getApiUrl = () => {
    // Use the provided serverBaseUrl first
    if (serverBaseUrl) {
      return `${serverBaseUrl}/diagnose`;
    }
    // Fallback to environment variable
    if (import.meta.env.VITE_BASE_URL) {
      return `${import.meta.env.VITE_BASE_URL}/diagnose`;
    }
    // Fallback to localhost for development
    return "http://localhost:3000/diagnose";
  };

  useEffect(() => {
    setDiagnosticHistory(loadDiagnostics());
    setUsedToday(hasUsedTodaysDiagnostic());
  }, []);

  const handleAnalyseClick = () => {
    if (usedToday) return;
    setShowPrivacyNotice(true);
    setError(null);
  };

  const handlePrivacyAccept = async () => {
    setShowPrivacyNotice(false);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const last5 = history.slice(0, 5);
      const apiUrl = getApiUrl();
      
      console.log("📡 Calling API:", apiUrl);
      console.log("📊 Sending metrics:", metrics);
      console.log("📜 Sending history:", last5);

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics, history: last5 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Diagnostic failed`);
      }

      if (!data.diagnosis) {
        throw new Error("No diagnosis returned from server");
      }

      const record: DiagnosticRecord = {
        date: new Date().toISOString(),
        dateLabel: new Date().toLocaleString(),
        diagnosis: data.diagnosis,
        metrics: { ...metrics },
      };

      saveDiagnostic(record);
      setResult(data.diagnosis);
      setUsedToday(true);
      setDiagnosticHistory(loadDiagnostics());

    } catch (err: any) {
      console.error("Diagnostic error:", err);
      setError(err.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const metricsReady = metrics.ping !== null && metrics.download !== null && metrics.upload !== null;

  return (
    <>
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", borderRadius: "16px", padding: "16px 18px", boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🤖</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#e0e7ff" }}>AI Network Diagnosis</div>
              <div style={{ fontSize: "10px", color: "#a5b4fc" }}>Powered by Google Gemini</div>
            </div>
          </div>
          {diagnosticHistory.length > 0 && (
            <button
              onClick={() => { setShowHistory(true); setSelectedHistoricDiag(null); }}
              style={{ background: "rgba(165,180,252,0.15)", border: "1px solid rgba(165,180,252,0.3)", borderRadius: "8px", color: "#a5b4fc", fontSize: "11px", padding: "5px 10px", cursor: "pointer", fontWeight: "500" }}
            >
              📋 History ({diagnosticHistory.length})
            </button>
          )}
        </div>

        {usedToday && !result && (
          <div style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px", fontSize: "11px", color: "#fde68a" }}>
            ⏰ You've used today's free diagnosis. Come back tomorrow for a fresh analysis.
          </div>
        )}

        {result && (
          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "10px", padding: "12px", marginBottom: "12px", fontSize: "12px", color: "#e0e7ff", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
            {result}
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px", fontSize: "11px", color: "#fca5a5" }}>
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", marginBottom: "10px" }}>
            <div style={{ width: "18px", height: "18px", border: "2px solid rgba(165,180,252,0.3)", borderTop: "2px solid #a5b4fc", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#a5b4fc" }}>Gemini is analysing your network…</span>
          </div>
        )}

        {!loading && (
          <button
            onClick={handleAnalyseClick}
            disabled={!metricsReady || usedToday}
            style={{
              width: "100%",
              padding: "11px",
              background: (!metricsReady || usedToday)
                ? "rgba(99,102,241,0.2)"
                : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              border: "none",
              borderRadius: "10px",
              color: (!metricsReady || usedToday) ? "#6366f1" : "#fff",
              fontSize: "13px",
              fontWeight: "600",
              cursor: (!metricsReady || usedToday) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.2s",
              opacity: (!metricsReady || usedToday) ? 0.6 : 1,
            }}
          >
            <span>🔍</span>
            {!metricsReady ? "Run a test first" : usedToday ? "Used today · Try again tomorrow" : "Analyse My Network"}
          </button>
        )}

        <div style={{ marginTop: "8px", fontSize: "9px", color: "rgba(165,180,252,0.6)", textAlign: "center" }}>
          Only numeric test metrics are sent · No personal data · 1 analysis per day
        </div>
      </div>

      {/* Privacy Modal */}
      {showPrivacyNotice && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowPrivacyNotice(false)}
        >
          <div
            style={{ background: "#1e1b4b", border: "1px solid rgba(165,180,252,0.25)", borderRadius: "24px", maxWidth: "420px", width: "92%", padding: "28px 24px", textAlign: "center", animation: "slideUp 0.25s ease" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛡️</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#e0e7ff", marginBottom: "8px" }}>
              Before We Proceed
            </div>
            <div style={{ fontSize: "12px", color: "#a5b4fc", lineHeight: "1.75", marginBottom: "20px", textAlign: "left", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "14px" }}>
              <p style={{ margin: "0 0 10px" }}>
                <strong style={{ color: "#e0e7ff" }}>We take your privacy seriously.</strong> SpeedLab stores everything locally on your device.
              </p>
              <p style={{ margin: "0 0 10px" }}>
                The AI diagnosis sends only your <strong style={{ color: "#fbbf24" }}>numeric test metrics</strong> (speeds, ping, jitter, score) to Google Gemini's API.
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(165,180,252,0.7)" }}>
                No names, no IP addresses, no location data. Limited to 1 diagnosis per day.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowPrivacyNotice(false)}
                style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#a5b4fc", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}
              >
                Cancel
              </button>
              <button
                onClick={handlePrivacyAccept}
                style={{ flex: 2, padding: "11px", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
              >
                I Understand — Analyse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal (keep as is) */}
      {showHistory && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowHistory(false)}
        >
          <div
            style={{ background: "#1e1b4b", border: "1px solid rgba(165,180,252,0.2)", borderRadius: "24px", maxWidth: "500px", width: "92%", maxHeight: "80vh", display: "flex", flexDirection: "column", animation: "slideUp 0.25s ease" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid rgba(165,180,252,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#e0e7ff", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📋</span> Previous Diagnoses
              </div>
              <button onClick={() => setShowHistory(false)} style={{ background: "none", border: "none", color: "#a5b4fc", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {selectedHistoricDiag ? (
                <div style={{ padding: "16px 20px" }}>
                  <button
                    onClick={() => setSelectedHistoricDiag(null)}
                    style={{ background: "rgba(165,180,252,0.12)", border: "none", borderRadius: "8px", color: "#a5b4fc", fontSize: "11px", padding: "5px 10px", cursor: "pointer", marginBottom: "14px" }}
                  >
                    ← Back to list
                  </button>
                  <div style={{ fontSize: "11px", color: "#6366f1", marginBottom: "10px" }}>{selectedHistoricDiag.dateLabel}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "14px" }}>
                    {[
                      { label: "Download", value: `${selectedHistoricDiag.metrics.download?.toFixed(1)} Mbps`, color: "#3b82f6" },
                      { label: "Upload", value: `${selectedHistoricDiag.metrics.upload?.toFixed(1)} Mbps`, color: "#f59e0b" },
                      { label: "Ping", value: `${selectedHistoricDiag.metrics.ping?.toFixed(1)} ms`, color: "#10b981" },
                      { label: "Score", value: `${selectedHistoricDiag.metrics.score}`, color: "#fbbf24" },
                    ].map(m => (
                      <div key={m.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "9px", color: "#6366f1", marginBottom: "2px" }}>{m.label}</div>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "12px", color: "#c7d2fe", lineHeight: "1.75", whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
                    {selectedHistoricDiag.diagnosis}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "10px 12px" }}>
                  {diagnosticHistory.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedHistoricDiag(d)}
                      style={{ width: "100%", textAlign: "left", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(165,180,252,0.1)", borderRadius: "10px", padding: "12px", marginBottom: "8px", cursor: "pointer", transition: "background 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.15)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <span style={{ fontSize: "11px", color: "#a5b4fc", fontWeight: "600" }}>{d.dateLabel}</span>
                        <span style={{ fontSize: "10px", color: "#6366f1" }}>View →</span>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <span style={{ fontSize: "10px", color: "#3b82f6" }}>⬇ {d.metrics.download?.toFixed(1)} Mbps</span>
                        <span style={{ fontSize: "10px", color: "#f59e0b" }}>⬆ {d.metrics.upload?.toFixed(1)} Mbps</span>
                        <span style={{ fontSize: "10px", color: "#10b981" }}>📡 {d.metrics.ping?.toFixed(1)} ms</span>
                        <span style={{ fontSize: "10px", color: "#fbbf24" }}>⭐ {d.metrics.score}</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "#6366f1", marginTop: "5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.diagnosis.slice(0, 90)}…
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}5