# NIGAR Shopping — Production Upload Ready

دا نسخه د NIGAR Shopping لپاره د حقیقي Supabase اتصال، Admin Login، Products CRUD، Storage عکسونو، Cart، Checkout، Orders او Admin Order Management لري.

## 1) Supabase
په Supabase SQL Editor کې `database.sql` بشپړ Run کړئ.

بیا:
- Authentication → Users کې Admin user جوړ کړئ.
- د هغه User UUID واخلئ.
- په SQL Editor کې دا اجرا کړئ:
  `update public.profiles set role='admin' where id='YOUR-ADMIN-USER-UUID';`

## 2) Frontend
`config.js` کې یوازې Project URL او Publishable key دي. Service/Secret key هېڅکله مه اچوئ.

## 3) Pages
- `index.html` — Shop
- `admin.html` — Admin Login + Products + Orders
- `checkout.html` — Checkout / Order
- `styles.css` — Design
- `app.js` — Shop logic
- `database.sql` — Supabase schema/RLS/Storage

## 4) Netlify
د همدې فولډر ټول فایلونه Upload کړئ، نه یوازې یو HTML فایل.

## Security
- Products write access یوازې Admin ته.
- Orders read/update یوازې Admin ته.
- Customer کولای شي Order insert کړي، خو موجود Orders نه شي لوستلای.
- Product images public read دي، خو upload/update/delete یوازې Admin ته.
- Service role/secret key په frontend کې نشته.
