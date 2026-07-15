/* =========================================================================
   LARASATI HIJAB — shared data layer & helpers
   All state lives in localStorage so the admin panel and the storefront
   stay in sync without a backend. Every page includes this file.
   ========================================================================= */

const LS_KEYS = {
  products: "lh_products",
  cart: "lh_cart",
  users: "lh_users",
  orders: "lh_orders",
  session: "lh_session",
  settings: "lh_settings",
};

/* ---------- default seed data (used only the very first time) ---------- */

const DEFAULT_SETTINGS = {
  brand: "Larasati",
  tagline: "Modest Wear, Modern Grace",
  heroTitle: "Balutan Lembut untuk Setiap Langkahmu",
  heroSubtitle:
    "Koleksi hijab dan busana muslimah dengan jatuhan kain premium — dirancang untuk yang bergerak lincah dan tetap anggun.",
  heroImage:
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1400&auto=format&fit=crop",
  heroButtonText: "Belanja Koleksi",
  announcement: "Gratis ongkir se-Indonesia untuk belanja di atas Rp350.000",
  aboutTitle: "Dijahit dari Ketenangan",
  aboutText:
    "Larasati lahir dari keyakinan bahwa busana sederhana bisa terasa mewah. Setiap helai kami pilih karena jatuhnya yang ringan dan warnanya yang tenang — supaya kamu leluasa bergerak tanpa kehilangan keanggunan.",
  adminPassword: "larasati2026",
};

const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    name: "Hijab Voal Segi Empat Dusty Blue",
    category: "Hijab",
    price: 89000,
    stock: 42,
    desc: "Voal premium adem, jatuh lembut, cocok dipakai harian maupun formal. Ukuran 115x115cm.",
    image:
      "https://images.unsplash.com/photo-1611162458324-aeeb2f3c5c8f?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "p2",
    name: "Gamis Katun Ima Rose",
    category: "Gamis",
    price: 329000,
    stock: 18,
    desc: "Gamis katun tebal tidak menerawang, siluet A-line dengan aksen kancing depan.",
    image:
      "https://images.unsplash.com/photo-1590927813369-2a5c8c9b6b9f?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "p3",
    name: "Pashmina Ceruti Mocha",
    category: "Hijab",
    price: 75000,
    stock: 60,
    desc: "Bahan ceruti ringan dengan jatuhan draperi yang cantik, mudah dibentuk.",
    image:
      "https://images.unsplash.com/photo-1601924638867-3ec6e2b8b45f?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "p4",
    name: "Set Koko Ayah & Anak Navy",
    category: "Couple",
    price: 459000,
    stock: 10,
    desc: "Setelan koko keluarga bahan katun rayon, nyaman untuk momen kebersamaan.",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "p5",
    name: "Outer Rajut Lilac",
    category: "Outer",
    price: 219000,
    stock: 25,
    desc: "Outer rajut lembut dengan detail kancing kayu, pas untuk cuaca sejuk.",
    image:
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "p6",
    name: "Hijab Anak Bergo Kuning Pastel",
    category: "Kids",
    price: 45000,
    stock: 70,
    desc: "Bergo instan untuk si kecil, bahan lycra adem dan lentur seharian.",
    image:
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=900&auto=format&fit=crop",
  },
];

/* ------------------------------- storage -------------------------------- */

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initStore() {
  if (!localStorage.getItem(LS_KEYS.products)) writeLS(LS_KEYS.products, DEFAULT_PRODUCTS);
  if (!localStorage.getItem(LS_KEYS.settings)) writeLS(LS_KEYS.settings, DEFAULT_SETTINGS);
  if (!localStorage.getItem(LS_KEYS.cart)) writeLS(LS_KEYS.cart, []);
  if (!localStorage.getItem(LS_KEYS.users)) writeLS(LS_KEYS.users, []);
  if (!localStorage.getItem(LS_KEYS.orders)) writeLS(LS_KEYS.orders, []);
}
initStore();

const Store = {
  getSettings: () => readLS(LS_KEYS.settings, DEFAULT_SETTINGS),
  saveSettings: (s) => writeLS(LS_KEYS.settings, s),

  getProducts: () => readLS(LS_KEYS.products, []),
  saveProducts: (p) => writeLS(LS_KEYS.products, p),
  getProduct: (id) => Store.getProducts().find((p) => p.id === id),
  upsertProduct: (product) => {
    const list = Store.getProducts();
    const i = list.findIndex((p) => p.id === product.id);
    if (i >= 0) list[i] = product;
    else list.push(product);
    Store.saveProducts(list);
  },
  deleteProduct: (id) => {
    Store.saveProducts(Store.getProducts().filter((p) => p.id !== id));
  },

  getCart: () => readLS(LS_KEYS.cart, []),
  saveCart: (c) => {
    writeLS(LS_KEYS.cart, c);
    updateCartBadge();
  },
  addToCart: (productId, qty = 1) => {
    const cart = Store.getCart();
    const line = cart.find((l) => l.productId === productId);
    if (line) line.qty += qty;
    else cart.push({ productId, qty });
    Store.saveCart(cart);
  },
  updateCartQty: (productId, qty) => {
    let cart = Store.getCart();
    if (qty <= 0) cart = cart.filter((l) => l.productId !== productId);
    else cart.forEach((l) => { if (l.productId === productId) l.qty = qty; });
    Store.saveCart(cart);
  },
  removeFromCart: (productId) => {
    Store.saveCart(Store.getCart().filter((l) => l.productId !== productId));
  },
  clearCart: () => Store.saveCart([]),
  cartCount: () => Store.getCart().reduce((sum, l) => sum + l.qty, 0),
  cartTotal: () => {
    const products = Store.getProducts();
    return Store.getCart().reduce((sum, l) => {
      const p = products.find((pr) => pr.id === l.productId);
      return sum + (p ? p.price * l.qty : 0);
    }, 0);
  },

  getUsers: () => readLS(LS_KEYS.users, []),
  saveUsers: (u) => writeLS(LS_KEYS.users, u),
  registerUser: (name, email, password) => {
    const users = Store.getUsers();
    if (users.some((u) => u.email === email)) return { ok: false, msg: "Email sudah terdaftar." };
    users.push({ id: "u" + Date.now(), name, email, password, joined: new Date().toISOString() });
    Store.saveUsers(users);
    return { ok: true };
  },
  loginUser: (email, password) => {
    const user = Store.getUsers().find((u) => u.email === email && u.password === password);
    if (!user) return { ok: false, msg: "Email atau kata sandi salah." };
    writeLS(LS_KEYS.session, { userId: user.id });
    return { ok: true, user };
  },
  logoutUser: () => localStorage.removeItem(LS_KEYS.session),
  currentUser: () => {
    const session = readLS(LS_KEYS.session, null);
    if (!session) return null;
    return Store.getUsers().find((u) => u.id === session.userId) || null;
  },

  getOrders: () => readLS(LS_KEYS.orders, []),
  placeOrder: (orderInfo) => {
    const orders = Store.getOrders();
    const order = {
      id: "ORD" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      items: Store.getCart(),
      total: Store.cartTotal(),
      status: "Diproses",
      ...orderInfo,
    };
    orders.unshift(order);
    writeLS(LS_KEYS.orders, orders);
    Store.clearCart();
    return order;
  },
  updateOrderStatus: (orderId, status) => {
    const orders = Store.getOrders();
    const o = orders.find((x) => x.id === orderId);
    if (o) o.status = status;
    writeLS(LS_KEYS.orders, orders);
  },

  isAdmin: () => readLS(LS_KEYS.session, {}).isAdmin === true,
  loginAdmin: (password) => {
    if (password === Store.getSettings().adminPassword) {
      writeLS(LS_KEYS.session, { isAdmin: true });
      return true;
    }
    return false;
  },
  logoutAdmin: () => localStorage.removeItem(LS_KEYS.session),
};

/* ------------------------------- helpers -------------------------------- */

function formatIDR(n) {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function updateCartBadge() {
  const badge = qs("[data-cart-count]");
  if (badge) badge.textContent = Store.cartCount();
}

/* renders the shared header/footer chrome text (brand name, announcement) */
function applyBrandChrome() {
  const s = Store.getSettings();
  qsa("[data-brand-name]").forEach((el) => (el.textContent = s.brand));
  qsa("[data-announcement]").forEach((el) => (el.textContent = s.announcement));
  document.title = document.title.replace(/^.*? — /, "") ;
  if (!document.title.includes(s.brand)) document.title = document.title + " — " + s.brand;
  updateCartBadge();
}

document.addEventListener("DOMContentLoaded", applyBrandChrome);
