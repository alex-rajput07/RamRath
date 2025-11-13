Vercel deployment checklist:

1. Create a new Vercel project from this repository.
2. Set environment variables listed in README.md in Vercel project's settings.
3. Ensure `GOOGLE_MAPS_API_KEY` is added as a server-only secret.
4. Deploy. If you have Twilio enabled, ensure TWILIO_* envs are set.

Handover to devs:
- Run `npm ci` then `npm run dev` locally.
- To seed sample data: `npm run seed` (requires SUPABASE_SERVICE_ROLE_KEY).
- Key server files: `app/api/estimate/route.ts`, `lib/googleMaps.ts`, `lib/supabaseClient.ts`.
