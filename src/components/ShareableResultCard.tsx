// components/ShareableResultCard.tsx
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo"; // Import your Logo component

interface ShareableResultCardProps {
  score: number | null;
  ping: number | null;
  download: number | null;
  upload: number | null;
  jitter: number | null;
  networkType: string;
  mode: string;
  modeResult: string;
  onClose: () => void;
}

export default function ShareableResultCard({
  score,
  ping,
  download,
  upload,
  jitter,
  networkType,
  mode,
  modeResult,
  onClose,
}: ShareableResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if Web Share API is supported
    setShareSupported(typeof navigator.share !== 'undefined');
    // Check if mobile device
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const formatSpeed = (value: number | null) => {
    if (!value) return "--";
    if (value > 1000) return `${(value / 1000).toFixed(1)} Gbps`;
    return `${value.toFixed(1)} Mbps`;
  };

  const getScoreColor = () => {
    if (!score) return "#64748b";
    if (score > 80) return "#10b981";
    if (score > 50) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreMessage = () => {
    if (!score) return "Run a test to see your score";
    if (score > 80) return "Excellent Connection! 🚀";
    if (score > 50) return "Good Connection! 👍";
    return "Needs Improvement ⚠️";
  };

  const getNetworkIcon = () => {
    const type = networkType?.toLowerCase() || "";
    if (type === "5g") return "🚀";
    if (type === "4g") return "📶";
    if (type === "wifi") return "📡";
    return "🌐";
  };

  // Generate share text with website link
  const getShareText = () => {
    return `🌐 SpeedLab - Speed Test Results 🌐\n\n` +
      `📡 Score: ${score || "--"}/100\n` +
      `⚡ Download: ${formatSpeed(download)}\n` +
      `⬆️ Upload: ${formatSpeed(upload)}\n` +
      `📶 Ping: ${ping || "--"} ms\n` +
      `⚡ Jitter: ${jitter || "--"} ms\n` +
      `🌍 Network: ${networkType?.toUpperCase() || "Unknown"}\n` +
      `🎮 Mode: ${mode}\n` +
      `📊 ${modeResult}\n\n` +
      `🔗 Test your speed at: speedlab.live\n` +
      `⚡ Fast • Free • Accurate`;
  };

  // Copy as text (works on all devices)
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = getShareText();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share using Web Share API (mobile)
  const shareResult = async () => {
    try {
      await navigator.share({
        title: "SpeedLab - My Speed Test Result",
        text: getShareText(),
        url: "https://speedlab.live",
      });
    } catch (err) {
      console.error("Share failed:", err);
      // Fallback to copy
      copyToClipboard();
    }
  };

  // Download as image (using html-to-image)
  const downloadAsImage = async () => {
    try {
      const htmlToImage = await import('html-to-image');
      if (cardRef.current) {
        // Scale up for better quality on mobile
        const scale = isMobile ? 2 : 1;
        const dataUrl = await htmlToImage.toPng(cardRef.current, {
          quality: 1,
          pixelRatio: scale,
          backgroundColor: '#1e293b',
        });
        
        const link = document.createElement('a');
        link.download = `speedlab-${new Date().toISOString().slice(0, 19)}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Failed to download image:", err);
      // Fallback: copy text instead
      copyToClipboard();
      alert("Image save failed. Text has been copied to clipboard instead.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflow: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: "450px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: "28px",
          animation: "slideUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Result Card - Responsive sizing */}
        <div
          ref={cardRef}
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: "28px",
            padding: "clamp(20px, 5vw, 28px)",
            color: "#fff",
            boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header with Logo - USING YOUR EXISTING LOGO COMPONENT */}
          <div style={{ textAlign: "center", marginBottom: "clamp(16px, 4vw, 24px)" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              marginBottom: "12px",
            }}>
              <Logo variant="compact" size="medium" />
            </div>
            <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "8px" }}>
              {new Date().toLocaleString()}
            </div>
          </div>

          {/* Score Circle - Responsive */}
          <div style={{ textAlign: "center", marginBottom: "clamp(16px, 4vw, 24px)" }}>
            <div
              style={{
                width: "clamp(100px, 25vw, 120px)",
                height: "clamp(100px, 25vw, 120px)",
                margin: "0 auto",
                background: `conic-gradient(${getScoreColor()} ${(score || 0) * 3.6}deg, #334155 ${(score || 0) * 3.6}deg)`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "clamp(80px, 20vw, 100px)",
                  height: "clamp(80px, 20vw, 100px)",
                  background: "#1e293b",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <div style={{ fontSize: "clamp(28px, 7vw, 36px)", fontWeight: "bold", color: getScoreColor() }}>
                  {score || "--"}
                </div>
                <div style={{ fontSize: "10px", opacity: 0.7 }}>/100</div>
              </div>
            </div>
            <div style={{ fontSize: "clamp(12px, 3vw, 14px)", fontWeight: "500", marginTop: "12px", color: getScoreColor() }}>
              {getScoreMessage()}
            </div>
          </div>

          {/* Metrics Grid - Responsive 2 columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "clamp(12px, 3vw, 16px)",
              marginBottom: "clamp(16px, 4vw, 24px)",
              padding: "clamp(12px, 3vw, 16px)",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "20px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(20px, 5vw, 24px)", marginBottom: "4px" }}>📡</div>
              <div style={{ fontSize: "clamp(16px, 4vw, 20px)", fontWeight: "bold", color: "#10b981" }}>
                {ping || "--"} <span style={{ fontSize: "12px" }}>ms</span>
              </div>
              <div style={{ fontSize: "10px", opacity: 0.7 }}>Ping</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(20px, 5vw, 24px)", marginBottom: "4px" }}>⚡</div>
              <div style={{ fontSize: "clamp(16px, 4vw, 20px)", fontWeight: "bold", color: "#f59e0b" }}>
                {jitter || "--"} <span style={{ fontSize: "12px" }}>ms</span>
              </div>
              <div style={{ fontSize: "10px", opacity: 0.7 }}>Jitter</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(20px, 5vw, 24px)", marginBottom: "4px" }}>⬇️</div>
              <div style={{ fontSize: "clamp(14px, 3.5vw, 20px)", fontWeight: "bold", color: "#3b82f6" }}>
                {formatSpeed(download)}
              </div>
              <div style={{ fontSize: "10px", opacity: 0.7 }}>Download</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(20px, 5vw, 24px)", marginBottom: "4px" }}>⬆️</div>
              <div style={{ fontSize: "clamp(14px, 3.5vw, 20px)", fontWeight: "bold", color: "#8b5cf6" }}>
                {formatSpeed(upload)}
              </div>
              <div style={{ fontSize: "10px", opacity: 0.7 }}>Upload</div>
            </div>
          </div>

          {/* Network & Mode Info - Responsive row/column */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
              padding: "12px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>{getNetworkIcon()}</span>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "500" }}>
                  {networkType?.toUpperCase() || "Unknown"}
                </div>
                <div style={{ fontSize: "9px", opacity: 0.6 }}>Network</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>
                {mode === "gaming" ? "🎮" : mode === "streaming" ? "📺" : "💼"}
              </span>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "500" }}>{mode}</div>
                <div style={{ fontSize: "9px", opacity: 0.6 }}>Mode</div>
              </div>
            </div>
          </div>

          {/* Mode Result */}
          <div
            style={{
              textAlign: "center",
              padding: "10px",
              background: "rgba(139,92,246,0.2)",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#a78bfa",
              marginBottom: "16px",
            }}
          >
            {modeResult}
          </div>

{/* Website Link Section with Logo */}
<div
  style={{
    textAlign: "center",
    padding: "12px",
    background: "rgba(16,185,129,0.1)",
    borderRadius: "12px",
    border: "1px solid rgba(16,185,129,0.2)",
    marginBottom: "16px",
  }}
>
  <div style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>
    Test your speed at
  </div>
  <div style={{ 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "16px", 
    fontWeight: "bold",
    color: "#10b981",
    letterSpacing: "0.5px",
  }}>
    <span style={{ fontSize: "20px" }}>⚡</span>
    <span>speedlab.live</span>
    <span style={{ fontSize: "20px" }}>⚡</span>
  </div>
  <div style={{ fontSize: "9px", opacity: 0.5, marginTop: "4px" }}>
    Fast • Free • Accurate
  </div>
</div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              marginTop: "12px",
              fontSize: "9px",
              opacity: 0.5,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "12px",
            }}
          >
            © SpeedLab • Results may vary • Share your results!
          </div>
        </div>

        {/* Action Buttons - Responsive layout */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "16px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={copyToClipboard}
            style={{
              flex: isMobile ? 1 : "auto",
              minWidth: isMobile ? "calc(50% - 5px)" : "auto",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "16px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            📋 {copied ? "Copied!" : "Copy Text"}
          </button>

          <button
            onClick={downloadAsImage}
            style={{
              flex: isMobile ? 1 : "auto",
              minWidth: isMobile ? "calc(50% - 5px)" : "auto",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "16px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            📸 Save Image
          </button>

          {shareSupported && (
            <button
              onClick={shareResult}
              style={{
                flex: isMobile ? 1 : "auto",
                minWidth: isMobile ? "calc(50% - 5px)" : "auto",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "16px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
            >
              📤 Share
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              flex: isMobile ? 1 : "auto",
              minWidth: isMobile ? "calc(50% - 5px)" : "auto",
              padding: "12px 16px",
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "16px",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.2)";
            }}
          >
            Close
          </button>
        </div>
        
        {/* Note for mobile users */}
        {isMobile && (
          <div style={{ 
            textAlign: "center", 
            marginTop: "12px", 
            fontSize: "10px", 
            opacity: 0.6,
            color: "#94a3b8",
          }}>
            💡 Swipe to scroll • Save Image saves as PNG
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}