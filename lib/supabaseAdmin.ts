import { createClient } from '@supabase/supabase-js';

/**
 * Server-only helper for admin operations.
 * CRITICAL: Use SUPABASE_SERVICE_ROLE_KEY ONLY in server-side code.
 * Never expose this key to the client.
 */
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key);
}

/**
 * Verify a driver by updating their profile and logging the action
 */
export async function verifyDriver(driverId: string, adminId: string, ipAddress: string) {
  const supabase = getAdminClient();

  try {
    // Update driver verified status
    const { error: updateError } = await supabase
      .from('drivers')
      .update({ verified: true })
      .eq('user_id', driverId);

    if (updateError) throw updateError;

    // Log audit trail
    await supabase.from('audit_logs').insert({
      action: 'DRIVER_VERIFIED',
      user_id: adminId,
      details: { driver_id: driverId },
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to verify driver:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Reject a driver verification and log the action
 */
export async function rejectDriver(
  driverId: string,
  adminId: string,
  reason: string,
  ipAddress: string
) {
  const supabase = getAdminClient();

  try {
    // Log rejection
    await supabase.from('audit_logs').insert({
      action: 'DRIVER_REJECTED',
      user_id: adminId,
      details: { driver_id: driverId, reason },
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
    });

    // Optionally send notification (implement as needed)
    return { success: true };
  } catch (error) {
    console.error('Failed to reject driver:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get pending driver verifications
 */
export async function getPendingDrivers() {
  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('verified', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to fetch pending drivers:', error);
    return [];
  }
}

/**
 * Get audit logs for admin panel
 */
export async function getAuditLogs(limit = 50) {
  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

/**
 * Create an admin user (super admin only - use SQL directly in Supabase)
 * NOTE: This is a placeholder. In production, use Supabase SQL editor:
 * INSERT INTO profiles (id, phone, role, verified, full_name) VALUES (?, 'XXXX', 'admin', true, 'Admin Name');
 */
export async function createAdminProfile(userId: string, phone: string, fullName: string) {
  const supabase = getAdminClient();

  try {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      phone,
      role: 'admin',
      verified: true,
      full_name: fullName,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Failed to create admin profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
