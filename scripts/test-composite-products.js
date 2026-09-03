import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompositeProducts() {
  console.log('🧪 Probando Producto Compuesto (Combo / Promoción)...');

  // 1. Fetch some existing products to bundle
  const { data: existingProducts, error: fetchErr } = await supabase
    .from('products')
    .select('id, name, price')
    .limit(2);

  if (fetchErr || !existingProducts || existingProducts.length === 0) {
    console.error('Error fetching sample products:', fetchErr);
    process.exit(1);
  }

  const p1 = existingProducts[0];
  const p2 = existingProducts[1] || existingProducts[0];

  console.log(`📦 Usando productos base para el combo:`);
  console.log(`   - 1x ${p1.name} ($${p1.price})`);
  console.log(`   - 2x ${p2.name} ($${p2.price} c/u)`);

  const singleSum = Number(p1.price) + Number(p2.price) * 2;
  const promoPrice = Math.round(singleSum * 0.8); // 20% discount

  // 2. Insert composite product
  const testCombo = {
    name: 'Promo Test Desayuno ' + Date.now(),
    category_id: 'cat-1',
    category_name: 'Cafetería',
    description: '1x ' + p1.name + ' + 2x ' + p2.name,
    price: promoPrice,
    is_composite: true,
    composite_items: [
      {
        productId: p1.id,
        productName: p1.name,
        quantity: 1,
        unitPrice: Number(p1.price),
      },
      {
        productId: p2.id,
        productName: p2.name,
        quantity: 2,
        unitPrice: Number(p2.price),
      },
    ],
  };

  const { data: created, error: insertErr } = await supabase
    .from('products')
    .insert(testCombo)
    .select()
    .single();

  if (insertErr) {
    console.error('❌ Error creating composite product:', insertErr);
    process.exit(1);
  }

  console.log('✅ Producto compuesto creado exitosamente en Supabase:');
  console.log('   ID:', created.id);
  console.log('   Nombre:', created.name);
  console.log('   is_composite:', created.is_composite);
  console.log('   composite_items:', JSON.stringify(created.composite_items, null, 2));

  // 3. Query it back
  const { data: fetched, error: getErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', created.id)
    .single();

  if (getErr || !fetched) {
    console.error('❌ Error fetching back combo:', getErr);
    process.exit(1);
  }

  if (fetched.is_composite !== true) {
    console.error('❌ Error: is_composite is not true!');
    process.exit(1);
  }

  if (!Array.isArray(fetched.composite_items) || fetched.composite_items.length !== 2) {
    console.error('❌ Error: composite_items length mismatch!');
    process.exit(1);
  }

  console.log('✅ Verificación de lectura: is_composite y composite_items leídos con precisión.');

  // 4. Cleanup
  await supabase.from('products').delete().eq('id', created.id);
  console.log('🧹 Limpieza completada: Registro de prueba eliminado.');

  console.log('🎉 ¡Prueba de Producto Compuesto completada con éxito al 100%!');
}

testCompositeProducts();
