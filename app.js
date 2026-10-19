const sb=supabase.createClient(NIGAR_CONFIG.SUPABASE_URL,NIGAR_CONFIG.SUPABASE_PUBLISHABLE_KEY);
let products=[],cart=JSON.parse(localStorage.getItem("nigar_cart")||"[]");
const money=n=>Number(n||0).toLocaleString("en-US")+" افغانی";
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function saveCart(){localStorage.setItem("nigar_cart",JSON.stringify(cart));updateCart()}
function updateCart(){const e=document.getElementById("cartCount");if(e)e.textContent=cart.reduce((s,x)=>s+x.qty,0)}
async function loadProducts(){
  const {data,error}=await sb.from("products").select("*").eq("active",true).order("created_at",{ascending:false});
  if(error){console.error(error);document.getElementById("productGrid").innerHTML="<p>د محصولاتو د لوستلو ستونزه رامنځته شوه. Supabase تنظیمات وګورئ.</p>";return}
  products=data||[]; renderProducts();
}
function renderProducts(){
  const f=document.getElementById("filter"),qel=document.getElementById("search"); if(!f)return;
  const cats=[...new Set(products.map(p=>p.category).filter(Boolean))],sel=f.value;
  f.innerHTML='<option value="">ټولې کټګورۍ</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
  f.value=cats.includes(sel)?sel:"";
  const q=(qel.value||"").toLowerCase(),c=f.value;
  document.getElementById("categoryGrid").innerHTML=cats.map(cat=>`<div class="cat" onclick="chooseCategory('${esc(cat)}')">📚<b>${esc(cat)}</b><small>${products.filter(p=>p.category===cat).length} محصولات</small></div>`).join("");
  const list=products.filter(p=>(!c||p.category===c)&&(!q||(`${p.name} ${p.description||""}`).toLowerCase().includes(q)));
  document.getElementById("productGrid").innerHTML=list.length?list.map(p=>`<article class="product"><div class="pic">${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}">`:"📦"}</div><div class="body"><small>${esc(p.category||"قرطاسیه")}</small><h3>${esc(p.name)}</h3><div class="price">${money(p.price)}</div><p>${esc(p.description||"")}</p><small>موجودي: ${Number(p.stock||0)}</small><div class="actions"><button onclick="showDetail('${p.id}')">جزئیات</button><button class="primary" ${Number(p.stock)<=0?"disabled":""} onclick="addToCart('${p.id}')">کارټ ته</button></div></div></article>`).join(""):"<p>محصول پیدا نه شو.</p>";
  updateCart();
}
function chooseCategory(c){document.getElementById("filter").value=c;renderProducts();document.getElementById("products").scrollIntoView({behavior:"smooth"})}
function showDetail(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;document.getElementById("detail").innerHTML=`<div class="pic">${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}">`:"📦"}</div><h2>${esc(p.name)}</h2><p>${esc(p.description||"")}</p><p>موجودي: ${Number(p.stock||0)}</p><h3 class="price">${money(p.price)}</h3><button class="primary wide" ${Number(p.stock)<=0?"disabled":""} onclick="addToCart('${p.id}');closeDetail()">کارټ ته اضافه کړئ</button>`;document.getElementById("detailModal").classList.remove("hidden")}
function closeDetail(){document.getElementById("detailModal").classList.add("hidden")}
function addToCart(id){const p=products.find(x=>String(x.id)===String(id));if(!p||Number(p.stock)<=0)return;let item=cart.find(x=>String(x.id)===String(id));if(item){if(item.qty>=Number(p.stock))return;item.qty++}else cart.push({...p,qty:1});saveCart();openCart()}
function openCart(){const e=document.getElementById("cartItems");e.innerHTML=cart.length?cart.map((p,i)=>`<div class="cartrow"><div class="grow"><b>${esc(p.name)}</b><br>${money(p.price)} × ${p.qty}</div><button onclick="changeQty(${i},-1)">−</button><b>${p.qty}</b><button onclick="changeQty(${i},1)">+</button><button onclick="changeQty(${i},-999)">🗑️</button></div>`).join(""):"کارټ خالي دی.";document.getElementById("cartTotal").textContent="ټول: "+money(cart.reduce((s,p)=>s+Number(p.price)*p.qty,0));document.getElementById("checkoutLink").style.display=cart.length?"block":"none";document.getElementById("cartModal").classList.remove("hidden")}
function closeCart(){document.getElementById("cartModal").classList.add("hidden")}
function changeQty(i,n){const p=cart[i];if(!p)return;if(n>0&&p.qty>=Number(p.stock))return;p.qty+=n;if(p.qty<=0)cart.splice(i,1);saveCart();openCart()}
document.getElementById("year").textContent=new Date().getFullYear();
loadProducts();
