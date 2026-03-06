// src/components/cart/CartSidebar.jsx
// Carrito con checkout: tipo de pedido, tipo de pago y monto en efectivo.

import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { buildWhatsAppUrl } from "../../utils/whatsapp";

const STEPS = { CART: "cart", CHECKOUT: "checkout", SUCCESS: "success" };

// ─── WhatsApp icon ────────────────────────────────────────────────────────────
function WAIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.112 1.523 5.84L.057 23.37a.75.75 0 00.918.919l5.565-1.462A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.65-.496-5.174-1.361l-.37-.214-3.834 1.007 1.022-3.724-.232-.376A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}

// ─── Option card (delivery / pickup, card / cash) ─────────────────────────────
function OptionCard({ icon, title, subtitle, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 14px",
        borderRadius: 14,
        border: `2px solid ${selected ? "var(--orange)" : "var(--divider)"}`,
        background: selected ? "var(--tag-bg)" : "var(--bg3)",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 13, color: selected ? "var(--orange)" : "var(--text)" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

// ─── Cart item row ────────────────────────────────────────────────────────────
function CartItemRow({ item }) {
  const { removeItem, incrementItem } = useCart();
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--divider)" }}>
      <img src={item.image} alt={item.name} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
        <div style={{ fontWeight: 700, color: "var(--orange)", fontSize: 14, marginTop: 2 }}>${item.price * item.qty}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button className="qty-btn qty-btn-minus" onClick={() => removeItem(item.id)}>−</button>
        <span style={{ fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: "center", color: "var(--text)" }}>{item.qty}</span>
        <button className="qty-btn qty-btn-plus" onClick={() => incrementItem(item.id)}>+</button>
      </div>
    </div>
  );
}

// ─── Order summary ────────────────────────────────────────────────────────────
function OrderSummary({ cart, subtotal, deliveryFee, orderType }) {
  const total = orderType === "delivery" ? subtotal + deliveryFee : subtotal;
  return (
    <div style={{ background: "var(--bg3)", borderRadius: 14, padding: 14, marginBottom: 18, border: "1px solid var(--divider)" }}>
      {cart.map((item) => (
        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", color: "var(--text-secondary)" }}>
          <span>{item.name} x{item.qty}</span>
          <span style={{ fontWeight: 700, color: "var(--text)" }}>${item.price * item.qty}</span>
        </div>
      ))}
      <div style={{ borderTop: "1px solid var(--divider)", marginTop: 10, paddingTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
          <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
          <span style={{ fontWeight: 700, color: "var(--text)" }}>${subtotal}</span>
        </div>
        {orderType === "delivery" && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: "var(--text-secondary)" }}>Envío</span>
            <span style={{ fontWeight: 700, color: "var(--amber)" }}>${deliveryFee}</span>
          </div>
        )}
        {orderType === "pickup" && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: "var(--text-secondary)" }}>Envío</span>
            <span style={{ fontWeight: 700, color: "var(--green)" }}>Gratis 🎉</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--divider)" }}>
          <span style={{ fontWeight: 700, color: "var(--text)" }}>Total</span>
          <span style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 700, color: "var(--orange)" }}>${total}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main CartSidebar ─────────────────────────────────────────────────────────
export default function CartSidebar({ restaurantData }) {
  const { cart, clearCart, total: subtotal, setCartOpen, saveOrderToFirestore } = useCart();
  const { user, profile } = useAuth();

  const [step, setStep]               = useState(STEPS.CART);
  const [name, setName]               = useState(profile?.name ?? user?.displayName ?? "");
  const [address, setAddress]         = useState("");
  const [note, setNote]               = useState("");
  const [orderType, setOrderType]     = useState("delivery"); // "delivery" | "pickup"
  const [paymentMethod, setPayment]   = useState("cash");     // "cash" | "card"
  const [cashAmount, setCashAmount]   = useState("");
  const [sending, setSending]         = useState(false);

  // Restaurant data: from prop or inferred from first cart item
  const restaurant = restaurantData ?? (cart.length > 0
    ? { id: cart[0].restaurantId, name: cart[0].restaurantName, whatsapp: cart[0].restaurantWhatsapp, deliveryFee: cart[0].restaurantDeliveryFee ?? 0 }
    : null);

  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const grandTotal  = orderType === "delivery" ? subtotal + deliveryFee : subtotal;
  
  const restaurantIsOpen = restaurant?.isOpen !== false;

  const canSubmit = (
    restaurantIsOpen &&
    name.trim() &&
    (orderType === "pickup" || address.trim()) &&
    (paymentMethod === "card" || (paymentMethod === "cash" && parseFloat(cashAmount) >= grandTotal))
  );

  const handleSendOrder = async () => {
    if (!canSubmit || !restaurant || sending) return;
    setSending(true);

    // Build WhatsApp message
    const orderLines = [
      `🍽️ *NUEVO PEDIDO — ${restaurant.name}*`,
      "",
      `👤 *Cliente:* ${name.trim()}`,
      `📦 *Tipo:* ${orderType === "delivery" ? "🚚 Domicilio" : "🏪 Recoger en local"}`,
      ...(orderType === "delivery" ? [`📍 *Dirección:* ${address.trim()}`] : []),
      `💳 *Pago:* ${paymentMethod === "cash" ? `Efectivo (paga con $${cashAmount})` : "Tarjeta"}`,
      ...(note.trim() ? [`📝 *Nota:* ${note.trim()}`] : []),
      "",
      "*Pedido:*",
      ...cart.map((i) => `• ${i.name} x${i.qty} — $${i.price * i.qty}`),
      "",
      ...(orderType === "delivery" ? [`🚚 Envío: $${deliveryFee}`] : []),
      `💰 *Total: $${grandTotal}*`,
      ...(paymentMethod === "cash" ? [`💵 Cambio de: $${(parseFloat(cashAmount) - grandTotal).toFixed(0)}`] : []),
      "",
      "Gracias por tu pedido! 🙌",
    ];

    const waUrl = `https://wa.me/${restaurant.phone ?? restaurant.whatsapp}?text=${encodeURIComponent(orderLines.join("\n"))}`;
    window.open(waUrl, "_blank");

    // Save to Firestore
    await saveOrderToFirestore({
      restaurant,
      customerName:  name.trim(),
      address:       orderType === "delivery" ? address.trim() : "Recoger en local",
      note:          note.trim(),
      orderType,
      paymentMethod,
      paymentAmount: parseFloat(cashAmount) || grandTotal,
      deliveryFee:   orderType === "delivery" ? deliveryFee : 0,
      total:         grandTotal,
      userId:        user?.uid ?? null,
      userEmail:     user?.email ?? null,
    });

    setSending(false);
    setStep(STEPS.SUCCESS);
  };

  const handleClose = () => {
    setCartOpen(false);
    setTimeout(() => setStep(STEPS.CART), 300);
  };

  const handleNewOrder = () => {
    clearCart();
    setName(profile?.name ?? user?.displayName ?? "");
    setAddress(""); setNote(""); setCashAmount("");
    setOrderType("delivery"); setPayment("cash");
    setStep(STEPS.CART);
    setCartOpen(false);
  };

  return (
    <>
      <div className="overlay" onClick={handleClose} />
      <div className="sidebar">

        {/* Header */}
        <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>🛒 Tu carrito</h2>
            {cart.length > 0 && restaurant && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
                {cart.reduce((s, i) => s + i.qty, 0)} artículos · {restaurant.name}
              </p>
            )}
          </div>
          <button onClick={handleClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg3)", border: "1px solid var(--divider)", color: "var(--text-muted)", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* ── SUCCESS ── */}
        {step === STEPS.SUCCESS && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 60, marginBottom: 18 }}>✅</div>
            <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 900, marginBottom: 12, color: "var(--text)" }}>¡Pedido enviado!</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 30, fontSize: 14 }}>
              Tu pedido fue enviado por WhatsApp y registrado en el sistema. El restaurante te confirmará pronto.
            </p>
            <button className="btn-primary" onClick={handleNewOrder}>Hacer otro pedido</button>
          </div>
        )}

        {/* ── CART ── */}
        {step === STEPS.CART && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>🛒</div>
                  <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: "var(--text)", marginBottom: 8 }}>Carrito vacío</h3>
                  <p style={{ fontSize: 14 }}>Agrega platillos para comenzar</p>
                </div>
              ) : (
                cart.map((item) => <CartItemRow key={item.id} item={item} />)
              )}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: "18px 20px", borderTop: "1px solid var(--divider)", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Subtotal</span>
                  <span style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 700, color: "var(--orange)" }}>${subtotal}</span>
                </div>
                <button className="btn-primary" style={{ width: "100%" }} onClick={() => setStep(STEPS.CHECKOUT)}>
                  Continuar → Confirmar pedido
                </button>
              </div>
            )}
          </>
        )}

        {/* ── CHECKOUT ── */}
        {step === STEPS.CHECKOUT && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 800, marginBottom: 18, color: "var(--text)" }}>Confirma tu pedido</h3>

              {/* Order summary */}
              <OrderSummary cart={cart} subtotal={subtotal} deliveryFee={deliveryFee} orderType={orderType} />

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Nombre */}
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>Tu nombre *</span>
                  <input placeholder="¿Cómo te llamamos?" value={name} onChange={(e) => setName(e.target.value)} />
                </label>

                {/* Tipo de pedido */}
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 10 }}>
                    Tipo de pedido *
                  </span>
                  <div style={{ display: "flex", gap: 10 }}>
                    <OptionCard
                      icon="🚚"
                      title="A domicilio"
                      subtitle={`+$${deliveryFee} envío`}
                      selected={orderType === "delivery"}
                      onClick={() => setOrderType("delivery")}
                    />
                    <OptionCard
                      icon="🏪"
                      title="Recoger"
                      subtitle="Sin costo de envío"
                      selected={orderType === "pickup"}
                      onClick={() => setOrderType("pickup")}
                    />
                  </div>
                </div>

                {/* Dirección — solo si es domicilio */}
                {orderType === "delivery" && (
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>Dirección de entrega *</span>
                    <input placeholder="Calle, número, colonia, ciudad..." value={address} onChange={(e) => setAddress(e.target.value)} />
                  </label>
                )}

                {/* Tipo de pago */}
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 10 }}>
                    Método de pago *
                  </span>
                  <div style={{ display: "flex", gap: 10 }}>
                    <OptionCard
                      icon="💵"
                      title="Efectivo"
                      subtitle="El repartidor lleva cambio"
                      selected={paymentMethod === "cash"}
                      onClick={() => setPayment("cash")}
                    />
                    <OptionCard
                      icon="💳"
                      title="Tarjeta"
                      subtitle="Terminal al momento"
                      selected={paymentMethod === "card"}
                      onClick={() => setPayment("card")}
                    />
                  </div>
                </div>

                {/* Monto en efectivo — solo si paga en efectivo */}
                {paymentMethod === "cash" && (
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>
                      ¿Con cuánto pagarás? *
                      <span style={{ fontWeight: 400, marginLeft: 4 }}>(total: ${grandTotal})</span>
                    </span>
                    <input
                      type="number"
                      min={grandTotal}
                      placeholder={`Mínimo $${grandTotal}`}
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                    />
                    {cashAmount && parseFloat(cashAmount) >= grandTotal && (
                      <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>
                        💵 El repartidor llevará ${(parseFloat(cashAmount) - grandTotal).toFixed(0)} de cambio
                      </span>
                    )}
                    {cashAmount && parseFloat(cashAmount) < grandTotal && (
                      <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 700 }}>
                        ⚠️ El monto debe ser mayor o igual al total (${grandTotal})
                      </span>
                    )}
                  </label>
                )}

                {/* Nota especial */}
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>Nota especial (opcional)</span>
                  <textarea placeholder="Alergias, instrucciones especiales..." value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
                </label>

                {/* ✅ Aviso si cerró mientras el carrito estaba abierto */}
                {!restaurantIsOpen && (
                <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "var(--red)", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  🔴 Este restaurante cerró. No puedes hacer el pedido en este momento.
                </div>
                )}

                <div style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: 12, padding: "11px 14px", fontSize: 13, color: "var(--green)", lineHeight: 1.6 }}>
                  📱 Se abrirá <strong>WhatsApp</strong> con tu pedido listo. El restaurante recibirá todos los detalles.
                </div>
              </div>
            </div>

            <div style={{ padding: "18px 20px", borderTop: "1px solid var(--divider)", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
              <button className="btn-whatsapp" onClick={handleSendOrder} disabled={!canSubmit || sending} style={{ width: "100%", opacity: sending ? 0.7 : 1 }}>
                {sending ? "Enviando..." : <><WAIcon /> Enviar pedido por WhatsApp</>}
              </button>
              <button className="btn-ghost" style={{ width: "100%" }} onClick={() => setStep(STEPS.CART)}>
                ← Modificar carrito
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
