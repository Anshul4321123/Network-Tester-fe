// components/Logo.tsx
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "full" | "icon" | "compact";
  size?: "small" | "medium" | "large";
}

export default function Logo({ variant = "full", size = "medium" }: LogoProps) {
  const sizes = {
    small: {
      icon: "20px",
      text: "14px",
      gap: "6px",
    },
    medium: {
      icon: "28px",
      text: "18px",
      gap: "8px",
    },
    large: {
      icon: "36px",
      text: "24px",
      gap: "10px",
    },
  };

  const currentSize = sizes[size];

  const LogoIcon = () => (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {/* Speedometer background */}
        <circle cx="16" cy="16" r="14" stroke="url(#gradient)" strokeWidth="2" fill="none" />
        
        {/* Speedometer arc */}
        <path
          d="M16 2 A14 14 0 0 1 28 16"
          stroke="url(#gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="20 65"
        />
        
        {/* Needle */}
        <line
          x1="16"
          y1="16"
          x2="22"
          y2="8"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transformOrigin: "16px 16px", animation: "spin 2s ease-in-out infinite" }}
        />
        
        {/* Center dot */}
        <circle cx="16" cy="16" r="3" fill="#10b981" />
        
        {/* Signal bars */}
        <rect x="8" y="22" width="2" height="4" fill="#3b82f6" rx="0.5">
          <animate attributeName="height" values="4;8;4" dur="1s" repeatCount="indefinite" />
        </rect>
        <rect x="11" y="20" width="2" height="6" fill="#3b82f6" rx="0.5">
          <animate attributeName="height" values="6;10;6" dur="1.2s" repeatCount="indefinite" />
        </rect>
        <rect x="14" y="18" width="2" height="8" fill="#3b82f6" rx="0.5">
          <animate attributeName="height" values="8;12;8" dur="1.4s" repeatCount="indefinite" />
        </rect>
        <rect x="17" y="16" width="2" height="10" fill="#3b82f6" rx="0.5">
          <animate attributeName="height" values="10;14;10" dur="1.6s" repeatCount="indefinite" />
        </rect>
        
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  if (variant === "icon") {
    return (
      <Link to="/" style={{ textDecoration: "none", display: "inline-flex" }}>
        <LogoIcon />
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: currentSize.gap,
          textDecoration: "none",
        }}
      >
        <LogoIcon />
        <span
          style={{
            fontSize: currentSize.text,
            fontWeight: "bold",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          SpeedLab
        </span>
      </Link>
    );
  }

  return (
    <Link
      to="/"
      style={{
        display: "flex",
        alignItems: "center",
        gap: currentSize.gap,
        textDecoration: "none",
      }}
    >
      <LogoIcon />
      <div>
        <div
          style={{
            fontSize: currentSize.text,
            fontWeight: "bold",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            lineHeight: 1.2,
          }}
        >
          SpeedLab
        </div>
        <div
          style={{
            fontSize: size === "large" ? "8px" : "7px",
            color: "#94a3b8",
            letterSpacing: "0.5px",
          }}
        >
          Speed Test Lab
        </div>
      </div>
    </Link>
  );
}