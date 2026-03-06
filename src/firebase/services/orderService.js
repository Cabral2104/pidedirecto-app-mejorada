// src/firebase/services/orderService.js
import {
  collection, doc, addDoc, updateDoc,
  onSnapshot, query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../config";

const COLLECTION = "orders";
export const ORDER_STATUSES = ["nuevo", "preparando", "listo", "entregado", "cancelado"];

export function subscribeToRestaurantOrders(restaurantId, callback) {
  const q = query(
    collection(db, COLLECTION),
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Create an order — matches the real Firestore schema from the screenshot.
 */
export async function createOrder({
  restaurantId,
  restaurantName,
  customerName,
  address,
  note = "",
  items,
  total,
  orderType     = "delivery",
  paymentMethod = "cash",
  paymentAmount = 0,
  deliveryFee   = 0,
  userId        = null,
  userEmail     = null,
  status        = "nuevo",
}) {
  const ref = await addDoc(collection(db, COLLECTION), {
    restaurantId,
    restaurantName,
    customerName,
    address,
    note,
    items: items.map(({ id, name, price, qty, image }) => ({ id, name, price, qty, ...(image ? { image } : {}) })),
    total,
    orderType,
    paymentMethod,
    paymentAmount,
    deliveryFee,
    userId,
    userEmail,
    status,
    whatsappSent: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function advanceOrderStatus(orderId, currentStatus) {
  const idx = ORDER_STATUSES.indexOf(currentStatus);
  if (idx === -1 || currentStatus === "entregado" || currentStatus === "cancelado") return;
  await updateDoc(doc(db, COLLECTION, orderId), {
    status: ORDER_STATUSES[idx + 1],
    updatedAt: serverTimestamp(),
  });
}

export async function setOrderStatus(orderId, status) {
  if (!ORDER_STATUSES.includes(status)) throw new Error(`Invalid status: ${status}`);
  await updateDoc(doc(db, COLLECTION, orderId), { status, updatedAt: serverTimestamp() });
}

export async function cancelOrder(orderId) {
  await setOrderStatus(orderId, "cancelado");
}

export function formatOrderTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return `hace ${diff}s`;
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}
