#!/usr/bin/env node

// Quick verification script to check Supabase connection and env vars
const { createClient } = require('@supabase/supabase-js');

async function verify() {
  console.log('🔍 Verifying Ram Rath setup...\n');

  // Check env vars
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(k => !process.env[k]);
  
  if (missing.length) {
    console.error('❌ Missing env vars:', missing.join(', '));
    console.error('Please add them to .env.local');
    process.exit(1);
  }
  console.log('✅ All required env vars found\n');

  // Test Supabase connection
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Supabase connection successful\n');
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
    console.error('Make sure you have run db/schema.sql in Supabase SQL editor');
    process.exit(1);
  }

  console.log('✅ Google Maps removed - using manual distance entry\n');

  console.log('🎉 Setup verification complete!');
  console.log('Next: npm run dev\n');
}

verify().catch(console.error);
