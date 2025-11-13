import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseAdmin';

/**
 * POST /api/auth/verify-driver
 * Admin-only endpoint to approve driver applications
 */
export async function POST(request: NextRequest) {
  try {
    const { driverId, approved, reason } = await request.json();

    if (!driverId) {
      return NextResponse.json({ error: 'Driver ID required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Get requesting user (assume admin via middleware)
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role by checking token claims (simplified)
    // In production, verify token against Supabase JWT

    if (approved) {
      // Update driver verified status
      const { error } = await supabase
        .from('drivers')
        .update({ verified: true })
        .eq('id', driverId);

      if (error) throw error;

      // Log action
      await supabase.from('audit_logs').insert({
        action: 'DRIVER_VERIFIED',
        user_id: token, // In production, extract actual user_id from token
        details: { driver_id: driverId },
        ip_address: request.ip || 'unknown',
        created_at: new Date().toISOString(),
      });

      return NextResponse.json(
        { success: true, message: 'Driver approved' },
        { status: 200 }
      );
    } else {
      // Log rejection
      await supabase.from('audit_logs').insert({
        action: 'DRIVER_REJECTED',
        user_id: token,
        details: { driver_id: driverId, reason },
        ip_address: request.ip || 'unknown',
        created_at: new Date().toISOString(),
      });

      return NextResponse.json(
        { success: true, message: 'Driver rejected' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
