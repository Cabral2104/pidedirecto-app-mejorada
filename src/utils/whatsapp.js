// src/utils/whatsapp.js
// Usa solo texto ASCII para el mensaje de WhatsApp.
// Los emojis en encodeURIComponent son inconsistentes entre navegadores/OS,
// por eso usamos etiquetas de texto plano: confiables en todos los entornos.

/**
 * Construye la URL de WhatsApp con el mensaje del pedido.
 * @param {Object} restaurant  - { name, phone|whatsapp }
 * @param {Array}  cart        - [{ name, qty, price }]
 * @param {string} customerName
 * @param {string} address
 * @param {string} [note]
 * @param {Object} [options]   - { orderType, paymentMethod, cashAmount, deliveryFee, total }
 */
export function buildWhatsAppUrl(restaurant, cart, customerName, address, note = "", options = {}) {
  const {
    orderType     = "delivery",
    paymentMethod = "cash",
    cashAmount    = 0,
    deliveryFee   = 0,
    total,
  } = options;

  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const grandTotal = total ?? (orderType === "delivery" ? subtotal + deliveryFee : subtotal);
  const change     = parseFloat(cashAmount) - grandTotal;

  const SEP  = "--------------------";
  const tipo = orderType === "delivery" ? "Domicilio" : "Recoger en local";
  const pago = paymentMethod === "cash"
    ? `Efectivo (paga con $${cashAmount})`
    : "Tarjeta";

  const lines = [
    `*NUEVO PEDIDO - ${restaurant.name}*`,
    SEP,
    `*Cliente:* ${customerName}`,
    `*Tipo:* ${tipo}`,
    ...(orderType === "delivery" ? [`*Direccion:* ${address}`] : []),
    `*Pago:* ${pago}`,
    ...(note ? [`*Nota:* ${note}`] : []),
    SEP,
    "*Pedido:*",
    ...cart.map((i) => `  - ${i.name} x${i.qty}  $${i.price * i.qty}`),
    SEP,
    ...(orderType === "delivery" ? [`Envio: $${deliveryFee}`] : []),
    `*TOTAL: $${grandTotal}*`,
    ...(paymentMethod === "cash" && change > 0
      ? [`Cambio: $${change.toFixed(0)}`]
      : []),
    SEP,
    "Pedido enviado desde PideDirecto.com",
  ];

  const phone = (restaurant.phone ?? restaurant.whatsapp ?? "").replace(/\D/g, "");
  const text  = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${phone}?text=${text}`;
}

export function getCartTotal(cart) {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

export function getCartCount(cart) {
  return cart.reduce((s, i) => s + i.qty, 0);
}