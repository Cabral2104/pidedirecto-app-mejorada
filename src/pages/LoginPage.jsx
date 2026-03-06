// src/pages/LoginPage.jsx
// Pantalla de inicio de sesión y registro (cliente / restaurante).

import { useState } from "react";
import {
  login,
  registerCustomer,
  registerRestaurant,
  resetPassword,
} from "../firebase/services/authService";

const TABS = ["login", "registro-cliente", "registro-restaurante"];
const TAB_LABELS = {
  "login":                "Iniciar sesión",
  "registro-cliente":     "Soy cliente",
  "registro-restaurante": "Tengo un restaurante",
};

// ─── Shared field component ───────────────────────────────────────────────────
function Field({ label, type = "text", placeholder, value, onChange, required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>
        {label}{required && " *"}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}

// ─── Error / info banner ──────────────────────────────────────────────────────
function Banner({ msg, type = "error" }) {
  if (!msg) return null;
  const colors = {
    error:   { bg: "var(--red-bg)",   border: "var(--red-border)",   text: "var(--red)"   },
    success: { bg: "var(--green-bg)", border: "var(--green-border)", text: "var(--green)" },
  };
  const c = colors[type];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: c.text, lineHeight: 1.6 }}>
      {msg}
    </div>
  );
}

// ─── Login form ───────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Completa todos los campos."); return; }
    setLoading(true); setError("");
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) { setError("Ingresa tu correo para restablecer la contraseña."); return; }
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError(friendlyError(err.code));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Correo electrónico" type="email"    placeholder="tu@correo.com" value={email}    onChange={setEmail}    required />
      <Field label="Contraseña"         type="password" placeholder="••••••••"      value={password} onChange={setPassword} required />
      <Banner msg={error} />
      {resetSent && <Banner msg="✅ Correo de restablecimiento enviado. Revisa tu bandeja." type="success" />}
      <button className="btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>
      <button
        onClick={handleReset}
        style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", textAlign: "center", textDecoration: "underline" }}
      >
        ¿Olvidaste tu contraseña?
      </button>
    </div>
  );
}

// ─── Register customer form ───────────────────────────────────────────────────
function RegisterCustomerForm({ onSuccess }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async () => {
    if (!name || !email || !password) { setError("Completa todos los campos."); return; }
    if (password !== confirm)         { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 6)          { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setLoading(true); setError("");
    try {
      await registerCustomer({ name, email, password });
      onSuccess();
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Tu nombre"           placeholder="¿Cómo te llamamos?"  value={name}     onChange={setName}     required />
      <Field label="Correo electrónico"  type="email"    placeholder="tu@correo.com" value={email}    onChange={setEmail}    required />
      <Field label="Contraseña"          type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={setPassword} required />
      <Field label="Confirmar contraseña" type="password" placeholder="Repite la contraseña" value={confirm} onChange={setConfirm} required />
      <Banner msg={error} />
      <button className="btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear cuenta de cliente"}
      </button>
    </div>
  );
}

// ─── Register restaurant form ─────────────────────────────────────────────────
function RegisterRestaurantForm({ onSuccess }) {
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [category, setCategory] = useState("Pizza");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const cats = ["Pizza", "Tacos", "Burgers", "Sushi", "Parrilla", "Thai", "Italiana", "Otro"];

  const handleSubmit = async () => {
    if (!name || !phone || !email || !password) { setError("Completa todos los campos."); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 6)  { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setLoading(true); setError("");
    try {
      await registerRestaurant({ name, email, password, phone, category });
      onSuccess();
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Nombre del restaurante" placeholder="Ej. Pizzería Charly" value={name}  onChange={setName}  required />
      <Field label="Número de WhatsApp"     placeholder="52155…"               value={phone} onChange={setPhone} required />
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Categoría *</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <Field label="Correo electrónico"   type="email"    placeholder="restaurante@correo.com" value={email}    onChange={setEmail}    required />
      <Field label="Contraseña"           type="password" placeholder="Mínimo 6 caracteres"    value={password} onChange={setPassword} required />
      <Field label="Confirmar contraseña" type="password" placeholder="Repite la contraseña"   value={confirm}  onChange={setConfirm} required />
      <Banner msg={error} />
      <button className="btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
        {loading ? "Registrando restaurante..." : "Registrar mi restaurante"}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage({ onSuccess }) {
  const [tab, setTab] = useState("login");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px 40px",
        background: "var(--bg)",
      }}
    >
      {/* Ambient blob */}
      <div style={{ position: "fixed", width: 500, height: 500, background: "var(--orange-glow)", filter: "blur(100px)", top: -100, right: -100, pointerEvents: "none", borderRadius: "50%", zIndex: 0 }} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 480,
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 28,
          padding: "36px 36px 40px",
          boxShadow: "var(--shadow-hover)",
          animation: "fadeUp 0.5s ease",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, var(--orange), var(--orange-light))", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍴</div>
            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 26, color: "var(--text)" }}>
              Sabores<span style={{ color: "var(--orange)" }}>Ya</span>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "var(--bg3)",
            borderRadius: 50,
            padding: 4,
            marginBottom: 28,
            gap: 2,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "8px 6px",
                borderRadius: 50,
                border: "none",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
                transition: "all 0.2s",
                background: tab === t ? "var(--orange)" : "transparent",
                color: tab === t ? "#fff" : "var(--text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Forms */}
        {tab === "login"                && <LoginForm               onSuccess={onSuccess} />}
        {tab === "registro-cliente"     && <RegisterCustomerForm    onSuccess={onSuccess} />}
        {tab === "registro-restaurante" && <RegisterRestaurantForm  onSuccess={onSuccess} />}
      </div>
    </div>
  );
}

// ─── Error messages in Spanish ─────────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":    "Este correo ya está registrado.",
    "auth/invalid-email":           "El correo no es válido.",
    "auth/user-not-found":          "No existe una cuenta con ese correo.",
    "auth/wrong-password":          "Contraseña incorrecta.",
    "auth/weak-password":           "La contraseña es muy débil.",
    "auth/too-many-requests":       "Demasiados intentos. Espera un momento.",
    "auth/network-request-failed":  "Sin conexión. Revisa tu internet.",
    "auth/invalid-credential":      "Correo o contraseña incorrectos.",
  };
  return map[code] ?? `Error inesperado (${code}). Intenta de nuevo.`;
}
