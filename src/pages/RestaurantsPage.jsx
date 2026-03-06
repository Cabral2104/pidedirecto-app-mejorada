// ─── src/pages/RestaurantsPage.jsx ───────────────────────────────────────────
// Reads restaurants in real time from Firestore via useRestaurants hook.

import { useState } from "react";
import Stars from "../components/Stars";
import ReviewsSection from "../components/ReviewsSection";
import { useRestaurants } from "../hooks/useRestaurants";

const FILTERS = ["Todos", "Parrilla", "Sushi", "Tacos", "Pizza", "Burgers", "Thai"];

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 196,
          background: "linear-gradient(90deg, var(--bg3) 25%, var(--bg2) 50%, var(--bg3) 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
      <div style={{ padding: "16px 18px" }}>
        {[120, 80, 160].map((w) => (
          <div
            key={w}
            style={{
              height: 14, width: w, borderRadius: 7, marginBottom: 10,
              background: "linear-gradient(90deg, var(--bg3) 25%, var(--bg2) 50%, var(--bg3) 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Restaurant card ─────────────────────────────────────────────────────────
function RestaurantCard({ restaurant, onClick, delay }) {
  // Firestore field is `phone` (whatsapp number) — fall back to `whatsapp` for compat
  const tags = restaurant.tags ?? (restaurant.category ? [restaurant.category] : []);

  return (
    <div
      className="card"
      style={{ cursor: "pointer", animation: `fadeUp 0.5s ease ${delay}s both` }}
      onClick={onClick}
    >
      <div style={{ position: "relative" }}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          style={{ width: "100%", height: 196, objectFit: "cover" }}
        />
        {!restaurant.isOpen && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ background: "var(--bg)", border: "1px solid var(--divider)", padding: "7px 18px", borderRadius: 50, fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>
              ⏰ Cerrado ahora
            </span>
          </div>
        )}
        {restaurant.featured && (
          <span className="badge badge-new" style={{ position: "absolute", top: 12, left: 12 }}>Destacado</span>
        )}
        {restaurant.promo && (
          <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, background: "rgba(12,10,9,0.82)", backdropFilter: "blur(8px)", border: "1px solid var(--tag-border)", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "var(--amber)" }}>
            🎉 {restaurant.promo}
          </div>
        )}
      </div>

      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 22 }}>{restaurant.logo ?? "🍽️"}</span>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {restaurant.name}
              </h3>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{restaurant.cuisine ?? restaurant.category}</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
            <Stars rating={restaurant.rating ?? 0} size={12} />
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>({restaurant.reviews ?? 0})</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
          <span>⏱ {restaurant.deliveryTime}</span>
          <span>💰 Mín. {restaurant.minOrder ?? `$${restaurant.deliveryFee ?? 0}`}</span>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tags.map((tag) => (
            <span key={tag} className="tag" style={{ fontSize: 11 }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RestaurantsPage({ setView, setSelectedRestaurant }) {
  const { restaurants, loading } = useRestaurants();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filtered = restaurants.filter((r) => {
    const tags = r.tags ?? (r.category ? [r.category] : []);
    const matchSearch =
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      (r.cuisine ?? r.category ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "Todos" ||
      tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()));
    return matchSearch && matchFilter;
  });

  const handleOpen = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setView("menu");
  };

  return (
    <>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 20px 60px" }}>
        <div style={{ marginBottom: 40, animation: "fadeUp 0.5s ease" }}>
          <span className="tag">🗺️ Tu ciudad</span>
          <h1 style={{ fontSize: "clamp(30px,4vw,50px)", fontWeight: 900, letterSpacing: -1, marginTop: 12, marginBottom: 8, color: "var(--text)" }}>
            Restaurantes cerca de ti
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
            Elige, agrega al carrito y pide por WhatsApp en segundos
          </p>
        </div>

        {/* Search */}
        <div className="search-bar" style={{ maxWidth: 460, marginBottom: 22 }}>
          <span style={{ fontSize: 17, color: "var(--text-muted)" }}>🔍</span>
          <input
            placeholder="Buscar restaurante o tipo de comida..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>✕</button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 36, overflowX: "auto", paddingBottom: 4 }}>
          {FILTERS.map((f) => (
            <button key={f} className={`cat-pill ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {filtered.map((r, i) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onClick={() => handleOpen(r)}
                delay={i * 0.07}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No encontramos resultados</h3>
            <p>Intenta con otro término de búsqueda o cambia el filtro.</p>
          </div>
        )}
      </div>

      <ReviewsSection />
    </>
  );
}
