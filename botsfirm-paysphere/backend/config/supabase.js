// supabase.js
// Supabase client configuration for Botsfirm PaySphere.
// Exposes two clients:
//   - supabaseAdmin: uses the service-role key. Bypasses RLS. Use ONLY in
//     server-side code that performs trusted operations (writes, cross-tenant
//     reads in super-admin flows, internal cron jobs). NEVER expose to the
//     browser.
//   - supabasePublic: uses the anon key. Honours RLS. Safe to use in flows
//     that act on behalf of an authenticated user.

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}
if (!SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY environment variable is required');
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY environment variable is required');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: { schema: 'public' },
});

const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: { schema: 'public' },
});

module.exports = {
  supabaseAdmin,
  supabasePublic,
};
