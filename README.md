# 🍽️ Theresse Food Menu System

A full-stack food ordering web application for **Hinunangan, Southern Leyte** with React frontend and Node.js/Express backend, using Aiven PostgreSQL database, deployed on Render.

![Theresse Food Menu](public/images/hero-bg.jpg)

## 📍 Location
**Hinunangan, Southern Leyte, Philippines**

## 💱 Currency
**Philippine Peso (₱)**

---

## ✨ Features

### 👤 Customer Features
- **User Authentication** - Register and login with email/password
- **Browse Menu** - Categories: Meals, Drinks, Desserts, Sides
- **Search & Filter** - Find items quickly
- **Shopping Cart** - Add items, adjust quantities
- **E-Wallet** - Built-in wallet with top-up (₱100, ₱200, ₱500, ₱1000)
- **Payment Options** - E-Wallet or Cash on Delivery
- **Order Tracking** - Real-time status updates
- **Delivery** - Within Hinunangan barangays

### 🔐 Admin Features
- **Dashboard** - Revenue, orders, statistics
- **Menu Management** - Add, edit, delete items
- **Order Management** - Update order status
- **User Management** - View all users, manage roles

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Aiven) |
| Deployment | Render.com |
| Auth | JWT + bcrypt |

---

## 🚀 DEPLOYMENT GUIDE

### Step 1: Upload to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Theresse Food Menu System"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/theresse-food-menu.git
git branch -M main
git push -u origin main
```

---

### Step 2: Set Up Aiven PostgreSQL

1. **Create Account** at [console.aiven.io](https://console.aiven.io)
2. **Create PostgreSQL Service** (Free Plan)
3. **Copy Service URI** from Overview tab
4. **Run Schema** - Go to Query Editor, paste `server/schema.sql`, execute

---

### Step 3: Deploy to Render

1. Go to [render.com](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub repo

**Settings:**
| Field | Value |
|-------|-------|
| Name | `theresse-food-menu` |
| Build Command | `npm install && npm run build` |
| Start Command | `node server/index.js` |

**Environment Variables:**
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgres://...` (from Aiven) |
| `JWT_SECRET` | (generate random string) |

4. **Deploy!** 🚀

---

## 📁 Project Structure

```
theresse-food-menu/
├── server/                  # Node.js Backend
│   ├── index.js             # Express server
│   ├── db.js                # PostgreSQL connection
│   ├── schema.sql           # Database schema
│   └── routes/
│       ├── menu.js          # Menu CRUD
│       ├── orders.js        # Orders API
│       ├── users.js         # Auth + User management
│       └── wallet.js        # Wallet API
├── src/                     # React Frontend
│   ├── components/
│   ├── lib/api.ts           # API client
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── MenuPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── WalletPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminMenuPage.tsx
│   │   ├── AdminOrdersPage.tsx
│   │   └── AdminUsersPage.tsx
│   ├── App.tsx
│   └── store.tsx
├── .env.example
├── render.yaml
└── README.md
```

---

## 🧪 Local Development

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/theresse-food-menu.git
cd theresse-food-menu

# Install
npm install

# Setup env
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run database migrations
psql "$DATABASE_URL" -f server/schema.sql

# Start backend (Terminal 1)
node server/index.js

# Start frontend (Terminal 2)
npm run dev
```

---

## 🔧 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login |
| GET | `/api/users` | List all users (admin) |

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all items |
| POST | `/api/menu` | Add item (admin) |
| PUT | `/api/menu/:id` | Update item (admin) |
| DELETE | `/api/menu/:id` | Delete item (admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get orders |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id/status` | Update status |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/:userId` | Get balance |
| POST | `/api/wallet/:userId/topup` | Top up |
| POST | `/api/wallet/:userId/deduct` | Pay |

---

## 🏘️ Delivery Areas (Hinunangan Barangays)

- Poblacion
- Ambacon
- Bangon
- Cabuynan
- Calag-itan
- Canamucan
- Canap-acan
- Mag-aso
- Magtino
- Nahulid
- Otikon
- Panalaron
- San Vicente
- Tahusan
- Talisay
- Toptop
- Tugawe

---

## 💰 Pricing (Sample)

| Item | Price |
|------|-------|
| Grilled Chicken Platter | ₱259.00 |
| Classic Beef Burger | ₱199.00 |
| Pasta Pomodoro | ₱175.00 |
| Pork BBQ Platter | ₱189.00 |
| Mango Smoothie | ₱75.00 |
| Calamansi Juice | ₱45.00 |
| Delivery Fee | ₱50.00 |

---

## 📝 License

MIT License

---

Made with ❤️ for Hinunangan, Southern Leyte
