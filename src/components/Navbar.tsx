// components/Navbar.tsx - Responsive, modern, with mobile menu
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/history", label: "History", icon: "📊" },
    { to: "/info", label: "Info", icon: "ℹ️" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Style objects with proper typing
  const linkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    transition: "all 0.2s ease",
    background: "transparent",
    color: "#fff",
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    background: "rgba(16, 185, 129, 0.15)",
    color: "#10b981",
    border: "1px solid rgba(16, 185, 129, 0.3)",
  };

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: isMobile ? "0" : "0 0 20px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMobile ? "12px 16px" : "16px 24px",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Logo */}
          <Logo variant="compact" size={isMobile ? "small" : "medium"} />

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={isActive(link.to) ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => {
                    if (!isActive(link.to)) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.to)) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile Hamburger Button */}
          {isMobile && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "12px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                fontSize: "20px",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobile && isMenuOpen && (
          <div
            style={{
              padding: "16px",
              background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  fontSize: "16px",
                  fontWeight: "500",
                  textDecoration: "none",
                  background: isActive(link.to) ? "rgba(16, 185, 129, 0.15)" : "transparent",
                  color: isActive(link.to) ? "#10b981" : "#fff",
                  transition: "all 0.2s",
                  border: isActive(link.to) ? "1px solid rgba(16, 185, 129, 0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.to)) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.to)) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: "20px" }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Optional: Add a small spacer to avoid content hiding under sticky navbar */}
      <div style={{ height: "1px" }} />
    </>
  );
}