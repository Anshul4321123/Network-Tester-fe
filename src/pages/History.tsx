// pages/History.tsx - AI Diagnostic + Mobile Redesign (reduced emojis)

import { useEffect, useState } from "react";
import { getHistory, clearHistory, type SpeedTestRecord } from "../utils/storage";
import LiveGraph from "../components/LiveGraph";
import { analyzeTrend, type TrendType } from "../utils/trendAnalyzer";
import TrendBadge from "../components/TrendBadge";
import AIDiagnostic from "../components/Aidiagnostic";

// Helper to parse date string (kept as before)
const parseDate = (dateStr: string): { date: string; time: string } => {
  const parts = dateStr.split(", ");
  if (parts.length === 2) {
    return { date: parts[0], time: parts[1] };
  }
  return { date: dateStr, time: "" };
};

// Environment variable for backend URL (same as Home.tsx)
const SERVER_BASE_URL = (import.meta as any).env?.VITE_SERVER_URL || "";

export default function History() {
  const [history, setHistory] = useState<SpeedTestRecord[]>([]);
  const [trend, setTrend] = useState<TrendType>("insufficient");
  const [selectedMetric, setSelectedMetric] = useState<"download" | "upload" | "ping" | "jitter" | "score">("download");
  const [timeRange, setTimeRange] = useState<"all" | "week" | "month" | "year">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [editingNetworkName, setEditingNetworkName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = getHistory();
    setHistory(data);
    detectTrend(data);
  };

  function detectTrend(data: SpeedTestRecord[]) {
    const downloads = data.map((d) => d.download);
    const trendResult = analyzeTrend(downloads);
    setTrend(trendResult);
  }

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setCurrentPage(1);
    setShowClearConfirm(false);
    detectTrend([]);
  };

  const handleEditNetworkName = (item: SpeedTestRecord) => {
    const currentName = item.networkName || "Unknown Network";
    setEditingNetworkName(item.date);
    setEditValue(currentName);
  };

  const saveNetworkName = (item: SpeedTestRecord, newName: string) => {
    if (newName && newName.trim() && newName !== (item.networkName || "Unknown Network")) {
      const allHistory = getHistory();
      const updatedHistory = allHistory.map(record => {
        if (record.date === item.date && record.ping === item.ping && record.download === item.download) {
          return { ...record, networkName: newName.trim() };
        }
        return record;
      });
      localStorage.setItem("speed_test_history", JSON.stringify(updatedHistory));
      loadHistory();
    }
    setEditingNetworkName(null);
    setEditValue("");
  };

  const handleExportCSV = () => {
    const csvRows = [
      ["Date", "Time", "Network Name", "Network Type", "Ping (ms)", "Jitter (ms)", "Download (Mbps)", "Upload (Mbps)", "Score"],
      ...filteredHistory.map(h => {
        const { date, time } = parseDate(h.date);
        return [
          date,
          time,
          h.networkName || "Unknown Network",
          h.networkType || "Unknown",
          h.ping,
          h.jitter,
          h.download,
          h.upload,
          h.score || ""
        ];
      })
    ];
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `speed-test-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const importedRecords: SpeedTestRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        if (values.length >= 7 && values[0]) {
          const dateStr = `${values[0]}, ${values[1]}`;
          importedRecords.push({
            date: dateStr,
            ping: parseFloat(values[4]),
            jitter: parseFloat(values[5]) || 0,
            download: parseFloat(values[6]),
            upload: parseFloat(values[7]),
            score: parseInt(values[8]) || 0,
            networkName: values[2] !== "Unknown Network" ? values[2] : undefined,
            networkType: values[3] !== "Unknown" ? values[3].toLowerCase() : undefined,
            hour: new Date(dateStr).getHours(),
          });
        }
      }
      const existingHistory = getHistory();
      const allHistory = [...importedRecords, ...existingHistory];
      const uniqueHistory = allHistory.filter((record, index, self) =>
        index === self.findIndex(r => r.date === record.date && r.ping === record.ping)
      );
      uniqueHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem("speed_test_history", JSON.stringify(uniqueHistory));
      loadHistory();
      setShowImportConfirm(false);
      setImportFile(null);
    };
    reader.readAsText(file);
  };

  const formatSpeed = (value: number) => {
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return "#10b981";
    if (score > 50) return "#f59e0b";
    return "#ef4444";
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "download": return "#3b82f6";
      case "upload": return "#f59e0b";
      case "ping": return "#10b981";
      case "jitter": return "#8b5cf6";
      case "score": return "#fbbf24";
      default: return "#64748b";
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "download": return "Download Speed";
      case "upload": return "Upload Speed";
      case "ping": return "Ping Latency";
      case "jitter": return "Jitter";
      case "score": return "Score";
      default: return metric;
    }
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case "download": return "Mbps";
      case "upload": return "Mbps";
      case "ping": return "ms";
      case "jitter": return "ms";
      case "score": return "points";
      default: return "";
    }
  };

  const getMetricData = () => {
    return filteredHistory.map(h => {
      switch (selectedMetric) {
        case "download": return h.download;
        case "upload": return h.upload;
        case "ping": return h.ping;
        case "jitter": return h.jitter;
        case "score": return h.score || 0;
        default: return h.download;
      }
    });
  };

  const getBestValue = () => {
    const data = getMetricData();
    if (data.length === 0) return null;
    if (selectedMetric === "ping" || selectedMetric === "jitter") {
      return Math.min(...data);
    }
    return Math.max(...data);
  };

  const getWorstValue = () => {
    const data = getMetricData();
    if (data.length === 0) return null;
    if (selectedMetric === "ping" || selectedMetric === "jitter") {
      return Math.max(...data);
    }
    return Math.min(...data);
  };

  const getAverageValue = () => {
    const data = getMetricData();
    if (data.length === 0) return null;
    return data.reduce((a, b) => a + b, 0) / data.length;
  };

  const filterHistoryByTimeRange = () => {
    if (timeRange === "all") return history;
    const now = new Date();
    const cutoffDate = new Date();
    switch (timeRange) {
      case "week": cutoffDate.setDate(now.getDate() - 7); break;
      case "month": cutoffDate.setMonth(now.getMonth() - 1); break;
      case "year": cutoffDate.setFullYear(now.getFullYear() - 1); break;
    }
    return history.filter(item => new Date(item.date) >= cutoffDate);
  };

  const filteredHistory = filterHistoryByTimeRange();
  const totalFilteredPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const metricData = getMetricData();
  const bestValue = getBestValue();
  const worstValue = getWorstValue();
  const averageValue = getAverageValue();

  // Prepare metrics for AI diagnostic: use the most recent test if available
  const latestTest = history.length > 0 ? history[0] : null;
  const aiMetrics = latestTest ? {
    ping: latestTest.ping,
    download: latestTest.download,
    upload: latestTest.upload,
    jitter: latestTest.jitter,
    score: latestTest.score || 0,
    networkType: latestTest.networkType,
  } : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        {/* Header - reduced emoji */}
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a", marginBottom: "4px", letterSpacing: "-0.01em" }}>
              History Dashboard
            </h1>
            <p style={{ color: "#475569", fontSize: "14px" }}>
              {filteredHistory.length} tests recorded
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowImportConfirm(true)}
              style={{ padding: "8px 14px", background: "#f1f5f9", border: "none", borderRadius: "40px", color: "#1e293b", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
            >
              Import CSV
            </button>
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  style={{ padding: "8px 14px", background: "#f1f5f9", border: "none", borderRadius: "40px", color: "#1e293b", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
                >
                  Export CSV
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  style={{ padding: "8px 14px", background: "#fee2e2", border: "none", borderRadius: "40px", color: "#b91c1c", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* AI Diagnostic - appears when history exists */}
        {aiMetrics && (
          <div style={{ marginBottom: "32px" }}>
            <AIDiagnostic
              metrics={aiMetrics}
              history={history}
              serverBaseUrl={SERVER_BASE_URL}
            />
          </div>
        )}

        {/* Trend Badge */}
        {trend !== "insufficient" && <TrendBadge trend={trend} />}

        {/* Time Range Filter - text only */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { value: "all", label: "All time" },
            { value: "week", label: "Last 7 days" },
            { value: "month", label: "Last 30 days" },
            { value: "year", label: "Last year" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => { setTimeRange(range.value as any); setCurrentPage(1); }}
              style={{
                padding: "8px 18px",
                background: timeRange === range.value ? "#3b82f6" : "#f1f5f9",
                color: timeRange === range.value ? "#fff" : "#334155",
                border: "none",
                borderRadius: "40px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Summary Stats Cards - no emojis */}
        {filteredHistory.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "32px" }}>
            <StatCard title="Total Tests" value={filteredHistory.length.toString()} color="#475569" />
            <StatCard title="Best Download" value={bestValue ? formatSpeed(bestValue) : "--"} color="#3b82f6" />
            <StatCard title="Average Download" value={averageValue ? formatSpeed(averageValue) : "--"} color="#f59e0b" />
            <StatCard title="Best Ping" value={bestValue && selectedMetric === "ping" ? `${bestValue.toFixed(1)} ms` : averageValue ? `${averageValue.toFixed(1)} ms` : "--"} color="#10b981" />
          </div>
        )}

        {/* Metric Selector & Graph - text labels */}
        {filteredHistory.length > 0 && (
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", justifyContent: "center" }}>
              {["download", "upload", "ping", "jitter", "score"].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric as any)}
                  style={{
                    padding: "8px 20px",
                    background: selectedMetric === metric ? getMetricColor(metric) : "#f1f5f9",
                    color: selectedMetric === metric ? "#fff" : "#334155",
                    border: "none",
                    borderRadius: "40px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  {getMetricLabel(metric)}
                </button>
              ))}
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "20px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ height: "280px" }}>
                <LiveGraph
                  speeds={metricData}
                  label={getMetricLabel(selectedMetric)}
                  graphType={selectedMetric === "ping" || selectedMetric === "jitter" ? "ping" : selectedMetric === "download" ? "download" : "upload"}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", background: "#f8fafc", borderRadius: "16px", padding: "14px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Best</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: getMetricColor(selectedMetric) }}>
                  {bestValue !== null
                    ? (selectedMetric === "ping" || selectedMetric === "jitter"
                        ? `${bestValue.toFixed(1)} ${getMetricUnit(selectedMetric)}`
                        : selectedMetric === "score"
                          ? `${bestValue.toFixed(0)} pts`
                          : formatSpeed(bestValue))
                    : "--"}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Average</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                  {averageValue !== null
                    ? (selectedMetric === "ping" || selectedMetric === "jitter"
                        ? `${averageValue.toFixed(1)} ${getMetricUnit(selectedMetric)}`
                        : selectedMetric === "score"
                          ? `${averageValue.toFixed(0)} pts`
                          : formatSpeed(averageValue))
                    : "--"}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Worst</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#ef4444" }}>
                  {worstValue !== null
                    ? (selectedMetric === "ping" || selectedMetric === "jitter"
                        ? `${worstValue.toFixed(1)} ${getMetricUnit(selectedMetric)}`
                        : selectedMetric === "score"
                          ? `${worstValue.toFixed(0)} pts`
                          : formatSpeed(worstValue))
                    : "--"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>Test History</h2>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              {paginatedHistory.length} of {filteredHistory.length} tests
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "700px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 10px", textAlign: "left", color: "#334155", fontWeight: "500" }}>Date</th>
                  <th style={{ padding: "12px 10px", textAlign: "left", color: "#334155", fontWeight: "500" }}>Time</th>
                  <th style={{ padding: "12px 10px", textAlign: "left", color: "#334155", fontWeight: "500" }}>Network Name</th>
                  <th style={{ padding: "12px 10px", textAlign: "right", color: "#334155", fontWeight: "500" }}>Type</th>
                  <th style={{ padding: "12px 10px", textAlign: "right", color: "#334155", fontWeight: "500" }}>Ping</th>
                  <th style={{ padding: "12px 10px", textAlign: "right", color: "#334155", fontWeight: "500" }}>Jitter</th>
                  <th style={{ padding: "12px 10px", textAlign: "right", color: "#334155", fontWeight: "500" }}>Download</th>
                  <th style={{ padding: "12px 10px", textAlign: "right", color: "#334155", fontWeight: "500" }}>Upload</th>
                  <th style={{ padding: "12px 10px", textAlign: "right", color: "#334155", fontWeight: "500" }}>Score</th>
                  <th style={{ padding: "12px 10px", textAlign: "center", color: "#334155", fontWeight: "500" }}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                      <div style={{ fontSize: "40px", marginBottom: "8px", opacity: 0.5 }}>📭</div>
                      <div>No data for this period</div>
                      <div style={{ fontSize: "12px", marginTop: "6px" }}>Run a speed test to see results</div>
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((item, index) => {
                    const { date, time } = parseDate(item.date);
                    const isEditing = editingNetworkName === item.date;
                    const networkName = item.networkName || "Unknown Network";
                    return (
                      <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "12px 10px", color: "#1e293b", whiteSpace: "nowrap" }}>{date}</td>
                        <td style={{ padding: "12px 10px", color: "#64748b", fontSize: "11px", whiteSpace: "nowrap" }}>{time}</td>
                        <td style={{ padding: "12px 10px" }}>
                          {isEditing ? (
                            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                              <input
                                aria-label="Edit network name"
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                style={{ padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", width: "130px" }}
                                autoFocus
                              />
                              <button onClick={() => saveNetworkName(item, editValue)} style={{ background: "#10b981", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", fontSize: "11px", padding: "4px 10px" }}>Save</button>
                              <button onClick={() => setEditingNetworkName(null)} style={{ background: "#94a3b8", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", fontSize: "11px", padding: "4px 10px" }}>Cancel</button>
                            </div>
                          ) : (
                            <span style={{ fontWeight: "500", color: "#0f172a" }}>{networkName}</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "right", fontSize: "11px", color: "#64748b" }}>{item.networkType ? item.networkType.toUpperCase() : "—"}</td>
                        <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: "500" }}>{item.ping} ms</td>
                        <td style={{ padding: "12px 10px", textAlign: "right", color: "#64748b" }}>{item.jitter} ms</td>
                        <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: "500", color: "#3b82f6" }}>{formatSpeed(item.download)}</td>
                        <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: "500", color: "#f59e0b" }}>{formatSpeed(item.upload)}</td>
                        <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: "bold", color: item.score ? getScoreColor(item.score) : "#64748b" }}>{item.score ?? "--"}</td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>
                          {!isEditing && (
                            <button
                              onClick={() => handleEditNetworkName(item)}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", padding: "4px 10px", borderRadius: "6px", color: "#3b82f6", fontWeight: "500" }}
                            >
                              Rename
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalFilteredPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "28px" }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={{ padding: "8px 14px", background: currentPage === 1 ? "#f1f5f9" : "#e2e8f0", border: "none", borderRadius: "40px", cursor: currentPage === 1 ? "default" : "pointer", fontSize: "12px", fontWeight: "500" }}
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{ padding: "8px 14px", background: currentPage === 1 ? "#f1f5f9" : "#e2e8f0", border: "none", borderRadius: "40px", cursor: currentPage === 1 ? "default" : "pointer", fontSize: "12px", fontWeight: "500" }}
              >
                Prev
              </button>
              <span style={{ fontSize: "13px", color: "#334155" }}>Page {currentPage} of {totalFilteredPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalFilteredPages, prev + 1))}
                disabled={currentPage === totalFilteredPages}
                style={{ padding: "8px 14px", background: currentPage === totalFilteredPages ? "#f1f5f9" : "#e2e8f0", border: "none", borderRadius: "40px", cursor: currentPage === totalFilteredPages ? "default" : "pointer", fontSize: "12px", fontWeight: "500" }}
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalFilteredPages)}
                disabled={currentPage === totalFilteredPages}
                style={{ padding: "8px 14px", background: currentPage === totalFilteredPages ? "#f1f5f9" : "#e2e8f0", border: "none", borderRadius: "40px", cursor: currentPage === totalFilteredPages ? "default" : "pointer", fontSize: "12px", fontWeight: "500" }}
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowImportConfirm(false)}>
          <div style={{ background: "#fff", borderRadius: "24px", padding: "24px", maxWidth: "400px", width: "90%", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📁</div>
            <h3 style={{ marginBottom: "8px", fontSize: "18px" }}>Import CSV File</h3>
            <p style={{ color: "#475569", marginBottom: "20px", fontSize: "13px" }}>Select a CSV file exported from this app.</p>
            <input type="file" accept=".csv" onChange={(e) => { if (e.target.files && e.target.files[0]) setImportFile(e.target.files[0]); }} style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", marginBottom: "20px" }} />
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => setShowImportConfirm(false)} style={{ padding: "10px 20px", background: "#f1f5f9", border: "none", borderRadius: "40px", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
              <button onClick={() => { if (importFile) handleImportCSV(importFile); else alert("Select a CSV file first"); }} style={{ padding: "10px 20px", background: "#3b82f6", border: "none", borderRadius: "40px", color: "#fff", cursor: "pointer", fontSize: "13px" }}>Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Modal */}
      {showClearConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowClearConfirm(false)}>
          <div style={{ background: "#fff", borderRadius: "24px", padding: "24px", maxWidth: "400px", width: "90%", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ marginBottom: "8px" }}>Clear all history?</h3>
            <p style={{ color: "#475569", marginBottom: "24px", fontSize: "13px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => setShowClearConfirm(false)} style={{ padding: "10px 20px", background: "#f1f5f9", border: "none", borderRadius: "40px", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
              <button onClick={handleClearHistory} style={{ padding: "10px 20px", background: "#ef4444", border: "none", borderRadius: "40px", color: "#fff", cursor: "pointer", fontSize: "13px" }}>Yes, clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// StatCard Component - text only, no emoji
function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: "20px", padding: "14px 12px", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: "12px", color: "#475569", marginBottom: "6px", fontWeight: "500" }}>{title}</div>
      <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
    </div>
  );
}