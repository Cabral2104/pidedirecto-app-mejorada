// src/pages/RestaurantsPage.jsx
import { useState, useMemo } from "react";
import Stars from "../components/Stars";
import { useRestaurants } from "../hooks/useRestaurants";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 20, overflow: "hidden" }}>
      <div style={{ height: 196, background: "var(--bg3)", animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: "16px 18px" }}>
        {[120, 80, 160].map((w) => (
          <div key={w} style={{ height: 13, width: w, borderRadius: 6, marginBottom: 10, background: "var(--bg3)", animation: "shimmer 1.5s infinite" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Restaurant card ──────────────────────────────────────────────────────────
function RestaurantCard({ restaurant, onClick, delay }) {
  const tags = restaurant.tags ?? (restaurant.category ? [restaurant.category] : []);
  return (
    <div className="card" style={{ cursor: "pointer", animation: `fadeUp 0.5s ease ${delay}s both` }} onClick={onClick}>
      <div style={{ position: "relative" }}>
        <img src={restaurant.image} alt={restaurant.name} style={{ width: "100%", height: 196, objectFit: "cover" }} />
        {!restaurant.isOpen && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ background: "var(--bg)", border: "1px solid var(--divider)", padding: "7px 18px", borderRadius: 50, fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>Cerrado ahora</span>
          </div>
        )}
        {restaurant.featured && <span className="badge badge-new" style={{ position: "absolute", top: 12, left: 12 }}>Destacado</span>}
        {restaurant.promo && (
          <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, background: "rgba(12,10,9,0.82)", backdropFilter: "blur(8px)", border: "1px solid var(--tag-border)", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "var(--amber)" }}>
            {restaurant.promo}
          </div>
        )}
      </div>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 22 }}>{restaurant.logo ?? "🍽️"}</span>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{restaurant.name}</h3>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{restaurant.cuisine ?? restaurant.category}</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
            <Stars rating={restaurant.rating ?? 0} size={12} />
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>({restaurant.reviews ?? 0})</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
          <span>⏱ {restaurant.deliveryTime ?? "—"}</span>
          <span>🚚 ${restaurant.deliveryFee ?? 0} envío</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tags.map((tag) => <span key={tag} className="tag" style={{ fontSize: 11 }}>{tag}</span>)}
        </div>
      </div>
    </div>
  );
}

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "default",      label: "Relevancia"       },
  { value: "rating",       label: "Mejor calificados"},
  { value: "deliveryTime", label: "Más rápidos"      },
  { value: "deliveryFee",  label: "Menor envío"      },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RestaurantsPage({ setView, setSelectedRestaurant }) {
  const { restaurants, loading, loadingMore, hasMore, loadMore } = useRestaurants();

  const [search,       setSearch]       = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [onlyOpen,     setOnlyOpen]     = useState(false);
  const [sortBy,       setSortBy]       = useState("default");

  // Categorías dinámicas a partir de los datos reales
  const categories = useMemo(() => {
    const set = new Set();
    restaurants.forEach((r) => {
      const tags = r.tags ?? (r.category ? [r.category] : []);
      tags.forEach((t) => set.add(t));
    });
    return ["Todos", ...Array.from(set).sort()];
  }, [restaurants]);

  // Filtrado + ordenamiento
  const filtered = useMemo(() => {
    let list = restaurants.filter((r) => {
      const tags = r.tags ?? (r.category ? [r.category] : []);
      const q    = search.toLowerCase();

      const matchSearch =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        (r.cuisine ?? r.category ?? "").toLowerCase().includes(q) ||
        tags.some((t) => t.toLowerCase().includes(q));

      const matchFilter =
        activeFilter === "Todos" ||
        tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()));

      const matchOpen = !onlyOpen || r.isOpen === true;

      return matchSearch && matchFilter && matchOpen;
    });

    if (sortBy === "rating") {
      list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "deliveryTime") {
      const mins = (s) => parseInt((s ?? "99").replace(/\D.*/, "")) || 99;
      list = [...list].sort((a, b) => mins(a.deliveryTime) - mins(b.deliveryTime));
    } else if (sortBy === "deliveryFee") {
      list = [...list].sort((a, b) => (a.deliveryFee ?? 0) - (b.deliveryFee ?? 0));
    }

    return list;
  }, [restaurants, search, activeFilter, onlyOpen, sortBy]);

  const handleOpen = (r) => { setSelectedRestaurant(r); setView("menu"); };
  const hasActiveFilters = search || activeFilter !== "Todos" || onlyOpen || sortBy !== "default";

  const clearAll = () => {
    setSearch(""); setActiveFilter("Todos"); setOnlyOpen(false); setSortBy("default");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 20px 60px" }}>

      {/* Header */}
      <div style={{ marginBottom: 36, animation: "fadeUp 0.5s ease" }}>
        <span className="tag">Tu ciudad</span>
        <h1 style={{ fontSize: "clamp(30px,4vw,50px)", fontWeight: 900, letterSpacing: -1, marginTop: 12, marginBottom: 8, color: "var(--text)" }}>
          Restaurantes cerca de ti
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Elige, agrega al carrito y pide por WhatsApp en segundos
        </p>
      </div>

      {/* Búsqueda + controles */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>

        {/* Search input */}
        <div className="search-bar" style={{ flex: 1, minWidth: 260, maxWidth: 480 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Buscar restaurante o tipo de comida..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>
              ✕
            </button>
          )}
        </div>

        {/* Ordenar */}
        <div style={{ position: "relative" }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              appearance: "none", WebkitAppearance: "none",
              background: sortBy !== "default" ? "var(--tag-bg)" : "var(--bg3)",
              border: `1.5px solid ${sortBy !== "default" ? "var(--orange)" : "var(--divider)"}`,
              color: sortBy !== "default" ? "var(--orange)" : "var(--text)",
              padding: "10px 36px 10px 14px", borderRadius: 50,
              fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13,
              cursor: "pointer",
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: sortBy !== "default" ? "var(--orange)" : "var(--text-muted)", fontSize: 11 }}>▾</span>
        </div>

        {/* Solo abiertos */}
        <button
          onClick={() => setOnlyOpen((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 50, border: "1.5px solid",
            borderColor: onlyOpen ? "var(--green-border)" : "var(--divider)",
            background: onlyOpen ? "var(--green-bg)" : "var(--bg3)",
            color: onlyOpen ? "var(--green)" : "var(--text-muted)",
            fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13,
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
          Abiertos ahora
        </button>
      </div>

      {/* Categorías dinámicas */}
      {!loading && categories.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
          {categories.map((f) => (
            <button key={f} className={`cat-pill ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Contador de resultados */}
      {!loading && hasActiveFilters && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>
            {filtered.length === 0
              ? "Sin resultados"
              : `${filtered.length} ${filtered.length === 1 ? "restaurante" : "restaurantes"}`}
          </span>
          <button onClick={clearAll} style={{ background: "none", border: "none", color: "var(--orange)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No encontramos resultados</h3>
          <p style={{ marginBottom: 20 }}>Intenta con otro término o cambia los filtros.</p>
          <button className="btn-ghost" onClick={clearAll}>Limpiar filtros</button>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {filtered.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} onClick={() => handleOpen(r)} delay={i * 0.04} />
            ))}
          </div>

          {/* Load more — solo sin filtros activos */}
          {hasMore && !hasActiveFilters && (
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <button className="btn-ghost" onClick={loadMore} disabled={loadingMore} style={{ padding: "14px 40px", fontSize: 15 }}>
                {loadingMore ? "Cargando..." : "Ver más restaurantes"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}