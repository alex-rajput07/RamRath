# Ram Rath
# Ram Rath

Minimal production-ready Next.js (app-router) scaffold for Ram Rath.

Requirements
- Node 20+, npm
- Supabase project (URL, anon key, service role key)
- Google Maps Directions API key (server-side)

Environment variables (create `.env.local`):
```
NEXT_PUBLIC_APP_NAME=RamRath
NEXT_PUBLIC_DEFAULT_LOCALE=en-IN
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_MAPS_API_KEY=your-google-server-key
VERCEL_ENV=production
TWILIO_ENABLED=false
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_NUMBER=
SENTRY_DSN=
```

Local run
```powershell
npm ci
# copy badge from /mnt/data if present
powershell -File scripts/copy_badge.ps1
npm run dev
```

Build & test
```powershell
npm run build
npm run test
```

Note: The build runs a pre-check to ensure required server env variables are present. The `prebuild` script will fail the build if `SUPABASE_SERVICE_ROLE_KEY` or `GOOGLE_MAPS_API_KEY` are not set. This prevents accidental deploys without necessary server keys.

When deploying to Vercel, use `vercel.env.example` as a reference for which environment variables to set in the Vercel project settings.

Notes
- The copy script attempts to copy the provided badge from `/mnt/data/292d3d87-559c-4104-949b-562ab2bad432.png` into `public/assets/badge.png`.
- Google Maps key is used only in server API route `/api/estimate`.
- Commission calculation is applied in `/api/confirm` and recorded in `commissions` table.

Developer handoff
- Important files: `app/api/*` server routes, `lib/supabaseClient.ts`, `lib/googleMaps.ts`, `db/schema.sql`.
- To seed sample data run: `npm run seed` (requires `SUPABASE_SERVICE_ROLE_KEY`).

10 Clarification Questions
See `QUESTIONS.md` for the 10 precise confirmation questions we need answered before final polish.
