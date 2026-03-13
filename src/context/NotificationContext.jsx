// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToNotifications,
  subscribeToUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../firebase/services/notificationService";

const NotificationContext = createContext({});
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [toasts,        setToasts]        = useState([]);   // cola de toasts
  const prevIdsRef = useRef(new Set());                     // IDs ya vistos

  // Suscripción en tiempo real a notificaciones
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      prevIdsRef.current = new Set();
      return;
    }

    const unsubNotifs = subscribeToNotifications(user.uid, (items) => {
      setNotifications(items);

      // Detectar notificaciones NUEVAS (no leídas que no habíamos visto)
      const newItems = items.filter(
        (n) => !n.read && !prevIdsRef.current.has(n.id)
      );
      newItems.forEach((n) => {
        prevIdsRef.current.add(n.id);
        // Solo mostrar toast si la notif es reciente (< 10 seg)
        const createdAt = n.createdAt?.toDate?.();
        const isRecent  = createdAt && (Date.now() - createdAt.getTime()) < 10_000;
        if (isRecent) addToast(n);
      });

      // Marcar todos los IDs actuales como vistos
      items.forEach((n) => prevIdsRef.current.add(n.id));
    });

    const unsubCount = subscribeToUnreadCount(user.uid, setUnreadCount);

    return () => { unsubNotifs(); unsubCount(); };
  }, [user?.uid]);

  // ─── Toasts ──────────────────────────────────────────────────────────────────
  const addToast = useCallback((notif) => {
    const id = notif.id ?? Date.now().toString();
    setToasts((prev) => [...prev.slice(-3), { ...notif, toastId: id }]); // máx 4
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  // ─── Acciones ─────────────────────────────────────────────────────────────────
  const readOne  = (notifId) => markAsRead(user.uid, notifId);
  const readAll  = ()        => markAllAsRead(user.uid);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount,
      toasts, removeToast,
      readOne, readAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}