// ─── src/hooks/useMenu.js ────────────────────────────────────────────────────
// Real-time listener for a restaurant's menu subcollection.

import { useState, useEffect } from "react";
import { subscribeToMenu } from "../firebase/services/restaurantService";

/**
 * @param {string|null} restaurantId  - Firestore document id of the restaurant.
 * @returns {{ items: Array, categories: string[], loading: boolean, error: Error|null }}
 */
export function useMenu(restaurantId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!restaurantId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToMenu(restaurantId, (data) => {
      setItems(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  // Derive unique categories in the order they first appear
  const categories = [...new Set(items.map((i) => i.category))];

  return { items, categories, loading, error };
}
