// pages/History.tsx
import { useEffect, useState } from "react";
import { getHistory, clearHistory, updateHistoryISP, saveISPMapping, type SpeedTestRecord } from "../utils/storage";
import LiveGraph from "../components/LiveGraph";
import { analyzeTrend, type TrendType } from "../utils/trendAnalyzer";
import TrendBadge from "../components/TrendBadge";

export default function History() {
  const [history, setHistory] = useState<SpeedTestRecord[]>([]);
  const [trend, setTrend] = useState<TrendType>("insufficient");
  const [selectedMetric, setSelectedMetric] = useState<"download" | "upload" | "ping" | "jitter" | "score">("download");
  const [timeRange, setTimeRange] = useState<"all" | "week" | "month" | "year">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  const handleEditISP = (item: SpeedTestRecord) => {
    const currentISP = item.isp || "Unknown";
    const newName = prompt("Enter a name for this ISP (e.g., 'Jio Fiber', 'Airtel 5G'):", currentISP);
    if (newName && newName.trim() && newName !== currentISP) {
      // Save mapping
      const originalISP = item.originalIsp || item.isp || currentISP;
      saveISPMapping(originalISP, newName.trim());
      updateHistoryISP(originalISP, newName.trim());
      loadHistory(); // Reload to show changes
    }
  };

  const formatSpeed = (value: number) => {
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const formatNumber = (value: number, unit: string) => {
    return `${value.toFixed(1)} ${unit}`;
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

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "download": return "⬇️";
      case "upload": return "⬆️";
      case "ping": return "📡";
      case "jitter": return "⚡";
      case "score": return "⭐";
      default: return "📊";
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
      case "week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return history.filter(item => new Date(item.date) >= cutoffDate);
  };

  const filteredHistory = filterHistoryByTimeRange();
  
  // Pagination
  const totalFilteredPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const metricData = getMetricData();
  const bestValue = getBestValue();
  const worstValue = getWorstValue();
  const averageValue = getAverageValue();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)",
        padding: "clamp(16px, 4vw, 32px)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          background: "rgba(255,255,255,0.95)",
          borderRadius: "28px",
          padding: "clamp(20px, 5vw, 32px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header with Clear History Button */}
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1
              style={{
                fontSize: "clamp(24px, 6vw, 32px)",
                fontWeight: "bold",
                color: "#1e293b",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span>📊</span> History Dashboard
              <span style={{ fontSize: "14px", fontWeight: "normal", color: "#64748b" }}>
                {filteredHistory.length} tests
              </span>
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Track your internet performance over time
            </p>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                padding: "8px 16px",
                background: "#ef4444",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🗑️ Clear All History
            </button>
          )}
        </div>

        {/* Clear History Confirmation Modal */}
        {showClearConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowClearConfirm(false)}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                maxWidth: "400px",
                width: "90%",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
              <h3 style={{ marginBottom: "8px" }}>Clear All History?</h3>
              <p style={{ color: "#64748b", marginBottom: "24px" }}>
                This action cannot be undone. All your speed test results will be permanently deleted.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  style={{
                    padding: "10px 20px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  style={{
                    padding: "10px 20px",
                    background: "#ef4444",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trend Badge */}
        {trend !== "insufficient" && <TrendBadge trend={trend} />}

        {/* Time Range Filter */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "24px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { value: "all", label: "All Time", icon: "📅" },
            { value: "week", label: "Last 7 Days", icon: "📆" },
            { value: "month", label: "Last 30 Days", icon: "📆" },
            { value: "year", label: "Last Year", icon: "📅" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => {
                setTimeRange(range.value as any);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 16px",
                background: timeRange === range.value ? "#3b82f6" : "#f1f5f9",
                color: timeRange === range.value ? "#fff" : "#475569",
                border: "none",
                borderRadius: "40px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              <span>{range.icon}</span> {range.label}
            </button>
          ))}
        </div>

        {/* Summary Stats Cards */}
        {filteredHistory.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <StatCard
              title="Total Tests"
              value={filteredHistory.length.toString()}
              icon="🔬"
              color="#64748b"
              trend={null}
            />
            <StatCard
              title="Best Download"
              value={bestValue ? formatSpeed(bestValue) : "--"}
              icon="⬇️"
              color="#3b82f6"
              trend={null}
            />
            <StatCard
              title="Best Upload"
              value={averageValue ? formatSpeed(averageValue) : "--"}
              icon="⬆️"
              color="#f59e0b"
              trend={null}
            />
            <StatCard
              title="Best Ping"
              value={averageValue ? formatNumber(averageValue, "ms") : "--"}
              icon="📡"
              color="#10b981"
              trend={null}
            />
          </div>
        )}

        {/* Metric Selector & Graph */}
        {filteredHistory.length > 0 && (
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "20px",
                justifyContent: "center",
              }}
            >
              {["download", "upload", "ping", "jitter", "score"].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric as any)}
                  style={{
                    padding: "10px 20px",
                    background: selectedMetric === metric ? getMetricColor(metric) : "#f1f5f9",
                    color: selectedMetric === metric ? "#fff" : "#475569",
                    border: "none",
                    borderRadius: "40px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  <span>{getMetricIcon(metric)}</span> {getMetricLabel(metric)}
                </button>
              ))}
            </div>

            {/* Graph */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "20px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={{ height: "300px" }}>
                <LiveGraph
                  speeds={metricData}
                  label={getMetricLabel(selectedMetric)}
                  graphType={selectedMetric === "ping" || selectedMetric === "jitter" ? "ping" : selectedMetric === "download" ? "download" : "upload"}
                />
              </div>
            </div>

            {/* Statistics Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "16px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Best</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: getMetricColor(selectedMetric) }}>
                  {bestValue !== null ? (
                    selectedMetric === "ping" || selectedMetric === "jitter" 
                      ? `${bestValue.toFixed(1)} ${getMetricUnit(selectedMetric)}`
                      : selectedMetric === "score"
                      ? `${bestValue.toFixed(0)}/${getMetricUnit(selectedMetric)}`
                      : formatSpeed(bestValue)
                  ) : "--"}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Average</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1e293b" }}>
                  {averageValue !== null ? (
                    selectedMetric === "ping" || selectedMetric === "jitter"
                      ? `${averageValue.toFixed(1)} ${getMetricUnit(selectedMetric)}`
                      : selectedMetric === "score"
                      ? `${averageValue.toFixed(0)}/${getMetricUnit(selectedMetric)}`
                      : formatSpeed(averageValue)
                  ) : "--"}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Worst</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#ef4444" }}>
                  {worstValue !== null ? (
                    selectedMetric === "ping" || selectedMetric === "jitter"
                      ? `${worstValue.toFixed(1)} ${getMetricUnit(selectedMetric)}`
                      : selectedMetric === "score"
                      ? `${worstValue.toFixed(0)}/${getMetricUnit(selectedMetric)}`
                      : formatSpeed(worstValue)
                  ) : "--"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table with Pagination */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>📜</span> Test History
            </h2>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Showing {paginatedHistory.length} of {filteredHistory.length} tests
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f1f5f9",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  <th style={{ padding: "12px", textAlign: "left", color: "#475569" }}>Date</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>ISP</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Network</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Ping</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Jitter</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Download</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Upload</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#475569" }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "60px",
                        color: "#94a3b8",
                      }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                      <div>No data available for this time period.</div>
                      <div style={{ fontSize: "12px", marginTop: "8px" }}>
                        Run a speed test to see results!
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td style={{ padding: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                        {item.date}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontSize: "11px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          <span style={{ color: "#64748b" }}>
                            {item.isp && item.isp !== "Unknown" ? item.isp.slice(0, 25) : "—"}
                          </span>
                          {item.isp && item.isp !== "Unknown" && (
                            <button
                              onClick={() => handleEditISP(item)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "12px",
                                padding: "2px 4px",
                                color: "#3b82f6",
                              }}
                              title="Edit ISP Name"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontSize: "11px", color: "#64748b" }}>
                        {item.networkType ? item.networkType.toUpperCase() : "—"}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "500" }}>
                        {item.ping} ms
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", color: "#64748b" }}>
                        {item.jitter} ms
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "500", color: "#3b82f6" }}>
                        {formatSpeed(item.download)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "500", color: "#f59e0b" }}>
                        {formatSpeed(item.upload)}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          fontWeight: "bold",
                          color: item.score ? getScoreColor(item.score) : "#64748b",
                        }}
                      >
                        {item.score ?? "--"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalFilteredPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "24px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 12px",
                  background: currentPage === 1 ? "#f1f5f9" : "#e2e8f0",
                  border: "none",
                  borderRadius: "8px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                ⏮ First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 12px",
                  background: currentPage === 1 ? "#f1f5f9" : "#e2e8f0",
                  border: "none",
                  borderRadius: "8px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                ◀ Prev
              </button>
              <span style={{ fontSize: "13px", color: "#475569" }}>
                Page {currentPage} of {totalFilteredPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalFilteredPages, prev + 1))}
                disabled={currentPage === totalFilteredPages}
                style={{
                  padding: "8px 12px",
                  background: currentPage === totalFilteredPages ? "#f1f5f9" : "#e2e8f0",
                  border: "none",
                  borderRadius: "8px",
                  cursor: currentPage === totalFilteredPages ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  opacity: currentPage === totalFilteredPages ? 0.5 : 1,
                }}
              >
                Next ▶
              </button>
              <button
                onClick={() => setCurrentPage(totalFilteredPages)}
                disabled={currentPage === totalFilteredPages}
                style={{
                  padding: "8px 12px",
                  background: currentPage === totalFilteredPages ? "#f1f5f9" : "#e2e8f0",
                  border: "none",
                  borderRadius: "8px",
                  cursor: currentPage === totalFilteredPages ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  opacity: currentPage === totalFilteredPages ? 0.5 : 1,
                }}
              >
                Last ⏭
              </button>
            </div>
          )}

          {/* Export Button */}
          {filteredHistory.length > 0 && (
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <button
                onClick={() => {
                  const csv = [
                    ["Date", "ISP", "Network", "Ping (ms)", "Jitter (ms)", "Download (Mbps)", "Upload (Mbps)", "Score"],
                    ...filteredHistory.map(h => [
                      h.date,
                      h.isp || "Unknown",
                      h.networkType || "Unknown",
                      h.ping,
                      h.jitter,
                      h.download,
                      h.upload,
                      h.score || ""
                    ])
                  ].map(row => row.join(",")).join("\n");
                  
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `speed-test-history-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  padding: "10px 20px",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#475569",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e2e8f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                }}
              >
                📥 Export as CSV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, trend }: { title: string; value: string; icon: string; color: string; trend: number | null }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        border: `1px solid ${color}20`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "24px" }}>{icon}</span>
        {trend !== null && (
          <span style={{ fontSize: "12px", color: trend > 0 ? "#10b981" : "#ef4444" }}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>{title}</div>
      <div style={{ fontSize: "20px", fontWeight: "bold", color }}>{value}</div>
    </div>
  );
}