import { useState, useRef, useEffect } from "react";
import { useAuth }            from "../context/AuthContext";
import { useUserOrders }      from "../hooks/useUserOrders";
import { subscribeToRestaurant, updateRestaurant } from "../firebase/services/restaurantService";
import { updateUserProfile }  from "../firebase/services/authService";
import { uploadRestaurantImage, uploadFile } from "../firebase/services/storageService";
import { formatOrderTime }    from "../firebase/services/orderService";

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  nuevo:      { color: "var(--orange)",     bg: "var(--tag-bg)",    label: "Nuevo"      },
  preparando: { color: "var(--amber)",      bg: "rgba(255,179,71,0.12)", label: "Preparando" },
  listo:      { color: "var(--green)",      bg: "var(--green-bg)",  label: "Listo"      },
  entregado:  { color: "var(--text-muted)", bg: "var(--bg3)",       label: "Entregado"  },
  cancelado:  { color: "var(--red)",        bg: "var(--red-bg)",    label: "Cancelado"  },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.nuevo;
  return (
    <span style={{ background: c.bg, color: c.color, padding: "3px 12px", borderRadius: 50, fontSize: 12, fontWeight: 700, border: `1px solid ${c.color}33` }}>
      {c.label}
    </span>
  );
}

function Spinner({ size = 38 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <div style={{ width: size, height: size, border: "3px solid var(--card-border)", borderTop: "3px solid var(--orange)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

// ─── Image upload area ────────────────────────────────────────────────────────
function ImageUploadArea({ preview, onSelect, label = "Cambiar imagen", height = 140 }) {
  const ref = useRef();
  return (
    <div>
      <div onClick={() => ref.current.click()} style={{
        width: "100%", height, borderRadius: 14,
        border: `2px dashed ${preview ? "var(--orange)" : "var(--divider)"}`,
        background: "var(--bg3)", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        cursor: "pointer", overflow: "hidden", position: "relative", transition: "border-color 0.2s",
      }}>
        {preview ? (
          <>
            <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.40)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>📷 {label}</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 30, marginBottom: 6 }}>📷</div>
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>JPG, PNG, WebP · máx 5 MB</span>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files[0]; if (f && f.size <= 5 * 1024 * 1024) onSelect(f); }} />
    </div>
  );
}

// ─── ORDER HISTORY (customer) ─────────────────────────────────────────────────
function OrderHistory({ userId }) {
  const { orders, loading, loadingMore, hasMore, loadMore } = useUserOrders(userId);

  if (loading) return <Spinner />;

  if (orders.length === 0) return (
    <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text-muted)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
      <p style={{ fontSize: 15 }}>Aún no tienes pedidos.</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {orders.map((order, i) => (
          <div key={order.id} className="card" style={{ padding: 18, animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 15, color: "var(--text)" }}>
                    #{order.id.slice(-6).toUpperCase()}
                  </span>
                  <StatusBadge status={order.status} />
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatOrderTime(order.createdAt)}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--orange)", marginTop: 4 }}>
                  {order.restaurantName}
                </div>
              </div>
              <span style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 700, color: "var(--orange)" }}>
                ${order.total}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
              {order.items?.map((it) => `${it.name} x${it.qty}`).join(", ")}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "var(--text-secondary)" }}>
              <span style={{ background: "var(--bg3)", padding: "3px 10px", borderRadius: 50 }}>
                {order.orderType === "pickup" ? "🏪 Recoger" : "🚚 Domicilio"}
              </span>
              <span style={{ background: "var(--bg3)", padding: "3px 10px", borderRadius: 50 }}>
                {order.paymentMethod === "cash" ? "💵 Efectivo" : "💳 Tarjeta"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn-ghost" onClick={loadMore} disabled={loadingMore} style={{ padding: "12px 32px" }}>
            {loadingMore ? "Cargando..." : "Ver más pedidos"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CUSTOMER PROFILE ─────────────────────────────────────────────────────────
function CustomerProfile({ user, profile, refreshProfile }) {
  const [tab, setTab]       = useState("info");
  const [name, setName]     = useState(profile?.name ?? "");
  const [phone, setPhone]   = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");

  const handleSave = async () => {
    if (!name.trim()) { setError("El nombre es obligatorio."); return; }
    setSaving(true); setError("");
    try {
      await updateUserProfile(user.uid, { name: name.trim(), phone: phone.trim() });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, var(--orange), var(--amber))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
          {(profile?.name ?? user.email)?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{profile?.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{user.email}</div>
          <span style={{ fontSize: 11, fontWeight: 800, background: "var(--green-bg)", color: "var(--green)", border: "1px solid var(--green-border)", padding: "2px 12px", borderRadius: 50, marginTop: 6, display: "inline-block" }}>
            Cliente
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["info","👤 Mi información"],["orders","📋 Mis pedidos"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "9px 20px", borderRadius: 50, border: "none",
            fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
            background: tab === id ? "var(--orange)" : "var(--bg3)",
            color:      tab === id ? "#fff"          : "var(--text-muted)",
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {tab === "info" && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 800, marginBottom: 20, color: "var(--text)" }}>
            Información personal
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Nombre *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Correo</span>
              <input value={user.email} disabled style={{ opacity: 0.5 }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Teléfono</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10 dígitos" />
            </label>

            {error && (
              <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>{error}</div>
            )}
            {saved && (
              <div style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--green)", fontWeight: 700 }}>
                ✓ Cambios guardados
              </div>
            )}

            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: "flex-start", padding: "11px 28px" }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div>
          <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 800, marginBottom: 20, color: "var(--text)" }}>
            Historial de pedidos
          </h3>
          <OrderHistory userId={user.uid} />
        </div>
      )}
    </div>
  );
}

// ─── RESTAURANT PROFILE ───────────────────────────────────────────────────────
function RestaurantProfile({ user, profile, refreshProfile }) {
  const restaurantId = profile?.restaurantId;
  const [restaurant, setRestaurant] = useState(null);
  const [loadingRest, setLoadingRest] = useState(true);

  // Suscripción en tiempo real
  useEffect(() => {
    if (!restaurantId) { setLoadingRest(false); return; }
    const unsub = subscribeToRestaurant(restaurantId, (data) => {
      setRestaurant(data);
      setLoadingRest(false);
    });
    return () => unsub();
  }, [restaurantId]);

  const [tab, setTab] = useState("info");

  if (loadingRest) return <Spinner />;
  if (!restaurant)  return (
    <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
      <p>No se encontró el restaurante asociado.</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, background: "var(--bg3)", border: "2px solid var(--divider)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0, overflow: "hidden" }}>
          {restaurant.image
            ? <img src={restaurant.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (restaurant.logo ?? "🍽️")}
        </div>
        <div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{restaurant.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{user.email}</div>
          <span style={{ fontSize: 11, fontWeight: 800, background: "var(--tag-bg)", color: "var(--orange)", border: "1px solid var(--tag-border)", padding: "2px 12px", borderRadius: 50, marginTop: 6, display: "inline-block" }}>
            Restaurante
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["info","🏪 Mi restaurante"],["account","👤 Mi cuenta"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "9px 20px", borderRadius: 50, border: "none",
            fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
            background: tab === id ? "var(--orange)" : "var(--bg3)",
            color:      tab === id ? "#fff"          : "var(--text-muted)",
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {tab === "info"    && <RestaurantInfoForm restaurantId={restaurantId} restaurant={restaurant} />}
      {tab === "account" && <AccountForm user={user} profile={profile} refreshProfile={refreshProfile} />}
    </div>
  );
}

// ─── Restaurant info form ─────────────────────────────────────────────────────
function RestaurantInfoForm({ restaurantId, restaurant }) {
  const [form, setForm] = useState({
    name:         restaurant.name         ?? "",
    phone:        restaurant.phone        ?? "",
    category:     restaurant.category     ?? "",
    cuisine:      restaurant.cuisine      ?? "",
    description:  restaurant.description  ?? "",
    deliveryTime: restaurant.deliveryTime ?? "30-45 min",
    deliveryFee:  restaurant.deliveryFee  ?? 0,
    logo:         restaurant.logo         ?? "",
  });
  const [coverFile, setCoverFile]     = useState(null);
  const [coverPreview, setCoverPreview] = useState(restaurant.image ?? null);
  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [progress, setProgress]       = useState(0);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleCoverSelect = (file) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleLogoSelect = (file) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Nombre y teléfono son obligatorios."); return;
    }
    setSaving(true); setError("");
    try {
      let imageUrl = restaurant.image ?? null;
      let logoUrl  = restaurant.logo  ?? null;

      if (coverFile) {
        imageUrl = await uploadRestaurantImage(restaurantId, coverFile, setProgress);
      }
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        logoUrl = await uploadFile(`restaurants/${restaurantId}/logo.${ext}`, logoFile, () => {});
      }

      await updateRestaurant(restaurantId, {
        name:         form.name.trim(),
        phone:        form.phone.trim(),
        category:     form.category.trim(),
        cuisine:      form.cuisine.trim(),
        description:  form.description.trim(),
        deliveryTime: form.deliveryTime.trim(),
        deliveryFee:  parseFloat(form.deliveryFee) || 0,
        ...(imageUrl ? { image: imageUrl } : {}),
        ...(logoUrl  ? { logo: logoUrl }   : {}),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setProgress(0);
    } catch (err) {
      console.error(err);
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 800, marginBottom: 22, color: "var(--text)" }}>
        Información del restaurante
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Cover image */}
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Foto del restaurante (portada)
          </span>
          <ImageUploadArea preview={coverPreview} onSelect={handleCoverSelect} label="Cambiar portada" height={160} />
        </div>

        {/* Logo image */}
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Logo / ícono
          </span>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <ImageUploadArea
              preview={logoPreview ?? (typeof restaurant.logo === "string" && restaurant.logo.startsWith("http") ? restaurant.logo : null)}
              onSelect={handleLogoSelect}
              label="Cambiar logo"
              height={90}
            />
            <div style={{ flex: 0 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>o usa un emoji:</span>
              <input value={form.logo} onChange={set("logo")} placeholder="🍕" style={{ width: 60, textAlign: "center", fontSize: 22 }} />
            </div>
          </div>
        </div>

        {/* Name + Phone */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Nombre *</span>
            <input value={form.name} onChange={set("name")} placeholder="Nombre del restaurante" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>WhatsApp *</span>
            <input value={form.phone} onChange={set("phone")} placeholder="521234567890" />
          </label>
        </div>

        {/* Category + Cuisine */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Categoría</span>
            <input value={form.category} onChange={set("category")} placeholder="Ej. Pizza, Tacos, Sushi…" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Tipo de cocina</span>
            <input value={form.cuisine} onChange={set("cuisine")} placeholder="Ej. Italiana, Mexicana…" />
          </label>
        </div>

        {/* Description */}
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Descripción</span>
          <textarea value={form.description} onChange={set("description")} rows={2} placeholder="Cuéntale a tus clientes sobre tu restaurante…" />
        </label>

        {/* Delivery time + fee */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Tiempo de entrega</span>
            <input value={form.deliveryTime} onChange={set("deliveryTime")} placeholder="Ej. 25-35 min" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Costo de envío ($)</span>
            <input type="number" min="0" value={form.deliveryFee} onChange={set("deliveryFee")} placeholder="30" />
          </label>
        </div>

        {progress > 0 && progress < 100 && (
          <div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>Subiendo imagen… {progress}%</span>
          </div>
        )}

        {error && (
          <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>{error}</div>
        )}
        {saved && (
          <div style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--green)", fontWeight: 700 }}>
            ✓ Cambios guardados
          </div>
        )}

        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: "flex-start", padding: "11px 28px" }}>
          {saving ? (progress > 0 ? `Subiendo ${progress}%…` : "Guardando…") : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

// ─── Account form (name for restaurant user) ──────────────────────────────────
function AccountForm({ user, profile, refreshProfile }) {
  const [name, setName]     = useState(profile?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");

  const handleSave = async () => {
    if (!name.trim()) { setError("El nombre es obligatorio."); return; }
    setSaving(true); setError("");
    try {
      await updateUserProfile(user.uid, { name: name.trim() });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 800, marginBottom: 20, color: "var(--text)" }}>
        Cuenta
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Nombre *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Correo</span>
          <input value={user.email} disabled style={{ opacity: 0.5 }} />
        </label>

        {error && <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>{error}</div>}
        {saved && <div style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--green)", fontWeight: 700 }}>✓ Cambios guardados</div>}

        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: "flex-start", padding: "11px 28px" }}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, profile, refreshProfile, isRestaurant } = useAuth();

  if (!user || !profile) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "88px 20px", textAlign: "center", color: "var(--text-muted)" }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "88px 20px 60px", animation: "fadeUp 0.5s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <span className="tag">👤 Perfil</span>
        <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, letterSpacing: -1, marginTop: 10, color: "var(--text)" }}>
          Mi cuenta
        </h1>
      </div>

      {isRestaurant
        ? <RestaurantProfile user={user} profile={profile} refreshProfile={refreshProfile} />
        : <CustomerProfile   user={user} profile={profile} refreshProfile={refreshProfile} />
      }
    </div>
  );
}