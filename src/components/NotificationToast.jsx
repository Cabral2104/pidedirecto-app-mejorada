// src/components/NotificationToast.jsx
import { useNotifications } from "../context/NotificationContext";

const TYPE_ICON = {
  new_order:      "🛍️",
  order_status:   "📦",
  order_cancelled:"❌",
};

export default function NotificationToast() {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      display: "flex", flexDirection: "column", gap: 10,
      zIndex: 500, pointerEvents: "none",
    }}>
      {toasts.map((t) => (
        <div
          key={t.toastId}
          style={{
            pointerEvents: "all",
            display: "flex", alignItems: "flex-start", gap: 12,
            background: "var(--card)", border: "1px solid var(--card-border)",
            borderRadius: 16, padding: "14px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
            minWidth: 300, maxWidth: 360,
            animation: "slideInRight 0.3s ease",
            borderLeft: "4px solid var(--orange)",
          }}
        >
          <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>
            {TYPE_ICON[t.type] ?? "🔔"}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)", marginBottom: 3 }}>
              {t.title}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              {t.body}
            </div>
          </div>
          <button
            onClick={() => removeToast(t.toastId)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16, lineHeight: 1, flexShrink: 0, padding: 2 }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}