import { getServiceSupabase } from '../lib/supabaseClient';

async function seed() {
  const svc = getServiceSupabase();
  console.log('Seeding sample data...');
  // create sample users and drivers
  const user = await svc.from('users').insert({ phone: '+911234567890', name: 'Sample Rider' }).select().single();
  const driverUser = await svc.from('users').insert({ phone: '+919876543210', name: 'Sample Driver' }).select().single();
  const driver = await svc.from('drivers').insert({ user_id: driverUser.data.id, vehicle_no: 'UP32AB1234', verified: true }).select().single();
  const post = await svc.from('ride_posts').insert({ from: 'Village A', to: 'Town B', distance_km: 12.5, offer_amount: 300, contact: '+911234567890' }).select().single();
  console.log('Seed complete');
}

seed().catch(console.error);
