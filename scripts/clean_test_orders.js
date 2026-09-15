import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtjmckbrofevgfqbkzli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0am1ja2Jyb2ZldmdmcWJremxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTQxMTgsImV4cCI6MjA4NjI5MDExOH0.JhZPg8DhTBu9nnbKYFKvluDirqKgehDzDP44g_nlqM8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanTestData() {
  console.log('========================================================');
  console.log('DEPURACIÓN DE PEDIDOS Y VENTAS DE PRUEBA EN SUPABASE');
  console.log('========================================================');

  // Cutoff: 2026-09-14 00:00:00 (Argentina UTC-3) = 2026-09-14T03:00:00.000Z
  const cutoffISO = '2026-09-14T03:00:00.000Z';

  // 1. Fetch all orders
  const { data: allOrders, error: oErr } = await supabase
    .from('orders')
    .select('id, code, created_at, total, status')
    .order('created_at', { ascending: true });

  if (oErr) {
    console.error('Error fetching orders:', oErr);
    return;
  }

  const testOrders = allOrders.filter(o => new Date(o.created_at) < new Date(cutoffISO));
  const keepOrders = allOrders.filter(o => new Date(o.created_at) >= new Date(cutoffISO));

  console.log(`\nTotal pedidos actuales: ${allOrders.length}`);
  console.log(`Pedidos de prueba a BORRAR (< 14/09/2026): ${testOrders.length}`);
  testOrders.forEach(o => {
    console.log(`  [BORRAR] ${o.code} | Fecha: ${o.created_at} | Total: $${o.total} | Estado: ${o.status}`);
  });

  console.log(`\nPedidos reales a CONSERVAR (>= 14/09/2026): ${keepOrders.length}`);
  keepOrders.forEach(o => {
    console.log(`  [CONSERVAR] ${o.code} | Fecha: ${o.created_at} | Total: $${o.total} | Estado: ${o.status}`);
  });

  const testOrderIds = new Set(testOrders.map(o => o.id));

  // 2. Fetch cash transactions
  const { data: allTx, error: txErr } = await supabase
    .from('cash_transactions')
    .select('id, order_id, amount, timestamp, created_at, description');

  if (txErr) {
    console.error('Error fetching cash_transactions:', txErr);
    return;
  }

  const testTx = allTx.filter(tx => {
    const txDate = new Date(tx.timestamp || tx.created_at);
    return (tx.order_id && testOrderIds.has(tx.order_id)) || (txDate < new Date(cutoffISO) && tx.order_id);
  });

  console.log(`\nTotal transacciones de caja actuales: ${allTx.length}`);
  console.log(`Transacciones de caja de prueba a BORRAR: ${testTx.length}`);
  testTx.forEach(tx => {
    console.log(`  [BORRAR TX] ${tx.id} | OrderId: ${tx.order_id} | Monto: $${tx.amount} | ${tx.description}`);
  });

  // 3. Perform deletions
  console.log('\n--------------------------------------------------------');
  console.log('EJECUTANDO ELIMINACIÓN...');
  console.log('--------------------------------------------------------');

  // Delete cash transactions in batches
  if (testTx.length > 0) {
    const txIdsToDelete = testTx.map(t => t.id);
    const { data: delTxData, error: delTxErr } = await supabase
      .from('cash_transactions')
      .delete()
      .in('id', txIdsToDelete)
      .select();

    if (delTxErr) {
      console.error('Error deleting cash transactions:', delTxErr);
    } else {
      console.log(`✅ Se eliminaron ${delTxData?.length || testTx.length} transacciones de caja de prueba.`);
    }
  }

  // Delete orders in batches
  if (testOrders.length > 0) {
    const orderIdsToDelete = testOrders.map(o => o.id);
    const { data: delOrdersData, error: delOrdersErr } = await supabase
      .from('orders')
      .delete()
      .in('id', orderIdsToDelete)
      .select();

    if (delOrdersErr) {
      console.error('Error deleting orders:', delOrdersErr);
    } else {
      console.log(`✅ Se eliminaron ${delOrdersData?.length || testOrders.length} pedidos de prueba.`);
    }
  }

  // 4. Verify post-cleanup status
  console.log('\n========================================================');
  console.log('VERIFICACIÓN POST-LIMPIEZA');
  console.log('========================================================');

  const { data: finalOrders } = await supabase
    .from('orders')
    .select('id, code, created_at, total')
    .order('created_at', { ascending: true });

  console.log(`Pedidos restantes en la base de datos: ${finalOrders?.length || 0}`);
  finalOrders?.forEach(o => {
    console.log(`  - ${o.code} | Fecha: ${o.created_at} | Total: $${o.total}`);
  });

  const { data: finalTx } = await supabase.from('cash_transactions').select('id');
  console.log(`Transacciones de caja restantes: ${finalTx?.length || 0}`);

  // Check integrity of other tables
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: tableCount } = await supabase.from('tables').select('*', { count: 'exact', head: true });
  const { count: custCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });

  console.log('\nIntegridad de datos maestros:');
  console.log(`  - Productos: ${prodCount} intactos`);
  console.log(`  - Categorías: ${catCount} intactas`);
  console.log(`  - Mesas: ${tableCount} intactas`);
  console.log(`  - Clientes: ${custCount} intactos`);

  console.log('\n🎉 ¡Limpieza de base de datos finalizada exitosamente!');
}

cleanTestData();
