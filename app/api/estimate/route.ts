import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Google Maps feature has been removed. Manual distance entry is now used.
    return NextResponse.json({ error: 'google_maps_disabled', message: 'Please use manual distance entry' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'exception', message: err.message }, { status: 500 });
  }
}
