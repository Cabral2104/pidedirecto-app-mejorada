import Stars from "./Stars";
import { REVIEWS } from "../data/reviews";

export default function ReviewsSection() {
  return (
    <section style={{ padding: "80px 20px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <span className="tag">⭐ Reseñas reales</span>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 900,
            marginTop: 16,
            letterSpacing: -1,
            color: "var(--text)",
          }}
        >
          Lo que dicen nuestros clientes
        </h2>
      </div>

      {/* Horizontal scroll */}
      <div
        style={{
          display: "flex",
          gap: 20,
          overflowX: "auto",
          paddingBottom: 12,
          scrollbarWidth: "thin",
        }}
      >
        {REVIEWS.map((review, i) => (
          <div
            key={review.id}
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 18,
              padding: "22px 24px",
              minWidth: 290,
              flexShrink: 0,
              boxShadow: "var(--shadow-card)",
              animation: `fadeUp 0.55s ease ${i * 0.08}s both`,
            }}
          >
            {/* Author */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "var(--bg3)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                  border: "2px solid var(--divider)",
                }}
              >
                {review.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                  {review.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {review.restaurant}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <Stars rating={review.rating} size={13} />
            </div>

            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>
              "{review.text}"
            </p>

            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14 }}>
              {review.time}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
