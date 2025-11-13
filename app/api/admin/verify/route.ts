import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseClient';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  const svc = getServiceSupabase();
  try {
    const authHeader = req.headers.get('authorization');
    const adminCheck = await requireAdmin(authHeader);
    if (adminCheck.error) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.error === 'forbidden' ? 403 : 401 });

    const body = await req.json();
    const { driver_id, action, reason } = body;
    if (!driver_id || !action) return NextResponse.json({ error: 'missing' }, { status: 400 });
    if (action !== 'approve' && action !== 'reject') return NextResponse.json({ error: 'invalid_action' }, { status: 400 });

    const updates: any = {};
    if (action === 'approve') {
      updates.verified = true;
      updates.verification_status = 'approved';
    } else {
      updates.verified = false;
      updates.verification_status = 'rejected';
    }
    await svc.from('drivers').update(updates).eq('id', driver_id);
    await svc.from('audit_logs').insert({ action: action === 'approve' ? 'driver_verification_approved' : 'driver_verification_rejected', admin_id: adminCheck.user.id || null, data: { driver_id, reason }, created_at: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
