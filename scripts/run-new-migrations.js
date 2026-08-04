import { readFileSync } from 'fs';
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
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ACCESS_TOKEN}` },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await response.text();
  if (response.ok) { console.log(`   ✅ OK (status: ${response.status})`); return true; }
  else { console.log(`   ❌ Error (status: ${response.status}): ${text.substring(0, 300)}`); return false; }
}

async function main() {
  console.log('🚀 Ejecutando migraciones nuevas (007, 008)\n');
  
  for (const file of ['007_create_branches.sql', '008_create_site_content.sql']) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    await executeSql(sql, file);
  }

  // Verify
  const SUPABASE_URL = 'https://dtjmckbrofevgfqbkzli.supabase.co';
  const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0am1ja2Jyb2ZldmdmcWJremxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcxNDExOCwiZXhwIjoyMDg2MjkwMTE4fQ.mths9S8UlKJOlyylkiTVMxnzjauY_tBdKEZDR7xsXMk';
  
  // Reload schema cache
  await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/postgrest`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    body: JSON.stringify({ db_schema: 'public' }),
  });
  await new Promise(r => setTimeout(r, 2000));

  for (const table of ['branches', 'site_content']) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=5`, {
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
    });
    if (r.status === 200) { const d = await r.json(); console.log(`✅ "${table}": ${d.length} records`); }
    else console.log(`❌ "${table}": status ${r.status}`);
  }
}

main().catch(console.error);
