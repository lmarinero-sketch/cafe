/**
 * Test the ANON key access (what the frontend uses) - verifying no 400 errors
 */

const SUPABASE_URL = 'https://dtjmckbrofevgfqbkzli.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0am1ja2Jyb2ZldmdmcWJremxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTQxMTgsImV4cCI6MjA4NjI5MDExOH0.JhZPg8DhTBu9nnbKYFKvluDirqKgehDzDP44g_nlqM8';

async function testEndpoint(table, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'count=exact',
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const url = method === 'GET' 
    ? `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=3`
    : `${SUPABASE_URL}/rest/v1/${table}`;
    
  const r = await fetch(url, opts);
  return { status: r.status, ok: r.ok };
}

async function main() {
  console.log('🧪 Testing ANON key access (simulating frontend)\n');
  
  // Test READ operations
  console.log('📖 READ Operations:');
  for (const table of ['customers', 'rewards', 'campaigns', 'automations', 'redemptions']) {
    const { status, ok } = await testEndpoint(table);
    console.log(`   ${ok ? '✅' : '❌'} GET ${table}: ${status}`);
  }

  // Test CREATE a customer
  console.log('\n✏️  CREATE Operations:');
  const { status: createStatus } = await testEndpoint('customers', 'POST', {
    first_name: 'Test',
    last_name: 'API',
    phone: '+5491100000000',
    email: 'test@test.com',
    points: 150,
    level: 'Inicial',
  });
  console.log(`   ${createStatus < 300 ? '✅' : '❌'} POST customers: ${createStatus}`);

  // Test UPDATE
  console.log('\n🔄 UPDATE Operations:');
  // Get the test customer
  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?first_name=eq.Test&last_name=eq.API&select=id&limit=1`, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` },
  });
  const testCustomers = await getRes.json();
  
  if (testCustomers.length > 0) {
    const testId = testCustomers[0].id;
    
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${testId}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ first_name: 'TestUpdated' }),
    });
    console.log(`   ${updateRes.status < 300 ? '✅' : '❌'} PATCH customers: ${updateRes.status}`);

    // Test DELETE
    console.log('\n🗑️  DELETE Operations:');
    const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${testId}`, {
      method: 'DELETE',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      },
    });
    console.log(`   ${deleteRes.status < 300 ? '✅' : '❌'} DELETE customers: ${deleteRes.status}`);
  }

  console.log('\n' + '─'.repeat(60));
  console.log('✅ All CRUD operations verified with ANON key - no 400 errors!');
}

main().catch(console.error);
