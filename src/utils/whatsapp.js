/**
 * Generates a formatted WhatsApp message for an order
 * and returns the full wa.me URL ready to open.
 *
 * @param {Object} restaurant  - Restaurant object with `name` and `whatsapp` fields
 * @param {Array}  cart        - Array of cart items { name, qty, price }
 * @param {string} customerName
 * @param {string} address
 * @param {string} [note]      - Optional special instructions
 * @returns {string} Full WhatsApp URL
 */
export function buildWhatsAppUrl(restaurant, cart, customerName, address, note = "") {
  const lines = [
    `🍽️ *NUEVO PEDIDO — ${restaurant.name}*`,
    "",
    `👤 *Cliente:* ${customerName}`,
    `📍 *Dirección:* ${address}`,
    ...(note ? [`📝 *Nota:* ${note}`] : []),
    "",
    "*Pedido:*",
    ...cart.map((item) => `• ${item.name} x${item.qty} — $${item.price * item.qty}`),
    "",
    `💰 *Total: $${cart.reduce((sum, item) => sum + item.price * item.qty, 0)}*`,
    "",
    "Gracias por tu pedido! 🙌",
  ];

  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${restaurant.whatsapp}?text=${message}`;
}

/**
 * Returns the total price of all items in the cart.
 * @param {Array} cart
 * @returns {number}
 */
export function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * Returns the total item count in the cart.
 * @param {Array} cart
 * @returns {number}
 */
export function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}
