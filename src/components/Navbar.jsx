// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ view, setView }) {
  const { theme, toggleTheme } = useTheme();
  const { itemCount, setCartOpen } = useCart();
  const { user, profile, logout, isRestaurant } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);

  // Nav links — Panel is only shown to restaurant accounts
  const NAV_LINKS = [
    { id: "home",        label: "Inicio" },
    { id: "restaurants", label: "Restaurantes" },
    ...(isRestaurant ? [{ id: "dashboard", label: "🏪 Panel" }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    setView("home");
    setUserMenuOpen(false);
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "var(--nav-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--nav-border)",
      boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.18)" : "none",
      transition: "box-shadow 0.3s, background 0.35s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 66, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>

        {/* Logo */}
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--orange), var(--orange-light))", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🍴</div>
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 21, color: "var(--text)", letterSpacing: -0.5 }}>
            Sabores<span style={{ color: "var(--orange)" }}>Ya</span>
          </span>
        </button>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 4 }}>
          {NAV_LINKS.map(({ id, label }) => (
            <button key={id} className={`nav-pill ${view === id ? "active" : ""}`} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Theme toggle */}
          <button onClick={toggleTheme} title={theme === "dark" ? "Modo claro" : "Modo oscuro"} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--divider)", background: "var(--bg3)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Cart */}
          <button onClick={() => setCartOpen(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--tag-bg)", border: "1.5px solid var(--tag-border)", color: "var(--text)", padding: "8px 16px", borderRadius: 50, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14, position: "relative", flexShrink: 0 }}>
            🛒
            {itemCount > 0 && (
              <span style={{ position: "absolute", top: -7, right: -7, background: "var(--orange)", color: "#fff", fontSize: 11, fontWeight: 800, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg)" }}>
                {itemCount}
              </span>
            )}
          </button>

          {/* User button */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg3)", border: "1.5px solid var(--divider)", color: "var(--text)", padding: "7px 14px", borderRadius: 50, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 }}
              >
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, var(--orange), var(--amber))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 800 }}>
                  {(profile?.name ?? user.displayName ?? user.email)?.[0]?.toUpperCase()}
                </span>
                <span style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile?.name ?? user.displayName ?? user.email}
                </span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setUserMenuOpen(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 16, boxShadow: "var(--shadow-hover)", padding: 8, minWidth: 200, zIndex: 99, animation: "fadeUp 0.2s ease" }}>
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--divider)", marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{profile?.name ?? user.displayName}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{user.email}</div>
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, background: isRestaurant ? "var(--tag-bg)" : "var(--green-bg)", color: isRestaurant ? "var(--orange)" : "var(--green)", border: `1px solid ${isRestaurant ? "var(--tag-border)" : "var(--green-border)"}`, padding: "2px 10px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {isRestaurant ? "🏪 Restaurante" : "👤 Cliente"}
                        </span>
                      </div>
                    </div>
                    {isRestaurant && (
                      <button onClick={() => { setView("dashboard"); setUserMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", background: "none", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "var(--text)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, textAlign: "left" }}>
                        🏪 Mi panel
                      </button>
                    )}
                    <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", background: "none", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "var(--red)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, textAlign: "left" }}>
                      🚪 Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => setView("login")} className="btn-primary" style={{ padding: "9px 20px", fontSize: 14 }}>
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
