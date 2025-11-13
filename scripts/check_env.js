const requiredServer = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_MAPS_API_KEY'
];
const recommended = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_DEFAULT_LOCALE'
];
let missing = [];
for (const k of requiredServer) {
  if (!process.env[k]) missing.push(k);
}
if (missing.length) {
  console.error('Missing required server env vars: ', missing.join(', '));
  console.error('These are required for build/runtime. Set them in your deployment environment.');
  process.exit(1);
}
let recMiss = [];
for (const k of recommended) {
  if (!process.env[k]) recMiss.push(k);
}
if (recMiss.length) {
  console.warn('Missing recommended env vars: ', recMiss.join(', '));
}
console.log('Environment check passed.');
process.exit(0);
