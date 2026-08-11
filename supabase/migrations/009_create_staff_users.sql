-- Migration 009: Create staff_users table in Supabase
CREATE TABLE IF NOT EXISTS public.staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT '123456',
    role TEXT NOT NULL DEFAULT 'cajero' CHECK (role IN ('admin', 'cajero', 'mozo', 'cocina')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to staff_users" ON public.staff_users;
DROP POLICY IF EXISTS "Allow public insert access to staff_users" ON public.staff_users;
DROP POLICY IF EXISTS "Allow public update access to staff_users" ON public.staff_users;
DROP POLICY IF EXISTS "Allow public delete access to staff_users" ON public.staff_users;

-- Create policies for full access
CREATE POLICY "Allow public read access to staff_users" ON public.staff_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to staff_users" ON public.staff_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to staff_users" ON public.staff_users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to staff_users" ON public.staff_users FOR DELETE USING (true);

-- Insert initial staff users including lucas@gmail.com
INSERT INTO public.staff_users (name, email, password, role, status)
VALUES 
  ('Lucas Cajero', 'lucas@gmail.com', '123456', 'cajero', 'active'),
  ('Lucas Admin', 'lmarinero@growlabs.lat', 'hilos2026', 'admin', 'active'),
  ('Hilos de Amor', 'hilosdeamor@growlabs.lat', 'hilos2026', 'admin', 'active')
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password, role = EXCLUDED.role, name = EXCLUDED.name;
