/**
 * Execute SQL migrations against Supabase using the Management API.
 * Uses the access token and project ref to execute SQL queries.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_REF = 'dtjmckbrofevgfqbkzli';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

async function executeSql(sql, filename) {
  console.log(`\n🔄 Ejecutando: ${filename}...`);
  
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const text = await response.text();
  
  if (response.ok) {
    console.log(`   ✅ OK (status: ${response.status})`);
    return true;
  } else {
    console.log(`   ❌ Error (status: ${response.status}): ${text.substring(0, 300)}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Café Magnolia - Ejecutando Migraciones SQL via Management API\n');
  console.log(`📌 Project: ${PROJECT_REF}`);
  console.log('─'.repeat(60));

  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let allOk = true;
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    const ok = await executeSql(sql, file);
    if (!ok) allOk = false;
  }

  console.log('\n' + '─'.repeat(60));
  
  if (allOk) {
    console.log('✅ Todas las migraciones ejecutadas correctamente.');
  } else {
    console.log('⚠️  Algunas migraciones tuvieron errores. Revisá los logs arriba.');
  }
  
  // Verify tables
  console.log('\n📊 Verificando tablas creadas...');
  const SUPABASE_URL = 'https://dtjmckbrofevgfqbkzli.supabase.co';
  const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0am1ja2Jyb2ZldmdmcWJremxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcxNDExOCwiZXhwIjoyMDg2MjkwMTE4fQ.mths9S8UlKJOlyylkiTVMxnzjauY_tBdKEZDR7xsXMk';
  
  for (const table of ['customers', 'rewards', 'campaigns', 'automations', 'redemptions']) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    
    if (r.status === 200) {
      const d = await r.json();
      console.log(`   ✅ "${table}": OK (${d.length} records)`);
    } else {
      console.log(`   ❌ "${table}": status ${r.status}`);
    }
  }
}

main().catch(console.error);
