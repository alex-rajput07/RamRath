# DEPLOYMENT_GUIDE.md

## Vercel Deployment

### Prerequisites
- GitHub repo connected to Vercel (already done at https://github.com/alex-rajput07/RamRath)
- Supabase project with DB schema applied
- Google Maps API key (Directions API enabled)

### Step 1: Create Vercel Project
1. Go to https://vercel.com/new
2. Import Git repository → select `alex-rajput07/RamRath`
3. Framework preset: **Next.js**
4. Click **Deploy**

### Step 2: Set Environment Variables in Vercel
In your Vercel Project Settings → Environment Variables, add:

**Public variables** (safe to expose):
```
NEXT_PUBLIC_APP_NAME=RamRath
NEXT_PUBLIC_DEFAULT_LOCALE=en-IN
```

**Server-only secrets** (mark as Sensitive):
```
SUPABASE_URL=https://your-project.supabase.co
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

**Important:** Mark `SUPABASE_SERVICE_ROLE_KEY` and `GOOGLE_MAPS_API_KEY` as **Sensitive** so they don't leak into client builds.

### Step 3: Deploy
- Push to `main` branch → Vercel auto-deploys
- Each PR creates a Preview deployment
- GitHub Actions CI runs tests on each push

Your production URL will be shown in Vercel dashboard (e.g., `ramrath-git-main-alex-rajput07.vercel.app`).

---

## Local Development

### Initial Setup
```powershell
cd RamRath
npm ci
# Copy badge if available
powershell -File scripts/copy_badge.ps1
```

### Environment File
Create `.env.local` in project root:
```
NEXT_PUBLIC_APP_NAME=RamRath
NEXT_PUBLIC_DEFAULT_LOCALE=en-IN
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_MAPS_API_KEY=your-google-server-key
VERCEL_ENV=development
```

### Run Dev Server
```powershell
npm run dev
# Open http://localhost:3000
```

### Build & Test
```powershell
npm run build
npm run test
npm run lint
```

---

## Supabase Setup

### 1. Create Tables
In Supabase SQL editor, run the contents of `db/schema.sql`:
```sql
-- paste entire schema.sql here
```

### 2. Enable RLS (Row Level Security)
For production, enable RLS on sensitive tables:
- `bookings` — passengers can only see their own; drivers see confirmed ones
- `drivers` — drivers see only themselves; admins see all
- `audit_logs` — admins only
- `commissions` — admins only

Example RLS policy for `bookings` (for drivers):
```sql
CREATE POLICY "drivers_see_confirmed_bookings" ON bookings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM drivers WHERE drivers.id = bookings.confirmed_by_driver_id
    )
  );
```

### 3. Seed Sample Data
```powershell
npm run seed
```
This inserts sample drivers, ride posts, and bookings for testing.

---

## Supabase Auth Setup

### Phone OTP Flow
1. In Supabase Auth settings, enable **Phone** provider
2. Configure Twilio or MessageBird for SMS delivery
3. Users can sign up via `/auth/phone-otp` (to be built)

### Admin User Creation
Create an admin user in Supabase:
1. Go to Supabase → Authentication → Users
2. Create user with phone `+919999999999` (or your choice)
3. In SQL, update the `users` table:
```sql
UPDATE users SET role = 'admin' WHERE phone = '+919999999999';
```

---

## Google Maps Setup

### Enable APIs
In Google Cloud Console:
1. Enable **Directions API**
2. Enable **Places API** (optional, for autocomplete)
3. Create an API key (server-only)

### Usage
- Directions API is called server-side in `/api/estimate`
- Never expose the API key to the client
- Monitor quota in Cloud Console to avoid overages

---

## Database Backup & Maintenance

### Backup
- Supabase auto-backups daily (free plan: 7-day retention)
- For production, enable Point-in-Time Recovery (PITR)

### Monitoring
- Check Supabase dashboard for slow queries
- Use Vercel analytics for frontend performance

---

## Troubleshooting

### Build fails with "missing env var"
- Ensure all required server env vars are set in Vercel
- Run `npm run prebuild` locally to validate

### API returns 401 (Unauthorized)
- Check that Supabase tokens are valid and not expired
- Verify user role in `users` table (should be 'admin', 'driver', or 'passenger')
- Check Authorization header is sent as `Authorization: Bearer <token>`

### Upload endpoint returns 400
- Ensure Supabase Storage bucket `driver-docs` exists
- Check RLS policies allow authenticated uploads
- Verify file size is under Supabase limits

### Rate limit errors (429)
- Current limit is 10 requests/min per IP (in-memory)
- For distributed apps, replace with Redis (see below)

---

## Production Hardening Checklist

- [ ] Enable HTTPS (auto on Vercel)
- [ ] Set security headers (CSP, X-Frame-Options, etc.) — see `middleware.ts` in repo
- [ ] Enable CORS restrictions in server routes
- [ ] Use Redis for rate limiting (replace in-memory)
- [ ] Enable Supabase RLS policies on all tables
- [ ] Monitor Sentry for errors (configure `SENTRY_DSN`)
- [ ] Set up log aggregation (e.g., Datadog, LogRocket)
- [ ] Review audit logs regularly (`audit_logs` table)
- [ ] Set retention policy for driver docs (auto-delete after 12 months)

---

## Support & Feedback

For issues or questions:
1. Check GitHub Issues: https://github.com/alex-rajput07/RamRath/issues
2. Review README.md for quick start
3. See QUESTIONS.md for clarifications answered

---

**Made By AJ** 🚀
