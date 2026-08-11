import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log("Testing Supabase connection...");
  const { data, error } = await supabase.from('staff_users').select('*');
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Supabase Data:", data);
  }
}

test();
