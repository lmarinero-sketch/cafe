import dotenv from 'dotenv';
dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

async function fixRealtime() {
  const sql = `
    ALTER TABLE public.orders REPLICA IDENTITY FULL;
    ALTER TABLE public.tables REPLICA IDENTITY FULL;
    ALTER TABLE public.cash_registers REPLICA IDENTITY FULL;
    ALTER TABLE public.cash_transactions REPLICA IDENTITY FULL;
    ALTER TABLE public.products REPLICA IDENTITY FULL;
    ALTER TABLE public.gift_cards REPLICA IDENTITY FULL;

    DO $$
    BEGIN
      BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
      EXCEPTION WHEN duplicate_object THEN END;
      BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
      EXCEPTION WHEN duplicate_object THEN END;
      BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_registers;
      EXCEPTION WHEN duplicate_object THEN END;
      BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_transactions;
      EXCEPTION WHEN duplicate_object THEN END;
      BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
      EXCEPTION WHEN duplicate_object THEN END;
      BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_cards;
      EXCEPTION WHEN duplicate_object THEN END;
    END $$;
  `;

  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  const data = await res.json();
  console.log('Publication and Replica Identity updated successfully:', data);
}

fixRealtime();
