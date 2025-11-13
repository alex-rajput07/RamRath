import { NextResponse } from 'next/server';
import { getDirections } from '../../../../lib/googleMaps';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, to } = body;
    if (!from || !to) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
    const res = await getDirections(from, to);
    if ((res as any).error) return NextResponse.json({ error: 'no_route', reason: (res as any).raw }, { status: 200 });
    return NextResponse.json(res, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'exception', message: err.message }, { status: 500 });
  }
}
