/**
 * Verify all tables and count records after migration.
 */

const SUPABASE_URL = 'https://dtjmckbrofevgfqbkzli.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const PROJECT_REF = 'dtjmckbrofevgfqbkzli';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

async function main() {
  console.log('📊 Verificando tablas en Supabase...\n');

  // First, reload PostgREST schema cache using Management API
  console.log('🔄 Recargando schema cache de PostgREST...');
  try {
    const reloadRes = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/postgrest`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ db_schema: 'public' }),
      }
    );
    console.log(`   PostgREST reload: status ${reloadRes.status}\n`);
  } catch (e) {
    console.log(`   Reload falló: ${e.message}\n`);
  }

  // Wait a moment for the cache to refresh
  await new Promise(r => setTimeout(r, 2000));

  // Check each table with both service_role
  const tables = ['customers', 'rewards', 'campaigns', 'automations', 'redemptions'];
  
  for (const table of tables) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=5`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
      
      if (r.status === 200) {
        const d = await r.json();
        console.log(`✅ "${table}": ${d.length} records visible`);
      } else {
        const body = await r.text();
        console.log(`❌ "${table}": status ${r.status} - ${body.substring(0, 150)}`);
      }
    } catch (e) {
      console.log(`❌ "${table}": Error - ${e.message}`);
    }
  }

  // Also check full count for customers
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=id`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'count=exact',
    },
  });
  if (countRes.status === 200) {
    const count = countRes.headers.get('content-range');
    console.log(`\n📊 Customers total: ${count}`);
  }

  // Full count for rewards
  const rewRes = await fetch(`${SUPABASE_URL}/rest/v1/rewards?select=id`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'count=exact',
    },
  });
  if (rewRes.status === 200) {
    const count = rewRes.headers.get('content-range');
    console.log(`📊 Rewards total: ${count}`);
  }
  
  // Full count for campaigns  
  const cmpRes = await fetch(`${SUPABASE_URL}/rest/v1/campaigns?select=id`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'count=exact',
    },
  });
  if (cmpRes.status === 200) {
    const count = cmpRes.headers.get('content-range');
    console.log(`📊 Campaigns total: ${count}`);
  }
}

main().catch(console.error);
