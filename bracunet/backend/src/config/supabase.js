import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

// Initialize Supabase client
const supabaseUrl = config.supabase?.url || process.env.SUPABASE_URL || 'https://zkxkzwqqqjywuuxgbxzz.supabase.co';
const supabaseKey = config.supabase?.key || process.env.SUPABASE_KEY || '';

console.log('Initializing Supabase client:', {
  url: supabaseUrl,
  keySet: !!supabaseKey,
  keyPrefix: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'NOT SET',
  keyLength: supabaseKey ? supabaseKey.length : 0
});

if (!supabaseKey) {
  console.warn('⚠️ WARNING: Supabase key is not set! File uploads will fail.');
}

// Create Supabase client with server-side configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public'
  }
});

export default supabase;
