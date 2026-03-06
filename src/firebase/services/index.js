// ─── src/firebase/services/index.js ──────────────────────────────────────────
// Barrel re-export so pages can import from one place:
//   import { getRestaurants, createOrder } from "../firebase/services";

export * from "./restaurantService";
export * from "./orderService";
export * from "./storageService";
