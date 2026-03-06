// ─── scripts/seedFirestore.mjs ────────────────────────────────────────────────
// Populates Firestore with sample restaurants and menu items.
// Run ONCE from your local machine (never in CI):
//   node scripts/seedFirestore.mjs
//
// Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service-account
// JSON, OR set VITE_FIREBASE_* variables in .env.local and use the client SDK.

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { config } from "dotenv";

config({ path: ".env.local" });

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ─── Sample data ──────────────────────────────────────────────────────────────
const RESTAURANTS = [
  {
    name: "La Parrilla del Maestro",
    category: "Parrilla",
    cuisine: "Parrilla · Carnes",
    description: "La mejor parrilla de la ciudad. Carnes seleccionadas y sazón única.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
    cover: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
    logo: "🥩",
    tags: ["Parrilla", "Popular"],
    rating: 4.9,
    reviews: 347,
    deliveryTime: "25-35 min",
    deliveryFee: 30,
    minOrder: "$150",
    phone: "5215512345678",
    isOpen: true,
    promo: "2x1 en cortes los martes",
    featured: true,
    menu: [
      { name: "Chorizo artesanal",    description: "Chorizo casero a la parrilla con chimichurri", price: 95,  category: "Entradas", popular: true,  veg: false, spicy: false, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80" },
      { name: "Provoleta",             description: "Queso provolone gratinado con hierbas",        price: 110, category: "Entradas", popular: false, veg: true,  spicy: false, image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&q=80" },
      { name: "Rib Eye 300g",          description: "Corte madurado 21 días, papas al romero",      price: 320, category: "Cortes",   popular: true,  veg: false, spicy: false, image: "https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=400&q=80" },
      { name: "T-Bone 400g",           description: "El rey de los cortes. Con mantequilla de hierbas", price: 380, category: "Cortes", popular: false, veg: false, spicy: false, image: "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&q=80" },
      { name: "Combo Parrillero",      description: "Chorizo + entraña + papas + 2 cervezas",       price: 520, category: "Combos",   popular: true,  veg: false, spicy: false, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80" },
      { name: "Cerveza artesanal",     description: "330ml rubia o oscura",                         price: 75,  category: "Bebidas",  popular: false, veg: true,  spicy: false, image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80" },
    ],
  },
  {
    name: "Sushi Zen",
    category: "Japonesa",
    cuisine: "Japonesa · Sushi",
    description: "Rolls artesanales con ingredientes importados.",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80",
    cover: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=1200&q=80",
    logo: "🍣",
    tags: ["Japonesa", "Fresco"],
    rating: 4.8,
    reviews: 219,
    deliveryTime: "30-45 min",
    deliveryFee: 40,
    minOrder: "$200",
    phone: "5215587654321",
    isOpen: true,
    promo: "Combo familiar -20%",
    featured: false,
    menu: [
      { name: "Roll Dragon",      description: "Camarón tempura, aguacate, atún y sriracha", price: 175, category: "Rolls",   popular: true,  veg: false, spicy: true,  image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80" },
      { name: "Roll Philadelphia",description: "Salmón, queso crema, pepino, cebollín",      price: 155, category: "Rolls",   popular: true,  veg: false, spicy: false, image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80" },
      { name: "Ramen Tonkotsu",   description: "Caldo de cerdo 12h, chashu, huevo marinado", price: 195, category: "Sopas",   popular: true,  veg: false, spicy: false, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80" },
    ],
  },
  {
    name: "Taquería El Compa",
    category: "Tacos",
    cuisine: "Mexicana · Tacos",
    description: "Tacos de canasta, al pastor y suadero. Tradición mexicana.",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
    cover: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=1200&q=80",
    logo: "🌮",
    tags: ["Tacos", "Rápido"],
    rating: 4.7,
    reviews: 583,
    deliveryTime: "15-25 min",
    deliveryFee: 20,
    minOrder: "$80",
    phone: "5215599887766",
    isOpen: true,
    promo: "10 tacos + refresco",
    featured: true,
    menu: [
      { name: "Taco al Pastor x3", description: "Carne marinada, piña, cilantro, salsa verde", price: 75, category: "Tacos",    popular: true, veg: false, spicy: true,  image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" },
      { name: "Taco de Suadero x3",description: "Suadero doradito, cebolla, cilantro, salsa",  price: 70, category: "Tacos",    popular: true, veg: false, spicy: false, image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&q=80" },
      { name: "Agua de Jamaica",    description: "500ml fresca del día",                       price: 30, category: "Bebidas", popular: true, veg: true,  spicy: false, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80" },
    ],
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Seeding Firestore...\n");

  for (const { menu, ...restData } of RESTAURANTS) {
    console.log(`  → Creating restaurant: ${restData.name}`);
    const restRef = await addDoc(collection(db, "restaurants"), {
      ...restData,
      createdAt: serverTimestamp(),
    });
    console.log(`     id: ${restRef.id}`);

    for (const item of menu) {
      await addDoc(collection(db, "restaurants", restRef.id, "menu"), {
        ...item,
        available: true,
        createdAt: serverTimestamp(),
      });
    }
    console.log(`     ✓ ${menu.length} menu items added`);
  }

  console.log("\n✅ Done! Firestore is seeded.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
