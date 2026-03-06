// ─── src/hooks/useOrders.js ──────────────────────────────────────────────────
// Real-time listener for a restaurant's orders (used in the dashboard).

import { useState, useEffect } from "react";
import { subscribeToRestaurantOrders } from "../firebase/services/orderService";

/**
 * @param {string|null} restaurantId
 * @returns {{ orders: Array, loading: boolean, error: Error|null }}
 */
export function useOrders(restaurantId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!restaurantId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToRestaurantOrders(restaurantId, (data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  // Derived counts by status
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const todayTotal = orders
    .filter((o) => o.status === "entregado")
    .reduce((s, o) => s + (o.total ?? 0), 0);

  return { orders, loading, error, counts, todayTotal };
}
