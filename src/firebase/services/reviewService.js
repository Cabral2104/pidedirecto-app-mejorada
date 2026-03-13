// src/firebase/services/reviewService.js
import {
  collection, doc, addDoc, getDocs, runTransaction,
  query, where, orderBy, limit, startAfter, serverTimestamp,
} from "firebase/firestore";
import { db } from "../config";

// ─── Verifica si el usuario ya calificó un pedido específico ──────────────────
export async function hasReviewed(restaurantId, orderId) {
  const snap = await getDocs(
    query(
      collection(db, "restaurants", restaurantId, "reviews"),
      where("orderId", "==", orderId)
    )
  );
  return !snap.empty;
}

// ─── Guarda la reseña y recalcula el rating con una transacción ───────────────
export async function submitReview(restaurantId, { orderId, userId, userName, rating, comment }) {
  const restaurantRef = doc(db, "restaurants", restaurantId);
  const reviewsCol    = collection(db, "restaurants", restaurantId, "reviews");

  await runTransaction(db, async (tx) => {
    const restSnap = await tx.get(restaurantRef);
    if (!restSnap.exists()) throw new Error("Restaurante no encontrado");

    const data       = restSnap.data();
    const prevCount  = data.reviews ?? 0;
    const prevRating = data.rating  ?? 0;
    const newCount   = prevCount + 1;
    const newRating  = parseFloat(((prevRating * prevCount + rating) / newCount).toFixed(1));

    const reviewRef = doc(reviewsCol);
    tx.set(reviewRef, {
      orderId,
      userId,
      userName: userName || "Cliente",
      rating,
      comment: (comment ?? "").trim(),
      createdAt: serverTimestamp(),
    });

    tx.update(restaurantRef, { rating: newRating, reviews: newCount });
  });
}

// ─── Trae reseñas paginadas de un restaurante ─────────────────────────────────
const PAGE = 8;

export async function getRestaurantReviewsPaged(restaurantId, lastDoc = null) {
  const constraints = [
    orderBy("createdAt", "desc"),
    limit(PAGE + 1),
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const snap = await getDocs(
    query(collection(db, "restaurants", restaurantId, "reviews"), ...constraints)
  );

  const hasMore = snap.docs.length > PAGE;
  const docs    = hasMore ? snap.docs.slice(0, PAGE) : snap.docs;
  const items   = docs.map((d) => ({ id: d.id, ...d.data() }));
  const newLast = docs.length > 0 ? docs[docs.length - 1] : null;

  return { items, lastDoc: newLast, hasMore };
}