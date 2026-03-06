import { useState, useEffect } from "react";
import ReviewsSection from "../components/ReviewsSection";
import { RESTAURANTS } from "../data/restaurants";

// ─── Floating restaurant preview card ────────────────────────────────────────
function FloatingCard({ restaurant, delay, left, top, zIndex }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 240,
        left,
        top,
        zIndex,
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "var(--shadow-hover)",
        animation: `float ${3.2 + delay}s ease-in-out ${delay}s infinite`,
      }}
    >
      <img src={restaurant.image} alt={restaurant.name} style={{ width: "100%", height: 130, objectFit: "cover" }} />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>{restaurant.logo}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{restaurant.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
          <span style={{ color: "var(--amber)" }}>★</span>
          <span style={{ fontWeight: 700, color: "var(--amber)" }}>{restaurant.rating}</span>
          <span>· {restaurant.deliveryTime}</span>
        </div>
      </div>
    </div>
  );
}

// ─── How it works card ─────────────────────────────────────────────────────
function StepCard({ step, icon, title, desc, delay }) {
  return (
    <div
      className="card"
      style={{
        padding: 32,
        textAlign: "center",
        animation: `fadeUp 0.6s ease ${delay}s both`,
      }}
    >
      <div
        style={{
          fontFamily: "Fraunces, serif",
          fontSize: 68,
          fontWeight: 900,
          color: "var(--tag-bg)",
          lineHeight: 1,
          marginBottom: -16,
          WebkitTextStrokeWidth: "2px",
          WebkitTextStrokeColor: "var(--card-border)",
        }}
      >
        {step}
      </div>
      <div style={{ fontSize: 44, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, color: "var(--text)" }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75 }}>{desc}</p>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ setView }) {
  const [emojiIdx, setEmojiIdx] = useState(0);
  const emojis = ["🥩", "🍣", "🌮", "🍕", "🍔", "🍜", "🥗"];

  useEffect(() => {
    const timer = setInterval(() => setEmojiIdx((p) => (p + 1) % emojis.length), 1600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        paddingTop: 68,
      }}
    >
      {/* Ambient blobs */}
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          background: "var(--orange-glow)",
          filter: "blur(90px)",
          top: -80,
          right: -80,
          pointerEvents: "none",
          animation: "blob 9s ease infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
          background: "rgba(255,179,71,0.06)",
          filter: "blur(80px)",
          bottom: -40,
          left: -60,
          pointerEvents: "none",
          animation: "blob 11s ease 5s infinite",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Left */}
        <div style={{ animation: "fadeUp 0.7s ease" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--tag-bg)",
              border: "1px solid var(--tag-border)",
              borderRadius: 50,
              padding: "7px 16px",
              marginBottom: 28,
            }}
          >
            <span className="dot-live" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--tag-color)" }}>
              +200 restaurantes en tu ciudad
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(40px, 5.5vw, 76px)",
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: -2,
              marginBottom: 24,
              color: "var(--text)",
            }}
          >
            Tu comida{" "}
            <span
              style={{
                display: "inline-block",
                animation: "float 2.5s ease infinite",
                fontSize: "0.9em",
              }}
            >
              {emojis[emojiIdx]}
            </span>
            <br />
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, var(--orange), var(--amber))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              favorita
            </span>
            <br />
            por WhatsApp
          </h1>

          <p
            style={{
              fontSize: 17,
              color: "var(--text-secondary)",
              lineHeight: 1.75,
              marginBottom: 36,
              maxWidth: 460,
            }}
          >
            Agrega lo que quieras al carrito y recibe tu pedido directo por WhatsApp. Sin apps extra, sin pasarelas de pago, sin complicaciones.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: 16, padding: "15px 32px" }} onClick={() => setView("restaurants")}>
              🍽️ Ver restaurantes
            </button>
            <button className="btn-ghost" onClick={() => setView("dashboard")}>
              🏪 Soy restaurante
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 36, marginTop: 52 }}>
            {[["200+", "Restaurantes"], ["50k+", "Pedidos / mes"], ["4.8★", "Calificación"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "Fraunces, serif", fontSize: 26, fontWeight: 800, color: "var(--text)" }}>{n}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating cards */}
        <div style={{ position: "relative", height: 500, display: "none", alignItems: "center" }}>
          {RESTAURANTS.slice(0, 3).map((r, i) => (
            <FloatingCard
              key={r.id}
              restaurant={r}
              delay={i * 1.1}
              left={i * 80}
              top={i * 130}
              zIndex={3 - i}
            />
          ))}
        </div>
      </div>

      {/* Marquee */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          overflow: "hidden",
          padding: "14px 0",
          borderTop: "1px solid var(--divider)",
          background: "var(--bg2)",
        }}
      >
        <div className="marquee-track">
          {[...Array(2)].map((_, j) => (
            <div key={j} style={{ display: "flex", gap: 40, paddingRight: 40 }}>
              {["🥩 Parrillas", "🍣 Sushi", "🌮 Tacos", "🍕 Pizzas", "🍔 Burgers", "🍜 Asiática", "🥗 Ensaladas", "🍰 Postres", "🫕 Sopas", "🥤 Bebidas"].map((t) => (
                <span key={t} style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CTA banner ───────────────────────────────────────────────────────────────
function CtaBanner({ setView }) {
  return (
    <section
      style={{
        margin: "0 20px 80px",
        borderRadius: 24,
        background: "var(--tag-bg)",
        border: "1px solid var(--tag-border)",
        padding: "60px 40px",
        textAlign: "center",
        maxWidth: 1160,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>🍴</div>
      <h2
        style={{
          fontSize: "clamp(26px, 4vw, 42px)",
          fontWeight: 900,
          marginBottom: 16,
          letterSpacing: -1,
          color: "var(--text)",
        }}
      >
        ¿Eres dueño de un restaurante?
      </h2>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: 16,
          marginBottom: 32,
          maxWidth: 500,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.7,
        }}
      >
        Únete a SaboresYa, sube tu menú y recibe pedidos por WhatsApp. Sin comisiones por pedido, solo una suscripción mensual accesible.
      </p>
      <button className="btn-primary" style={{ fontSize: 16, padding: "15px 36px" }} onClick={() => setView("dashboard")}>
        🏪 Registrar mi restaurante
      </button>
    </section>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function HomePage({ setView }) {
  return (
    <>
      <HeroSection setView={setView} />

      {/* How it works */}
      <section style={{ padding: "80px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="tag">🚀 Así de fácil</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: -1, marginTop: 16, color: "var(--text)" }}>
            Tu comida en 3 pasos
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          <StepCard step="01" icon="🍽️" title="Elige tu restaurante" desc="Explora cientos de restaurantes y menús con fotos reales de cada platillo." delay={0} />
          <StepCard step="02" icon="🛒" title="Arma tu pedido" desc="Agrega lo que quieras al carrito. Sin límites, sin cuentas requeridas." delay={0.12} />
          <StepCard step="03" icon="💬" title="Pide por WhatsApp" desc="Con un toque se envía tu pedido completo al restaurante. Ellos te confirman de inmediato." delay={0.24} />
        </div>
      </section>

      <ReviewsSection />
      <CtaBanner setView={setView} />
    </>
  );
}
