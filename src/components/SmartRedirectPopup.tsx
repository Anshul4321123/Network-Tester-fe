// components/SmartRedirectPopup.tsx
import { useEffect, useState } from "react";

interface SmartRedirectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  type: "high-latency" | "history" | "feature-highlight" | "achievement";
  data?: {
    ping?: number;
    testCount?: number;
    featureName?: string;
    achievementName?: string;
  };
}

export default function SmartRedirectPopup({ 
  isOpen, 
  onClose, 
  onAction, 
  type,
  data 
}: SmartRedirectPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        // Auto-hide after 8 seconds if not interacted
        handleClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleAction = (action: string) => {
    setIsVisible(false);
    setTimeout(() => {
      onAction(action);
      onClose();
    }, 300);
  };

  if (!isOpen && !isVisible) return null;

  // High Latency Popup
  if (type === "high-latency" && data?.ping) {
    const isHighLatency = data.ping > 100;
    const isVeryHighLatency = data.ping > 200;
    
    if (!isHighLatency) return null;
    
    return (
      <>
        <div style={styles.overlay} onClick={handleClose} />
        <div style={styles.popup}>
          <button onClick={handleClose} style={styles.closeBtn}>✕</button>
          
          <div style={styles.iconContainer}>
            <span style={styles.icon}>🚦</span>
          </div>
          
          <h3 style={styles.title}>
            {isVeryHighLatency ? "High Latency Detected!" : "Connection Slowing You Down?"}
          </h3>
          
          <p style={styles.description}>
            Your ping is <strong style={{ color: "#ef4444" }}>{Math.round(data.ping)}ms</strong>.
            {isVeryHighLatency 
              ? " This may cause lag in gaming, stuttering in video calls, and slow browsing."
              : " This could affect your gaming and streaming experience."}
          </p>
          
          <div style={styles.suggestionBox}>
            <span style={styles.suggestionIcon}>💡</span>
            <span style={styles.suggestionText}>
              Try finding a spot with better signal strength!
            </span>
          </div>
          
          <div style={styles.buttonGroup}>
            <button 
              onClick={() => handleAction("open-ping-scanner")} 
              style={styles.primaryBtn}
            >
              📡 Find Better Signal Spot
            </button>
            <button onClick={handleClose} style={styles.secondaryBtn}>
              Ignore
            </button>
          </div>
          
          <p style={styles.footerNote}>💡 You can also find this in Tools → Ping Scanner</p>
        </div>
      </>
    );
  }

  // History Discovery Popup
  if (type === "history" && data?.testCount && data.testCount >= 3) {
    return (
      <>
        <div style={styles.overlay} onClick={handleClose} />
        <div style={styles.popup}>
          <button onClick={handleClose} style={styles.closeBtn}>✕</button>
          
          <div style={styles.iconContainer}>
            <span style={styles.icon}>📊</span>
          </div>
          
          <h3 style={styles.title}>Your Internet Story</h3>
          
          <p style={styles.description}>
            You've completed <strong style={{ color: "#10b981" }}>{data.testCount} tests</strong> so far!
            Want to see how your connection has been performing over time?
          </p>
          
          <div style={styles.buttonGroup}>
            <button 
              onClick={() => handleAction("view-history")} 
              style={styles.primaryBtn}
            >
              📈 View Performance Trends
            </button>
            <button onClick={handleClose} style={styles.secondaryBtn}>
              Maybe Later
            </button>
          </div>
        </div>
      </>
    );
  }

  // Feature Highlight Popup (First-time only)
  if (type === "feature-highlight") {
    const featureName = data?.featureName || "Live Ping Scanner";
    const isPingFeature = featureName === "Live Ping Scanner";
    
    return (
      <>
        <div style={styles.overlay} onClick={handleClose} />
        <div style={styles.popup}>
          <button onClick={handleClose} style={styles.closeBtn}>✕</button>
          
          <div style={styles.iconContainer}>
            <span style={styles.icon}>{isPingFeature ? "📡" : "🎉"}</span>
          </div>
          
          <h3 style={styles.title}>New Feature: {featureName}</h3>
          
          <p style={styles.description}>
            {isPingFeature 
              ? "Walk around your space while watching the ping meter drop in real-time! Find the absolute best spot for gaming and streaming."
              : "We've added new tools to help you get the most out of your internet connection!"}
          </p>
          
          <div style={styles.featurePreview}>
            <div style={styles.previewItem}>✨ Real-time feedback</div>
            <div style={styles.previewItem}>🎯 Find optimal spot</div>
            <div style={styles.previewItem}>⚡ Improves experience</div>
          </div>
          
          <div style={styles.buttonGroup}>
            <button 
              onClick={() => handleAction(isPingFeature ? "open-ping-scanner" : "explore-feature")} 
              style={styles.primaryBtn}
            >
              🚀 Try Now
            </button>
            <button onClick={handleClose} style={styles.secondaryBtn}>
              Later
            </button>
          </div>
        </div>
      </>
    );
  }

  // Achievement Popup
  if (type === "achievement") {
    return (
      <>
        <div style={styles.overlay} onClick={handleClose} />
        <div style={styles.popup}>
          <button onClick={handleClose} style={styles.closeBtn}>✕</button>
          
          <div style={styles.iconContainer}>
            <span style={styles.icon}>🏆</span>
          </div>
          
          <h3 style={styles.title}>Achievement Unlocked!</h3>
          
          <p style={styles.description}>
            {data?.achievementName || "You're getting better at this!"}
          </p>
          
          <div style={styles.buttonGroup}>
            <button 
              onClick={() => handleAction("continue")} 
              style={styles.primaryBtn}
            >
              🎉 Awesome!
            </button>
          </div>
        </div>
      </>
    );
  }

  return null;
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 3000,
  },
  popup: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    maxWidth: "360px",
    width: "calc(100% - 48px)",
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: "20px",
    padding: "20px",
    zIndex: 3001,
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    animation: "slideInRight 0.3s ease",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  closeBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    textAlign: "center",
    marginBottom: "12px",
  },
  icon: {
    fontSize: "40px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: "8px",
  },
  description: {
    fontSize: "13px",
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: "1.5",
    marginBottom: "16px",
  },
  suggestionBox: {
    background: "rgba(59,130,246,0.15)",
    borderRadius: "12px",
    padding: "10px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderLeft: "3px solid #3b82f6",
  },
  suggestionIcon: { fontSize: "16px" },
  suggestionText: { fontSize: "11px", color: "#93c5fd", flex: 1 },
  featurePreview: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "16px",
  },
  previewItem: {
    background: "rgba(255,255,255,0.08)",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    color: "#94a3b8",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
  },
  primaryBtn: {
    flex: 1,
    padding: "10px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    border: "none",
    borderRadius: "40px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  secondaryBtn: {
    flex: 1,
    padding: "10px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "40px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
  },
  footerNote: {
    fontSize: "9px",
    color: "#64748b",
    textAlign: "center",
    margin: 0,
  },
};

// Add animation style to document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(styleSheet);