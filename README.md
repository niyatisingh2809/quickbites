<h1 align="center">⚡ QuickBites — Instant 10-Minute Food Delivery Platform</h1>

<p align="center">
  <b>A modern, full-stack Quick-Commerce food delivery web application inspired by Zepto, Swiggy, and Blinkit.</b><br/>
  Featuring real-time GPS live tracking, a high-fidelity multi-method payment gateway with 3D-Secure OTP & dynamic UPI QR codes, 120+ dishes across 12 categories, and an interactive admin dashboard.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E"/>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img alt="Express.js" src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white"/>
  <img alt="MongoDB Atlas" src="https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white"/>
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>
  <img alt="Render" src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black"/>
</p>

---

## 🌟 Key Highlights & Features

### 1. 🗺️ Zepto-Style Real-Time GPS Order Tracking
* **Live 10-Minute Countdown Clock**: Ticking countdown (`⏱ 09:48`) with dynamic arrival calculation.
* **Realistic City Delivery Map**: Shows route from **QuickBites Dark Store / Kitchen (Sector 18 Cloud Hub)** to the customer's delivery doorstep.
* **Animated Rider with Radar Pulse**: Dynamic moving scooter (`🛵`) tracking rider distance (e.g. `1.2 km away`) with visual radar wave ping.
* **Delivery Partner Profile**: Shows assigned rider details (*Amit Verma • ★ 4.96 • 1,420 deliveries • 🛡️ Vaccinated*), vehicle info (*Hero Electric Optima*), with functional **Call Partner** and **Delivery Note** actions.
* **4-Step Zepto Progress Tracker**: `Order Placed` ➔ `Packed at Store` ➔ `On the Way` ➔ `Delivered` with live background synchronization.
* **Interactive Status Simulator**: Test status transitions live directly from the page to MongoDB Atlas without having to switch tabs.

---

### 2. 💳 Genuine Real-Time Multi-Method Payment Gateway
* **🔒 Verified Merchant Security Banner**: NPCI / 256-Bit SSL Encrypted branding (`QuickBites Food Logistics Pvt Ltd`).
* **📱 Dynamic Live UPI & QR Code**:
  * Real dynamic animated QR code with laser scanner line animation.
  * Live 3-minute QR expiry countdown timer (`⏱ Expires in 02:49`).
  * 1-Click direct UPI app payments: **Google Pay**, **PhonePe**, **Paytm UPI**, and custom UPI ID validation.
* **💳 Debit / Credit Cards with 3D Secure Bank OTP**:
  * Live 3D credit card preview that reflects user input (auto-detects Visa, Mastercard, and RuPay).
  * Realistic Bank 3D Secure OTP verification modal with 30-second ticking timer and **⚡ Auto-Fill Test OTP (742918)** button.
* **🏦 Net Banking**: Instant simulated gateway integration with all major Indian banks (*HDFC, SBI, ICICI, Axis, Kotak, PNB*).
* **💵 Cash on Delivery (COD)**: Contactless delivery confirmation option.
* **🎉 Authentic Audio-Visual Success Celebration**:
  * Dual-tone payment success chime (*ding!*) synthesized via Web Audio API (just like GPay / Paytm Soundbox).
  * Animated green checkmark with celebratory pulse.
  * Real-time generated **Transaction ID** (e.g. `TXN-UPI-9842109281-DEMO`) and **Bank UTR reference**.
  * Automatic smooth redirect to the live Zepto tracking screen in 2 seconds.

---

### 3. 🍱 Rich Catalog & High-Converting Modern UI
* **12 Curated Categories**: Salad, Rolls, Desserts, Sandwich, Cake, Pure Veg, Pasta, Noodles, South Indian, Coffee, Shakes, Juice.
* **120+ Delicious Items**: Each dish has an individual unique price (₹100+) and distinct authentic customer rating (★ 4.3 - ★ 4.9).
* **Two-Column Hero Section**:
  * Live express delivery badge (`⚡ 10-Minute Express Delivery • Noida & Delhi NCR`).
  * High-impact sunset gradient typography: *"Crave it. Order it. Delivered in 10 Mins!"*.
  * Embedded Hero search bar with instant dish finder.
  * Popular category chips (`🌯 Rolls`, `☕ Coffee`, `🥘 South Indian`, `🥗 Veg Meals`, `🍝 Pasta`).
  * 3D Floating glassmorphic offer badges (`🔥 FLAT 50% OFF | QUICK50`, `🛵 Live Rider Tracking`).
* **Category Filters & Sorting**:
  * Quick `🟢 Pure Veg` toggle.
  * `⭐ 4.6+ Rated` favorites toggle.
  * Dynamic sort dropdown (*Price: Low to High, Price: High to Low, Top Rated*).
* **Smart Food Item Cards**:
  * Official FSSAI Veg (green dot) & Non-Veg (red triangle) symbols.
  * Prep time pill (`⏱️ 15-20m`) and `⭐ Bestseller` stamp.
  * Strike-through MRP with visible green savings tag (`SAVE ₹50`).
  * Responsive `+ ADD` button that smoothly expands into an interactive quantity stepper (`−` `1` `+`).

---

### 4. 🛠️ Robust Full-Stack Architecture
* **Frontend**: React 18, Vite, React Router v6, Context API, CSS3 Modules & Micro-animations.
* **Backend**: Node.js (ES Modules), Express.js, MongoDB Atlas (Mongoose), Socket.IO for real-time admin sync, JWT & Bcrypt authentication.
* **Admin Dashboard**: Manage food items, track all customer orders, and dispatch deliveries live with audio alerts.

---

## 🚀 Live Deployment Guide

### 🟢 1. Deploy Backend on Render (Free)
1. Go to **[Render Dashboard](https://dashboard.render.com)** and sign in with GitHub.
2. Click **New +** ➔ **Web Service**.
3. Select your repository: `niyatisingh2809/quickbites`.
4. Configure the service:
   * **Name**: `quickbites-backend`
   * **Root Directory**: `Backend` *(⚠️ Important)*
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
   * **Instance Type**: `Free`
5. In **Environment Variables**, add:
   * `PORT`: `10000`
   * `NODE_ENV`: `production`
   * `MONGO_URI`: `mongodb+srv://greatstack:186312@cluster0.ovanjzw.mongodb.net/food-del?retryWrites=true&w=majority&appName=Cluster0`
   * `JWT_SECRET`: `super_secret_jwt_key_food_del_2026`
   * `CLIENT_URL`: `https://your-frontend-app.vercel.app` *(or `*`)*
6. Click **Deploy Web Service** and copy your generated live URL (e.g. `https://quickbites-backend.onrender.com`).

---

### ⚡ 2. Deploy Frontend on Vercel (Free)
1. Go to **[Vercel New Project](https://vercel.com/new)** and sign in with GitHub.
2. Click **Import** next to `quickbites`.
3. In **Configure Project**:
   * **Root Directory**: Click *Edit* and select the `Frontend` folder.
   * **Framework Preset**: `Vite` *(auto-detected)*.
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. In **Environment Variables**, add:
   * **Key**: `VITE_BACKEND_URL`
   * **Value**: Your Render live URL (e.g. `https://quickbites-backend.onrender.com`)
5. Click **Deploy**!
   *(SPA routing is pre-configured in `Frontend/vercel.json` so all routes like `/track/:orderId` work seamlessly without 404 errors).*

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/niyatisingh2809/quickbites.git
cd quickbites
```

### 2. Start Backend Server
```bash
cd Backend
npm install
npm run server
# Backend runs on http://localhost:4000
```

### 3. Start Frontend Client
```bash
cd ../Frontend
npm install
npm run dev -- --port 5173
# Frontend runs on http://localhost:5173
```

### 4. Start Admin Dashboard (Optional)
```bash
cd ../Admin
npm install
npm run dev -- --port 5174
# Admin runs on http://localhost:5174
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/user/register` | Register new customer account |
| `POST` | `/api/user/login` | Authenticate customer and issue JWT token |
| `GET` | `/api/food/list` | Retrieve all 120+ dishes with categories & prices |
| `POST` | `/api/cart/get` | Fetch customer's current cart items |
| `POST` | `/api/cart/add` | Add dish to cart |
| `POST` | `/api/cart/remove` | Decrement dish from cart |
| `POST` | `/api/order/placecod` | Place direct payment order (GPay, Paytm, Cards, COD) |
| `GET` | `/api/order/track/:orderId` | Real-time GPS order tracking data |
| `POST` | `/api/order/status` | Update delivery step (In Kitchen ➔ Out for delivery ➔ Delivered) |
| `POST` | `/api/order/userorders` | Fetch logged-in customer's order history |

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
Crafted with ❤️ by **[Niyati Singh](https://github.com/niyatisingh2809)**.
