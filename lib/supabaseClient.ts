import { createClient } from '@supabase/supabase-js';

export type UserRole = 'booker' | 'driver' | 'admin';

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
  verified: boolean;
  fullName: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookerId: string;
  driverId: string;
  fromLocation: string;
  toLocation: string;
  distanceKm: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  fullName: string;
  vehicleType: 'auto' | 'bike' | 'car';
  rcDocUrl: string | null;
  idDocUrl: string | null;
  selfieUrl: string | null;
  verified: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  details: Record<string, any>;
  ipAddress: string;
  createdAt: string;
}

// Client-side Supabase initialization (uses NEXT_PUBLIC keys)
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient(url, key);
}

export const supabase = getSupabase();

// Server-side Supabase initialization (uses SERVICE_ROLE key)
export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key);
}

// Helper: Get current user session
export async function getCurrentUser() {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  // Fetch user profile with role and verification status
  const { data } = await supabase
    .from('profiles')
    .select('id, phone, role, verified, full_name, created_at')
    .eq('id', session.user.id)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    phone: data.phone,
    role: data.role as UserRole,
    verified: data.verified,
    fullName: data.full_name,
    createdAt: data.created_at,
  } as AuthUser;
}

// Helper: Sign out
export async function signOut() {
  const supabase = getSupabase();
  return await supabase.auth.signOut();
}

// Helper: Get user bookings
export async function getUserBookings(userId: string, role: UserRole) {
  const supabase = getSupabase();

  let query = supabase.from('bookings').select('*');

  if (role === 'booker') {
    query = query.eq('booker_id', userId);
  } else if (role === 'driver') {
    query = query.eq('driver_id', userId);
  }

  const { data } = await query.order('created_at', { ascending: false });

  return (
    data?.map((b) => ({
      id: b.id,
      bookerId: b.booker_id,
      driverId: b.driver_id,
      fromLocation: b.from_location,
      toLocation: b.to_location,
      distanceKm: b.distance_km,
      status: b.status,
      createdAt: b.created_at,
    })) || []
  );
}

// Helper: Get driver profile
export async function getDriverProfile(driverId: string) {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('drivers')
    .select('*')
    .eq('user_id', driverId)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    fullName: data.full_name,
    vehicleType: data.vehicle_type as 'auto' | 'bike' | 'car',
    rcDocUrl: data.rc_doc_url,
    idDocUrl: data.id_doc_url,
    selfieUrl: data.selfie_url,
    verified: data.verified,
    createdAt: data.created_at,
  } as DriverProfile;
}
