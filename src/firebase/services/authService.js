// src/firebase/services/authService.js
// Login, registro y gestión de sesión con Firebase Auth + Firestore users

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config";

/**
 * Tipos de cuenta.
 * El campo `role` en Firestore decide qué ve cada usuario.
 */
export const ROLES = {
  CUSTOMER:   "customer",
  RESTAURANT: "restaurant",
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * Registro de cliente (customer).
 * Crea la cuenta en Firebase Auth y el documento en `users/{uid}`.
 */
export async function registerCustomer({ name, email, password }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });

  await setDoc(doc(db, "users", user.uid), {
    uid:       user.uid,
    name,
    email,
    role:      ROLES.CUSTOMER,
    createdAt: serverTimestamp(),
  });

  return user;
}

/**
 * Registro de restaurante.
 * Crea la cuenta en Auth + `users/{uid}` (role: restaurant) +
 * el documento en `restaurants/{uid}` con los datos básicos.
 */
export async function registerRestaurant({ name, email, password, phone, category }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });

  // Perfil de usuario
  await setDoc(doc(db, "users", user.uid), {
    uid:          user.uid,
    name,
    email,
    role:         ROLES.RESTAURANT,
    restaurantId: user.uid,   // el restaurante usa el mismo UID
    createdAt:    serverTimestamp(),
  });

  // Documento del restaurante (mismo ID que el UID del usuario)
  await setDoc(doc(db, "restaurants", user.uid), {
    name,
    email,
    phone,
    category:     category ?? "General",
    description:  "",
    image:        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
    cover:        "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
    logo:         "🍽️",
    rating:       0,
    reviews:      0,
    deliveryTime: "30-45 min",
    deliveryFee:  30,
    isOpen:       true,
    tags:         [category ?? "General"],
    createdAt:    serverTimestamp(),
  });

  return user;
}

/**
 * Login estándar (email + contraseña).
 */
export async function login(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function logout() {
  await signOut(auth);
}

/**
 * Enviar correo de restablecimiento de contraseña.
 */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// ─── PERFIL ────────────────────────────────────────────────────────────────────

/**
 * Obtener el documento de usuario (con el campo `role`) desde Firestore.
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data();
}

/**
 * Actualizar campos del perfil de usuario.
 * @param {string} uid
 * @param {Object} data
 */
export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });
}
