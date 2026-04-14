// components/Navbar.tsx - Responsive, themed, with TypeScript fixes
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/history", label: "History", icon: "📊" },
    { to: "/info", label: "Info", icon: "ℹ️" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getLinkStyle = (path: string): React.CSSProperties => ({
    color: isActive(path) ? "#10b981" : "#fff",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: isMobile ? "16px" : "14px",
    padding: "10px 16px",
    borderRadius: "8px",
    transition: "all 0.2s",
    background: isActive(path) ? "rgba(16,185,129,0.15)" : "transparent",
    display: "block",
    width: "100%",
    textAlign: "center" as const, // TypeScript literal
  });

  return (
    <>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "12px 16px" : "16px 24px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Logo variant="compact" size={isMobile ? "small" : "medium"} />

        {!isMobile && (
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  color: isActive(link.to) ? "#10b981" : "#e2e8f0",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontSize: "14px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                  background: isActive(link.to) ? "rgba(16,185,129,0.15)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.to))
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.to))
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              color: "#fff",
              padding: "8px",
              borderRadius: "8px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            aria-label="Menu"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {isMobile && isMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: isMobile ? "56px" : "72px",
            left: 0,
            right: 0,
            background: "#1e293b",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 99,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={getLinkStyle(link.to)}
              onMouseEnter={(e) => {
                if (!isActive(link.to))
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.to))
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}