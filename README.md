# Ram Rath

Minimal production-ready Next.js (app-router) scaffold for Ram Rath.

## Key Features

- ✅ Manual distance entry (Google Maps removed)
- ✅ Supabase authentication & PostgreSQL database
- ✅ Responsive design with Tailwind CSS
- ✅ Atomic booking confirmation with PostgreSQL RPC
- ✅ Security headers & rate limiting
- ✅ Bilingual UI (English & Hindi)
- ✅ "Made By AJ" footer on all pages

## Requirements

- Node 20+, npm
- Supabase project (URL, anon key, service role key)

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_APP_NAME=RamRath
NEXT_PUBLIC_DEFAULT_LOCALE=en-IN
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VERCEL_ENV=production
TWILIO_ENABLED=false
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_NUMBER=
SENTRY_DSN=
```

## Local Development

```powershell
npm install
npm run dev
```

Then open http://localhost:3000

## Build & Test

```powershell
npm run build
npm run test
npm run lint
```

## Distance Entry

**Google Maps has been removed.** Users now manually enter distances:

- **Direct Book**: Enter From → To → Distance (km) → Book
- **Post Ride**: Enter From → To → Distance (km) → Offer Amount → Post

Distance validation:
- Must be > 0 km
- Must be < 1000 km
- Error messages shown in English & Hindi

## Deployment

Deploy to Vercel with these env vars set in project settings:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

See `DEPLOYMENT_GUIDE.md` for full instructions.

## Developer Notes

- **API Routes**: `/api/book`, `/api/confirm`, `/api/estimate` (disabled), `/api/admin/verify`, `/api/upload-doc`
- **Database**: Run `db/schema.sql` in Supabase SQL editor
- **Seed Data**: `npm run seed`
- **Footer**: "Made By AJ" badge on every page via `components/Footer.tsx`

## File Structure

```
app/
  direct-book/      → Book a car (manual distance)
  post-ride/        → Post ride request (manual distance)
  api/
    book/           → Create bookings
    confirm/        → Confirm on call (atomic RPC)
    estimate/       → [Disabled] Was Google Maps
    admin/verify    → Admin verification
    upload-doc/     → Driver document upload
components/
  Header.tsx
  Footer.tsx        → "Made By AJ" badge
  DriverCard.tsx
lib/
  supabaseClient.ts
  auth.ts           → JWT verification & role checks
  rateLimit.ts      → In-memory rate limiter
db/
  schema.sql        → PostgreSQL schema with atomic confirm_booking() RPC
```

## FAQ

**Q: How do I get the API key for Google Maps?**
A: Google Maps is no longer used. Distance is entered manually.

**Q: What happens when confirming a booking?**
A: The `confirm_booking()` PostgreSQL RPC atomically updates booking status, creates commission record, and logs to audit_logs.

**Q: Can I re-enable Google Maps?**
A: Yes, restore the `lib/googleMaps.ts` file from git history and update `/api/estimate`.

**See ONBOARDING.md for setup walkthrough.**
