-- DB schema for Ram Rath

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone text UNIQUE NOT NULL,
  name text,
  role text DEFAULT 'passenger',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE drivers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  vehicle_no text,
  verified boolean DEFAULT false,
  verification_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE driver_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  type text,
  url text,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE ride_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_location text,
  to_location text,
  "from" text,
  "to" text,
  distance_km numeric,
  offer_amount numeric,
  contact text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  posted_by uuid REFERENCES users(id)
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from text,
  to text,
  distance_km numeric,
  distance_source text,
  status text DEFAULT 'requested',
  passenger_phone_snapshot text,
  driver_phone_snapshot text,
  confirmed_on_call boolean DEFAULT false,
  confirmed_at timestamptz,
  confirmed_by_driver_id uuid REFERENCES drivers(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id),
  amount numeric,
  method text,
  status text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE commissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id),
  amount numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE booking_call_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id),
  driver_id uuid REFERENCES drivers(id),
  passenger_phone_snapshot text,
  driver_phone_snapshot text,
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  action text NOT NULL,
  admin_id uuid,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_ride_posts_status ON ride_posts(status);

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

  INSERT INTO audit_logs(action, admin_id, data, created_at) VALUES ('confirm_on_call', NULL, jsonb_build_object('booking_id', p_booking_id, 'driver_id', p_driver_id, 'commission', fee), now());

  result := jsonb_build_object('success', true, 'commission', fee);
  RETURN;
END;
$$;
