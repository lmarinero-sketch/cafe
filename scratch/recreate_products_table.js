import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
  if (match) env[match[1]] = match[2];
});

const token = env.SUPABASE_ACCESS_TOKEN;
const ref = env.SUPABASE_PROJECT_REF;

async function recreateProducts() {
  const sql = `
    DROP TABLE IF EXISTS public.products CASCADE;

    CREATE TABLE public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category_id TEXT NOT NULL,
        category_name TEXT DEFAULT '',
        description TEXT DEFAULT '',
        price NUMERIC(10,2) NOT NULL DEFAULT 0,
        cost NUMERIC(10,2) DEFAULT 0,
        suggested_price NUMERIC(10,2) DEFAULT 0,
        image TEXT DEFAULT '',
        is_available BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        channels TEXT[] DEFAULT ARRAY['salon', 'retiro', 'delivery'],
        recipe_items JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
    CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
    CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

    NOTIFY pgrst, 'reload schema';
  `;

  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  console.log('Recreate products response:', await response.text());
}

recreateProducts();
