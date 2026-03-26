/* FetchhIt minimal auth client (no frameworks) */


const STORAGE_KEY = "FetchhIt_auth";
const REQUESTS_KEY = "FetchhIt_requests";
const LOCAL_PRODUCTS_KEY = "FetchhIt_products";
const LOCAL_PRODUCT_OVERRIDES_KEY = "FetchhIt_product_overrides";
const LOCAL_DELETED_PRODUCTS_KEY = "FetchhIt_deleted_products";
const DEFAULT_API_ORIGIN = "http://localhost:5000";
let PRODUCT_CACHE = [];
let requestRefreshTimer = null;
let activeCategory = "";
let CATEGORY_DATA = {};
let currentDealProduct = null;
let editingProductId = "";
let filterState = {
  minPrice: null,
  maxPrice: null,
};

const ASSET_IMAGE_OPTIONS = Array.isArray(window.ASSET_IMAGE_OPTIONS)
  ? window.ASSET_IMAGE_OPTIONS
  : [];

document.getElementById("aiSuggestBtn").addEventListener("click", () => {
  // Open Streamlit app in new tab
  window.open("http://localhost:8502", "_blank");
});

const CATEGORY_FALLBACK_DATA = {
  mobiles: [
    { _id: "m1", name: "iPhone 13 (128GB) - Blue", price: 52999, category: "Mobiles", image: "/static/assets/iphone13.jpg", description: "Buyer wants: Like New • Delivery in 3 days" },
    { _id: "m2", name: "Samsung Galaxy S21", price: 55999, category: "Mobiles", image: "/static/assets/samsung.jpg", description: "Buyer wants: New • Original bill preferred" },
    { _id: "m3", name: "OnePlus Nord CE 2", price: 19999, category: "Mobiles", image: "/static/assets/oneplus9.jpg", description: "Buyer wants: Used • Local pickup" },
    { _id: "m4", name: "Google Pixel 6a", price: 34999, category: "Mobiles", image: "/static/assets/pixel7.jpg", description: "Buyer wants: Like New • Warranty preferred" },
    { _id: "m5", name: "Xiaomi Redmi Note 11 Pro", price: 17999, category: "Mobiles", image: "/static/assets/redmi.jpeg", description: "Buyer wants: New • Delivery in 1 week" },
    { _id: "m6", name: "Realme 9 Pro+", price: 22999, category: "Mobiles", image: "/static/assets/realme.jpg", description: "Buyer wants: Used • Nearby pickup" },
    { _id: "m7", name: "iPhone SE (2020) - 64GB", price: 19999, category: "Mobiles", image: "/static/assets/iphone-se.jpg", description: "Buyer wants: Used • Original accessories preferred" },
    { _id: "m8", name: "Samsung Galaxy A52", price: 22999, category: "Mobiles", image: "/static/assets/galaxy-a52.jpg", description: "Buyer wants: Like New • Delivery in 5 days" },
    { _id: "m9", name: "OnePlus 9 Pro", price: 64999, category: "Mobiles", image: "/static/assets/oneplus9pro.jpg", description: "Buyer wants: Used • Local pickup" },
    { _id: "m10", name: "Google Pixel 5a", price: 29999, category: "Mobiles", image: "/static/assets/pixel5a.jpg", description: "Buyer wants: Like New • Warranty preferred" },
  ],
  fashion: [
    { _id: "f1", name: "Running Sneakers - Size 9", price: 2499, category: "Fashion", image: "/static/assets/s1.jpg", description: "Buyer wants: New • Preferred brand Nike/Adidas" },
    { _id: "f2", name: "Athletic T-Shirt - Medium", price: 799, category: "Fashion", image: "/static/assets/s2.jpg", description: "Buyer wants: Like New • Delivery in 3 days" },
    { _id: "f3", name: "Yoga Pants - Size M", price: 1199, category: "Fashion", image: "/static/assets/s3.jpg", description: "Buyer wants: New • Preferred brand Lululemon" },
    { _id: "f4", name: "Casual Jeans - Size 32", price: 1499, category: "Fashion", image: "/static/assets/s4.jpg", description: "Buyer wants: Like New • Delivery in 5 days" },
    { _id: "f5", name: "Leather Jacket - Size L", price: 4999, category: "Fashion", image: "/static/assets/s5.jpg", description: "Buyer wants: Used • Local pickup" },
    { _id: "f6", name: "Summer Dress - Size S", price: 899, category: "Fashion", image: "/static/assets/s6.jpg", description: "Buyer wants: New • Preferred brand Zara/H&M" },
    { _id: "f7", name: "Formal Shirt - Size M", price: 1299, category: "Fashion", image: "/static/assets/s7.jpg", description: "Buyer wants: Like New • Delivery in 2 days" },
    { _id: "f8", name: "Denim Jacket - Size M", price: 1999, category: "Fashion", image: "/static/assets/s8.jpg", description: "Buyer wants: Used • Local pickup" },
    { _id: "f9", name: "Running Shorts - Size L", price: 699, category: "Fashion", image: "/static/assets/s9.jpg", description: "Buyer wants: New • Preferred brand Nike/Adidas" },
    {_id:"f10",name:"loafer shoes - size 8",price:2999,category:"Fashion",image:"/static/assets/s10.jpg",description:"Buyer wants: Like New • Delivery in 4 days" },
  ],
  electronics: [
    { _id: "e1", name: "Gaming Laptop - i7 / 16GB / RTX", price: 74990, category: "Electronics", image: "/static/assets/mackbook.jpg", description: "Buyer wants: Used • Warranty preferred" },
  { _id: "e2", name: "Bluetooth Headphones", price: 2999, category: "Electronics", image: "/static/assets/headphones.jpg", description: "Buyer wants: New • Delivery in 3 days" },
  { _id: "e3", name: "Smartwatch - Fitness Tracker", price: 4999, category: "Electronics", image: "/static/assets/smartwatch.jpg", description: "Buyer wants: Like New • Local pickup" },
  { _id: "e4", name: "4K LED TV - 55 inch", price: 39999, category: "Electronics", image: "/static/assets/tv.jpg", description: "Buyer wants: Used • Delivery in 1 week" },
  { _id: "e5", name: "Wireless Bluetooth Speaker", price: 1999, category: "Electronics", image: "/static/assets/speaker.jpg", description: "Buyer wants: New • Preferred brand JBL/Sony" },
  { _id: "e6", name: "External Hard Drive - 2TB", price: 5999, category: "Electronics", image: "/static/assets/hdd.jpg", description: "Buyer wants: Like New • Delivery in 5 days" },
    { _id: "e7", name: "DSLR Camera - Canon EOS", price: 25999, category: "Electronics", image: "/static/assets/camera.jpg", description: "Buyer wants: Used • Local pickup" },
    { _id: "e8", name: "Noise Cancelling Earbuds", price: 3999, category: "Electronics", image: "/static/assets/earbuds.jpg", description: "Buyer wants: New • Delivery in 2 days" },
    { _id: "e9", name: "Gaming Console - PS5", price: 49999, category: "Electronics", image: "/static/assets/ps5.jpg", description: "Buyer wants: Used • Warranty preferred" },
    { _id: "e10", name: "4K Action Camera", price: 14999, category: "Electronics", image: "/static/assets/action-camera.jpg", description: "Buyer wants: Like New • Local pickup" },
  ],
  home: [
    { _id: "h1", name: "Sofa Set - 3+1+1", price: 18500, category: "Home", image: "/static/assets/sofa.jpg", description: "Buyer wants: Used • Nearby pickup" },
      { _id: "h2", name: "Queen Size Bed Frame", price: 12000, category: "Home", image: "/static/assets/bed.jpg", description: "Buyer wants: Like New • Delivery in 1 week" },    
      { _id: "h3", name: "Dining Table - 4 Seater", price: 15000, category: "Home", image: "/static/assets/dining-table.jpg", description: "Buyer wants: Used • Local pickup" },
      { _id: "h4", name: "Office Chair - Ergonomic", price: 5000, category: "Home", image: "/static/assets/office-chair.jpg", description: "Buyer wants: New • Delivery in 3 days" },
      { _id: "h5", name: "Bookshelf - 5 Tier", price: 7000, category: "Home", image: "/static/assets/bookshelf.jpg", description: "Buyer wants: Like New • Local pickup" },
      { _id: "h6", name: "Coffee Table - Wooden", price: 4500, category: "Home", image: "/static/assets/coffee-table.jpg", description: "Buyer wants: Used • Delivery in 1 week" },
      { _id: "h7", name: "Wardrobe - 3 Door", price: 20000, category: "Home", image: "/static/assets/wardrobe.jpg", description: "Buyer wants: Like New • Local pickup" },
      { _id: "h8", name: "TV Stand - Modern", price: 8000, category: "Home", image: "/static/assets/tv-stand.jpg", description: "Buyer wants: Used • Delivery in 5 days" },
      { _id: "h9", name: "Recliner Chair - Leather", price: 22000, category: "Home", image: "/static/assets/recliner.jpg", description: "Buyer wants: Like New • Local pickup" },
      { _id: "h10", name: "Shoe Rack - 4 Tier", price: 3000, category: "Home", image: "/static/assets/shoe-rack.jpg", description: "Buyer wants: Used • Delivery in 1 week" },
  ],
  appliances: [
    { _id: "a1", name: "Front Load Washing Machine", price: 19999, category: "Appliances", image: "/static/assets/wm.jpg", description: "Buyer wants: Like New • Installation required" },
    { _id: "a2", name: "Double Door Refrigerator", price: 29999, category: "Appliances", image: "/static/assets/fridge.jpg", description: "Buyer wants: Used • Delivery in 1 week" },
    { _id: "a3", name: "Microwave Oven - 20L", price: 4999, category: "Appliances", image: "/static/assets/microwave.jpg", description: "Buyer wants: New • Delivery in 3 days" },
    { _id: "a4", name: "Air Conditioner - 1.5 Ton", price: 24999, category: "Appliances", image: "/static/assets/ac.jpg", description: "Buyer wants: Used • Installation required" },
    { _id: "a5", name: "Vacuum Cleaner - Bagless", price: 8999, category: "Appliances", image: "/static/assets/vacuum.jpg", description: "Buyer wants: Like New • Delivery in 5 days" },
    { _id: "a6", name: "Induction Cooktop - Single Burner", price: 2999, category: "Appliances", image: "/static/assets/induction.jpg", description: "Buyer wants: New • Delivery in 2 days" },
    { _id: "a7", name: "Water Purifier - RO+UV", price: 7999, category: "Appliances", image: "/static/assets/waterpurifier.jpg", description: "Buyer wants: Used • Delivery in 1 week" },
    { _id: "a8", name: "Geyser - 25L", price: 5999, category: "Appliances", image: "/static/assets/geyser.jpg", description: "Buyer wants: Like New • Installation required" },
    { _id: "a9", name: "Food Processor - 3-in-1", price: 6999, category: "Appliances", image: "/static/assets/food-processor.jpg", description: "Buyer wants: New • Delivery in 3 days" },
    { _id: "a10", name: "Iron - Steam Generator", price: 3999, category: "Appliances", image: "/static/assets/iron.jpg", description: "Buyer wants: Used • Local pickup" },  
  ],
};

function apiOrigin() {
  // If opened from file://, we must use an absolute backend URL.
  if (window.location.protocol === "file:") return DEFAULT_API_ORIGIN;
  return window.location.origin;
}

function apiUrl(path) {
  const p = String(path || "");
  const base = apiOrigin().replace(/\/+$/, "");
  const suffix = p.startsWith("/") ? p : `/${p}`;
  return `${base}${suffix}`;
}

function $(id) {
  return document.getElementById(id);
}

function setButtonLoading(buttonId, isLoading, loadingText, defaultText) {
  const btn = $(buttonId);
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? loadingText : defaultText;
}

function showError(targetId, message) {
  const el = $(targetId);
  if (!el) return;
  if (!message) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  el.hidden = false;
  el.textContent = message;
}

function getFallbackImage(category) {
  const key = String(category || "").toLowerCase();
  if (key === "mobiles") return "./assets/mobile-phone.svg";
  if (key === "fashion") return "./assets/sneakers.svg";
  if (key === "electronics") return "./assets/laptop.svg";
  if (key === "home") return "./assets/sofa.svg";
  if (key === "appliances") return "./assets/washing-machine.svg";
  return "./assets/laptop.svg";
}

function normalizeAssetImagePath(value, category) {
  const raw = String(value || "").trim();
  if (!raw) return getFallbackImage(category);
  if (raw.startsWith("/static/assets/")) return raw;
  if (raw.startsWith("static/assets/")) return `/${raw}`;
  if (/^https?:\/\//i.test(raw)) return "";
  return `/static/assets/${raw.replace(/^\/+/, "")}`;
}

function getLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveLocalProducts(products) {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

function updateLocalProduct(productId, updates) {
  const localProducts = getLocalProducts();
  const next = localProducts.map((product) => (
    product._id === productId ? { ...product, ...updates, updatedAt: new Date().toISOString() } : product
  ));
  saveLocalProducts(next);
  return next.find((product) => product._id === productId) || null;
}

function deleteLocalProduct(productId) {
  saveLocalProducts(getLocalProducts().filter((product) => product._id !== productId));
}

function getLocalProductOverrides() {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCT_OVERRIDES_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function saveLocalProductOverrides(overrides) {
  localStorage.setItem(LOCAL_PRODUCT_OVERRIDES_KEY, JSON.stringify(overrides || {}));
}

function getDeletedProductIds() {
  try {
    const raw = localStorage.getItem(LOCAL_DELETED_PRODUCTS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveDeletedProductIds(ids) {
  localStorage.setItem(LOCAL_DELETED_PRODUCTS_KEY, JSON.stringify(Array.isArray(ids) ? ids : []));
}

function updateEditableProduct(productId, updates) {
  const localProduct = updateLocalProduct(productId, updates);
  if (localProduct) return localProduct;

  const overrides = getLocalProductOverrides();
  const existingProduct = PRODUCT_CACHE.find((product) => String(product?._id) === String(productId));
  if (!existingProduct) return null;

  const nextProduct = {
    ...existingProduct,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  overrides[productId] = nextProduct;
  saveLocalProductOverrides(overrides);
  return nextProduct;
}

function deleteEditableProduct(productId) {
  const localProducts = getLocalProducts();
  const hasLocalProduct = localProducts.some((product) => String(product?._id) === String(productId));

  if (hasLocalProduct) {
    deleteLocalProduct(productId);
    return;
  }

  const deletedIds = new Set(getDeletedProductIds().map((id) => String(id)));
  deletedIds.add(String(productId));
  saveDeletedProductIds(Array.from(deletedIds));

  const overrides = getLocalProductOverrides();
  if (Object.prototype.hasOwnProperty.call(overrides, productId)) {
    delete overrides[productId];
    saveLocalProductOverrides(overrides);
  }
}

function applyProductLocalState(products) {
  const overrides = getLocalProductOverrides();
  const deletedIds = new Set(getDeletedProductIds().map((id) => String(id)));
  const mergedProducts = [];
  const seenIds = new Set();

  products.forEach((product) => {
    const productId = String(product?._id || "");
    if (!productId || deletedIds.has(productId) || seenIds.has(productId)) return;

    const override = overrides[productId];
    mergedProducts.push(override ? { ...product, ...override } : product);
    seenIds.add(productId);
  });

  return mergedProducts;
}

function canSellerManageProducts() {
  const auth = getAuth();
  return auth?.user?.role === "seller";
}

function populateItemImageOptions() {
  const select = $("itemImage");
  if (!select) return;
  select.innerHTML = [
    '<option value="">Select image from assets</option>',
    ...ASSET_IMAGE_OPTIONS.map((file) => `<option value="${file}">${file}</option>`),
  ].join("");
}

function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setNavState() {
  const auth = getAuth();
  const login = $("navLogin");
  const logout = $("navLogout");
  const requestsBtn = $("navRequestsBtn");

  if (!login || !logout) return;

  if (auth?.token) {
    const name = auth?.user?.name || "Account";
    login.textContent = name;
    login.href = "#"; // clicking name doesn't open modal when logged in
    logout.hidden = false;
    logout.style.display = "";
    if (requestsBtn) {
      requestsBtn.hidden = false;
      requestsBtn.style.display = "";
      requestsBtn.textContent = auth?.user?.role === "seller" ? "My Items" : "My Requests";
    }
  } else {
    login.textContent = "Login";
    login.href = "#login-modal";
    logout.hidden = true;
    logout.style.display = "none";
    if (requestsBtn) {
      requestsBtn.hidden = true;
      requestsBtn.style.display = "none";
      requestsBtn.textContent = "My Requests";
    }
  }
}

async function login(email, password) {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Login failed.");
  }

  return data; // { token, user, message }
}

async function register(name, email, password, role) {
  const res = await fetch(apiUrl("/api/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Registration failed.");
  }

  return data; // { token, user, message }
}

async function createProduct(payload, token) {
  try {
    const res = await fetch(apiUrl("/api/products"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) return data;
  } catch {
    // Fall back to local product storage when backend product APIs are unavailable.
  }

  const product = {
    _id: `local_${Date.now()}`,
    isLocal: true,
    ...payload,
  };
  const localProducts = getLocalProducts();
  localProducts.unshift(product);
  saveLocalProducts(localProducts);
  return { product, message: "Item posted locally." };
}

async function createRequest(payload, token) {
  const res = await fetch(apiUrl("/api/requests"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Could not send request.");
  }
  return data;
}

async function fetchProducts() {
  const fallbackProducts = [
    ...CATEGORY_FALLBACK_DATA.mobiles,
    ...CATEGORY_FALLBACK_DATA.fashion,
    ...CATEGORY_FALLBACK_DATA.electronics,
    ...CATEGORY_FALLBACK_DATA.home,
    ...CATEGORY_FALLBACK_DATA.appliances,
  ];
  const localProducts = getLocalProducts();

  try {
    const res = await fetch(apiUrl("/api/products"));
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const apiProducts = Array.isArray(data?.products) ? data.products : [];
      return applyProductLocalState([...localProducts, ...apiProducts]);
    }
  } catch {
    // Use local products below when backend is unavailable.
  }
  return applyProductLocalState([...localProducts, ...fallbackProducts]);
}

async function fetchBuyerRequests(token) {
  const res = await fetch(apiUrl("/api/requests/buyer"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Could not load buyer requests.");
  return data?.requests || [];
}

async function fetchSellerRequests(token) {
  const res = await fetch(apiUrl("/api/requests/seller"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Could not load seller requests.");
  return data?.requests || [];
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryTagClass(category) {
  const c = String(category || "").toLowerCase();
  if (c === "mobiles") return "tag--mobiles";
  if (c === "fashion") return "tag--fashion";
  if (c === "electronics") return "tag--electronics";
  if (c === "home") return "tag--home";
  if (c === "appliances") return "tag--appliances";
  return "tag--electronics";
}

function getOriginalPrice(product) {
  const salePrice = Number(product?.price || 0);
  const originalPrice = Number(product?.originalPrice || 0);
  if (originalPrice > salePrice) return originalPrice;

  const seedSource = String(product?._id || product?.name || salePrice);
  const seed = seedSource.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const discountSteps = [8, 10, 12, 15, 18, 20, 22, 25, 28, 30];
  const discountPercent = discountSteps[seed % discountSteps.length];
  const computedOriginalPrice = salePrice / (1 - discountPercent / 100);
  return Math.ceil(computedOriginalPrice / 100) * 100;
}

function getDiscountPercentage(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function buildProductCard(product) {
  const name = escapeHtml(product?.name || "Untitled Item");
  const price = Number(product?.price || 0);
  const originalPrice = getOriginalPrice(product);
  const discountPercentage = getDiscountPercentage(price, originalPrice);
  const category = escapeHtml(product?.category || "General");
  const image = escapeHtml(product?.image || getFallbackImage(product?.category));
  const description = escapeHtml(product?.description || "New item posted by seller.");
  const tagClass = categoryTagClass(product?.category);
  const salePriceLabel = `₹ ${price.toLocaleString("en-IN")}`;
  const originalPriceLabel = `₹ ${originalPrice.toLocaleString("en-IN")}`;
  const productId = escapeHtml(product?._id || "");
  const actionHtml = canSellerManageProducts()
    ? `
          <button class="btn btn--outline btn--block item-edit-btn" type="button" data-product-id="${productId}">Edit Item</button>
          <button class="btn btn--ghost btn--block item-delete-btn" type="button" data-product-id="${productId}">Delete Item</button>
      `
    : `<a class="btn btn--primary btn--block request-deal-btn" href="#" data-product-id="${productId}">Request Deal</a>`;

  return `
    <article class="card" role="listitem">
      <div class="card__media">
        <img class="card__img" src="${image}" alt="${name}" loading="lazy" />
      </div>
      <div class="card__body">
        <header class="card__top">
          <h3 class="card__title">${name}</h3>
          <span class="tag ${tagClass}">${category}</span>
        </header>
        <div class="card__price-row">
          <p class="card__price" data-price="${price}">${salePriceLabel}</p>
          <p class="card__original-price">${originalPriceLabel}</p>
          <span class="card__discount-badge">${discountPercentage}% OFF</span>
        </div>
        <p class="card__hint">${description}</p>
        <div class="card__actions">
          ${actionHtml}
        </div>
      </div>
    </article>
  `;
}

function prependProductCard(product) {
  const grid = $("content");
  if (!grid) return;
  grid.insertAdjacentHTML("afterbegin", buildProductCard(product));
}

function setProducts(products) {
  const grid = $("content");
  if (!grid || !Array.isArray(products)) return;
  if (products.length === 0) {
    grid.innerHTML = `
      <article class="card" role="listitem">
        <div class="card__body">
          <h3 class="card__title">No matching items found</h3>
          <p class="card__hint">Try a different category or widen your price range.</p>
        </div>
      </article>`;
    return;
  }
  grid.innerHTML = products.map((p) => buildProductCard(p)).join("");
}

function clearContent() {
  const grid = $("content");
  if (!grid) return;
  grid.innerHTML = "";
}

function showPlaceholder() {
  const placeholder = $("logoSection");
  const filters = $("filtersSection");
  const buyer = $("buyerSection");
  const incoming = $("incomingSection");
  updateHomeMetrics();
  if (placeholder) placeholder.style.display = "grid";
  if (filters) filters.style.display = "none";
  if (buyer) buyer.style.display = "none";
  if (incoming) incoming.style.display = "none";
}

function showLoader() {
  const placeholder = $("logoSection");
  const filters = $("filtersSection");
  const buyer = $("buyerSection");
  const incoming = $("incomingSection");
  const loader = $("gridLoader");
  if (placeholder) placeholder.style.display = "none";
  if (filters) filters.style.display = "block";
  if (buyer) buyer.style.display = "grid";
  if (incoming) incoming.style.display = "block";
  if (loader) loader.style.display = "grid";
}

function buildCategoryData(products) {
  const map = {
    mobiles: [],
    fashion: [],
    electronics: [],
    home: [],
    appliances: [],
  };

  products.forEach((p) => {
    const key = String(p.category || "").toLowerCase();
    if (map[key]) map[key].push(p);
  });
  return map;
}

function normalizeCategoryKey(category) {
  const key = String(category || "").trim().toLowerCase();
  return key === "all" ? "" : key;
}

function syncCategoryControls(category) {
  const normalized = normalizeCategoryKey(category);
  const topButtons = Array.from(document.querySelectorAll(".category-btn"));
  topButtons.forEach((btn) => {
    btn.classList.toggle("is-active", normalizeCategoryKey(btn.dataset.category) === normalized);
  });

  const radios = Array.from(document.querySelectorAll('input[name="category"]'));
  radios.forEach((radio) => {
    radio.checked = normalizeCategoryKey(radio.value) === normalized;
  });

  if (!normalized && radios.length) {
    const allRadio = radios.find((radio) => normalizeCategoryKey(radio.value) === "");
    if (allRadio) allRadio.checked = true;
  }
}

function getAllProducts() {
  return Array.isArray(PRODUCT_CACHE) ? PRODUCT_CACHE : [];
}

function updateHomeMetrics() {
  const products = getAllProducts();
  const requests = getRequests();
  const categories = new Set(products.map((product) => String(product?.category || "").trim()).filter(Boolean));

  if ($("homeMetricCategories")) $("homeMetricCategories").textContent = String(categories.size || 0);
  if ($("homeMetricListings")) $("homeMetricListings").textContent = `${products.length}+`;
  if ($("homeMetricRoles")) $("homeMetricRoles").textContent = "2 Roles";
  if ($("homeMetricRequests")) $("homeMetricRequests").textContent = `${requests.length} Live`;
}

function getFilteredProducts(category) {
  const normalized = normalizeCategoryKey(category || activeCategory);
  const minPrice = Number.isFinite(filterState.minPrice) ? filterState.minPrice : null;
  const maxPrice = Number.isFinite(filterState.maxPrice) ? filterState.maxPrice : null;

  return getAllProducts().filter((product) => {
    const productCategory = normalizeCategoryKey(product?.category);
    const price = Number(product?.price || 0);
    const categoryMatch = !normalized || productCategory === normalized;
    const minMatch = minPrice === null || price >= minPrice;
    const maxMatch = maxPrice === null || price <= maxPrice;
    return categoryMatch && minMatch && maxMatch;
  });
}

function showGridWithAnimation(items) {
  const grid = $("content");
  const placeholder = $("logoSection");
  const filters = $("filtersSection");
  const buyer = $("buyerSection");
  const incoming = $("incomingSection");
  const loader = $("gridLoader");
  if (!grid) return;

  clearContent();
  if (placeholder) placeholder.style.display = "none";
  if (filters) filters.style.display = "block";
  if (buyer) buyer.style.display = "grid";
  if (incoming) incoming.style.display = "block";
  if (loader) loader.style.display = "none";
  grid.style.display = "grid";
  setProducts(items);
  grid.classList.remove("is-entering");
  grid.offsetHeight;
  grid.classList.add("is-entering");
}

function renderItems(category) {
  showGridWithAnimation(getFilteredProducts(category));
}

function applyFilters(category, options = {}) {
  const nextCategory = normalizeCategoryKey(category);
  activeCategory = nextCategory;
  syncCategoryControls(nextCategory);
  if (options.skipLoader) {
    renderItems(nextCategory);
    return;
  }
  showLoader();
  setTimeout(() => renderItems(nextCategory), 300);
}

function showHome() {
  setBuyerSectionWide(false);
  activeCategory = "";
  filterState = { minPrice: null, maxPrice: null };
  const minPriceInput = $("minPrice");
  const maxPriceInput = $("maxPrice");
  if (minPriceInput) minPriceInput.value = "";
  if (maxPriceInput) maxPriceInput.value = "";
  syncCategoryControls("");
  setContentMeta("Buyer Requests", "FetchhIt is reverse e-commerce: buyers request items, sellers make offers.");
  clearContent();
  showPlaceholder();
}

function showCategory(category) {
  setContentMeta("Buyer Requests", "FetchhIt is reverse e-commerce: buyers request items, sellers make offers.");
  applyFilters(category);
}

function setContentMeta(title, subtitle) {
  const titleEl = $("contentSectionTitle");
  const subtitleEl = $("contentSectionSubtitle");
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
}

function setBuyerSectionWide(isWide) {
  const buyer = $("buyerSection");
  const grid = $("content");
  if (buyer) buyer.classList.toggle("content--wide", Boolean(isWide));
  if (grid) grid.classList.toggle("grid--info", Boolean(isWide));
}

function showCustomContent(title, subtitle, bodyHtml) {
  const placeholder = $("logoSection");
  const filters = $("filtersSection");
  const buyer = $("buyerSection");
  const incoming = $("incomingSection");
  const loader = $("gridLoader");
  const grid = $("content");

  setContentMeta(title, subtitle);
  setBuyerSectionWide(true);
  if (placeholder) placeholder.style.display = "none";
  if (filters) filters.style.display = "none";
  if (buyer) buyer.style.display = "grid";
  if (incoming) incoming.style.display = "none";
  if (loader) loader.style.display = "none";
  if (grid) {
    grid.style.display = "grid";
    grid.innerHTML = bodyHtml;
  }
}

function performSearch(query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) {
    showHome();
    return;
  }

  activeCategory = "";
  syncCategoryControls("");

  const results = getAllProducts().filter((product) => {
    const haystack = [
      product?.name,
      product?.description,
      product?.category,
    ].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  setBuyerSectionWide(false);
  setContentMeta("Search Results", `Showing matches for "${query.trim()}"`);
  showGridWithAnimation(results);
}

function getPlatformSnapshot() {
  const products = getAllProducts();
  const requests = getRequests();
  const categoryMap = {};
  const statusMap = { open: 0, accepted: 0, rejected: 0 };

  products.forEach((product) => {
    const key = String(product?.category || "General");
    categoryMap[key] = (categoryMap[key] || 0) + 1;
  });

  requests.forEach((request) => {
    const status = String(request?.status || "open").toLowerCase();
    if (Object.prototype.hasOwnProperty.call(statusMap, status)) {
      statusMap[status] += 1;
    } else {
      statusMap.open += 1;
    }
  });

  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  const auth = getAuth();

  return {
    totalProducts: products.length,
    totalRequests: requests.length,
    openRequests: statusMap.open,
    acceptedRequests: statusMap.accepted,
    rejectedRequests: statusMap.rejected,
    categories,
    sellersLive: new Set(products.map((product) => String(product?.sellerId || "")).filter(Boolean)).size,
    avgTicket: requests.length
      ? Math.round(
          requests.reduce((sum, request) => sum + Number(request?.offeredPrice || request?.price || 0), 0) /
            requests.length
        )
      : 0,
    topCategory: categories[0]?.name || "No category yet",
    topCategoryCount: categories[0]?.count || 0,
    currentRole: auth?.user?.role || "guest",
    lastUpdated: new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function showFooterInfo(key) {
  const snapshot = getPlatformSnapshot();
  const infoByKey = {
    about: {
      title: "About FetchhIt",
      subtitle: "A reverse marketplace where buyers ask first and sellers respond with offers.",
      paragraphs: [
        `The current FetchhIt catalog holds ${snapshot.totalProducts} live listings across ${snapshot.categories.length} active categories.`,
        `${snapshot.totalRequests} buyer requests are currently tracked, with ${snapshot.openRequests} still open for seller action.`,
      ],
      highlights: [
        `Live listings available: ${snapshot.totalProducts}`,
        `Active request pipeline: ${snapshot.openRequests}`,
      ],
    },
    "how it works": {
      title: "How It Works",
      subtitle: "A simple buyer-to-seller flow.",
      paragraphs: [
        `Buyers can search the ${snapshot.totalProducts} listings, request deals, and submit delivery details directly in the platform flow.`,
        `Sellers manage ${snapshot.openRequests} open requests right now and can update listings from the same dashboard.`,
      ],
      highlights: [
        `${snapshot.totalRequests} total requests tracked in demo`,
        `${snapshot.acceptedRequests} requests moved to accepted status`,
      ],
    },
    "seller hub": {
      title: "Seller Hub",
      subtitle: "Everything sellers need to manage listings and requests.",
      paragraphs: [
        `Seller tools currently cover ${snapshot.totalProducts} listings, with ${snapshot.sellersLive} seller identities represented in the present dataset.`,
        `The strongest inventory cluster is ${snapshot.topCategory}, which currently contains ${snapshot.topCategoryCount} items.`,
      ],
      highlights: [
        `${snapshot.sellersLive} seller accounts represented in current data`,
        `Average buyer offer: ₹ ${snapshot.avgTicket.toLocaleString("en-IN")}`,
      ],
    },
    support: {
      title: "Support",
      subtitle: "Quick help for common issues.",
      paragraphs: [
        `The presentation build is currently reading ${snapshot.totalProducts} listings and ${snapshot.totalRequests} requests from the app state.`,
        `The interface was last refreshed at ${snapshot.lastUpdated}, and the active signed-in role is ${snapshot.currentRole}.`,
      ],
      highlights: [
        `Current categories live: ${snapshot.categories.length}`,
        `Last dashboard refresh: ${snapshot.lastUpdated}`,
      ],
    },
    privacy: {
      title: "Privacy",
      subtitle: "Buyer contact details are shown only where they are needed for deal fulfilment.",
      paragraphs: [
        `${snapshot.acceptedRequests} requests have already moved beyond open state, which means the platform is actively tracking fulfillment progress.`,
        `Buyer delivery details are only surfaced inside the request workflow where sellers need them to process accepted deals.`,
      ],
      highlights: [
        `${snapshot.acceptedRequests} requests progressed beyond open state`,
        `Request status tracking updates in real time inside the UI`,
      ],
    },
  };

  const info = infoByKey[String(key || "").trim().toLowerCase()];
  if (!info) return;

  const topCategories = snapshot.categories.slice(0, 5);
  const stats = [
    { label: "Live Listings", value: snapshot.totalProducts },
    { label: "Total Requests", value: snapshot.totalRequests },
    { label: "Open Deals", value: snapshot.openRequests },
    { label: "Accepted Deals", value: snapshot.acceptedRequests },
  ];

  const bodyHtml = `
    <section aria-label="${escapeHtml(info.title)}" style="display:grid;gap:18px;width:100%;">
      <article style="display:grid;grid-template-columns:minmax(0,1.35fr) auto;gap:18px;padding:24px 26px;border-radius:24px;background:linear-gradient(135deg,#102246 0%,#183366 52%,#116f87 100%);color:#fff;box-shadow:0 20px 40px rgba(16,34,70,0.22);width:100%;">
        <div style="display:grid;gap:12px;min-width:0;">
          <p style="margin:0;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.68);">FetchhIt Presentation View</p>
          <h3 style="margin:0;font-family:'Bricolage Grotesque',sans-serif;font-size:31px;line-height:1.05;letter-spacing:-0.04em;">${escapeHtml(info.title)}</h3>
          <p style="margin:0;max-width:760px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.86);">${escapeHtml(info.paragraphs[0] || "")}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${(info.highlights || []).map((item) => `<span style="display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.16);font-size:12px;font-weight:700;color:#fff;">${escapeHtml(item)}</span>`).join("")}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-end;gap:10px;">
          <span style="display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;background:rgba(7,17,31,0.22);border:1px solid rgba(255,255,255,0.16);font-size:12px;font-weight:700;color:#fff;">Updated ${escapeHtml(snapshot.lastUpdated)}</span>
          <span style="display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;background:rgba(7,17,31,0.22);border:1px solid rgba(255,255,255,0.16);font-size:12px;font-weight:700;color:#fff;">Avg offer ? ${snapshot.avgTicket.toLocaleString("en-IN")}</span>
        </div>
      </article>
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;width:100%;">
        ${stats.map((stat) => `
          <article style="padding:18px 20px;border-radius:18px;background:#fff;border:1px solid rgba(27,47,94,0.1);box-shadow:0 8px 24px rgba(15,23,42,0.06);">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7a95;">${escapeHtml(stat.label)}</p>
            <p style="margin:0;font-family:'Bricolage Grotesque',sans-serif;font-size:30px;font-weight:800;letter-spacing:-0.04em;color:#1b2f5e;">${Number(stat.value).toLocaleString("en-IN")}</p>
          </article>
        `).join("")}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;width:100%;">
        <article style="padding:20px;border-radius:20px;background:#fff;border:1px solid #d9e2f1;box-shadow:0 8px 24px rgba(15,23,42,0.06);display:grid;gap:12px;">
          <h4 style="margin:0;font-size:16px;font-weight:800;letter-spacing:-0.02em;color:#1b2f5e;">Overview</h4>
          ${info.paragraphs.map((paragraph) => `<p style="margin:0;font-size:13.5px;line-height:1.75;color:#5d6b85;">${escapeHtml(paragraph)}</p>`).join("")}
        </article>
        <article style="padding:20px;border-radius:20px;background:#fff;border:1px solid #d9e2f1;box-shadow:0 8px 24px rgba(15,23,42,0.06);display:grid;gap:12px;">
          <h4 style="margin:0;font-size:16px;font-weight:800;letter-spacing:-0.02em;color:#1b2f5e;">Category Distribution</h4>
          <div style="display:grid;gap:10px;">
            ${topCategories.map((category) => `
              <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.07);font-size:13.5px;color:#1f2b3d;">
                <span>${escapeHtml(category.name)}</span>
                <strong>${Number(category.count).toLocaleString("en-IN")} items</strong>
              </div>
            `).join("")}
          </div>
        </article>
        <article style="padding:20px;border-radius:20px;background:#fff;border:1px solid #d9e2f1;box-shadow:0 8px 24px rgba(15,23,42,0.06);display:grid;gap:12px;">
          <h4 style="margin:0;font-size:16px;font-weight:800;letter-spacing:-0.02em;color:#1b2f5e;">Deal Funnel</h4>
          <div style="display:grid;gap:10px;">
            <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.07);font-size:13.5px;color:#1f2b3d;"><span>Open</span><strong>${snapshot.openRequests}</strong></div>
            <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.07);font-size:13.5px;color:#1f2b3d;"><span>Accepted</span><strong>${snapshot.acceptedRequests}</strong></div>
            <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.07);font-size:13.5px;color:#1f2b3d;"><span>Rejected</span><strong>${snapshot.rejectedRequests}</strong></div>
            <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;font-size:13.5px;color:#1f2b3d;"><span>Sellers Live</span><strong>${snapshot.sellersLive}</strong></div>
          </div>
        </article>
      </div>
    </section>
  `;  showCustomContent(info.title, info.subtitle, bodyHtml);
}

function renderSellerItemsCards() {
  setBuyerSectionWide(false);
  const sellerItems = canSellerManageProducts() ? PRODUCT_CACHE : [];
  const grid = $("content");
  if (!grid) return;
  clearContent();
  grid.innerHTML = sellerItems.length
    ? sellerItems.map((product) => buildProductCard(product)).join("")
    : `
      <article class="card" role="listitem">
        <div class="card__body">
          <h3 class="card__title">No items posted yet</h3>
          <p class="card__hint">Use Post Item to add your first seller listing.</p>
        </div>
      </article>`;
}

function showRequestsTab() {
  setBuyerSectionWide(false);
  activeCategory = "";
  const placeholder = $("logoSection");
  const filters = $("filtersSection");
  const buyer = $("buyerSection");
  const incoming = $("incomingSection");
  const loader = $("gridLoader");
  const grid = $("content");

  if (placeholder) placeholder.style.display = "none";
  if (filters) filters.style.display = "block";
  if (buyer) buyer.style.display = "grid";
  if (incoming) incoming.style.display = "block";
  if (loader) loader.style.display = "none";
  if (grid) grid.style.display = "grid";

  const buttons = Array.from(document.querySelectorAll(".category-btn"));
  buttons.forEach((b) => b.classList.remove("is-active"));

  const auth = getAuth();
  if (auth?.user?.role === "seller") {
    setContentMeta("My Items", "Manage the items you posted for buyers.");
    renderSellerItemsCards();
  } else {
    setContentMeta("My Requests", "Track the deals you have requested from sellers.");
    renderRequestsCards();
  }
  renderRequests();
}

function wireCategoryButtons() {
  const buttons = Array.from(document.querySelectorAll(".category-btn"));
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      applyFilters(btn.dataset.category || "");
    });
  });
}

function wireFilterForm() {
  const form = $("filterForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const minRaw = $("minPrice")?.value;
    const maxRaw = $("maxPrice")?.value;
    const minValue = Number(minRaw);
    const maxValue = Number(maxRaw);
    filterState = {
      minPrice: minRaw && Number.isFinite(minValue) && minValue > 0 ? minValue : null,
      maxPrice: maxRaw && Number.isFinite(maxValue) && maxValue > 0 ? maxValue : null,
    };
    const selectedCategory = document.querySelector('input[name="category"]:checked')?.value || activeCategory;
    applyFilters(selectedCategory, { skipLoader: true });
  });

  const radios = Array.from(form.querySelectorAll('input[name="category"]'));
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      applyFilters(radio.value, { skipLoader: true });
    });
  });
}

function wireHomeButton() {
  const homeBtn = $("navHomeBtn");
  if (!homeBtn) return;
  homeBtn.addEventListener("click", showHome);
}

function wireRequestsButton() {
  const btn = $("navRequestsBtn");
  if (!btn) return;
  btn.addEventListener("click", showRequestsTab);
}

function wireSearchForm() {
  const form = document.querySelector(".search");
  const input = $("search");
  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    performSearch(input.value);
  });
}

function wireFooterLinks() {
  const links = Array.from(document.querySelectorAll(".footer__link"));
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showFooterInfo(link.textContent || "");
    });
  });
}

function setRequestDealMessage(message, isError) {
  const el = $("requestDealMessage");
  if (!el) return;
  if (!message) {
    el.hidden = true;
    el.textContent = "";
    el.classList.remove("form-error");
    el.classList.add("form-success");
    return;
  }
  el.hidden = false;
  el.textContent = message;
  if (isError) {
    el.classList.remove("form-success");
    el.classList.add("form-error");
  } else {
    el.classList.remove("form-error");
    el.classList.add("form-success");
  }
}

function prependBuyerRequest(request, product) {
  const list = $("buyerRequestList");
  if (!list) return;

  const p = product || request?.productId || {};
  const name = escapeHtml(p?.name || "Requested item");
  const category = escapeHtml(p?.category || "General");
  const price = Number(p?.price || 0);
  const status = escapeHtml(request?.status || "pending");
  const badgeClass = status === "accepted" ? "badge badge--active" : "badge";
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  const html = `
    <li class="request">
      <div class="request__main">
        <p class="request__name">${name}</p>
        <p class="request__meta">₹ ${price.toLocaleString("en-IN")} • ${category}</p>
      </div>
      <span class="${badgeClass}">${label}</span>
    </li>
  `;
  list.insertAdjacentHTML("afterbegin", html);
}

function paymentLabel(value) {
  if (!value) return "N/A";
  if (value === "upi") return "UPI";
  if (value === "card") return "Card";
  if (value === "bank_transfer") return "Bank Transfer";
  if (value === "cash_on_delivery") return "Cash on Delivery";
  return value;
}

function setRequestsPanelMeta(title, subtitle) {
  const t = $("requestsPanelTitle");
  const s = $("requestsPanelSubtitle");
  if (t) t.textContent = title;
  if (s) s.textContent = subtitle;
}

function getRequests() {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function addRequest(requestData) {
  const all = getRequests();
  const entry = {
    id: `rq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: "open",
    ...requestData,
  };
  all.unshift(entry);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(all));
  updateHomeMetrics();
  return entry;
}

function updateRequestStatus(requestId, status) {
  const all = getRequests();
  const next = all.map((request) => (
    request.id === requestId
      ? { ...request, status, updatedAt: new Date().toISOString() }
      : request
  ));
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(next));
  updateHomeMetrics();
}

function renderRequestsList(requests, role) {
  const list = $("buyerRequestList");
  if (!list) return;
  if (!Array.isArray(requests) || requests.length === 0) {
    list.innerHTML = `
      <li class="request">
        <div class="request__main">
          <p class="request__name">No requests yet</p>
          <p class="request__meta">Your request activity will appear here.</p>
        </div>
        <span class="badge">Empty</span>
      </li>`;
    return;
  }

  list.innerHTML = requests
    .map((r) => {
      const status = String(r.status || "open").toLowerCase();
      const badgeClass = status === "accepted" ? "badge badge--active" : "badge";
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

      const line1 = role === "seller"
        ? `${escapeHtml(r.itemName || "Item")} • ${escapeHtml(r.buyerName || "Buyer")}`
        : `${escapeHtml(r.itemName || "Item")} • ${escapeHtml(r.category || "General")}`;

      const offered = r.offeredPrice ? `₹ ${Number(r.offeredPrice).toLocaleString("en-IN")}` : "N/A";
      const pay = paymentLabel(r.paymentMethod);
      const buyerMeta = role === "seller" ? ` • ${escapeHtml(r.buyerEmail || "No email")}` : "";
      const line2 = `Offer: ${offered} • ${pay}${buyerMeta}`;
      const deliveryLine = role === "seller"
        ? `${escapeHtml(r.deliveryName || "No name")} • ${escapeHtml(r.deliveryPhone || "No phone")}`
        : `${escapeHtml(r.deliveryCity || "No city")} • ${escapeHtml(r.deliveryPincode || "No pincode")}`;
      const addressLine = role === "seller"
        ? `${escapeHtml(r.deliveryAddress || "No address")}, ${escapeHtml(r.deliveryCity || "")}`.trim() + ` ${escapeHtml(r.deliveryPincode || "")}`.trim()
        : `Delivery: ${escapeHtml(r.deliveryAddress || "No address")}`;
      const actionButtons = role === "seller" && status === "open"
        ? `
            <div class="request__actions">
              <button class="request-action request-action--accept" type="button" data-request-id="${escapeHtml(r.id)}" data-status="accepted">Accept</button>
              <button class="request-action request-action--reject" type="button" data-request-id="${escapeHtml(r.id)}" data-status="rejected">Reject</button>
            </div>
          `
        : "";

      return `
        <li class="request">
          <div class="request__main">
            <p class="request__name">${line1}</p>
            <p class="request__meta">${line2}</p>
            <p class="request__meta">${deliveryLine}</p>
            <p class="request__meta">${addressLine}</p>
            ${actionButtons}
          </div>
          <span class="${badgeClass}">${statusLabel}</span>
        </li>
      `;
    })
    .join("");
}

function renderRequests() {
  const auth = getAuth();
  const all = getRequests();
  if (!auth?.user?.role) {
    renderRequestsList([], "buyer");
    return;
  }

  const role = auth.user.role;
  if (role === "seller") {
    setRequestsPanelMeta("Incoming Requests", "Buyer details, address, and payment preferences");
    renderRequestsList(all, "seller");
  } else {
    setRequestsPanelMeta("Your Requests", "Items you've asked sellers for");
    renderRequestsList(all.filter((r) => r.buyerId === auth.user.id), "buyer");
  }
}

function wireRequestStatusActions() {
  const list = $("buyerRequestList");
  if (!list) return;

  list.addEventListener("click", (e) => {
    const button = e.target.closest(".request-action");
    if (!button) return;

    const requestId = button.dataset.requestId || "";
    const status = button.dataset.status || "";
    if (!requestId || !status) return;

    updateRequestStatus(requestId, status);
    renderRequests();
    renderRequestsCards();
  });
}

function renderRequestsCards() {
  const requests = getRequests();
  const cards = requests.map((r) => {
    const image = escapeHtml(r.image || getFallbackImage(r.category));
    const name = escapeHtml(r.itemName || "Requested item");
    const category = escapeHtml(r.category || "General");
    const price = Number(r.offeredPrice || r.price || 0);
    const status = String(r.status || "open").toLowerCase();
    const badge = status === "accepted" ? "tag tag--electronics" : "tag tag--mobiles";
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
    return `
      <article class="card" role="listitem">
        <div class="card__media"><img class="card__img" src="${image}" alt="${name}" loading="lazy" /></div>
        <div class="card__body">
          <header class="card__top">
            <h3 class="card__title">${name}</h3>
            <span class="${badge}">${statusLabel}</span>
          </header>
          <p class="card__price">₹ ${price.toLocaleString("en-IN")}</p>
          <p class="card__hint">${category} • ${paymentLabel(r.paymentMethod)}</p>
        </div>
      </article>
    `;
  });

  const grid = $("content");
  if (!grid) return;
  clearContent();
  grid.innerHTML = cards.length ? cards.join("") : `
    <article class="card" role="listitem">
      <div class="card__body">
        <h3 class="card__title">No requests found</h3>
        <p class="card__hint">Buyer deals will appear here once created.</p>
      </div>
    </article>`;
}

function closeModal() {
  // CSS modals are opened with :target (#login-modal, #register-modal, etc.)
  // Force the target away from the modal first so :target styles are removed immediately.
  if (!location.hash) return;
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.location.hash = "#";

  if (history.replaceState) {
    setTimeout(() => {
      history.replaceState(null, document.title, cleanUrl);
    }, 0);
  }

  // Remove focus from active inputs/buttons inside modal for a cleaner close.
  if (document.activeElement && typeof document.activeElement.blur === "function") {
    document.activeElement.blur();
  }
}

function wireLoginForm() {
  const form = $("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("loginError", "");

    const email = $("loginEmail")?.value?.trim() || "";
    const password = $("loginPassword")?.value || "";

    if (!email || !password) {
      showError("loginError", "Please enter email and password.");
      return;
    }

    try {
      setButtonLoading("loginSubmit", true, "Logging in...", "Login");
      const result = await login(email, password);
      saveAuth({ token: result.token, user: result.user });
      setNavState();
      await loadRequestsByRole();
      showRequestsTab();
      startRequestAutoRefresh();
      // Small delay helps browsers repaint before hash update.
      setTimeout(closeModal, 60);
    } catch (err) {
      const msg = err?.message || "Login failed.";
      if (msg.toLowerCase().includes("failed to fetch")) {
        showError(
          "loginError",
          `Could not reach the API. Start the backend with "npm start" and open the site at ${DEFAULT_API_ORIGIN}/index.html`
        );
      } else {
        showError("loginError", msg);
      }
    } finally {
      setButtonLoading("loginSubmit", false, "Logging in...", "Login");
    }
  });
}

function wireRegisterForm() {
  const form = $("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("registerError", "");

    const name = $("regName")?.value?.trim() || "";
    const email = $("regEmail")?.value?.trim() || "";
    const password = $("regPassword")?.value || "";
    const role = $("regRole")?.value || "";

    if (!name || !email || !password || !role) {
      showError("registerError", "Please fill all fields.");
      return;
    }

    try {
      setButtonLoading("registerSubmit", true, "Creating account...", "Register");
      const result = await register(name, email, password, role);
      saveAuth({ token: result.token, user: result.user });
      setNavState();
      await loadRequestsByRole();
      showRequestsTab();
      startRequestAutoRefresh();
      setTimeout(closeModal, 60);
    } catch (err) {
      const msg = err?.message || "Registration failed.";
      if (msg.toLowerCase().includes("failed to fetch")) {
        showError(
          "registerError",
          `Could not reach the API. Start the backend with "npm start" and open the site at ${DEFAULT_API_ORIGIN}/index.html`
        );
      } else {
        showError("registerError", msg);
      }
    } finally {
      setButtonLoading("registerSubmit", false, "Creating account...", "Register");
    }
  });
}

function wireLogout() {
  const logout = $("navLogout");
  if (!logout) return;
  logout.addEventListener("click", () => {
    clearAuth();
    setNavState();
    setRequestsPanelMeta("Your Requests", "Login as a buyer to track requested deals");
    renderRequests();
    showHome();
    if (requestRefreshTimer) {
      clearInterval(requestRefreshTimer);
      requestRefreshTimer = null;
    }
  });
}

function resetPostItemForm() {
  editingProductId = "";
  $("postItemForm")?.reset();
  if ($("postItemModalTitle")) $("postItemModalTitle").textContent = "Post an Item (Seller)";
  setButtonLoading("postItemSubmit", false, "Saving...", "Post Item");
  showError("postItemError", "");
  showError("postItemSuccess", "");
}

function openPostItemEditor(product) {
  editingProductId = product?._id || "";
  if ($("postItemModalTitle")) $("postItemModalTitle").textContent = "Edit Item (Seller)";
  if ($("itemName")) $("itemName").value = product?.name || "";
  if ($("itemPrice")) $("itemPrice").value = Number(product?.price || 0) || "";
  if ($("itemCategory")) $("itemCategory").value = product?.category || "Mobiles";
  if ($("itemImage")) $("itemImage").value = String(product?.image || "").replace("/static/assets/", "");
  if ($("itemDescription")) $("itemDescription").value = product?.description || "";
  showError("postItemError", "");
  showError("postItemSuccess", "");
  window.location.hash = "post-modal";
}

function wirePostItemForm() {
  const form = $("postItemForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("postItemError", "");
    showError("postItemSuccess", "");

    const auth = getAuth();
    if (!auth?.token) {
      showError("postItemError", "Please login first.");
      return;
    }
    if (auth?.user?.role !== "seller") {
      showError("postItemError", "Only seller accounts can post items.");
      return;
    }

    const payload = {
      name: $("itemName")?.value?.trim() || "",
      price: Number($("itemPrice")?.value || 0),
      category: $("itemCategory")?.value || "",
      image: normalizeAssetImagePath($("itemImage")?.value, $("itemCategory")?.value || ""),
      description: $("itemDescription")?.value?.trim() || "",
      sellerId: auth.user.id,
      sellerName: auth.user.name,
    };

    if (!payload.name || !payload.category || !payload.price) {
      showError("postItemError", "Name, price and category are required.");
      return;
    }
    if (!payload.image) {
      showError("postItemError", 'Use an image from the assets folder, like "/static/assets/iphone15.jpg" or "iphone15.jpg".');
      return;
    }

    try {
      const isEditing = Boolean(editingProductId);
      setButtonLoading("postItemSubmit", true, isEditing ? "Saving..." : "Posting item...", isEditing ? "Save Changes" : "Post Item");
      let nextProduct;

      if (isEditing) {
        nextProduct = updateEditableProduct(editingProductId, payload);
        if (!nextProduct) throw new Error("Could not update item.");
        PRODUCT_CACHE = PRODUCT_CACHE.map((product) => (
          product._id === editingProductId ? nextProduct : product
        ));
      } else {
        const result = await createProduct(payload, auth.token);
        nextProduct = result.product;
        PRODUCT_CACHE = [nextProduct, ...PRODUCT_CACHE];
      }

      CATEGORY_DATA = buildCategoryData(PRODUCT_CACHE);
      applyFilters(nextProduct.category, { skipLoader: true });
      showError("postItemSuccess", isEditing ? "Item updated successfully." : "Item posted successfully.");
      resetPostItemForm();
      setTimeout(closeModal, 500);
    } catch (err) {
      const msg = err?.message || "Could not post item.";
      if (msg.toLowerCase().includes("failed to fetch")) {
        showError(
          "postItemError",
          `Could not reach the API. Start backend with "npm start" and open ${DEFAULT_API_ORIGIN}/index.html`
        );
      } else {
        showError("postItemError", msg);
      }
    } finally {
      const isEditing = Boolean(editingProductId);
      setButtonLoading("postItemSubmit", false, isEditing ? "Saving..." : "Posting item...", isEditing ? "Save Changes" : "Post Item");
    }
  });
}

function showCardFeedback(btn, message, isError) {
  // Find or create a feedback element inside the card actions
  const actions = btn.closest(".card__actions");
  if (!actions) return;
  let fb = actions.querySelector(".card__feedback");
  if (!fb) {
    fb = document.createElement("p");
    fb.className = "card__feedback";
    fb.setAttribute("aria-live", "polite");
    actions.appendChild(fb);
  }
  if (!message) {
    fb.hidden = true;
    fb.textContent = "";
    return;
  }
  fb.hidden = false;
  fb.textContent = message;
  fb.className = "card__feedback " + (isError ? "form-error" : "form-success");
}

function wirePostItemTriggers() {
  const triggers = Array.from(document.querySelectorAll('a[href="#post-modal"]'));
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      resetPostItemForm();
    });
  });
}

function wireRequestDealActions() {
  const grid = $("content");
  if (!grid) return;

  grid.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".item-edit-btn");
    if (editBtn) {
      e.preventDefault();
      const productId = editBtn.dataset.productId || "";
      const product = PRODUCT_CACHE.find((item) => String(item?._id) === String(productId));
      if (!product || !canSellerManageProducts()) {
        showCardFeedback(editBtn, "Only seller accounts can edit items.", true);
        return;
      }
      openPostItemEditor(product);
      return;
    }

    const deleteBtn = e.target.closest(".item-delete-btn");
    if (deleteBtn) {
      e.preventDefault();
      const productId = deleteBtn.dataset.productId || "";
      const product = PRODUCT_CACHE.find((item) => String(item?._id) === String(productId));
      if (!product || !canSellerManageProducts()) {
        showCardFeedback(deleteBtn, "Only seller accounts can delete items.", true);
        return;
      }
      deleteEditableProduct(productId);
      PRODUCT_CACHE = PRODUCT_CACHE.filter((item) => String(item?._id) !== String(productId));
      CATEGORY_DATA = buildCategoryData(PRODUCT_CACHE);
      applyFilters(activeCategory, { skipLoader: true });
      setRequestDealMessage("Item deleted successfully.", false);
      return;
    }

    const btn = e.target.closest(".request-deal-btn");
    if (!btn) return;
    e.preventDefault();

    // Reset any previous inline feedback on this card
    showCardFeedback(btn, "", false);
    setRequestDealMessage("", false);

    const auth = getAuth();
    if (!auth?.token) {
      showCardFeedback(btn, "Please login as a buyer to request a deal.", true);
      window.location.hash = "login-modal";
      return;
    }
    if (auth?.user?.role !== "buyer") {
      showCardFeedback(btn, "Only buyer accounts can request deals.", true);
      return;
    }

    const productId = btn.dataset.productId || "";
    if (!productId) {
      showCardFeedback(btn, "Item not synced with backend. Reload once API is running.", true);
      return;
    }
    const card = btn.closest(".card");
    $("dealProductId").value = productId;
    $("dealProductTitle").textContent = card?.querySelector(".card__title")?.textContent || "Selected item";
    const cardPrice = Number(card?.querySelector(".card__price")?.dataset?.price || 0);
    $("dealOfferedPrice").value = cardPrice || "";
    currentDealProduct = {
      id: productId,
      itemName: card?.querySelector(".card__title")?.textContent || "Requested item",
      category: card?.querySelector(".tag")?.textContent || "General",
      image: card?.querySelector(".card__img")?.getAttribute("src") || "",
      price: cardPrice,
    };
    $("dealMessage").value = "";
    $("dealBuyerName").value = auth.user.name || "";
    $("dealBuyerPhone").value = "";
    $("dealBuyerAddress").value = "";
    $("dealBuyerCity").value = "";
    $("dealBuyerPincode").value = "";
    showError("dealError", "");
    window.location.hash = "deal-modal";
  });
}

function wireDealForm() {
  const form = $("dealForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("dealError", "");

    const auth = getAuth();
    if (!auth?.token || auth?.user?.role !== "buyer") {
      showError("dealError", "Only logged-in buyers can send requests.");
      return;
    }

    const payload = {
      productId: $("dealProductId")?.value || "",
      offeredPrice: Number($("dealOfferedPrice")?.value || 0),
      paymentMethod: $("dealPaymentMethod")?.value || "",
      message: $("dealMessage")?.value?.trim() || "",
      deliveryName: $("dealBuyerName")?.value?.trim() || "",
      deliveryPhone: $("dealBuyerPhone")?.value?.trim() || "",
      deliveryAddress: $("dealBuyerAddress")?.value?.trim() || "",
      deliveryCity: $("dealBuyerCity")?.value?.trim() || "",
      deliveryPincode: $("dealBuyerPincode")?.value?.trim() || "",
    };

    if (!payload.productId || !payload.offeredPrice || !payload.paymentMethod || !payload.deliveryName || !payload.deliveryPhone || !payload.deliveryAddress || !payload.deliveryCity || !payload.deliveryPincode) {
      showError("dealError", "Please fill in price, payment method, and all delivery details.");
      return;
    }

    if (!/^\d{10}$/.test(payload.deliveryPhone.replace(/\D/g, ""))) {
      showError("dealError", "Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(payload.deliveryPincode)) {
      showError("dealError", "Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      setButtonLoading("dealSubmit", true, "Sending request...", "Send Request");
      addRequest({
        buyerId: auth.user.id,
        buyerName: auth.user.name,
        buyerEmail: auth.user.email,
        productId: currentDealProduct?.id || payload.productId,
        itemName: currentDealProduct?.itemName || "Requested item",
        category: currentDealProduct?.category || "General",
        image: currentDealProduct?.image || getFallbackImage(currentDealProduct?.category),
        price: currentDealProduct?.price || payload.offeredPrice,
        offeredPrice: payload.offeredPrice,
        paymentMethod: payload.paymentMethod,
        message: payload.message,
        deliveryName: payload.deliveryName,
        deliveryPhone: payload.deliveryPhone,
        deliveryAddress: payload.deliveryAddress,
        deliveryCity: payload.deliveryCity,
        deliveryPincode: payload.deliveryPincode,
      });
      closeModal();
      setRequestDealMessage("Request sent with payment and buyer details.", false);
      renderRequests();
    } catch (err) {
      const msg = err?.message || "Could not send request.";
      showError("dealError", msg);
    } finally {
      setButtonLoading("dealSubmit", false, "Sending request...", "Send Request");
    }
  });
}

async function loadRequestsByRole() {
  renderRequests();
}

function startRequestAutoRefresh() {
  if (requestRefreshTimer) clearInterval(requestRefreshTimer);
  requestRefreshTimer = setInterval(() => {
    loadRequestsByRole();
  }, 7000);
}

async function loadProductsOnStart() {
  const products = await fetchProducts();
  PRODUCT_CACHE = products;
  CATEGORY_DATA = buildCategoryData(products);
  updateHomeMetrics();
  clearContent();
  showPlaceholder();
}

document.addEventListener("DOMContentLoaded", () => {
  setNavState();
  populateItemImageOptions();
  wireLoginForm();
  wireRegisterForm();
  wireLogout();
  wireRequestsButton();
  wirePostItemForm();
  wirePostItemTriggers();
  wireRequestDealActions();
  wireDealForm();
  wireRequestStatusActions();
  wireCategoryButtons();
  wireFilterForm();
  wireHomeButton();
  wireSearchForm();
  wireFooterLinks();
  loadProductsOnStart();
  loadRequestsByRole();
  startRequestAutoRefresh();
});


/* ── Device Comparison ──────────────────────────────── */

// Each device has a unique real image URL + full specs

const DEVICE_SPECS = [
  {
    id: "iphone13",
    name: "iPhone 13 (128GB)",
    category: "Mobiles",
    price: 42999,
    imgSrc: "/static/assets/iphone13.jpg",
    specs: { "Display": "6.1\" Super Retina XDR OLED", "Processor": "Apple A15 Bionic", "RAM": "4 GB", "Storage": "128 GB", "Rear Camera": "12 MP + 12 MP (dual)", "Front Camera": "12 MP", "Battery": "3227 mAh", "OS": "iOS 15", "5G": "Yes", "Weight": "174 g" },
  },
  {
    id: "samsung-s21",
    name: "Samsung Galaxy S21 (8/128GB)",
    category: "Mobiles",
    price: 39999,
    imgSrc: "/static/assets/samsung.jpg",
    specs: { "Display": "6.2\" Dynamic AMOLED 2X", "Processor": "Exynos 2100", "RAM": "8 GB", "Storage": "128 GB", "Rear Camera": "12 MP + 64 MP + 12 MP", "Front Camera": "10 MP", "Battery": "4000 mAh", "OS": "Android 11", "5G": "Yes", "Weight": "169 g" },
  },
  {
    id: "oneplus9",
    name: "OnePlus 9 (8/128GB)",
    category: "Mobiles",
    price: 36999,
    imgSrc: "/static/assets/oneplus9.jpg",
    specs: { "Display": "6.55\" Fluid AMOLED 120Hz", "Processor": "Snapdragon 888", "RAM": "8 GB", "Storage": "128 GB", "Rear Camera": "48 MP + 50 MP + 2 MP", "Front Camera": "16 MP", "Battery": "4500 mAh", "OS": "Android 11 (OxygenOS)", "5G": "Yes", "Weight": "192 g" },
  },
  {
    id: "pixel7",
    name: "Google Pixel 7 (8/128GB)",
    category: "Mobiles",
    price: 44999,
    imgSrc: "/static/assets/pixel7.jpg",
    specs: { "Display": "6.3\" OLED 90Hz", "Processor": "Google Tensor G2", "RAM": "8 GB", "Storage": "128 GB", "Rear Camera": "50 MP + 12 MP", "Front Camera": "10.8 MP", "Battery": "4355 mAh", "OS": "Android 13", "5G": "Yes", "Weight": "197 g" },
  },
  {
    id: "macbook-air-m1",
    name: "MacBook Air M1 (8GB/256GB)",
    category: "Electronics",
    price: 79900,
    imgSrc: "/static/assets/mackbook.jpg",
    specs: { "Display": "13.3\" IPS Retina 2560×1600", "Processor": "Apple M1 (8-core)", "RAM": "8 GB Unified", "Storage": "256 GB SSD", "GPU": "7-core GPU", "Battery": "Up to 18 hrs", "OS": "macOS", "Weight": "1.29 kg", "Ports": "2× USB-C Thunderbolt" },
  },
  {
    id: "dell-xps15",
    name: "Dell XPS 15 (i7/16GB/512GB)",
    category: "Electronics",
    price: 149900,
    imgSrc: "/static/assets/dell.jpg",
    specs: { "Display": "15.6\" OLED 3.5K 60Hz", "Processor": "Intel Core i7-12700H", "RAM": "16 GB DDR5", "Storage": "512 GB NVMe SSD", "GPU": "NVIDIA RTX 3050 Ti", "Battery": "Up to 12 hrs", "OS": "Windows 11", "Weight": "1.86 kg", "Ports": "2× Thunderbolt 4, USB-A" },
  },
  {
    id: "sony-wh1000xm5",
    name: "Sony WH-1000XM5 Headphones",
    category: "Electronics",
    price: 29990,
    image: "./assets/sony.jpg",
    specs: { "Type": "Over-ear Wireless", "ANC": "Yes (industry-leading)", "Driver": "30 mm", "Battery Life": "30 hrs (ANC on)", "Charging": "USB-C", "Bluetooth": "5.2", "Codecs": "LDAC, AAC, SBC", "Weight": "250 g" },
  },
];

const COMPARE_PLACEHOLDER = "/static/assets/iphone13.jpg";
const HIGHER_IS_BETTER = new Set(["RAM", "Storage", "Battery", "Front Camera", "Rear Camera", "Battery Life"]);
const LOWER_IS_BETTER  = new Set(["Weight"]);

function extractNumber(str) {
  const m = String(str || "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

function populateCompareSelects() {
  const selA = $("compareDeviceA"), selB = $("compareDeviceB");
  if (!selA || !selB) return;
  selA.innerHTML = `<option value="">— Select device —</option>`;
  selB.innerHTML = `<option value="">— Select device —</option>`;
  DEVICE_SPECS.forEach((d) => {
    selA.add(new Option(`${d.name}  (${d.category})`, d.id));
    selB.add(new Option(`${d.name}  (${d.category})`, d.id));
  });
  if (DEVICE_SPECS.length >= 2) {
    selA.value = DEVICE_SPECS[0].id;
    selB.value = DEVICE_SPECS[1].id;
  }
}

// Render one image card into a given element
function renderCompareCard(el, device, side) {
  if (!el) return;
  const imgSrc = device.imgSrc || device.image || COMPARE_PLACEHOLDER;
  el.innerHTML = `
    <div class="compare__card__img-wrap">
      <img
        src="${imgSrc}"
        alt="${escapeHtml(device.name)}"
        loading="lazy"
        onerror="console.log('Image failed')"
      />
    </div>
    <div class="compare__card__body">
      <div class="compare__card__cat">${escapeHtml(device.category)} · Device ${escapeHtml(side)}</div>
      <div class="compare__card__name">${escapeHtml(device.name)}</div>
      <div class="compare__card__price">₹ ${device.price.toLocaleString("en-IN")}</div>
    </div>
  `;
}

function buildCompareRow(label, valA, valB) {
  let classB = "compare__td", classC = "compare__td", badgeA = "", badgeB = "";
  const numA = extractNumber(valA), numB = extractNumber(valB);
  if (numA !== null && numB !== null && numA !== numB) {
    const isPrice = label === "Price (₹)";
    let aWins = isPrice ? numA < numB : HIGHER_IS_BETTER.has(label) ? numA > numB : LOWER_IS_BETTER.has(label) ? numA < numB : false;
    let bWins = isPrice ? numB < numA : HIGHER_IS_BETTER.has(label) ? numB > numA : LOWER_IS_BETTER.has(label) ? numB < numA : false;
    if (aWins) { classB += " compare__td--win"; badgeA = `<span class="compare__badge">✓ Better</span>`; }
    else if (bWins) { classC += " compare__td--win-b"; badgeB = `<span class="compare__badge compare__badge--b">✓ Better</span>`; }
  }
  return `<tr>
    <td class="compare__td compare__td--spec">${escapeHtml(label)}</td>
    <td class="${classB}">${escapeHtml(valA)}${badgeA}</td>
    <td class="${classC}">${escapeHtml(valB)}${badgeB}</td>
  </tr>`;
}

// Main comparison renderer — called with two device objects
function renderComparison(devA, devB) {
  // Render image cards
  renderCompareCard($("compareCardA"), devA, "A");
  renderCompareCard($("compareCardB"), devB, "B");
  const cardsEl = $("compareCards");
  if (cardsEl) cardsEl.hidden = false;

  // Table header labels
  const labelA = $("compareLabelA"), labelB = $("compareLabelB");
  if (labelA) labelA.textContent = devA.name;
  if (labelB) labelB.textContent = devB.name;

  // Build spec rows
  const allKeys = Array.from(new Set([...Object.keys(devA.specs), ...Object.keys(devB.specs)]));
  const tbody = $("compareTableBody");
  if (tbody) {
    tbody.innerHTML = [
      buildCompareRow("Price (₹)", `₹ ${devA.price.toLocaleString("en-IN")}`, `₹ ${devB.price.toLocaleString("en-IN")}`),
      ...allKeys.map((k) => buildCompareRow(k, devA.specs[k] || "—", devB.specs[k] || "—")),
    ].join("");
  }

  // Affordability note
  const note = $("compareNote");
  if (note) note.textContent = `💡 ${devA.price <= devB.price ? devA.name : devB.name} is the more affordable option.`;

  // Show result table
  const resultEl = $("compareResult");
  if (resultEl) resultEl.hidden = false;
}

function runComparison() {
  const idA = $("compareDeviceA")?.value;
  const idB = $("compareDeviceB")?.value;

  showError("compareError", "");
  const cardsEl = $("compareCards");
  if (cardsEl) cardsEl.hidden = true;
  const resultEl = $("compareResult");
  if (resultEl) resultEl.hidden = true;

  if (!idA || !idB) { showError("compareError", "Please select both devices."); return; }
  if (idA === idB)  { showError("compareError", "Please select two different devices."); return; }

  const devA = DEVICE_SPECS.find((d) => d.id === idA);
  const devB = DEVICE_SPECS.find((d) => d.id === idB);
  if (!devA || !devB) { showError("compareError", "Device data not found."); return; }

  renderComparison(devA, devB);
}

function wireCompareModal() {
  populateCompareSelects();
  const btn = $("compareBtn");
  if (btn) btn.addEventListener("click", runComparison);
}

document.addEventListener("DOMContentLoaded", () => {
  wireCompareModal();
});

















