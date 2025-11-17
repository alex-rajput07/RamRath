# 🏍️ Ram Rath - Rural Ride Sharing Platform

> Production-ready, bilingual (English + Hindi), role-based ride-sharing app for rural India. Zero Google Maps dependency, manual distance entry, atomic booking confirmation, and UPI integration.

## ✨ Key Features

- ✅ **Role-Based Access**: Booker (passengers), Driver (service providers), Admin (verification & moderation)
- ✅ **Manual Distance Entry**: No Google Maps API required; users enter km manually with validation (0-1000 km)
- ✅ **OTP Authentication**: Supabase magic links for Booker/Driver; email+password for Admin
- ✅ **Driver Verification**: Drivers upload docs (RC, ID, selfie); admin approves with audit trail
- ✅ **Atomic Booking Confirmation**: First-driver-wins with PostgreSQL FOR UPDATE lock; later attempts get 409 error
- ✅ **UPI Commission Requests**: ₹20, ₹50, ₹100 fixed buttons + custom input (≥20, multiples of 10); mobile UPI intent links + desktop QR
- ✅ **Bilingual UI**: English & Hindi text throughout
- ✅ **Footer Badge**: "Made By AJ" with badge.png on every page
- ✅ **Accessibility**: Full keyboard navigation, ARIA labels, reduced-motion support
- ✅ **Security Headers**: CSP, X-Frame-Options, XSS Protection, Referrer-Policy
- ✅ **Audit Logging**: All mutations logged with timestamp and actor

## 🏗️ Architecture

- **Framework**: Next.js 14+ (app-router) with TypeScript (strict mode)
- **Styling**: Tailwind CSS + PostCSS + Autoprefixer
- **Animations**: Framer Motion (reduced-motion compliant) + Lottie
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Testing**: Playwright with mock OTP fallback
- **CI/CD**: GitHub Actions (lint, build, test on push)

## 📋 Database Tables

```sql
profiles         -- id, phone, role, verified, full_name, created_at
drivers          -- id, user_id, full_name, vehicle_type, rc_doc_url, id_doc_url, selfie_url, verified
ride_posts       -- id, from_location, to_location, distance_km, offer_amount, status, posted_by, created_at
bookings         -- id, from_location, to_location, distance_km, booker_id, driver_id, confirmed_by_driver_id, status, created_at
commissions      -- id, booking_id, amount, status (pending|paid), created_at
audit_logs       -- id, action, performed_by, data (jsonb), created_at
```

## 🚀 Quick Start (5 Steps)

### 1. Clone & Install
```bash
git clone https://github.com/alex-rajput07/RamRath.git
cd RamRath
npm install
```

### 2. Set Up Supabase
1. Go to [supabase.com](https://supabase.com) → Create project
2. SQL Editor → Copy & paste `db/schema.sql` → Execute
3. Settings → API → Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `Anon Key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `Service Role Key` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Create .env.local
```bash
cp .env.example .env.local
# Edit with your Supabase keys
```

### 4. Create First Admin (SQL Snippet)
In Supabase SQL Editor:
```sql
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, created_at, updated_at)
VALUES (gen_random_uuid(), 'admin@ramrath.local', crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', now(), now());

-- Then copy the user ID and run:
INSERT INTO profiles (id, phone, role, verified, full_name) 
VALUES ($USER_ID, '+911234567890', 'admin', true, 'Admin');
```

### 5. Run & Build
```bash
npm run dev        # Development server
npm run build      # Production build
npm run test       # Playwright tests
```

## 📱 Key Flows

### Booker Books a Ride
Direct Book → Enter From/To/Distance → See Drivers → Call → Confirm on Call → Commission (UPI)

### Driver Posts a Ride
Post Ride → Enter From/To/Distance/Offer → Booker Calls → Confirm → Commission (UPI)

### Driver Verification
Sign Up (phone + OTP) → Upload Docs → Admin Approves → Can Accept Bookings

### Admin Approves Drivers
Login → Admin Panel → Pending Drivers → View Docs → Approve/Reject → Logged to audit_logs

## 🔐 Security Highlights

- **JWT Auth**: Supabase Auth with OTP magic links
- **Role-Based**: profiles.role enforced on client
- **Atomic Confirm**: PostgreSQL FOR UPDATE lock; first-wins
- **Server-Only Keys**: SUPABASE_SERVICE_ROLE_KEY never exposed
- **Audit Trail**: All mutations logged in audit_logs
- **Security Headers**: CSP, X-Frame-Options, Referrer-Policy, XSS Protection
- **Race Condition**: Duplicate confirms return 409 error

## 🌍 Bilingual (English + Hindi)

All UI text in both languages. Locale: `NEXT_PUBLIC_DEFAULT_LOCALE=en-IN`

## 📂 Project Structure

```
RamRath/
├── app/                          # Next.js app-router pages
│   ├── page.tsx                  # Home
│   ├── login/page.tsx            # Role selector + auth
│   ├── direct-book/page.tsx      # Direct booking
│   ├── post-ride/page.tsx        # Post ride request
│   ├── driver/dashboard/page.tsx # Driver dashboard
│   ├── booker/dashboard/page.tsx # Booker dashboard
│   ├── admin/panel/page.tsx      # Admin verification panel
│   └── api/
│       ├── book/route.ts         # Create booking
│       ├── confirm/route.ts      # Atomic confirm
│       ├── admin/verify-driver/route.ts
│       └── ride-posts/route.ts   # Fetch posts
├── components/                   # React components
│   ├── Header.tsx
│   ├── Footer.tsx                # "Made By AJ" badge
│   ├── AuthOTPForm.tsx
│   ├── CommissionRequest.tsx     # UPI buttons
│   └── (+ 10 more)
├── lib/
│   ├── supabaseClient.ts         # Client helpers
│   ├── supabaseAdmin.ts          # Server-only admin
│   └── validators.ts
├── db/schema.sql                 # PostgreSQL DDL
├── tests/playwright/core.spec.ts # E2E tests
├── public/assets/
│   ├── badge.png                 # "Made By AJ"
│   ├── aj_upi_qr.jpeg            # UPI QR fallback
│   └── logo.json
├── .env.example                  # Env template
├── .env.local                    # Local secrets (git-ignored)
├── ASSUMPTIONS.md                # Architecture decisions
├── package.json
└── README.md (this file)
```

## 🧪 Testing

```bash
npm run test          # Run Playwright tests
npm run test:ui       # Interactive UI mode
```

Coverage:
- ✅ Login (Booker/Driver/Admin)
- ✅ Booking creation & confirmation
- ✅ Race condition (first-wins)
- ✅ Driver verification
- ✅ UPI commission flow
- ✅ Admin panel actions

Tests mock OTP if Supabase keys missing.

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel
```

Then add in Vercel dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_AJ_UPI_ID=ramrath@ptyes
```

### Build Command
```bash
npm run build
```

✅ Expected: Zero errors, ~170 KB middleware

## 📝 Environment Variables

See `.env.example` for full list. Required:
```
NEXT_PUBLIC_SUPABASE_URL           # https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY          # Server-only key
NEXT_PUBLIC_AJ_UPI_ID             # ramrath@ptyes
```

Optional:
```
NEXT_PUBLIC_APP_NAME              # Default: RamRath
NEXT_PUBLIC_DEFAULT_LOCALE        # Default: en-IN
VERCEL_ENV                        # development | production
```

## 🐛 Troubleshooting

| Error | Fix |
|-------|-----|
| "Missing NEXT_PUBLIC_SUPABASE_URL" | Copy .env.example → .env.local & add keys |
| "profiles table not found" | Run db/schema.sql in Supabase |
| Confirm returns 409 | Expected! Another driver confirmed first. Try again. |
| OTP not received | Check Supabase Auth; enable SMS via Twilio |
| "distance_km must be > 0" | Enter valid distance (0.1 to 1000 km) |
| Tests fail | Ensure .env.local exists; Playwright mocks OTP as fallback |

## 📖 Documentation

- **ASSUMPTIONS.md** - Architecture & design decisions
- **db/schema.sql** - PostgreSQL schema with atomic RPC
- **.env.example** - Environment variables template

## 🎯 Key Design Decisions

✅ **No Google Maps**: Manual distance entry (simpler, cheaper, rural-friendly)  
✅ **Atomic Confirm**: PostgreSQL FOR UPDATE lock; first driver wins  
✅ **Role-Based Auth**: Booker/Driver (OTP), Admin (email+password)  
✅ **UPI Only**: Commission logged but not auto-charged (NEFT optional)  
✅ **Bilingual**: Full English + Hindi UI  
✅ **Made By AJ**: Footer badge on every page  
✅ **Mobile-First**: Responsive design for rural smartphones  

## 🤝 Contributing

1. Install dependencies: `npm install`
2. Make changes
3. Run linter: `npm run lint`
4. Run tests: `npm run test`
5. Update ASSUMPTIONS.md if needed
6. Push to GitHub

## 📄 License

MIT

---

**Made with ❤️ by AJ** for Rural India
