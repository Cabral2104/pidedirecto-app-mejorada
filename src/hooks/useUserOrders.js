// Historial de pedidos paginado para el cliente (cursor-based).
import { useState, useEffect, useCallback } from "react";
import { getUserOrdersPaged } from "../firebase/services/orderService";

const PAGE = 6;

export function useUserOrders(userId) {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc]         = useState(null);
  const [hasMore, setHasMore]         = useState(false);

  useEffect(() => {
    if (!userId) { setOrders([]); setLoading(false); return; }
    console.log("Buscando pedidos para userId:", userId);
    setLoading(true);
    getUserOrdersPaged(userId, PAGE, null).then(({ items, lastDoc: ld, hasMore: more }) => {
        console.log("Pedidos encontrados:", items.length, items);
        setOrders(items);
        setLastDoc(ld);
        setHasMore(more);
        setLoading(false);
    }).catch((error) => {
        console.error("Error al buscar pedidos:", error);
        setLoading(false);
    });
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!userId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const { items, lastDoc: ld, hasMore: more } = await getUserOrdersPaged(userId, PAGE, lastDoc);
    setOrders((prev) => {
      const ids = new Set(prev.map((o) => o.id));
      return [...prev, ...items.filter((o) => !ids.has(o.id))];
    });
    setLastDoc(ld);
    setHasMore(more);
    setLoadingMore(false);
  }, [userId, lastDoc, hasMore, loadingMore]);

  return { orders, loading, loadingMore, hasMore, loadMore };
}
    