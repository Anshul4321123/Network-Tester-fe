// components/Navbar.tsx - Fixed radius handling when expanded
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [flickerActive, setFlickerActive] = useState(false);

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

  // Close menu on route change and trigger flicker effect
  useEffect(() => {
    setIsMenuOpen(false);
    setFlickerActive(true);
    const timer = setTimeout(() => setFlickerActive(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/history", label: "History", icon: "📊" },
    { to: "/info", label: "Info", icon: "ℹ️" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const linkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "50px",
    fontSize: "15px",
    fontWeight: "500",
    textDecoration: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background: "transparent",
    color: "#fff",
    position: "relative",
    cursor: "pointer",
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    background: "rgba(16, 185, 129, 0.2)",
    color: "#10b981",
    boxShadow: "0 0 12px rgba(16, 185, 129, 0.4)",
    animation: flickerActive ? "flicker 0.5s ease" : "none",
  };

  // Determine border radius based on menu state
  const getNavbarRadius = () => {
    if (!isMobile) return "60px";
    if (isMenuOpen) return "20px 20px 0 0";
    return "60px";
  };

  const getDropdownRadius = () => {
    if (isMenuOpen) return "20px 20px 20px 20px";
    return "0 0 60px 60px";
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: isMobile ? "12px" : "16px",
          background: "transparent",
        }}
      >
        <nav
          style={{
            position: "relative",
            zIndex: 100,
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            borderRadius: getNavbarRadius(),
            width: isMobile ? "100%" : "90%",
            maxWidth: "1200px",
            transition: "all 0.3s ease",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: isMobile ? "8px 16px" : "12px 24px",
              width: "100%",
            }}
          >
            {/* Logo */}
            <div
              style={{
                transition: "transform 0.3s ease",
                cursor: "pointer",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Logo variant="compact" size={isMobile ? "small" : "medium"} />
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                }}
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      ...(isActive(link.to) ? activeLinkStyle : linkStyle),
                      transform: hoveredLink === link.to ? "translateY(-2px)" : "translateY(0)",
                    }}
                    onMouseEnter={() => setHoveredLink(link.to)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <span style={{ fontSize: "18px", transition: "transform 0.3s ease" }}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                    {isActive(link.to) && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "-4px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "30px",
                          height: "3px",
                          background: "#10b981",
                          borderRadius: "2px",
                          animation: "pulse 1.5s infinite",
                        }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Hamburger Button - Inside navbar */}
            {isMobile && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "40px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontSize: "22px",
                  color: "#fff",
                  transform: isMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
                  flexShrink: 0,
                  marginRight:"30px",
                  paddingRight:"5px"
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
                gap: "8px",
                animation: "slideDown 0.3s ease",
                borderRadius: getDropdownRadius(),
              }}
            >
              {navLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 20px",
                    borderRadius: "50px",
                    fontSize: "16px",
                    fontWeight: "500",
                    textDecoration: "none",
                    background: isActive(link.to) ? "rgba(16, 185, 129, 0.15)" : "transparent",
                    color: isActive(link.to) ? "#10b981" : "#fff",
                    transition: "all 0.3s ease",
                    border: isActive(link.to) ? "1px solid rgba(16, 185, 129, 0.3)" : "none",
                    animation: `slideIn 0.3s ease ${index * 0.05}s backwards`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.to)) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
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
                  {isActive(link.to) && (
                    <span style={{ marginLeft: "auto", fontSize: "14px" }}>✓</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes flicker {
          0% {
            opacity: 1;
            box-shadow: 0 0 0px rgba(16, 185, 129, 0);
          }
          25% {
            opacity: 0.7;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
          }
          75% {
            opacity: 0.8;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
          }
          100% {
            opacity: 1;
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            width: 30px;
          }
          50% {
            opacity: 0.5;
            width: 20px;
          }
        }
      `}</style>
    </>
  );
}