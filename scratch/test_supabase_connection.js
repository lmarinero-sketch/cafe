import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function testExtended() {
  const tables = [
    'customers',
    'rewards',
    'campaigns',
    'automations',
    'redemptions',
    'branches',
    'site_content',
    'staff_users',
    'products',
    'orders',
    'tables',
    'ingredients'
  ];
  const results = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        results[table] = { status: '❌ ERROR', message: error.message };
      } else {
        results[table] = { status: '✅ OK', rowCount: data ? data.length : 0 };
      }
    } catch (err) {
      results[table] = { status: '❌ EXCEPTION', message: err.message };
    }
  }

  console.log('\n--- Extended Supabase Table Audit ---');
  console.table(results);
}

testExtended();
