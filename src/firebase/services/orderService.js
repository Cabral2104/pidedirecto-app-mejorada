// src/firebase/services/orderService.js
import {
  collection, doc, addDoc, updateDoc, getDocs,
  onSnapshot, query, where, orderBy, limit, startAfter,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config";
import { createNotification, STATUS_NOTIF } from "./notificationService";

const COL = "orders";
export const ORDER_STATUSES = ["nuevo", "preparando", "listo", "entregado", "cancelado"];

// ─── REAL-TIME listener (dashboard, first page only) ──────────────────────────
export function subscribeToRestaurantOrders(restaurantId, callback, pageSize = 15) {
  const q = query(
    collection(db, COL),
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ─── PAGINATED orders for restaurant dashboard ────────────────────────────────
export async function getOrdersPaged(restaurantId, pageSize = 10, lastDoc = null) {
  const constraints = [
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc"),
    limit(pageSize + 1),
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));
  const snap   = await getDocs(query(collection(db, COL), ...constraints));
  const docs   = snap.docs;
  const hasMore = docs.length > pageSize;
  const items   = docs.slice(0, pageSize).map((d) => ({ id: d.id, ...d.data(), _snap: d }));
  return { items, lastDoc: docs[pageSize - 1] ?? null, hasMore };
}

// ─── PAGINATED orders for user (order history) ────────────────────────────────
export async function getUserOrdersPaged(userId, pageSize = 8, lastDoc = null) {
  const constraints = [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(pageSize + 1),
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));
  const snap   = await getDocs(query(collection(db, COL), ...constraints));
  const docs   = snap.docs;
  const hasMore = docs.length > pageSize;
  const items   = docs.slice(0, pageSize).map((d) => ({ id: d.id, ...d.data(), _snap: d }));
  return { items, lastDoc: docs[pageSize - 1] ?? null, hasMore };
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
export async function createOrder({
  restaurantId, restaurantName, customerName, address, note = "",
  items, total, orderType = "delivery", paymentMethod = "cash",
  paymentAmount = 0, deliveryFee = 0, userId = null, userEmail = null, status = "nuevo",
}) {
  const ref = await addDoc(collection(db, COL), {
    restaurantId, restaurantName, customerName, address, note,
    items: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
    total, orderType, paymentMethod, paymentAmount, deliveryFee,
    userId, userEmail, status, whatsappSent: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Notificar al restaurante
  await createNotification(restaurantId, {
    type:    "new_order",
    title:   "Nuevo pedido recibido",
    body:    `${customerName} ordenó por $${total} (${orderType === "pickup" ? "recoger" : "domicilio"})`,
    orderId: ref.id,
  });

  return ref.id;
}

// ─── STATUS UPDATES ───────────────────────────────────────────────────────────
export async function advanceOrderStatus(orderId, currentStatus, order = null) {
  const idx = ORDER_STATUSES.indexOf(currentStatus);
  if (idx === -1 || currentStatus === "entregado" || currentStatus === "cancelado") return;

  const newStatus = ORDER_STATUSES[idx + 1];
  await updateDoc(doc(db, COL, orderId), {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });

  // Notificar al cliente si está registrado
  const userId = order?.userId;
  if (userId && STATUS_NOTIF[newStatus]) {
    await createNotification(userId, {
      type:    "order_status",
      title:   STATUS_NOTIF[newStatus].title,
      body:    `${order.restaurantName} — Pedido #${orderId.slice(-6).toUpperCase()}`,
      orderId,
    });
  }
}

export async function setOrderStatus(orderId, status) {
  if (!ORDER_STATUSES.includes(status)) throw new Error(`Invalid: ${status}`);
  await updateDoc(doc(db, COL, orderId), { status, updatedAt: serverTimestamp() });
}

export async function cancelOrder(orderId, order = null) {
  await setOrderStatus(orderId, "cancelado");

  const userId = order?.userId;
  if (userId) {
    await createNotification(userId, {
      type:    "order_cancelled",
      title:   STATUS_NOTIF.cancelado.title,
      body:    `${order.restaurantName} — Pedido #${orderId.slice(-6).toUpperCase()}`,
      orderId,
    });
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function formatOrderTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return `hace ${diff}s`;
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}