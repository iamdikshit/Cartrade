# 🚗 CarTrade — Production-Grade Car Buy & Sell Platform

A full-stack, production-ready car auction/trading platform built with **Next.js 14**, **MongoDB**, and **TypeScript**.

---

## ✨ Features

### Public Portal
- **Browse & search** cars with live filtering (make, fuel type, status, price)
- **Detailed auction reports** with 80+ inspection checkpoints
- **Color-coded condition indicators** — Green (OK), Yellow (Repaired), Red (Not OK)
- **Comprehensive sections**: Exterior, Engine, AC, Electrical, Steering, Brakes, Tyres, Lights
- **Document verification** — RC, Insurance, Road Tax, Hypothecation, Fitness
- **Rating system** — Exterior / Engine / AC / Electrical / Steering (out of 5)
- **Google Maps integration** — Car location with embedded map
- **Inquiry form** — Direct to admin email with anti-spam
- **Share car** — Native share API + clipboard fallback
- **Responsive design** — Mobile, tablet, and desktop optimized

### Admin Portal
- **JWT authentication** with access + refresh token rotation
- **Role-based access control** — Root, Admin, Employee
- **Account lockout** — 5 failed attempts → 2-hour lock
- **Root user** can create employee accounts with granular permissions
- **Welcome email** sent to new employees
- **Forced password change** on first login

#### Car Management
- Add / edit / delete cars
- Upload multiple images per category (Front, Back, Left, Right, Engine, Interior, Dashboard)
- Camera capture + gallery upload
- Set primary image (star icon)
- Detailed condition entry for every component
- Google Maps location picker with "Use My Location"
- Status management: Active → Hold → Sold

#### Inquiry Management
- View all inquiries with status filter
- Read/Replied/Closed workflow
- Reply directly from admin panel
- Open in mail client with pre-filled reply
- Email notifications on new inquiry

---

## 🛡️ Security Features

| Feature | Implementation |
|---|---|
| JWT Auth | Access token (15min) + Refresh token (7d) with rotation |
| Password hashing | bcrypt (12 rounds) |
| Account lockout | 5 failures → 2hr lock |
| Rate limiting | 10 auth req/15min, 100 API req/15min |
| File validation | MIME type + magic byte check |
| Input sanitization | Zod schema validation on all inputs |
| HTTP headers | CSP, X-Frame-Options, HSTS, XSS-Protection |
| Route protection | Middleware + API-level auth checks |
| Token reuse detection | Refresh token family revocation |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Maps API key (optional for maps)
- SMTP credentials (for email)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/car-trade.git
cd car-trade
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
MONGODB_URI=mongodb://localhost:27017/car-trade
JWT_SECRET=your-32-char-random-secret-here
JWT_REFRESH_SECRET=another-32-char-secret-here
ROOT_EMAIL=root@cartrade.com
ROOT_PASSWORD=YourSecurePassword123!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
ADMIN_INQUIRY_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Create Root Admin

```bash
npm run seed
```

Output:
```
🎉 Root admin created successfully!
📧 Email    : root@cartrade.com
🔑 Password : YourSecurePassword123!
```

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- **Public site**: http://localhost:3000
- **Admin portal**: http://localhost:3000/admin/login

---

## 📁 Project Structure

```
car-trade/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public pages
│   │   │   ├── page.tsx       # Homepage
│   │   │   └── cars/          # Car listings & detail
│   │   ├── admin/             # Admin portal
│   │   │   ├── login/         # Auth page
│   │   │   ├── dashboard/     # Stats overview
│   │   │   ├── cars/          # Car management
│   │   │   ├── inquiries/     # Inquiry management
│   │   │   ├── employees/     # Employee management (root only)
│   │   │   └── settings/      # Profile & password
│   │   └── api/               # API routes
│   │       ├── auth/          # login, logout, refresh, change-password
│   │       ├── cars/          # CRUD + public listing
│   │       ├── inquiry/       # Submit & manage inquiries
│   │       ├── upload/        # File upload handler
│   │       └── admin/         # employees, stats
│   ├── components/
│   │   ├── public/            # Navbar, CarCard, CarDetail, InquiryForm
│   │   └── admin/             # CarForm (comprehensive)
│   ├── hooks/
│   │   └── useAdminAuth.tsx   # Auth context & fetchWithAuth
│   ├── lib/
│   │   ├── db.ts              # MongoDB connection
│   │   ├── jwt.ts             # Token sign/verify
│   │   ├── rateLimit.ts       # In-memory rate limiter
│   │   ├── authMiddleware.ts  # withAuth HOC
│   │   ├── email.ts           # Nodemailer templates
│   │   ├── validation.ts      # Zod schemas
│   │   └── utils.ts           # Formatters, helpers
│   ├── models/
│   │   ├── User.ts            # User model with lockout
│   │   ├── Car.ts             # Comprehensive car model
│   │   └── Inquiry.ts         # Inquiry model
│   └── middleware.ts          # Route protection
├── scripts/
│   └── seed.js                # Root user seeder
├── public/
│   └── uploads/               # Local file storage
├── .env.example
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🗄️ Data Model

### Car Document
The car document captures **80+ inspection points** across these sections:

| Section | Fields |
|---|---|
| Basic | Name, make, model, year, variant, color, fuel, transmission, odometer, price |
| Location | Address, lat/lng, city, state |
| Images | URL, category, isPrimary |
| Ratings | Exterior, Engine, AC, Electrical, Steering (0–5) |
| Documents | RC, Insurance, Road Tax, Hypothecation, Fitness, Registration |
| Exterior Details | Apron, Pillar, Cowl Top, Dicky, Quarter Panels, Firewall, Running Boards |
| Exterior Panels | Roof, Bonnet, Doors, Bumpers, Fenders |
| Tyres | Front/Rear L/R + Spare |
| Windshield & Lights | Headlights, Tail lights, Windshield, SVMs |
| Engine | Exhaust, Mounting, Clutch, Engine, Sound, Battery, Cooling, Oil, Gearbox |
| AC | Cooling, Compressor, Condenser, Blower, Controls |
| Electrical | Music, Power Windows, Central Locking, Horn, Wipers, Defogger, Instruments |
| Steering | Steering, Alignment |
| Brakes/Suspension | Front/Rear Brakes, Handbrake, Front/Rear Suspension |

Each component has: `status` (ok/repaired/notOk), `notes`, `media[]` (images/videos)

---

## 🔧 Production Deployment

### Environment
1. Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET` (min 32 random chars)
2. Use MongoDB Atlas for database
3. Configure SMTP (Gmail App Password or SendGrid)
4. Set `NEXT_PUBLIC_APP_URL` to your production URL

### File Storage
The current implementation stores files locally in `public/uploads/`.  
**For production**, replace with cloud storage:
- **AWS S3** — recommended
- **Cloudinary** — easy media handling
- **Google Cloud Storage**

### Rate Limiting
Replace in-memory rate limiter (`src/lib/rateLimit.ts`) with Redis:
```bash
npm install ioredis rate-limiter-flexible
```

### Build & Deploy

```bash
npm run build
npm start
# or deploy to Vercel/Railway/Render
```

---

## 📧 Email Setup (Gmail)

1. Enable 2-Factor Authentication on Gmail
2. Go to **Google Account → Security → App Passwords**
3. Generate an App Password for "Mail"
4. Use it as `SMTP_PASS` in your `.env`

---

## 🗺️ Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Maps JavaScript API** and **Maps Embed API**
3. Create an API key with appropriate restrictions
4. Add to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## 👥 User Roles

| Role | Can Do |
|---|---|
| **Root** | Everything — create/manage employees, full car & inquiry access |
| **Employee** | Only what permissions allow (cars:create, cars:edit, inquiries:view, etc.) |

---

## 📱 Mobile Features

- Camera capture for component photos/videos
- Native share sheet (WhatsApp, etc.)
- Touch-optimized UI
- Progressive loading & skeletons

---

## 🤝 License

MIT — Free to use and modify for commercial projects.
