// src/firebase/services/notificationService.js
import {
  collection, doc, addDoc, updateDoc, getDocs, onSnapshot,
  query, orderBy, limit, startAfter, where,
  serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db } from "../config";

const col = (userId) => collection(db, "notifications", userId, "items");

// ─── Crear notificación para un usuario ───────────────────────────────────────
export async function createNotification(userId, { type, title, body, orderId = null }) {
  if (!userId) return;
  await addDoc(col(userId), {
    type, title, body, orderId,
    read: false,
    createdAt: serverTimestamp(),
  });
}

// ─── Suscripción en tiempo real (primeras 20, no leídas primero) ──────────────
export function subscribeToNotifications(userId, callback) {
  if (!userId) return () => {};
  const q = query(col(userId), orderBy("createdAt", "desc"), limit(20));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

// ─── Contar no leídas ─────────────────────────────────────────────────────────
export function subscribeToUnreadCount(userId, callback) {
  if (!userId) return () => {};
  const q = query(col(userId), where("read", "==", false));
  return onSnapshot(q, (snap) => callback(snap.size));
}

// ─── Marcar una como leída ────────────────────────────────────────────────────
export async function markAsRead(userId, notifId) {
  await updateDoc(doc(db, "notifications", userId, "items", notifId), { read: true });
}

// ─── Marcar todas como leídas ────────────────────────────────────────────────
export async function markAllAsRead(userId) {
  const snap = await getDocs(query(col(userId), where("read", "==", false)));
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

// ─── Helpers de mensajes por tipo de status ───────────────────────────────────
export const STATUS_NOTIF = {
  preparando: {
    title: "Tu pedido está en preparación",
    body:  "El restaurante ya está cocinando tu pedido.",
  },
  listo: {
    title: "¡Tu pedido está listo!",
    body:  "Tu pedido está listo para ser entregado o recogido.",
  },
  entregado: {
    title: "Pedido entregado",
    body:  "¡Que lo disfrutes! Recuerda dejar tu calificación.",
  },
  cancelado: {
    title: "Pedido cancelado",
    body:  "Tu pedido fue cancelado. Contáctanos si tienes dudas.",
  },
};