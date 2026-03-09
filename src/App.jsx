// src/App.jsx
import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import Navbar from "./components/Navbar";
import CartSidebar from "./components/cart/CartSidebar";
import HomePage from "./pages/HomePage";
import RestaurantsPage from "./pages/RestaurantsPage";
import MenuPage from "./pages/MenuPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

// AppShell va DENTRO de todos los providers
function AppShell() {
  const [view, setView] = useState("home");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { cartOpen } = useCart();
  const { user, isRestaurant, loading } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  // Redirige si intenta acceder al panel sin ser restaurante
   useEffect(() => {
    if (view === "dashboard" && !loading && (!user || !isRestaurant)) {
      setView("home");
    }
    if (view === "profile" && !loading && !user) {
      setView("login");
    }
  }, [view, user, isRestaurant, loading]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 48, height: 48,
            border: "3px solid var(--card-border)",
            borderTop: "3px solid var(--orange)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: "var(--text-muted)" }}>
            Cargando…
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar view={view} setView={setView} />
      <main>
        {view === "home"        && <HomePage setView={setView} />}
        {view === "login"       && <LoginPage onSuccess={() => setView("home")} />}
        {view === "restaurants" && (
          <RestaurantsPage
            setView={setView}
            setSelectedRestaurant={setSelectedRestaurant}
          />
        )}
        {view === "menu" && selectedRestaurant && (
          <MenuPage restaurant={selectedRestaurant} setView={setView} />
        )}
        {view === "profile" && user && <ProfilePage />}
        {view === "dashboard" && user && isRestaurant && (
          <DashboardPage />
        )}
      </main>
      {cartOpen && <CartSidebar restaurantData={selectedRestaurant} />}
    </>
  );
}

// El orden correcto: AuthProvider > ThemeProvider > CartProvider > AppShell
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}