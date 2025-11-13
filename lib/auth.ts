import { getServiceSupabase } from './supabaseClient';

export async function verifySupabaseToken(authHeader?: string | null) {
  if (!authHeader) return { error: 'no_auth' };
  const m = authHeader.match(/^Bearer (.+)$/);
  if (!m) return { error: 'invalid_auth_format' };
  const token = m[1];
  const svc = getServiceSupabase();
  try {
    const { data, error } = await svc.auth.getUser(token);
    if (error || !data?.user) return { error: 'invalid_token', detail: error?.message };
    // fetch user record from users table
    const uid = data.user.id;
    const u = await svc.from('users').select('*').eq('id', uid).single();
    if (u.error) return { error: 'user_not_found' };
    return { user: u.data, authUser: data.user };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function requireAdmin(authHeader?: string | null) {
  const v = await verifySupabaseToken(authHeader);
  if (v.error) return { error: v.error };
  const user = v.user;
  if (!user || user.role !== 'admin') return { error: 'forbidden' };
  return { user };
}

export async function requireDriver(authHeader?: string | null) {
  const v = await verifySupabaseToken(authHeader);
  if (v.error) return { error: v.error };
  const user = v.user;
  if (!user) return { error: 'forbidden' };
  // Check drivers table
  const svc = getServiceSupabase();
  const d = await svc.from('drivers').select('*').eq('user_id', user.id).single();
  if (d.error || !d.data) return { error: 'not_a_driver' };
  if (d.data.verification_status !== 'approved' && d.data.verified !== true) return { error: 'driver_not_verified' };
  return { user, driver: d.data };
}
