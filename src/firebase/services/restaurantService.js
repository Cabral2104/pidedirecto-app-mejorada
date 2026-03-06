// ─── src/firebase/services/restaurantService.js ──────────────────────────────
//
// Colección Firestore: `restaurants`
// Esquema de documento:
//   name, category, description, image, phone (whatsapp), rating,
//   deliveryTime, deliveryFee, isOpen, createdAt
//
// Subcolección: `restaurants/{id}/menu`
//   name, description, price, category, image, popular, veg, spicy, available

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config";

const COLLECTION = "restaurants";

// ─── READ ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all restaurants (one-time read).
 * @returns {Promise<Array>} Array of restaurant objects with their Firestore id.
 */
export async function getRestaurants() {
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("name"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch a single restaurant by its Firestore document id.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getRestaurantById(id) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Real-time listener for all restaurants.
 * @param {Function} callback  - Called with the updated restaurants array.
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToRestaurants(callback) {
  const q = query(collection(db, COLLECTION), orderBy("name"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Real-time listener for a single restaurant.
 * @param {string}   id
 * @param {Function} callback
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToRestaurant(id, callback) {
  return onSnapshot(doc(db, COLLECTION, id), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

// ─── WRITE ────────────────────────────────────────────────────────────────────

/**
 * Create a new restaurant document.
 * @param {Object} data
 * @returns {Promise<string>} New document id.
 */
export async function createRestaurant(data) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    rating: data.rating ?? 0,
    isOpen: data.isOpen ?? true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Update fields of an existing restaurant.
 * @param {string} id
 * @param {Object} data  - Partial update (only provided fields are changed).
 */
export async function updateRestaurant(id, data) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Toggle the isOpen flag of a restaurant.
 * @param {string}  id
 * @param {boolean} isOpen
 */
export async function setRestaurantOpen(id, isOpen) {
  await updateDoc(doc(db, COLLECTION, id), { isOpen });
}

/**
 * Delete a restaurant document.
 * NOTE: This does NOT delete its subcollections (menu items).
 * Use a Cloud Function for cascading deletes in production.
 * @param {string} id
 */
export async function deleteRestaurant(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

// ─── MENU SUBCOLLECTION ───────────────────────────────────────────────────────

const menuCol = (restaurantId) =>
  collection(db, COLLECTION, restaurantId, "menu");

/**
 * Fetch all menu items for a restaurant (one-time read).
 * @param {string} restaurantId
 * @returns {Promise<Array>}
 */
export async function getMenuItems(restaurantId) {
  const snap = await getDocs(
    query(menuCol(restaurantId), orderBy("category"), orderBy("name"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Real-time listener for a restaurant's menu.
 * @param {string}   restaurantId
 * @param {Function} callback
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToMenu(restaurantId, callback) {
  const q = query(menuCol(restaurantId), orderBy("category"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Add a new item to a restaurant's menu.
 * @param {string} restaurantId
 * @param {Object} item  - { name, description, price, category, image, popular, veg, spicy }
 * @returns {Promise<string>} New item id.
 */
export async function addMenuItem(restaurantId, item) {
  const ref = await addDoc(menuCol(restaurantId), {
    ...item,
    available: item.available ?? true,
    popular: item.popular ?? false,
    veg: item.veg ?? false,
    spicy: item.spicy ?? false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Update a menu item.
 * @param {string} restaurantId
 * @param {string} itemId
 * @param {Object} data
 */
export async function updateMenuItem(restaurantId, itemId, data) {
  await updateDoc(doc(db, COLLECTION, restaurantId, "menu", itemId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove a menu item.
 * @param {string} restaurantId
 * @param {string} itemId
 */
export async function deleteMenuItem(restaurantId, itemId) {
  await deleteDoc(doc(db, COLLECTION, restaurantId, "menu", itemId));
}
