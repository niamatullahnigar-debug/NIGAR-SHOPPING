const sb = supabase.createClient(
NIGAR_CONFIG.SUPABASE_URL,
NIGAR_CONFIG.SUPABASE_PUBLISHABLE_KEY
);

let products = [];
let cart = [];

try {
cart = JSON.parse(localStorage.getItem(“nigar_cart”) || “[]”);
if (!Array.isArray(cart)) cart = [];
} catch {
cart = [];
}

const money = n =>
Number(n || 0).toLocaleString(“en-US”) + “ افغانی”;

const esc = s =>
String(s ?? “”).replace(/[&<>”’]/g, m => ({
“&”: “&”,
“<”: “<”,
“>”: “>”,
‘”’: “"”,
“’”: “'”
})[m]);

function saveCart() {
localStorage.setItem(“nigar_cart”, JSON.stringify(cart));
updateCart();
}

function updateCart() {
const e = document.getElementById(“cartCount”);
if (e) {
e.textContent = cart.reduce(
(sum, item) => sum + Number(item.qty || 0),
0
);
}
}

async function loadProducts() {
const grid = document.getElementById(“productGrid”);

if (!grid) {
console.error(“productGrid په index.html کې پیدا نه شو.”);
return;
}

grid.innerHTML = “محصولات لوډ کېږي…”;

try {
const { data, error } = await sb
.from(“products”)
.select(”*”)
.order(“created_at”, { ascending: false });

if (error) throw error;
products = Array.isArray(data) ? data : [];
renderProducts();

} catch (error) {
console.error(“د محصولاتو ستونزه:”, error);
grid.innerHTML =
“محصولات نه لوډ کېږي. د Supabase URL، Publishable Key او د products جدول اجازه وګورئ.”;
}
}

function renderProducts() {
const filter = document.getElementById(“filter”);
const search = document.getElementById(“search”);
const grid = document.getElementById(“productGrid”);
const categoryGrid = document.getElementById(“categoryGrid”);

if (!grid) return;

const categories = [
…new Set(products.map(p => p.category).filter(Boolean))
];

if (filter) {
const selected = filter.value;

filter.innerHTML =
  '<option value="">ټولې کټګورۍ</option>' +
  categories.map(c =>
    `<option value="${esc(c)}">${esc(c)}</option>`
  ).join("");
filter.value = categories.includes(selected) ? selected : "";

}

if (categoryGrid) {
categoryGrid.innerHTML = categories.map(category => <div class="cat" data-category="${esc(category)}"> 📚 <b>${esc(category)}</b> <small> ${products.filter(p => p.category === category).length} محصولات </small> </div>).join(””);

categoryGrid.querySelectorAll("[data-category]").forEach(el => {
  el.addEventListener("click", () => {
    chooseCategory(el.dataset.category);
  });
});

}

const query = (search?.value || “”).trim().toLowerCase();
const category = filter?.value || “”;

const list = products.filter(p => {
const text = ${p.name || ""} ${p.description || ""}.toLowerCase();

return (
  (!category || p.category === category) &&
  (!query || text.includes(query))
);

});

grid.innerHTML = list.length
? list.map(p => {
const id = esc(p.id);
const stock = Math.max(0, Number(p.stock || 0));

    return `
      <article class="product">
        <div class="pic">
          ${p.image_url
            ? `<img src="${esc(p.image_url)}"
                 alt="${esc(p.name)}"
                 loading="lazy"
                 onerror="this.style.display='none'">`
            : "📦"}
        </div>
        <div class="body">
          <small>${esc(p.category || "قرطاسیه")}</small>
          <h3>${esc(p.name)}</h3>
          <div class="price">${money(p.price)}</div>
          <p>${esc(p.description || "")}</p>
          <small>موجودي: ${stock}</small>
          <div class="actions">
            <button data-detail="${id}">جزئیات</button>
            <button class="primary"
              data-add="${id}"
              ${stock <= 0 ? "disabled" : ""}>
              کارټ ته
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("")
: "<p>محصول پیدا نه شو.</p>";

grid.querySelectorAll(”[data-detail]”).forEach(button => {
button.addEventListener(“click”, () => {
showDetail(button.dataset.detail);
});
});

grid.querySelectorAll(”[data-add]”).forEach(button => {
button.addEventListener(“click”, () => {
addToCart(button.dataset.add);
});
});

updateCart();
}

function chooseCategory(category) {
const filter = document.getElementById(“filter”);
if (!filter) return;

filter.value = category;
renderProducts();

document.getElementById(“products”)?.scrollIntoView({
behavior: “smooth”
});
}

function showDetail(id) {
const p = products.find(x => String(x.id) === String(id));
if (!p) return;

const detail = document.getElementById(“detail”);
const modal = document.getElementById(“detailModal”);

if (!detail || !modal) return;

detail.innerHTML = <div class="pic"> ${p.image_url ?`
: “📦”}
<h2>${esc(p.name)}</h2>
<p>${esc(p.description || "")}</p>
<p>موجودي: ${Math.max(0, Number(p.stock || 0))}</p>
<h3 class="price">${money(p.price)}</h3>
<button id="detailAddButton"
  class="primary wide"
  ${Number(p.stock || 0) <= 0 ? "disabled" : ""}>
  کارټ ته اضافه کړئ
</button>

`;

document.getElementById(“detailAddButton”)?.addEventListener(
“click”,
() => {
addToCart(id);
closeDetail();
}
);

modal.classList.remove(“hidden”);
}

function closeDetail() {
document.getElementById(“detailModal”)?.classList.add(“hidden”);
}

function addToCart(id) {
const p = products.find(x => String(x.id) === String(id));
if (!p || Number(p.stock || 0) <= 0) return;

const item = cart.find(x => String(x.id) === String(id));

if (item) {
if (item.qty >= Number(p.stock)) {
alert(“له موجودو محصولاتو زیات مقدار نشئ اخیستلای.”);
return;
}

item.qty++;

} else {
cart.push({ …p, qty: 1 });
}

saveCart();
openCart();
}

function openCart() {
const items = document.getElementById(“cartItems”);
const total = document.getElementById(“cartTotal”);
const checkout = document.getElementById(“checkoutLink”);
const modal = document.getElementById(“cartModal”);

if (!items || !total || !modal) return;

items.innerHTML = cart.length
? cart.map((p, i) => `
${esc(p.name)}
${money(p.price)} × ${Number(p.qty)}
      <button data-index="${i}" data-change="-1">−</button>
      <b>${Number(p.qty)}</b>
      <button data-index="${i}" data-change="1">+</button>
      <button data-index="${i}" data-change="remove">🗑️</button>
    </div>
  `).join("")
: "کارټ خالي دی.";

items.querySelectorAll(”[data-index]”).forEach(button => {
button.addEventListener(“click”, () => {
const index = Number(button.dataset.index);
const change = button.dataset.change;

  if (change === "remove") {
    cart.splice(index, 1);
  } else {
    changeQty(index, Number(change));
    return;
  }
  saveCart();
  openCart();
});

});

total.textContent = “ټول: “ + money(
cart.reduce(
(sum, p) => sum + Number(p.price || 0) * Number(p.qty || 0),
0
)
);

if (checkout) {
checkout.style.display = cart.length ? “block” : “none”;
}

modal.classList.remove(“hidden”);
}

function closeCart() {
document.getElementById(“cartModal”)?.classList.add(“hidden”);
}

function changeQty(index, amount) {
const item = cart[index];
if (!item) return;

if (amount > 0) {
const product = products.find(
p => String(p.id) === String(item.id)
);

const stock = Number(product?.stock ?? item.stock ?? 0);
if (item.qty >= stock) {
  alert("دا محصول په همدې اندازه موجود دی.");
  return;
}

}

item.qty += amount;

if (item.qty <= 0) {
cart.splice(index, 1);
}

saveCart();
openCart();
}

document.addEventListener(“DOMContentLoaded”, () => {
document.getElementById(“search”)?.addEventListener(
“input”,
renderProducts
);

document.getElementById(“filter”)?.addEventListener(
“change”,
renderProducts
);

document.getElementById(“cartButton”)?.addEventListener(
“click”,
openCart
);

document.getElementById(“closeCart”)?.addEventListener(
“click”,
closeCart
);

document.getElementById(“closeDetail”)?.addEventListener(
“click”,
closeDetail
);

updateCart();
loadProducts();
});
