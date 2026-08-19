-- Migration 013: Create ingredients table in Supabase
CREATE TABLE IF NOT EXISTS public.ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    purchase_qty NUMERIC(10,2) NOT NULL DEFAULT 1,
    purchase_unit TEXT NOT NULL DEFAULT 'kg',
    usage_unit TEXT NOT NULL DEFAULT 'g',
    waste_percent NUMERIC(5,2) DEFAULT 0,
    normalized_cost NUMERIC(10,4) NOT NULL DEFAULT 0,
    supplier TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Allow public insert ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Allow public update ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Allow public delete ingredients" ON public.ingredients;

CREATE POLICY "Allow public read ingredients" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public insert ingredients" ON public.ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update ingredients" ON public.ingredients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete ingredients" ON public.ingredients FOR DELETE USING (true);
