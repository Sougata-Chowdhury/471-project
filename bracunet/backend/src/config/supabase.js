import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

// Initialize Supabase client (with safe fallback when not configured)
const supabaseUrl = config.supabase?.url || process.env.SUPABASE_URL || 'https://zkxkzwqqqjywuuxgbxzz.supabase.co';
const supabaseKey = config.supabase?.key || process.env.SUPABASE_KEY || '';

console.log('Initializing Supabase client:', {
  url: supabaseUrl,
  keySet: !!supabaseKey,
  keyPrefix: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'NOT SET',
  keyLength: supabaseKey ? supabaseKey.length : 0
});

let supabase;
export const isSupabaseEnabled = Boolean(supabaseKey);

if (!supabaseKey) {
  console.warn('⚠️ WARNING: Supabase key is not set! Storage features will be disabled.');
  // Provide a harmless fallback so imports do not crash the app
  supabase = {
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error('Supabase disabled: missing key') }),
        getPublicUrl: () => ({ data: { publicUrl: null }, error: new Error('Supabase disabled: missing key') }),
      }),
    },
  };
} else {
  // Create Supabase client with server-side configuration
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
}

export { supabase };
export default supabase;
