Ten clarification questions before final handoff:

1. How long should driver verification docs be retained before automatic deletion? (default: 12 months)
2. Shall phone OTP be via Supabase (recommended) or custom provider?
3. Do you want to enable masked calls via Twilio/Exotel now (flag: TWILIO_ENABLED)?
4. Should distance rounding be to 1 decimal or integer kilometers?
5. Do you want SMS notifications (Twilio) as a delivery channel for confirmations?
6. What is the admin user(s) phone or email for initial admin account seed?
7. Should drivers be limited to one active confirmed booking at a time? (default: yes)
8. Is commission charged on posted offers as well as direct bookings? (default: yes)
9. Any localization preferences beyond English and Hindi (currency, date formats)?
10. Do you want automatic deletion of verification docs after 12 months or manual admin purge?
