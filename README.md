# 🍴 SaboresYa — con Firebase

Plataforma de pedidos de comida por WhatsApp. Los clientes agregan platillos al carrito y envían el pedido directamente al restaurante vía WhatsApp. Todos los pedidos quedan registrados en Firestore en tiempo real.

---

## 🚀 Inicio rápido

```bash
# 1. Instalar dependencias (incluye Firebase SDK v10)
npm install

# 2. Configurar credenciales de Firebase
cp .env.local.example .env.local
# → Edita .env.local con tus credenciales de Firebase Console

# 3. (Opcional) Poblar Firestore con datos de prueba
node scripts/seedFirestore.mjs

# 4. Arrancar en desarrollo
npm run dev
```

---

## 📁 Estructura del proyecto

```
saboresya/
├── .env.local.example          ← Plantilla de variables de entorno
├── firestore.rules             ← Reglas de seguridad de Firestore
├── firestore.indexes.json      ← Índices compuestos para queries
├── scripts/
│   └── seedFirestore.mjs       ← Script para poblar la DB con datos demo
│
└── src/
    ├── App.jsx                 ← Shell principal con navegación
    ├── main.jsx
    │
    ├── firebase/
    │   ├── config.js           ← Inicialización Firebase (lee .env.local)
    │   └── services/
    │       ├── restaurantService.js  ← CRUD restaurants + menu subcollection
    │       ├── orderService.js       ← CRUD orders + helpers
    │       ├── storageService.js     ← Upload imágenes a Firebase Storage
    │       └── index.js              ← Barrel re-export
    │
    ├── hooks/
    │   ├── useRestaurants.js   ← Real-time listener de restaurantes
    │   ├── useMenu.js          ← Real-time listener de menú por restaurante
    │   └── useOrders.js        ← Real-time listener de pedidos (dashboard)
    │
    ├── context/
    │   ├── ThemeContext.jsx     ← Dark/light mode
    │   └── CartContext.jsx      ← Carrito + saveOrderToFirestore()
    │
    ├── data/
    │   └── reviews.js          ← Reseñas estáticas (UI)
    │
    ├── utils/
    │   └── whatsapp.js         ← buildWhatsAppUrl() helper
    │
    ├── styles/
    │   └── globals.css         ← Variables CSS tema claro/oscuro + animaciones
    │
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Stars.jsx
    │   ├── ReviewsSection.jsx
    │   └── cart/
    │       └── CartSidebar.jsx ← Carrito + checkout + guarda en Firestore
    │
    └── pages/
        ├── HomePage.jsx        ← Landing con hero, pasos, reviews, CTA
        ├── RestaurantsPage.jsx ← Grid de restaurantes desde Firestore (real-time)
        ├── MenuPage.jsx        ← Menú del restaurante desde subcollección (real-time)
        └── DashboardPage.jsx   ← Panel: pedidos live, platillos, estadísticas reales
```

---

## 🔥 Estructura de Firestore

```
restaurants/                         ← Colección principal
  {restaurantId}/
    name, category, cuisine, description
    image, cover, logo, tags
    rating, reviews, deliveryTime, deliveryFee, minOrder
    phone (número WhatsApp), isOpen, promo, featured
    createdAt, updatedAt

    menu/                            ← Subcolección de platillos
      {itemId}/
        name, description, price, category
        image, popular, veg, spicy, available
        createdAt

orders/                              ← Colección de pedidos
  {orderId}/
    restaurantId, restaurantName
    customerName, address, note
    items: [{ id, name, price, qty }]
    total, status, whatsappSent
    createdAt, updatedAt
```

### Estados de un pedido
`nuevo` → `preparando` → `listo` → `entregado` (o `cancelado`)

---

## 🛡️ Seguridad

Despliega las reglas de Firestore:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## ⚡ Para producción

```bash
npm run build        # genera dist/
npm run preview      # previsualiza el build

# Desplegar en Firebase Hosting (opcional)
firebase deploy --only hosting
```
