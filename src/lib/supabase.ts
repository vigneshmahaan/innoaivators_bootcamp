import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// A simple Supabase client for client-side and simple backend use cases.
// Note: For advanced SSR auth, consider using @supabase/ssr package.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
