import { createClient } from '@supabase/supabase-js';

// =====================================================
// SUPABASE CONFIG — your own backend
// =====================================================

const supabaseUrl = 'import { createClient } from '@supabase/supabase-js';

// =====================================================
// SUPABASE CONFIG — your own backend
// =====================================================

const supabaseUrl = 'import { createClient } from '@supabase/supabase-js';

// =====================================================
// SUPABASE CONFIG — your own backend
// =====================================================

const supabaseUrl = 'https://dqndvxdtbmdckfnhxqxa.supabase.co/rest/v1/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbmR2eGR0Ym1kY2tmbmh4cXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzQxODgsImV4cCI6MjA5MzYxMDE4OH0.-JsGduJ5Qt-CbSm5XDUwcdWjVZPRdISgXcnVXUOJHiA';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export { supabase };
';
const supabaseKey = 'PASTE_YOUR_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export { supabase };
';
const supabaseKey = 'PASTE_YOUR_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export { supabase };
