// ─── src/hooks/useRestaurants.js ─────────────────────────────────────────────
// Real-time listener that keeps the restaurants list in sync with Firestore.

import { useState, useEffect } from "react";
import { subscribeToRestaurants } from "../firebase/services/restaurantService";

/**
 * @returns {{ restaurants: Array, loading: boolean, error: Error|null }}
 */
export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToRestaurants(
      (data) => {
        setRestaurants(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { restaurants, loading, error };
}
