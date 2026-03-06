// src/context/AuthContext.jsx
// Provee el usuario autenticado y su perfil (con `role`) a toda la app.

import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile, logout as firebaseLogout, ROLES } from "../firebase/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);   // Firebase Auth user object
  const [profile, setProfile]   = useState(null);   // Firestore users/{uid} document
  const [loading, setLoading]   = useState(true);   // true while resolving first auth state

  useEffect(() => {
    // Firebase keeps the session in localStorage automatically.
    // onAuthStateChanged fires once on mount with the persisted session (or null).
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const prof = await getUserProfile(firebaseUser.uid);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await firebaseLogout();
    // onAuthStateChanged will fire and clear user/profile automatically
  };

  // Convenience booleans
  const isRestaurant = profile?.role === ROLES.RESTAURANT;
  const isCustomer   = profile?.role === ROLES.CUSTOMER;

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, logout, isRestaurant, isCustomer }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
