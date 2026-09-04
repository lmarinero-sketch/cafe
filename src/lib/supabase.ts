import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dtjmckbrofevgfqbkzli.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0am1ja2Jyb2ZldmdmcWJremxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTQxMTgsImV4cCI6MjA4NjI5MDExOH0.JhZPg8DhTBu9nnbKYFKvluDirqKgehDzDP44g_nlqM8';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.info(
    'ℹ️ Using built-in Supabase credentials since .env variables were not found (e.g. on Vercel).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = true;

