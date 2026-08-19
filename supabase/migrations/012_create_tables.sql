-- Migration 012: Create tables table in Supabase
CREATE TABLE IF NOT EXISTS public.tables (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 4,
    sector TEXT NOT NULL DEFAULT 'salon',
    status TEXT NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'ocupada', 'reservada')),
    qr_code TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read tables" ON public.tables;
DROP POLICY IF EXISTS "Allow public insert tables" ON public.tables;
DROP POLICY IF EXISTS "Allow public update tables" ON public.tables;
DROP POLICY IF EXISTS "Allow public delete tables" ON public.tables;

CREATE POLICY "Allow public read tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Allow public insert tables" ON public.tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tables" ON public.tables FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tables" ON public.tables FOR DELETE USING (true);
