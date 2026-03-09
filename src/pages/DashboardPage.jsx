// src/pages/DashboardPage.jsx
import { useState, useEffect, useRef } from "react";
import { useOrders }  from "../hooks/useOrders";
import { useMenu }    from "../hooks/useMenu";
import { useAuth }    from "../context/AuthContext";
import {
  advanceOrderStatus,
  cancelOrder,
  formatOrderTime,
} from "../firebase/services/orderService";
import {
  subscribeToRestaurant,
  setRestaurantOpen,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../firebase/services/restaurantService";
import { uploadMenuItemImage } from "../firebase/services/storageService";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  nuevo:      { bg: "var(--tag-bg)",            color: "var(--orange)",     label: "🔔 Nuevo"      },
  preparando: { bg: "rgba(255,179,71,0.12)",    color: "var(--amber)",      label: "👨‍🍳 Preparando" },
  listo:      { bg: "var(--green-bg)",          color: "var(--green)",      label: "✅ Listo"       },
  entregado:  { bg: "var(--bg3)",               color: "var(--text-muted)", label: "📦 Entregado"  },
  cancelado:  { bg: "var(--red-bg)",            color: "var(--red)",        label: "❌ Cancelado"   },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <div style={{ width: 38, height: 38, border: "3px solid var(--card-border)", borderTop: "3px solid var(--orange)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, sub, delay }) {
  return (
    <div className="stat-card" style={{ animation: `fadeUp 0.45s ease ${delay}s both` }}>
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>{sub}</div>
    </div>
  );
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
function OrdersTab({ restaurantId }) {
  const { orders, loading, loadingMore, hasMore, loadMore, counts } = useOrders(restaurantId);
  const [filter, setFilter] = useState("todos");

  const visible = filter === "todos" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {[["todos","Todos"],["nuevo","Nuevos"],["preparando","Preparando"],["listo","Listos"],["entregado","Entregados"]].map(([v, l]) => (
          <button key={v} className={`cat-pill ${filter === v ? "active" : ""}`} onClick={() => setFilter(v)}>
            {l}{counts[v] ? ` (${counts[v]})` : ""}
          </button>
        ))}
      </div>

      {loading && <Spinner />}

      {!loading && visible.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>📋</div>
          <p>No hay pedidos {filter !== "todos" ? `"${filter}"` : "aún"}</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {visible.map((order, i) => {
          const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.nuevo;
          return (
            <div key={order.id} className="card" style={{ padding: 20, animation: `fadeUp 0.4s ease ${Math.min(i, 8) * 0.06}s both` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 16, color: "var(--text)" }}>
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{ background: sc.bg, color: sc.color, padding: "3px 12px", borderRadius: 50, fontSize: 12, fontWeight: 700, border: `1px solid ${sc.color}33` }}>
                      {sc.label}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatOrderTime(order.createdAt)}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 3 }}>{order.customerName}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                    {order.orderType === "pickup" ? "🏪 Recoger en local" : `📍 ${order.address}`}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                    {order.items?.map((it) => `${it.name} x${it.qty}`).join(", ")}
                  </div>
                  {order.note && (
                    <div style={{ fontSize: 12, color: "var(--amber)", marginBottom: 6, fontStyle: "italic" }}>📝 {order.note}</div>
                  )}
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 700, color: "var(--orange)" }}>${order.total}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg3)", padding: "3px 10px", borderRadius: 50 }}>
                      {order.paymentMethod === "cash" ? `💵 Efectivo (paga $${order.paymentAmount})` : "💳 Tarjeta"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                  {order.status !== "entregado" && order.status !== "cancelado" && (
                    <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}
                      onClick={() => advanceOrderStatus(order.id, order.status)}>
                      Siguiente →
                    </button>
                  )}
                  {order.status !== "cancelado" && order.status !== "entregado" && (
                    <button
                      onClick={() => { if (window.confirm("¿Cancelar este pedido?")) cancelOrder(order.id); }}
                      style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", color: "var(--red)", padding: "7px 14px", borderRadius: 50, fontSize: 12, cursor: "pointer", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación — cargar más pedidos */}
      {hasMore && filter === "todos" && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn-ghost" onClick={loadMore} disabled={loadingMore} style={{ padding: "12px 32px" }}>
            {loadingMore ? "Cargando..." : "Ver más pedidos"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── DISH MODAL (add & edit) ──────────────────────────────────────────────────
function DishModal({ restaurantId, dish, onClose }) {
  const isEditing = !!dish;
  const [form, setForm] = useState({
    name:        dish?.name        ?? "",
    price:       dish?.price       ?? "",
    description: dish?.description ?? "",
    category:    dish?.category    ?? "",
    popular:     dish?.popular     ?? false,
    veg:         dish?.veg         ?? false,
    spicy:       dish?.spicy       ?? false,
  });
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setPreview]    = useState(dish?.image ?? null);
  const [uploadProgress, setProgress] = useState(0);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const fileRef                       = useRef();

  const set    = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (k) => () => setForm((p) => ({ ...p, [k]: !p[k] }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("La imagen no debe superar 5 MB."); return; }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      setError("Nombre, precio y categoría son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let imageUrl = dish?.image ?? null;
      if (imageFile) {
        const itemId = dish?.id ?? `new_${Date.now()}`;
        imageUrl = await uploadMenuItemImage(restaurantId, itemId, imageFile, setProgress);
      }
      const data = {
        name:        form.name.trim(),
        price:       parseFloat(form.price),
        description: form.description.trim(),
        category:    form.category.trim(),
        popular:     form.popular,
        veg:         form.veg,
        spicy:       form.spicy,
        ...(imageUrl ? { image: imageUrl } : {}),
      };
      if (isEditing) {
        await updateMenuItem(restaurantId, dish.id, data);
      } else {
        await addMenuItem(restaurantId, { ...data, available: true });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 300 }}
      onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 800, marginBottom: 22, color: "var(--text)" }}>
          {isEditing ? "✏️ Editar platillo" : "➕ Nuevo platillo"}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Image upload */}
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Foto del platillo
            </span>
            <div onClick={() => fileRef.current.click()} style={{
              width: "100%", height: 160, borderRadius: 14,
              border: `2px dashed ${imagePreview ? "var(--orange)" : "var(--divider)"}`,
              background: "var(--bg3)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden", position: "relative", transition: "border-color 0.2s",
            }}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>📷 Cambiar foto</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Clic para subir imagen</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>JPG, PNG, WebP · máx. 5 MB</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div style={{ marginTop: 8 }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>Subiendo… {uploadProgress}%</span>
              </div>
            )}
          </div>

          {/* Name */}
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Nombre *</span>
            <input placeholder="Ej. Pollo a la parrilla" value={form.name} onChange={set("name")} />
          </label>

          {/* Price + Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Precio *</span>
              <input type="number" min="1" placeholder="150" value={form.price} onChange={set("price")} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Categoría *</span>
              <input placeholder="Ej. Entradas" value={form.category} onChange={set("category")} />
            </label>
          </div>

          {/* Description */}
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Descripción</span>
            <textarea placeholder="Ingredientes, preparación…" value={form.description} onChange={set("description")} rows={2} />
          </label>

          {/* Flags */}
          <div style={{ display: "flex", gap: 10 }}>
            {[["popular","⭐ Popular"],["veg","🌱 Vegetariano"],["spicy","🌶️ Picante"]].map(([k, label]) => (
              <button key={k} onClick={toggle(k)} style={{
                flex: 1, padding: "8px 6px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${form[k] ? "var(--orange)" : "var(--divider)"}`,
                background: form[k] ? "var(--tag-bg)" : "var(--bg3)",
                color: form[k] ? "var(--orange)" : "var(--text-muted)",
                fontFamily: "Plus Jakarta Sans, sans-serif", transition: "all 0.2s",
              }}>
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={handleSave}
              disabled={saving || !form.name || !form.price || !form.category}>
              {saving
                ? (uploadProgress > 0 ? `Subiendo ${uploadProgress}%…` : "Guardando…")
                : (isEditing ? "Guardar cambios" : "Agregar platillo")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DISHES TAB ───────────────────────────────────────────────────────────────
function DishesTab({ restaurantId }) {
  const { items, loading } = useMenu(restaurantId);
  const [modal, setModal] = useState(null); // null | "add" | dish object

  const handleSoftDelete = async (dish) => {
    if (!window.confirm(`¿Ocultar "${dish.name}" del menú? Puedes reactivarlo después.`)) return;
    await updateMenuItem(restaurantId, dish.id, { available: false });
  };

  const handleRestore = async (dish) => {
    await updateMenuItem(restaurantId, dish.id, { available: true });
  };

  const active   = items.filter((d) => d.available !== false);
  const inactive = items.filter((d) => d.available === false);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
          {active.length} activos · {inactive.length} ocultos
        </span>
        <button className="btn-primary" onClick={() => setModal("add")}>+ Agregar platillo</button>
      </div>

      {loading && <Spinner />}

      {/* Active */}
      {!loading && active.length === 0 && inactive.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🍽️</div>
          <p>Aún no tienes platillos. ¡Agrega el primero!</p>
        </div>
      )}

      {!loading && active.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
          {active.map((dish, i) => (
            <div key={dish.id} className="card" style={{ animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}>
              <div style={{ position: "relative" }}>
                <img
                  src={dish.image ?? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80"}
                  alt={dish.name}
                  style={{ width: "100%", height: 130, objectFit: "cover" }}
                />
                {dish.popular && <span className="badge badge-new" style={{ position: "absolute", top: 8, left: 8 }}>Popular</span>}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", flex: 1, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{dish.name}</h3>
                  <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, color: "var(--orange)", marginLeft: 8, flexShrink: 0 }}>${dish.price}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.5 }}>{dish.description}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span className="tag" style={{ fontSize: 10 }}>{dish.category}</span>
                  {dish.veg   && <span className="tag" style={{ fontSize: 10 }}>🌱</span>}
                  {dish.spicy && <span className="tag" style={{ fontSize: 10 }}>🌶️</span>}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={() => setModal(dish)} style={{ background: "var(--tag-bg)", border: "1px solid var(--tag-border)", color: "var(--orange)", padding: "4px 10px", borderRadius: 50, fontSize: 12, cursor: "pointer", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      Editar
                    </button>
                    <button onClick={() => handleSoftDelete(dish)} style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", color: "var(--red)", padding: "4px 10px", borderRadius: 50, fontSize: 12, cursor: "pointer", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      Ocultar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden */}
      {!loading && inactive.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            🙈 Platillos ocultos
            <span style={{ fontSize: 12, fontWeight: 400 }}>(no aparecen en el menú público)</span>
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {inactive.map((dish) => (
              <div key={dish.id} className="card" style={{ opacity: 0.6 }}>
                <img
                  src={dish.image ?? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80"}
                  alt={dish.name}
                  style={{ width: "100%", height: 100, objectFit: "cover", filter: "grayscale(60%)" }}
                />
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{dish.name}</h3>
                    <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, color: "var(--text-muted)" }}>${dish.price}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setModal(dish)} style={{ flex: 1, background: "var(--tag-bg)", border: "1px solid var(--tag-border)", color: "var(--orange)", padding: "5px 0", borderRadius: 50, fontSize: 12, cursor: "pointer", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      Editar
                    </button>
                    <button onClick={() => handleRestore(dish)} style={{ flex: 1, background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)", padding: "5px 0", borderRadius: 50, fontSize: 12, cursor: "pointer", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      Reactivar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <DishModal
          restaurantId={restaurantId}
          dish={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

// ─── STATS TAB ────────────────────────────────────────────────────────────────
function StatsTab({ orders }) {
  const dishCount = {};
  orders.filter((o) => o.status === "entregado").forEach((o) => {
    o.items?.forEach((item) => {
      dishCount[item.name] = (dishCount[item.name] ?? 0) + item.qty;
    });
  });
  const topDishes = Object.entries(dishCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const revenue   = orders.filter((o) => o.status === "entregado").reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 18, color: "var(--text)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          🍽️ Platillos más pedidos
        </h3>
        {topDishes.length === 0
          ? <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Aún sin datos</p>
          : topDishes.map(([name, count], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < topDishes.length - 1 ? "1px solid var(--divider)" : "none" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{count} pedidos</div>
              </div>
              <span className="tag" style={{ fontSize: 11 }}>#{i + 1}</span>
            </div>
          ))}
      </div>

      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 18, color: "var(--text)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          📊 Resumen
        </h3>
        {[
          ["Total pedidos",    orders.length],
          ["Entregados",       orders.filter((o) => o.status === "entregado").length],
          ["En proceso",       orders.filter((o) => ["nuevo","preparando","listo"].includes(o.status)).length],
          ["Cancelados",       orders.filter((o) => o.status === "cancelado").length],
          ["Ingresos totales", `$${revenue}`],
        ].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--divider)" }}>
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("pedidos");
  const [restaurant, setRestaurant] = useState(null);
  const [loadingRest, setLoadingRest] = useState(true);

  // ✅ SEGURIDAD: el restaurantId viene SIEMPRE del perfil autenticado.
  // Nunca se expone ni se puede cambiar desde la UI.
  const restaurantId = profile?.restaurantId ?? null;

  const { orders, todayTotal, counts } = useOrders(restaurantId);

  // Suscripción en tiempo real al documento del propio restaurante
  useEffect(() => {
    if (!restaurantId) {
      setLoadingRest(false);
      return;
    }
    const unsub = subscribeToRestaurant(restaurantId, (data) => {
      setRestaurant(data);
      setLoadingRest(false);
    });
    return () => unsub();
  }, [restaurantId]);

  const handleToggleOpen = async () => {
    if (!restaurant) return;
    await setRestaurantOpen(restaurantId, !restaurant.isOpen);
  };

  const TABS = [
    { id: "pedidos",      label: "📋 Pedidos" },
    { id: "platillos",    label: "🍽️ Platillos" },
    { id: "estadisticas", label: "📊 Estadísticas" },
  ];

  if (!restaurantId) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "88px 20px", textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontFamily: "Fraunces, serif", color: "var(--text)", marginBottom: 12 }}>Sin restaurante asociado</h2>
        <p>Tu cuenta no tiene un restaurante vinculado.</p>
      </div>
    );
  }

  if (loadingRest) {
    return <div style={{ maxWidth: 1100, margin: "0 auto", paddingTop: 88 }}><Spinner /></div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 20px 60px", animation: "fadeUp 0.5s ease" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="tag">🏪 Mi panel</span>
          <h1 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 900, letterSpacing: -1, marginTop: 10, color: "var(--text)" }}>
            {restaurant?.name ?? profile?.name}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 13 }}>
            {restaurant?.description || restaurant?.category || "Panel de gestión"}
          </p>
        </div>

        {/* Toggle abierto / cerrado */}
        <button
          onClick={handleToggleOpen}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: restaurant?.isOpen ? "var(--green-bg)" : "var(--red-bg)",
            border: `1.5px solid ${restaurant?.isOpen ? "var(--green-border)" : "var(--red-border)"}`,
            color: restaurant?.isOpen ? "var(--green)" : "var(--red)",
            padding: "12px 22px", borderRadius: 50, cursor: "pointer",
            fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14,
            transition: "all 0.25s",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
          {restaurant?.isOpen ? "Abierto · clic para cerrar" : "Cerrado · clic para abrir"}
        </button>
      </div>

      {/* Banner cuando está cerrado */}
      {restaurant && !restaurant.isOpen && (
        <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🔴</span>
          <div>
            <div style={{ fontWeight: 700, color: "var(--red)", fontSize: 15 }}>Tu restaurante está cerrado</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
              Los clientes no podrán agregar platillos al carrito ni hacer pedidos.
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard icon="📋" value={orders.length}         label="Pedidos totales" sub={`${counts.nuevo ?? 0} nuevos`} delay={0}    />
        <StatCard icon="💰" value={`$${todayTotal}`}       label="Ingresos totales" sub="Pedidos entregados"           delay={0.07} />
        <StatCard icon="🔄" value={counts.preparando ?? 0} label="En preparación"  sub="Ahora mismo"                  delay={0.14} />
        <StatCard icon="✅" value={counts.entregado ?? 0}  label="Entregados"      sub="Completados"                  delay={0.21} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: "10px 22px", borderRadius: 50, border: "none",
            fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer",
            transition: "all 0.2s",
            background: activeTab === id ? "var(--orange)" : "var(--bg3)",
            color:      activeTab === id ? "#fff"          : "var(--text-muted)",
          }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "pedidos"      && <OrdersTab  restaurantId={restaurantId} />}
      {activeTab === "platillos"    && <DishesTab  restaurantId={restaurantId} />}
      {activeTab === "estadisticas" && <StatsTab   orders={orders} />}
    </div>
  );
}