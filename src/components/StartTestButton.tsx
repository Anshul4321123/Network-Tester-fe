// components/StartTestButton.tsx - MOBILE OPTIMIZED
import { useState } from "react";

interface Props {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}

export default function StartTestButton({ onClick, disabled }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      style={{
        padding: "clamp(10px, 3vw, 12px) clamp(16px, 5vw, 24px)",
        width: "100%",
        cursor: (disabled || isLoading) ? "not-allowed" : "pointer",
        background: (disabled || isLoading) ? "#94a3b8" : "#10b981",
        color: (disabled || isLoading) ? "#cbd5e1" : "#fff",
        border: "none",
        borderRadius: "60px",
        fontWeight: "bold",
        fontSize: "clamp(14px, 4vw, 16px)",
        transition: "all 0.2s",
        minHeight: "48px", // Better touch target on mobile
      }}
    >
      {isLoading ? "⏳ Testing..." : (disabled ? "🚀 Testing..." : "Start Test")}
    </button>
  );
}