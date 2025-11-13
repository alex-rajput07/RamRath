import { NextResponse } from 'next/server';
import { getServiceSupabase } from '../../../../lib/supabaseClient';

export async function POST(req: Request) {
  const svc = getServiceSupabase();
  const body = await req.json();
  try {
    if (body.is_post) {
      // create a ride_post
      const payload = {
        from_location: body.from_location,
        to_location: body.to_location,
        distance_km: body.distance_km || null,
        offer_amount: body.offer_amount || null,
        contact: body.contact || null,
        status: 'open'
      };
      const r = await svc.from('ride_posts').insert(payload).select().single();
      return NextResponse.json(r.data || {});
    }
    // direct booking
    const booking = {
      from_location: body.from_location,
      to_location: body.to_location,
      distance_km: body.distance_km || null,
      distance_source: body.distance_source || 'manual',
      status: 'requested',
      passenger_phone_snapshot: body.passenger_phone || null
    };
    const r = await svc.from('bookings').insert(booking).select().single();
    // create audit log
    await svc.from('audit_logs').insert({ action: 'create_booking', data: booking });
    return NextResponse.json(r.data || {});
  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
