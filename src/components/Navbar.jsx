// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useCart }  from "../context/CartContext";
import { useAuth }  from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { formatOrderTime } from "../firebase/services/orderService";

const TYPE_ICON = {
  new_order:       "🛍️",
  order_status:    "📦",
  order_cancelled: "❌",
};

export default function Navbar({ view, setView }) {
  const { theme, toggleTheme }                  = useTheme();
  const { itemCount, setCartOpen }              = useCart();
  const { user, profile, logout, isRestaurant } = useAuth();
  const { notifications, unreadCount, readOne, readAll } = useNotifications();

  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);

  const NAV = [
    { id: "home",        label: "Inicio" },
    { id: "restaurants", label: "Restaurantes" },
    ...(isRestaurant ? [{ id: "dashboard", label: "📋 Panel" }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    setView("home");
    setMenuOpen(false);
  };

  // No leídas primero, luego leídas — máx 8
  const sortedNotifs = [
    ...notifications.filter((n) => !n.read),
    ...notifications.filter((n) =>  n.read),
  ].slice(0, 8);

  const handleOpenNotif = () => {
    setNotifOpen((p) => !p);
    setMenuOpen(false);
  };

  const handleOpenMenu = () => {
    setMenuOpen((p) => !p);
    setNotifOpen(false);
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "var(--nav-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--nav-border)",
      boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.18)" : "none",
      transition: "box-shadow 0.3s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 66, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>

        {/* Logo */}
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 0, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--orange), var(--orange-light))", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🍴</div>
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 21, color: "var(--text)", letterSpacing: -0.5 }}>
            Pide<span style={{ color: "var(--orange)" }}>Directo</span>
          </span>
        </button>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 4 }}>
          {NAV.map(({ id, label }) => (
            <button key={id} className={`nav-pill ${view === id ? "active" : ""}`} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Theme */}
          <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--divider)", background: "var(--bg3)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* ── Notificaciones ── */}
          {user && (
            <div style={{ position: "relative" }}>
              <button
                onClick={handleOpenNotif}
                style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--divider)", background: "var(--bg3)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, background: "var(--orange)", color: "#fff", fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg)", padding: "0 3px", animation: "bounceIn 0.4s ease" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setNotifOpen(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 18, boxShadow: "var(--shadow-hover)", width: 340, zIndex: 99, animation: "fadeUp 0.2s ease", display: "flex", flexDirection: "column", overflow: "hidden" }}>

                    {/* Header */}
                    <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 15, color: "var(--text)" }}>Notificaciones</span>
                        {unreadCount > 0 && (
                          <span style={{ background: "var(--orange)", color: "#fff", fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={readAll} style={{ background: "none", border: "none", color: "var(--orange)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                          Marcar todas leídas
                        </button>
                      )}
                    </div>

                    {/* Lista */}
                    <div style={{ overflowY: "auto", maxHeight: 380 }}>
                      {sortedNotifs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                          <p style={{ fontSize: 13 }}>Sin notificaciones aún</p>
                        </div>
                      ) : (
                        <>
                          {sortedNotifs.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => readOne(n.id)}
                              style={{
                                display: "flex", gap: 12, padding: "12px 16px",
                                borderBottom: "1px solid var(--divider)",
                                background: n.read ? "transparent" : "var(--tag-bg)",
                                cursor: "default", transition: "background 0.2s",
                              }}
                            >
                              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>
                                {TYPE_ICON[n.type] ?? "🔔"}
                              </span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: n.read ? 600 : 800, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>
                                  {n.title}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, marginBottom: 4 }}>
                                  {n.body}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                  {formatOrderTime(n.createdAt)}
                                </div>
                              </div>
                              {!n.read && (
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", flexShrink: 0, marginTop: 5 }} />
                              )}
                            </div>
                          ))}

                          {/* Pie si hay más de 8 */}
                          {notifications.length > 8 && (
                            <div style={{ padding: "10px 16px", textAlign: "center", fontSize: 12, color: "var(--text-muted)", borderTop: "1px solid var(--divider)" }}>
                              Mostrando las 8 más recientes
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Cart */}
          <button onClick={() => setCartOpen(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--tag-bg)", border: "1.5px solid var(--tag-border)", color: "var(--text)", padding: "8px 16px", borderRadius: 50, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14, position: "relative", flexShrink: 0 }}>
            🛒
            {itemCount > 0 && (
              <span style={{ position: "absolute", top: -7, right: -7, background: "var(--orange)", color: "#fff", fontSize: 11, fontWeight: 800, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg)", animation: "bounceIn 0.4s ease" }}>
                {itemCount}
              </span>
            )}
          </button>

          {/* User */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button onClick={handleOpenMenu} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg3)", border: "1.5px solid var(--divider)", color: "var(--text)", padding: "7px 14px", borderRadius: 50, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, var(--orange), var(--amber))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
                  {(profile?.name ?? user.displayName ?? user.email)?.[0]?.toUpperCase() ?? "?"}
                </span>
                <span style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile?.name ?? user.displayName ?? user.email?.split("@")[0]}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setMenuOpen(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 16, boxShadow: "var(--shadow-hover)", padding: 8, minWidth: 210, zIndex: 99, animation: "fadeUp 0.2s ease" }}>
                    {/* Info */}
                    <div style={{ padding: "8px 12px 12px", borderBottom: "1px solid var(--divider)", marginBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                        {profile?.name ?? user.displayName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{user.email}</div>
                      <span style={{ fontSize: 10, fontWeight: 800, background: isRestaurant ? "var(--tag-bg)" : "var(--green-bg)", color: isRestaurant ? "var(--orange)" : "var(--green)", border: `1px solid ${isRestaurant ? "var(--tag-border)" : "var(--green-border)"}`, padding: "2px 10px", borderRadius: 50, marginTop: 6, display: "inline-block" }}>
                        {isRestaurant ? "Restaurante" : "Cliente"}
                      </span>
                    </div>
                    <button onClick={() => { setView("profile"); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", background: "none", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "var(--text)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, textAlign: "left" }}>
                      👤 Mi perfil
                    </button>
                    {isRestaurant && (
                      <button onClick={() => { setView("dashboard"); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", background: "none", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "var(--text)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, textAlign: "left" }}>
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
            <button onClick={() => setView("login")} className="btn-primary" style={{ padding: "9px 20px", fontSize: 14, flexShrink: 0 }}>
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}