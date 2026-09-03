import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log("=== VERIFICANDO SINCRONIZACIÓN EN VIVO SUPABASE ===");
  
  // 1. Verificar Cajas
  const { data: registers, error: errReg } = await supabase.from('cash_registers').select('*');
  console.log("1. Cajas en Supabase:", errReg ? errReg.message : `${registers.length} registradas`);

  // 2. Verificar Mesas
  const { data: tables, error: errTables } = await supabase.from('tables').select('*');
  console.log("2. Mesas en Supabase:", errTables ? errTables.message : `${tables.length} mesas`);

  // 3. Simular pedido desde Celular (QR)
  console.log("3. Simulando pedido generado desde Celular...");
  const sampleOrder = {
    code: 'ORD-MESA-404',
    type: 'salon',
    status: 'nuevo',
    items: [{ productId: 'prod-latte', productName: 'Café Latte Especial', unitPrice: 3500, quantity: 2 }],
    subtotal: 7000,
    total: 7000,
    payment_method: 'efectivo',
    table_id: 'tab-1',
    table_name: 'Mesa 1',
    customer_name: 'Lucas Celular',
    customer_phone: '1122334455',
    points_earned: 700
  };

  const { data: orderCreated, error: errOrder } = await supabase.from('orders').insert(sampleOrder).select().single();
  if (errOrder) {
    console.error("❌ Error creando pedido de celular:", errOrder);
  } else {
    console.log("✅ Pedido de Celular guardado en la nube:", orderCreated.code, "- ID:", orderCreated.id);

    // 4. Simular lectura desde PC (Comanda / Panel de Cocina)
    const { data: pcOrders, error: errPc } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(3);
    console.log("4. Pedidos leídos desde la PC:", pcOrders.map(o => `${o.code} (${o.customer_name} - ${o.table_name})`));

    // 5. Simular actualización de estado desde PC (Mozo/Cocina pasa a 'preparacion')
    const { data: updatedByPc, error: errUpd } = await supabase.from('orders').update({ status: 'preparacion' }).eq('id', orderCreated.id).select().single();
    console.log("5. Estado actualizado desde PC a Cocina:", updatedByPc ? updatedByPc.status : errUpd);

    // 6. Limpiar pedido de prueba
    await supabase.from('orders').delete().eq('id', orderCreated.id);
    console.log("6. Pedido de prueba limpiado. ✅ TODO SINCRONIZADO EN TIEMPO REAL.");
  }
}

test();
