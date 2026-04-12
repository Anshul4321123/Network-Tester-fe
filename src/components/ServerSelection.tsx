// components/ServerSelection.tsx
import { useState, useEffect } from "react";

interface Server {
  id: string;
  name: string;
  location: string;
  flag: string;
  latency: number;
  recommended: boolean;
}

interface ServerSelectionProps {
  onServerChange: (serverId: string) => void;
  currentServer: string;
}

export default function ServerSelection({ onServerChange, currentServer }: ServerSelectionProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [servers, setServers] = useState<Server[]>([
    { id: "us-east", name: "North America (East)", location: "Virginia, USA", flag: "🇺🇸", latency: 0, recommended: true },
    { id: "us-west", name: "North America (West)", location: "California, USA", flag: "🇺🇸", latency: 0, recommended: false },
    { id: "eu-central", name: "Europe (Central)", location: "Frankfurt, Germany", flag: "🇪🇺", latency: 0, recommended: true },
    { id: "eu-west", name: "Europe (West)", location: "London, UK", flag: "🇬🇧", latency: 0, recommended: false },
    { id: "asia-sg", name: "Asia Pacific", location: "Singapore", flag:'🇸🇬', latency: 0, recommended: true },
    { id: "asia-jp", name: "Asia (Japan)", location: "Tokyo, Japan", flag: "🇯🇵", latency: 0, recommended: false },
    { id: "sa-east", name: "South America", location: "São Paulo, Brazil", flag: "🇧🇷", latency: 0, recommended: false },
    { id: "au-syd", name: "Oceania", location: "Sydney, Australia", flag: "🇦🇺", latency: 0, recommended: false },
  ]);

  // Simulate latency detection (fake for UI)
  useEffect(() => {
    const updateLatencies = () => {
      const updatedServers = servers.map(server => ({
        ...server,
        latency: Math.floor(Math.random() * 150) + 20,
      }));
      setServers(updatedServers);
    };
    updateLatencies();
  }, []);

  const getCurrentServer = () => {
    return servers.find(s => s.id === currentServer) || servers[0];
  };

  return (
    <div style={{ position: "relative", marginBottom: "12px" }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#1e293b",
        }}
      >
        <span>
          🌍 {getCurrentServer().flag} {getCurrentServer().name}
        </span>
        <span style={{ fontSize: "10px", color: "#64748b" }}>
          {getCurrentServer().latency}ms • {showDropdown ? "▲" : "▼"}
        </span>
      </button>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "8px",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 100,
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => {
                onServerChange(server.id);
                setShowDropdown(false);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: currentServer === server.id ? "#f1f5f9" : "transparent",
                border: "none",
                borderBottom: "1px solid #e2e8f0",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (currentServer !== server.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: "500" }}>
                  {server.flag} {server.name}
                </div>
                <div style={{ fontSize: "9px", color: "#64748b" }}>{server.location}</div>
              </div>
              <div style={{ fontSize: "10px", color: "#64748b" }}>
                {server.recommended && <span style={{ color: "#10b981", marginRight: "8px" }}>★</span>}
                {server.latency}ms
              </div>
            </button>
          ))}
          <div style={{ padding: "8px", fontSize: "9px", color: "#94a3b8", textAlign: "center", borderTop: "1px solid #e2e8f0" }}>
            🌐 More servers coming soon!
          </div>
        </div>
      )}
    </div>
  );
}