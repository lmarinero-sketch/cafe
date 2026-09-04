import dotenv from 'dotenv';
dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

async function runSQL(sql) {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  return res.json();
}

async function main() {
  console.log('Seeding initial Supabase state for Realtime Live Sync...');

  // 1. Ensure an open cash register exists
  const regRes = await runSQL(`
    INSERT INTO public.cash_registers (id, opened_at, opened_by, initial_balance, status)
    VALUES ('reg-inicial-2026', NOW(), 'Administrador (Caja Principal)', 50000.00, 'abierta')
    ON CONFLICT (id) DO UPDATE SET status = 'abierta';
  `);
  console.log('Open cash register check/seed:', regRes);

  // 2. Check orders count, seed if empty
  const ordersCountRes = await runSQL('SELECT count(*) FROM public.orders;');
  const ordersCount = parseInt(ordersCountRes[0]?.count || '0', 10);
  console.log('Current orders count in Supabase:', ordersCount);

  if (ordersCount === 0) {
    console.log('Seeding initial orders into Supabase...');
    const seedOrdersSql = `
      INSERT INTO public.orders (
        id, code, type, status, items, subtotal, delivery_fee, total, payment_method,
        table_id, table_name, waiter_name, customer_name, customer_phone, points_earned, created_at
      ) VALUES
      (
        'c0000001-0000-0000-0000-000000000001', 'ORD-6201', 'salon', 'en_preparacion',
        '[{"productId":"prod-capuchino","productName":"Capuchino Especial","unitPrice":4800,"quantity":2},{"productId":"prod-medialunas","productName":"Medialunas de Manteca","unitPrice":1800,"quantity":4}]'::jsonb,
        16800, 0, 16800, 'efectivo', 'tab-1', 'Mesa 1', 'Lucas Marinero (Cajero)', 'Valentina Ríos', '+54 9 11 4523-8890', 1680, NOW() - INTERVAL '15 minutes'
      ),
      (
        'c0000002-0000-0000-0000-000000000002', 'ORD-6202', 'salon', 'nuevo',
        '[{"productId":"prod-cafe-leche-mediano","productName":"Café c/leche (Mediano)","unitPrice":4400,"quantity":2},{"productId":"prod-tostadas","productName":"Tostón de Palta & Huevo","unitPrice":4600,"quantity":2}]'::jsonb,
        18000, 0, 18000, 'transferencia', 'tab-2', 'Mesa 2', 'Lucas Marinero (Cajero)', 'Santiago Benítez', '+54 9 11 5902-1144', 1800, NOW() - INTERVAL '5 minutes'
      ),
      (
        'c0000003-0000-0000-0000-000000000003', 'ORD-6203', 'delivery', 'en_camino',
        '[{"productId":"prod-hamburguesa-completa","productName":"Hamburguesa Especial Hilos","unitPrice":9500,"quantity":2},{"productId":"prod-limonada","productName":"Limonada con Menta y Jengibre","unitPrice":3200,"quantity":2}]'::jsonb,
        25400, 1500, 26900, 'mercadopago', '', '', 'Delivery Express', 'Mariana Gómez', '+54 9 11 8841-3320', 2540, NOW() - INTERVAL '30 minutes'
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    const seedRes = await runSQL(seedOrdersSql);
    console.log('Orders seeded successfully:', seedRes);
  }

  // 3. Ensure tables are in sync
  console.log('Verifying tables in Supabase...');
  const tablesCountRes = await runSQL('SELECT count(*) FROM public.tables;');
  console.log('Tables count in Supabase:', tablesCountRes[0]?.count);

  console.log('✅ Supabase seed sync complete!');
}

main().catch(console.error);
