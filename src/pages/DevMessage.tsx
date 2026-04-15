// pages/DevMessage.tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function DevMessage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/sounds/dev-message.mp3" preload="auto" />
      
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        paddingTop: "80px", // Add padding to account for navbar
      }}>
        <button 
          onClick={() => navigate("/info")} 
          style={{
            position: "fixed",
            top: "80px", // Position below navbar (adjust based on your navbar height)
            left: "20px",
            zIndex: 100,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        
        <p>sorryy, guys i will tell you about myself later....</p>
        
        <img 
          src="/images/developer-meme.webp" 
          alt="Developer Meme"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    </>
  );
}