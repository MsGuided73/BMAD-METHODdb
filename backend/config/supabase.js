const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://ryzwnbukdykmmpcirqlv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5enduYnVrZHlrbW1wY2lycWx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDYyNTkwNSwiZXhwIjoyMDY2MjAxOTA1fQ.Sq1OpX_jq2Mps0GqFN2YyaoyDL-tOyDU1A0JGjPuQkw';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5enduYnVrZHlrbW1wY2lycWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MjU5MDUsImV4cCI6MjA2NjIwMTkwNX0.J0IdBpy2TRatTSjuhESLq0StgOi6U26vcGJfl6FpQiY';

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Anon client for user operations
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

module.exports = {
  supabaseAdmin,
  supabaseClient,
  supabaseUrl,
  supabaseAnonKey
};
