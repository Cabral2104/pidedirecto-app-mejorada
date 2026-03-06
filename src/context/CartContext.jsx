// src/context/CartContext.jsx
import { createContext, useContext, useState } from "react";
import { createOrder } from "../firebase/services/orderService";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart]       = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addItem = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (itemId) => {
    setCart((prev) =>
      prev.map((c) => c.id === itemId ? { ...c, qty: c.qty - 1 } : c).filter((c) => c.qty > 0)
    );
  };

  const incrementItem = (itemId) => {
    setCart((prev) => prev.map((c) => c.id === itemId ? { ...c, qty: c.qty + 1 } : c));
  };

  const clearCart = () => setCart([]);

  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const total     = cart.reduce((s, i) => s + i.price * i.qty, 0);

  /**
   * Saves order to Firestore matching the real schema (orderType, paymentMethod, etc.)
   */
  const saveOrderToFirestore = async ({
    restaurant,
    customerName,
    address,
    note = "",
    orderType      = "delivery",
    paymentMethod  = "cash",
    paymentAmount  = 0,
    deliveryFee    = 0,
    total: orderTotal,
    userId    = null,
    userEmail = null,
  }) => {
    try {
      const orderId = await createOrder({
        restaurantId:   restaurant.id,
        restaurantName: restaurant.name,
        customerName,
        address,
        note,
        items: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
        total: orderTotal ?? total,
        orderType,
        paymentMethod,
        paymentAmount,
        deliveryFee,
        userId,
        userEmail,
        status: "nuevo",
      });
      return orderId;
    } catch (err) {
      console.error("[CartContext] Failed to save order:", err);
      return null;
    }
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, incrementItem, clearCart, itemCount, total, cartOpen, setCartOpen, saveOrderToFirestore }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
