-- DB schema for Ram Rath

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (core auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('booker', 'driver', 'admin')) DEFAULT 'booker',
  verified boolean DEFAULT false,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Drivers table (extended info for drivers)
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('auto', 'bike', 'car')),
  rc_doc_url text,
  id_doc_url text,
  selfie_url text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Legacy tables (kept for backward compatibility)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone text UNIQUE NOT NULL,
  name text,
  role text DEFAULT 'passenger',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  type text,
  url text,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ride_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_location text,
  to_location text,
  distance_km numeric,
  offer_amount numeric,
  contact text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  posted_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booker_id uuid REFERENCES profiles(id),
  driver_id uuid REFERENCES profiles(id),
  from_location text,
  to_location text,
  distance_km numeric,
  distance_source text DEFAULT 'manual',
  status text DEFAULT 'pending',
  passenger_phone_snapshot text,
  driver_phone_snapshot text,
  confirmed_on_call boolean DEFAULT false,
  confirmed_at timestamptz,
  confirmed_by_driver_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id),
  amount numeric,
  method text,
  status text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id),
  amount numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking_call_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id),
  driver_id uuid REFERENCES drivers(id),
  passenger_phone_snapshot text,
  driver_phone_snapshot text,
  timestamp timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booker_id ON bookings(booker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_posts_status ON ride_posts(status);
CREATE INDEX IF NOT EXISTS idx_drivers_verified ON drivers(verified);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Transactional server-side function to confirm a booking atomically.
-- This ensures first-in wins and writes commissions, call logs and audit logs in a single transaction.
CREATE OR REPLACE FUNCTION confirm_booking(p_booking_id uuid, p_driver_id uuid, p_driver_phone text, p_passenger_phone text, OUT result jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  b RECORD;
  fee numeric;
BEGIN
  SELECT * INTO b FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    result := jsonb_build_object('error','not_found');
    RETURN;
  END IF;
  IF b.status = 'confirmed' THEN
    result := jsonb_build_object('error','already_confirmed','by', b.confirmed_by_driver_id);
    RETURN;
  END IF;

  UPDATE bookings SET
    status = 'confirmed',
    confirmed_on_call = true,
    confirmed_at = now(),
    confirmed_by_driver_id = p_driver_id,
    driver_phone_snapshot = p_driver_phone,
    passenger_phone_snapshot = p_passenger_phone
  WHERE id = p_booking_id;

  -- commission calculation: 2.5% of distance*some base, but as a simple placeholder use distance_km * 1 (assumes unit fare), then apply min/max
  fee := COALESCE(b.distance_km, 0) * 0.025;
  IF fee < 5 THEN
    fee := 5;
  ELSIF fee > 50 THEN
    fee := 50;
  END IF;

  INSERT INTO commissions(booking_id, amount, created_at) VALUES (p_booking_id, fee, now());

  INSERT INTO booking_call_logs(booking_id, driver_id, passenger_phone_snapshot, driver_phone_snapshot, timestamp)
    VALUES (p_booking_id, p_driver_id, p_passenger_phone, p_driver_phone, now());

  INSERT INTO audit_logs(action, user_id, details, created_at) VALUES ('confirm_on_call', p_driver_id, jsonb_build_object('booking_id', p_booking_id, 'driver_id', p_driver_id, 'commission', fee), now());

  result := jsonb_build_object('success', true, 'commission', fee);
  RETURN;
END;
$$;
