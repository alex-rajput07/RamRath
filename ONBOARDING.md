# ONBOARDING.md

## Quick Start for New Developers

Welcome to Ram Rath! This guide will get you up and running in 15 minutes.

### Prerequisites
- Node.js 20+
- npm or yarn
- Git
- A Supabase account (free tier ok for dev)
- Google Maps API key (Directions API)

### 1. Clone & Install
```powershell
git clone https://github.com/alex-rajput07/RamRath.git
cd RamRath
npm ci
```

### 2. Set Up Environment
Copy `.env.local.example` (or create `.env.local`):
```
NEXT_PUBLIC_APP_NAME=RamRath
NEXT_PUBLIC_DEFAULT_LOCALE=en-IN
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_MAPS_API_KEY=your-google-server-key
VERCEL_ENV=development
```

Get these values:
- **Supabase**: https://supabase.com → Create project → Settings → API Keys
- **Google Maps**: https://console.cloud.google.com → Enable Directions API → Create API Key

### 3. Set Up Database
1. In Supabase, go to SQL Editor
2. Paste entire contents of `db/schema.sql`
3. Run the query

### 4. Start Dev Server
```powershell
npm run dev
```
Open http://localhost:3000 → should see splash animation.

---

## Project Structure

```
ramrath/
├── app/
│  ├── api/           # Server-side API routes
│  ├── direct-book/   # Direct booking page
│  ├── post-ride/     # Post ride request page
│  ├── admin/         # Admin panel
│  └── driver/        # Driver dashboard
├── components/       # Reusable React components
├── lib/              # Utilities (auth, supabase, distance calc)
├── db/               # Database schema & scripts
├── scripts/          # Build/seed scripts
├── public/           # Static assets (badge, logo, etc.)
└── tests/            # Playwright tests
```

### Key Files
- `app/layout.tsx` — Root layout, includes Header & Footer
- `components/Footer.tsx` — "Made By AJ" badge (appears on all pages)
- `app/api/estimate/route.ts` — Google Directions server proxy
- `app/api/confirm/route.ts` — Atomic booking confirmation (calls Postgres RPC)
- `lib/auth.ts` — Supabase JWT verification & role checks
- `db/schema.sql` — Database schema (tables, indexes, RPC functions)

---

## Common Tasks

### Add a New Page
1. Create folder in `app/` (e.g., `app/my-page`)
2. Add `page.tsx` (Next.js app router auto-routes it)
3. Use `"use client"` at top for interactivity
4. Import `Header` and `Footer` (already in root layout)

Example:
```tsx
// app/my-page/page.tsx
"use client";
export default function MyPage() {
  return <div>Hello from My Page</div>;
}
```

### Add an API Route
1. Create folder in `app/api/` (e.g., `app/api/my-endpoint`)
2. Add `route.ts` with `POST`, `GET`, etc. handler
3. Import auth helpers if protected

Example:
```typescript
// app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/auth';

export async function POST(req: Request) {
  const admin = await requireAdmin(req.headers.get('authorization'));
  if (admin.error) return NextResponse.json({ error: admin.error }, { status: 403 });
  // your logic
  return NextResponse.json({ success: true });
}
```

### Run Tests
```powershell
npm run test
# Or watch mode
npx playwright test --watch
```

### Seed Sample Data
```powershell
npm run seed
```
Inserts sample drivers, posts, and bookings into dev Supabase.

### Lint & Format
```powershell
npm run lint
npm run format
```

---

## Authentication Flow

### User Roles
- **passenger** — books rides, posts requests
- **driver** — accepts bookings, uploads verification docs
- **admin** — approves/rejects drivers, views logs

### Protected Routes
Admin endpoints (`/api/admin/*`) and driver endpoints (`/api/upload-doc`) require:
```
Authorization: Bearer <supabase_access_token>
```

Supabase JWT includes user id and is verified server-side by `lib/auth.ts`.

### TODO: Implement Phone OTP
Currently auth is stubbed. To add Supabase Phone OTP:
1. Enable Phone provider in Supabase Auth settings
2. Build `/app/auth/phone` page with `verifyPhoneOtp()` and `signUpWithPhone()`
3. Call Supabase Auth endpoints and store returned token

---

## Database Schema Overview

- **users** (id, phone, name, role: 'passenger'|'driver'|'admin')
- **drivers** (id, user_id, vehicle_no, verified, verification_status)
- **bookings** (id, from, to, distance_km, distance_source, status, commission info)
- **ride_posts** (id, from, to, distance_km, offer_amount, status)
- **driver_documents** (id, driver_id, type, url, uploaded_at)
- **commissions** (id, booking_id, amount)
- **booking_call_logs** (id, booking_id, driver_id, phone snapshots)
- **audit_logs** (id, action, admin_id, data, timestamp)

See `db/schema.sql` for full definitions.

---

## Deployment

See `DEPLOYMENT_GUIDE.md` for:
- Vercel setup
- Environment variables
- Supabase RLS policies
- Production hardening

---

## Debugging

### Enable Logs
Add `console.log()` in server routes and check:
- Vercel logs: https://vercel.com → Project → Deployments
- Local: terminal where `npm run dev` is running

### Check Supabase
- SQL Editor: run queries directly
- Table Editor: view/edit data
- Auth: see users and sessions

### Test APIs
Use curl or Postman:
```bash
curl -X POST http://localhost:3000/api/estimate \
  -H "Content-Type: application/json" \
  -d '{"from":"Village A","to":"Town B"}'
```

---

## Need Help?

1. Check `README.md` for quick reference
2. Review `QUESTIONS.md` for design decisions
3. Open a GitHub issue: https://github.com/alex-rajput07/RamRath/issues
4. Contact the team (see repo description)

---

**Made By AJ** 🚀
