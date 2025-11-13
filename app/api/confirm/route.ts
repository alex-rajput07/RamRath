import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseClient';
import { rateLimit } from '@/lib/rateLimit';
import { requireDriver } from '@/lib/auth';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const rl = rateLimit(ip);
  if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const svc = getServiceSupabase();
  const body = await req.json();
  const { booking_id, driver_id, passenger_phone } = body;
  if (!booking_id || !driver_id) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

  // Require the caller to be an authenticated driver and match driver_id
  const authHeader = req.headers.get('authorization');
  const drv = await requireDriver(authHeader);
  if (drv.error) return NextResponse.json({ error: drv.error }, { status: drv.error === 'driver_not_verified' ? 403 : 401 });
  if (drv.driver.id !== driver_id) return NextResponse.json({ error: 'driver_mismatch' }, { status: 403 });

  try {
    // Call the transactional Postgres function to confirm booking atomically
    const rpc = await svc.rpc('confirm_booking', { p_booking_id: booking_id, p_driver_id: driver_id, p_driver_phone: body.driver_phone || null, p_passenger_phone: passenger_phone || null });
    if (rpc.error) return NextResponse.json({ error: rpc.error }, { status: 500 });
    // Supabase returns the function result as data
    const res = (rpc as any).data || rpc;
    // If result contains error
    if (res && res.error) {
      return NextResponse.json(res, { status: res.error === 'already_confirmed' ? 409 : 400 });
    }
    return NextResponse.json(res, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
