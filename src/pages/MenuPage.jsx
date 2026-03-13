// src/pages/MenuPage.jsx
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useMenu } from "../hooks/useMenu";
import { subscribeToRestaurant } from "../firebase/services/restaurantService";
import { getRestaurantReviewsPaged } from "../firebase/services/reviewService";

// ─── Reviews section (public) ─────────────────────────────────────────────────
function ReviewsSection({ restaurantId, totalRating, totalCount }) {
  const [reviews,     setReviews]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore,     setHasMore]     = useState(false);
  const [lastDoc,     setLastDoc]     = useState(null);
  const [open,        setOpen]        = useState(false);

  useEffect(() => {
    if (!open || !restaurantId) return;
    if (reviews.length > 0) return; // ya cargó
    setLoading(true);
    getRestaurantReviewsPaged(restaurantId, null)
      .then(({ items, lastDoc: ld, hasMore: more }) => {
        setReviews(items);
        setLastDoc(ld);
        setHasMore(more);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, restaurantId]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { items, lastDoc: ld, hasMore: more } = await getRestaurantReviewsPaged(restaurantId, lastDoc);
      setReviews((prev) => [...prev, ...items]);
      setLastDoc(ld);
      setHasMore(more);
    } catch (e) { console.error(e); }
    finally { setLoadingMore(false); }
  };

  if (!totalCount || totalCount === 0) return null;

  return (
    <div style={{ padding: "0 20px 40px" }}>
      {/* Separador */}
      <div style={{ height: 1, background: "var(--divider)", margin: "8px 0 24px" }} />

      {/* Header clickable */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: 0, marginBottom: open ? 20 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 42, fontWeight: 900, color: "var(--orange)", lineHeight: 1 }}>
            {(totalRating ?? 0).toFixed(1)}
          </div>
          <div>
            <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
              {[1,2,3,4,5].map((s) => (
                <span key={s} style={{ fontSize: 17, filter: s <= Math.round(totalRating ?? 0) ? "none" : "grayscale(1) opacity(0.3)" }}>⭐</span>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
              {totalCount} {totalCount === 1 ? "reseña" : "reseñas"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--orange)" }}>
            {open ? "Ocultar reseñas" : "Ver reseñas"}
          </span>
          <span style={{ color: "var(--orange)", fontSize: 18, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            ▾
          </span>
        </div>
      </button>

      {/* Contenido expandible */}
      {open && (
        <div>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <div style={{ width: 32, height: 32, border: "3px solid var(--card-border)", borderTop: "3px solid var(--orange)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reviews.map((r, i) => (
                <div key={r.id} className="card" style={{ padding: 16, animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: r.comment ? 10 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--orange), var(--amber))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, color: "#fff", fontWeight: 800, flexShrink: 0,
                      }}>
                        {(r.userName ?? "?")?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                          {r.userName ?? "Cliente"}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {r.createdAt?.toDate
                            ? r.createdAt.toDate().toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
                            : "—"}
                        </div>
                      </div>
                    </div>
                    {/* Estrellas */}
                    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} style={{ fontSize: 13, filter: s <= r.rating ? "none" : "grayscale(1) opacity(0.3)" }}>⭐</span>
                      ))}
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--orange)", marginLeft: 4 }}>{r.rating}.0</span>
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, paddingLeft: 44 }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button className="btn-ghost" onClick={loadMore} disabled={loadingMore} style={{ padding: "10px 32px", fontSize: 13 }}>
                {loadingMore ? "Cargando..." : "Ver más reseñas"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function DishSkeleton() {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 16, display: "flex", gap: 14, padding: 16 }}>
      <div style={{ flex: 1 }}>
        {[140, 200, 80].map((w) => (
          <div key={w} style={{ height: 13, width: w, borderRadius: 6, marginBottom: 10, background: "var(--bg3)", animation: "shimmer 1.5s infinite" }} />
        ))}
      </div>
      <div style={{ width: 95, height: 95, borderRadius: 12, background: "var(--bg3)", flexShrink: 0, animation: "shimmer 1.5s infinite" }} />
    </div>
  );
}

// ─── Item detail modal ────────────────────────────────────────────────────────
function ItemModal({ item, onClose, onAdd, isOpen }) {
  return (
    <div className="overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 300 }} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <img src={item.image} alt={item.name} style={{ width: "100%", height: 210, objectFit: "cover", borderRadius: 16, marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {item.popular && <span className="badge badge-new">Popular</span>}
          {item.veg   && <span className="tag" style={{ fontSize: 11 }}>🌱 Vegetariano</span>}
          {item.spicy && <span className="tag" style={{ fontSize: 11, background: "var(--red-bg)", color: "var(--red)", borderColor: "var(--red-border)" }}>🌶️ Picante</span>}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>{item.name}</h2>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 22 }}>{item.description ?? item.desc}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 700, color: "var(--orange)" }}>${item.price}</span>
          {isOpen ? (
            <button className="btn-primary" style={{ padding: "12px 28px" }} onClick={() => { onAdd(item); onClose(); }}>
              🛒 Agregar al carrito
            </button>
          ) : (
            <span style={{ fontSize: 13, color: "var(--red)", fontWeight: 700, background: "var(--red-bg)", border: "1px solid var(--red-border)", padding: "10px 20px", borderRadius: 50 }}>
              🔴 Cerrado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dish row ─────────────────────────────────────────────────────────────────
function DishRow({ item, onSelect, qty, onAdd, onRemove, onIncrement, isOpen }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: 16,
        display: "flex",
        gap: 16,
        padding: 16,
        cursor: "pointer",
        transition: "all 0.25s",
        boxShadow: "var(--shadow-card)",
        opacity: isOpen ? 1 : 0.7,
      }}
      onClick={() => onSelect(item)}
      onMouseEnter={(e) => { if (isOpen) { e.currentTarget.style.borderColor = "var(--card-border-hover)"; e.currentTarget.style.transform = "translateX(4px)"; }}}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.transform = "translateX(0)"; }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{item.name}</h3>
          {item.popular && <span className="badge badge-new" style={{ fontSize: 9 }}>Popular</span>}
          {item.veg   && <span title="Vegetariano">🌱</span>}
          {item.spicy && <span title="Picante">🌶️</span>}
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 12 }}>
          {item.description ?? item.desc}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 700, color: "var(--orange)" }}>${item.price}</span>

          {/* Bloqueado si cerrado */}
          {!isOpen ? (
            <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 700, background: "var(--red-bg)", border: "1px solid var(--red-border)", padding: "6px 14px", borderRadius: 50 }}>
              🔴 Cerrado
            </span>
          ) : qty > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
              <button className="qty-btn qty-btn-minus" onClick={onRemove}>−</button>
              <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center", color: "var(--text)" }}>{qty}</span>
              <button className="qty-btn qty-btn-plus" onClick={onIncrement}>+</button>
            </div>
          ) : (
            <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}
              onClick={(e) => { e.stopPropagation(); onAdd(item); }}>
              + Agregar
            </button>
          )}
        </div>
      </div>
      <div style={{ width: 100, height: 100, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MenuPage({ restaurant: initialRestaurant, setView }) {
  const { cart, addItem, removeItem, incrementItem } = useCart();
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const { items, categories, loading } = useMenu(restaurant?.id);
  const [activeCat, setActiveCat] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Suscripción en tiempo real al restaurante para detectar cambios de isOpen
  useEffect(() => {
    if (!initialRestaurant?.id) return;
    const unsub = subscribeToRestaurant(initialRestaurant.id, setRestaurant);
    return () => unsub();
  }, [initialRestaurant?.id]);

  // Seleccionar primera categoría cuando carga el menú
  useEffect(() => {
    if (categories.length > 0 && !activeCat) {
      setActiveCat(categories[0]);
    }
  }, [categories]);

  const visibleItems = activeCat
    ? items.filter((i) => i.category === activeCat && i.available !== false)
    : items.filter((i) => i.available !== false);

  const getQty = (id) => cart.find((c) => c.id === id)?.qty ?? 0;

  const handleAdd = (item) => {
    if (!restaurant.isOpen) return;
    addItem({
      ...item,
      desc:                  item.description ?? item.desc ?? "",
      restaurantId:          restaurant.id,
      restaurantName:        restaurant.name,
      restaurantWhatsapp:    restaurant.phone ?? restaurant.whatsapp,
      restaurantDeliveryFee: restaurant.deliveryFee ?? 0,
    });
  };

  const isOpen = restaurant?.isOpen !== false;

  return (
    <>
      <div style={{ maxWidth: 1100, margin: "0 auto", paddingTop: 68 }}>

        {/* Cover */}
        <div style={{ position: "relative", height: 290, overflow: "hidden" }}>
          <img src={restaurant.image} alt={restaurant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)" }} />
          <button
            onClick={() => setView("restaurants")}
            style={{ position: "absolute", top: 18, left: 18, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "8px 16px", borderRadius: 50, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13 }}
          >
            ← Volver
          </button>
          <div style={{ position: "absolute", bottom: 22, left: 22, right: 22 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
              <div style={{ width: 60, height: 60, background: "var(--card)", border: "2px solid var(--card-border)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                {restaurant.logo ?? "🍽️"}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{restaurant.name}</h1>
                  <span className={`badge ${isOpen ? "badge-open" : "badge-closed"}`}>
                    {isOpen ? "● Abierto" : "● Cerrado"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.80)" }}>
                  <span>★ {restaurant.rating} ({restaurant.reviews ?? 0})</span>
                  <span>⏱ {restaurant.deliveryTime}</span>
                  {restaurant.deliveryFee !== undefined && <span>🚚 Env. ${restaurant.deliveryFee}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner cerrado — bloquea todo visualmente */}
        {!isOpen && (
          <div style={{ margin: "16px 20px 0", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28 }}>🔴</span>
            <div>
              <div style={{ fontWeight: 800, color: "var(--red)", fontSize: 16 }}>Restaurante cerrado</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>
                Este restaurante no está recibiendo pedidos ahora. Vuelve más tarde.
              </div>
            </div>
          </div>
        )}

        {/* Promo */}
        {restaurant.promo && isOpen && (
          <div style={{ margin: "16px 20px 0", background: "var(--tag-bg)", border: "1px solid var(--tag-border)", borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🎉</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--tag-color, var(--orange))" }}>{restaurant.promo}</span>
          </div>
        )}

        {/* Category tabs */}
        {!loading && categories.length > 0 && (
          <div style={{ padding: "20px 20px 0", display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {categories.map((cat) => (
              <button key={cat} className={`cat-pill ${activeCat === cat ? "active" : ""}`} onClick={() => setActiveCat(cat)}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Dish list */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading
            ? [1, 2, 3, 4].map((i) => <DishSkeleton key={i} />)
            : visibleItems.map((item, i) => (
              <div key={item.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                <DishRow
                  item={item}
                  qty={getQty(item.id)}
                  isOpen={isOpen}
                  onSelect={setSelectedItem}
                  onAdd={handleAdd}
                  onRemove={() => removeItem(item.id)}
                  onIncrement={() => incrementItem(item.id)}
                />
              </div>
            ))}
        </div>

        {/* Reseñas públicas */}
        <ReviewsSection
          restaurantId={restaurant.id}
          totalRating={restaurant.rating}
          totalCount={restaurant.reviews ?? 0}
        />

      </div>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          isOpen={isOpen}
          onClose={() => setSelectedItem(null)}
          onAdd={handleAdd}
        />
      )}
    </>
  );
}