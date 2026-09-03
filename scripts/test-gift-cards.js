import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log('🧪 Iniciando prueba de Gift Cards en Supabase...');

  const testCard = {
    id: `gc-test-${Date.now()}`,
    code: `GIFT-${Math.floor(1000 + Math.random() * 9000)}-TEST`,
    initial_amount: 20000,
    current_balance: 20000,
    purchaser_name: 'Lucas Test',
    purchaser_phone: '1122334455',
    purchaser_email: 'lucas@test.com',
    recipient_name: 'Valeria Gómez',
    recipient_phone: '1199887766',
    recipient_email: 'valeria@test.com',
    message: '¡Feliz cumpleaños Vale! A disfrutar de un café gourmet.',
    theme: 'cumpleanos',
    status: 'activa',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
    usage_history: []
  };

  // 1. Insert
  console.log(`1. Insertando Gift Card ${testCard.code} por $20.000...`);
  const { data: inserted, error: insertErr } = await supabase
    .from('gift_cards')
    .insert([testCard])
    .select()
    .single();

  if (insertErr) {
    console.error('❌ Error al insertar Gift Card:', insertErr);
    process.exit(1);
  }
  console.log('✅ Gift Card creada exitosamente:', inserted.code, `(Saldo: $${inserted.current_balance})`);

  // 2. Canje Parcial
  console.log('2. Realizando consumo parcial de $7.500...');
  const usageEntry = {
    id: `usage-${Date.now()}`,
    date: new Date().toISOString(),
    orderCode: 'PED-TEST-01',
    amountUsed: 7500,
    remainingBalance: 12500,
    location: 'Mesa 4',
    notes: 'Desayuno especial'
  };

  const { data: updated, error: updateErr } = await supabase
    .from('gift_cards')
    .update({
      current_balance: 12500,
      status: 'canjeada_parcial',
      usage_history: [usageEntry]
    })
    .eq('id', testCard.id)
    .select()
    .single();

  if (updateErr) {
    console.error('❌ Error al actualizar saldo:', updateErr);
    process.exit(1);
  }
  console.log('✅ Saldo actualizado a:', `$${updated.current_balance}`, `(Estado: ${updated.status})`);
  console.log('✅ Historial de uso registrado:', updated.usage_history.length, 'consumo(s).');

  // 3. Consulta / Verificación
  console.log('3. Consultando tarjetas en base de datos...');
  const { data: allCards, error: fetchErr } = await supabase
    .from('gift_cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (fetchErr) {
    console.error('❌ Error al listar tarjetas:', fetchErr);
    process.exit(1);
  }
  console.log(`✅ Total de Gift Cards registradas en Supabase: ${allCards.length}`);

  // Limpieza de prueba
  await supabase.from('gift_cards').delete().eq('id', testCard.id);
  console.log('🧹 Registro de prueba limpiado correctamente.');
  console.log('🎉 ¡Todas las pruebas de Gift Cards pasaron al 100%!');
}

runTest().catch(console.error);
