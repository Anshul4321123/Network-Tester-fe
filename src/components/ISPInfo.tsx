// components/ISPInfo.tsx - COMPLETELY FIXED
import { useState, useEffect } from "react";
import { type ISPInfo as ISPInfoType } from "../utils/ispDetector";
import { 
  saveISPMapping, 
  getNetworkMapping,
  type NetworkMapping,
  getVPNState,
  generateFingerprintFromIp
} from "../utils/storage";

interface ISPInfoProps {
  ispInfo: ISPInfoType | null;
  onISPDetected?: (isp: string) => void;
  onISPManualSet?: (isp: string) => void;
}

export default function ISPInfo({ ispInfo, onISPManualSet }: ISPInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [manualISP, setManualISP] = useState("");
  const [, setCurrentFingerprint] = useState<string | null>(null);
  const [currentMapping, setCurrentMapping] = useState<NetworkMapping | null>(null);
  const [isVPN, setIsVPN] = useState(false);
  
  useEffect(() => {
    setIsVPN(getVPNState());
  }, []);
  
  useEffect(() => {
    if (ispInfo?.isp && ispInfo?.isp !== "Unknown" && ispInfo?.ip) {
      const currentVPN = getVPNState();
      setIsVPN(currentVPN);
      
      const fingerprint = generateFingerprintFromIp(ispInfo.ip, "4g");
      console.log("ISPInfo - Current IP:", ispInfo.ip);
      console.log("ISPInfo - Fingerprint:", fingerprint);
      
      setCurrentFingerprint(fingerprint);
      const mapping = getNetworkMapping(fingerprint);
      console.log("ISPInfo - Found mapping:", mapping);
      setCurrentMapping(mapping);
    }
  }, [ispInfo]);
  
  let displayISP = ispInfo?.isp;
  
  if (currentMapping?.customName) {
    displayISP = currentMapping.customName;
  }
  
  const isUnknown = !displayISP || displayISP === "Unknown" || displayISP === "Unknown ISP";

  const handleSaveManual = () => {
    if (manualISP && manualISP.trim() && ispInfo?.isp && ispInfo?.ip) {
      const newISP = manualISP.trim();
      // const currentVPN = getVPNState();
      
      // Save mapping for ALL network types that might be used
      const networkTypes = ["4g", "5g", "3g", "2g", "unknown"];
      
      networkTypes.forEach(networkType => {
        const fingerprint = generateFingerprintFromIp(ispInfo.ip!, networkType);
        const existingMapping = getNetworkMapping(fingerprint);
        
        if (!existingMapping || existingMapping.customName !== newISP) {
          saveISPMapping(fingerprint, ispInfo.isp!, newISP);
          console.log(`Saved mapping for ${networkType}: ${fingerprint} -> ${newISP}`);
        }
      });
      
      if (onISPManualSet) {
        onISPManualSet(newISP);
      }
      
      const fingerprint = generateFingerprintFromIp(ispInfo.ip, "4g");
      setCurrentMapping({
        fingerprint: fingerprint,
        originalName: ispInfo.isp,
        customName: newISP,
        lastSeen: Date.now()
      });
      
      setIsEditing(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  if (!ispInfo) {
    return (
      <div style={{ background: "#f1f5f9", borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span>🏢</span>
        <div>
          <div style={{ fontSize: "10px", color: "#64748b" }}>Network</div>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Detecting...</div>
        </div>
      </div>
    );
  }

  if (isUnknown && !isEditing) {
    return (
      <div style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", borderRadius: "12px", padding: "10px 14px", border: "1px solid #f59e0b" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🏢</span>
            <div>
              <div style={{ fontSize: "10px", color: "#92400e" }}>Network</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#78350f" }}>{ispInfo.isp || "Not Detected"}</div>
            </div>
          </div>
          {ispInfo?.ip && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "#92400e" }}>{ispInfo.city}, {ispInfo.country}</div>
              <div style={{ fontSize: "9px", color: "#78350f", fontFamily: "monospace" }}>{ispInfo.ip}</div>
            </div>
          )}
        </div>
        <button onClick={() => setIsEditing(true)} style={{ marginTop: "8px", width: "100%", padding: "6px", background: "#f59e0b", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>✏️ Name This Network</button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "8px", fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Name this network</div>
        <div style={{ marginBottom: "8px", fontSize: "10px", color: "#64748b" }}>
          <span>Detected: {ispInfo?.isp}</span>
          {ispInfo?.ip && <span style={{ marginLeft: "8px" }}>📡 {ispInfo.ip}</span>}
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input type="text" value={manualISP} onChange={(e) => setManualISP(e.target.value)} placeholder="e.g., HOME, OFFICE, Cafe WiFi" style={{ flex: 1, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", outline: "none" }} autoFocus />
          <button onClick={handleSaveManual} style={{ padding: "8px 16px", background: "#10b981", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>Save</button>
          <button onClick={() => setIsEditing(false)} style={{ padding: "8px 16px", background: "#64748b", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", borderRadius: "12px", padding: "10px 14px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🏢</span>
          <div>
            <div style={{ fontSize: "10px", color: "#64748b" }}>Network</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{displayISP}</span>
              {isVPN && <span style={{ fontSize: "9px", background: "#8b5cf6", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontWeight: "500" }}>🛡️ VPN</span>}
            </div>
            {currentMapping?.originalName && currentMapping.originalName !== displayISP && (
              <div style={{ fontSize: "9px", color: "#94a3b8", marginTop: "2px" }}>Original: {currentMapping.originalName}</div>
            )}
          </div>
        </div>
        {ispInfo?.ip && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#64748b" }}>{ispInfo.city}, {ispInfo.country}</div>
            <div style={{ fontSize: "9px", color: "#94a3b8", fontFamily: "monospace" }}>{ispInfo.ip}</div>
          </div>
        )}
      </div>
      <button onClick={() => { setManualISP(displayISP || ""); setIsEditing(true); }} style={{ marginTop: "8px", width: "100%", padding: "4px", background: "transparent", border: "1px dashed #cbd5e1", borderRadius: "6px", color: "#64748b", cursor: "pointer", fontSize: "10px" }}>✏️ Rename Network</button>
      <button onClick={() => { localStorage.removeItem("cached_isp_info"); window.location.reload(); }} style={{ marginTop: "6px", width: "100%", padding: "4px", background: "transparent", border: "1px dashed #cbd5e1", borderRadius: "6px", color: "#64748b", cursor: "pointer", fontSize: "10px" }}>🔄 Refresh Network Detection</button>
    </div>
  );
}