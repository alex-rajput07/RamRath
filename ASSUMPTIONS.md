# RamRath Implementation Assumptions

## Architecture & Technology
- **Framework**: Next.js 13+ (app-router) with TypeScript (strict mode)
- **Styling**: Tailwind CSS + PostCSS
- **Animations**: Framer Motion (reduced-motion compliant)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Auth**: Supabase Auth (OTP for Booker/Driver, email+password for Admin)
- **Distance Calculation**: Manual entry only (no Google Maps)

## Database Schema
- **users**: Core Supabase auth table
- **profiles**: id, phone, role (booker|driver|admin), verified, full_name, created_at
- **drivers**: user_id, full_name, vehicle_type, rc_doc_url, id_doc_url, selfie_url, verified
- **ride_posts**: from_location, to_location, distance_km, distance_source='manual', status, posted_by, created_at
- **bookings**: from_location, to_location, distance_km, booker_id, driver_id, status, confirmed_at, created_at
- **commissions**: booking_id, amount, status (pending|paid), created_at
- **audit_logs**: action, performed_by, data (jsonb), created_at

## Authentication Flow
### Booker/Driver
1. User clicks role (Booker/Driver)
2. Submits phone number
3. Receives OTP via Supabase magic link (SMS can be enabled)
4. Verifies OTP → creates profile with role='booker'|'driver'
5. For drivers: upload documents → admin verification required

### Admin
1. Created via SQL in Supabase: `INSERT INTO profiles(id, phone, role, verified, full_name) VALUES(...)`
2. Uses email+password via Supabase Auth (future: SSO)

## Booking Flow
### Direct Book
1. Enter From, To, Distance (km) (manual)
2. View available drivers (mock for now)
3. Click driver → shows phone (tel: link)
4. After call, driver clicks "Confirm on Call"
5. Modal asks: "Fixed fare agreed?" → Enter amount
6. POST /api/confirm (atomic transaction, first-wins)
7. Show CommissionRequest component

### Post Ride
1. Enter From, To, Distance (km), Offer amount, Phone
2. POST /api/book → creates ride_post
3. Drivers view available posts, call, confirm via same flow

## Commission Flow
- After confirm, show CommissionRequest with UPI buttons (₹20, ₹50, ₹100, Custom)
- Custom must be ≥20 and multiple of 10
- UPI intent link: `upi://pay?pa=ramrath@ptyes&pn=AJ%20RamRath&am={amount}&cu=INR`
- Desktop fallback: show QR code + copy link
- Commission saved as 'pending'; admin marks 'paid'

## Race Condition Handling
- Confirm endpoint is transactional (FOR UPDATE lock)
- If two drivers confirm same post: first succeeds, second gets `{ error: 'already_confirmed', by: driverName }`
- HTTP 409 Conflict returned for duplicates

## Security
- No SUPABASE_SERVICE_ROLE_KEY in client code
- Row-level security (RLS) on profiles, drivers, audit_logs
- All mutations logged in audit_logs
- Middleware enforces security headers (CSP, X-Frame-Options, etc.)

## Accessibility
- All forms have labels & aria-* attributes
- Keyboard navigation fully supported
- Framer Motion respects prefers-reduced-motion
- ARIA live regions for notifications

## Testing
- Playwright tests mock OTP if Supabase keys missing
- Tests cover: login, booking, confirm (race condition), admin flows
- CI runs on every push via GitHub Actions

## Deployment
- Vercel recommended
- Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_AJ_UPI_ID
- Database schema must be seeded before deployment

## Known Limitations
- OTP currently uses magic links (SMS requires Twilio setup)
- Driver search is mocked (static list)
- Commission payment tracking is logged but not integrated with real UPI
- File uploads stored in Supabase Storage (requires bucket configuration)

## Future Enhancements
- Real-time driver location (WebSockets)
- SMS via Twilio
- Rating/review system
- Payment integration (Razorpay, etc.)
- Notification push via FCM
- Call history and retry logic
