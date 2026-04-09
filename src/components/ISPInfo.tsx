// components/ISPInfo.tsx
import { useState } from "react";
import { type ISPInfo as ISPInfoType, saveManualISP, getManualISP } from "../utils/ispDetector";

interface ISPInfoProps {
  ispInfo: ISPInfoType | null;
  onISPDetected?: (isp: string) => void;
  onISPManualSet?: (isp: string) => void;
}

export default function ISPInfo({ ispInfo, onISPDetected, onISPManualSet }: ISPInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [manualISP, setManualISP] = useState("");
  
  const savedManualISP = getManualISP();
  const displayISP = savedManualISP || ispInfo?.isp;
  const isUnknown = !displayISP || displayISP === "Unknown" || displayISP === "Unknown ISP";

  const handleSaveManual = () => {
    if (manualISP && manualISP.trim()) {
      const newISP = manualISP.trim();
      saveManualISP(newISP);
      if (onISPManualSet) {
        onISPManualSet(newISP);
      }
      setIsEditing(false);
    }
  };

  if (!ispInfo && !savedManualISP) {
    return (
      <div
        style={{
          background: "#f1f5f9",
          borderRadius: "12px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>🏢</span>
        <div>
          <div style={{ fontSize: "10px", color: "#64748b" }}>Internet Provider</div>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Detecting...</div>
        </div>
      </div>
    );
  }

  if (isUnknown && !isEditing) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          borderRadius: "12px",
          padding: "10px 14px",
          border: "1px solid #f59e0b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🏢</span>
            <div>
              <div style={{ fontSize: "10px", color: "#92400e" }}>Internet Provider</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#78350f" }}>
                Not Detected
              </div>
            </div>
          </div>
          {ispInfo?.ip && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "#92400e" }}>
                {ispInfo.city}, {ispInfo.country}
              </div>
              <div style={{ fontSize: "9px", color: "#78350f", fontFamily: "monospace" }}>
                {ispInfo.ip}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsEditing(true)}
          style={{
            marginTop: "8px",
            width: "100%",
            padding: "6px",
            background: "#f59e0b",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "500",
          }}
        >
          ✏️ Add ISP Name
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div
        style={{
          background: "#f8fafc",
          borderRadius: "12px",
          padding: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ marginBottom: "8px", fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>
          Enter your Internet Service Provider
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            type="text"
            value={manualISP}
            onChange={(e) => setManualISP(e.target.value)}
            placeholder="e.g., Jio, Airtel, Comcast, AT&T"
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
              outline: "none",
            }}
          />
          <button
            onClick={handleSaveManual}
            style={{
              padding: "8px 16px",
              background: "#10b981",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            style={{
              padding: "8px 16px",
              background: "#64748b",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        borderRadius: "12px",
        padding: "10px 14px",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🏢</span>
          <div>
            <div style={{ fontSize: "10px", color: "#64748b" }}>Internet Provider</div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
              {displayISP}
            </div>
          </div>
        </div>
        {ispInfo?.ip && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#64748b" }}>
              {ispInfo.city}, {ispInfo.country}
            </div>
            <div style={{ fontSize: "9px", color: "#94a3b8", fontFamily: "monospace" }}>
              {ispInfo.ip}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={() => {
          setManualISP(displayISP || "");
          setIsEditing(true);
        }}
        style={{
          marginTop: "8px",
          width: "100%",
          padding: "4px",
          background: "transparent",
          border: "1px dashed #cbd5e1",
          borderRadius: "6px",
          color: "#64748b",
          cursor: "pointer",
          fontSize: "10px",
        }}
      >
        ✏️ Edit ISP
      </button>
    </div>
  );
}