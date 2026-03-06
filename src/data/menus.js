export const MENUS = {
  1: {
    categories: ["Entradas", "Cortes", "Combos", "Bebidas"],
    items: [
      { id: 101, name: "Chorizo artesanal", desc: "Chorizo casero a la parrilla con chimichurri y pan", price: 95, cat: "Entradas", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80", popular: true, veg: false, spicy: false },
      { id: 102, name: "Provoleta a la parrilla", desc: "Queso provolone gratinado con hierbas y aceite de oliva", price: 110, cat: "Entradas", image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&q=80", popular: false, veg: true, spicy: false },
      { id: 103, name: "Rib Eye 300g", desc: "Corte de res madurado 21 días, jugoso y tierno, acompañado de papas al romero", price: 320, cat: "Cortes", image: "https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=400&q=80", popular: true, veg: false, spicy: false },
      { id: 104, name: "T-Bone 400g", desc: "El rey de los cortes. Con mantequilla de hierbas y vegetales asados", price: 380, cat: "Cortes", image: "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&q=80", popular: false, veg: false, spicy: false },
      { id: 105, name: "New York 250g", desc: "Corte magro con mucho sabor, perfecto para los amantes de la carne", price: 280, cat: "Cortes", image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80", popular: true, veg: false, spicy: false },
      { id: 106, name: "Combo Parrillero", desc: "Chorizo + morcilla + entraña + papas fritas + 2 cervezas", price: 520, cat: "Combos", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80", popular: true, veg: false, spicy: false },
      { id: 107, name: "Agua mineral", desc: "500ml", price: 35, cat: "Bebidas", image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400&q=80", popular: false, veg: true, spicy: false },
      { id: 108, name: "Cerveza artesanal", desc: "330ml rubia o oscura", price: 75, cat: "Bebidas", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80", popular: false, veg: true, spicy: false },
    ],
  },
  2: {
    categories: ["Rolls", "Nigiris", "Sopas", "Bebidas"],
    items: [
      { id: 201, name: "Roll Dragon", desc: "Camarón tempura, aguacate, pepino cubierto de atún y sriracha", price: 175, cat: "Rolls", image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80", popular: true, veg: false, spicy: true },
      { id: 202, name: "Roll Philadelphia", desc: "Salmón, queso crema, pepino, cebollín", price: 155, cat: "Rolls", image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80", popular: true, veg: false, spicy: false },
      { id: 203, name: "Roll Vegetariano", desc: "Aguacate, mango, pepino, zanahoria, salsa ponzu", price: 130, cat: "Rolls", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&q=80", popular: false, veg: true, spicy: false },
      { id: 204, name: "Nigiri Salmón x4", desc: "Arroz de sushi con salmón fresco y wasabi", price: 120, cat: "Nigiris", image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&q=80", popular: false, veg: false, spicy: false },
      { id: 205, name: "Ramen Tonkotsu", desc: "Caldo de cerdo 12 horas, chashu, huevo marinado, nori", price: 195, cat: "Sopas", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80", popular: true, veg: false, spicy: false },
      { id: 206, name: "Té Matcha frío", desc: "Matcha ceremonial con leche de almendra", price: 65, cat: "Bebidas", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", popular: false, veg: true, spicy: false },
    ],
  },
  3: {
    categories: ["Tacos", "Tortas", "Quesadillas", "Bebidas"],
    items: [
      { id: 301, name: "Taco al Pastor x3", desc: "Carne de cerdo marinada, piña, cilantro, cebolla y salsa verde", price: 75, cat: "Tacos", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80", popular: true, veg: false, spicy: true },
      { id: 302, name: "Taco de Suadero x3", desc: "Suadero doradito, cebolla, cilantro, salsa roja o verde", price: 70, cat: "Tacos", image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&q=80", popular: true, veg: false, spicy: false },
      { id: 303, name: "Taco de Canasta x5", desc: "Frijoles, papa con chorizo o chicharrón prensado", price: 65, cat: "Tacos", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80", popular: false, veg: false, spicy: false },
      { id: 304, name: "Torta de milanesa", desc: "Pan telera, milanesa de res, aguacate, jitomate, frijoles", price: 95, cat: "Tortas", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", popular: false, veg: false, spicy: false },
      { id: 305, name: "Quesadilla de champiñones", desc: "Tortilla de maíz, queso Oaxaca, champiñones salteados", price: 80, cat: "Quesadillas", image: "https://images.unsplash.com/photo-1630431341973-02e1b662ec35?w=400&q=80", popular: true, veg: true, spicy: false },
      { id: 306, name: "Agua de Jamaica", desc: "500ml fresca del día", price: 30, cat: "Bebidas", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80", popular: true, veg: true, spicy: false },
    ],
  },
  4: {
    categories: ["Burgers", "Papas", "Bebidas"],
    items: [
      { id: 401, name: "Smash Classic", desc: "Doble carne angus, queso americano, pickles, salsa especial", price: 145, cat: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", popular: true, veg: false, spicy: false },
      { id: 402, name: "Smash BBQ", desc: "Doble carne, bacon, cebolla caramelizada, salsa BBQ ahumada", price: 165, cat: "Burgers", image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80", popular: true, veg: false, spicy: false },
      { id: 403, name: "Papas Loaded", desc: "Papas fritas con queso cheddar, bacon y cebollín", price: 95, cat: "Papas", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80", popular: true, veg: false, spicy: false },
      { id: 404, name: "Refresco", desc: "355ml a elegir", price: 40, cat: "Bebidas", image: "https://images.unsplash.com/photo-1596803244897-75ca765f44de?w=400&q=80", popular: false, veg: true, spicy: false },
    ],
  },
  5: {
    categories: ["Pizzas", "Entradas", "Postres", "Bebidas"],
    items: [
      { id: 501, name: "Margherita", desc: "Salsa de tomate San Marzano, mozzarella fresca, albahaca", price: 195, cat: "Pizzas", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", popular: true, veg: true, spicy: false },
      { id: 502, name: "Diavola", desc: "Salami piccante, tomate, mozzarella, aceite de chile", price: 225, cat: "Pizzas", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", popular: true, veg: false, spicy: true },
      { id: 503, name: "4 Stagioni", desc: "Jamón, champiñones, alcachofas, aceitunas, tomate, mozzarella", price: 240, cat: "Pizzas", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80", popular: false, veg: false, spicy: false },
      { id: 504, name: "Bruschetta x4", desc: "Pan ciabatta, tomate, ajo, albahaca, aceite de oliva extra virgen", price: 90, cat: "Entradas", image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&q=80", popular: false, veg: true, spicy: false },
      { id: 505, name: "Tiramisú", desc: "El clásico italiano. Café, mascarpone y cacao", price: 85, cat: "Postres", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80", popular: true, veg: true, spicy: false },
      { id: 506, name: "Limonada natural", desc: "Con agua mineral y menta", price: 55, cat: "Bebidas", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80", popular: false, veg: true, spicy: false },
    ],
  },
  6: {
    categories: ["Principales", "Ensaladas", "Postres", "Bebidas"],
    items: [
      { id: 601, name: "Pad Thai", desc: "Fideos de arroz, camarón, tofu, cacahuates, lima y salsa tamarindo", price: 185, cat: "Principales", image: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&q=80", popular: true, veg: false, spicy: true },
      { id: 602, name: "Curry Verde", desc: "Leche de coco, vegetales, arroz jazmín, cilantro", price: 175, cat: "Principales", image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80", popular: true, veg: true, spicy: true },
      { id: 603, name: "Tom Kha Gai", desc: "Sopa cremosa de coco con pollo, galanga y lemongrass", price: 155, cat: "Principales", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80", popular: false, veg: false, spicy: false },
      { id: 604, name: "Agua de coco natural", desc: "Fresca y natural", price: 70, cat: "Bebidas", image: "https://images.unsplash.com/photo-1548010783-2440a59040e0?w=400&q=80", popular: false, veg: true, spicy: false },
    ],
  },
};

export const DASHBOARD_ORDERS = [
  { id: "#2451", customer: "Juan Pérez", items: "Rib Eye 300g x1, Chorizo x1, Cerveza x2", total: "$500", time: "hace 5 min", status: "nuevo", phone: "5215512341234" },
  { id: "#2450", customer: "María López", items: "Combo Parrillero x1, Agua mineral x2", total: "$590", time: "hace 12 min", status: "preparando", phone: "5215556789012" },
  { id: "#2449", customer: "Carlos Ruiz", items: "T-Bone 400g x1, Provoleta x1", total: "$490", time: "hace 28 min", status: "listo", phone: "5215598765432" },
  { id: "#2448", customer: "Ana García", items: "New York x2, Chimichurri x1", total: "$595", time: "hace 45 min", status: "entregado", phone: "5215533445566" },
];
