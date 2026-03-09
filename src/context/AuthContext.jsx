import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile, logout as firebaseLogout, ROLES } from "../firebase/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  // Permite refrescar el perfil desde cualquier componente (ej. después de editar)
  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    const prof = await getUserProfile(auth.currentUser.uid);
    setProfile(prof);
  }, []);

  const logout = async () => {
    await firebaseLogout();
  };

  const isRestaurant = profile?.role === ROLES.RESTAURANT;
  const isCustomer   = profile?.role === ROLES.CUSTOMER;

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, isRestaurant, isCustomer, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}