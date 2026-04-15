// pages/Info.tsx - Fixed version
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Info() {
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate(); // Add this

  const playExplosionSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
  };

  const handleSupportClick = () => {
    // Play explosion sound
    playExplosionSound();
    
    // Show popup
    setTimeout(() => {
      setShowSupportPopup(true);
    }, 100);
  };

  const handleDevClick = () => {
    // Use navigate instead of window.open for same-tab navigation
    navigate("/dev-message");
    // OR if you want new tab, use this:
    // window.open("/dev-message", "_blank", "noopener,noreferrer");
  };

  const closePopup = () => {
    setShowSupportPopup(false);
  };

  return (
    <>
      {/* Audio element for explosion sound */}
      <audio 
        ref={audioRef} 
        src="/sounds/explosion.mp3" 
        preload="auto"
      />

      {/* Support Popup */}
      {showSupportPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closePopup}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)",
              padding: "40px",
              maxWidth: "450px",
              width: "90%",
              textAlign: "center",
              borderRadius: "24px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
              border: "3px solid white",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "80px", marginBottom: "16px" }}>
              💥🔥💣
            </div>
            <h2 style={{ 
              marginBottom: "16px", 
              fontSize: "32px", 
              fontWeight: "bold",
              color: "#1a1a2e",
            }}>
              SURPRISE! 💥
            </h2>
            <p style={{ 
              fontSize: "18px", 
              lineHeight: "1.6", 
              marginBottom: "20px",
              color: "#1a1a2e",
              fontWeight: "500",
            }}>
              You just got EXPLODED by a developer who gives away quality work for FREE!
            </p>
            <p style={{ 
              fontSize: "14px", 
              color: "#2d3748", 
              marginBottom: "24px",
              background: "rgba(255,255,255,0.5)",
              padding: "10px",
              borderRadius: "12px",
            }}>
              ⚡ Open source is love. Open source is life. ⚡
            </p>
            <button
              onClick={closePopup}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "40px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Open Source Forever 
            </button>
            <p style={{ 
              fontSize: "11px", 
              marginTop: "20px", 
              color: "#1a1a2e",
              opacity: 0.7,
            }}>
              Click anywhere to close
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h1>SpeedLab</h1>
        <p>Phase 1 • Beta Release</p>

        <hr />

        <h2>About</h2>
        <p>
          SpeedLab provides internet speed testing with a connection score (0-100) 
          and recommendations for gaming, streaming, and remote work.
        </p>

        <h2>Features</h2>
        <ul>
          <li>Real-time speed testing</li>
          <li>Connection score (0-100)</li>
          <li>Gaming analysis</li>
          <li>Streaming insights</li>
          <li>Live graphs</li>
          <li>Achievements</li>
          <li>Share results</li>
          <li>Export CSV</li>
        </ul>

        <h2>Quick FAQ</h2>
        <p>
          <strong>How accurate is the test?</strong><br />
          Uses multiple parallel connections running for 8+ seconds.
        </p>
        <p>
          <strong>Why is my score different?</strong><br />
          Score = Download (40%) + Upload (20%) + Ping (40%)
        </p>
        <p>
          <strong>Best results?</strong><br />
          Close background apps, use wired connection, test multiple times.
        </p>

        <hr />

        <div style={{ display: "flex", gap: "16px", margin: "20px 0", flexWrap: "wrap" }}>
          <button
            onClick={handleSupportClick}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              borderRadius: "8px",
              fontWeight: "bold",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            💰 Support the Developer
          </button>

          <button
            onClick={handleDevClick}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #333 0%, #222 100%)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              borderRadius: "8px",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            👨‍💻 Know the Developer
          </button>
        </div>

        <hr />

        <p>
          <small>📍 Single-region server • Results may vary • More servers coming in Phase 2</small>
        </p>

        <p>
          <small>© 2024 SpeedLab • Phase 1 • Open Source ❤️</small>
        </p>
      </div>
    </>
  );
}